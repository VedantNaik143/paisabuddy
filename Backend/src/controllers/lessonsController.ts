// paisabuddy-backend/src/controllers/lessonsController.ts
import { Request, Response } from "express";
import fs from "fs";
import path from "path";

const lessonsPath = path.resolve(__dirname, "..", "..", "data", "lessons.json");

function loadLessonsSafe() {
  if (!fs.existsSync(lessonsPath)) {
    // helpful error for debugging
    throw new Error(`lessons.json not found at ${lessonsPath}`);
  }
  const raw = fs.readFileSync(lessonsPath, "utf-8");
  return JSON.parse(raw);
}

export function listLessons(_req: Request, res: Response) {
  try {
    const lessons = loadLessonsSafe().map((l: any) => ({
      id: l.id,
      title: l.title,
      summary: l.summary
    }));
    res.json({ lessons });
  } catch (err: any) {
    console.error("listLessons error:", err.message || err);
    res.status(500).json({ error: "failed to load lessons", detail: String(err.message ?? err) });
  }
}

export function getLesson(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const lessons = loadLessonsSafe();
    const found = lessons.find((l: any) => l.id === id);
    if (!found) return res.status(404).json({ error: "Lesson not found" });
    res.json({ lesson: found });
  } catch (err: any) {
    console.error("getLesson error:", err.message || err);
    res.status(500).json({ error: "failed to load lesson", detail: String(err.message ?? err) });
  }
}
