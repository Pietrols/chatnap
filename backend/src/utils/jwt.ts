import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserPayload } from '../types';

export const generateToken = (payload: UserPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): UserPayload => {
  return jwt.verify(token, env.JWT_SECRET) as UserPayload;
};
