// paisabuddy-backend/src/server.ts
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// auth controllers
import { signup, login, refresh, logout } from "./controllers/authController";
// auth middleware
import { requireAuth } from "./middleware/auth";
// portfolio controllers
import { getPortfolio, getPortfolioHistory, postTrade } from "./controllers/portfolioController";
// lessons & progress controllers
import { listLessons, getLesson } from "./controllers/lessonsController";
import { getUserProgress, upsertProgress } from "./controllers/progressController";
// ai controller
import { chat as aiChat } from "./controllers/aiController";
// market poller
import { startMockMarket } from "./workers/marketPoller";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", credentials: true }
});

app.use(helmet());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ----------------- Auth routes -----------------
app.post("/auth/signup", signup);
app.post("/auth/login", login);
app.post("/auth/refresh", refresh);
app.post("/auth/logout", logout);

// ----------------- User endpoint (added) -----------------
app.get("/user/me", requireAuth, async (req, res) => {
  try {
    const payload: any = (req as any).user;
    const userId = payload?.userId;
    if (!userId) return res.status(401).json({ error: "unauth" });
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { id: true, email: true, name: true, language: true, paisacoins: true }
    });
    if (!user) return res.status(404).json({ error: "user not found" });
    res.json({ user });
  } catch (err) {
    console.error("GET /user/me error:", err);
    res.status(500).json({ error: "server error" });
  }
});

// ----------------- Portfolio / Trades -----------------
app.get("/portfolio", requireAuth, getPortfolio);
app.get("/portfolio/history", requireAuth, getPortfolioHistory);
app.post("/trades/paper", requireAuth, postTrade);

// ----------------- Lessons (public) -----------------
app.get("/lessons", listLessons);
app.get("/lessons/:id", getLesson);

// ----------------- User progress (protected) -----------------
app.get("/user_progress", requireAuth, getUserProgress);
app.post("/user_progress", requireAuth, upsertProgress);

// ----------------- AI chat -----------------
// Protected chat (requires auth)
app.post("/ai/chat", requireAuth, aiChat);

// ----------------- Health -----------------
app.get("/health", (_req, res) => res.json({ ok: true }));

// ----------------- Socket.IO -----------------
io.on("connection", (socket) => {
  console.log("socket connected", socket.id);
  socket.on("subscribe", (room) => socket.join(room));
  socket.on("disconnect", () => console.log("socket disconnect", socket.id));
});

// start mock market and pass io for live price updates
startMockMarket(io);

const PORT = process.env.PORT ?? 4000;
server.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
