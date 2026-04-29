"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Copy, Check, Sparkles, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

const CATEGORIES = ["가격 문의", "예약/방문 문의", "메뉴/서비스 문의", "크몽/숨고 문의", "불만/클레임 대응"] as const;
const BUSINESS_TYPES = ["카페", "음식점", "뷰티샵", "쇼핑몰", "학원", "병원", "헬스장", "펜션", "기타"] as const;

const CAT_COLORS: Record<string, string> = {
  "가격 문의": "border-emerald-500/30 bg-emerald-500/5",
  "예약/방문 문의": "border-blue-500/30 bg-blue-500/5",
  "메뉴/서비스 문의": "border-purple-500/30 bg-purple-500/5",
  "크몽/숨고 문의": "border-yellow-500/30 bg-yellow-500/5",
  "불만/클레임 대응": "border-pink-500/30 bg-pink-500/5",
};

const CAT_TEXT: Record<string, string> = {
  "가격 문의": "text-emerald-300",
  "예약/방문 문의": "text-blue-300",
  "메뉴/서비스 문의": "text-purple-300",
  "크몽/숨고 문의": "text-yellow-300",
  "불만/클레임 대응": "text-pink-300",
};

interface Template {
  id: string;
  category: string;
  question: string;
  answerOptions: string[] | null;
  businessType: string | null;
}

// 콘텐츠 템플릿 데이터
import contentTemplates from "@/data/content-templates.json";
type ContentTemplate = { industry: string; type: string; title: string; tags: string[]; preview: string; content: string };

