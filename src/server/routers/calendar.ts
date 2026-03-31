import { z } from "zod";
import { router, publicProcedure } from "../trpc/init";
import { db } from "../db/client";
import { chameleonCalendar } from "../db/schema";
import { eq, desc, and, gte, lt } from "drizzle-orm";
import { chatWithClaude } from "@/lib/claude-api";

export const calendarRouter = router({
  // 월별 캘린더 조회
  listByMonth: publicProcedure
    .input(z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) }))
    .query(async ({ input }) => {
      const firstDay = `${input.month}-01`;
      const [year, month] = input.month.split("-").map(Number);
      const nextMonth = month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, "0")}-01`;

      const items = await db
        .select()
        .from(chameleonCalendar)
        .where(
          and(
            gte(chameleonCalendar.date, firstDay),
            lt(chameleonCalendar.date, nextMonth),
          )
        )
        .orderBy(chameleonCalendar.date);

      return items;
    }),

  // 캘린더 항목 생성
  create: publicProcedure
    .input(
      z.object({
        date: z.string(),
        title: z.string().min(1),
        contentType: z.string(),
        status: z.string().optional(),
        channels: z.array(z.string()).optional(),
        deployTime: z.string().optional(),
        memo: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [item] = await db
        .insert(chameleonCalendar)
        .values(input)
        .returning();
      return item;
    }),

  // 캘린더 항목 수정
  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().optional(),
        contentType: z.string().optional(),
        status: z.string().optional(),
        channels: z.array(z.string()).optional(),
        deployTime: z.string().optional(),
        memo: z.string().optional(),
        date: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const [item] = await db
        .update(chameleonCalendar)
        .set(data)
        .where(eq(chameleonCalendar.id, id))
        .returning();
      return item;
    }),

  // 캘린더 항목 삭제
  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await db
        .delete(chameleonCalendar)
        .where(eq(chameleonCalendar.id, input.id));
      return { success: true };
    }),

  // AI 콘텐츠 기획
  aiPlan: publicProcedure
    .input(
      z.object({
        industry: z.string().min(1),
        target: z.string().min(1),
        contentCount: z.number().int().min(1).max(60),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `${input.industry} 업종의 소상공인을 위한 콘텐츠 캘린더를 기획해주세요.

타겟: ${input.target}
총 ${input.contentCount}개의 콘텐츠를 기획해주세요.

요일별 콘텐츠 유형 추천:
- 월요일: 정보형 콘텐츠
- 화요일: 스토리형 콘텐츠
- 수요일: 비교형 콘텐츠
- 목요일: 후킹형 콘텐츠
- 금요일: 이벤트형 콘텐츠

반드시 아래 JSON 배열 형식으로만 응답해주세요:
[{"date": "YYYY-MM-DD", "title": "콘텐츠 제목", "contentType": "릴스|블로그|카드뉴스|스레드", "channels": ["인스타", "블로그", "틱톡"]}]`;

      const content = await chatWithClaude(
        "당신은 소상공인 마케팅 콘텐츠 기획 전문가입니다.",
        [{ role: "user", content: prompt }],
      );

      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
        return { plan: parsed };
      } catch {
        return { plan: content };
      }
    }),
});
