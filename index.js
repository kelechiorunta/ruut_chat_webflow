import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import bodyParser from 'body-parser';
import passport from 'passport';
import ConnectMongoDBSession from 'connect-mongodb-session';
import path from 'path';
import helmet from 'helmet';
import { fileURLToPath } from 'url';

import authRouter from './routes/authRoutes.js';
import { connectDB } from './db/db.js';

import morgan from 'morgan';

// Setup dotenv to load environmental variables
dotenv.config();

// Initialize an express server instance
const app = express();

const DEV_PORT = process.env.DEV_PORT;
const PORT = process.env.PORT || DEV_PORT;
const ALLOWED_DOMAINS = [
  'https://ruutchat.vercel.app',
  'http://localhost:1337',
  'https://686539bade32441e008d4a45.webflow-ext.com',
  'https://app.ruut.chat'
]; //process.env.DOMAINS.split(',');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB database
connectDB(process.env.MONGO_URI);

// Session store configuration
const MongoDBStore = ConnectMongoDBSession(session);
const store = new MongoDBStore(
  {
    uri: process.env.MONGO_URI,
    collection: 'sessions',
    expires: 1000 * 60 * 60 * 24 * 7
  } // Sessions expire after 1 week}
);
// Cors configuration settings
const corsSetup = {
  origin: (origin, callback) => {
    if (!origin || ALLOWED_DOMAINS.includes(origin)) {
      return callback(null, true);
    } else {
      return callback('Domain not supported', false);
    }
  },
  credentials: true,
  allowedHeaders: ['Authorization', 'Content-Type', 'api_access_token', 'client', 'uid'], //allow headers for RUUT
  method: ['GET', 'POST', 'PUT', 'PATCH', 'OPTIONS']
};

app.use((req, res, next) => {
  res.removeHeader('X-Frame-Options'); // remove default frame restriction
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Authorization, Content-Type, api_access_token, client, uid'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, OPTIONS');
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Permissions-Policy', 'interest-cohort=()');
  res.setHeader('X-Frame-Options', 'ALLOWALL'); // ✅ allow iframe embedding
  next();
});

const sessionOptions = {
  name: 'auth_session',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    secure: true, // Must be true in production
    sameSite: 'none', // Required for cross-site
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  }
};

// Enable first proxy which is Vercel for production
app.set('trust proxy', 1); // trust first proxy

// Session storage
app.use(session(sessionOptions));

// Setup cors middleware for authorized domains
app.use(cors(corsSetup));

// Setup cookie parser middleware for cookies
app.use(cookieParser());

//Setup middleware for Login form data handling
app.use(express.json());
app.use(bodyParser.urlencoded(true));
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

// ✅ Correct usage:

app.use('/webflow', authRouter);

// app.use(express.static(path.join(__dirname, 'client', 'build')));
// Catch-all handler for SPA routing

app.use(
  express.static(path.join(__dirname, 'webflow-extension', 'ruut_widget_installation', 'public'))
);

app.get('/*', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'webflow-extension', 'ruut_widget_installation', 'public', 'index.html')
  );
});

// ErrorHandler middleware
app.use(morgan('common'));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Server Error' });
  next();
});

// Server listening for initial TCP handshake
app.listen(PORT, () => {
  console.log(`Server is listening at PORT ${PORT}`);
});