function ContentTemplateSection() {
  const [filterIndustry, setFilterIndustry] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selected, setSelected] = useState<ContentTemplate | null>(null);
  const [copied2, setCopied2] = useState("");

  const industries = [...new Set((contentTemplates as ContentTemplate[]).map(t => t.industry))];
  const types = [...new Set((contentTemplates as ContentTemplate[]).map(t => t.type))];
  const filtered = (contentTemplates as ContentTemplate[]).filter(t =>
    (!filterIndustry || t.industry === filterIndustry) && (!filterType || t.type === filterType)
  );

  if (selected) {
    return (
      <div>
        <button onClick={() => setSelected(null)} className="text-xs text-white/40 hover:text-white mb-3 flex items-center gap-1">
          ← 목록
        </button>
        <div className="rounded-xl bg-[#1A1A1A] border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">{selected.industry}</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold">{selected.type}</span>
          </div>
          <h2 className="text-base font-bold text-white mb-4">{selected.title}</h2>
          <pre className="whitespace-pre-wrap text-sm text-white/70 leading-relaxed bg-[#111] rounded-lg p-4 border border-white/5">{selected.content}</pre>
          <div className="flex gap-2 mt-4">
            <button onClick={() => { navigator.clipboard.writeText(selected.content); setCopied2(selected.title); setTimeout(() => setCopied2(""), 1500); }}
              className="flex-1 py-2.5 rounded-lg bg-[#3B82F6] text-white text-sm font-bold">
              {copied2 === selected.title ? "✅ 복사됨!" : "📋 전체 복사"}
            </button>
            <Link href="/content" className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-bold text-center">
              ✨ 이 템플릿으로 생성
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)}
          className="bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white">
          <option value="">전체 업종</option>
          {industries.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white">
          <option value="">전체 유형</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <span className="text-[11px] text-white/30 self-center">{filtered.length}개</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((t, i) => (
          <div key={i} onClick={() => setSelected(t)}
            className="rounded-xl bg-[#1A1A1A] border border-white/5 p-4 cursor-pointer hover:border-[#3B82F6]/30 transition">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-bold">{t.industry}</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-bold">{t.type}</span>
            </div>
            <p className="text-sm font-medium text-white mb-1">{t.title}</p>
            <p className="text-[11px] text-white/30 line-clamp-2">{t.preview}</p>
            <div className="flex gap-1 mt-2">{t.tags.map(tag => <span key={tag} className="text-[9px] text-white/20">#{tag}</span>)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const [tab, setTab] = useState<"content" | "cs">("content");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessType, setBusinessType] = useState("카페");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await trpc.templates.list.query();
      setTemplates(data as unknown as Template[]);
    } catch {
      setTemplates([]);
      setError("템플릿을 불러올 수 없습니다. DB 연결을 확인하세요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const generate = async () => {
    setGenerating(true);
    setError("");
    try {
      await trpc.templates.generate.mutate({ businessType });
      await load();
    } catch {
      setError("생성 실패. 다시 시도해주세요.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await trpc.templates.delete.mutate({ id });
      load();
    } catch { /* ignore */ }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  // 카테고리별 그룹핑
  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    items: templates.filter((t) => t.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft size={14} /> 대시보드
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl chameleon-bg shadow-lg">
            <MessageSquare size={20} className="text-[#0a0a0a]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold chameleon-text">응답 템플릿</h1>
            <p className="text-sm text-slate-400">댓글/DM/크몽/숨고 자동 응답 생성</p>
          </div>
        </div>
      </div>

      {/* 탭 전환 */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("content")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === "content" ? "bg-[#3B82F6] text-white" : "bg-white/5 text-white/40 hover:text-white/70"}`}>
          📝 콘텐츠 템플릿
        </button>
        <button onClick={() => setTab("cs")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === "cs" ? "bg-[#3B82F6] text-white" : "bg-white/5 text-white/40 hover:text-white/70"}`}>
          💬 CS 응답 템플릿
        </button>
      </div>

      {tab === "content" ? (
        <ContentTemplateSection />
      ) : (
      <>
      {/* Generator */}
      <div className="rounded-2xl chameleon-border-slow bg-black/40 p-5 mb-6">
        <h3 className="text-sm font-bold text-white mb-3">AI 템플릿 자동 생성</h3>
        <p className="text-xs text-slate-500 mb-3">업종을 선택하면 5개 카테고리 × 3개 응답 = 총 15개 템플릿을 한번에 생성합니다</p>
        <div className="flex gap-3 items-end">
          <div>
            <label className="mb-1 block text-xs text-slate-400">업종</label>
            <select value={businessType} onChange={(e) => setBusinessType(e.target.value)}
              className="rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white focus:outline-none">
              {BUSINESS_TYPES.map((t) => <option key={t} value={t} className="bg-[#0d0d0d]">{t}</option>)}
            </select>
          </div>
          <button onClick={generate} disabled={generating}
            className="btn-accent px-4 py-2 text-sm font-semibold flex items-center gap-1.5">
            {generating ? (
              <><div className="chameleon-spinner !w-4 !h-4 !border-2" /> 생성 중...</>
            ) : (
              <><Sparkles size={14} /> 템플릿 생성</>
            )}
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}
      </div>

      {/* Templates by Category */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="chameleon-spinner" /></div>
      ) : grouped.length === 0 ? (
        <div className="py-20 text-center">
          <MessageSquare size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">생성된 템플릿이 없습니다</p>
          <p className="mt-1 text-sm text-slate-500">위에서 업종을 선택하고 생성해보세요</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map((group) => (
            <div key={group.category} className={`rounded-2xl border p-5 ${CAT_COLORS[group.category] || "border-white/10 bg-black/40"}`}>
              <h3 className={`text-sm font-bold mb-4 ${CAT_TEXT[group.category] || "text-white"}`}>
                {group.category} ({group.items.length})
              </h3>
              <div className="space-y-3">
                {group.items.map((t) => (
                  <div key={t.id} className="rounded-xl bg-black/30 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-400">{t.businessType}</span>
                        <h4 className="mt-1 text-sm font-semibold text-white">Q. {t.question}</h4>
                      </div>
                      <button onClick={() => handleDelete(t.id)} className="text-slate-600 hover:text-red-400">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="space-y-1.5 mt-3">
                      {t.answerOptions?.map((ans, i) => (
                        <div key={i} className="flex items-start gap-2 rounded-lg bg-white/5 px-3 py-2">
                          <span className="text-[10px] text-slate-500 shrink-0 mt-0.5">A{i + 1}</span>
                          <p className="text-xs text-white flex-1">{ans}</p>
                          <button onClick={() => handleCopy(ans, `${t.id}-${i}`)}
                            className="shrink-0 text-slate-500 hover:text-white transition-colors">
                            {copied === `${t.id}-${i}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-6 rounded-xl chameleon-border-slow bg-black/40 p-4 text-center">
        <p className="text-xs text-slate-500">크몽/숨고 1분 이내 응답 → 상위 노출 알고리즘 최적화에 유리합니다</p>
      </div>
      </>
      )}
    </div>
  );
}
