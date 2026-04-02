"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Target, Users, MessageCircle, Briefcase } from "lucide-react";

const SUB_TABS = [
  { id: "prospect", label: "잠재고객 발굴", icon: "🔥" },
  { id: "crm", label: "CRM", icon: "👥" },
  { id: "message", label: "영업 메시지", icon: "💬" },
  { id: "portfolio", label: "포트폴리오", icon: "📈" },
];

export default function CustomersPage() {
  const [tab, setTab] = useState("prospect");

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Link href="/" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300"><ArrowLeft size={14} /> 대시보드</Link>
      <h1 className="text-2xl font-bold chameleon-text mb-4">고객 관리</h1>

      <div className="flex overflow-x-auto border-b border-white/[0.06] gap-1 mb-6">
        {SUB_TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-4 py-3 text-xs font-bold whitespace-nowrap transition ${tab === t.id ? "chameleon-text border-b-2 border-[#D4AF37]" : "text-gray-500 hover:text-gray-300"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "prospect" && (
        <div className="text-center py-12">
          <Target size={48} className="mx-auto mb-4 text-slate-600" />
          <h2 className="text-lg font-bold text-white mb-2">잠재고객 자동 발굴</h2>
          <p className="text-sm text-slate-400 mb-4">지역+업종 입력 → 마케팅 안 하는 사장님 자동 발굴</p>
          <Link href="/outbound" className="btn-accent px-6 py-2 text-sm font-bold">발굴 시작하기</Link>
        </div>
      )}
      {tab === "crm" && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto mb-4 text-slate-600" />
          <h2 className="text-lg font-bold text-white mb-2">고객 관리 (CRM)</h2>
          <p className="text-sm text-slate-400 mb-4">7단계 파이프라인으로 고객 관리</p>
          <Link href="/crm" className="btn-accent px-6 py-2 text-sm font-bold">CRM 열기</Link>
        </div>
      )}
      {tab === "message" && (
        <div className="text-center py-12">
          <MessageCircle size={48} className="mx-auto mb-4 text-slate-600" />
          <h2 className="text-lg font-bold text-white mb-2">AI 영업 메시지</h2>
          <p className="text-sm text-slate-400 mb-4">잠재 고객별 맞춤 카톡 메시지 자동 생성</p>
          <Link href="/outbound" className="btn-accent px-6 py-2 text-sm font-bold">메시지 생성</Link>
        </div>
      )}
      {tab === "portfolio" && (
        <div className="text-center py-12">
          <Briefcase size={48} className="mx-auto mb-4 text-slate-600" />
          <h2 className="text-lg font-bold text-white mb-2">포트폴리오</h2>
          <p className="text-sm text-slate-400 mb-4">완료 프로젝트 Before/After 관리</p>
          <Link href="/portfolio" className="btn-accent px-6 py-2 text-sm font-bold">포트폴리오 보기</Link>
        </div>
      )}
    </div>
  );
}
