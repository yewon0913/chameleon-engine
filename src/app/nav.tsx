"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Film,
  Users,
  CalendarDays,
  Send,
  Target,
  BarChart2,
  FileText,
  Briefcase,
  BarChart3,
  Layers,
  Hash,
  Calculator,
  MessageSquare,
  Bot,
  GitBranch,
  FlaskConical,
  ChevronDown,
  Route,
} from "lucide-react";

// 메뉴 재구성 — 4그룹 12모듈
const NAV_GROUPS = [
  {
    label: "📝 콘텐츠",
    items: [
      { href: "/content", label: "콘텐츠 공장", icon: Film },
      { href: "/osmu", label: "OSMU", icon: Layers },
      { href: "/templates", label: "템플릿", icon: MessageSquare },
      { href: "/hashtag", label: "해시태그", icon: Hash },
    ],
  },
  {
    label: "📊 분석",
    items: [
      { href: "/analytics", label: "경쟁사분석", icon: BarChart2 },
      { href: "/report", label: "리포트", icon: FileText },
      { href: "/ab-test", label: "A/B테스트", icon: FlaskConical },
    ],
  },
  {
    label: "📣 마케팅",
    items: [
      { href: "/funnel", label: "퍼널", icon: GitBranch },
      { href: "/calendar", label: "캘린더", icon: CalendarDays },
      { href: "/deploy", label: "배포", icon: Send },
      { href: "/autopilot", label: "오토파일럿", icon: Bot },
    ],
  },
  {
    label: "👥 관리",
    items: [
      { href: "/crm", label: "CRM", icon: Users },
      { href: "/intake", label: "인테이크", icon: Route },
      { href: "/revenue", label: "수익", icon: BarChart3 },
      { href: "/portfolio", label: "포트폴리오", icon: Briefcase },
    ],
  },
];

const MAIN_NAV = [
  { href: "/content", label: "콘텐츠", icon: Film },
  { href: "/osmu", label: "OSMU", icon: Layers },
  { href: "/crm", label: "CRM", icon: Users },
  { href: "/pricing", label: "요금제", icon: BarChart3 },
];
const MORE_NAV = NAV_GROUPS.flatMap((g) => g.items).filter((item) => !MAIN_NAV.some((m) => m.href === item.href));

function ChameleonLogo() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="chameleonLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6">
            <animate attributeName="stop-color" values="#8B5CF6;#10B981;#F5D061;#EC4899;#8B5CF6" dur="8s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="#10B981">
            <animate attributeName="stop-color" values="#10B981;#F5D061;#EC4899;#8B5CF6;#10B981" dur="8s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
      </defs>
      <path
        d="M12 3C7.5 3 4 6 4 10c0 2.5 1.2 4.5 3 5.8V18c0 1.1.9 2 2 2h1l1-2h2l1 2h1c1.1 0 2-.9 2-2v-2.2c1.8-1.3 3-3.3 3-5.8 0-4-3.5-7-7-7z"
        stroke="url(#chameleonLogoGrad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="9.5" r="1" fill="url(#chameleonLogoGrad)" />
      <path
        d="M15 10c0 .5-.2 1-.5 1.3-.3.4-.8.7-1.5.7"
        stroke="url(#chameleonLogoGrad)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3 11c-1 .5-1.5 1.5-1 2.5s2 1.5 3 1"
        stroke="url(#chameleonLogoGrad)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M17 8l2.5-1.5"
        stroke="url(#chameleonLogoGrad)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function NavBar() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = MORE_NAV.some((item) => pathname.startsWith(item.href));

  return (
    <nav className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <ChameleonLogo />
          <span className="chameleon-text text-lg font-extrabold tracking-tight hidden sm:inline">
            CHAMELEON
          </span>
        </Link>

        {/* Nav Items */}
        <div className="flex items-center gap-0.5">
          {MAIN_NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className="relative flex items-center gap-1 shrink-0 rounded-lg px-2 py-1.5 text-xs font-medium transition-all group">
                <span className={active ? "chameleon-icon" : "text-slate-500 group-hover:chameleon-icon"}>
                  <item.icon size={14} />
                </span>
                <span className={`hidden md:inline ${active ? "chameleon-text" : "text-slate-500 group-hover:text-white"}`}>
                  {item.label}
                </span>
                {active && <span className="absolute bottom-0 left-2 right-2 chameleon-underline rounded-full" />}
              </Link>
            );
          })}

          {/* More Dropdown */}
          <div className="relative">
            <button onClick={() => setShowMore(!showMore)}
              className={`relative flex items-center gap-1 shrink-0 rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${isMoreActive ? "chameleon-text" : "text-slate-500 hover:text-white"}`}>
              <ChevronDown size={14} />
              <span className="hidden md:inline">더보기</span>
              {isMoreActive && <span className="absolute bottom-0 left-2 right-2 chameleon-underline rounded-full" />}
            </button>

            {showMore && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMore(false)} />
                <div className="absolute right-0 top-full mt-2 z-20 w-56 rounded-xl border border-white/10 bg-[#0d0d0d] shadow-2xl p-2 grid grid-cols-2 gap-1">
                  {MORE_NAV.map((item) => {
                    const active = pathname.startsWith(item.href);
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setShowMore(false)}
                        className={`flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all ${active ? "chameleon-bg-subtle chameleon-text" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
                        <item.icon size={12} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="chameleon-underline opacity-30" />

      {/* 모바일 하단 네비 */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-lg border-t border-white/[0.06] flex justify-around py-2 z-50" style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
        {[
          { href: "/content", label: "콘텐츠", icon: "📝" },
          { href: "/customers", label: "고객", icon: "👥" },
          { href: "/analytics", label: "분석", icon: "📊" },
          { href: "/settings", label: "설정", icon: "⚙️" },
        ].map((nav) => {
          const active = pathname.startsWith(nav.href);
          return (
            <Link key={nav.href} href={nav.href} className={`flex flex-col items-center gap-0.5 px-3 py-1 min-w-[44px] min-h-[44px] justify-center ${active ? "chameleon-text" : "text-gray-500"}`}>
              <span className="text-lg">{nav.icon}</span>
              <span className="text-[9px] font-bold">{nav.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
