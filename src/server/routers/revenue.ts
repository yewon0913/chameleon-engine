import { z } from "zod";
import { router, publicProcedure } from "../trpc/init";
import { db } from "../db/client";
import {
  chameleonRevenue,
  chameleonGoals,
  chameleonClients,
  chameleonProjects,
} from "../db/schema";
import { eq, desc, sql, and, gte, lt } from "drizzle-orm";

export const revenueRouter = router({
  // 대시보드 데이터 전체 조회
  getDashboard: publicProcedure
    .input(z.object({ month: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const now = new Date();
      const targetMonth = input?.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      // 이번 달 시작/끝
      const [year, mon] = targetMonth.split("-").map(Number);
      const monthStart = new Date(year, mon - 1, 1);
      const monthEnd = new Date(year, mon, 1);

      // 전월
      const prevMonthStart = new Date(year, mon - 2, 1);
      const prevMonthEnd = new Date(year, mon - 1, 1);

      // 이번 달 매출
      const currentRevenue = await db
        .select({ total: sql<number>`COALESCE(SUM(${chameleonRevenue.amount}), 0)` })
        .from(chameleonRevenue)
        .where(and(
          gte(chameleonRevenue.createdAt, monthStart),
          lt(chameleonRevenue.createdAt, monthEnd),
        ));

      // 전월 매출
      const prevRevenue = await db
        .select({ total: sql<number>`COALESCE(SUM(${chameleonRevenue.amount}), 0)` })
        .from(chameleonRevenue)
        .where(and(
          gte(chameleonRevenue.createdAt, prevMonthStart),
          lt(chameleonRevenue.createdAt, prevMonthEnd),
        ));

      // 진행중 프로젝트 수
      const activeProjects = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(chameleonProjects)
        .where(sql`${chameleonProjects.status} NOT IN ('완료', '취소')`);

      // 이번 달 신규 고객 수
      const newClients = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(chameleonClients)
        .where(and(
          gte(chameleonClients.createdAt, monthStart),
          lt(chameleonClients.createdAt, monthEnd),
        ));

      // 평균 객단가
      const avgPrice = await db
        .select({ avg: sql<number>`COALESCE(AVG(${chameleonRevenue.amount}), 0)` })
        .from(chameleonRevenue)
        .where(and(
          gte(chameleonRevenue.createdAt, monthStart),
          lt(chameleonRevenue.createdAt, monthEnd),
        ));

      // 최근 6개월 월별 매출
      const sixMonthsAgo = new Date(year, mon - 7, 1);
      const monthlyRevenue = await db
        .select({
          month: sql<string>`TO_CHAR(${chameleonRevenue.createdAt}, 'YYYY-MM')`,
          total: sql<number>`COALESCE(SUM(${chameleonRevenue.amount}), 0)`,
        })
        .from(chameleonRevenue)
        .where(gte(chameleonRevenue.createdAt, sixMonthsAgo))
        .groupBy(sql`TO_CHAR(${chameleonRevenue.createdAt}, 'YYYY-MM')`)
        .orderBy(sql`TO_CHAR(${chameleonRevenue.createdAt}, 'YYYY-MM')`);

      // 채널별 매출
      const byChannel = await db
        .select({
          channel: chameleonRevenue.channel,
          total: sql<number>`COALESCE(SUM(${chameleonRevenue.amount}), 0)`,
        })
        .from(chameleonRevenue)
        .where(and(
          gte(chameleonRevenue.createdAt, monthStart),
          lt(chameleonRevenue.createdAt, monthEnd),
        ))
        .groupBy(chameleonRevenue.channel);

      // 서비스별 매출
      const byService = await db
        .select({
          serviceType: chameleonRevenue.serviceType,
          total: sql<number>`COALESCE(SUM(${chameleonRevenue.amount}), 0)`,
        })
        .from(chameleonRevenue)
        .where(and(
          gte(chameleonRevenue.createdAt, monthStart),
          lt(chameleonRevenue.createdAt, monthEnd),
        ))
        .groupBy(chameleonRevenue.serviceType);

      // 월 목표
      const [goal] = await db
        .select()
        .from(chameleonGoals)
        .where(eq(chameleonGoals.month, targetMonth));

      const currentTotal = Number(currentRevenue[0]?.total ?? 0);
      const prevTotal = Number(prevRevenue[0]?.total ?? 0);
      const changePercent = prevTotal > 0
        ? Math.round(((currentTotal - prevTotal) / prevTotal) * 100)
        : currentTotal > 0 ? 100 : 0;

      return {
        kpi: {
          revenue: currentTotal,
          revenueChange: changePercent,
          activeProjects: Number(activeProjects[0]?.count ?? 0),
          newClients: Number(newClients[0]?.count ?? 0),
          avgPrice: Math.round(Number(avgPrice[0]?.avg ?? 0)),
        },
        monthlyRevenue,
        byChannel,
        byService,
        goal: goal ? { month: goal.month, targetAmount: goal.targetAmount } : null,
        currentMonth: targetMonth,
      };
    }),

  // 수익 목록 (고객별 정산 테이블)
  listRevenue: publicProcedure.query(async () => {
    const rows = await db
      .select({
        id: chameleonRevenue.id,
        amount: chameleonRevenue.amount,
        serviceType: chameleonRevenue.serviceType,
        channel: chameleonRevenue.channel,
        status: chameleonRevenue.status,
        settledAt: chameleonRevenue.settledAt,
        createdAt: chameleonRevenue.createdAt,
        clientName: chameleonClients.name,
        clientId: chameleonRevenue.clientId,
      })
      .from(chameleonRevenue)
      .leftJoin(chameleonClients, eq(chameleonRevenue.clientId, chameleonClients.id))
      .orderBy(desc(chameleonRevenue.createdAt));

    return rows;
  }),

  // 수익 등록
  createRevenue: publicProcedure
    .input(z.object({
      clientId: z.string().uuid().optional(),
      projectId: z.string().uuid().optional(),
      amount: z.number().int().min(0),
      serviceType: z.string().min(1),
      channel: z.enum(["크몽", "직접", "소개", "기타"]).default("직접"),
    }))
    .mutation(async ({ input }) => {
      const [row] = await db
        .insert(chameleonRevenue)
        .values(input)
        .returning();
      return row;
    }),

  // 정산 상태 변경
  updateRevenueStatus: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.enum(["미정산", "정산완료"]),
    }))
    .mutation(async ({ input }) => {
      const [row] = await db
        .update(chameleonRevenue)
        .set({
          status: input.status,
          settledAt: input.status === "정산완료" ? new Date() : null,
        })
        .where(eq(chameleonRevenue.id, input.id))
        .returning();
      return row;
    }),

  // 수익 삭제
  deleteRevenue: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await db.delete(chameleonRevenue).where(eq(chameleonRevenue.id, input.id));
      return { success: true };
    }),

  // 목표 설정/수정
  setGoal: publicProcedure
    .input(z.object({
      month: z.string(),
      targetAmount: z.number().int().min(0),
    }))
    .mutation(async ({ input }) => {
      // upsert
      const existing = await db
        .select()
        .from(chameleonGoals)
        .where(eq(chameleonGoals.month, input.month));

      if (existing.length > 0) {
        const [row] = await db
          .update(chameleonGoals)
          .set({ targetAmount: input.targetAmount })
          .where(eq(chameleonGoals.month, input.month))
          .returning();
        return row;
      }

      const [row] = await db
        .insert(chameleonGoals)
        .values(input)
        .returning();
      return row;
    }),

  // 목표 목록
  listGoals: publicProcedure.query(async () => {
    return db.select().from(chameleonGoals).orderBy(chameleonGoals.month);
  }),
});
