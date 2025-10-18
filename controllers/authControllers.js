import axios from 'axios';
import jwt from 'jsonwebtoken';
// import { SignJWT } from 'jose';
import { createStateToken, verifyStateToken } from '../utils/jwt.js';
import { WebflowClient } from 'webflow-api';
import {
  getAccount,
  getAuthorizedUser,
  getRuutWebflowToken,
  getSites_SDK,
  getToken
} from '../utils/tokens.js';
import dotenv from 'dotenv';
import FormData from 'form-data';

// const streamPipeline = promisify(pipeline);

dotenv.config();

const scopes = [
  'sites:read',
  // enterprise-level operations with enterprise-level
  // tokens like workspace tokens can guarantee writes
  // to site as well as read and writes to workspaces
  'cms:read'
  // Only works for enterprise workspace plan with workspace tokens.
  // 'workspace_activity:read',
  // 'workspace_activity:write'
];

// const scopes = ['sites:read', 'sites:write', 'cms:read', 'cms:write', 'authorized_user:read'];

export const proxyIframeSrc = async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl || !targetUrl.startsWith('https://app.ruut.chat')) {
      return res.status(400).json({ error: 'Invalid or missing target URL' });
    }

    const upstream = await axios.get(targetUrl, {
      responseType: 'arraybuffer', // we need to inspect text if it's HTML
      headers: {
        'User-Agent': req.headers['user-agent'] || 'RUUT-Proxy',
        Accept: '*/*'
      },
      validateStatus: () => true
    });

    let contentType = upstream.headers['content-type'] || '';

    // ✳️ Rewriting only for HTML responses
    if (contentType.includes('text/html')) {
      let html = upstream.data.toString('utf8');
      const base = 'https://app.ruut.chat';

      // rewrite relative src/href URLs to proxied absolute ones
      html = html.replace(
        /(?<=\b(?:src|href)=["'])(\/[^"']+)/g,
        (path) => `/webflow/api/proxy?url=${encodeURIComponent(base + path)}`
      );

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(html);
    }

    // For all other files (JS, CSS, images, etc.), just stream as-is
    res.setHeader('Content-Type', contentType);
    res.status(upstream.status).send(Buffer.from(upstream.data));
  } catch (err) {
    console.error('[RUUT Proxy Error]', err.message);
    res.status(500).json({ error: 'Proxy failed', details: err.message });
  }
};

export const passportRedirect = async (req, res, next) => {
  req.session.user = req?.user;

  try {
    req.session.authenticated = req?.isAuthenticated();
    // console.log('HEADERS: ', res.headers.get('Authorization') || 'empty');

    console.log('AUTH_USER', req?.user);
    req.session.account = req?.user;
    req.session.token = req?.user?.token;
    req.session.client = req?.user?.client;
    req.session.access = req?.user?.access;
    req.session.uid = req?.user?.uid;
    req.session.accessToken = req?.user?.data?.access_token;
    req.session.accountId = req?.user?.data?.account_id;
    req.session.email = req?.user?.data?.email;
    const ruutWebflowToken = await getRuutWebflowToken(
      req?.user?.data?.account_id,
      req?.user?.data?.access_token,
      req?.user?.token
    );
    req.session.ruutWebflowToken = req?.user?.data?.email;
    // res.json({ message: 'Login successful', user: req.user, isValid: req.isAuthenticated() });
    res.redirect(
      process.env.NODE_ENV === 'production'
        ? `http://localhost:1337/oauth-callback?id=${req.session.accountId.toString()}&ruutWebflowToken=${ruutWebflowToken.toString()}&accessToken=${req.session.accessToken.toString()}&token=${req.session.token.toString()}`
        : 'https://686539bade32441e008d4a45.webflow-ext.com'
    );
  } catch (err) {
    res.redirect(
      process.env.NODE_ENV === 'production'
        ? 'http://localhost:1337'
        : 'https://686539bade32441e008d4a45.webflow-ext.com/login'
    );
  }
};

