"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  BarChart2,
  CalendarDays,
  Sparkles,
  Film,
  Layers,
  Hash,
  Send,
  FileText,
  BarChart3,
  Target,
  Users,
  GitBranch,
  Briefcase,
  Route,
} from "lucide-react";

const STAGES = [
  {
    step: 1,
    title: "기획",
    subtitle: "시장 분석 → 전략 수립",
    color: "from-purple-500 to-violet-600",
    borderColor: "border-purple-500/30",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-300",
    badgeColor: "bg-purple-500/20 text-purple-300",
    modules: [
      { href: "/analytics", icon: BarChart2, name: "경쟁사 분석", desc: "트렌드 확인, 경쟁사 벤치마킹" },
      { href: "/calendar", icon: CalendarDays, name: "콘텐츠 캘린더", desc: "월간 일정, 시즌 이벤트 반영" },
      { href: "/calendar", icon: Sparkles, name: "AI 자동 기획", desc: "주제/채널/날짜 자동 배치" },
    ],
  },
  {
    step: 2,
    title: "생성",
    subtitle: "콘텐츠 제작 → 채널 최적화",
    color: "from-emerald-500 to-teal-600",
    borderColor: "border-emerald-500/30",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-300",
    badgeColor: "bg-emerald-500/20 text-emerald-300",
    modules: [
      { href: "/content", icon: Film, name: "콘텐츠 공장", desc: "릴스/블로그/카드뉴스/상세페이지" },
      { href: "/osmu", icon: Layers, name: "OSMU 재활용", desc: "1개 입력 → 5채널 자동 변환" },
      { href: "/hashtag", icon: Hash, name: "해시태그 최적화", desc: "채널별 30개 AI 추천" },
    ],
  },
  {
    step: 3,
    title: "배포 & 수익화",
    subtitle: "다채널 배포 → 성과 분석",
    color: "from-yellow-500 to-amber-600",
    borderColor: "border-yellow-500/30",
    bgColor: "bg-yellow-500/10",
    textColor: "text-yellow-300",
    badgeColor: "bg-yellow-500/20 text-yellow-300",
    modules: [
      { href: "/deploy", icon: Send, name: "배포 관리", desc: "다채널 배포, 채널별 AI 최적화" },
      { href: "/report", icon: FileText, name: "성과 리포트", desc: "AI 리포트, 카톡 발송 변환" },
      { href: "/revenue", icon: BarChart3, name: "수익 대시보드", desc: "매출 추이, ROI 분석" },
    ],
  },
  {
    step: 4,
    title: "고객 관리",
    subtitle: "발굴 → 계약 → 육성 → 포트폴리오",
    color: "from-pink-500 to-rose-600",
    borderColor: "border-pink-500/30",
    bgColor: "bg-pink-500/10",
    textColor: "text-pink-300",
    badgeColor: "bg-pink-500/20 text-pink-300",
    modules: [
      { href: "/outbound", icon: Target, name: "영업 자동화", desc: "잠재고객 발굴, AI 제안" },
      { href: "/crm", icon: Users, name: "CRM", desc: "계약 관리, 프로젝트 추적" },
      { href: "/funnel", icon: GitBranch, name: "고객 퍼널", desc: "5단계 자동 육성 시퀀스" },
      { href: "/portfolio", icon: Briefcase, name: "포트폴리오", desc: "실적 관리, 공개 URL" },
    ],
  },
];

const TOTAL_MODULES = 17;
const ACTIVE_MODULES = 17;

export default function WorkflowPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft size={14} /> 대시보드
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl chameleon-bg shadow-lg">
            <Route size={20} className="text-[#0a0a0a]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold chameleon-text">워크플로우 가이드</h1>
            <p className="text-sm text-slate-400">카멜레온 플랫폼 최적 작업 흐름</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-10 rounded-2xl chameleon-border-slow bg-black/40 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-white">전체 모듈 활성 현황</p>
          <span className="chameleon-badge text-xs">{ACTIVE_MODULES} / {TOTAL_MODULES} 활성</span>
        </div>
        <div className="h-3 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full chameleon-bg transition-all duration-1000"
            style={{ width: `${(ACTIVE_MODULES / TOTAL_MODULES) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-[10px] text-slate-500 text-right">
          {Math.round((ACTIVE_MODULES / TOTAL_MODULES) * 100)}% 완료
        </p>
      </div>

      {/* Workflow Stages */}
      <div className="space-y-0">
        {STAGES.map((stage, si) => (
          <div key={stage.step}>
            {/* Stage Card */}
            <div className={`rounded-2xl border ${stage.borderColor} ${stage.bgColor} p-6`}>
              {/* Stage Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${stage.color} text-white text-sm font-extrabold shadow-lg`}>
                  {stage.step}
                </div>
                <div>
                  <h2 className={`text-lg font-bold ${stage.textColor}`}>
                    {stage.step}단계: {stage.title}
                  </h2>
                  <p className="text-xs text-slate-500">{stage.subtitle}</p>
                </div>
              </div>

              {/* Modules Row */}
              <div className="flex items-stretch gap-0">
                {stage.modules.map((mod, mi) => (
                  <div key={mod.name} className="flex items-stretch flex-1 min-w-0">
                    {/* Module Card */}
                    <Link
                      href={mod.href}
                      className="flex-1 group rounded-xl border border-white/10 bg-black/40 p-4 hover:border-white/20 hover:bg-white/5 transition-all min-w-0"
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stage.bgColor} mb-2`}>
                        <mod.icon size={16} className={stage.textColor} />
                      </div>
                      <p className="text-xs font-bold text-white group-hover:chameleon-text transition-colors truncate">
                        {mod.name}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-500 line-clamp-2">{mod.desc}</p>
                    </Link>
                    {/* Arrow between modules */}
                    {mi < stage.modules.length - 1 && (
                      <div className="flex items-center px-2 shrink-0">
                        <ArrowRight size={16} className={`${stage.textColor} opacity-50`} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow between stages */}
            {si < STAGES.length - 1 && (
              <div className="flex justify-center py-3">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-0.5 h-4 chameleon-bg rounded-full opacity-40" />
                  <ArrowDown size={20} className="chameleon-text opacity-60" />
                  <div className="w-0.5 h-4 chameleon-bg rounded-full opacity-40" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-10 rounded-2xl chameleon-border-slow bg-black/40 p-6 text-center">
        <p className="text-sm font-bold text-white mb-1">모든 단계가 유기적으로 연결됩니다</p>
        <p className="text-xs text-slate-500 mb-4">기획 → 생성 → 배포 → 고객 관리 순환 워크플로우</p>
        <Link href="/content" className="btn-accent inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold">
          <Sparkles size={14} /> 콘텐츠 만들기 시작
        </Link>
      </div>
    </div>
  );
}
