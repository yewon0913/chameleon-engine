import { z } from "zod";
import { router, publicProcedure } from "../trpc/init";
import { db } from "../db/client";
import { chameleonAbTests } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { chatWithClaude } from "@/lib/claude-api";

export const abtestRouter = router({
  // 테스트 목록
  list: publicProcedure.query(async () => {
    const tests = await db
      .select()
      .from(chameleonAbTests)
      .orderBy(desc(chameleonAbTests.createdAt));
    return tests;
  }),

  // 테스트 생성
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        contentType: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `"${input.title}" 이라는 ${input.contentType} 콘텐츠의 제목을 A/B/C 3가지 버전으로 변형해주세요.

각 버전은 다른 접근 방식을 사용해주세요:
- A: 호기심 유발형
- B: 직접적 혜택 강조형
- C: 감성/스토리텔링형

반드시 아래 JSON 형식으로만 응답해주세요:
{"versionA": "A 버전 제목", "versionB": "B 버전 제목", "versionC": "C 버전 제목"}`;

      const content = await chatWithClaude(
        "당신은 A/B 테스트 및 콘텐츠 최적화 전문가입니다.",
        [{ role: "user", content: prompt }],
      );

      let versions;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        versions = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      } catch {
        versions = {
          versionA: `${input.title} (A)`,
          versionB: `${input.title} (B)`,
          versionC: `${input.title} (C)`,
        };
      }

      const [test] = await db
        .insert(chameleonAbTests)
        .values({
          versionA: versions.versionA,
          versionB: versions.versionB,
          versionC: versions.versionC,
        })
        .returning();

      return test;
    }),

  // 지표 업데이트
  updateMetrics: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        metricsA: z.record(z.string(), z.unknown()).optional(),
        metricsB: z.record(z.string(), z.unknown()).optional(),
        metricsC: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...metrics } = input;
      const updateData: Record<string, unknown> = {};

      if (metrics.metricsA) updateData.metricsA = metrics.metricsA;
      if (metrics.metricsB) updateData.metricsB = metrics.metricsB;
      if (metrics.metricsC) updateData.metricsC = metrics.metricsC;

      const [test] = await db
        .update(chameleonAbTests)
        .set(updateData)
        .where(eq(chameleonAbTests.id, id))
        .returning();

      return test;
    }),

  // 분석
  analyze: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const [test] = await db
        .select()
        .from(chameleonAbTests)
        .where(eq(chameleonAbTests.id, input.id));

      if (!test) throw new Error("테스트를 찾을 수 없습니다");

      const prompt = `아래 A/B/C 테스트 결과를 분석해주세요.

버전 A: ${test.versionA}
지표 A: ${JSON.stringify(test.metricsA)}

버전 B: ${test.versionB}
지표 B: ${JSON.stringify(test.metricsB)}

버전 C: ${test.versionC ?? "없음"}
지표 C: ${JSON.stringify(test.metricsC)}

분석 요청:
1. 어떤 버전이 승리했는지
2. 왜 해당 버전이 더 나은 성과를 냈는지
3. 향후 콘텐츠 제작 시 적용할 인사이트

반드시 아래 JSON 형식으로만 응답해주세요:
{"winner": "A 또는 B 또는 C", "analysis": "분석 내용"}`;

      const content = await chatWithClaude(
        "당신은 A/B 테스트 분석 및 마케팅 데이터 전문가입니다.",
        [{ role: "user", content: prompt }],
      );

      let result;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        result = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      } catch {
        result = { winner: "분석 실패", analysis: content };
      }

      const [updated] = await db
        .update(chameleonAbTests)
        .set({
          winner: result.winner,
          analysis: result.analysis,
        })
        .where(eq(chameleonAbTests.id, input.id))
        .returning();

      return updated;
    }),

  // 삭제
  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await db
        .delete(chameleonAbTests)
        .where(eq(chameleonAbTests.id, input.id));
      return { success: true };
    }),
});
