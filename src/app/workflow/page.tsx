"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
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

type StageStatus = "done" | "active" | "pending";

interface ModuleDef {
  href: string;
  icon: typeof Film;
  name: string;
  desc: string;
  active: boolean;
}

interface StageDef {
  step: number;
  title: string;
  subtitle: string;
  status: StageStatus;
  color: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  glowColor: string;
  modules: ModuleDef[];
}

const STAGES: StageDef[] = [
  {
    step: 1,
    title: "기획",
    subtitle: "시장 분석 → 전략 수립",
    status: "done",
    color: "from-purple-500 to-violet-600",
    borderColor: "border-purple-500/40",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-300",
    glowColor: "shadow-purple-500/20",
    modules: [
      { href: "/analytics", icon: BarChart2, name: "경쟁사 분석", desc: "트렌드 확인, 벤치마킹", active: true },
      { href: "/calendar", icon: CalendarDays, name: "콘텐츠 캘린더", desc: "월간 일정, 시즌 반영", active: true },
      { href: "/calendar", icon: Sparkles, name: "AI 자동 기획", desc: "주제/채널 자동 배치", active: true },
    ],
  },
  {
    step: 2,
    title: "생성",
    subtitle: "콘텐츠 제작 → 채널 최적화",
    status: "active",
    color: "from-emerald-500 to-teal-600",
    borderColor: "border-emerald-500/40",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-300",
    glowColor: "shadow-emerald-500/20",
    modules: [
      { href: "/content", icon: Film, name: "콘텐츠 공장", desc: "릴스/블로그/카드뉴스", active: true },
      { href: "/osmu", icon: Layers, name: "OSMU 재활용", desc: "1개→5채널 자동 변환", active: true },
      { href: "/hashtag", icon: Hash, name: "해시태그 최적화", desc: "채널별 30개 AI 추천", active: true },
    ],
  },
  {
    step: 3,
    title: "배포 & 수익화",
    subtitle: "다채널 배포 → 성과 분석",
    status: "active",
    color: "from-yellow-500 to-amber-600",
    borderColor: "border-yellow-500/40",
    bgColor: "bg-yellow-500/10",
    textColor: "text-yellow-300",
    glowColor: "shadow-yellow-500/20",
    modules: [
      { href: "/deploy", icon: Send, name: "배포 관리", desc: "다채널 배포, AI 최적화", active: true },
      { href: "/report", icon: FileText, name: "성과 리포트", desc: "AI 리포트, 카톡 변환", active: true },
      { href: "/revenue", icon: BarChart3, name: "수익 대시보드", desc: "매출 추이, ROI 분석", active: true },
    ],
  },
  {
    step: 4,
    title: "고객 관리",
    subtitle: "발굴 → 계약 → 육성 → 포트폴리오",
    status: "active",
    color: "from-pink-500 to-rose-600",
    borderColor: "border-pink-500/40",
    bgColor: "bg-pink-500/10",
    textColor: "text-pink-300",
    glowColor: "shadow-pink-500/20",
    modules: [
      { href: "/outbound", icon: Target, name: "영업 자동화", desc: "잠재고객 발굴, AI 제안", active: true },
      { href: "/crm", icon: Users, name: "CRM", desc: "계약 관리, 프로젝트 추적", active: true },
      { href: "/funnel", icon: GitBranch, name: "고객 퍼널", desc: "5단계 자동 육성", active: true },
      { href: "/portfolio", icon: Briefcase, name: "포트폴리오", desc: "실적 관리, 공개 URL", active: true },
    ],
  },
];

const TOTAL_MODULES = 18;
const ACTIVE_MODULES = 18;