export const signupController = async (req, res) => {
  const { password, email } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'All fields are required!' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists!' });
    }

    const newUser = new User({ password, email });
    await newUser.save();

    const payload = {
      email: email,
      password: password
    };

    const token = await createStateToken(payload);

    res.setHeader('Authorization', ` Bearer ${token}`);
    res.cookie('token', token, {
      httpOnly: true,
      secure: true, // only over HTTPS
      sameSite: 'Strict',
      maxAge: 3600000 // 1 hour
    });
    res.status(200).json({ message: 'success', token });

    // Optionally log them in immediately:
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error during signup' });
  }
};

// Handle the Login authentication logic
export const loginController = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(401).json({ error: 'Invalid or Incomplete entries' });
    }

    const user_account = await getAccount(req, email, password);

    if (!user_account) {
      return res
        .status(401)
        .json({ error: 'User Account does not exist. Please create a ruut account' });
    }

    if (!req.session && req.session.token) {
      req.session.account = user_account;
      req.session.token = user_account?.token;
      req.session.client = user_account?.client;
      req.session.access = user_account?.access;
      req.session.uid = user_account?.uid;
      req.session.accessToken = user_account?.data?.access_token;
      req.session.accountId = user_account?.data?.account_id;
      req.session.email = user_account?.data?.email;
      res.status(200).json({ message: 'success', token: req.session.token });
    }
    req.session.account = user_account;
    req.session.token = user_account?.token;
    req.session.client = user_account?.client;
    req.session.access = user_account?.access;
    req.session.uid = user_account?.uid;
    req.session.accessToken = user_account?.data?.access_token;
    req.session.accountId = user_account?.data?.account_id;
    req.session.email = user_account?.data?.email;

    console.log('USER', user_account);
    res.status(200).json({ message: 'User confirmed', user: user_account });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// Handle authentication of Ruut token

export const authenticateRuutToken = async (req, res) => {
  try {
    // const webflowAccessToken = req.token;
    const ruut_token = req.session.token || process.env.BEARER_TOKEN;
    const ruut_accessToken = req.session.accessToken;
    const accountId = req.session.accountId;
    const webflowAccessToken = req.session.ruutWebflowToken;
    // const webflowAccessToken = process.env.WEBFLOW_SITE_TOKEN;
    // let webflowAccessToken;

    if (!ruut_token || !ruut_accessToken || !accountId) {
      console.log('No token found. Redirecting to Login screen...');
      // Redirect to Login UI
      return res.redirect('https://ruutchat.vercel.app/#/login');
      //return res.redirect(`http://localhost:1337/#/login`);
    }

    // Authenticate with Ruut Rails backend to retrieve user's account id + bearer token/ruut_token
    // const accountId = await getToken(
    //   req,
    //   ruut_token,
    //   req.session.accessToken || ruut_accessToken,
    //   webflowAccessToken
    // );

    // if (!accountId) {
    //   console.log('Failed to get Ruut account. Redirecting to auth screen...');
    //   return res.redirect(`http://localhost:1337/#/oauth-callback`);
    // }

    const ruutWebflowToken = await getRuutWebflowToken(
      accountId,
      req.session.accessToken || ruut_accessToken,
      ruut_token
    );

    if (!ruutWebflowToken || !webflowAccessToken) {
      console.log('Failed to get Ruut account. Redirecting to auth screen...');
      console.log('ACCOUNT ID', accountId);
      console.log('ACCESS TOKEN', ruut_accessToken);
      console.log('BEARER TOKEN', ruut_token);
      return res.redirect('/webflow/oauth');
    }

    console.log('Token verified. Redirecting to frontend...');
    res.redirect(
      'https://ruutchat.vercel.app' //'http://localhost:1337'

      //   : 'https://686539bade32441e008d4a45.webflow-ext.com/oauth-callback'
    );
  } catch (error) {
    console.error('Error during initial auth check:', error);
    return res.status(500).send('Internal Server Error');
  }
};

