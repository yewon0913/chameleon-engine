import { z } from "zod";
import { router, publicProcedure } from "../trpc/init";
import { db } from "../db/client";
import { chameleonProspects } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { chatWithClaude } from "@/lib/claude-api";

const CONTACT_STATUSES = [
  "미발송", "발송완료", "응답받음", "미팅예약", "계약완료",
] as const;

export const outboundRouter = router({
  // 잠재고객 목록
  listProspects: publicProcedure.query(async () => {
    const prospects = await db
      .select()
      .from(chameleonProspects)
      .orderBy(desc(chameleonProspects.createdAt));
    return prospects;
  }),

  // 잠재고객 생성
  createProspect: publicProcedure
    .input(
      z.object({
        businessName: z.string().min(1),
        businessType: z.string().optional(),
        region: z.string().optional(),
        instagramHandle: z.string().optional(),
        followers: z.number().int().optional(),
        lastPostDate: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [prospect] = await db
        .insert(chameleonProspects)
        .values(input)
        .returning();
      return prospect;
    }),

  // 연락 상태 변경
  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        contactStatus: z.enum(CONTACT_STATUSES),
      })
    )
    .mutation(async ({ input }) => {
      // 현재 상태 확인
      const [current] = await db
        .select()
        .from(chameleonProspects)
        .where(eq(chameleonProspects.id, input.id));

      if (!current) throw new Error("잠재고객을 찾을 수 없습니다");

      const updateData: Record<string, unknown> = {
        contactStatus: input.contactStatus,
      };

      // 미발송에서 다른 상태로 변경 시 발송 시각 기록
      if (current.contactStatus === "미발송" && input.contactStatus !== "미발송") {
        updateData.messageSentAt = new Date();
      }

      const [prospect] = await db
        .update(chameleonProspects)
        .set(updateData)
        .where(eq(chameleonProspects.id, input.id))
        .returning();
      return prospect;
    }),

  // 잠재고객 삭제
  deleteProspect: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await db
        .delete(chameleonProspects)
        .where(eq(chameleonProspects.id, input.id));
      return { success: true };
    }),

  // AI 영업 메시지 생성
  generateMessage: publicProcedure
    .input(
      z.object({
        businessType: z.string().min(1),
        businessName: z.string().min(1),
        instagramHandle: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const systemPrompt =
        "당신은 소상공인 마케팅 영업 전문가입니다. 자연스럽고 친근한 DM/이메일 제안 메시지를 작성하세요.";

      let prompt = `${input.businessType} 업종의 '${input.businessName}' 사장님께 보낼 마케팅 제안 DM 메시지를 작성해주세요. 인스타 릴스 무료 체험 제안 포함. 150자 내외로 짧고 친근하게.`;

      if (input.instagramHandle) {
        prompt += ` 참고: 해당 업체의 인스타그램 계정은 @${input.instagramHandle}입니다.`;
      }

      const message = await chatWithClaude(systemPrompt, [
        { role: "user", content: prompt },
      ]);

      return { message };
    }),

  // 잠재고객 일괄 등록
  bulkCreate: publicProcedure
    .input(
      z.object({
        prospects: z.array(
          z.object({
            businessName: z.string().min(1),
            businessType: z.string().optional(),
            region: z.string().optional(),
            instagramHandle: z.string().optional(),
            followers: z.number().int().optional(),
            lastPostDate: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const inserted = await db
        .insert(chameleonProspects)
        .values(input.prospects)
        .returning();
      return { count: inserted.length };
    }),
});
