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
        year: z.number().int(),
        month: z.number().int().min(1).max(12),
        industry: z.string().min(1),
        target: z.string().min(1),
        contentCount: z.number().int().min(1).max(60),
      })
    )
    .mutation(async ({ input }) => {
      const daysInMonth = new Date(input.year, input.month, 0).getDate();
      const monthStr = `${input.year}-${String(input.month).padStart(2, "0")}`;

      const prompt = `${input.industry} 업종의 소상공인을 위한 ${input.year}년 ${input.month}월 콘텐츠 캘린더를 기획해주세요.

기간: ${monthStr}-01 ~ ${monthStr}-${String(daysInMonth).padStart(2, "0")}
타겟: ${input.target}
총 ${input.contentCount}개의 콘텐츠를 기획해주세요.

중요 규칙:
- 모든 date는 반드시 "${monthStr}-DD" 형식 (DD는 01~${String(daysInMonth).padStart(2, "0")})
- 주말 포함 골고루 배치
- contentType: "릴스", "블로그", "카드뉴스", "스레드", "인스타", "틱톡", "유튜브" 중 택1
- channels: ["인스타", "틱톡", "유튜브", "스레드", "블로그"] 중 복수 선택

요일별 콘텐츠 유형 추천:
- 월요일: 정보형 콘텐츠 (블로그, 카드뉴스)
- 화요일: 스토리형 콘텐츠 (릴스, 스레드)
- 수요일: 비교형 콘텐츠 (카드뉴스)
- 목요일: 후킹형 콘텐츠 (릴스, 틱톡)
- 금요일: 이벤트/프로모션 콘텐츠
- 토/일: 감성/브이로그형

반드시 아래 JSON 배열 형식으로만 응답해주세요 (다른 텍스트 없이):
[{"date": "${monthStr}-01", "title": "콘텐츠 제목", "contentType": "릴스", "channels": ["인스타", "틱톡"]}]`;

      const content = await chatWithClaude(
        "당신은 소상공인 마케팅 콘텐츠 기획 전문가입니다. 반드시 유효한 JSON 배열로만 응답하세요.",
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

  // 일괄 생성
  batchCreate: publicProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            date: z.string(),
            title: z.string().min(1),
            contentType: z.string(),
            status: z.string().optional(),
            channels: z.array(z.string()).optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      if (input.items.length === 0) return [];
      const created = await db
        .insert(chameleonCalendar)
        .values(
          input.items.map((item) => ({
            ...item,
            status: item.status || "기획",
          }))
        )
        .returning();
      return created;
    }),
});
