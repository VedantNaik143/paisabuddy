// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export interface AuthRequest extends Request {
  user?: any;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Missing auth header" });
  const parts = auth.split(" ");
  if (parts.length !== 2) return res.status(401).json({ error: "Invalid auth header" });
  const token = parts[1];
  try {
    const payload = verifyAccessToken(token) as any;
    // payload should contain userId as we signed it in login
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
