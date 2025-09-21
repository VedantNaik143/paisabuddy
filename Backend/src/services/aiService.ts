// paisabuddy-backend/src/services/aiService.ts
import fs from "fs";
import path from "path";

const CONV_PATH = path.join(__dirname, "..", "..", "data", "conversations.json");

function ensureConvFile() {
  if (!fs.existsSync(path.dirname(CONV_PATH))) fs.mkdirSync(path.dirname(CONV_PATH), { recursive: true });
  if (!fs.existsSync(CONV_PATH)) fs.writeFileSync(CONV_PATH, JSON.stringify([]));
}

export async function saveConversation(conv: any) {
  ensureConvFile();
  const raw = fs.readFileSync(CONV_PATH, "utf-8");
  const arr = JSON.parse(raw);
  arr.push({ ...conv, createdAt: new Date().toISOString() });
  fs.writeFileSync(CONV_PATH, JSON.stringify(arr, null, 2));
}

/**
 * If OPENAI_API_KEY exists, call OpenAI Chat Completions using global fetch.
 * If not, use a tiny rule-based fallback.
 */
export async function generateReply(userId: number | string, message: string) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    const lower = message.toLowerCase();
    if (lower.includes("sip")) return "A SIP is Systematic Investment Plan — invest fixed amount monthly to benefit from rupee-cost averaging.";
    if (lower.includes("upi")) return "UPI is India's instant payments system. Never share your UPI PIN and verify payee details.";
    if (lower.includes("budget")) return "Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.";
    if (lower.includes("scam") || lower.includes("phish")) return "Red flags: unknown links, urgent requests, spelling errors, ask for OTP. Never share OTP.";
    return "Buddy Bhaiya: I can help with SIPs, budgeting, UPI safety, and paper trading. Ask me a question!";
  }

  try {
    const body = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are Buddy Bhaiya — a friendly, concise financial mentor for young Indians. Reply in simple Hinglish or English depending on the user; keep answers short." },
        { role: "user", content: message }
      ],
      max_tokens: 400,
      temperature: 0.2
    };

    // use global fetch (Node 18+)
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type":"application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("OpenAI error", res.status, txt);
      return "Sorry, Buddy Bhaiya is temporarily unavailable. Try again later.";
    }
    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content ?? "Sorry, no reply.";
    return reply;
  } catch (e) {
    console.error("aiService.generateReply error", e);
    return "Sorry, an error occurred while generating reply.";
  }
}
