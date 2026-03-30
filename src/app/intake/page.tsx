"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

const STEPS = ["기본정보", "마케팅 현황", "원하는 서비스", "목표"];

const SERVICE_OPTIONS = [
  "릴스/숏폼 영상",
  "상세페이지 제작",
  "블로그 포스팅",
  "SNS 운영 대행",
  "전체 마케팅 패키지",
];

const GOAL_OPTIONS = [
  "브랜딩 강화",
  "매출 증대",
  "팔로워/구독자 증가",
  "신규 고객 확보",
];

const BUDGET_OPTIONS = [
  "50만원 이하",
  "50~100만원",
  "100~200만원",
  "200~500만원",
  "500만원 이상",
];

export default function IntakePage() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    clientName: "",
    phone: "",
    businessType: "",
    instagram: "",
    instagramFollowers: "",
    tiktok: "",
    tiktokFollowers: "",
    youtube: "",
    youtubeSubscribers: "",
    blog: "",
    currentMarketing: "",
    desiredServices: [] as string[],
    goals: [] as string[],
    budget: "",
  });

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleArray = (key: "desiredServices" | "goals", value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  const canNext = () => {
    if (step === 0) return form.clientName.trim().length > 0;
    if (step === 1) return true;
    if (step === 2) return form.desiredServices.length > 0;
    if (step === 3) return form.goals.length > 0;
    return false;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await trpc.crm.submitIntake.mutate({
        clientName: form.clientName,
        phone: form.phone || undefined,
        businessType: form.businessType || undefined,
        snsChannels: {
          instagram: form.instagram
            ? `${form.instagram} (${form.instagramFollowers || "?"})`
            : "",
          tiktok: form.tiktok
            ? `${form.tiktok} (${form.tiktokFollowers || "?"})`
            : "",
          youtube: form.youtube
            ? `${form.youtube} (${form.youtubeSubscribers || "?"})`
            : "",
          blog: form.blog,
        },
        currentMarketing: form.currentMarketing || undefined,
        desiredServices: form.desiredServices,
        goals: form.goals,
        budget: form.budget || undefined,
      });
      setDone(true);
    } catch {
      alert("제출에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            <CheckCircle size={64} className="chameleon-icon" />
          </div>
          <h1 className="text-2xl font-bold chameleon-text">
            설문이 제출되었습니다!
          </h1>
          <p className="mt-2 text-slate-400">
            담당자가 빠르게 연락드리겠습니다.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            카멜레온 콘텐츠 공장을 이용해주셔서 감사합니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold chameleon-text">
          카멜레온 콘텐츠 공장
        </p>
        <h1 className="mt-1 text-2xl font-bold chameleon-text">
          마케팅 상담 설문
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          간단한 설문으로 맞춤 마케팅을 제안드립니다
        </p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                i === step
                  ? "chameleon-bg text-[#0a0a0a] chameleon-glow"
                  : i < step
                  ? "chameleon-bg-subtle chameleon-text"
                  : "bg-white/5 text-slate-500"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-6 rounded-full ${
                  i < step ? "chameleon-underline" : "bg-white/10 h-0.5"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="rounded-2xl chameleon-border-slow bg-black/40 p-6">
        <h2 className="mb-1 text-lg font-bold text-white">{STEPS[step]}</h2>
        <p className="mb-6 text-xs text-slate-500">
          {step === 0 && "사업자 기본 정보를 입력해주세요"}
          {step === 1 && "현재 마케팅 활동에 대해 알려주세요"}
          {step === 2 && "관심 있는 서비스를 선택해주세요 (복수 선택 가능)"}
          {step === 3 && "마케팅 목표를 알려주세요 (복수 선택 가능)"}
        </p>

        {/* Step 1: 기본정보 */}
        {step === 0 && (
          <div className="space-y-4">
            <IntakeInput
              label="사업자명 / 대표자명 *"
              value={form.clientName}
              onChange={(v) => set("clientName", v)}
              placeholder="홍길동 / 맛있는 떡볶이"
            />
            <IntakeInput
              label="업종"
              value={form.businessType}
              onChange={(v) => set("businessType", v)}
              placeholder="음식점, 뷰티, 패션 등"
            />
            <IntakeInput
              label="연락처"
              value={form.phone}
              onChange={(v) => set("phone", v)}
              placeholder="010-0000-0000"
            />
          </div>
        )}

        {/* Step 2: 마케팅 현황 */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <IntakeInput
                label="인스타그램"
                value={form.instagram}
                onChange={(v) => set("instagram", v)}
                placeholder="@계정명"
              />
              <IntakeInput
                label="팔로워 수"
                value={form.instagramFollowers}
                onChange={(v) => set("instagramFollowers", v)}
                placeholder="예: 1,200"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <IntakeInput
                label="틱톡"
                value={form.tiktok}
                onChange={(v) => set("tiktok", v)}
                placeholder="@계정명"
              />
              <IntakeInput
                label="팔로워 수"
                value={form.tiktokFollowers}
                onChange={(v) => set("tiktokFollowers", v)}
                placeholder="예: 500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <IntakeInput
                label="유튜브"
                value={form.youtube}
                onChange={(v) => set("youtube", v)}
                placeholder="채널명"
              />
              <IntakeInput
                label="구독자 수"
                value={form.youtubeSubscribers}
                onChange={(v) => set("youtubeSubscribers", v)}
                placeholder="예: 300"
              />
            </div>
            <IntakeInput
              label="블로그"
              value={form.blog}
              onChange={(v) => set("blog", v)}
              placeholder="블로그 URL"
            />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                현재 콘텐츠 제작 방법
              </label>
              <div className="flex gap-2">
                {["직접 제작", "외주", "안 하고 있음"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => set("currentMarketing", opt)}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      form.currentMarketing === opt
                        ? "chameleon-bg text-[#0a0a0a]"
                        : "bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: 원하는 서비스 */}
        {step === 2 && (
          <div className="space-y-3">
            {SERVICE_OPTIONS.map((svc) => (
              <button
                key={svc}
                onClick={() => toggleArray("desiredServices", svc)}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                  form.desiredServices.includes(svc)
                    ? "chameleon-border chameleon-bg-subtle text-white chameleon-glow"
                    : "chameleon-border-slow bg-black/40 text-slate-400"
                }`}
              >
                <span className="mr-2">
                  {form.desiredServices.includes(svc) ? "✓" : "○"}
                </span>
                {svc}
              </button>
            ))}
          </div>
        )}

        {/* Step 4: 목표 + 예산 */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-3">
              {GOAL_OPTIONS.map((goal) => (
                <button
                  key={goal}
                  onClick={() => toggleArray("goals", goal)}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                    form.goals.includes(goal)
                      ? "border-[#D4AF37]/50 bg-[#D4AF37]/10 text-white"
                      : "border-[#D4AF37]/15 bg-black/40 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <span className="mr-2">
                    {form.goals.includes(goal) ? "✓" : "○"}
                  </span>
                  {goal}
                </button>
              ))}
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">
                월 마케팅 예산
              </label>
              <div className="flex flex-wrap gap-2">
                {BUDGET_OPTIONS.map((b) => (
                  <button
                    key={b}
                    onClick={() => set("budget", b)}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      form.budget === b
                        ? "chameleon-bg text-[#0a0a0a]"
                        : "bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-2">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="btn-ghost flex-1 py-2.5 text-sm text-slate-300"
            >
              이전
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="btn-accent flex-1 py-2.5 text-sm font-semibold"
            >
              다음
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canNext() || submitting}
              className="btn-accent flex-1 py-2.5 text-sm font-semibold"
            >
              {submitting ? "제출 중..." : "설문 제출"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function IntakeInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-400">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#D4AF37]/15 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none"
      />
    </div>
  );
}
