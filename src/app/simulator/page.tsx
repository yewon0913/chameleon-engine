"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calculator, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";

const PACKAGES = [
  { key: "basic", label: "BASIC", price: "200만원/월" },
  { key: "standard", label: "STANDARD", price: "300만원/월" },
  { key: "premium", label: "PREMIUM", price: "500만원/월" },
] as const;

interface SimResult {
  monthly: number;
  yearly: number;
  hourlyRate: number;
  monthlyProjection: number[];
  breakdown: { agency: number; kmong: number; direct: number };
}

export default function SimulatorPage() {
  const [form, setForm] = useState({
    agencyClients: 3,
    packageType: "standard" as string,
    kmongOrders: 5,
    kmongAvgPrice: 300000,
    directSales: 2,
  });
  const [result, setResult] = useState<SimResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const set = (key: string, value: number | string) => setForm((p) => ({ ...p, [key]: value }));

  const calculate = async () => {
    setLoading(true);
    try {
      const data = await trpc.simulator.calculate.mutate({
        agencyClients: form.agencyClients,
        packageType: form.packageType as "basic" | "standard" | "premium",
        kmongOrders: form.kmongOrders,
        kmongAvgPrice: form.kmongAvgPrice,
        directSales: form.directSales,
      });
      setResult(data as SimResult);
    } catch {
      setToast("계산 실패"); setTimeout(() => setToast(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) => n.toLocaleString();
  const maxProjection = result ? Math.max(...result.monthlyProjection) : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft size={14} /> 대시보드
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl chameleon-bg shadow-lg">
            <Calculator size={20} className="text-[#0a0a0a]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold chameleon-text">수익 시뮬레이터</h1>
            <p className="text-sm text-slate-400">예상 수익을 시뮬레이션하세요</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <div className="rounded-2xl chameleon-border-slow bg-black/40 p-6">
          <h2 className="text-lg font-bold text-white mb-4">수익 조건 입력</h2>
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">운영대행 클라이언트 수</label>
              <input type="range" min={0} max={20} value={form.agencyClients}
                onChange={(e) => set("agencyClients", Number(e.target.value))} className="w-full accent-purple-500" />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0</span>
                <span className="chameleon-text font-bold text-sm">{form.agencyClients}곳</span>
                <span>20</span>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">패키지 종류</label>
              <div className="flex gap-2">
                {PACKAGES.map((p) => (
                  <button key={p.key} onClick={() => set("packageType", p.key)}
                    className={`flex-1 rounded-xl border px-3 py-2.5 text-center transition-all ${form.packageType === p.key ? "chameleon-border chameleon-bg-subtle text-white" : "chameleon-border-slow bg-black/40 text-slate-400"}`}>
                    <p className="text-xs font-bold">{p.label}</p>
                    <p className="text-[10px] text-slate-500">{p.price}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-slate-400">크몽 월 주문 수</label>
                <input type="number" value={form.kmongOrders} onChange={(e) => set("kmongOrders", Number(e.target.value))}
                  min={0} className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">크몽 평균 단가 (원)</label>
                <input type="number" value={form.kmongAvgPrice} onChange={(e) => set("kmongAvgPrice", Number(e.target.value))}
                  min={0} step={10000} className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">직접 영업 건수 (월)</label>
              <input type="number" value={form.directSales} onChange={(e) => set("directSales", Number(e.target.value))}
                min={0} className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white focus:outline-none" />
            </div>

            <button onClick={calculate} disabled={loading}
              className="btn-accent w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2">
              {loading ? "계산 중..." : <><Calculator size={14} /> 수익 시뮬레이션</>}
            </button>
          </div>
        </div>

        {/* Result Panel */}
        {result ? (
          <div className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl chameleon-border-slow bg-black/40 p-4 text-center">
                <p className="text-[10px] text-slate-500">월 예상 수익</p>
                <p className="text-2xl font-extrabold chameleon-text">{fmt(result.monthly)}원</p>
              </div>
              <div className="rounded-xl chameleon-border-slow bg-black/40 p-4 text-center">
                <p className="text-[10px] text-slate-500">연간 누적</p>
                <p className="text-2xl font-extrabold chameleon-text">{fmt(result.yearly)}원</p>
              </div>
              <div className="rounded-xl chameleon-border-slow bg-black/40 p-4 text-center">
                <p className="text-[10px] text-slate-500">시급 환산</p>
                <p className="text-xl font-bold text-white">{fmt(result.hourlyRate)}원</p>
              </div>
              <div className="rounded-xl chameleon-border-slow bg-black/40 p-4 text-center">
                <p className="text-[10px] text-slate-500">클라이언트 +1 추가 시</p>
                <p className="text-xl font-bold text-emerald-400">+{fmt(form.packageType === "basic" ? 2000000 : form.packageType === "standard" ? 3000000 : 5000000)}원</p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="rounded-xl chameleon-border-slow bg-black/40 p-4">
              <h3 className="text-xs font-bold text-slate-400 mb-3">수익 구성</h3>
              {[
                { label: "운영대행", value: result.breakdown.agency, color: "bg-purple-500" },
                { label: "크몽", value: result.breakdown.kmong, color: "bg-emerald-500" },
                { label: "직접 영업", value: result.breakdown.direct, color: "bg-yellow-500" },
              ].map((item) => (
                <div key={item.label} className="mb-2">
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>{item.label}</span>
                    <span>{fmt(item.value)}원</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${result.monthly > 0 ? (item.value / result.monthly) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* 12 Month Projection */}
            <div className="rounded-xl chameleon-border-slow bg-black/40 p-4">
              <h3 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-1">
                <TrendingUp size={12} /> 12개월 성장 곡선
              </h3>
              <div className="flex items-end gap-1 h-32">
                {result.monthlyProjection.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full chameleon-bg rounded-t transition-all"
                      style={{ height: `${maxProjection > 0 ? (val / maxProjection) * 100 : 0}%` }} />
                    <span className="text-[8px] text-slate-600">{i + 1}월</span>
                  </div>
                ))}
              </div>
              <p className="text-center text-[10px] text-slate-500 mt-2">
                12개월 후 예상: <span className="chameleon-text font-bold">{fmt(result.monthlyProjection[11] || 0)}원/월</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-2xl chameleon-border-slow bg-black/40 p-12">
            <div className="text-center">
              <Calculator size={48} className="mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400">조건을 입력하고 시뮬레이션하세요</p>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-red-500/90 px-5 py-2.5 text-sm font-bold text-white shadow-2xl animate-pulse">
          {toast}
        </div>
      )}
    </div>
  );
}
