import jwt from "jsonwebtoken";
import { env } from "../config/env";

interface TokenPayload {
  sub: string;
}

export const signToken = (userId: string): string => {
  const payload: TokenPayload = { sub: userId };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: `${env.JWT_EXPIRES_IN_DAYS}d`,
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
};

export const cookieMaxAgeMs = env.JWT_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000;
