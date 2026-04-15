/**
 * ElevenLabs TTS — 릴스 나레이션 자동 생성
 */

const API_KEY = () => process.env.ELEVENLABS_API_KEY || "";
const VOICE_ID = () => process.env.ELEVENLABS_VOICE_ID || "nPczCjzI2devNBz1zQrb";

export async function generateNarration(
  text: string,
  voiceId?: string
): Promise<string | null> {
  const key = API_KEY();
  if (!key) return null;

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || VOICE_ID()}`,
      {
        method: "POST",
        headers: { "xi-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.slice(0, 500), // 500자 제한 (비용 관리)
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    return `data:audio/mpeg;base64,${Buffer.from(buffer).toString("base64")}`;
  } catch (e) {
    console.error("[ElevenLabs]", (e as Error).message?.slice(0, 50));
    return null;
  }
}
