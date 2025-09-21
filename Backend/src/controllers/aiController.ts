// paisabuddy-backend/src/controllers/aiController.ts
import { Request, Response } from "express";
import { generateReply, saveConversation } from "../services/aiService";

export async function chat(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId ?? "anonymous";
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "message required" });

    const reply = await generateReply(userId, message);

    // persist conversation (simple)
    await saveConversation({ userId, message, reply });

    res.json({ reply });
  } catch (err) {
    console.error("AI chat error", err);
    res.status(500).json({ error: "AI error" });
  }
}
