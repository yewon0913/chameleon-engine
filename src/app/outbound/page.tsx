"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Target,
  Plus,
  X,
  Copy,
  Sparkles,
  Upload,
  MessageCircle,
  Check,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const BUSINESS_TYPES = ["카페", "음식점", "뷰티샵", "쇼핑몰", "학원", "병원", "헬스장", "펜션", "기타"] as const;

const CONTACT_STATUSES = ["미발송", "발송완료", "응답받음", "미팅예약", "계약완료"] as const;

const STATUS_COLORS: Record<string, string> = {
  미발송: "bg-slate-500/20 text-slate-300",
  발송완료: "bg-blue-500/20 text-blue-300",
  응답받음: "bg-yellow-500/20 text-yellow-300",
  미팅예약: "bg-purple-500/20 text-purple-300",
  계약완료: "bg-emerald-500/20 text-emerald-300",
};

interface Prospect {
  id: string;
  businessName: string;
  businessType: string | null;
  region: string | null;
  instagramHandle: string | null;
  followers: number | null;
  lastPostDate: string | null;
  contactStatus: string;
  messageSentAt: string | null;
  createdAt: string;
}

export default function OutboundPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [messageTarget, setMessageTarget] = useState<Prospect | null>(null);
  // AI 잠재고객 발굴
  const [findRegion, setFindRegion] = useState("");
  const [findIndustry, setFindIndustry] = useState("");
  const [finding, setFinding] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [foundProspects, setFoundProspects] = useState<any[]>([]);

  const load = async () => {
    try {
      const data = await trpc.outbound.listProspects.query();
      setProspects(data as unknown as Prospect[]);
    } catch {
      setProspects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = filterStatus ? prospects.filter((p) => p.contactStatus === filterStatus) : prospects;

  const statusCounts = CONTACT_STATUSES.map((s) => ({
    label: s,
    count: prospects.filter((p) => p.contactStatus === s).length,
  }));

  const handleStatusChange = async (id: string, status: typeof CONTACT_STATUSES[number]) => {
    try {
      await trpc.outbound.updateStatus.mutate({ id, contactStatus: status });
      load();
    } catch { /* ignore */ }
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
              <Target size={20} className="text-[#0a0a0a]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold chameleon-text">영업 자동화</h1>
              <p className="text-sm text-slate-400">잠재 고객을 자동으로 찾아줍니다</p>
            </div>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-accent flex items-center gap-2 px-4 py-2.5 text-sm font-semibold">
          <Plus size={16} /> 잠재 고객 추가
        </button>
      </div>

      {/* AI 잠재고객 발굴 */}
      <div className="mb-6 rounded-2xl chameleon-border-slow bg-black/40 p-5">
        <h3 className="text-sm font-bold text-white mb-1">🔍 AI 잠재고객 자동 발굴</h3>
        <p className="text-[11px] text-slate-500 mb-3">지역+업종 입력 → 마케팅 안 하는 사장님을 자동으로 찾아줍니다 (카카오+네이버 API)</p>
        <div className="flex gap-2 items-end flex-wrap">
          <div>
            <label className="mb-1 block text-[10px] text-slate-400">지역</label>
            <input value={findRegion} onChange={(e) => setFindRegion(e.target.value)} placeholder="창원, 부산, 강남..." className="rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white w-28 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-slate-400">업종</label>
            <input value={findIndustry} onChange={(e) => setFindIndustry(e.target.value)} placeholder="미용실, 카페..." className="rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white w-28 focus:outline-none" />
          </div>
          <button
            onClick={async () => {
              if (!findRegion || !findIndustry) return;
              setFinding(true);
              try {
                const res = await trpc.prospect.find.mutate({ region: findRegion, industry: findIndustry, limit: 10 });
                setFoundProspects(res.prospects);
              } catch { setFoundProspects([]); }
              finally { setFinding(false); }
            }}
            disabled={finding || !findRegion || !findIndustry}
            className="btn-accent px-4 py-2 text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"
          >
            {finding ? <><div className="chameleon-spinner !w-4 !h-4 !border-2" /> 검색 중...</> : <><Target size={14} /> 발굴 시작</>}
          </button>
        </div>
        {foundProspects.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-white/10">
                <th className="px-2 py-2 text-left text-slate-400">상호명</th>
                <th className="px-2 py-2 text-left text-slate-400">업종</th>
                <th className="px-2 py-2 text-left text-slate-400">블로그</th>
                <th className="px-2 py-2 text-left text-slate-400">우선순위</th>
                <th className="px-2 py-2 text-left text-slate-400">전화</th>
                <th className="px-2 py-2 text-left text-slate-400">액션</th>
              </tr></thead>
              <tbody>
                {foundProspects.map((p, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-2 py-2 font-semibold text-white">{p.place_name}</td>
                    <td className="px-2 py-2 text-slate-400">{(p.category || "").split(" > ").pop()}</td>
                    <td className="px-2 py-2 text-slate-400">{p.blog_mentions}건</td>
                    <td className="px-2 py-2"><span className={`text-[10px] font-bold ${p.priority === "hot" ? "text-red-400" : p.priority === "warm" ? "text-yellow-400" : "text-slate-500"}`}>{p.priority_label}</span></td>
                    <td className="px-2 py-2">{p.phone ? <a href={`tel:${p.phone}`} className="text-blue-400 hover:underline">{p.phone}</a> : "-"}</td>
                    <td className="px-2 py-2"><a href={p.place_url} target="_blank" rel="noreferrer" className="text-[10px] text-[#D4AF37] hover:underline">카카오맵</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => setFilterStatus("")}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${!filterStatus ? "chameleon-badge" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
          전체 {prospects.length}
        </button>
        {statusCounts.map((s) => (
          <button key={s.label} onClick={() => setFilterStatus(filterStatus === s.label ? "" : s.label)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${filterStatus === s.label ? "chameleon-badge" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
            {s.label} {s.count}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="chameleon-spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Target size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">
            {prospects.length === 0 ? "잠재 고객이 없습니다" : "검색 결과가 없습니다"}
          </p>
          <p className="mt-2 text-sm text-slate-500">잠재 고객을 추가하거나 CSV로 업로드하세요</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-[1fr_100px_100px_80px_100px_100px_120px] items-center gap-4 px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
            <span>상호</span>
            <span>업종</span>
            <span>지역</span>
            <span>팔로워</span>
            <span>마지막 게시</span>
            <span>상태</span>
            <span>액션</span>
          </div>

          {filtered.map((p) => (
            <div key={p.id} className="grid grid-cols-1 sm:grid-cols-[1fr_100px_100px_80px_100px_100px_120px] items-center gap-2 sm:gap-4 rounded-xl chameleon-border-slow bg-black/40 p-4">
              <div>
                <p className="font-semibold text-white">{p.businessName}</p>
                {p.instagramHandle && <p className="text-xs text-pink-400">@{p.instagramHandle}</p>}
              </div>
              <p className="text-sm text-slate-400">{p.businessType || "-"}</p>
              <p className="text-sm text-slate-400">{p.region || "-"}</p>
              <p className="text-sm text-slate-400">{p.followers || "-"}</p>
              <p className="text-xs text-slate-500">{p.lastPostDate || "-"}</p>
              <div>
                <select
                  value={p.contactStatus}
                  onChange={(e) => handleStatusChange(p.id, e.target.value as typeof CONTACT_STATUSES[number])}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium border-0 cursor-pointer ${STATUS_COLORS[p.contactStatus] || "bg-white/10 text-slate-400"}`}
                >
                  {CONTACT_STATUSES.map((s) => (
                    <option key={s} value={s} className="bg-[#0d0d0d] text-white">{s}</option>
                  ))}
                </select>
              </div>
              <button onClick={() => setMessageTarget(p)}
                className="btn-ghost flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-slate-300">
                <MessageCircle size={10} /> 메시지 생성
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Prospect Modal */}
      {showAdd && (
        <AddProspectModal
          onClose={() => setShowAdd(false)}
          onCreated={() => { setShowAdd(false); load(); }}
        />
      )}

      {/* Message Generator Modal */}
      {messageTarget && (
        <MessageModal
          prospect={messageTarget}
          onClose={() => setMessageTarget(null)}
        />
      )}
    </div>
  );
}

function AddProspectModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    businessName: "",
    businessType: "",
    region: "",
    instagramHandle: "",
    followers: "",
    lastPostDate: "",
  });
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [toast, setToast] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [aiInsight, setAiInsight] = useState<any>(null);

  const set = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleAnalyze = async () => {
    if (!form.businessName.trim()) return;
    setAnalyzing(true);
    try {
      const result = await trpc.crm.analyzeBusiness.mutate({
        businessName: form.businessName,
        region: form.region || undefined,
      });
      if (!result.error) {
        setAiInsight(result);
        setForm((p) => ({
          ...p,
          businessType: result.businessType || p.businessType,
        }));
      }
    } catch { /* ignore */ }
    setAnalyzing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName.trim()) return;
    setSaving(true);
    try {
      await trpc.outbound.createProspect.mutate({
        businessName: form.businessName,
        businessType: form.businessType || undefined,
        region: form.region || undefined,
        instagramHandle: form.instagramHandle || undefined,
        followers: form.followers ? Number(form.followers) : undefined,
        lastPostDate: form.lastPostDate || undefined,
      });
      onCreated();
    } catch {
      setToast("저장 실패"); setTimeout(() => setToast(""), 3000);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[#D4AF37]/20 bg-[#0d0d0d] p-6 max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">잠재 고객 추가</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400">상호 *</label>
              <div className="flex gap-1.5">
                <input type="text" value={form.businessName} onChange={(e) => set("businessName", e.target.value)}
                  placeholder="사업장 이름"
                  className="flex-1 rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={analyzing || !form.businessName.trim()}
                  className="shrink-0 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-2.5 py-2 text-xs font-bold text-white disabled:opacity-40 transition-opacity flex items-center gap-1"
                >
                  {analyzing ? <div className="chameleon-spinner !w-3 !h-3 !border-2" /> : <Sparkles size={12} />}
                  AI
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">업종</label>
              <select value={form.businessType} onChange={(e) => set("businessType", e.target.value)}
                className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white focus:outline-none">
                <option value="" className="bg-[#0d0d0d]">선택</option>
                {BUSINESS_TYPES.map((t) => <option key={t} value={t} className="bg-[#0d0d0d]">{t}</option>)}
              </select>
            </div>
          </div>

          {/* AI 분석 결과 카드 */}
          {aiInsight && !aiInsight.error && (
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-3 space-y-2">
              <p className="text-xs font-bold text-purple-300 flex items-center gap-1"><Sparkles size={12} /> AI 분석 결과</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-slate-500">타겟:</span> <span className="text-white">{aiInsight.target}</span></div>
                <div><span className="text-slate-500">경쟁:</span> <span className="text-white">{aiInsight.competitionLevel}</span></div>
              </div>
              {aiInsight.reelsTopics && (
                <div className="flex flex-wrap gap-1">
                  {aiInsight.reelsTopics.map((t: string, i: number) => (
                    <span key={i} className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] text-purple-300">{t}</span>
                  ))}
                </div>
              )}
              <div className="rounded-lg bg-black/30 p-2">
                <p className="text-[10px] text-slate-500 mb-0.5">영업 접근 코칭</p>
                <p className="text-[11px] text-slate-300 leading-relaxed">{aiInsight.approachTip}</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400">지역</label>
              <input type="text" value={form.region} onChange={(e) => set("region", e.target.value)} placeholder="시/구/동"
                className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">인스타그램</label>
              <input type="text" value={form.instagramHandle} onChange={(e) => set("instagramHandle", e.target.value)} placeholder="@계정명"
                className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400">팔로워 수</label>
              <input type="number" value={form.followers} onChange={(e) => set("followers", e.target.value)} placeholder="0"
                className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">마지막 게시일</label>
              <input type="date" value={form.lastPostDate} onChange={(e) => set("lastPostDate", e.target.value)}
                className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white focus:outline-none" />
            </div>
          </div>
          <button type="submit" disabled={saving || !form.businessName.trim()} className="btn-accent w-full py-2.5 text-sm font-semibold">
            {saving ? "저장 중..." : "잠재 고객 등록"}
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

function MessageModal({ prospect, onClose }: { prospect: Prospect; onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [coaching, setCoaching] = useState<any>(null);
  const [analyzingCoach, setAnalyzingCoach] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const data = await trpc.outbound.generateMessage.mutate({
        businessType: prospect.businessType || "일반",
        businessName: prospect.businessName,
        instagramHandle: prospect.instagramHandle || undefined,
      });
      setMessage(data.message);
    } catch {
      setMessage("메시지 생성 실패. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const analyzeCoaching = async () => {
    setAnalyzingCoach(true);
    try {
      const result = await trpc.crm.analyzeBusiness.mutate({
        businessName: prospect.businessName,
      });
      if (!result.error) setCoaching(result);
    } catch { /* ignore */ }
    setAnalyzingCoach(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[#D4AF37]/20 bg-[#0d0d0d] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            <span className="chameleon-text">{prospect.businessName}</span> 제안 메시지
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20} /></button>
        </div>

        {!message ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">AI가 맞춤 DM 메시지를 생성합니다</p>
            <button onClick={generate} disabled={loading} className="btn-accent w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2">
              {loading ? (
                <><div className="chameleon-spinner !w-4 !h-4 !border-2" /> 생성 중...</>
              ) : (
                <><Sparkles size={14} /> 메시지 자동 생성</>
              )}
            </button>
            {/* AI 접근 코칭 */}
            <button onClick={analyzeCoaching} disabled={analyzingCoach} className="btn-ghost w-full py-2 text-xs text-slate-400 flex items-center justify-center gap-1">
              {analyzingCoach ? <div className="chameleon-spinner !w-3 !h-3 !border-2" /> : <Sparkles size={12} />}
              이 가게 접근 코칭 보기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <pre className="chameleon-bg-subtle rounded-xl p-4 text-sm text-white whitespace-pre-wrap leading-relaxed">{message}</pre>
              <button onClick={handleCopy}
                className="absolute top-2 right-2 rounded-lg bg-white/10 p-1.5 text-slate-400 hover:text-white transition-colors">
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            {!coaching && (
              <button onClick={analyzeCoaching} disabled={analyzingCoach} className="btn-ghost w-full py-1.5 text-xs text-slate-400 flex items-center justify-center gap-1">
                {analyzingCoach ? <div className="chameleon-spinner !w-3 !h-3 !border-2" /> : <Sparkles size={12} />}
                접근 코칭 보기
              </button>
            )}
            <div className="flex gap-2">
              <button onClick={generate} disabled={loading} className="btn-ghost flex-1 py-2 text-sm text-slate-300">
                다시 생성
              </button>
              <button onClick={onClose} className="btn-accent flex-1 py-2 text-sm font-semibold">
                완료
              </button>
            </div>
          </div>
        )}

        {/* AI 접근 코칭 결과 */}
        {coaching && (
          <div className="mt-4 rounded-xl border border-purple-500/30 bg-purple-500/5 p-4 space-y-2">
            <p className="text-xs font-bold text-purple-300 flex items-center gap-1"><Sparkles size={12} /> 접근 코칭</p>
            <p className="text-xs text-slate-300 leading-relaxed">{coaching.approachTip}</p>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div><span className="text-slate-500">추정 업종:</span> <span className="text-white">{coaching.businessType}</span></div>
              <div><span className="text-slate-500">타겟:</span> <span className="text-white">{coaching.target}</span></div>
              <div><span className="text-slate-500">경쟁:</span> <span className="text-white">{coaching.competitionLevel}</span></div>
              <div><span className="text-slate-500">추천:</span> <span className="text-white">{coaching.recommendedPackage}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
