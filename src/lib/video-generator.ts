import { fal } from "./fal-client";

interface VideoResult { url: string; duration: number }

export type VideoModel = "veo" | "seedance" | "kling3" | "kling25";

const MODELS: Record<VideoModel, { t2v: string; i2v: string }> = {
  veo:      { t2v: "fal-ai/veo3.1/fast",                                  i2v: "fal-ai/veo3.1/fast/image-to-video" },
  seedance: { t2v: "fal-ai/seedance-2.0",                                i2v: "fal-ai/seedance-2.0/image-to-video" },
  kling3:   { t2v: "fal-ai/kling-video/v2.5-turbo/pro/text-to-video",   i2v: "fal-ai/kling-video/v2.5-turbo/pro/image-to-video" },
  kling25:  { t2v: "fal-ai/kling-video/v2.5-turbo/pro/text-to-video",   i2v: "fal-ai/kling-video/v2.5-turbo/pro/image-to-video" },
};

const FALLBACK: VideoModel[] = ["veo", "kling3", "kling25"];

function buildInput(model: VideoModel, base: Record<string, unknown>): Record<string, unknown> {
  if (model === "veo") {
    return { ...base, duration: "8s", generate_audio: true, resolution: "720p", aspect_ratio: base.aspect_ratio || "9:16" };
  }
  if (model === "seedance") {
    return { ...base, duration: "8s", generate_audio: true, aspect_ratio: base.aspect_ratio || "9:16" };
  }
  // Kling: duration은 숫자 문자열 ("5" or "10")
  const dur = String(base.duration || "10");
  return { ...base, duration: (dur === "5") ? "5" : "10", aspect_ratio: base.aspect_ratio || "9:16" };
}

async function callFal(modelId: string, input: Record<string, unknown>): Promise<VideoResult | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = await (fal as any).subscribe(modelId, { input, logs: true });
  const video = result?.data?.video || result?.video;
  return video?.url ? { url: video.url, duration: 10 } : null;
}

async function tryModels(type: "t2v" | "i2v", base: Record<string, unknown>, preferred?: VideoModel): Promise<VideoResult | null> {
  const order: VideoModel[] = preferred ? [preferred, ...FALLBACK.filter(m => m !== preferred)] : FALLBACK;

  for (const m of order) {
    try {
      const input = buildInput(m, base);
      console.log(`[video] ${type} ${m} 시도...`);
      const r = await callFal(MODELS[m][type], input);
      if (r) { console.log(`[video] ✅ ${m}`); return r; }
    } catch (e) {
      console.error(`[video] ❌ ${m}:`, (e as Error).message?.slice(0, 60));
    }
  }
  return null;
}

export async function generateVideo(
  prompt: string,
  options?: { duration?: string; aspectRatio?: "16:9" | "9:16" | "1:1"; model?: VideoModel },
): Promise<VideoResult | null> {
  return tryModels("t2v", { prompt, duration: options?.duration, aspect_ratio: options?.aspectRatio }, options?.model);
}

export async function generateVideoFromImage(
  imageUrl: string,
  prompt: string,
  duration: string = "10",
  model?: VideoModel,
): Promise<VideoResult | null> {
  return tryModels("i2v", { prompt, image_url: imageUrl, duration, aspect_ratio: "9:16" }, model);
}
