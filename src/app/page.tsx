"use client";

import Link from "next/link";
import {
  Film,
  FileText,
  Users,
  ClipboardList,
  BarChart3,
  CalendarDays,
  Send,
  Target,
  BarChart2,
  Briefcase,
  Layers,
  Hash,
  Calculator,
  MessageSquare,
  Bot,
  GitBranch,
  FlaskConical,
  Route,
} from "lucide-react";

const MODULES = [
  { href: "/workflow", icon: Route, label: "작업 흐름 가이드", desc: "기획→생성→배포→고객관리 워크플로우", ready: true },
  { href: "/content", icon: Film, label: "콘텐츠 공장", desc: "릴스, 블로그, 카드뉴스, 상세페이지 원클릭 제작", ready: true },
  { href: "/osmu", icon: Layers, label: "OSMU 재활용", desc: "1개 입력 → 5채널 콘텐츠 자동 변환", ready: true },
  { href: "/calendar", icon: CalendarDays, label: "콘텐츠 캘린더", desc: "월간 캘린더, AI 자동 기획, 시즌 이벤트", ready: true },
  { href: "/deploy", icon: Send, label: "배포 관리", desc: "다채널 배포, 채널별 AI 최적화, 성과 추적", ready: true },
  { href: "/crm", icon: Users, label: "고객 관리 (CRM)", desc: "고객 관리, 프로젝트 추적, 견적서 생성", ready: true },
  { href: "/outbound", icon: Target, label: "영업 자동화", desc: "잠재 고객 발굴, AI 제안 메시지, 발송 관리", ready: true },
  { href: "/analytics", icon: BarChart2, label: "경쟁사 분석", desc: "트렌드 분석, 성과 예측, 트렌드 레이더", ready: true },
  { href: "/report", icon: FileText, label: "성과 리포트", desc: "AI 리포트 자동 생성, 카톡 발송용 변환", ready: true },
  { href: "/portfolio", icon: Briefcase, label: "포트폴리오", desc: "완료 프로젝트 포트폴리오, 공개 URL 생성", ready: true },
  { href: "/revenue", icon: BarChart3, label: "수익 대시보드", desc: "매출 추이, 채널별 분석, ROI 추적", ready: true },
  { href: "/hashtag", icon: Hash, label: "해시태그 최적화", desc: "업종별 30개 추천, 경쟁도 분석, 채널별 복사", ready: true },
  { href: "/simulator", icon: Calculator, label: "수익 시뮬레이터", desc: "예상 수익 계산, 12개월 성장 곡선", ready: true },
  { href: "/templates", icon: MessageSquare, label: "응답 템플릿", desc: "댓글/DM/크몽/숨고 자동 응답 생성", ready: true },
  { href: "/autopilot", icon: Bot, label: "AI 매니저", desc: "일일 업무 브리핑, 추천 액션, 자동 알림", ready: true },
  { href: "/funnel", icon: GitBranch, label: "고객 퍼널", desc: "5단계 자동 메시지 시퀀스, 전환 추적", ready: true },
  { href: "/ab-test", icon: FlaskConical, label: "A/B 테스트", desc: "제목/캡션 비교, AI 승리 분석", ready: true },
  { href: "/intake", icon: ClipboardList, label: "고객 설문", desc: "신규 고객 마케팅 상담 설문 페이지", ready: true },
];

export default function ChameleonDashboard() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "좋은 아침이에요" : hour < 18 ? "좋은 오후예요" : "좋은 저녁이에요";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Greeting + Hero */}
      <div className="mb-6">
        <p className="text-sm text-slate-500">{greeting}! 🦎</p>
        <h1 className="chameleon-text text-3xl font-extrabold tracking-tight sm:text-4xl mt-1">CHAMELEON</h1>
        <p className="mt-1 text-sm text-slate-500">소상공인 마케팅의 모든 것 — 18개 모듈 통합 플랫폼</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="card-luxury p-4 text-center">
          <div className="text-[10px] text-slate-500">이번 달 매출</div>
          <div className="text-xl font-black chameleon-text">350만원</div>
          <div className="text-[10px] text-emerald-400">+23%</div>
        </div>
        <div className="card-luxury p-4 text-center">
          <div className="text-[10px] text-slate-500">고객 수</div>
          <div className="text-xl font-black text-white">12명</div>
          <div className="text-[10px] text-emerald-400">+3 신규</div>
        </div>
        <div className="card-luxury p-4 text-center">
          <div className="text-[10px] text-slate-500">평균 객단가</div>
          <div className="text-xl font-black text-white">150만원</div>
        </div>
        <div className="card-luxury p-4 text-center">
          <div className="text-[10px] text-slate-500">콘텐츠 생성</div>
          <div className="text-xl font-black text-white">47개</div>
          <div className="text-[10px] text-slate-500">이번 달</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Link href="/content" className="card-luxury p-3 flex items-center gap-2 hover:scale-[1.02] transition group">
          <Film size={16} className="chameleon-icon" />
          <span className="text-xs font-bold text-white group-hover:chameleon-text transition-colors">릴스 만들기</span>
        </Link>
        <Link href="/content" className="card-luxury p-3 flex items-center gap-2 hover:scale-[1.02] transition group">
          <FileText size={16} className="chameleon-icon" />
          <span className="text-xs font-bold text-white group-hover:chameleon-text transition-colors">블로그 쓰기</span>
        </Link>
        <Link href="/crm" className="card-luxury p-3 flex items-center gap-2 hover:scale-[1.02] transition group">
          <Users size={16} className="chameleon-icon" />
          <span className="text-xs font-bold text-white group-hover:chameleon-text transition-colors">고객 추가</span>
        </Link>
        <Link href="/report" className="card-luxury p-3 flex items-center gap-2 hover:scale-[1.02] transition group">
          <BarChart3 size={16} className="chameleon-icon" />
          <span className="text-xs font-bold text-white group-hover:chameleon-text transition-colors">리포트 보기</span>
        </Link>
      </div>

      <div className="chameleon-underline mx-auto mb-8 w-32 rounded-full" />

      {/* Module Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m) => (
          <Link
            key={m.label}
            href={m.href}
            className={`group relative overflow-hidden rounded-2xl p-5 transition-all ${
              m.ready
                ? "card-luxury hover:scale-[1.01]"
                : "card-luxury opacity-40 pointer-events-none"
            }`}
          >
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl chameleon-bg shadow-lg">
                <m.icon size={18} className="text-[#0a0a0a]" />
              </div>
              <h2 className="mt-3 text-sm font-bold text-white group-hover:chameleon-text transition-colors">
                {m.label}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{m.desc}</p>
              {m.ready && (
                <span className="mt-2 inline-block chameleon-badge text-[10px]">
                  활성
                </span>
              )}
              {!m.ready && (
                <span className="mt-2 inline-block rounded-full bg-white/10 px-3 py-0.5 text-[10px] font-medium text-slate-400">
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