export const authorizeWebflow = async (req, res) => {
  try {
    const siteToken = process.env.WEBFLOW_SITE_TOKEN;

    // ⬇️ Expect the frontend to send state back in body or query
    const incomingState = req.body.state || req.query.state;

    let decodedState;
    if (incomingState) {
      try {
        const decodedState = await verifyStateToken(req.query.state);
        // console.log('Verified state:', decodedState);
        console.log('Decoded state from frontend:', decodedState);
      } catch (err) {
        console.error('Invalid or expired state:', err);
        return res.status(400).send('Invalid state');
      }
    }

    const accountId = decodedState?.accountId || req.session.accountId;
    const ruutToken = decodedState?.token || req.session.token || req.cookies.token;
    const accessToken = decodedState?.accessToken || req.session.accessToken;
    const ruutWebflowToken = decodedState?.ruutWebflowToken || req.session.ruutWebflowToken;

    // ✅ Check if we already have a valid Ruut Webflow token
    // const ruutWebflowToken = await getRuutWebflowToken(accountId, accessToken, ruutToken);

    if (ruutWebflowToken) {
      req.session.webflowToken = ruutWebflowToken;
      const authorizedUserInfo = await getAuthorizedUser(ruutWebflowToken);
      req.session.authorizedUser = authorizedUserInfo;

      console.log('RUUT Webflow token available, skipping OAuth.');
      return res.redirect('https://ruutchat.vercel.app'); //('http://localhost:1337/#/oauth-callback'); //'https://686539bade32441e008d4a45.webflow-ext.com');
    }

    // ✅ Otherwise, continue OAuth with the same incoming state
    const authorizeUrl = WebflowClient.authorizeURL({
      clientId: process.env.WEBFLOW_CLIENT_ID,
      redirectUri: 'https://ruutchat.vercel.app/webflow/oauth/callback',
      scope: scopes
      // state: incomingState // reuse state instead of regenerating
    });

    console.log('Starting OAuth with state from frontend. Redirecting to:', authorizeUrl);
    return res.redirect(authorizeUrl);
  } catch (error) {
    console.error('Error starting OAuth flow:', error);
    return res.status(500).send('OAuth initiation failed');
  }
};

export const authorizeWebflowResponse = async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).send('Missing authorization code');
  }
  console.log('CLIENT_ID', process.env.WEBFLOW_CLIENT_ID);
  console.log('CLIENT_SECRET', process.env.WEBFLOW_CLIENT_SECRET);
  console.log('REDIRECT_URI', process.env.WEBFLOW_REDIRECT_URI);

  try {
    const accessToken = await WebflowClient.getAccessToken({
      clientId: process.env.WEBFLOW_CLIENT_ID,
      clientSecret: process.env.WEBFLOW_CLIENT_SECRET,
      redirectUri: 'https://ruutchat.vercel.app/webflow/oauth/callback', //process.env.WEBFLOW_REDIRECT_URI,
      code: code
    });

    if (!accessToken) {
      throw new Error('No access token returned from Webflow');
    }

    req.session.webflowAccessToken = accessToken;

    // Authenticate and store the Webflow token in the Ruut backend
    console.log('WEBFLOW ACCESS TOKEN', accessToken);
    console.log('USER', req.user);
    console.log('FINAL ACCESS TOKEN', req.session.accessToken);
    console.log('FINAL BEARER TOKEN', req.session.token);
    // const accountId = await getToken(req, req.session.token, req.session.accessToken, accessToken);
    // req.session.accountId = accountId;

    if (state) {
      const decodedState = await verifyStateToken(state);
      const accountId = await getToken(
        req,
        decodedState?.uid?.token, //req.session.token, // from your app
        decodedState?.uid?.data?.access_token, // ruut access token
        accessToken // Webflow access
      );

      req.session.token = decodedState?.uid?.token;
      req.session.ruutAccessToken = decodedState?.uid?.data?.access_token;
      req.session.ruutWebflowToken = accessToken;
      req.session.accountId = accountId;
      await req.session.save();

      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      console.log('FINAL ACCOUNT ID', accountId);
      console.log('OAuth completed. Redirecting to dashboard...');

      if (!accountId) {
        console.log('Failed to authenticate and store token with Ruut');
        //throw new Error('Failed to authenticate and store token with Ruut');
      }
      console.log('FINAL ACCOUNT ID', accountId);
      console.log('OAuth completed. Redirecting to dashboard...');
    }

    res.redirect('https://ruutchat.vercel.app/#/oauth-callback');
    // res.redirect('http://localhost:1337/#/oauth-callback'); //https://686539bade32441e008d4a45.webflow-ext.com/oauth-callback');
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).send('OAuth failed');
  }
};

