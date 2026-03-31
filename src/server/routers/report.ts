import { z } from "zod";
import { router, publicProcedure } from "../trpc/init";
import { db } from "../db/client";
import {
  chameleonClients,
  chameleonProjects,
  chameleonDeploys,
  chameleonCalendar,
} from "../db/schema";
import { eq, desc, and, gte, lt, sql } from "drizzle-orm";
import { chatWithClaude } from "@/lib/claude-api";

export const reportRouter = router({
  // 성과 리포트 생성
  generateReport: publicProcedure
    .input(
      z.object({
        clientId: z.string().uuid(),
        period: z.enum(["weekly", "monthly"]),
        month: z.string().optional(), // YYYY-MM
      })
    )
    .mutation(async ({ input }) => {
      // 고객 정보 조회
      const [client] = await db
        .select()
        .from(chameleonClients)
        .where(eq(chameleonClients.id, input.clientId));

      if (!client) throw new Error("고객을 찾을 수 없습니다");

      // 프로젝트 조회
      const projects = await db
        .select()
        .from(chameleonProjects)
        .where(eq(chameleonProjects.clientId, input.clientId))
        .orderBy(desc(chameleonProjects.createdAt));

      // 기간 계산
      const now = new Date();
      const targetMonth = input.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      let startDate: string;
      let endDate: string;

      if (input.period === "monthly") {
        startDate = `${targetMonth}-01`;
        const [year, month] = targetMonth.split("-").map(Number);
        const nextMonth = month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, "0")}`;
        endDate = `${nextMonth}-01`;
      } else {
        // weekly: 최근 7일
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        startDate = weekAgo.toISOString().split("T")[0];
        endDate = now.toISOString().split("T")[0];
      }

      // 배포 성과 조회 (deploys + calendar 조인)
      const deploys = await db
        .select({
          id: chameleonDeploys.id,
          channel: chameleonDeploys.channel,
          status: chameleonDeploys.status,
          metricsViews: chameleonDeploys.metricsViews,
          metricsLikes: chameleonDeploys.metricsLikes,
          metricsComments: chameleonDeploys.metricsComments,
          metricsShares: chameleonDeploys.metricsShares,
          deployedAt: chameleonDeploys.deployedAt,
          calendarTitle: chameleonCalendar.title,
          calendarDate: chameleonCalendar.date,
          contentType: chameleonCalendar.contentType,
        })
        .from(chameleonDeploys)
        .innerJoin(
          chameleonCalendar,
          eq(chameleonDeploys.calendarId, chameleonCalendar.id)
        )
        .where(
          and(
            gte(chameleonCalendar.date, startDate),
            lt(chameleonCalendar.date, endDate)
          )
        )
        .orderBy(desc(chameleonCalendar.date));

      // 요약 데이터 구성
      const totalViews = deploys.reduce((sum, d) => sum + (d.metricsViews || 0), 0);
      const totalLikes = deploys.reduce((sum, d) => sum + (d.metricsLikes || 0), 0);
      const totalComments = deploys.reduce((sum, d) => sum + (d.metricsComments || 0), 0);
      const totalShares = deploys.reduce((sum, d) => sum + (d.metricsShares || 0), 0);

      const summary = {
        clientName: client.name,
        businessName: client.businessName,
        businessType: client.businessType,
        period: input.period === "monthly" ? `${targetMonth} 월간` : "최근 1주",
        projectCount: projects.length,
        projects: projects.map((p) => ({
          type: p.projectType,
          title: p.title,
          status: p.status,
          progress: p.progress,
        })),
        deployCount: deploys.length,
        deploys: deploys.map((d) => ({
          title: d.calendarTitle,
          date: d.calendarDate,
          channel: d.channel,
          contentType: d.contentType,
          views: d.metricsViews,
          likes: d.metricsLikes,
          comments: d.metricsComments,
          shares: d.metricsShares,
        })),
        totals: {
          views: totalViews,
          likes: totalLikes,
          comments: totalComments,
          shares: totalShares,
        },
      };

      const userPrompt = `다음 데이터를 기반으로 ${summary.period} 성과 리포트를 작성해주세요.

고객 정보:
- 이름: ${summary.clientName}
- 상호: ${summary.businessName || "미등록"}
- 업종: ${summary.businessType || "미등록"}

프로젝트 현황 (${summary.projectCount}건):
${summary.projects.map((p) => `- [${p.status}] ${p.type} ${p.title || ""} (진행률 ${p.progress}%)`).join("\n")}

콘텐츠 배포 현황 (${summary.deployCount}건):
${summary.deploys.map((d) => `- ${d.date} | ${d.title} | ${d.channel} | ${d.contentType} | 조회 ${d.views} / 좋아요 ${d.likes} / 댓글 ${d.comments} / 공유 ${d.shares}`).join("\n")}

전체 성과 합계:
- 총 조회수: ${summary.totals.views}
- 총 좋아요: ${summary.totals.likes}
- 총 댓글: ${summary.totals.comments}
- 총 공유: ${summary.totals.shares}

다음 내용을 포함해서 리포트를 작성해주세요:
1. 이번 ${input.period === "monthly" ? "달" : "주"} 콘텐츠 요약
2. 주요 성과
3. 베스트 콘텐츠 Top 3
4. 다음 기간 전략 제안`;

      const report = await chatWithClaude(
        "당신은 마케팅 성과 리포트 작성 전문가입니다. 고객에게 보내는 전문적이고 친절한 리포트를 작성하세요.",
        [{ role: "user", content: userPrompt }]
      );

      return { report, clientName: client.name };
    }),

  // 카카오톡 요약 텍스트 생성
  generateKakaoText: publicProcedure
    .input(
      z.object({
        report: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const kakaoText = await chatWithClaude(
        "당신은 마케팅 성과 리포트를 카카오톡 메시지로 변환하는 전문가입니다.",
        [
          {
            role: "user",
            content: `다음 리포트를 카카오톡으로 보내기 적합한 짧은 텍스트로 요약해주세요. 300자 이내로 작성하고, 핵심 성과와 다음 계획을 간결하게 포함하세요. 이모지를 적절히 활용하세요.\n\n${input.report}`,
          },
        ]
      );

      return { kakaoText };
    }),

  // 고객 목록 (셀렉터용)
  listClients: publicProcedure.query(async () => {
    const clients = await db
      .select({
        id: chameleonClients.id,
        name: chameleonClients.name,
        businessType: chameleonClients.businessType,
      })
      .from(chameleonClients)
      .orderBy(chameleonClients.name);

    return clients;
  }),
});
