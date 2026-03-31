import { z } from "zod";
import { router, publicProcedure } from "../trpc/init";
import { db } from "../db/client";
import { chameleonFunnel, chameleonProspects } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { chatWithClaude } from "@/lib/claude-api";

const FUNNEL_STATUSES = [
  "대기", "발송", "읽음", "응답", "전환",
] as const;

const STEP_DAYS = [1, 3, 7, 14, 30];

export const funnelRouter = router({
  // 잠재고객별 퍼널 조회
  listByProspect: publicProcedure
    .input(z.object({ prospectId: z.string().uuid() }))
    .query(async ({ input }) => {
      const steps = await db
        .select()
        .from(chameleonFunnel)
        .where(eq(chameleonFunnel.prospectId, input.prospectId))
        .orderBy(chameleonFunnel.step);
      return steps;
    }),

  // 퍼널 시퀀스 생성
  createSequence: publicProcedure
    .input(z.object({ prospectId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      // 잠재고객 정보 조회
      const [prospect] = await db
        .select()
        .from(chameleonProspects)
        .where(eq(chameleonProspects.id, input.prospectId));

      if (!prospect) throw new Error("잠재고객을 찾을 수 없습니다");

      const prompt = `${prospect.businessType ?? "일반"} 업종의 '${prospect.businessName}' 사장님을 위한 고객 육성 퍼널 메시지 5단계를 작성해주세요.

각 단계:
1단계 (1일차): 첫 인사 및 관심 유도
2단계 (3일차): 가치 제안
3단계 (7일차): 사례/후기 공유
4단계 (14일차): 한정 혜택 제안
5단계 (30일차): 최종 제안

반드시 아래 JSON 배열 형식으로만 응답해주세요:
["1단계 메시지", "2단계 메시지", "3단계 메시지", "4단계 메시지", "5단계 메시지"]`;

      const content = await chatWithClaude(
        "당신은 소상공인 고객 육성 퍼널 전문가입니다. 자연스럽고 친근한 메시지를 작성하세요.",
        [{ role: "user", content: prompt }],
      );

      let messages: string[];
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        messages = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      } catch {
        messages = STEP_DAYS.map(
          (_, i) => `${i + 1}단계 메시지 (자동 생성 실패 - 직접 입력해주세요)`
        );
      }

      const now = new Date();
      const steps = [];

      for (let i = 0; i < STEP_DAYS.length; i++) {
        const scheduledAt = new Date(now);
        scheduledAt.setDate(scheduledAt.getDate() + STEP_DAYS[i]);

        const [step] = await db
          .insert(chameleonFunnel)
          .values({
            prospectId: input.prospectId,
            step: i + 1,
            messageContent: messages[i] ?? `${i + 1}단계 메시지`,
            status: "대기",
            scheduledAt,
          })
          .returning();

        steps.push(step);
      }

      return steps;
    }),

  // 상태 업데이트
  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(FUNNEL_STATUSES),
      })
    )
    .mutation(async ({ input }) => {
      const updateData: Record<string, unknown> = {
        status: input.status,
      };

      if (input.status === "발송") {
        updateData.sentAt = new Date();
      }

      const [step] = await db
        .update(chameleonFunnel)
        .set(updateData)
        .where(eq(chameleonFunnel.id, input.id))
        .returning();

      return step;
    }),

  // 전체 퍼널 목록 (잠재고객 이름 포함)
  listAll: publicProcedure.query(async () => {
    const funnelEntries = await db
      .select({
        funnel: chameleonFunnel,
        prospectName: chameleonProspects.businessName,
      })
      .from(chameleonFunnel)
      .leftJoin(
        chameleonProspects,
        eq(chameleonFunnel.prospectId, chameleonProspects.id)
      )
      .orderBy(chameleonFunnel.scheduledAt);

    return funnelEntries.map((entry) => ({
      ...entry.funnel,
      prospectName: entry.prospectName,
    }));
  }),
});
