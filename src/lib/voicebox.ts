/**
 * Voicebox TTS — 로컬 Qwen3-TTS 엔진
 * Voicebox 서버가 실행 중이면 ElevenLabs 대신 무료로 나레이션 생성
 * 서버 다운 시 null 반환 → ElevenLabs 폴백
 */

const VOICEBOX_URL = process.env.VOICEBOX_URL || "http://localhost:17493";

/** Voicebox 서버 상태 확인 (1초 타임아웃) */
async function isVoiceboxAlive(): Promise<boolean> {
  try {
    const res = await fetch(`${VOICEBOX_URL}/health`, {
      signal: AbortSignal.timeout(1000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Voicebox로 나레이션 생성
 * @returns base64 data URI (audio/wav) 또는 null (서버 다운 시)
 */
export async function generateVoiceboxNarration(
  text: string,
  voicePrompt?: string,
): Promise<string | null> {
  if (!text || text.length < 10) return null;

  const alive = await isVoiceboxAlive();
  if (!alive) {
    console.log("[voicebox] 서버 미응답 → ElevenLabs 폴백");
    return null;
  }

  try {
    const res = await fetch(`${VOICEBOX_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text.slice(0, 1000),
        language: "ko",
        voice_prompt: voicePrompt || null,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      console.error(`[voicebox] HTTP ${res.status}`);
      return null;
    }

    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const contentType = res.headers.get("content-type") || "audio/wav";
    console.log(`[voicebox] 생성 완료 (${(buffer.byteLength / 1024).toFixed(1)}KB)`);
    return `data:${contentType};base64,${base64}`;
  } catch (e) {
    console.error("[voicebox]", (e as Error).message?.slice(0, 80));
    return null;
  }
}
