import { z } from "zod";
import { router, publicProcedure } from "../trpc/init";
import { db } from "../db/client";
import { chameleonDeploys, chameleonCalendar } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { chatWithClaude } from "@/lib/claude-api";
import { publishContent, getProfiles } from "@/lib/social/buffer-client";

export const deployRouter = router({
  // 배포 목록 (캘린더 정보 포함)
  listDeploys: publicProcedure.query(async () => {
    const deploys = await db
      .select({
        deploy: chameleonDeploys,
        calendar: {
          title: chameleonCalendar.title,
          contentType: chameleonCalendar.contentType,
          date: chameleonCalendar.date,
        },
      })
      .from(chameleonDeploys)
      .leftJoin(
        chameleonCalendar,
        eq(chameleonDeploys.calendarId, chameleonCalendar.id),
      )
      .orderBy(desc(chameleonDeploys.createdAt));

    return deploys;
  }),

  // 배포 대기 콘텐츠 목록 (상태가 '완료'인 캘린더 항목)
  listPendingContent: publicProcedure.query(async () => {
    const items = await db
      .select()
      .from(chameleonCalendar)
      .where(eq(chameleonCalendar.status, "완료"))
      .orderBy(desc(chameleonCalendar.date));

    return items;
  }),

  // 배포 생성
  createDeploy: publicProcedure
    .input(
      z.object({
        calendarId: z.string().uuid(),
        channel: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const [deploy] = await db
        .insert(chameleonDeploys)
        .values(input)
        .returning();
      return deploy;
    }),

  // 배포 상태 변경
  updateDeployStatus: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(["대기", "배포완료", "실패"]),
      }),
    )
    .mutation(async ({ input }) => {
      const updateData: Record<string, unknown> = { status: input.status };
      if (input.status === "배포완료") {
        updateData.deployedAt = new Date();
      }

      const [deploy] = await db
        .update(chameleonDeploys)
        .set(updateData)
        .where(eq(chameleonDeploys.id, input.id))
        .returning();
      return deploy;
    }),

  // 성과 지표 업데이트
  updateMetrics: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        metricsViews: z.number().int().optional(),
        metricsLikes: z.number().int().optional(),
        metricsComments: z.number().int().optional(),
        metricsShares: z.number().int().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...metrics } = input;
      const updateData: Record<string, unknown> = {};
      if (metrics.metricsViews !== undefined) updateData.metricsViews = metrics.metricsViews;
      if (metrics.metricsLikes !== undefined) updateData.metricsLikes = metrics.metricsLikes;
      if (metrics.metricsComments !== undefined) updateData.metricsComments = metrics.metricsComments;
      if (metrics.metricsShares !== undefined) updateData.metricsShares = metrics.metricsShares;

      const [deploy] = await db
        .update(chameleonDeploys)
        .set(updateData)
        .where(eq(chameleonDeploys.id, id))
        .returning();
      return deploy;
    }),

  // 배포 삭제
  deleteDeploy: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await db
        .delete(chameleonDeploys)
        .where(eq(chameleonDeploys.id, input.id));
      return { success: true };
    }),

  // 채널별 콘텐츠 최적화
  optimizeForChannel: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        channel: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const channelGuides: Record<string, string> = {
        인스타: "캡션 150자 이내 + 해시태그 5개를 생성해주세요.",
        틱톡: "캡션 300자 이내 + 화면텍스트로 사용할 키워드를 생성해주세요.",
        유튜브: "제목 70자 이내 + 설명 5000자 이내 + 태그 15개를 생성해주세요.",
        스레드: "500자 이내 + 태그 1개를 생성해주세요.",
        블로그: "SEO 최적화된 본문 + 메타 디스크립션을 생성해주세요.",
      };

      const guide = channelGuides[input.channel] || "해당 채널에 맞게 최적화해주세요.";

      const prompt = `다음 콘텐츠를 "${input.channel}" 채널에 맞게 최적화해주세요.

채널 가이드: ${guide}

제목: ${input.title}

원본 콘텐츠:
${input.content}`;

      const content = await chatWithClaude(
        "당신은 SNS 채널별 콘텐츠 최적화 전문가입니다.",
        [{ role: "user", content: prompt }],
      );

      return { content };
    }),

  // Buffer 프로필 목록 조회
  getBufferProfiles: publicProcedure
    .input(z.object({ token: z.string().min(1) }))
    .query(async ({ input }) => {
      const profiles = await getProfiles(input.token);
      return profiles;
    }),

  // Buffer로 SNS 게시
  publishToBuffer: publicProcedure
    .input(
      z.object({
        token: z.string().min(1),
        profileIds: z.array(z.string()).min(1),
        title: z.string().min(1),
        body: z.string().min(1),
        hashtags: z.array(z.string()).default([]),
        deployId: z.string().uuid().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await publishContent(input.token, input.profileIds, {
        title: input.title,
        body: input.body,
        hashtags: input.hashtags,
      });

      // 배포 ID가 있으면 상태를 배포완료로 업데이트
      if (input.deployId) {
        await db
          .update(chameleonDeploys)
          .set({ status: "배포완료", deployedAt: new Date() })
          .where(eq(chameleonDeploys.id, input.deployId));
      }

      return result;
    }),
});