export default function WorkflowPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <style>{`
        @keyframes flow-light {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes flow-light-fast {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes stage-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(139,92,246,0.1); }
          50% { box-shadow: 0 0 30px rgba(139,92,246,0.2); }
        }
        .flow-arrow-h {
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(139,92,246,0.7) 15%,
            rgba(16,185,129,0.7) 35%,
            rgba(245,208,97,0.7) 55%,
            rgba(236,72,153,0.7) 75%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: flow-light 3s linear infinite;
        }
        .flow-arrow-v {
          background: linear-gradient(180deg,
            transparent 0%,
            rgba(139,92,246,0.7) 15%,
            rgba(16,185,129,0.7) 35%,
            rgba(245,208,97,0.7) 55%,
            rgba(236,72,153,0.7) 75%,
            transparent 100%
          );
          background-size: 100% 200%;
          animation: flow-light 3s linear infinite;
        }
        .flow-arrow-fast {
          animation-duration: 1.5s !important;
        }
        .stage-done {
          animation: glow-pulse 4s ease-in-out infinite;
        }
        .stage-active {
          animation: stage-glow 3s ease-in-out infinite;
        }
        .module-active {
          position: relative;
          overflow: hidden;
        }
        .module-active::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg,
            transparent,
            rgba(255,255,255,0.03),
            transparent
          );
          animation: flow-light 4s linear infinite;
        }
        .module-inactive {
          opacity: 0.4;
          filter: grayscale(0.5);
        }
        .progress-glow {
          position: relative;
          overflow: hidden;
        }
        .progress-glow::after {
          content: '';
          position: absolute;
          top: 0;
          left: -50%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg,
            transparent,
            rgba(255,255,255,0.3),
            transparent
          );
          animation: flow-light 2s linear infinite;
        }
      `}</style>

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
            className="h-full rounded-full chameleon-bg progress-glow transition-all duration-1000"
            style={{ width: `${(ACTIVE_MODULES / TOTAL_MODULES) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-[10px] text-slate-500 text-right">
          {Math.round((ACTIVE_MODULES / TOTAL_MODULES) * 100)}% 완료
        </p>
      </div>

      {/* Pipeline Header */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {STAGES.map((stage, i) => (
          <div key={stage.step} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold ${
              stage.status === "done"
                ? "bg-emerald-500/20 text-emerald-300"
                : stage.status === "active"
                ? `${stage.bgColor} ${stage.textColor}`
                : "bg-white/5 text-slate-600"
            }`}>
              {stage.status === "done" && <Check size={10} />}
              {stage.step}. {stage.title}
            </div>
            {i < STAGES.length - 1 && (
              <div className="flow-arrow-h h-[2px] w-8 rounded-full" />
            )}
          </div>
        ))}
      </div>

      {/* Workflow Stages */}
      <div className="space-y-0">
        {STAGES.map((stage, si) => (
          <div key={stage.step}>
            {/* Stage Card */}
            <div className={`rounded-2xl border p-6 transition-all ${
              stage.status === "done"
                ? `${stage.borderColor} ${stage.bgColor} stage-done shadow-lg ${stage.glowColor}`
                : stage.status === "active"
                ? `${stage.borderColor} ${stage.bgColor} stage-active shadow-lg ${stage.glowColor}`
                : "border-dashed border-white/10 bg-black/20"
            }`}>
              {/* Stage Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-extrabold shadow-lg ${
                  stage.status === "done"
                    ? "bg-emerald-500 text-white"
                    : stage.status === "active"
                    ? `bg-gradient-to-br ${stage.color} text-white`
                    : "bg-white/10 text-slate-500"
                }`}>
                  {stage.status === "done" ? <Check size={18} /> : stage.step}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className={`text-lg font-bold ${
                      stage.status === "pending" ? "text-slate-600" : stage.textColor
                    }`}>
                      {stage.step}단계: {stage.title}
                    </h2>
                    {stage.status === "done" && (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">완료</span>
                    )}
                    {stage.status === "active" && (
                      <span className={`rounded-full ${stage.bgColor} px-2 py-0.5 text-[10px] font-bold ${stage.textColor}`}>진행중</span>
                    )}
                  </div>
                  <p className={`text-xs ${stage.status === "pending" ? "text-slate-700" : "text-slate-500"}`}>{stage.subtitle}</p>
                </div>
              </div>

              {/* Modules Row */}
              <div className="flex items-stretch gap-0">
                {stage.modules.map((mod, mi) => (
                  <div key={mod.name} className="flex items-stretch flex-1 min-w-0">
                    {/* Module Card */}
                    <Link
                      href={mod.href}
                      className={`flex-1 group rounded-xl p-4 transition-all min-w-0 ${
                        mod.active
                          ? `module-active border ${stage.borderColor} bg-black/40 hover:bg-white/5`
                          : "module-inactive border border-dashed border-white/10 bg-black/20 pointer-events-none"
                      }`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg mb-2 ${
                        mod.active ? stage.bgColor : "bg-white/5"
                      }`}>
                        <mod.icon size={16} className={mod.active ? stage.textColor : "text-slate-600"} />
                      </div>
                      <p className={`text-xs font-bold truncate transition-colors ${
                        mod.active ? "text-white group-hover:chameleon-text" : "text-slate-600"
                      }`}>
                        {mod.name}
                      </p>
                      <p className={`mt-0.5 text-[10px] line-clamp-2 ${
                        mod.active ? "text-slate-500" : "text-slate-700"
                      }`}>{mod.desc}</p>
                    </Link>
                    {/* Arrow between modules */}
                    {mi < stage.modules.length - 1 && (
                      <div className="flex items-center px-1.5 shrink-0">
                        {mod.active && stage.modules[mi + 1]?.active ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <div className={`flow-arrow-h h-[3px] w-6 rounded-full ${stage.status === "active" ? "flow-arrow-fast" : ""}`} />
                          </div>
                        ) : (
                          <ArrowRight size={14} className="text-slate-700" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow between stages */}
            {si < STAGES.length - 1 && (
              <div className="flex justify-center py-2">
                <div className="flex flex-col items-center">
                  <div className={`flow-arrow-v w-[3px] h-10 rounded-full ${
                    STAGES[si + 1].status !== "pending" ? "" : "opacity-30"
                  }`} />
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
