/**
 * AI 앵커 이미지 생성 시스템
 */
import { generateImage } from "./image-generator";

const ANCHORS = {
  hana: {
    name: "하나",
    base: "Korean female news anchor, age 26, beautiful, professional makeup, studio lighting, photorealistic, 4K, upper body",
    styles: {
      formal: "navy blazer, pearl earrings, hair up",
      casual: "light blue cardigan, hair down waves",
      urgent: "dark red blazer, serious expression",
      happy: "white top, warm smile, hoop earrings",
    },
  },
  junho: {
    name: "준호",
    base: "Korean male news anchor, age 30, handsome, sharp jawline, studio lighting, photorealistic, 4K, upper body",
    styles: {
      formal: "dark navy suit blue tie, slicked hair",
      casual: "gray suit no tie, relaxed",
      urgent: "black suit red tie, serious",
      happy: "beige suit open collar, warm smile",
    },
  },
};

type Anchor = "hana" | "junho";
type Style = "formal" | "casual" | "urgent" | "happy";

export function getAnchorStyle(title: string): { anchor: Anchor; style: Style } {
  if (/긴급|마감|폐지|삭감/.test(title)) return { anchor: "junho", style: "urgent" };
  if (/지원금|무상|바우처|혜택/.test(title)) return { anchor: "hana", style: "happy" };
  if (/금리|정책|변경/.test(title)) return { anchor: "junho", style: "formal" };
  return { anchor: "hana", style: "casual" };
}

export async function generateAnchorImage(anchor: Anchor, style: Style): Promise<string | null> {
  const c = ANCHORS[anchor];
  const result = await generateImage(`${c.base}, ${c.styles[style]}, solid background`, { size: "portrait" });
  return result?.url || null;
}
