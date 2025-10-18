import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { WebflowClient } from 'webflow-api';

dotenv.config();
// Authenticate with Ruut backend
export const getToken = async (req, ruutToken, ruutAccessToken, webflowAccessToken) => {
  try {
    console.log('PROFILE', process.env.RUUT_API_PROFILE);
    const response = await fetch(`${process.env.RUUT_API_PROFILE}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ruutToken}`,
        api_access_token: `${ruutAccessToken}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Ruut auth failed:', error);
      return null;
    }

    const data = await response.json();
    const { account_id } = data;
    console.log('ACCOUNTS_API', process.env.RUUT_API_ACCOUNTS);
    console.log('Account id', account_id);
    // Store Webflow token into Ruut backend
    // if (account_id && webflowAccessToken && ruutAccessToken && ruutToken) {
    await storeToken(req, account_id, webflowAccessToken, ruutAccessToken, ruutToken);
    // }

    return account_id;
  } catch (err) {
    console.error('Authentication error', err);
  }
};

export const storeToken = async (
  req,
  accountId,
  webflowAccessToken,
  ruutAccessToken,
  bearerToken
) => {
  try {
    const response = await fetch(
      `${process.env.RUUT_API_ACCOUNTS}/${accountId}/custom_attribute_definitions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearerToken}`,
          api_access_token: `${ruutAccessToken}`
        },
        body: JSON.stringify({
          //custom_attributes: { webflow_access_token: webflowAccessToken }
          attribute_display_name: 'Webflow Access Token',
          attribute_display_type: 0,
          attribute_description: 'A webflow user access token',
          attribute_key: 'webflow_access_token',
          attribute_model: 0,
          regex_pattern: '^[a-zA-Z0-9]+$',
          regex_cue: 'Please enter a valid value',
          attribute_values: [webflowAccessToken]
        }),
        credentials: 'include' //For cookies and authentication tokens on the browser
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to store token: ${error}`);
    }

    req.session.accountId = accountId;

    const data = await response.json();
    console.log('SAVED_API', process.env.RUUT_API_ACCOUNTS);
    console.log('SAVED TOKEN', data);
    return data;
  } catch (err) {
    throw new Error();
  }
};

// Api to fetch webflow token from Ruut authenticated user's account
export const getRuutWebflowToken = async (accountId, ruutAccessToken, ruutBearerToken) => {
  try {
    const response = await fetch(
      `${process.env.RUUT_API_ACCOUNTS}/${accountId}/custom_attribute_definitions`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ruutBearerToken}`,
          api_access_token: `${ruutAccessToken}`
        },
        credentials: 'include'
      }
    );
    const data = await response.json();
    console.log('CUSTOM_API', process.env.RUUT_API_ACCOUNTS);
    console.log('CUSTOM', data[0]?.attribute_values[0]);
    return data[0]?.attribute_values[0];
  } catch (err) {
    console.error('Failed to fetch webflow token from Ruut: ', err);
  }
};

// Api to delete webflow token from Ruut authenticated user's account. Returns html. For testing.
export const deleteRuutWebflowToken = async (accountId, ruutAccessToken, ruutBearerToken) => {
  try {
    const response = await fetch(
      `${process.env.RUUT_API_ACCOUNTS}/${accountId}/custom_attribute_definitions/id`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ruutBearerToken}`,
          api_access_token: `${ruutAccessToken}`
        },
        credentials: 'include'
      }
    );
    const data = await response.json();
    return data[0]?.attribute_values[0];
  } catch (err) {
    console.error('Failed to delete webflow token from Ruut: ', err);
  }
};

export const resetToken = async (req, accountId, ruutAccessToken, bearerToken) => {
  try {
    const response = await fetch(
      `${process.env.RUUT_API_ACCOUNTS}/${accountId}/custom_attribute_definitions/21`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearerToken}`,
          api_access_token: `${ruutAccessToken}`
        },
        body: JSON.stringify({}), // send explicit empty
        credentials: 'include'
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to reset token: ${error}`);
    }

    req.session.accountId = accountId;

    const data = await response.json();
    return data;
  } catch (err) {
    console.error('resetToken error:', err);
    throw new Error('Could not reset token');
  }
};

// Helper function to fetch Ruut authenticated user's account through signin
export const getAccount = async (req, email, password) => {
  try {
    if (!email || !password) {
      console.error('Invalid fields');
    }
    const response = await fetch(`${process.env.RUUT_API_AUTHENTICATE}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Ruut auth failed:', error);
      return null;
    }
    const authHeader = response.headers.get('authorization');
    const client = response.headers.get('client');
    const uid = response.headers.get('uid');
    const access = response.headers.get('access-token');

    if (!authHeader || !authHeader.startsWith('Bearer ')) console.log('No auth header');
    if (!client) console.log('No client header');
    if (!uid) console.log('No uid header');
    if (!access) console.log('No access-token header');
    const token = authHeader.split(' ')[1];
    req.session.mytoken = token;

    const { data } = await response.json();
    const account = { data: data, token: token, client: client, uid: uid, access: access };
    return account;
  } catch (err) {
    console.error(err || err?.message);
  }
};

// Webflow API requests by webflow access token
export const getSites = async (token) => {
  try {
    if (!token) {
      return new Error('No valid token');
    }
    const response = await fetch(`https://api.webflow.com/v2/sites`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      credentials: 'include'
    });
    const data = await response.json();
    // const data = await req.webflow.sites.list();
    return data; // Respond with Site Data
  } catch (error) {
    console.error('Error fetching sites:', error);
  }
};

// Using Javascript SDKs webflowClient

export const getSites_SDK = async (token) => {
  const webflow = new WebflowClient({ accessToken: token });

  try {
    const sites = await webflow.sites.list();
    return sites;
  } catch (error) {
    console.error('Error fetching sites:', error);
  }
};

export const getUserInfo = async (token) => {
  try {
    if (!token) {
      return new Error('No valid token');
    }
    const response = await fetch(`https://api.webflow.com/v2/token/authorized_by`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      credentials: 'include'
    });

    const data = await response.json();

    // Convert headers into a plain object
    // To see the headers including the rate-limiting headers
    const headersObj = {};
    for (let [key, value] of response.headers.entries()) {
      headersObj[key] = value;
    }

    const alldata = { data, headers: headersObj };

    return alldata; // Respond with Site Data
  } catch (error) {
    console.error('Error fetching sites:', error);
  }
};

export const getAuthorizedUser = async (token) => {
  try {
    if (!token) {
      return new Error('No valid token');
    }
    const response = await fetch(`https://api.webflow.com/v2/token/introspect`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      credentials: 'include'
    });

    const data = await response.json();

    return data; // Respond with Site Data
  } catch (error) {
    console.error('Error fetching sites:', error);
  }
};
