"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FlaskConical, Plus, Sparkles, Trophy, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface AbTest {
  id: string;
  versionA: string;
  versionB: string;
  versionC: string | null;
  metricsA: Record<string, number> | null;
  metricsB: Record<string, number> | null;
  metricsC: Record<string, number> | null;
  winner: string | null;
  analysis: string | null;
  createdAt: string;
}

export default function AbTestPage() {
  const [tests, setTests] = useState<AbTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState("릴스");
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState("");

  const load = async () => {
    try {
      const data = await trpc.abtest.list.query();
      setTests(data as unknown as AbTest[]);
    } catch {
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!title.trim()) return;
    setCreating(true);
    try {
      await trpc.abtest.create.mutate({ title, contentType });
      setShowCreate(false);
      setTitle("");
      load();
    } catch {
      setToast("생성 실패"); setTimeout(() => setToast(""), 3000);
    } finally {
      setCreating(false);
    }
  };

  const analyze = async (id: string) => {
    try {
      await trpc.abtest.analyze.mutate({ id });
      load();
    } catch { setToast("분석 실패"); setTimeout(() => setToast(""), 3000); }
  };

  const updateMetric = async (id: string, version: string, field: string, value: number) => {
    const key = `metrics${version.toUpperCase()}` as "metricsA" | "metricsB" | "metricsC";
    const test = tests.find((t) => t.id === id);
    if (!test) return;
    const current = (test[key] as Record<string, number>) || {};
    try {
      await trpc.abtest.updateMetrics.mutate({ id, [key]: { ...current, [field]: value } });
      load();
    } catch { /* ignore */ }
  };

  const TYPES = ["릴스", "블로그", "카드뉴스", "스레드", "인스타"];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition-colors">
            <ArrowLeft size={14} /> 대시보드
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl chameleon-bg shadow-lg">
              <FlaskConical size={20} className="text-[#0a0a0a]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold chameleon-text">콘텐츠 A/B 테스트</h1>
              <p className="text-sm text-slate-400">제목/캡션 비교로 최적 버전 찾기</p>
            </div>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-accent flex items-center gap-2 px-4 py-2.5 text-sm font-semibold">
          <Plus size={16} /> 새 테스트
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="rounded-2xl chameleon-border-slow bg-black/40 p-6 mb-6">
          <h3 className="text-sm font-bold text-white mb-3">AI가 3개 버전을 자동 생성합니다</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400">콘텐츠 주제/제목 *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 카페 라떼 레시피 공개"
                className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-slate-400">콘텐츠 유형</label>
              <div className="flex gap-2">
                {TYPES.map((t) => (
                  <button key={t} onClick={() => setContentType(t)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${contentType === t ? "chameleon-bg text-[#0a0a0a]" : "bg-white/5 text-slate-400"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowCreate(false)} className="btn-ghost flex-1 py-2 text-sm text-slate-300">취소</button>
              <button onClick={create} disabled={creating || !title.trim()} className="btn-accent flex-1 py-2 text-sm font-semibold flex items-center justify-center gap-1.5">
                {creating ? <><div className="chameleon-spinner !w-4 !h-4 !border-2" /> 생성 중...</> : <><Sparkles size={14} /> A/B/C 버전 생성</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tests List */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="chameleon-spinner" /></div>
      ) : tests.length === 0 ? (
        <div className="py-20 text-center">
          <FlaskConical size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">A/B 테스트가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map((test) => (
            <div key={test.id} className="rounded-2xl chameleon-border-slow bg-black/40 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-slate-500">{new Date(test.createdAt).toLocaleDateString("ko-KR")}</span>
                <div className="flex items-center gap-2">
                  {!test.winner && (
                    <button onClick={() => analyze(test.id)} className="btn-ghost flex items-center gap-1 px-2 py-1 text-[10px] text-slate-300">
                      <Sparkles size={10} /> AI 분석
                    </button>
                  )}
                  <button onClick={async () => { await trpc.abtest.delete.mutate({ id: test.id }); load(); }}
                    className="text-slate-600 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>

              {/* Versions */}
              <div className="grid gap-3 sm:grid-cols-3">
                {["A", "B", "C"].map((v) => {
                  const text = test[`version${v}` as keyof AbTest] as string | null;
                  if (!text) return null;
                  const metrics = (test[`metrics${v}` as keyof AbTest] as Record<string, number>) || {};
                  const isWinner = test.winner === v;
                  return (
                    <div key={v} className={`rounded-xl border p-3 transition-all ${isWinner ? "chameleon-border chameleon-glow" : "chameleon-border-slow"}`}>
                      <div className="flex items-center gap-1 mb-2">
                        <span className={`text-xs font-bold ${isWinner ? "chameleon-text" : "text-slate-400"}`}>버전 {v}</span>
                        {isWinner && <Trophy size={12} className="text-yellow-400" />}
                      </div>
                      <p className="text-xs text-white mb-3 line-clamp-3">{text}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {["views", "engagement"].map((field) => (
                          <div key={field}>
                            <label className="text-[8px] text-slate-500">{field === "views" ? "조회수" : "참여율%"}</label>
                            <input type="number" value={metrics[field] || 0}
                              onChange={(e) => updateMetric(test.id, v.toLowerCase(), field, Number(e.target.value))}
                              className="w-full rounded bg-white/5 px-2 py-1 text-[10px] text-white text-center focus:outline-none" />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Analysis */}
              {test.analysis && (
                <div className="mt-3 rounded-lg chameleon-bg-subtle p-3">
                  <p className="text-xs font-bold chameleon-text mb-1 flex items-center gap-1">
                    <Trophy size={12} /> AI 분석 결과
                  </p>
                  <p className="text-xs text-white">{test.analysis}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-red-500/90 px-5 py-2.5 text-sm font-bold text-white shadow-2xl animate-pulse">
          {toast}
        </div>
      )}
    </div>
  );
}
