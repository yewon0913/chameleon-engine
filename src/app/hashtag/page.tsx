"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Hash, Copy, Check, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";

const COMPETITION_COLORS: Record<string, string> = {
  높음: "bg-red-500/20 text-red-300",
  중간: "bg-yellow-500/20 text-yellow-300",
  낮음: "bg-emerald-500/20 text-emerald-300",
};

interface HashtagResult {
  hashtags: { tag: string; competition: string }[];
  instagram: string;
  tiktok: string;
  youtube: string;
}

export default function HashtagPage() {
  const [industry, setIndustry] = useState("");
  const [region, setRegion] = useState("");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HashtagResult | null>(null);
  const [copied, setCopied] = useState("");

  const generate = async () => {
    if (!industry.trim() || !keywords.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await trpc.hashtag.generate.mutate({
        industry,
        region: region || undefined,
        keywords,
      });
      if (typeof data.result === "object") {
        setResult(data.result as HashtagResult);
      }
    } catch {
      alert("해시태그 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft size={14} /> 대시보드
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl chameleon-bg shadow-lg">
            <Hash size={20} className="text-[#0a0a0a]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold chameleon-text">해시태그 최적화기</h1>
            <p className="text-sm text-slate-400">업종별 최적 해시태그 30개 추천</p>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="rounded-2xl chameleon-border-slow bg-black/40 p-6 mb-6">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="mb-1 block text-xs text-slate-400">업종 *</label>
            <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)}
              placeholder="카페, 뷰티 등"
              className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">지역</label>
            <input type="text" value={region} onChange={(e) => setRegion(e.target.value)}
              placeholder="강남, 홍대 등"
              className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">키워드 *</label>
            <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)}
              placeholder="라떼, 분위기 등"
              className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
          </div>
        </div>
        <button onClick={generate} disabled={loading || !industry.trim() || !keywords.trim()}
          className="btn-accent w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2">
          {loading ? <><div className="chameleon-spinner !w-4 !h-4 !border-2" /> 생성 중...</> : <><Sparkles size={14} /> 해시태그 30개 생성</>}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* All Hashtags */}
          <div className="rounded-2xl chameleon-border-slow bg-black/40 p-6">
            <h3 className="text-sm font-bold text-white mb-3">추천 해시태그 ({result.hashtags?.length || 0}개)</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {result.hashtags?.map((h, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full border chameleon-border-slow px-2.5 py-1 text-xs text-white">
                  #{h.tag}
                  <span className={`rounded-full px-1.5 py-0 text-[8px] font-bold ${COMPETITION_COLORS[h.competition] || "bg-white/10 text-slate-400"}`}>
                    {h.competition}
                  </span>
                </span>
              ))}
            </div>
            <button onClick={() => handleCopy(result.hashtags?.map((h) => `#${h.tag}`).join(" ") || "", "all")}
              className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 w-full justify-center">
              {copied === "all" ? <Check size={12} /> : <Copy size={12} />} 전체 복사
            </button>
          </div>

          {/* Channel-optimized */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { key: "instagram", label: "인스타그램", desc: "30개", color: "text-pink-300" },
              { key: "tiktok", label: "틱톡", desc: "5개", color: "text-cyan-300" },
              { key: "youtube", label: "유튜브", desc: "15개 태그", color: "text-red-300" },
            ].map((ch) => (
              <div key={ch.key} className="rounded-xl chameleon-border-slow bg-black/40 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`text-xs font-bold ${ch.color}`}>{ch.label} ({ch.desc})</h4>
                  <button onClick={() => handleCopy(result[ch.key as keyof HashtagResult] as string || "", ch.key)}
                    className="text-slate-500 hover:text-white">
                    {copied === ch.key ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 break-all">{result[ch.key as keyof HashtagResult] as string || ""}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
