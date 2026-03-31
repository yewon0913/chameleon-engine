"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  CalendarDays,
  Users,
  AlertCircle,
  TrendingUp,
  Send,
  ChevronRight,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const ICON_MAP: Record<string, typeof CalendarDays> = {
  calendar: CalendarDays,
  client: Users,
  alert: AlertCircle,
  revenue: TrendingUp,
  action: Send,
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "border-red-500/30 bg-red-500/5",
  medium: "border-yellow-500/30 bg-yellow-500/5",
  low: "border-emerald-500/30 bg-emerald-500/5",
};

interface BriefingItem {
  type: string;
  message: string;
  link: string;
  priority: string;
}

export default function AutopilotPage() {
  const [items, setItems] = useState<BriefingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await trpc.autopilot.getBriefing.query({});
        setItems((data.briefingItems || []) as BriefingItem[]);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 ${["일","월","화","수","목","금","토"][today.getDay()]}요일`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft size={14} /> 대시보드
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl chameleon-bg shadow-lg">
            <Bot size={20} className="text-[#0a0a0a]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold chameleon-text">AI 매니저</h1>
            <p className="text-sm text-slate-400">오늘의 업무 브리핑</p>
          </div>
        </div>
      </div>

      {/* Date */}
      <div className="mb-6 text-center">
        <p className="text-sm text-slate-500">{dateStr}</p>
        <h2 className="text-lg font-bold chameleon-text mt-1">오늘의 브리핑</h2>
        <div className="chameleon-underline mx-auto mt-2 w-20 rounded-full" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="chameleon-spinner" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl chameleon-border-slow bg-black/40 p-8 text-center">
          <Bot size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">오늘의 브리핑이 없습니다</p>
          <p className="mt-1 text-sm text-slate-500">데이터가 쌓이면 AI가 자동으로 브리핑을 생성합니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => {
            const Icon = ICON_MAP[item.type] || AlertCircle;
            return (
              <Link key={i} href={item.link || "#"}
                className={`group flex items-center gap-4 rounded-xl border p-4 transition-all hover:chameleon-glow ${PRIORITY_COLORS[item.priority] || "chameleon-border-slow bg-black/40"}`}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg chameleon-bg-subtle">
                  <Icon size={18} className="chameleon-icon" />
                </div>
                <p className="flex-1 text-sm text-white">{item.message}</p>
                <ChevronRight size={16} className="text-slate-600 group-hover:chameleon-icon transition-colors" />
              </Link>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-sm font-bold text-slate-400 mb-3">빠른 액션</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/calendar", label: "콘텐츠 추가", icon: CalendarDays },
            { href: "/outbound", label: "영업 확인", icon: Users },
            { href: "/deploy", label: "배포 관리", icon: Send },
            { href: "/report", label: "리포트 생성", icon: TrendingUp },
          ].map((action) => (
            <Link key={action.href} href={action.href}
              className="rounded-xl chameleon-border-slow bg-black/40 p-3 text-center transition-all hover:chameleon-glow">
              <action.icon size={18} className="mx-auto mb-1 chameleon-icon" />
              <p className="text-xs text-slate-300">{action.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
