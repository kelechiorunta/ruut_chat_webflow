import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import dotenv from 'dotenv';
import { getAccount } from '../utils/tokens.js';
dotenv.config();

export const configureLocalPassport = (passport) => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
          console.log('📡 Calling RUUT API with email:', email);
          const response = await fetch(`${process.env.RUUT_API_AUTHENTICATE}`, {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({ email, password }),
            credentials: 'include'
          });

          console.log('RUUT response status:', response.status);

          if (!response.ok) {
            const error = await response.text();
            console.error('❌ Ruut auth failed:', error);
            return done(null, false);
          }

          const authHeader = response.headers.get('authorization');
          const client = response.headers.get('client');
          const uid = response.headers.get('uid');
          const access = response.headers.get('access-token');

          console.log('🔍 Headers received:', {
            authHeader,
            client,
            uid,
            access
          });

          if (!authHeader?.startsWith('Bearer ')) console.log('⚠️ No valid auth header');
          if (!client) console.log('⚠️ No client header');
          if (!uid) console.log('⚠️ No uid header');
          if (!access) console.log('⚠️ No access-token header');

          const token = authHeader?.split(' ')[1];
          const { data } = await response.json();

          console.log('📦 RUUT data payload:', data);

          const account = {
            data,
            token,
            client,
            uid,
            access
          };

          console.log('✅ Passing account to done:', account);
          return done(null, account);
        } catch (err) {
          console.error('❌ Google authentication error:', err.message);
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser(async (account, done) => {
    try {
      const user = account;
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};

export const configureGooglePassport = (passport) => {
  // 🔹 Register Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID_NEW,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET_NEW,
        callbackURL: 'https://ruut-webflow-oauth.vercel.app/webflow/oauth2/redirect/google',
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log('🔑 GoogleStrategy fired!');
        console.log('AccessToken (truncated):', accessToken?.slice(0, 20) + '...');
        console.log('Profile:', JSON.stringify(profile, null, 2));

        const newUser = {
          username: profile.displayName,
          email: profile.emails?.[0]?.value,
          'google.name': profile.displayName,
          'google.email': profile.emails?.[0]?.value,
          'google.accessToken': accessToken,
          active: true
        };

        const email = profile.emails?.[0]?.value;
        
        console.log('📧 EMAIL PASSPORT:', email || newUser);

        try {
          console.log('📡 Calling RUUT API with email:', email);
          const response = await fetch('https://app.ruut.chat/auth/sign_in', {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({ email, password }),
            credentials: 'include'
          });

          console.log('RUUT response status:', response.status);

          if (!response.ok) {
            const error = await response.text();
            console.error('❌ Ruut auth failed:', error);
            return done(null, false);
          }

          const authHeader = response.headers.get('authorization');
          const client = response.headers.get('client');
          const uid = response.headers.get('uid');
          const access = response.headers.get('access-token');

          console.log('🔍 Headers received:', {
            authHeader,
            client,
            uid,
            access
          });

          if (!authHeader?.startsWith('Bearer ')) console.log('⚠️ No valid auth header');
          if (!client) console.log('⚠️ No client header');
          if (!uid) console.log('⚠️ No uid header');
          if (!access) console.log('⚠️ No access-token header');

          const token = authHeader?.split(' ')[1];
          const { data } = await response.json();

          console.log('📦 RUUT data payload:', data);

          const account = {
            data,
            token,
            client,
            uid,
            access
          };

          console.log('✅ Passing account to done:', account);
          return done(null, account);
        } catch (err) {
          console.error('❌ Google authentication error:', err.message);
          return done(err, null);
        }
      }
    )
  );

  // 🔹 Serialize user into the session
  passport.serializeUser((user, done) => {
    console.log('🗄️ SERIALIZE user:', user);
    done(null, user);
  });

  // 🔹 Deserialize user out of the session
  passport.deserializeUser(async (account, done) => {
    console.log('🗄️ DESERIALIZE user id:', account);
    try {
      // Lookup user in DB if needed
      const user = account;
      done(null, user);
    } catch (err) {
      console.error('❌ Deserialize error:', err);
      done(err, null);
    }
  });
};
