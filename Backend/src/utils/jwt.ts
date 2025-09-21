// src/utils/jwt.ts
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access-secret-dev";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh-secret-dev";
const ACCESS_EXP = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_EXP = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

export function signAccessToken(payload: object) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXP });
}
export function signRefreshToken(payload: object) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXP });
}
export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET);
}
export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET);
}
