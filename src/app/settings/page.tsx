"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, CalendarDays, Send, Palette } from "lucide-react";

const SUB_TABS = [
  { id: "brand", label: "브랜드 프로필", icon: "🎨" },
  { id: "autopilot", label: "오토파일럿", icon: "🤖" },
  { id: "calendar", label: "캘린더", icon: "📅" },
  { id: "deploy", label: "배포 관리", icon: "🚀" },
];

const INDUSTRIES = ["카페","음식점","미용실","네일샵","피트니스","꽃집","학원","병원","약국","편의점","쇼핑몰","제조업","IT","디자인","마케팅","건설","운송","세탁소","동물병원","기타"];
const TONES = ["친근한","전문적","유머러스","감성적","격식있는"];
const TARGETS = ["10대","20대여성","20대남성","30대여성","30대남성","40대부부","50대이상","전체"];

type BrandProfile = {
  industry: string; tone: string; targetAudience: string;
  brandKeywords: string; competitorUrl: string; referenceUrl: string;
};

function BrandProfileTab() {
  const [profile, setProfile] = useState<BrandProfile>({
    industry: "카페", tone: "친근한", targetAudience: "20대여성",
    brandKeywords: "", competitorUrl: "", referenceUrl: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("chameleon_brand");
      if (s) setProfile(JSON.parse(s));
    } catch {}
  }, []);

  function save() {
    localStorage.setItem("chameleon_brand", JSON.stringify(profile));
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  const INP = "w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
        <h3 className="text-sm font-bold text-white mb-3">🎨 브랜드 보이스 설정</h3>
        <p className="text-xs text-white/40 mb-4">이 설정으로 모든 콘텐츠가 브랜드에 맞게 생성됩니다</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-white/40 mb-1 block">업종</label>
            <select value={profile.industry} onChange={e => setProfile(p => ({ ...p, industry: e.target.value }))} className={INP}>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-white/40 mb-1 block">톤</label>
            <select value={profile.tone} onChange={e => setProfile(p => ({ ...p, tone: e.target.value }))} className={INP}>
              {TONES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-white/40 mb-1 block">타겟 고객</label>
            <select value={profile.targetAudience} onChange={e => setProfile(p => ({ ...p, targetAudience: e.target.value }))} className={INP}>
              {TARGETS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-white/40 mb-1 block">브랜드 키워드 (쉼표 구분)</label>
            <input placeholder="예: 수제, 프리미엄, 따뜻한" value={profile.brandKeywords} onChange={e => setProfile(p => ({ ...p, brandKeywords: e.target.value }))} className={INP} />
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <input placeholder="경쟁사 URL (선택)" value={profile.competitorUrl} onChange={e => setProfile(p => ({ ...p, competitorUrl: e.target.value }))} className={INP} />
          <input placeholder="참고 콘텐츠 URL (선택 — 톤 학습)" value={profile.referenceUrl} onChange={e => setProfile(p => ({ ...p, referenceUrl: e.target.value }))} className={INP} />
        </div>
        <button onClick={save} className="mt-4 w-full py-2.5 rounded-lg chameleon-bg text-[#0a0a0a] font-bold text-sm">
          {saved ? "✅ 저장 완료!" : "💾 브랜드 프로필 저장"}
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState("brand");

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

      {tab === "brand" && <BrandProfileTab />}
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
