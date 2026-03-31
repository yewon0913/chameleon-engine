import { z } from "zod";
import { router, publicProcedure } from "../trpc/init";
import { db } from "../db/client";
import { chameleonTemplates } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { chatWithClaude } from "@/lib/claude-api";

export const templatesRouter = router({
  // 템플릿 목록
  list: publicProcedure.query(async () => {
    const templates = await db
      .select()
      .from(chameleonTemplates)
      .orderBy(chameleonTemplates.category, desc(chameleonTemplates.createdAt));
    return templates;
  }),

  // 템플릿 생성
  generate: publicProcedure
    .input(
      z.object({
        businessType: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `당신은 소상공인 SNS 마케팅 전문가입니다.
업종: ${input.businessType}
이 업종에서 자주 받는 댓글/DM 질문과 전문가급 응답 템플릿을 생성해주세요.

카테고리별로 3개씩:
1. 가격 문의 응답 3종
2. 예약/방문 문의 응답 3종
3. 메뉴/서비스 문의 응답 3종
4. 크몽/숨고 문의 응답 3종
5. 불만/클레임 대응 3종

각 응답은 친근하면서도 전문적인 톤으로.

반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
[
  {"category": "가격 문의", "question": "질문 예시", "answers": ["답변1", "답변2", "답변3"]},
  {"category": "예약/방문 문의", "question": "질문 예시", "answers": ["답변1", "답변2", "답변3"]},
  {"category": "메뉴/서비스 문의", "question": "질문 예시", "answers": ["답변1", "답변2", "답변3"]},
  {"category": "크몽/숨고 문의", "question": "질문 예시", "answers": ["답변1", "답변2", "답변3"]},
  {"category": "불만/클레임 대응", "question": "질문 예시", "answers": ["답변1", "답변2", "답변3"]}
]

총 5개 카테고리 × 3개 질문 = 15개 항목을 만들어주세요.`;

      const content = await chatWithClaude(
        "당신은 소상공인 SNS 마케팅 전문가입니다. 반드시 유효한 JSON 배열로만 응답하세요.",
        [{ role: "user", content: prompt }],
      );

      let templates;
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        templates = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      } catch {
        throw new Error("AI 응답 파싱 실패");
      }

      // DB에 저장
      for (const tpl of templates) {
        await db.insert(chameleonTemplates).values({
          category: tpl.category,
          question: tpl.question,
          answerOptions: tpl.answers,
          businessType: input.businessType,
        });
      }

      return { templates };
    }),

  // 템플릿 삭제
  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await db
        .delete(chameleonTemplates)
        .where(eq(chameleonTemplates.id, input.id));
      return { success: true };
    }),
});
