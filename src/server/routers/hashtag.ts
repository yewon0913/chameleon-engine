import { z } from "zod";
import { router, publicProcedure } from "../trpc/init";
import { chatWithClaude } from "@/lib/claude-api";

export const hashtagRouter = router({
  generate: publicProcedure
    .input(
      z.object({
        industry: z.string().min(1),
        region: z.string().optional(),
        keywords: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const regionContext = input.region
        ? `지역: ${input.region}\n`
        : "";

      const prompt = `${regionContext}업종: ${input.industry}
키워드: ${input.keywords}

위 정보를 바탕으로 SNS 해시태그를 최적화해주세요.

요청:
1. 총 30개의 해시태그와 각 해시태그의 경쟁도 (높음/중간/낮음)
2. 채널별 최적화 세트:
   - 인스타그램용 30개
   - 틱톡용 5개
   - 유튜브용 15개

반드시 아래 JSON 형식으로만 응답해주세요:
{"hashtags": [{"tag": "#해시태그", "competition": "높음"}], "instagram": "#해시태그1 #해시태그2 ...", "tiktok": "#해시태그1 #해시태그2 ...", "youtube": "#해시태그1 #해시태그2 ..."}`;

      const content = await chatWithClaude(
        "당신은 SNS 해시태그 최적화 전문가입니다.",
        [{ role: "user", content: prompt }],
      );

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
        return { result: parsed };
      } catch {
        return { result: content };
      }
    }),
});
