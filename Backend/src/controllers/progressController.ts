// src/controllers/progressController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getUserProgress(req: Request, res: Response) {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ error: "unauth" });
  const progress = await prisma.userProgress.findMany({ where: { userId } });
  res.json({ progress });
}

export async function upsertProgress(req: Request, res: Response) {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ error: "unauth" });
  const { lessonId, status, score, streak } = req.body;
  if (!lessonId) return res.status(400).json({ error: "lessonId required" });

  const existing = await prisma.userProgress.findUnique({ where: { userId_lessonId: { userId, lessonId } } }).catch(()=>null);

  if (existing) {
    const updated = await prisma.userProgress.update({
      where: { id: existing.id },
      data: { status: status ?? existing.status, score: score ?? existing.score, streak: streak ?? existing.streak }
    });
    return res.json({ progress: updated });
  } else {
    const created = await prisma.userProgress.create({
      data: { userId, lessonId, status: status ?? "incomplete", score: score ?? 0, streak: streak ?? 0 }
    });
    return res.json({ progress: created });
  }
}
