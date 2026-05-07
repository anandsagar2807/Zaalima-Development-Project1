import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const JWT_SECRET = env.jwtSecret;
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const generateStateToken = (): string => {
  return jwt.sign({ timestamp: Date.now() }, JWT_SECRET, { expiresIn: '10m' });
};

export const verifyStateToken = (state: string): boolean => {
  try {
    jwt.verify(state, JWT_SECRET);
    return true;
  } catch (error) {
    return false;
  }
};
