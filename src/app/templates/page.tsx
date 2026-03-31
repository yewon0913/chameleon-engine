"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Plus, Copy, Check, Sparkles, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

const CATEGORIES = ["댓글", "DM", "크몽", "숨고"] as const;
const BUSINESS_TYPES = ["카페", "음식점", "뷰티샵", "쇼핑몰", "학원", "병원", "헬스장", "기타"] as const;

interface Template {
  id: string;
  category: string;
  question: string;
  answerOptions: string[] | null;
  businessType: string | null;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("댓글");
  const [businessType, setBusinessType] = useState("카페");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState("");

  const load = async () => {
    try {
      const data = await trpc.templates.list.query();
      setTemplates(data as unknown as Template[]);
    } catch {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const generate = async () => {
    setGenerating(true);
    try {
      await trpc.templates.generate.mutate({ businessType, category: category as "댓글" | "DM" | "크몽" | "숨고" });
      load();
    } catch {
      alert("생성 실패");
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

  const filtered = templates.filter((t) => t.category === category);

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
            <h1 className="text-2xl font-bold chameleon-text">댓글/DM 응답 템플릿</h1>
            <p className="text-sm text-slate-400">1분 이내 응답으로 알고리즘 최적화</p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-6 flex gap-2">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${category === c ? "chameleon-bg text-[#0a0a0a]" : "chameleon-border-slow bg-black/40 text-slate-400"}`}>
            {c} ({templates.filter((t) => t.category === c).length})
          </button>
        ))}
      </div>

      {/* Generator */}
      <div className="rounded-2xl chameleon-border-slow bg-black/40 p-5 mb-6">
        <h3 className="text-sm font-bold text-white mb-3">AI 템플릿 자동 생성</h3>
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
            {generating ? <><div className="chameleon-spinner !w-4 !h-4 !border-2" /> 생성 중...</> : <><Sparkles size={14} /> {category} 템플릿 생성</>}
          </button>
        </div>
        {(category === "크몽" || category === "숨고") && (
          <p className="mt-2 text-[10px] text-slate-500">* {category} 1분 이내 응답 → 상위 노출 알고리즘 최적화에 유리합니다</p>
        )}
      </div>

      {/* Templates List */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="chameleon-spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <MessageSquare size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">생성된 템플릿이 없습니다</p>
          <p className="mt-1 text-sm text-slate-500">위에서 업종을 선택하고 생성해보세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <div key={t.id} className="rounded-xl chameleon-border-slow bg-black/40 p-4">
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
                  <div key={i} className="flex items-start gap-2 rounded-lg chameleon-bg-subtle px-3 py-2">
                    <span className="text-[10px] text-slate-500 shrink-0 mt-0.5">A{i + 1}</span>
                    <p className="text-xs text-white flex-1">{ans}</p>
                    <button onClick={() => handleCopy(ans, `${t.id}-${i}`)}
                      className="shrink-0 text-slate-500 hover:text-white">
                      {copied === `${t.id}-${i}` ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Social Biz Info */}
      <div className="mt-6 rounded-xl chameleon-border-slow bg-black/40 p-4 text-center">
        <p className="text-xs text-slate-500">소셜비즈/챗봇 연동으로 자동 응답도 가능합니다 (향후 업데이트)</p>
      </div>
    </div>
  );
}
