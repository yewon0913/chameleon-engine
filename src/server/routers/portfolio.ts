import { z } from "zod";
import { router, publicProcedure } from "../trpc/init";
import { db } from "../db/client";
import { chameleonPortfolio, chameleonClients, chameleonProjects } from "../db/schema";
import { eq, desc, or } from "drizzle-orm";

export const portfolioRouter = router({
  // 포트폴리오 목록
  list: publicProcedure.query(async () => {
    const items = await db
      .select({
        id: chameleonPortfolio.id,
        clientId: chameleonPortfolio.clientId,
        clientName: chameleonClients.name,
        projectSummary: chameleonPortfolio.projectSummary,
        results: chameleonPortfolio.results,
        isPublic: chameleonPortfolio.isPublic,
        slug: chameleonPortfolio.slug,
        createdAt: chameleonPortfolio.createdAt,
      })
      .from(chameleonPortfolio)
      .leftJoin(chameleonClients, eq(chameleonPortfolio.clientId, chameleonClients.id))
      .orderBy(desc(chameleonPortfolio.createdAt));

    return items;
  }),

  // 슬러그로 공개 포트폴리오 조회
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const [item] = await db
        .select({
          id: chameleonPortfolio.id,
          clientId: chameleonPortfolio.clientId,
          clientName: chameleonClients.name,
          projectSummary: chameleonPortfolio.projectSummary,
          results: chameleonPortfolio.results,
          isPublic: chameleonPortfolio.isPublic,
          slug: chameleonPortfolio.slug,
          createdAt: chameleonPortfolio.createdAt,
        })
        .from(chameleonPortfolio)
        .leftJoin(chameleonClients, eq(chameleonPortfolio.clientId, chameleonClients.id))
        .where(eq(chameleonPortfolio.slug, input.slug));

      if (!item || !item.isPublic) throw new Error("포트폴리오를 찾을 수 없습니다");

      return item;
    }),

  // 포트폴리오 생성
  create: publicProcedure
    .input(
      z.object({
        clientId: z.string().uuid().optional(),
        projectSummary: z.string(),
        results: z
          .object({
            followerGrowth: z.string().optional(),
            views: z.string().optional(),
            inquiries: z.string().optional(),
          })
          .optional(),
        isPublic: z.boolean().optional(),
        slug: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [item] = await db
        .insert(chameleonPortfolio)
        .values(input)
        .returning();
      return item;
    }),

  // 포트폴리오 수정
  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        projectSummary: z.string().optional(),
        results: z
          .object({
            followerGrowth: z.string().optional(),
            views: z.string().optional(),
            inquiries: z.string().optional(),
          })
          .optional(),
        isPublic: z.boolean().optional(),
        slug: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const [item] = await db
        .update(chameleonPortfolio)
        .set(data)
        .where(eq(chameleonPortfolio.id, id))
        .returning();
      return item;
    }),

  // 포트폴리오 삭제
  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await db
        .delete(chameleonPortfolio)
        .where(eq(chameleonPortfolio.id, input.id));
      return { success: true };
    }),

  // 완료된 프로젝트 목록 (포트폴리오 자동 수집용)
  listCompleted: publicProcedure.query(async () => {
    const items = await db
      .select({
        id: chameleonProjects.id,
        clientId: chameleonProjects.clientId,
        clientName: chameleonClients.name,
        projectType: chameleonProjects.projectType,
        title: chameleonProjects.title,
        status: chameleonProjects.status,
        createdAt: chameleonProjects.createdAt,
      })
      .from(chameleonProjects)
      .leftJoin(chameleonClients, eq(chameleonProjects.clientId, chameleonClients.id))
      .where(
        or(
          eq(chameleonProjects.status, "완료"),
          eq(chameleonProjects.status, "납품완료")
        )
      )
      .orderBy(desc(chameleonProjects.createdAt));

    return items;
  }),
});
