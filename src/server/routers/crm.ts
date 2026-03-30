import { z } from "zod";
import { router, publicProcedure } from "../trpc/init";
import { db } from "../db/client";
import { chameleonClients, chameleonProjects, chameleonNotes, chameleonIntake } from "../db/schema";
import { eq, desc } from "drizzle-orm";

const CLIENT_STATUSES = [
  "문의", "상담중", "견적발송", "계약완료", "제작중", "납품완료", "사후관리",
] as const;

export const crmRouter = router({
  // 고객 목록
  listClients: publicProcedure.query(async () => {
    const clients = await db
      .select()
      .from(chameleonClients)
      .orderBy(desc(chameleonClients.updatedAt));

    const projects = await db.select().from(chameleonProjects);

    return clients.map((c) => ({
      ...c,
      projects: projects.filter((p) => p.clientId === c.id),
    }));
  }),

  // 고객 상세
  getClient: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const [client] = await db
        .select()
        .from(chameleonClients)
        .where(eq(chameleonClients.id, input.id));

      if (!client) throw new Error("고객을 찾을 수 없습니다");

      const projects = await db
        .select()
        .from(chameleonProjects)
        .where(eq(chameleonProjects.clientId, input.id))
        .orderBy(desc(chameleonProjects.createdAt));

      const notes = await db
        .select()
        .from(chameleonNotes)
        .where(eq(chameleonNotes.clientId, input.id))
        .orderBy(desc(chameleonNotes.createdAt));

      return { ...client, projects, notes };
    }),

  // 고객 생성
  createClient: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        phone: z.string().optional(),
        businessType: z.string().optional(),
        businessName: z.string().optional(),
        snsInstagram: z.string().optional(),
        snsTiktok: z.string().optional(),
        snsYoutube: z.string().optional(),
        snsBlog: z.string().optional(),
        marketingGoal: z.string().optional(),
        monthlyBudget: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [client] = await db
        .insert(chameleonClients)
        .values(input)
        .returning();
      return client;
    }),

  // 고객 상태 변경
  updateClientStatus: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(CLIENT_STATUSES),
      })
    )
    .mutation(async ({ input }) => {
      const [client] = await db
        .update(chameleonClients)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(chameleonClients.id, input.id))
        .returning();
      return client;
    }),

  // 고객 정보 수정
  updateClient: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        phone: z.string().optional(),
        businessType: z.string().optional(),
        businessName: z.string().optional(),
        snsInstagram: z.string().optional(),
        snsTiktok: z.string().optional(),
        snsYoutube: z.string().optional(),
        snsBlog: z.string().optional(),
        marketingGoal: z.string().optional(),
        monthlyBudget: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const [client] = await db
        .update(chameleonClients)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(chameleonClients.id, id))
        .returning();
      return client;
    }),

  // 고객 삭제
  deleteClient: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await db
        .delete(chameleonClients)
        .where(eq(chameleonClients.id, input.id));
      return { success: true };
    }),

  // 프로젝트 추가
  createProject: publicProcedure
    .input(
      z.object({
        clientId: z.string().uuid(),
        projectType: z.string().min(1),
        title: z.string().optional(),
        quantity: z.number().int().min(1).default(1),
        unitPrice: z.number().int().min(0).default(0),
        deadline: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [project] = await db
        .insert(chameleonProjects)
        .values(input)
        .returning();
      await db
        .update(chameleonClients)
        .set({ updatedAt: new Date() })
        .where(eq(chameleonClients.id, input.clientId));
      return project;
    }),

  // 프로젝트 진행률 업데이트
  updateProject: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        progress: z.number().int().min(0).max(100).optional(),
        status: z.string().optional(),
        deadline: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const [project] = await db
        .update(chameleonProjects)
        .set(data)
        .where(eq(chameleonProjects.id, id))
        .returning();
      return project;
    }),

  // 프로젝트 삭제
  deleteProject: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await db
        .delete(chameleonProjects)
        .where(eq(chameleonProjects.id, input.id));
      return { success: true };
    }),

  // 상담 메모 추가
  addNote: publicProcedure
    .input(
      z.object({
        clientId: z.string().uuid(),
        content: z.string().min(1),
        nextAction: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [note] = await db
        .insert(chameleonNotes)
        .values(input)
        .returning();
      await db
        .update(chameleonClients)
        .set({ updatedAt: new Date() })
        .where(eq(chameleonClients.id, input.clientId));
      return note;
    }),

  // 설문 제출 (intake)
  submitIntake: publicProcedure
    .input(
      z.object({
        clientName: z.string().min(1),
        phone: z.string().optional(),
        businessType: z.string().optional(),
        snsChannels: z.record(z.string(), z.string()).optional(),
        currentMarketing: z.string().optional(),
        desiredServices: z.array(z.string()).optional(),
        goals: z.array(z.string()).optional(),
        budget: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [intake] = await db
        .insert(chameleonIntake)
        .values(input)
        .returning();

      // 자동으로 고객 테이블에도 생성
      await db.insert(chameleonClients).values({
        name: input.clientName,
        phone: input.phone,
        businessType: input.businessType,
        snsInstagram: input.snsChannels?.instagram,
        snsTiktok: input.snsChannels?.tiktok,
        snsYoutube: input.snsChannels?.youtube,
        snsBlog: input.snsChannels?.blog,
        marketingGoal: input.goals?.join(", "),
        monthlyBudget: input.budget,
        status: "문의",
      });

      return intake;
    }),
});
