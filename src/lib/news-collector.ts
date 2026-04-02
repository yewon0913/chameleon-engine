/**
 * 정책 뉴스 자동 수집 + 바이럴 지수 계산
 */

export interface PolicyNews {
  title: string;
  summary: string;
  source: string;
  url: string;
  viralScore: number;
}

async function fetchRSS(url: string, source: string): Promise<PolicyNews[]> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const text = await res.text();
    const items: PolicyNews[] = [];
    const re = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<description>(.*?)<\/description>[\s\S]*?<\/item>/g;
    let m;
    while ((m = re.exec(text)) !== null && items.length < 10) {
      items.push({
        title: m[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim(),
        summary: m[3].replace(/<!\[CDATA\[|\]\]>/g, "").trim().slice(0, 200),
        source, url: m[2].trim(), viralScore: 0,
      });
    }
    return items;
  } catch { return []; }
}

function calcViral(n: PolicyNews): number {
  let s = 30;
  const t = n.title + " " + n.summary;
  if (/전국|전체|모든/.test(t)) s += 15;
  if (/소상공인|자영업|중소기업/.test(t)) s += 10;
  if (/긴급|즉시|마감/.test(t)) s += 15;
  if (/신규|신설|시작/.test(t)) s += 10;
  if (/[0-9]+억|[0-9]+조/.test(t)) s += 10;
  if (/무료|무상|지원금|바우처/.test(t)) s += 10;
  if (/인하|인상|변경|확대/.test(t)) s += 10;
  if (/금리/.test(t)) s += 10;
  return Math.min(100, s);
}

export async function collectAndRankNews(): Promise<PolicyNews[]> {
  const [mss, moef] = await Promise.all([
    fetchRSS("https://www.mss.go.kr/common/board/RSS.do?boardId=310", "중소벤처기업부"),
    fetchRSS("https://www.moef.go.kr/rss/moef/press_policy.xml", "기획재정부"),
  ]);
  const all = [...mss, ...moef];
  for (const n of all) n.viralScore = calcViral(n);
  all.sort((a, b) => b.viralScore - a.viralScore);
  return all;
}

export function buildReelsScriptPrompt(news: PolicyNews): string {
  return `정책 뉴스를 15~30초 릴스 스크립트로 변환.\n제목: ${news.title}\n요약: ${news.summary}\n출처: ${news.source}\n\nJSON: {"hook":"후킹","body":["핵심1","핵심2"],"cta":"CTA","hashtags":["#태그"],"bgm_mood":"긴급|희망|정보"}`;
}
