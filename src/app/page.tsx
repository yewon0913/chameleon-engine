"use client";

import Link from "next/link";
import { Film, FileText, PenTool, Users, ClipboardList, BarChart3 } from "lucide-react";

const MODULES = [
  {
    href: "/content",
    icon: Film,
    label: "콘텐츠 공장",
    desc: "릴스, 블로그, 카드뉴스, 상세페이지를 원클릭으로 제작",
    ready: true,
  },
  {
    href: "/crm",
    icon: Users,
    label: "고객 관리 (CRM)",
    desc: "마케팅 고객 관리, 프로젝트 추적, 견적서 생성",
    ready: true,
  },
  {
    href: "/intake",
    icon: ClipboardList,
    label: "고객 설문",
    desc: "신규 고객 마케팅 상담 설문 페이지",
    ready: true,
  },
  {
    href: "/revenue",
    icon: BarChart3,
    label: "수익 대시보드",
    desc: "매출 추이, 채널별 분석, 목표 달성률, 정산 관리",
    ready: true,
  },
  {
    href: "#",
    icon: PenTool,
    label: "브랜딩 스튜디오",
    desc: "로고, 네이밍, 슬로건, 브랜드 가이드 AI 생성",
    ready: false,
  },
  {
    href: "#",
    icon: FileText,
    label: "마케팅 플래너",
    desc: "월간 콘텐츠 캘린더, 캠페인 기획, ROI 분석",
    ready: false,
  },
];

export default function ChameleonDashboard() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Hero */}
      <div className="mb-4 text-center">
        <h1 className="chameleon-text text-4xl font-extrabold tracking-tight sm:text-5xl">
          CHAMELEON
        </h1>
        <p className="mt-3 text-lg font-semibold chameleon-text">
          AI 수익화 플랫폼
        </p>
        <p className="mt-1 text-sm text-slate-500">
          소상공인 마케팅 콘텐츠를 원클릭으로 제작하고 수익을 관리하세요
        </p>
      </div>

      {/* Chameleon divider */}
      <div className="chameleon-underline mx-auto mb-10 w-32 rounded-full" />

      {/* Module Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {MODULES.map((m) => (
          <Link
            key={m.label}
            href={m.href}
            className={`group relative overflow-hidden rounded-2xl p-6 transition-all ${
              m.ready
                ? "card-luxury hover:scale-[1.01]"
                : "card-luxury opacity-40 pointer-events-none"
            }`}
          >
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl chameleon-bg shadow-lg">
                <m.icon size={22} className="text-[#0a0a0a]" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-white group-hover:chameleon-text transition-colors">
                {m.label}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{m.desc}</p>
              {m.ready && (
                <span className="mt-3 inline-block chameleon-badge">
                  활성
                </span>
              )}
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
