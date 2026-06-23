import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  userId: string;
  email: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: '7d',
  });
}

export function generateStateToken(): string {
  return jwt.sign({ timestamp: Date.now() }, env.jwtSecret, {
    expiresIn: '10m',
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function verifyStateToken(token: string): boolean {
  try {
    jwt.verify(token, env.jwtSecret);
    return true;
  } catch (error) {
    return false;
  }
}
