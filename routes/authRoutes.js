// import express from 'express';
// import { storeToken, getToken } from '../utils/tokens.js';
// import { WebflowClient } from 'webflow-api';
// import dotenv from 'dotenv';

// dotenv.config();

// // Setup auth routes
// const authRouter = express.Router();

// // Include scopes for your app. Be sure your App has been registered with the same scopes.
// const scopes = ["sites:read", "cms:read", "cms:write"];

// // Redirect root to Auth Screen or Frontend
// authRouter.get("/", async (req, res) => {
//     try {
//       const token = await getToken(process.env.SAMPLE_ID);
//       if (!token) {
//         console.log("No token found. Redirecting to auth screen...");
//         return res.redirect("/webflow/oauth");
//       } else {
//         console.log("Token found. Redirecting to frontend...");
//         return res.redirect("https://www.ruut.chat/app");
//       }
//     } catch (error) {
//       console.error("Error handling token:", error);
//       res.status(500).send("Internal Server Error");
//     }
// });

// // Route to start Auth Flow. Redirects to Webflow Auth screen
// authRouter.get("/oauth", async (req, res) => {
//     try {
//       // Check if a user is using a Site Token. If so, store the site token in the database and skip auth screen
//       const siteToken = process.env.WEBFLOW_SITE_TOKEN;
//       if (siteToken) {
//         await storeToken("user", siteToken);
//         console.log("Site token found and stored. Redirecting to frontend...");
//         return res.redirect("http://localhost:3600");
//       } else {
//         const publicUrl = process.env.PUBLIC_URL;
//         const authorizeUrl = WebflowClient.authorizeURL({
//           scope: scopes,
//           clientId: process.env.WEBFLOW_CLIENT_ID,
//           redirectUri: process.env.WEBFLOW_REDIRECT_URI,//`${publicUrl}/webflow/auth/callback`,
//           state: Math.random().toString(36).substring(7),//For CSFR security attack
//         });
//         res.redirect(authorizeUrl);
//       }
//     } catch (error) {
//       console.error("Error starting auth flow:", error);
//       res.status(500).send("Failed to start auth flow");
//     }
// });

// // Callback URI to get code and access token
// authRouter.get("/oauth/callback", async (req, res) => {
//     const { code } = req.query;
//     if (!code) {
//       return res.status(400).send("Authorization code is required");
//     }

//     try {
//       const publicUrl = process.env.PUBLIC_URL;
//       const accessToken = await WebflowClient.getAccessToken({
//         clientId: process.env.WEBFLOW_CLIENT_ID,
//         clientSecret: process.env.WEBFLOW_CLIENT_SECRET,
//         code: code,
//         redirectUri: process.env.WEBFLOW_REDIRECT_URI,
//         // redirectUri: `${publicUrl}/oauth/callback`,
//       });

//       await storeToken(process.env.SAMPLE_ID, accessToken); // Use access_token
//       console.log("Access token obtained and stored. Redirecting to frontend...");
//       res.redirect("https://www.ruut.chat");
//     } catch (error) {
//       console.error("Error fetching access token:", error);
//       res.status(500).send("Failed to fetch access token");
//     }
//   });

// export default authRouter

// OAUTH FROM RUUT BACKEND
// // export default authRouter

import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import jwt from 'jsonwebtoken';

import {
  authenticateRuutToken,
  authorizeWebflow,
  authorizeWebflowResponse,
  createSingleWorkSpace,
  fetchRuutUsersWorkspaces,
  fetchSingleWorkspace,
  loginController,
  passportRedirect,
  proxyIframeSrc,
  signupController,
  updateSingleWorkspace,
  validateRuutUserToken
} from '../controllers/authControllers.js';
import webflowClientMiddleware, { extractCookieToken } from '../utils/middleware.js';
import { listSites } from '../controllers/sitesController.js';
import passport from 'passport';
import { configureGooglePassport, configureLocalPassport } from '../config/passport.js';
import { getAuthorizedUser, getRuutWebflowToken } from '../utils/tokens.js';
import { WebflowClient } from 'webflow-api';
import { createStateToken } from '../utils/jwt.js';

