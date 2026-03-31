"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart2,
  Search,
  TrendingUp,
  Sparkles,
  Copy,
  Check,
  Radar,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AnalyticsPage() {
  const [tab, setTab] = useState<"competitor" | "predict" | "trends">("competitor");

  const TABS = [
    { key: "competitor" as const, label: "경쟁사 분석", icon: Search },
    { key: "predict" as const, label: "성과 예측", icon: TrendingUp },
    { key: "trends" as const, label: "트렌드 레이더", icon: Radar },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft size={14} /> 대시보드
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl chameleon-bg shadow-lg">
            <BarChart2 size={20} className="text-[#0a0a0a]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold chameleon-text">경쟁사 분석 + 성과 예측</h1>
            <p className="text-sm text-slate-400">AI 기반 마케팅 인사이트</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all ${tab === t.key ? "chameleon-bg text-[#0a0a0a]" : "chameleon-border-slow bg-black/40 text-slate-400"}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "competitor" && <CompetitorAnalysis />}
      {tab === "predict" && <PerformancePredict />}
      {tab === "trends" && <TrendRadar />}
    </div>
  );
}

function CompetitorAnalysis() {
  const [industry, setIndustry] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const analyze = async () => {
    if (!industry.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const data = await trpc.analytics.analyzeCompetitor.mutate({
        industry,
        region: region || undefined,
      });
      setResult(data.analysis);
    } catch {
      setResult("분석에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl chameleon-border-slow bg-black/40 p-6">
        <h2 className="text-lg font-bold text-white mb-4">업종 경쟁사 분석</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="mb-1 block text-xs text-slate-400">업종 *</label>
            <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)}
              placeholder="카페, 음식점, 뷰티 등"
              className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">지역 (선택)</label>
            <input type="text" value={region} onChange={(e) => setRegion(e.target.value)}
              placeholder="강남, 홍대, 부산 등"
              className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
          </div>
        </div>
        <button onClick={analyze} disabled={loading || !industry.trim()} className="btn-accent w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2">
          {loading ? (
            <><div className="chameleon-spinner !w-4 !h-4 !border-2" /> 분석 중...</>
          ) : (
            <><Search size={14} /> 경쟁사 분석 시작</>
          )}
        </button>
      </div>

      {result && (
        <div className="relative rounded-2xl chameleon-border-slow bg-black/40 p-6">
          <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="absolute top-4 right-4 rounded-lg bg-white/10 p-1.5 text-slate-400 hover:text-white transition-colors">
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <h3 className="text-sm font-bold chameleon-text mb-3">분석 결과</h3>
          <div className="chameleon-bg-subtle rounded-xl p-4">
            <pre className="text-sm text-white whitespace-pre-wrap leading-relaxed">{result}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

function PerformancePredict() {
  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState("릴스");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const TYPES = ["릴스", "블로그", "카드뉴스", "스레드", "인스타 포스트", "틱톡", "유튜브"];

  const predict = async () => {
    if (!title.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const data = await trpc.analytics.predictPerformance.mutate({
        title,
        contentType,
        industry: industry || undefined,
      });
      setResult(data.prediction);
    } catch {
      setResult("예측에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl chameleon-border-slow bg-black/40 p-6">
        <h2 className="text-lg font-bold text-white mb-4">콘텐츠 성과 예측</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-slate-400">콘텐츠 제목 *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 카페 사장님이 절대 안 알려주는 라떼 레시피"
              className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-slate-400">콘텐츠 유형</label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button key={t} onClick={() => setContentType(t)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${contentType === t ? "chameleon-bg text-[#0a0a0a]" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">업종 (선택)</label>
            <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)}
              placeholder="카페, 음식점 등"
              className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
          </div>
          <button onClick={predict} disabled={loading || !title.trim()} className="btn-accent w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2">
            {loading ? (
              <><div className="chameleon-spinner !w-4 !h-4 !border-2" /> 예측 중...</>
            ) : (
              <><TrendingUp size={14} /> 성과 예측</>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="rounded-2xl chameleon-border-slow bg-black/40 p-6">
          <h3 className="text-sm font-bold chameleon-text mb-3">예측 결과</h3>
          <div className="chameleon-bg-subtle rounded-xl p-4">
            <pre className="text-sm text-white whitespace-pre-wrap leading-relaxed">{result}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

function TrendRadar() {
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const getTrends = async () => {
    if (!industry.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const data = await trpc.analytics.getTrends.mutate({ industry });
      setResult(data.trends);
    } catch {
      setResult("트렌드 분석에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl chameleon-border-slow bg-black/40 p-6">
        <h2 className="text-lg font-bold text-white mb-1">트렌드 레이더</h2>
        <p className="text-xs text-slate-500 mb-4">업종별 최신 콘텐츠 트렌드를 AI가 분석합니다</p>
        <div className="flex gap-3">
          <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)}
            placeholder="업종 입력 (카페, 뷰티, 음식점 등)"
            className="flex-1 rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
          <button onClick={getTrends} disabled={loading || !industry.trim()} className="btn-accent px-4 py-2 text-sm font-semibold flex items-center gap-1.5">
            {loading ? <div className="chameleon-spinner !w-4 !h-4 !border-2" /> : <Sparkles size={14} />}
            분석
          </button>
        </div>
      </div>

      {result && (
        <div className="rounded-2xl chameleon-border-slow bg-black/40 p-6">
          <h3 className="text-sm font-bold chameleon-text mb-3 flex items-center gap-1.5">
            <Radar size={14} /> 트렌드 리포트
          </h3>
          <div className="chameleon-bg-subtle rounded-xl p-4">
            <pre className="text-sm text-white whitespace-pre-wrap leading-relaxed">{result}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
