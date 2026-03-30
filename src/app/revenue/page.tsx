"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Briefcase,
  UserPlus,
  DollarSign,
  Plus,
  Target,
  X,
  Trash2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { trpc } from "@/lib/trpc";

const CHANNEL_COLORS = ["#FF6B35", "#3B82F6", "#10B981", "#A855F7"];
const SERVICE_COLORS = ["#FF6B35", "#F59E0B", "#3B82F6", "#10B981", "#A855F7", "#EC4899"];

interface KPI {
  revenue: number;
  revenueChange: number;
  activeProjects: number;
  newClients: number;
  avgPrice: number;
}

interface RevenueRow {
  id: string;
  amount: number;
  serviceType: string;
  channel: string;
  status: string;
  settledAt: string | null;
  createdAt: string;
  clientName: string | null;
  clientId: string | null;
}

interface Dashboard {
  kpi: KPI;
  monthlyRevenue: { month: string; total: number }[];
  byChannel: { channel: string; total: number }[];
  byService: { serviceType: string; total: number }[];
  goal: { month: string; targetAmount: number } | null;
  currentMonth: string;
}

export default function RevenuePage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [revenues, setRevenues] = useState<RevenueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddRevenue, setShowAddRevenue] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  const load = async () => {
    try {
      const [dash, revs] = await Promise.all([
        trpc.revenue.getDashboard.query(),
        trpc.revenue.listRevenue.query(),
      ]);
      setDashboard(dash as unknown as Dashboard);
      setRevenues(revs as unknown as RevenueRow[]);
    } catch {
      // DB not connected
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleSettle = async (id: string, current: string) => {
    const next = current === "미정산" ? "정산완료" : "미정산";
    await trpc.revenue.updateRevenueStatus.mutate({ id, status: next as "미정산" | "정산완료" });
    load();
  };

  const deleteRevenue = async (id: string) => {
    await trpc.revenue.deleteRevenue.mutate({ id });
    load();
  };

  const kpi = dashboard?.kpi;
  const goalProgress = dashboard?.goal
    ? Math.min(100, Math.round((kpi!.revenue / dashboard.goal.targetAmount) * 100))
    : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft size={14} />
          대시보드
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <DollarSign size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">수익 대시보드</h1>
              <p className="text-sm text-slate-400">매출과 성과를 한눈에</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowGoalModal(true)}
              className="btn-ghost flex items-center gap-2 px-3 py-2 text-sm text-slate-300"
            >
              <Target size={14} />
              목표 설정
            </button>
            <button
              onClick={() => setShowAddRevenue(true)}
              className="btn-accent flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus size={16} />
              매출 등록
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">불러오는 중...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KPICard
              label="이번 달 매출"
              value={`${(kpi?.revenue ?? 0).toLocaleString()}원`}
              change={kpi?.revenueChange ?? 0}
              icon={<DollarSign size={18} />}
              color="from-[#FF6B35] to-orange-600"
            />
            <KPICard
              label="진행중 프로젝트"
              value={`${kpi?.activeProjects ?? 0}건`}
              icon={<Briefcase size={18} />}
              color="from-blue-500 to-cyan-600"
            />
            <KPICard
              label="신규 고객"
              value={`${kpi?.newClients ?? 0}명`}
              icon={<UserPlus size={18} />}
              color="from-purple-500 to-violet-600"
            />
            <KPICard
              label="평균 객단가"
              value={`${(kpi?.avgPrice ?? 0).toLocaleString()}원`}
              icon={<TrendingUp size={18} />}
              color="from-emerald-500 to-teal-600"
            />
          </div>

          {/* Goal Progress */}
          {dashboard?.goal && (
            <div className="mb-8 rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Target size={14} className="text-[#FF6B35]" />
                  월 목표 달성률
                </h3>
                <span className="text-sm text-slate-400">
                  {(kpi?.revenue ?? 0).toLocaleString()}원 / {dashboard.goal.targetAmount.toLocaleString()}원
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] to-orange-400 transition-all duration-500"
                  style={{ width: `${goalProgress}%` }}
                />
              </div>
              <p className="mt-2 text-right text-sm font-bold text-[#FF6B35]">
                {goalProgress}%
              </p>
            </div>
          )}

          {/* Charts */}
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            {/* Monthly Revenue Bar Chart */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <h3 className="mb-4 text-sm font-semibold text-white">
                월별 매출 추이
              </h3>
              {(dashboard?.monthlyRevenue?.length ?? 0) > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dashboard!.monthlyRevenue}>
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: string) => {
                        const parts = v.split("-");
                        return `${parts[1]}월`;
                      }}
                    />
                    <YAxis
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) =>
                        v >= 10000 ? `${(v / 10000).toFixed(0)}만` : String(v)
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#1a1a1a",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                      formatter={(value) => [`${Number(value).toLocaleString()}원`, "매출"]}
                    />
                    <Bar
                      dataKey="total"
                      fill="#FF6B35"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart text="매출 데이터가 없습니다" />
              )}
            </div>

            {/* Channel Pie Chart */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <h3 className="mb-4 text-sm font-semibold text-white">
                채널별 매출 비중
              </h3>
              {(dashboard?.byChannel?.length ?? 0) > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={dashboard!.byChannel.map((c) => ({
                        name: c.channel,
                        value: Number(c.total),
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      labelLine={false}
                    >
                      {dashboard!.byChannel.map((_, i) => (
                        <Cell
                          key={i}
                          fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend
                      wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#1a1a1a",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                      formatter={(value) => [`${Number(value).toLocaleString()}원`]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart text="채널 데이터가 없습니다" />
              )}
            </div>
          </div>

          {/* Service Revenue Bar Chart */}
          <div className="mb-8 rounded-xl border border-white/10 bg-white/[0.02] p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">
              서비스별 매출
            </h3>
            {(dashboard?.byService?.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={dashboard!.byService.map((s) => ({
                    name: s.serviceType,
                    total: Number(s.total),
                  }))}
                  layout="vertical"
                >
                  <XAxis
                    type="number"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) =>
                      v >= 10000 ? `${(v / 10000).toFixed(0)}만` : String(v)
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1a1a1a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(value) => [`${Number(value).toLocaleString()}원`, "매출"]}
                  />
                  <Bar dataKey="total" radius={[0, 6, 6, 0]} maxBarSize={24}>
                    {dashboard!.byService.map((_, i) => (
                      <Cell
                        key={i}
                        fill={SERVICE_COLORS[i % SERVICE_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart text="서비스 데이터가 없습니다" />
            )}
          </div>

          {/* Revenue Table */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">
              고객별 수익
            </h3>
            {revenues.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                등록된 매출이 없습니다
              </p>
            ) : (
              <div className="overflow-x-auto">
                {/* Table Header */}
                <div className="hidden sm:grid grid-cols-[1fr_100px_100px_80px_100px_60px] gap-4 px-3 py-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                  <span>고객명</span>
                  <span>서비스</span>
                  <span className="text-right">금액</span>
                  <span>상태</span>
                  <span>정산일</span>
                  <span />
                </div>
                <div className="space-y-1">
                  {revenues.map((r) => (
                    <div
                      key={r.id}
                      className="grid grid-cols-1 sm:grid-cols-[1fr_100px_100px_80px_100px_60px] items-center gap-2 sm:gap-4 rounded-lg border border-white/5 bg-white/[0.01] px-3 py-2.5"
                    >
                      <span className="text-sm font-medium text-white">
                        {r.clientName || "미지정"}
                      </span>
                      <span className="text-xs text-slate-400">{r.serviceType}</span>
                      <span className="text-sm font-semibold text-right text-[#FF6B35]">
                        {r.amount.toLocaleString()}원
                      </span>
                      <button
                        onClick={() => toggleSettle(r.id, r.status)}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                          r.status === "정산완료"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30"
                        }`}
                      >
                        {r.status}
                      </button>
                      <span className="text-xs text-slate-500">
                        {r.settledAt
                          ? new Date(r.settledAt).toLocaleDateString("ko-KR")
                          : "-"}
                      </span>
                      <button
                        onClick={() => deleteRevenue(r.id)}
                        className="text-slate-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Revenue Modal */}
      {showAddRevenue && (
        <AddRevenueModal
          onClose={() => setShowAddRevenue(false)}
          onCreated={() => {
            setShowAddRevenue(false);
            load();
          }}
        />
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <GoalModal
          current={dashboard?.goal ?? null}
          currentMonth={dashboard?.currentMonth ?? ""}
          onClose={() => setShowGoalModal(false)}
          onSaved={() => {
            setShowGoalModal(false);
            load();
          }}
        />
      )}
    </div>
  );
}

/* ── Sub Components ── */

function KPICard({
  label,
  value,
  change,
  icon,
  color,
}: {
  label: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${color}`}
        >
          {icon}
        </div>
        {change !== undefined && change !== 0 && (
          <span
            className={`flex items-center gap-0.5 text-xs font-medium ${
              change > 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {change > 0 ? "+" : ""}
            {change}%
          </span>
        )}
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-[11px] text-slate-500">{label}</p>
    </div>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="flex h-[220px] items-center justify-center">
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  );
}

function AddRevenueModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    amount: "",
    serviceType: "릴스/숏폼",
    channel: "직접" as "크몽" | "직접" | "소개" | "기타",
    clientId: "",
  });
  const [saving, setSaving] = useState(false);

  const serviceTypes = [
    "릴스/숏폼",
    "상세페이지",
    "블로그",
    "카드뉴스",
    "SNS운영대행",
    "마케팅패키지",
  ];
  const channels = ["크몽", "직접", "소개", "기타"] as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(form.amount);
    if (!amount || amount <= 0) return;
    setSaving(true);
    try {
      await trpc.revenue.createRevenue.mutate({
        amount,
        serviceType: form.serviceType,
        channel: form.channel,
        clientId: form.clientId || undefined,
      });
      onCreated();
    } catch {
      alert("저장 실패. DB 연결을 확인하세요.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">매출 등록</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-slate-400">금액 (원) *</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              placeholder="150000"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-[#FF6B35]/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-slate-400">서비스 유형</label>
            <div className="flex flex-wrap gap-2">
              {serviceTypes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, serviceType: s }))}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    form.serviceType === s
                      ? "bg-[#FF6B35] text-white"
                      : "bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-slate-400">유입 채널</label>
            <div className="flex gap-2">
              {channels.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, channel: c }))}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    form.channel === c
                      ? "bg-[#FF6B35] text-white"
                      : "bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={saving || !form.amount}
            className="btn-accent w-full py-2.5 text-sm font-semibold text-white"
          >
            {saving ? "저장 중..." : "매출 등록"}
          </button>
        </form>
      </div>
    </div>
  );
}

function GoalModal({
  current,
  currentMonth,
  onClose,
  onSaved,
}: {
  current: { month: string; targetAmount: number } | null;
  currentMonth: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [month, setMonth] = useState(current?.month || currentMonth);
  const [amount, setAmount] = useState(
    current ? String(current.targetAmount) : ""
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(amount);
    if (!target || target <= 0) return;
    setSaving(true);
    try {
      await trpc.revenue.setGoal.mutate({
        month,
        targetAmount: target,
      });
      onSaved();
    } catch {
      alert("저장 실패");
      setSaving(false);
    }
  };

  const presets = [
    { label: "50만", value: 500000 },
    { label: "100만", value: 1000000 },
    { label: "300만", value: 3000000 },
    { label: "500만", value: 5000000 },
    { label: "1000만", value: 10000000 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">월 목표 설정</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-slate-400">대상 월</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#FF6B35]/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">목표 매출 (원)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="3000000"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-[#FF6B35]/50 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setAmount(String(p.value))}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  amount === String(p.value)
                    ? "bg-[#FF6B35] text-white"
                    : "bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={saving || !amount}
            className="btn-accent w-full py-2.5 text-sm font-semibold text-white"
          >
            {saving ? "저장 중..." : "목표 설정"}
          </button>
        </form>
      </div>
    </div>
  );
}
