import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function chatWithClaude(
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const textBlock = response.content.find((b) => b.type === "text");
    return textBlock?.text ?? "";
  } catch (err) {
    console.error("[claude-api] API 호출 실패:", err);
    throw new Error("AI 응답 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }
}
