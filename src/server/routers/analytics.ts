import { z } from "zod";
import { router, publicProcedure } from "../trpc/init";
import { chatWithClaude } from "@/lib/claude-api";

export const analyticsRouter = router({
  analyzeCompetitor: publicProcedure
    .input(
      z.object({
        industry: z.string(),
        region: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { industry, region } = input;
      const userPrompt = `${industry} 업종${region ? ` (${region} 지역)` : ""}의 SNS 마케팅 트렌드를 분석해주세요:\n1. 인기 콘텐츠 유형 Top 5\n2. 효과적인 해시태그 10개\n3. 최적 게시 빈도\n4. 이 업종에서 잘 되는 콘텐츠 특징\n5. 경쟁사 대비 차별화 전략`;

      const analysis = await chatWithClaude(
        "당신은 소상공인 SNS 마케팅 분석 전문가입니다. 업종별 인스타그램/틱톡 트렌드를 분석하고 실행 가능한 인사이트를 제공하세요.",
        [{ role: "user", content: userPrompt }],
      );

      return { analysis };
    }),

  predictPerformance: publicProcedure
    .input(
      z.object({
        title: z.string(),
        contentType: z.string(),
        industry: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { title, contentType, industry } = input;
      const userPrompt = `다음 SNS 콘텐츠의 성과를 예측해주세요:\n- 제목: ${title}\n- 콘텐츠 유형: ${contentType}${industry ? `\n- 업종: ${industry}` : ""}\n\n다음 항목을 분석해주세요:\n1. 예상 조회수 및 참여율\n2. A/B 테스트용 대체 제목 3개 제안\n3. 업종별 최적 업로드 시간 추천`;

      const prediction = await chatWithClaude(
        "당신은 SNS 콘텐츠 성과 예측 전문가입니다.",
        [{ role: "user", content: userPrompt }],
      );

      return { prediction };
    }),

  getTrends: publicProcedure
    .input(
      z.object({
        industry: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { industry } = input;
      const userPrompt = `${industry} 업종의 최신 마케팅 트렌드를 분석해주세요:\n1. 업종별 인기 키워드 변화\n2. "지금 만들면 좋은 콘텐츠" 3개 추천\n3. 주간 트렌드 요약`;

      const trends = await chatWithClaude(
        "당신은 최신 마케팅 트렌드 분석가입니다.",
        [{ role: "user", content: userPrompt }],
      );

      return { trends };
    }),
});
