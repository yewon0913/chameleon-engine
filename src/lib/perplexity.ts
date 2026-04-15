/**
 * Perplexity — 실시간 트렌드 분석
 */

const KEY = () => process.env.PERPLEXITY_API_KEY || "";

export async function getTrend(industry: string): Promise<string | null> {
  if (!KEY()) return null;
  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "sonar",
        messages: [{ role: "user", content: `한국 ${industry} 업종의 2026년 최신 마케팅 트렌드 3가지. 각각 구체적 실행 방법 포함. 간결하게.` }],
      }),
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch { return null; }
}
