"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, CalendarDays, Send } from "lucide-react";

const SUB_TABS = [
  { id: "autopilot", label: "오토파일럿", icon: "🤖" },
  { id: "calendar", label: "캘린더", icon: "📅" },
  { id: "deploy", label: "배포 관리", icon: "🚀" },
];

export default function SettingsPage() {
  const [tab, setTab] = useState("autopilot");

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Link href="/" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300"><ArrowLeft size={14} /> 대시보드</Link>
      <h1 className="text-2xl font-bold chameleon-text mb-4">설정 & 운영</h1>

      <div className="flex overflow-x-auto border-b border-white/[0.06] gap-1 mb-6">
        {SUB_TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-4 py-3 text-xs font-bold whitespace-nowrap transition ${tab === t.id ? "chameleon-text border-b-2 border-[#D4AF37]" : "text-gray-500 hover:text-gray-300"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "autopilot" && (
        <div className="text-center py-12">
          <Bot size={48} className="mx-auto mb-4 text-slate-600" />
          <h2 className="text-lg font-bold text-white mb-2">AI 오토파일럿</h2>
          <p className="text-sm text-slate-400 mb-4">일일 업무 브리핑 + 추천 액션</p>
          <Link href="/autopilot" className="btn-accent px-6 py-2 text-sm font-bold">브리핑 보기</Link>
        </div>
      )}
      {tab === "calendar" && (
        <div className="text-center py-12">
          <CalendarDays size={48} className="mx-auto mb-4 text-slate-600" />
          <h2 className="text-lg font-bold text-white mb-2">콘텐츠 캘린더</h2>
          <p className="text-sm text-slate-400 mb-4">월간/주간 콘텐츠 기획 + AI 자동 제안</p>
          <Link href="/calendar" className="btn-accent px-6 py-2 text-sm font-bold">캘린더 열기</Link>
        </div>
      )}
      {tab === "deploy" && (
        <div className="text-center py-12">
          <Send size={48} className="mx-auto mb-4 text-slate-600" />
          <h2 className="text-lg font-bold text-white mb-2">배포 관리</h2>
          <p className="text-sm text-slate-400 mb-4">다채널 콘텐츠 배포 + 성과 추적</p>
          <Link href="/deploy" className="btn-accent px-6 py-2 text-sm font-bold">배포 관리</Link>
        </div>
      )}
    </div>
  );
}
