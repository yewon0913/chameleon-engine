"use client";

import Link from "next/link";
import { Film, FileText, PenTool, Users } from "lucide-react";

const MODULES = [
  {
    href: "/content",
    icon: Film,
    label: "콘텐츠 공장",
    desc: "릴스, 블로그, 카드뉴스, 상세페이지를 원클릭으로 제작",
    color: "from-[#FF6B35] to-orange-600",
    ready: true,
  },
  {
    href: "#",
    icon: PenTool,
    label: "브랜딩 스튜디오",
    desc: "로고, 네이밍, 슬로건, 브랜드 가이드 AI 생성",
    color: "from-purple-500 to-violet-600",
    ready: false,
  },
  {
    href: "#",
    icon: Users,
    label: "고객 분석기",
    desc: "타겟 페르소나, 고객 여정, 경쟁사 분석",
    color: "from-blue-500 to-cyan-600",
    ready: false,
  },
  {
    href: "#",
    icon: FileText,
    label: "마케팅 플래너",
    desc: "월간 콘텐츠 캘린더, 캠페인 기획, ROI 분석",
    color: "from-emerald-500 to-teal-600",
    ready: false,
  },
];

export default function ChameleonDashboard() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
          Chameleon Factory
        </p>
        <h1
          className="mt-2 text-3xl font-extrabold text-white"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          카멜레온 콘텐츠 공장
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          AI로 SNS 콘텐츠를 원클릭 제작하세요
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {MODULES.map((m) => (
          <Link
            key={m.label}
            href={m.href}
            className={`group relative overflow-hidden rounded-2xl border bg-white/[0.03] p-6 transition-all ${
              m.ready
                ? "border-white/10 hover:border-[#FF6B35]/30 hover:shadow-xl hover:scale-[1.01]"
                : "border-white/5 opacity-50 pointer-events-none"
            }`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${m.color} opacity-[0.04] group-hover:opacity-[0.08] transition-opacity`}
            />
            <div className="relative">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${m.color} shadow-lg`}
              >
                <m.icon size={22} className="text-white" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-white">{m.label}</h2>
              <p className="mt-1 text-sm text-slate-400">{m.desc}</p>
              {!m.ready && (
                <span className="mt-3 inline-block rounded-full bg-white/10 px-3 py-0.5 text-[10px] font-medium text-slate-400">
                  Coming Soon
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
