import { fal } from "./fal-client";

interface VideoResult { url: string; duration: number }

export type VideoModel = "veo" | "seedance" | "kling3" | "kling25";

const MODELS: Record<VideoModel, { t2v: string; i2v: string }> = {
  veo:      { t2v: "fal-ai/veo3.1/text-to-video",                       i2v: "fal-ai/veo3.1/image-to-video" },
  seedance: { t2v: "fal-ai/bytedance/seedance-2.0/text-to-video",       i2v: "fal-ai/bytedance/seedance-2.0/image-to-video" },
  kling3:   { t2v: "fal-ai/kling-video/v3/pro/text-to-video",           i2v: "fal-ai/kling-video/v3/pro/image-to-video" },
  kling25:  { t2v: "fal-ai/kling-video/v2.5-turbo/pro/text-to-video",   i2v: "fal-ai/kling-video/v2.5-turbo/pro/image-to-video" },
};

const FALLBACK_ORDER: VideoModel[] = ["veo", "seedance", "kling3", "kling25"];

async function callFal(modelId: string, input: Record<string, unknown>): Promise<VideoResult | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = await (fal as any).subscribe(modelId, { input, logs: true });
  const video = result?.data?.video || result?.video;
  return video?.url ? { url: video.url, duration: parseInt(String(input.duration || "10")) } : null;
}

/**
 * 텍스트 → 영상 (폴백 체인)
 */
export async function generateVideo(
  prompt: string,
  options?: { duration?: string; aspectRatio?: "16:9" | "9:16" | "1:1"; model?: VideoModel },
): Promise<VideoResult | null> {
  const input = { prompt, duration: options?.duration || "10", aspect_ratio: options?.aspectRatio || "9:16" };
  const models = options?.model ? [options.model] : FALLBACK_ORDER;

  for (const m of models) {
    try {
      console.log(`[video] t2v ${m} 시도...`);
      const r = await callFal(MODELS[m].t2v, input);
      if (r) { console.log(`[video] ✅ ${m} 성공`); return r; }
    } catch (e) {
      console.error(`[video] ❌ ${m}:`, (e as Error).message?.slice(0, 60));
    }
  }
  return null;
}

/**
 * 이미지 → 영상 (폴백 체인, 퀄리티 최고)
 */
export async function generateVideoFromImage(
  imageUrl: string,
  prompt: string,
  duration: string = "10",
  model?: VideoModel,
): Promise<VideoResult | null> {
  const input = { prompt, image_url: imageUrl, duration, aspect_ratio: "9:16" as const };
  const models = model ? [model] : FALLBACK_ORDER;

  for (const m of models) {
    try {
      console.log(`[video] i2v ${m} 시도...`);
      const r = await callFal(MODELS[m].i2v, input);
      if (r) { console.log(`[video] ✅ ${m} 성공`); return r; }
    } catch (e) {
      console.error(`[video] ❌ ${m}:`, (e as Error).message?.slice(0, 60));
    }
  }
  return null;
}
