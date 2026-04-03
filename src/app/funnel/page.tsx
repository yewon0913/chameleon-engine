"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, GitBranch, Plus, Sparkles, ChevronRight, Check, Clock, Send } from "lucide-react";
import { trpc } from "@/lib/trpc";

const STEPS = [
  { day: 1, label: "Day 1: 감사 메시지" },
  { day: 3, label: "Day 3: 무료 샘플 제안" },
  { day: 7, label: "Day 7: 트렌드 정보 공유" },
  { day: 14, label: "Day 14: 할인 패키지 제안" },
  { day: 30, label: "Day 30: 후기 요청" },
];

const STATUS_COLORS: Record<string, string> = {
  대기: "bg-slate-500/20 text-slate-300",
  발송: "bg-blue-500/20 text-blue-300",
  읽음: "bg-yellow-500/20 text-yellow-300",
  응답: "bg-purple-500/20 text-purple-300",
  전환: "bg-emerald-500/20 text-emerald-300",
};

interface FunnelEntry {
  id: string;
  prospectId: string | null;
  prospectName?: string;
  step: number;
  messageContent: string | null;
  status: string;
  scheduledAt: string | null;
  sentAt: string | null;
}

interface Prospect {
  id: string;
  businessName: string;
  businessType: string | null;
}

export default function FunnelPage() {
  const [entries, setEntries] = useState<FunnelEntry[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState("");
  const [toast, setToast] = useState("");

  const load = async () => {
    try {
      const [e, p] = await Promise.all([
        trpc.funnel.listAll.query(),
        trpc.outbound.listProspects.query(),
      ]);
      setEntries(e as unknown as FunnelEntry[]);
      setProspects(p as unknown as Prospect[]);
    } catch {
      setEntries([]);
      setProspects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createSequence = async () => {
    if (!selectedProspect) return;
    setCreating(true);
    try {
      await trpc.funnel.createSequence.mutate({ prospectId: selectedProspect });
      setSelectedProspect("");
      load();
    } catch {
      setToast("퍼널 생성 실패"); setTimeout(() => setToast(""), 3000);
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (id: string, status: "대기" | "발송" | "읽음" | "응답" | "전환") => {
    try {
      await trpc.funnel.updateStatus.mutate({ id, status });
      load();
    } catch { /* ignore */ }
  };

  // Group by prospect
  const grouped = entries.reduce<Record<string, FunnelEntry[]>>((acc, e) => {
    const key = e.prospectName || e.prospectId || "unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft size={14} /> 대시보드
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl chameleon-bg shadow-lg">
            <GitBranch size={20} className="text-[#0a0a0a]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold chameleon-text">고객 육성 퍼널</h1>
            <p className="text-sm text-slate-400">자동 메시지 시퀀스로 고객 전환</p>
          </div>
        </div>
      </div>

      {/* Funnel Steps Visual */}
      <div className="mb-6 flex items-center justify-center gap-1 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s.day} className="flex items-center gap-1 shrink-0">
            <div className="rounded-lg chameleon-bg-subtle px-3 py-2 text-center">
              <p className="text-[10px] text-slate-400">Day {s.day}</p>
              <p className="text-[10px] font-bold text-white">{s.label.split(": ")[1]}</p>
            </div>
            {i < STEPS.length - 1 && <ChevronRight size={12} className="text-slate-600" />}
          </div>
        ))}
      </div>

      {/* Create New Sequence */}
      <div className="rounded-2xl chameleon-border-slow bg-black/40 p-5 mb-6">
        <h3 className="text-sm font-bold text-white mb-3">새 퍼널 시작</h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-slate-400">잠재 고객 선택</label>
            <select value={selectedProspect} onChange={(e) => setSelectedProspect(e.target.value)}
              className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white focus:outline-none">
              <option value="" className="bg-[#0d0d0d]">선택하세요</option>
              {prospects.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#0d0d0d]">{p.businessName} ({p.businessType || ""})</option>
              ))}
            </select>
          </div>
          <button onClick={createSequence} disabled={creating || !selectedProspect}
            className="btn-accent px-4 py-2 text-sm font-semibold flex items-center gap-1.5">
            {creating ? <><div className="chameleon-spinner !w-4 !h-4 !border-2" /> 생성 중...</> : <><Sparkles size={14} /> AI 메시지 생성</>}
          </button>
        </div>
      </div>

      {/* Funnel Entries */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="chameleon-spinner" /></div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="py-20 text-center">
          <GitBranch size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">진행 중인 퍼널이 없습니다</p>
          <p className="mt-1 text-sm text-slate-500">잠재 고객을 선택하고 퍼널을 시작하세요</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([name, steps]) => (
            <div key={name} className="rounded-2xl chameleon-border-slow bg-black/40 p-5">
              <h3 className="text-sm font-bold chameleon-text mb-3">{name}</h3>
              <div className="space-y-2">
                {steps.sort((a, b) => a.step - b.step).map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${entry.status === "전환" ? "chameleon-bg text-[#0a0a0a]" : "bg-white/10 text-slate-400"}`}>
                      {entry.step}
                    </div>
                    <p className="flex-1 text-xs text-white truncate">{entry.messageContent?.slice(0, 60) || "메시지 없음"}...</p>
                    <select value={entry.status}
                      onChange={(e) => updateStatus(entry.id, e.target.value as "대기" | "발송" | "읽음" | "응답" | "전환")}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium border-0 cursor-pointer ${STATUS_COLORS[entry.status] || "bg-white/10 text-slate-400"}`}>
                      {Object.keys(STATUS_COLORS).map((s) => (
                        <option key={s} value={s} className="bg-[#0d0d0d] text-white">{s}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
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
