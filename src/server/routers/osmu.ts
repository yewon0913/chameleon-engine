import { z } from "zod";
import { router, publicProcedure } from "../trpc/init";
import { chatWithClaude } from "@/lib/claude-api";

export const osmuRouter = router({
  transform: publicProcedure
    .input(
      z.object({
        content: z.string().min(1),
        industry: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const industryContext = input.industry
        ? `업종: ${input.industry}\n`
        : "";

      const prompt = `${industryContext}아래 원본 콘텐츠를 5가지 버전으로 변환해주세요.

원본 콘텐츠:
${input.content}

변환 요청:
1. 스레드 요약 (500자)
2. 인스타 캡션 (150자 + 해시태그 5개)
3. 카드뉴스 텍스트 (5~10장 슬라이드)
4. 릴스 스크립트 (30초)
5. 유튜브 쇼츠 스크립트

반드시 아래 JSON 형식으로만 응답해주세요:
{"thread": "...", "instagram": "...", "cardNews": "...", "reels": "...", "shorts": "..."}`;

      const content = await chatWithClaude(
        "당신은 원소스 멀티유즈(OSMU) 콘텐츠 변환 전문가입니다.",
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
