"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film, Users, ClipboardList, BarChart3 } from "lucide-react";

const NAV_ITEMS = [
  { href: "/content", label: "콘텐츠", icon: Film },
  { href: "/crm", label: "CRM", icon: Users },
  { href: "/revenue", label: "수익", icon: BarChart3 },
  { href: "/intake", label: "설문", icon: ClipboardList },
];

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
      <path
        d="M12 3C7.5 3 4 6 4 10c0 2.5 1.2 4.5 3 5.8V18c0 1.1.9 2 2 2h1l1-2h2l1 2h1c1.1 0 2-.9 2-2v-2.2c1.8-1.3 3-3.3 3-5.8 0-4-3.5-7-7-7z"
        stroke="#D4AF37"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="9.5" r="1" fill="#D4AF37" />
      <path
        d="M15 10c0 .5-.2 1-.5 1.3-.3.4-.8.7-1.5.7"
        stroke="#D4AF37"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3 11c-1 .5-1.5 1.5-1 2.5s2 1.5 3 1"
        stroke="#D4AF37"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M17 8l2.5-1.5"
        stroke="#D4AF37"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 border-b border-[#D4AF37]/10 bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <ChameleonLogo />
          <span className="chameleon-text text-lg font-extrabold tracking-tight">
            CHAMELEON
          </span>
        </Link>

        {/* Nav Items */}
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "bg-[#D4AF37]/10 text-[#F5D061]"
                    : "text-slate-500 hover:text-[#D4AF37] hover:bg-white/5"
                }`}
              >
                <item.icon size={14} />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
