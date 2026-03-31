"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Plus,
  X,
  Eye,
  EyeOff,
  ExternalLink,
  FileDown,
  TrendingUp,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface PortfolioItem {
  id: string;
  clientId: string | null;
  clientName?: string | null;
  projectSummary: string | null;
  results: Record<string, string> | null;
  isPublic: boolean | null;
  slug: string | null;
  createdAt: string;
}

interface CompletedProject {
  id: string;
  clientId: string;
  clientName: string | null;
  projectType: string;
  title: string | null;
  status: string;
}

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [completed, setCompleted] = useState<CompletedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [tab, setTab] = useState<"portfolio" | "projects">("portfolio");

  const load = async () => {
    try {
      const [p, c] = await Promise.all([
        trpc.portfolio.list.query(),
        trpc.portfolio.listCompleted.query(),
      ]);
      setItems(p as unknown as PortfolioItem[]);
      setCompleted(c as unknown as CompletedProject[]);
    } catch {
      setItems([]);
      setCompleted([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const togglePublic = async (id: string, current: boolean | null) => {
    try {
      await trpc.portfolio.update.mutate({ id, isPublic: !current });
      load();
    } catch { /* ignore */ }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition-colors">
            <ArrowLeft size={14} /> 대시보드
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl chameleon-bg shadow-lg">
              <Briefcase size={20} className="text-[#0a0a0a]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold chameleon-text">포트폴리오</h1>
              <p className="text-sm text-slate-400">성과를 보여주세요</p>
            </div>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-accent flex items-center gap-2 px-4 py-2.5 text-sm font-semibold">
          <Plus size={16} /> 포트폴리오 추가
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        <button onClick={() => setTab("portfolio")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all ${tab === "portfolio" ? "chameleon-bg text-[#0a0a0a]" : "chameleon-border-slow bg-black/40 text-slate-400"}`}>
          <Briefcase size={14} /> 포트폴리오 ({items.length})
        </button>
        <button onClick={() => setTab("projects")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all ${tab === "projects" ? "chameleon-bg text-[#0a0a0a]" : "chameleon-border-slow bg-black/40 text-slate-400"}`}>
          <TrendingUp size={14} /> 완료된 프로젝트 ({completed.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="chameleon-spinner" /></div>
      ) : tab === "portfolio" ? (
        items.length === 0 ? (
          <div className="py-20 text-center">
            <Briefcase size={48} className="mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400">포트폴리오가 없습니다</p>
            <p className="mt-2 text-sm text-slate-500">완료된 프로젝트에서 포트폴리오를 만들어보세요</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <div key={item.id} className="rounded-2xl chameleon-border-slow bg-black/40 p-5 transition-all hover:chameleon-glow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.clientName || "익명 클라이언트"}</h3>
                    <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString("ko-KR")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => togglePublic(item.id, item.isPublic)}
                      className={`rounded-full p-1.5 transition-colors ${item.isPublic ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-slate-500"}`}>
                      {item.isPublic ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    {item.isPublic && item.slug && (
                      <Link href={`/portfolio/${item.slug}`} target="_blank"
                        className="rounded-full bg-white/5 p-1.5 text-slate-400 hover:text-white transition-colors">
                        <ExternalLink size={14} />
                      </Link>
                    )}
                  </div>
                </div>

                {item.projectSummary && (
                  <p className="text-sm text-slate-300 mb-3 line-clamp-3">{item.projectSummary}</p>
                )}

                {item.results && Object.keys(item.results).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(item.results).map(([key, val]) => (
                      <div key={key} className="rounded-lg chameleon-bg-subtle px-2 py-1">
                        <span className="text-[10px] text-slate-400">{key}</span>
                        <p className="text-xs font-bold chameleon-text">{val}</p>
                      </div>
                    ))}
                  </div>
                )}

                {item.isPublic && (
                  <span className="mt-3 inline-block chameleon-badge text-[10px]">공개</span>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        /* Completed Projects */
        completed.length === 0 ? (
          <div className="py-20 text-center">
            <TrendingUp size={48} className="mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400">완료된 프로젝트가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {completed.map((proj) => (
              <div key={proj.id} className="flex items-center justify-between rounded-xl chameleon-border-slow bg-black/40 p-4">
                <div>
                  <p className="text-sm font-semibold text-white">{proj.title || proj.projectType}</p>
                  <p className="text-xs text-slate-500">{proj.clientName || "미지정"} · {proj.projectType}</p>
                </div>
                <button onClick={async () => {
                  try {
                    await trpc.portfolio.create.mutate({
                      clientId: proj.clientId,
                      projectSummary: `${proj.projectType}: ${proj.title || ""}`,
                      slug: `project-${proj.id.slice(0, 8)}`,
                    });
                    load();
                  } catch { alert("추가 실패"); }
                }}
                  className="btn-ghost flex items-center gap-1 px-3 py-1.5 text-xs text-slate-300">
                  <Plus size={12} /> 포트폴리오 추가
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* Add Modal */}
      {showAdd && (
        <AddPortfolioModal
          onClose={() => setShowAdd(false)}
          onCreated={() => { setShowAdd(false); load(); }}
        />
      )}
    </div>
  );
}

function AddPortfolioModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    projectSummary: "",
    followerGrowth: "",
    views: "",
    inquiries: "",
    isPublic: false,
    slug: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (key: string, value: string | boolean) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectSummary.trim()) return;
    setSaving(true);
    try {
      const results: Record<string, string> = {};
      if (form.followerGrowth) results["팔로워 증가"] = form.followerGrowth;
      if (form.views) results["조회수"] = form.views;
      if (form.inquiries) results["문의 증가"] = form.inquiries;

      await trpc.portfolio.create.mutate({
        projectSummary: form.projectSummary,
        results,
        isPublic: form.isPublic,
        slug: form.slug || undefined,
      });
      onCreated();
    } catch {
      alert("저장 실패");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[#D4AF37]/20 bg-[#0d0d0d] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">포트폴리오 추가</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-slate-400">프로젝트 요약 *</label>
            <textarea value={form.projectSummary} onChange={(e) => set("projectSummary", e.target.value)}
              rows={3} placeholder="프로젝트 설명 (클라이언트, 작업 내용, 기간 등)"
              className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none resize-none" />
          </div>
          <p className="text-xs font-medium text-slate-400">성과 지표</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400">팔로워 증가</label>
              <input type="text" value={form.followerGrowth} onChange={(e) => set("followerGrowth", e.target.value)} placeholder="+500"
                className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">조회수</label>
              <input type="text" value={form.views} onChange={(e) => set("views", e.target.value)} placeholder="10만+"
                className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">문의 증가</label>
              <input type="text" value={form.inquiries} onChange={(e) => set("inquiries", e.target.value)} placeholder="+30%"
                className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400">공개 URL 슬러그</label>
              <input type="text" value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="my-project"
                className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
            </div>
            <div className="flex items-end">
              <button type="button" onClick={() => set("isPublic", !form.isPublic)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${form.isPublic ? "chameleon-bg text-[#0a0a0a]" : "bg-white/5 text-slate-400"}`}>
                {form.isPublic ? "공개" : "비공개"}
              </button>
            </div>
          </div>
          <button type="submit" disabled={saving || !form.projectSummary.trim()} className="btn-accent w-full py-2.5 text-sm font-semibold">
            {saving ? "저장 중..." : "포트폴리오 등록"}
          </button>
        </form>
      </div>
    </div>
  );
}
