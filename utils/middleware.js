// This middleware is reserved for subsequent authentication for sites, cms and other client permitted
// actions for Ruut webflow designer sites

import { WebflowClient } from 'webflow-api';
import { getRuutWebflowToken } from './tokens.js';

// Middleware function to initialize the Webflow client and attach it to the request object
const webflowClientMiddleware = async (req, res, next) => {
  try {
    // Retrieve the access token for the user
    const accessToken = req.session.webflowAccessToken; //await getToken('user');
    console.log('MiddlewareUserAccount', req.session.account); //accessToken || req.session.webflowAccessToken);
    if (!accessToken) {
      // If the access token is not found, log an error and send a 401 Unauthorized response
      console.log('Access token not found for user');
      return res.status(401).send('Access token not found');
    }

    // Initialize the Webflow client with the retrieved access token
    req.webflow = new WebflowClient({ accessToken });

    req.webflowAccessToken = req.session.webflowAccessToken;
    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Log any errors that occur during initialization and send a 500 Internal Server Error response
    console.error('Error initializing Webflow client:', error);
    res.status(500).send('Failed to initialize Webflow client');
  }
};

/**
 * Bearer Token middleware to check for token in the Authorization header
 * Fails due to its non-persistence of tokens in between routes
 * @param {request object} req
 * @param {response object} res
 * @param {next action} next
 * @returns void
 */
export const extractBearerToken = async (req, res, next) => {
  const authHeader = response.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ error: 'Missing token' });

  try {
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      console.log(token);
      req.token = token;
      next();
    }
  } catch (err) {
    console.error(err || err?.message);
  }
};

/**
 * Cookie Token middleware to check for token in the Authorization header
 * Fails due to its non-persistence of tokens in between routes
 * @param {request object} req
 * @param {response object} res
 * @param {next action} next
 * @returns void
 */
export const extractCookieToken = async (req, res, next) => {
  //res.status(401).json({ error: 'Missing token' }); /
  try {
    const authToken = req.session.token || req.cookies.token;
    const authAccessToken = req.session.accessToken;
    const authAccountId = req.session.accountId;
    const ruutWebflowToken = await getRuutWebflowToken(authAccountId, authAccessToken, authToken);
    console.log('There is token', authToken);
    console.log('There is token', authAccessToken);
    console.log('There is id', authAccountId);
    if ((!authToken && !authAccessToken && !authAccountId) || !ruutWebflowToken) {
      return res.redirect('https://ruutchat.vercel.app'); //('http://localhost:1337');
    }
    req.token = authToken;
    req.accessToken = authAccessToken;
    next();
    // }
  } catch (err) {
    console.error(err || err?.message);
  }
};

// Export the middleware function for use in other parts of the application
export default webflowClientMiddleware;
