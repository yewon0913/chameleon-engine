import { fal } from "./fal-client";

interface ImageResult { url: string; width: number; height: number }

export async function generateImage(
  prompt: string,
  options?: { size?: "square" | "landscape" | "portrait" },
): Promise<ImageResult | null> {
  try {
    const imageSize = options?.size === "portrait" ? "portrait_16_9" : options?.size === "landscape" ? "landscape_16_9" : "square_hd";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await (fal as any).subscribe("fal-ai/flux-2-pro", {
      input: { prompt, image_size: imageSize, num_images: 1, safety_tolerance: "5" },
    });
    const img = result?.data?.images?.[0] || result?.images?.[0];
    return img ? { url: img.url, width: img.width || 1024, height: img.height || 1024 } : null;
  } catch (e) { console.error("Image gen error:", e); return null; }
}

export async function generateImageFast(prompt: string): Promise<ImageResult | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await (fal as any).subscribe("fal-ai/flux/schnell", {
      input: { prompt, image_size: "square_hd", num_images: 1 },
    });
    const img = result?.data?.images?.[0] || result?.images?.[0];
    return img ? { url: img.url, width: img.width || 1024, height: img.height || 1024 } : null;
  } catch (e) { console.error("Fast image gen error:", e); return null; }
}