const authRouter = express.Router();

dotenv.config();

// Multer storage middleware for file uploads like images/pictures/logos/avatars
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Scopes needed for your Webflow app
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

configureLocalPassport(passport);
configureGooglePassport(passport);

/**Google Authentication */
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
authRouter.get('/oauth2/redirect/google', passport.authenticate('google'), passportRedirect);

authRouter.get('/api/proxy', proxyIframeSrc);
/**
 * GET /
 * Redirect to frontend if token exists, otherwise to auth screen
 */
authRouter.get('/', extractCookieToken, authenticateRuutToken);

/**
 * GET /oauth
 * Initiates Webflow OAuth or uses static site token
 */
authRouter.get('/oauth', authorizeWebflow);

/**
 * GET /oauth/callback
 * Callback endpoint from Webflow OAuth
 */
authRouter.get('/oauth/callback', authorizeWebflowResponse);

/**
 * GET workspaces of Authenticated Ruut User to Webflow
 */
authRouter.get('/workspaces', fetchRuutUsersWorkspaces);

// Fetch a single workspace/channel of the authenticated Ruut User done
authRouter.get('/workspace/:id', fetchSingleWorkspace);

// Validate a Ruut user's token on the frontend done
authRouter.get('/validate_token', validateRuutUserToken);

authRouter.post('/signup', signupController);

authRouter.post('/signin', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err || !user) {
      console.error('ERROR', err || info?.message);
      // res.redirect('https://ruut-webflow-oauth.vercel.app');
      return res.status(401).json({ error: info?.message || 'Unauthorized' });
    }

    req.logIn(user, async (err) => {
      if (err) res.status(500).json({ error: 'Login error' });

      req.session.user = user;
      req.session.authenticated = true;

      const ruutWebflowToken = await getRuutWebflowToken(
        user?.data?.account_id,
        user?.data?.access_token,
        user?.token
      );
      req.session.account = user;
      req.session.token = user?.token;
      req.session.client = user?.client;
      req.session.access = user?.access;
      req.session.uid = user?.uid;
      req.session.accessToken = user?.data?.access_token;
      req.session.accountId = user?.data?.account_id;
      req.session.email = user?.data?.email;
      req.session.ruutWebflowToken = ruutWebflowToken;

      req.session.save((err) => {
        if (err) {
          console.error('Failed to save session', err);
          return res.status(500).send('Session save error');
        }
        // Create a state token linked to this session

        console.log('Session saved', req.session);
        // res.redirect('https://686539bade32441e008d4a45.webflow-ext.com/oauth-callback');
      });

      // Sign in the token with jose library
      const state = await createStateToken({
        sid: req.sessionID,
        uid: user
      });

      const authorizeUrl = WebflowClient.authorizeURL({
        clientId: process.env.WEBFLOW_CLIENT_ID,
        redirectUri: 'https://ruutchat.vercel.app/webflow/oauth/callback',
        scope: 'cms:read sites:read',
        state
      });

      return res.status(200).json({
        message: 'Login successful',
        authorizeUrl: authorizeUrl,
        ruutWebflowToken: req.session.ruutWebflowToken,
        token: req.session.token,
        accessToken: req.session.accessToken,
        accountId: req.session.accountId
      });

      // return res.status(200).json({ message: 'Login successful', user: user });
    });
  })(req, res, next);
});
//
authRouter.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

// Create a single workspace for the authenticated Ruut User done
authRouter.post('/create_workspace', upload.single('avatar'), createSingleWorkSpace);

// Update a single workspace for the authenticated Ruut User done
authRouter.patch('/workspace/:id', upload.single('avatar'), updateSingleWorkspace);

authRouter.get('/sites', listSites);

export default authRouter;
