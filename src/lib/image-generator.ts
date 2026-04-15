import { fal } from "./fal-client";

interface ImageResult { url: string; width: number; height: number }

type ImageModel = "flux-pro" | "flux-fast" | "ideogram";

/**
 * 고품질 이미지 (FLUX 2 Pro) — 제품/뷰티/패션
 */
export async function generateImage(
  prompt: string,
  options?: { size?: "square" | "landscape" | "portrait"; model?: ImageModel },
): Promise<ImageResult | null> {
  try {
    const imageSize = options?.size === "portrait" ? "portrait_16_9" : options?.size === "landscape" ? "landscape_16_9" : "square_hd";
    const modelId = options?.model === "ideogram" ? "fal-ai/ideogram/v3" : "fal-ai/flux-2-pro";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await (fal as any).subscribe(modelId, {
      input: { prompt, image_size: imageSize, num_images: 1, safety_tolerance: "5" },
    });
    const img = result?.data?.images?.[0] || result?.images?.[0];
    return img ? { url: img.url, width: img.width || 1024, height: img.height || 1024 } : null;
  } catch (e) { console.error("Image gen error:", e); return null; }
}

/**
 * 빠른 이미지 (FLUX Schnell)
 */
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

/**
 * 업종별 최적 모델 자동 선택
 */
export function selectImageModel(industry: string): ImageModel {
  const ind = industry.toLowerCase();
  if (/음식|카페|커피|베이커리|빵|치킨|피자|분식|한식|중식|일식|양식|디저트|맛|요리/.test(ind)) return "ideogram";
  return "flux-pro";
}