export const validateRuutUserToken = async (req, res) => {
  try {
    const ruutToken = req.session.token || req.cookies['Authorization'];
    const apiToken = req.session.accessToken || req.cookies['api_access_token'];
    const accountId = req.session.accountId;
    const ruutWebflowAccessToken = await getRuutWebflowToken(accountId, apiToken, ruutToken);
    // // const ruutWebflowAccessToken = req.session.webflowAccessToken;
    // const email = req.session.email;
    // const authorizedUser = req.session.authorizedUser;
    // const webflowSites = await getSites_SDK(req.session.webflowToken); //for starter plan

    // const scopes = authorizedUser?.authorization?.scope?.split(',') || [];
    // const workspaceIds = authorizedUser?.authorization?.authorizedTo?.workspaceIds || [];
    // const siteIds = authorizedUser?.authorization?.authorizedTo?.siteIds || [];

    // // classify user type
    // const isEnterprise = workspaceIds.length > 0 && scopes.includes('workspace:read');

    if (!ruutToken || !apiToken || !accountId || !ruutWebflowAccessToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Fetch Ruut authenticated user's workspaces
    const resp = await fetch(`${process.env.RUUT_API_ACCOUNTS}/${accountId}/inboxes`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${ruutToken}`,
        api_access_token: apiToken,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    // if (!resp.ok) throw new Error('Failed to fetch workspaces');
    if (!resp.ok) {
      const error = await resp.text();
      console.error('Ruut auth failed:', error);
      return null;
    }

    const ruutWorkspaces = await resp.json();

    res.json({
      // accountId,
      // ruutToken,
      // apiToken,
      // email, // if you store user info
      // webflowSites, //sites,
      ruutWorkspaces
      // scopes,
      // workspaceIds,
      // siteIds,
      // isEnterprise
    });
  } catch (err) {
    console.error('Error in /auth/client:', err);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
};

// Fetch all workspaces controller
export const fetchRuutUsersWorkspaces = async (req, res) => {
  try {
    // const { ruutToken, accessToken, accountId, ruutWebflowToken } = req.body;
    const ruutToken = req.session.token || req.cookies['Authorization'];
    const accessToken = req.session.accessToken || req.cookies['api_access_token'];
    const accountId = req.session.accountId;

    console.log('WORKSPACE TOKEN', accessToken);
    if (!ruutToken || !accessToken || !accountId)
      return res.status(401).json({ error: 'No token' });

    const resp = await fetch(`${process.env.RUUT_API_ACCOUNTS}/${accountId}/inboxes`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${ruutToken}`,
        api_access_token: accessToken,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!resp.ok) {
      const error = await resp.text();
      console.error('Ruut auth failed:', error);
      return null;
    }

    const workspaces = await resp.json();
    return res.json({ workspaces });
  } catch (err) {
    console.error('fetch workspaces error:', err);
    res.status(500).json({ error: 'Failed to load workspaces' });
  }
};

// Fetch a workspace controller
export const fetchSingleWorkspace = async (req, res) => {
  try {
    // const { ruutToken, apiToken, accountId, ruutWebflowToken } = req.body;
    const ruutToken = req.session.token || req.cookies['Authorization'];
    const apiToken = req.session.accessToken || req.cookies['api_access_token'];
    const accountId = req.session.accountId;

    const id = req.params.id;

    if (!id) return res.status(401).json({ error: 'Invalid id' });

    if (!ruutToken || !apiToken || !accountId) return res.status(401).json({ error: 'No token' });

    const resp = await fetch(`${process.env.RUUT_API_ACCOUNTS}/${accountId}/inboxes/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${ruutToken}`,
        api_access_token: apiToken,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    // Failed response message
    if (!resp.ok) {
      const error = await resp.text();
      console.error('Ruut auth failed:', error);
      return null;
    }

    const workspace = await resp.json();
    return res.json(workspace);
  } catch (err) {
    console.error('fetch workspaces error:', err);
    res.status(500).json({ error: 'Failed to load workspaces' });
  }
};

// Create Workspace controller
export const createSingleWorkSpace = async (req, res) => {
  try {
    const {
      websiteName,
      websiteHeading,
      theme,
      brandColor,
      bubblePosition,
      bubbleType
      // ruutToken,
      // apiToken,
      // accountId
    } = req.body;

    const logoFile = req.file;

    const ruutToken = req.session.token || req.cookies['Authorization'];
    const apiToken = req.session.accessToken || req.cookies['api_access_token'];
    const accountId = req.session.accountId;

    if (!ruutToken || !apiToken || !accountId) {
      return res.status(401).json({ error: 'No token' });
    }

    // Prepare FormData
    const formData = new FormData();

    // ✅ Correct key for ActiveStorage attachment is "avatar"
    if (logoFile) {
      formData.append('avatar', logoFile.buffer, {
        filename: logoFile.originalname,
        contentType: logoFile.mimetype,
        knownLength: logoFile.size
      });
    }
    // Inbox attributes
    formData.append('name', websiteName || 'Support');

    // Nested channel object (Rails-style keys)
    formData.append('channel[type]', 'web_widget');
    formData.append('channel[website_url]', websiteName);
    formData.append('channel[welcome_title]', websiteHeading);
    formData.append('channel[welcome_tagline]', theme || 'We are here to help you');
    formData.append('channel[widget_color]', brandColor || '#FF5733');

    // Nested widget_settings
    formData.append('channel[widget_settings][position]', bubblePosition || 'right');
    formData.append('channel[widget_settings][dark_mode]', theme === 'dark' ? 'true' : 'false');
    formData.append('channel[widget_settings][launcher_label]', bubbleType || 'Chat with us');

    // Send request to Ruut backend
    const resp = await axios.post(
      `${process.env.RUUT_API_ACCOUNTS}/${accountId}/inboxes`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          api_access_token: apiToken
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    const createdWorkspace = resp.data;
    return res.json({ message: 'Created successfully', workspace: createdWorkspace });
  } catch (err) {
    console.error('Rails API Error:', err.response?.status, err.response?.statusText);
    console.error('Response headers:', err.response?.headers);
    console.error('Response body:', err.response?.data);

    res.status(err.response?.status || 500).json({
      error: 'Failed to create workspace',
      details: err.response?.data || err.message
    });
  }
};

// Update Workspace controller
export const updateSingleWorkspace = async (req, res) => {
  try {
    const { websiteName, websiteHeading, theme, brandColor } = req.body;
    const logoFile = req.file;
    const apiToken = req.session.accessToken || req.cookies['api_access_token'];
    const accountId = req.session.accountId;
    const id = req.params.id;

    if (!id) return res.status(401).json({ error: 'Invalid id' });
    if (!apiToken || !accountId) {
      return res.status(401).json({ error: 'Missing API token or accountId' });
    }

    //Build FormData
    const formData = new FormData();

    if (logoFile) {
      console.log('Adding file:', logoFile.originalname, logoFile.mimetype, logoFile.size);
      formData.append('avatar', logoFile.buffer, {
        filename: logoFile.originalname,
        contentType: logoFile.mimetype,
        knownLength: logoFile.size
      });
    }
    formData.append('name', websiteName || '');
    formData.append('channel[website_url]', websiteName || '');
    formData.append('channel[welcome_title]', websiteHeading || '');
    formData.append('channel[welcome_tagline]', theme || '');
    formData.append('channel[widget_color]', brandColor || '#203C48');

    // Update to Ruut's backend
    const resp = await axios.patch(
      `${process.env.RUUT_API_ACCOUNTS}/${accountId}/inboxes/${id}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          api_access_token: apiToken
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    return res.json({
      message: 'Updated successfully',
      workspace: resp.data
    });
  } catch (err) {
    console.error('Rails API Error:', err.response?.status, err.response?.statusText);
    console.error('Response headers:', err.response?.headers);
    console.error('Response body:', err.response?.data);

    res.status(err.response?.status || 500).json({
      error: 'Failed to update workspace',
      details: err.response?.data || err.message
    });
  }
};
