import { SignJWT, jwtVerify } from 'jose';
import dotenv from 'dotenv';

dotenv.config();

const encoder = new TextEncoder();

export const createStateToken = async (payload) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10m') // Short-lived access token
    .setIssuer(process.env.ISS)
    .sign(encoder.encode(process.env.JWT_SECRET));
};

export const verifyStateToken = async (token) => {
  const secret = process.env.JWT_SECRET;
  const { payload } = await jwtVerify(token, encoder.encode(secret));
  if (payload.iss !== process.env.ISS || !payload.iss)
    throw new Error('Token hijacked. Wrong issuer');
  return payload;
};
