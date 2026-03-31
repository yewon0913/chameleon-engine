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
        category: z.enum(["댓글", "DM", "크몽", "숨고"]),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `${input.businessType} 업종의 ${input.category} 응대를 위한 자주 묻는 질문과 답변 템플릿 5개를 만들어주세요.

반드시 아래 JSON 배열 형식으로만 응답해주세요:
[{"question": "질문 내용", "answers": ["답변 옵션1", "답변 옵션2", "답변 옵션3"]}]`;

      const content = await chatWithClaude(
        "당신은 소상공인 고객 응대 전문가입니다.",
        [{ role: "user", content: prompt }],
      );

      let templates;
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        templates = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      } catch {
        return { templates: content };
      }

      // DB에 저장
      for (const tpl of templates) {
        await db.insert(chameleonTemplates).values({
          category: input.category,
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
