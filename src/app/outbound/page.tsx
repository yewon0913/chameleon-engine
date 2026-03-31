"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Target,
  Plus,
  X,
  Copy,
  Sparkles,
  Upload,
  MessageCircle,
  Check,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const BUSINESS_TYPES = ["카페", "음식점", "뷰티샵", "쇼핑몰", "학원", "병원", "헬스장", "펜션", "기타"] as const;

const CONTACT_STATUSES = ["미발송", "발송완료", "응답받음", "미팅예약", "계약완료"] as const;

const STATUS_COLORS: Record<string, string> = {
  미발송: "bg-slate-500/20 text-slate-300",
  발송완료: "bg-blue-500/20 text-blue-300",
  응답받음: "bg-yellow-500/20 text-yellow-300",
  미팅예약: "bg-purple-500/20 text-purple-300",
  계약완료: "bg-emerald-500/20 text-emerald-300",
};

interface Prospect {
  id: string;
  businessName: string;
  businessType: string | null;
  region: string | null;
  instagramHandle: string | null;
  followers: number | null;
  lastPostDate: string | null;
  contactStatus: string;
  messageSentAt: string | null;
  createdAt: string;
}

export default function OutboundPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [messageTarget, setMessageTarget] = useState<Prospect | null>(null);

  const load = async () => {
    try {
      const data = await trpc.outbound.listProspects.query();
      setProspects(data as unknown as Prospect[]);
    } catch {
      setProspects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = filterStatus ? prospects.filter((p) => p.contactStatus === filterStatus) : prospects;

  const statusCounts = CONTACT_STATUSES.map((s) => ({
    label: s,
    count: prospects.filter((p) => p.contactStatus === s).length,
  }));

  const handleStatusChange = async (id: string, status: typeof CONTACT_STATUSES[number]) => {
    try {
      await trpc.outbound.updateStatus.mutate({ id, contactStatus: status });
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
              <Target size={20} className="text-[#0a0a0a]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold chameleon-text">영업 자동화</h1>
              <p className="text-sm text-slate-400">잠재 고객을 자동으로 찾아줍니다</p>
            </div>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-accent flex items-center gap-2 px-4 py-2.5 text-sm font-semibold">
          <Plus size={16} /> 잠재 고객 추가
        </button>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => setFilterStatus("")}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${!filterStatus ? "chameleon-badge" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
          전체 {prospects.length}
        </button>
        {statusCounts.map((s) => (
          <button key={s.label} onClick={() => setFilterStatus(filterStatus === s.label ? "" : s.label)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${filterStatus === s.label ? "chameleon-badge" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
            {s.label} {s.count}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="chameleon-spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Target size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">
            {prospects.length === 0 ? "잠재 고객이 없습니다" : "검색 결과가 없습니다"}
          </p>
          <p className="mt-2 text-sm text-slate-500">잠재 고객을 추가하거나 CSV로 업로드하세요</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-[1fr_100px_100px_80px_100px_100px_120px] items-center gap-4 px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
            <span>상호</span>
            <span>업종</span>
            <span>지역</span>
            <span>팔로워</span>
            <span>마지막 게시</span>
            <span>상태</span>
            <span>액션</span>
          </div>

          {filtered.map((p) => (
            <div key={p.id} className="grid grid-cols-1 sm:grid-cols-[1fr_100px_100px_80px_100px_100px_120px] items-center gap-2 sm:gap-4 rounded-xl chameleon-border-slow bg-black/40 p-4">
              <div>
                <p className="font-semibold text-white">{p.businessName}</p>
                {p.instagramHandle && <p className="text-xs text-pink-400">@{p.instagramHandle}</p>}
              </div>
              <p className="text-sm text-slate-400">{p.businessType || "-"}</p>
              <p className="text-sm text-slate-400">{p.region || "-"}</p>
              <p className="text-sm text-slate-400">{p.followers || "-"}</p>
              <p className="text-xs text-slate-500">{p.lastPostDate || "-"}</p>
              <div>
                <select
                  value={p.contactStatus}
                  onChange={(e) => handleStatusChange(p.id, e.target.value as typeof CONTACT_STATUSES[number])}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium border-0 cursor-pointer ${STATUS_COLORS[p.contactStatus] || "bg-white/10 text-slate-400"}`}
                >
                  {CONTACT_STATUSES.map((s) => (
                    <option key={s} value={s} className="bg-[#0d0d0d] text-white">{s}</option>
                  ))}
                </select>
              </div>
              <button onClick={() => setMessageTarget(p)}
                className="btn-ghost flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-slate-300">
                <MessageCircle size={10} /> 메시지 생성
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Prospect Modal */}
      {showAdd && (
        <AddProspectModal
          onClose={() => setShowAdd(false)}
          onCreated={() => { setShowAdd(false); load(); }}
        />
      )}

      {/* Message Generator Modal */}
      {messageTarget && (
        <MessageModal
          prospect={messageTarget}
          onClose={() => setMessageTarget(null)}
        />
      )}
    </div>
  );
}

function AddProspectModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    businessName: "",
    businessType: "",
    region: "",
    instagramHandle: "",
    followers: "",
    lastPostDate: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName.trim()) return;
    setSaving(true);
    try {
      await trpc.outbound.createProspect.mutate({
        businessName: form.businessName,
        businessType: form.businessType || undefined,
        region: form.region || undefined,
        instagramHandle: form.instagramHandle || undefined,
        followers: form.followers ? Number(form.followers) : undefined,
        lastPostDate: form.lastPostDate || undefined,
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
          <h2 className="text-lg font-bold text-white">잠재 고객 추가</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400">상호 *</label>
              <input type="text" value={form.businessName} onChange={(e) => set("businessName", e.target.value)}
                placeholder="사업장 이름"
                className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">업종</label>
              <select value={form.businessType} onChange={(e) => set("businessType", e.target.value)}
                className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white focus:outline-none">
                <option value="" className="bg-[#0d0d0d]">선택</option>
                {BUSINESS_TYPES.map((t) => <option key={t} value={t} className="bg-[#0d0d0d]">{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400">지역</label>
              <input type="text" value={form.region} onChange={(e) => set("region", e.target.value)} placeholder="시/구/동"
                className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">인스타그램</label>
              <input type="text" value={form.instagramHandle} onChange={(e) => set("instagramHandle", e.target.value)} placeholder="@계정명"
                className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400">팔로워 수</label>
              <input type="number" value={form.followers} onChange={(e) => set("followers", e.target.value)} placeholder="0"
                className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">마지막 게시일</label>
              <input type="date" value={form.lastPostDate} onChange={(e) => set("lastPostDate", e.target.value)}
                className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white focus:outline-none" />
            </div>
          </div>
          <button type="submit" disabled={saving || !form.businessName.trim()} className="btn-accent w-full py-2.5 text-sm font-semibold">
            {saving ? "저장 중..." : "잠재 고객 등록"}
          </button>
        </form>
      </div>
    </div>
  );
}

function MessageModal({ prospect, onClose }: { prospect: Prospect; onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const data = await trpc.outbound.generateMessage.mutate({
        businessType: prospect.businessType || "일반",
        businessName: prospect.businessName,
        instagramHandle: prospect.instagramHandle || undefined,
      });
      setMessage(data.message);
    } catch {
      setMessage("메시지 생성 실패. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[#D4AF37]/20 bg-[#0d0d0d] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            <span className="chameleon-text">{prospect.businessName}</span> 제안 메시지
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20} /></button>
        </div>

        {!message ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">AI가 맞춤 DM 메시지를 생성합니다</p>
            <button onClick={generate} disabled={loading} className="btn-accent w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2">
              {loading ? (
                <><div className="chameleon-spinner !w-4 !h-4 !border-2" /> 생성 중...</>
              ) : (
                <><Sparkles size={14} /> 메시지 자동 생성</>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <pre className="chameleon-bg-subtle rounded-xl p-4 text-sm text-white whitespace-pre-wrap leading-relaxed">{message}</pre>
              <button onClick={handleCopy}
                className="absolute top-2 right-2 rounded-lg bg-white/10 p-1.5 text-slate-400 hover:text-white transition-colors">
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={generate} disabled={loading} className="btn-ghost flex-1 py-2 text-sm text-slate-300">
                다시 생성
              </button>
              <button onClick={onClose} className="btn-accent flex-1 py-2 text-sm font-semibold">
                완료
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
