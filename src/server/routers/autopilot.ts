import { z } from "zod";
import { router, publicProcedure } from "../trpc/init";
import { db } from "../db/client";
import {
  chameleonAutopilot,
  chameleonCalendar,
  chameleonClients,
  chameleonProspects,
} from "../db/schema";
import { eq, sql, gte, lt, and, desc } from "drizzle-orm";

export const autopilotRouter = router({
  getBriefing: publicProcedure
    .input(
      z.object({
        date: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const today = input.date ?? new Date().toISOString().split("T")[0];

      // 이미 브리핑이 있는지 확인
      const [existing] = await db
        .select()
        .from(chameleonAutopilot)
        .where(eq(chameleonAutopilot.date, today));

      if (existing) {
        return { briefingItems: existing.briefingItems };
      }

      // 오늘의 캘린더 항목 (배포 예정)
      const calendarItems = await db
        .select()
        .from(chameleonCalendar)
        .where(eq(chameleonCalendar.date, today));

      // 미발송 잠재고객 수
      const [prospectCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(chameleonProspects)
        .where(eq(chameleonProspects.contactStatus, "미발송"));

      // 이번 주 업데이트된 고객 수
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const [clientCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(chameleonClients)
        .where(gte(chameleonClients.updatedAt, weekAgo));

      // 브리핑 항목 구성
      const briefingItems: {
        type: string;
        message: string;
        link: string;
        priority: string;
      }[] = [];

      if (calendarItems.length > 0) {
        briefingItems.push({
          type: "배포",
          message: `오늘 배포 예정 콘텐츠 ${calendarItems.length}건: ${calendarItems.map((c) => c.title).join(", ")}`,
          link: "/calendar",
          priority: "높음",
        });
      }

      if (Number(prospectCount.count) > 0) {
        briefingItems.push({
          type: "영업",
          message: `미발송 잠재고객 ${prospectCount.count}명 - DM 발송이 필요합니다`,
          link: "/outbound",
          priority: "중간",
        });
      }

      if (Number(clientCount.count) > 0) {
        briefingItems.push({
          type: "CRM",
          message: `이번 주 활동 고객 ${clientCount.count}명`,
          link: "/crm",
          priority: "낮음",
        });
      }

      if (briefingItems.length === 0) {
        briefingItems.push({
          type: "안내",
          message: "오늘은 특별한 일정이 없습니다. 콘텐츠 기획을 시작해보세요!",
          link: "/calendar",
          priority: "낮음",
        });
      }

      // DB에 저장
      await db.insert(chameleonAutopilot).values({
        date: today,
        briefingItems,
      });

      return { briefingItems };
    }),
});
