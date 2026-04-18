/**
 * TTS 나레이션 — Voicebox 우선, ElevenLabs 폴백
 * Voicebox(로컬, 무료) → ElevenLabs(클라우드, 유료) 자동 전환
 */

import { generateVoiceboxNarration } from "./voicebox";

const API_KEY = () => process.env.ELEVENLABS_API_KEY || "";
const VOICE_ID = () => process.env.ELEVENLABS_VOICE_ID || "nPczCjzI2devNBz1zQrb";

export async function generateNarration(
  text: string,
  voiceId?: string
): Promise<string | null> {
  // 1차: Voicebox (로컬, 무료)
  const vbResult = await generateVoiceboxNarration(text);
  if (vbResult) {
    console.log("[TTS] Voicebox 사용 (무료)");
    return vbResult;
  }

  // 2차: ElevenLabs (클라우드, 유료)
  const key = API_KEY();
  if (!key) {
    console.log("[TTS] Voicebox 다운 + ElevenLabs 키 없음 → 나레이션 건너뜀");
    return null;
  }

  try {
    console.log("[TTS] ElevenLabs 폴백 사용");
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || VOICE_ID()}`,
      {
        method: "POST",
        headers: { "xi-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.slice(0, 500),
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!res.ok) {
      console.error(`[ElevenLabs] HTTP ${res.status}: ${(await res.text()).slice(0, 100)}`);
      return null;
    }
    const buffer = await res.arrayBuffer();
    return `data:audio/mpeg;base64,${Buffer.from(buffer).toString("base64")}`;
  } catch (e) {
    console.error("[ElevenLabs]", (e as Error).message?.slice(0, 50));
    return null;
  }
}
