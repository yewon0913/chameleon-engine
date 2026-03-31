import { z } from "zod";
import { router, publicProcedure } from "../trpc/init";
import { db } from "../db/client";
import { chameleonClients, chameleonProjects, chameleonNotes, chameleonIntake } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { chatWithClaude } from "@/lib/claude-api";

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

  // 상호명 AI 분석
  analyzeBusiness: publicProcedure
    .input(
      z.object({
        businessName: z.string().min(1),
        region: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `"${input.businessName}"${input.region ? ` (${input.region} 소재)` : ""} 이라는 상호명을 분석해주세요.

반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "businessType": "추정 업종 (카페/음식점/뷰티샵/쇼핑몰/학원/병원/헬스장/펜션/기타 중 택1)",
  "services": "추정 주요 메뉴/서비스 (쉼표로 구분, 3~5개)",
  "target": "추정 주요 타겟 고객층",
  "marketingNeeds": "이 업종에 가장 필요한 마케팅 전략 1줄",
  "reelsTopics": ["릴스/숏폼 주제 추천 1", "릴스/숏폼 주제 추천 2", "릴스/숏폼 주제 추천 3"],
  "recommendedPackage": "추천 마케팅 패키지명 (SNS운영대행/릴스패키지/블로그패키지/통합패키지 중 택1)",
  "estimatedBudget": "추정 월 마케팅 예산 범위 (예: 50~100만원)",
  "competitionLevel": "경쟁 강도 (상/중/하)",
  "approachTip": "이 업체에 영업 제안할 때 핵심 접근 포인트 2~3문장"
}`;

      const content = await chatWithClaude(
        "당신은 소상공인 마케팅 분석 전문가입니다. 상호명만으로 업종, 서비스, 타겟을 정확히 추정합니다. 반드시 유효한 JSON으로만 응답하세요.",
        [{ role: "user", content: prompt }],
      );

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
        return parsed;
      } catch {
        return { error: "분석 실패", raw: content };
      }
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
