"use client";

import { useState } from "react";
import { Check, Star, Zap, Crown } from "lucide-react";

const PLANS = [
  {
    name: "라이트",
    price: "3.9",
    icon: Zap,
    color: "from-blue-500 to-blue-600",
    features: ["릴스 10건/월", "이미지 20장/월", "해시태그 무제한", "블로그 5건/월"],
    cta: "라이트 시작",
    popular: false,
  },
  {
    name: "스탠다드",
    price: "7.9",
    icon: Star,
    color: "from-[#D4AF37] to-[#F5D061]",
    features: ["릴스 30건/월", "이미지 60장/월", "해시태그 무제한", "블로그 15건/월", "상세페이지 10건/월", "AI 나레이션 10건/월", "AI 영상 5건/월"],
    cta: "스탠다드 시작",
    popular: true,
  },
  {
    name: "프리미엄",
    price: "14.9",
    icon: Crown,
    color: "from-purple-500 to-pink-500",
    features: ["모든 기능 무제한", "AI 영상 무제한", "AI 나레이션 무제한", "우선 처리", "1:1 전담 매니저"],
    cta: "프리미엄 시작",
    popular: false,
  },
];

export default function PricingPage() {
  const [showContact, setShowContact] = useState(false);

  return (
    <div className="min-h-screen px-4 py-12 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-black text-white mb-3">
          소상공인 마케팅,{" "}
          <span className="bg-gradient-to-r from-[#D4AF37] to-[#F5D061] bg-clip-text text-transparent">
            AI가 대신합니다
          </span>
        </h1>
        <p className="text-sm text-slate-400">무료 5회 체험 후 요금제를 선택하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-6 transition-all ${
                plan.popular
                  ? "border-[#D4AF37]/50 bg-[#D4AF37]/[0.03] shadow-lg shadow-[#D4AF37]/10 scale-[1.02]"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[10px] font-bold text-black">
                  추천
                </div>
              )}

              <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${plan.color} mb-4`}>
                <Icon size={20} className="text-white" />
              </div>

              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">{plan.price}</span>
                <span className="text-sm text-slate-400">만원/월</span>
              </div>

              <ul className="mt-6 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                    <Check size={14} className="text-[#D4AF37] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setShowContact(true)}
                className={`mt-6 w-full py-2.5 rounded-xl text-sm font-bold transition ${
                  plan.popular
                    ? "bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-black hover:shadow-lg"
                    : "border border-white/20 text-white hover:bg-white/5"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-[10px] text-slate-500 mt-8">
        무료 체험 5회 · 언제든 해지 가능 · 부가세 별도
      </p>

      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowContact(false)}>
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-2">결제 준비 중 🦎</h3>
            <p className="text-sm text-slate-300 mb-4">
              결제 시스템을 준비하고 있습니다.<br />
              카카오톡으로 문의해주시면 바로 안내드리겠습니다.
            </p>
            <a
              href="https://pf.kakao.com/_xgxkxkxj"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2.5 rounded-xl bg-[#FEE500] text-[#3C1E1E] text-sm font-bold text-center"
            >
              💬 카카오톡 문의하기
            </a>
            <button onClick={() => setShowContact(false)} className="block w-full mt-2 py-2 text-xs text-slate-400 hover:text-white">
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
