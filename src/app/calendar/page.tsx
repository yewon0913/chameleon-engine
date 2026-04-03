"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Sparkles,
  List,
  CalendarDays,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const CONTENT_TYPES = ["릴스", "블로그", "카드뉴스", "스레드", "인스타", "틱톡", "유튜브"] as const;
const STATUSES = ["기획", "제작중", "완료", "예약", "배포완료"] as const;
const CHANNELS = ["인스타", "틱톡", "유튜브", "스레드", "블로그"] as const;

const TYPE_COLORS: Record<string, string> = {
  릴스: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  블로그: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  카드뉴스: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  스레드: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  인스타: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
  틱톡: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  유튜브: "bg-red-500/20 text-red-300 border-red-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  기획: "bg-slate-500/20 text-slate-300",
  제작중: "bg-orange-500/20 text-orange-300",
  완료: "bg-emerald-500/20 text-emerald-300",
  예약: "bg-blue-500/20 text-blue-300",
  배포완료: "bg-purple-500/20 text-purple-300",
};

interface CalendarItem {
  id: string;
  date: string;
  title: string;
  contentType: string;
  status: string;
  channels: string[] | null;
  deployTime: string | null;
  memo: string | null;
}

export default function CalendarPage() {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [view, setView] = useState<"month" | "week">("month");
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [dragItem, setDragItem] = useState<CalendarItem | null>(null);

  const monthStr = `${year}-${String(month).padStart(2, "0")}`;

  const load = useCallback(async () => {
    try {
      const data = await trpc.calendar.listByMonth.query({ month: monthStr });
      setItems(data as unknown as CalendarItem[]);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [monthStr]);

  useEffect(() => {
    load();
  }, [load]);

  const prevMonth = () => {
    if (month === 1) { setYear(year - 1); setMonth(12); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(year + 1); setMonth(1); }
    else setMonth(month + 1);
  };

  // Calendar grid
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const getItemsForDay = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return items.filter((it) => it.date === dateStr);
  };

  // Week view
  const today = new Date();
  const dayOfWeek = today.getDay();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dayOfWeek);
  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    weekDays.push(d);
  }

  const handleDrop = async (day: number) => {
    if (!dragItem) return;
    const newDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (newDate === dragItem.date) return;
    try {
      await trpc.calendar.update.mutate({ id: dragItem.id, date: newDate });
      load();
    } catch { /* ignore */ }
    setDragItem(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition-colors">
            <ArrowLeft size={14} /> 대시보드
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl chameleon-bg shadow-lg">
              <CalendarDays size={20} className="text-[#0a0a0a]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold chameleon-text">콘텐츠 캘린더</h1>
              <p className="text-sm text-slate-400">한 달치 콘텐츠를 한눈에</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAI(true)} className="btn-ghost flex items-center gap-1.5 px-3 py-2 text-sm text-slate-300">
            <Sparkles size={14} /> AI 자동 기획
          </button>
          <button onClick={() => { setSelectedDate(`${year}-${String(month).padStart(2, "0")}-01`); setShowModal(true); }} className="btn-accent flex items-center gap-1.5 px-4 py-2 text-sm font-semibold">
            <Plus size={16} /> 콘텐츠 추가
          </button>
        </div>
      </div>

      {/* Month Navigation + View Toggle */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="rounded-lg bg-white/5 p-2 hover:bg-white/10 transition-colors">
            <ChevronLeft size={16} className="text-slate-400" />
          </button>
          <h2 className="text-lg font-bold text-white">{year}년 {month}월</h2>
          <button onClick={nextMonth} className="rounded-lg bg-white/5 p-2 hover:bg-white/10 transition-colors">
            <ChevronRight size={16} className="text-slate-400" />
          </button>
        </div>
        <div className="flex rounded-lg overflow-hidden chameleon-border-slow">
          <button onClick={() => setView("month")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "month" ? "chameleon-bg text-[#0a0a0a]" : "bg-black/40 text-slate-400"}`}>
            <CalendarDays size={14} />
          </button>
          <button onClick={() => setView("week")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "week" ? "chameleon-bg text-[#0a0a0a]" : "bg-black/40 text-slate-400"}`}>
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Content Type Legend */}
      <div className="mb-4 flex flex-wrap gap-2">
        {CONTENT_TYPES.slice(0, 4).map((t) => (
          <span key={t} className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${TYPE_COLORS[t]}`}>{t}</span>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="chameleon-spinner" /></div>
      ) : view === "month" ? (
        /* Monthly Calendar Grid */
        <div className="rounded-2xl chameleon-border-slow bg-black/40 overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-white/5">
            {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
              <div key={d} className="px-2 py-2 text-center text-xs font-medium text-slate-500">{d}</div>
            ))}
          </div>
          {/* Calendar cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              const dayItems = day ? getItemsForDay(day) : [];
              const isToday = day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();
              return (
                <div
                  key={i}
                  className={`min-h-[100px] border-b border-r border-white/5 p-1.5 transition-colors ${day ? "cursor-pointer hover:bg-white/5" : "bg-black/20"} ${isToday ? "bg-white/5" : ""}`}
                  onClick={() => {
                    if (day) {
                      setSelectedDate(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
                      setShowModal(true);
                    }
                  }}
                  onDragOver={(e) => { if (day) e.preventDefault(); }}
                  onDrop={() => { if (day) handleDrop(day); }}
                >
                  {day && (
                    <>
                      <span className={`text-xs font-medium ${isToday ? "chameleon-text font-bold" : "text-slate-400"}`}>{day}</span>
                      <div className="mt-1 space-y-0.5">
                        {dayItems.slice(0, 3).map((it) => (
                          <div
                            key={it.id}
                            draggable
                            onDragStart={(e) => { e.stopPropagation(); setDragItem(it); }}
                            className={`rounded px-1 py-0.5 text-[10px] font-medium truncate cursor-grab border ${TYPE_COLORS[it.contentType] || "bg-white/10 text-slate-300 border-white/10"}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {it.title}
                          </div>
                        ))}
                        {dayItems.length > 3 && (
                          <span className="text-[10px] text-slate-500">+{dayItems.length - 3}개</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Weekly View */
        <div className="space-y-2">
          {weekDays.map((d) => {
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            const dayItems = items.filter((it) => it.date === dateStr);
            const isToday = d.toDateString() === today.toDateString();
            return (
              <div key={dateStr} className={`rounded-xl chameleon-border-slow bg-black/40 p-4 ${isToday ? "chameleon-glow" : ""}`}>
                <div className="mb-2 flex items-center gap-2">
                  <span className={`text-sm font-bold ${isToday ? "chameleon-text" : "text-white"}`}>
                    {d.getMonth() + 1}/{d.getDate()} ({["일","월","화","수","목","금","토"][d.getDay()]})
                  </span>
                  {isToday && <span className="chameleon-badge text-[10px]">오늘</span>}
                </div>
                {dayItems.length === 0 ? (
                  <p className="text-xs text-slate-600">예정된 콘텐츠 없음</p>
                ) : (
                  <div className="space-y-1.5">
                    {dayItems.map((it) => (
                      <div key={it.id} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[it.status] || "bg-white/10 text-slate-400"}`}>
                          {it.status}
                        </span>
                        <span className="text-sm text-white flex-1 truncate">{it.title}</span>
                        <span className={`rounded border px-1.5 py-0.5 text-[10px] ${TYPE_COLORS[it.contentType] || ""}`}>{it.contentType}</span>
                        {it.deployTime && <span className="text-[10px] text-slate-500">{it.deployTime}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <ContentModal
          date={selectedDate}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load(); }}
        />
      )}

      {/* AI Planning Modal */}
      {showAI && (
        <AIPlanModal
          onClose={() => setShowAI(false)}
          onPlanned={(newItems, targetYear, targetMonth) => {
            setShowAI(false);
            if (newItems && newItems.length > 0) {
              // 캘린더를 생성된 콘텐츠의 월로 자동 이동
              if (targetYear && targetMonth) {
                setYear(targetYear);
                setMonth(targetMonth);
              }
              setItems((prev) => [...prev, ...newItems]);
            } else {
              load();
            }
          }}
        />
      )}
    </div>
  );
}

function ContentModal({
  date,
  onClose,
  onSaved,
}: {
  date: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    date,
    title: "",
    contentType: "릴스",
    status: "기획",
    channels: [] as string[],
    deployTime: "",
    memo: "",
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const set = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));
  const toggleChannel = (ch: string) => {
    setForm((p) => ({
      ...p,
      channels: p.channels.includes(ch) ? p.channels.filter((c) => c !== ch) : [...p.channels, ch],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await trpc.calendar.create.mutate({
        date: form.date,
        title: form.title,
        contentType: form.contentType,
        status: form.status,
        channels: form.channels,
        deployTime: form.deployTime || undefined,
        memo: form.memo || undefined,
      });
      onSaved();
    } catch {
      setToast("저장 실패"); setTimeout(() => setToast(""), 3000);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[#D4AF37]/20 bg-[#0d0d0d] p-6 max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">콘텐츠 추가</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-slate-400">날짜</label>
            <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)}
              className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">제목 *</label>
            <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="콘텐츠 제목"
              className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-slate-400">콘텐츠 유형</label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map((t) => (
                <button key={t} type="button" onClick={() => set("contentType", t)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${form.contentType === t ? "chameleon-bg text-[#0a0a0a]" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-slate-400">상태</label>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button key={s} type="button" onClick={() => set("status", s)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${form.status === s ? "chameleon-bg text-[#0a0a0a]" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-slate-400">배포 채널 (복수 선택)</label>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((ch) => (
                <button key={ch} type="button" onClick={() => toggleChannel(ch)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${form.channels.includes(ch) ? "chameleon-border chameleon-bg-subtle text-white" : "chameleon-border-slow bg-black/40 text-slate-400"}`}>
                  {form.channels.includes(ch) ? "✓ " : ""}{ch}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">배포 시간</label>
            <input type="time" value={form.deployTime} onChange={(e) => set("deployTime", e.target.value)}
              className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">메모</label>
            <textarea value={form.memo} onChange={(e) => set("memo", e.target.value)} rows={2} placeholder="메모"
              className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none resize-none" />
          </div>
          <button type="submit" disabled={saving || !form.title.trim()} className="btn-accent w-full py-2.5 text-sm font-semibold">
            {saving ? "저장 중..." : "콘텐츠 등록"}
          </button>
        </form>
      </div>
      {toast && (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-red-500/90 px-5 py-2.5 text-sm font-bold text-white shadow-2xl animate-pulse">
          {toast}
        </div>
      )}
    </div>
  );
}

function AIPlanModal({
  onClose,
  onPlanned,
}: {
  onClose: () => void;
  onPlanned: (newItems?: CalendarItem[], targetYear?: number, targetMonth?: number) => void;
}) {
  const [form, setForm] = useState({ industry: "", target: "", contentCount: 20 });
  const [planning, setPlanning] = useState(false);
  const [result, setResult] = useState<{ date: string; title: string; contentType: string; channels: string[] }[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [planRange, setPlanRange] = useState({ start: "", end: "" });
  const [toast, setToast] = useState("");

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const handlePlan = async () => {
    if (!form.industry.trim()) return;
    setPlanning(true);
    try {
      const data = await trpc.calendar.aiPlan.mutate({
        industry: form.industry,
        target: form.target || "일반 소비자",
        contentCount: form.contentCount,
      });
      if (Array.isArray(data.plan)) {
        // 과거 날짜 필터링 — 오늘 이후만 유지
        const validated = data.plan
          .map((item: { date?: string; title?: string; contentType?: string; channels?: string[] }) => ({
            date: item.date || "",
            title: item.title || "콘텐츠",
            contentType: item.contentType || "릴스",
            channels: item.channels || [],
          }))
          .filter((item: { date: string }) => item.date > todayStr);
        setResult(validated);
        setPlanRange({ start: data.startDate || "", end: data.endDate || "" });
      } else {
        setToast("AI 응답을 파싱할 수 없습니다. 다시 시도해주세요."); setTimeout(() => setToast(""), 3000);
      }
    } catch {
      setToast("AI 기획 실패"); setTimeout(() => setToast(""), 3000);
    } finally {
      setPlanning(false);
    }
  };

  const handleSaveAll = async () => {
    if (!result || result.length === 0) return;
    setSaving(true);
    try {
      const created = await trpc.calendar.batchCreate.mutate({
        items: result.map((item) => ({
          date: item.date,
          title: item.title,
          contentType: item.contentType,
          channels: item.channels,
        })),
      });
      // 가장 많은 항목이 있는 월로 캘린더 자동 이동
      const firstDate = result[0]?.date;
      if (firstDate) {
        const [y, m] = firstDate.split("-").map(Number);
        onPlanned(created as unknown as CalendarItem[], y, m);
      } else {
        onPlanned(created as unknown as CalendarItem[]);
      }
    } catch {
      setToast("저장 실패"); setTimeout(() => setToast(""), 3000);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-[#D4AF37]/20 bg-[#0d0d0d] p-6 max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold chameleon-text flex items-center gap-2">
            <Sparkles size={18} /> AI 콘텐츠 자동 기획
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20} /></button>
        </div>

        {!result ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">오늘({todayStr}) 이후 30일간 콘텐츠를 AI가 자동으로 기획합니다</p>
            <div>
              <label className="mb-1 block text-xs text-slate-400">업종 *</label>
              <input type="text" value={form.industry} onChange={(e) => setForm((p) => ({ ...p, industry: e.target.value }))}
                placeholder="카페, 음식점, 뷰티샵 등"
                className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">타겟</label>
              <input type="text" value={form.target} onChange={(e) => setForm((p) => ({ ...p, target: e.target.value }))}
                placeholder="20~30대 여성, 직장인 등"
                className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">콘텐츠 수 (30일간)</label>
              <input type="number" value={form.contentCount} onChange={(e) => setForm((p) => ({ ...p, contentCount: Number(e.target.value) }))}
                min={1} max={60}
                className="w-32 rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white focus:outline-none" />
            </div>
            <button onClick={handlePlan} disabled={planning || !form.industry.trim()} className="btn-accent w-full py-2.5 text-sm font-semibold">
              {planning ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="chameleon-spinner !w-4 !h-4 !border-2" /> AI 기획 중...
                </span>
              ) : "향후 30일 콘텐츠 자동 기획"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              {result.length}개 콘텐츠가 기획되었습니다
              {planRange.start && <span className="text-slate-500"> ({planRange.start} ~ {planRange.end})</span>}
            </p>
            <div className="max-h-[50vh] overflow-y-auto space-y-1.5">
              {result.map((item, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                  <span className="text-xs text-slate-500 w-20 shrink-0">{item.date}</span>
                  <span className={`rounded border px-1.5 py-0.5 text-[10px] shrink-0 ${TYPE_COLORS[item.contentType] || "bg-white/10 text-slate-300 border-white/10"}`}>
                    {item.contentType}
                  </span>
                  <span className="text-sm text-white flex-1 truncate">{item.title}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} className="btn-ghost flex-1 py-2.5 text-sm text-slate-300">취소</button>
              <button onClick={handleSaveAll} disabled={saving} className="btn-accent flex-1 py-2.5 text-sm font-semibold">
                {saving ? "저장 중..." : "전체 캘린더에 등록"}
              </button>
            </div>
          </div>
        )}
      </div>
      {toast && (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-red-500/90 px-5 py-2.5 text-sm font-bold text-white shadow-2xl animate-pulse">
          {toast}
        </div>
      )}
    </div>
  );
}
