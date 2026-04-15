import { fal } from "./fal-client";

interface VideoResult { url: string; duration: number }

export async function generateVideo(
  prompt: string,
  options?: { duration?: "5" | "10"; aspectRatio?: "16:9" | "9:16" | "1:1" },
): Promise<VideoResult | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const input: any = { prompt, duration: options?.duration || "5", aspect_ratio: options?.aspectRatio || "16:9" };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await (fal as any).subscribe("fal-ai/kling-video/v1/standard/text-to-video", { input, logs: true });
    const video = result?.data?.video || result?.video;
    return video ? { url: video.url, duration: parseInt(options?.duration || "5") } : null;
  } catch (e) { console.error("Video gen error:", e); return null; }
}

export async function generateVideoFromImage(imageUrl: string, prompt: string, duration: "5" | "10" = "5"): Promise<VideoResult | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await (fal as any).subscribe("fal-ai/kling-video/v2/standard/image-to-video", {
      input: { prompt, image_url: imageUrl, duration, aspect_ratio: "16:9" }, logs: true,
    });
    const video = result?.data?.video || result?.video;
    return video ? { url: video.url, duration: parseInt(duration) } : null;
  } catch (e) { console.error("I2V error:", e); return null; }
}
