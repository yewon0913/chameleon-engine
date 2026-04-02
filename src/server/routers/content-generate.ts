import { z } from "zod";
import { router, publicProcedure } from "../trpc/init";
import { generateImage, generateImageFast } from "@/lib/image-generator";
import { generateVideo } from "@/lib/video-generator";

export const contentGenerateRouter = router({
  generateImage: publicProcedure
    .input(z.object({ prompt: z.string().min(1), quality: z.enum(["fast", "pro"]).default("pro"), size: z.enum(["square", "landscape", "portrait"]).default("square") }))
    .mutation(async ({ input }) => {
      const result = input.quality === "fast" ? await generateImageFast(input.prompt) : await generateImage(input.prompt, { size: input.size });
      if (!result) throw new Error("이미지 생성 실패");
      return result;
    }),

  generateVideo: publicProcedure
    .input(z.object({ prompt: z.string().min(1), duration: z.enum(["5", "10"]).default("5"), aspectRatio: z.enum(["16:9", "9:16", "1:1"]).default("16:9") }))
    .mutation(async ({ input }) => {
      const result = await generateVideo(input.prompt, { duration: input.duration, aspectRatio: input.aspectRatio });
      if (!result) throw new Error("영상 생성 실패");
      return result;
    }),

  generateReels: publicProcedure
    .input(z.object({ industry: z.string(), style: z.string(), productName: z.string(), message: z.string().optional() }))
    .mutation(async ({ input }) => {
      const imgPrompt = `Professional ${input.industry} photography, ${input.productName}, high-quality commercial, clean background, studio lighting, 4K`;
      const vidPrompt = buildVideoPrompt(input);

      const [thumbnail, video] = await Promise.allSettled([
        generateImage(imgPrompt, { size: "portrait" }),
        generateVideo(vidPrompt, { duration: "5", aspectRatio: "9:16" }),
      ]);

      return {
        thumbnail: thumbnail.status === "fulfilled" ? thumbnail.value : null,
        video: video.status === "fulfilled" ? video.value : null,
        script: { hook: `${input.productName}, 아직도 모르세요?`, body: input.message || `${input.industry}에서 ${input.productName}이(가) 특별한 이유`, cta: "지금 바로 확인! 프로필 링크 👆" },
        hashtags: genTags(input.industry, input.productName),
        caption: `✨ ${input.productName}\n\n${input.message || `${input.industry}의 새로운 기준`}\n\n💡 프로필 링크에서 확인!\n\n#${input.industry} #소상공인 #릴스`,
      };
    }),
});

function buildVideoPrompt(input: { industry: string; style: string; productName: string }): string {
  const m: Record<string, string> = {
    푸드: `Cinematic close-up of ${input.productName}, steam rising, warm golden lighting, shallow DOF, slow pan, appetizing, 4K`,
    뷰티: `Beauty editorial shot of ${input.productName}, soft diffused lighting, slow orbit, clean background, magazine aesthetic, 4K`,
    제품: `Minimalist product shot of ${input.productName}, smooth dolly in, soft studio lighting, premium brand aesthetic, 4K`,
  };
  for (const [k, v] of Object.entries(m)) if (input.style.includes(k) || input.industry.includes(k)) return v;
  return `Professional cinematic shot of ${input.productName}, smooth camera, beautiful lighting, commercial quality, 4K`;
}

function genTags(industry: string, product: string): string[] {
  const base = ["소상공인", "자영업자", "매장홍보", "릴스", "AI콘텐츠"];
  const m: Record<string, string[]> = {
    음식: ["맛집", "맛스타그램", "먹스타그램", "음식사진"],
    카페: ["카페추천", "카페스타그램", "디저트", "커피"],
    미용: ["헤어스타일", "뷰티", "헤어살롱"],
    네일: ["네일아트", "젤네일", "네일스타그램"],
    꽃: ["꽃다발", "플라워", "꽃스타그램"],
  };
  let tags = [...base];
  for (const [k, v] of Object.entries(m)) if (industry.includes(k)) { tags.push(...v); break; }
  tags.push(product.replace(/\s/g, ""));
  return tags.slice(0, 30);
}
