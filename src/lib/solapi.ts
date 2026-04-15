/**
 * SOLAPI — SMS/카톡 메시지 전송
 */
import * as crypto from "crypto";

const API_KEY = () => process.env.SOLAPI_API_KEY || "";
const API_SECRET = () => process.env.SOLAPI_API_SECRET || "";

function getAuth(): string {
  const date = new Date().toISOString();
  const salt = crypto.randomBytes(16).toString("hex");
  const signature = crypto.createHmac("sha256", API_SECRET()).update(date + salt).digest("hex");
  return `HMAC-SHA256 apiKey=${API_KEY()}, date=${date}, salt=${salt}, signature=${signature}`;
}

export async function sendSMS(to: string, text: string): Promise<boolean> {
  if (!API_KEY()) return false;
  try {
    const res = await fetch("https://api.solapi.com/messages/v4/send-many/detail", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: getAuth() },
      body: JSON.stringify({ messages: [{ to: to.replace(/-/g, ""), from: "01012345678", text, type: "SMS" }] }),
      signal: AbortSignal.timeout(10000),
    });
    return res.ok;
  } catch { return false; }
}
