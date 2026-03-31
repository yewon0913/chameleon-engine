"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  ChevronRight,
  ArrowLeft,
  X,
  Sparkles,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const STATUSES = [
  "문의",
  "상담중",
  "견적발송",
  "계약완료",
  "제작중",
  "납품완료",
  "사후관리",
] as const;

const STATUS_COLORS: Record<string, string> = {
  문의: "bg-slate-500/20 text-slate-300",
  상담중: "bg-yellow-500/20 text-yellow-300",
  견적발송: "bg-blue-500/20 text-blue-300",
  계약완료: "bg-purple-500/20 text-purple-300",
  제작중: "bg-orange-500/20 text-orange-300",
  납품완료: "bg-emerald-500/20 text-emerald-300",
  사후관리: "bg-cyan-500/20 text-cyan-300",
};

interface Client {
  id: string;
  name: string;
  phone: string | null;
  businessType: string | null;
  businessName: string | null;
  snsInstagram: string | null;
  snsTiktok: string | null;
  snsYoutube: string | null;
  snsBlog: string | null;
  marketingGoal: string | null;
  monthlyBudget: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  projects: { id: string; projectType: string; status: string }[];
}

export default function CRMPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);

  const loadClients = async () => {
    try {
      const data = await trpc.crm.listClients.query();
      setClients(data as unknown as Client[]);
    } catch {
      // DB not connected yet - show empty state
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const filtered = clients.filter((c) => {
    const matchSearch =
      !search ||
      c.name.includes(search) ||
      c.businessType?.includes(search) ||
      c.businessName?.includes(search);
    const matchStatus = !filterStatus || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusCounts = STATUSES.map((s) => ({
    label: s,
    count: clients.filter((c) => c.status === s).length,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/"
            className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft size={14} />
            대시보드
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl chameleon-bg shadow-lg">
              <Users size={20} className="text-[#0a0a0a]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold chameleon-text">고객 관리</h1>
              <p className="text-sm text-slate-400">
                마케팅 프로젝트 관리
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-accent flex items-center gap-2 px-4 py-2.5 text-sm font-semibold"
        >
          <Plus size={16} />
          신규 고객
        </button>
      </div>

      {/* Status Pipeline */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterStatus("")}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            !filterStatus
              ? "chameleon-badge"
              : "bg-white/5 text-slate-400 hover:bg-white/10"
          }`}
        >
          전체 {clients.length}
        </button>
        {statusCounts.map((s) => (
          <button
            key={s.label}
            onClick={() =>
              setFilterStatus(filterStatus === s.label ? "" : s.label)
            }
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filterStatus === s.label
                ? "chameleon-badge"
                : "bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
          >
            {s.label} {s.count}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          type="text"
          placeholder="이름, 업종, 사업장명으로 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-[#D4AF37]/15 bg-black/40 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none"
        />
      </div>

      {/* Client List */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Users size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">
            {clients.length === 0
              ? "등록된 고객이 없습니다"
              : "검색 결과가 없습니다"}
          </p>
          {clients.length === 0 && (
            <p className="mt-2 text-sm text-slate-500">
              신규 고객을 추가하거나{" "}
              <Link href="/intake" className="text-[#D4AF37] hover:underline">
                설문 링크
              </Link>
              를 공유하세요
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-[1fr_100px_100px_120px_80px_40px] items-center gap-4 px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
            <span>고객</span>
            <span>업종</span>
            <span>SNS</span>
            <span>프로젝트</span>
            <span>상태</span>
            <span />
          </div>

          {filtered.map((client) => (
            <Link
              key={client.id}
              href={`/crm/${client.id}`}
              className="group grid grid-cols-1 sm:grid-cols-[1fr_100px_100px_120px_80px_40px] items-center gap-2 sm:gap-4 rounded-xl chameleon-border-slow bg-black/40 p-4 transition-all hover:chameleon-glow"
            >
              <div>
                <p className="font-semibold text-white">{client.name}</p>
                <p className="text-xs text-slate-500">
                  {client.businessName || client.phone || "정보 없음"}
                </p>
              </div>
              <p className="text-sm text-slate-400">
                {client.businessType || "-"}
              </p>
              <div className="flex gap-1.5">
                {client.snsInstagram && (
                  <span className="text-xs text-pink-400">IG</span>
                )}
                {client.snsTiktok && (
                  <span className="text-xs text-cyan-400">TT</span>
                )}
                {client.snsYoutube && (
                  <span className="text-xs text-red-400">YT</span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {client.projects.length > 0
                  ? `${client.projects.length}건 진행`
                  : "-"}
              </p>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  STATUS_COLORS[client.status] || "bg-white/10 text-slate-400"
                }`}
              >
                {client.status}
              </span>
              <ChevronRight
                size={16}
                className="text-slate-600 group-hover:chameleon-icon transition-colors"
              />
            </Link>
          ))}
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <AddClientModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            loadClients();
          }}
        />
      )}
    </div>
  );
}

function AddClientModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    businessType: "",
    businessName: "",
    snsInstagram: "",
    snsTiktok: "",
    snsYoutube: "",
    snsBlog: "",
    marketingGoal: "",
    monthlyBudget: "",
  });
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [aiInsight, setAiInsight] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!form.businessName.trim()) return;
    setAnalyzing(true);
    try {
      const result = await trpc.crm.analyzeBusiness.mutate({ businessName: form.businessName });
      if (!result.error) {
        setAiInsight(result);
        setForm((prev) => ({
          ...prev,
          businessType: result.businessType || prev.businessType,
          marketingGoal: result.marketingNeeds || prev.marketingGoal,
        }));
      }
    } catch { /* ignore */ }
    setAnalyzing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await trpc.crm.createClient.mutate(form);
      onCreated();
    } catch {
      alert("저장 실패. DB 연결을 확인하세요.");
      setSaving(false);
    }
  };

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[#D4AF37]/20 bg-[#0d0d0d] p-6 max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">신규 고객 등록</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="이름 *" value={form.name} onChange={(v) => set("name", v)} />
            <Input label="연락처" value={form.phone} onChange={(v) => set("phone", v)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="업종" value={form.businessType} onChange={(v) => set("businessType", v)} />
            <div>
              <label className="mb-1 block text-xs text-slate-400">사업장명</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => set("businessName", e.target.value)}
                  className="flex-1 rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={analyzing || !form.businessName.trim()}
                  className="shrink-0 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-2.5 py-2 text-xs font-bold text-white disabled:opacity-40 transition-opacity flex items-center gap-1"
                >
                  {analyzing ? <div className="chameleon-spinner !w-3 !h-3 !border-2" /> : <Sparkles size={12} />}
                  AI
                </button>
              </div>
            </div>
          </div>

          {/* AI 분석 결과 카드 */}
          {aiInsight && !aiInsight.error && (
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4 space-y-2">
              <p className="text-xs font-bold text-purple-300 flex items-center gap-1"><Sparkles size={12} /> AI 분석 결과</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-slate-500">추정 업종:</span> <span className="text-white">{aiInsight.businessType}</span></div>
                <div><span className="text-slate-500">추정 서비스:</span> <span className="text-white">{aiInsight.services}</span></div>
                <div><span className="text-slate-500">타겟:</span> <span className="text-white">{aiInsight.target}</span></div>
                <div><span className="text-slate-500">경쟁 강도:</span> <span className="text-white">{aiInsight.competitionLevel}</span></div>
              </div>
              {aiInsight.reelsTopics && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {aiInsight.reelsTopics.map((t: string, i: number) => (
                    <span key={i} className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] text-purple-300">{t}</span>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-slate-500">추천 패키지: {aiInsight.recommendedPackage} · 예상 예산: {aiInsight.estimatedBudget}</p>
            </div>
          )}
          <p className="text-xs font-medium text-slate-400 pt-2">SNS 채널</p>
          <div className="grid grid-cols-2 gap-3">
            <Input label="인스타그램" value={form.snsInstagram} onChange={(v) => set("snsInstagram", v)} placeholder="@계정 또는 팔로워수" />
            <Input label="틱톡" value={form.snsTiktok} onChange={(v) => set("snsTiktok", v)} />
            <Input label="유튜브" value={form.snsYoutube} onChange={(v) => set("snsYoutube", v)} />
            <Input label="블로그" value={form.snsBlog} onChange={(v) => set("snsBlog", v)} />
          </div>
          <Input label="마케팅 목표" value={form.marketingGoal} onChange={(v) => set("marketingGoal", v)} placeholder="브랜딩/매출/팔로워 등" />
          <Input label="월 마케팅 예산" value={form.monthlyBudget} onChange={(v) => set("monthlyBudget", v)} placeholder="예: 100만원" />
          <button
            type="submit"
            disabled={saving || !form.name.trim()}
            className="btn-accent w-full py-2.5 text-sm font-semibold text-white"
          >
            {saving ? "저장 중..." : "고객 등록"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-slate-400">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none"
      />
    </div>
  );
}
