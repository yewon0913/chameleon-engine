"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  Download,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const PIPELINE = [
  "문의",
  "상담중",
  "견적발송",
  "계약완료",
  "제작중",
  "납품완료",
  "사후관리",
] as const;

const PROJECT_TYPES = [
  { value: "릴스/숏폼", label: "릴스/숏폼", price: 150000 },
  { value: "상세페이지", label: "상세페이지", price: 300000 },
  { value: "블로그", label: "블로그 포스팅", price: 80000 },
  { value: "카드뉴스", label: "카드뉴스", price: 100000 },
  { value: "SNS운영대행", label: "SNS 운영 대행 (월)", price: 500000 },
  { value: "마케팅패키지", label: "마케팅 패키지 (월)", price: 1000000 },
];

interface Project {
  id: string;
  clientId: string;
  projectType: string;
  title: string | null;
  quantity: number;
  unitPrice: number;
  deadline: string | null;
  progress: number;
  status: string;
  createdAt: string;
}

interface Note {
  id: string;
  clientId: string;
  content: string;
  nextAction: string | null;
  createdAt: string;
}

interface ClientDetail {
  id: string;
  name: string;
  phone: string | null;
  businessType: string | null;
  businessName: string | null;
  snsInstagram: string | null;
  snsTiktok: string | null;
  snsYoutube: string | null;
  snsBlog: string | null;
  marketingGoal: string | null;
  monthlyBudget: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  projects: Project[];
  notes: Note[];
}

export default function ClientDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddProject, setShowAddProject] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteAction, setNoteAction] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [insight, setInsight] = useState<any>(null);
  const [analyzingInsight, setAnalyzingInsight] = useState(false);

  const load = async () => {
    try {
      const data = await trpc.crm.getClient.query({ id });
      setClient(data as unknown as ClientDetail);
    } catch {
      setClient(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const changeStatus = async (status: (typeof PIPELINE)[number]) => {
    if (!client) return;
    await trpc.crm.updateClientStatus.mutate({ id: client.id, status });
    load();
  };

  const addNote = async () => {
    if (!client || !noteText.trim()) return;
    setAddingNote(true);
    await trpc.crm.addNote.mutate({
      clientId: client.id,
      content: noteText,
      nextAction: noteAction || undefined,
    });
    setNoteText("");
    setNoteAction("");
    setAddingNote(false);
    load();
  };

  const analyzeInsight = async () => {
    if (!client) return;
    setAnalyzingInsight(true);
    try {
      const result = await trpc.crm.analyzeBusiness.mutate({
        businessName: client.businessName || client.name,
      });
      if (!result.error) setInsight(result);
    } catch { /* ignore */ }
    setAnalyzingInsight(false);
  };

  const deleteProject = async (projectId: string) => {
    await trpc.crm.deleteProject.mutate({ id: projectId });
    load();
  };

  if (loading)
    return (
      <div className="py-20 text-center text-slate-500">불러오는 중...</div>
    );

  if (!client)
    return (
      <div className="py-20 text-center">
        <p className="text-slate-400">고객을 찾을 수 없습니다</p>
        <Link href="/crm" className="mt-4 inline-block chameleon-text">
          목록으로
        </Link>
      </div>
    );

  const totalAmount = client.projects.reduce(
    (sum, p) => sum + p.quantity * p.unitPrice,
    0
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Back */}
      <Link
        href="/crm"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition-colors"
      >
        <ArrowLeft size={14} />
        고객 목록
      </Link>

      {/* Client Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{client.name}</h1>
          <p className="text-sm text-slate-400">
            {client.businessName && `${client.businessName} · `}
            {client.businessType || "업종 미등록"} ·{" "}
            {client.phone || "연락처 미등록"}
          </p>
        </div>
        <button
          onClick={() => setShowQuote(true)}
          className="btn-accent flex items-center gap-2 px-4 py-2.5 text-sm font-semibold shrink-0"
        >
          <FileText size={16} />
          견적서 생성
        </button>
      </div>

      {/* Pipeline */}
      <div className="mb-8">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
          진행 파이프라인
        </h3>
        <div className="flex gap-1 overflow-x-auto pb-2">
          {PIPELINE.map((step, i) => {
            const idx = PIPELINE.indexOf(client.status as (typeof PIPELINE)[number]);
            const isActive = step === client.status;
            const isPast = i < idx;
            return (
              <button
                key={step}
                onClick={() => changeStatus(step)}
                className={`relative shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? "chameleon-bg text-[#0a0a0a] shadow-lg chameleon-glow"
                    : isPast
                    ? "chameleon-bg-subtle chameleon-border-slow"
                    : "bg-white/5 text-slate-500 hover:bg-white/10"
                }`}
              >
                {step}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* SNS & Marketing Info */}
          <div className="rounded-xl border border-[#D4AF37]/15 bg-black/40 p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">
              고객 정보
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoRow label="마케팅 목표" value={client.marketingGoal} />
              <InfoRow label="월 예산" value={client.monthlyBudget} />
              <InfoRow label="인스타그램" value={client.snsInstagram} />
              <InfoRow label="틱톡" value={client.snsTiktok} />
              <InfoRow label="유튜브" value={client.snsYoutube} />
              <InfoRow label="블로그" value={client.snsBlog} />
            </div>
          </div>

          {/* AI 고객 인사이트 */}
          <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-purple-300 flex items-center gap-2">
                <Sparkles size={14} /> 고객 인사이트
              </h3>
              <button
                onClick={analyzeInsight}
                disabled={analyzingInsight}
                className="flex items-center gap-1 rounded-lg bg-purple-600/30 px-3 py-1.5 text-xs font-medium text-purple-200 hover:bg-purple-600/50 transition-colors disabled:opacity-40"
              >
                {analyzingInsight ? <div className="chameleon-spinner !w-3 !h-3 !border-2" /> : <Sparkles size={12} />}
                {insight ? "다시 분석" : "AI 분석"}
              </button>
            </div>
            {insight ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">추정 업종</p>
                    <p className="text-white">{insight.businessType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">주요 타겟</p>
                    <p className="text-white">{insight.target}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">예상 월 예산</p>
                    <p className="text-white">{insight.estimatedBudget}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">경쟁 강도</p>
                    <p className="text-white">{insight.competitionLevel}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">추천 콘텐츠 주제</p>
                  <div className="flex flex-wrap gap-1">
                    {insight.reelsTopics?.map((t: string, i: number) => (
                      <span key={i} className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs text-purple-300">{t}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">마케팅 전략</p>
                  <p className="text-xs text-slate-300">{insight.marketingNeeds}</p>
                </div>
                <div className="rounded-lg bg-black/30 p-3">
                  <p className="text-xs text-slate-500 mb-1">영업 접근 코칭</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{insight.approachTip}</p>
                </div>
                <p className="text-[10px] text-slate-600">추천 패키지: {insight.recommendedPackage} · 추정 서비스: {insight.services}</p>
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-slate-500">
                AI 분석 버튼을 눌러 고객 인사이트를 확인하세요
              </p>
            )}
          </div>

          {/* Projects */}
          <div className="rounded-xl border border-[#D4AF37]/15 bg-black/40 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                프로젝트 ({client.projects.length})
              </h3>
              <button
                onClick={() => setShowAddProject(true)}
                className="btn-ghost flex items-center gap-1 px-3 py-1.5 text-xs text-slate-300"
              >
                <Plus size={14} />
                추가
              </button>
            </div>

            {client.projects.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">
                등록된 프로젝트가 없습니다
              </p>
            ) : (
              <div className="space-y-3">
                {client.projects.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-lg border border-[#D4AF37]/10 bg-black/30 p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm font-medium text-white">
                          {p.title || p.projectType}
                        </span>
                        <span className="ml-2 text-xs text-slate-500">
                          x{p.quantity}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {(p.unitPrice * p.quantity).toLocaleString()}원
                        </span>
                        <button
                          onClick={() => deleteProject(p.id)}
                          className="text-slate-600 hover:text-red-400"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full chameleon-gradient transition-all"
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 w-8 text-right">
                        {p.progress}%
                      </span>
                    </div>
                    {p.deadline && (
                      <p className="mt-1 text-[10px] text-slate-500">
                        납품기한: {p.deadline}
                      </p>
                    )}
                  </div>
                ))}

                <div className="flex justify-between pt-2 border-t border-[#D4AF37]/10">
                  <span className="text-xs text-slate-400">총 금액</span>
                  <span className="text-sm font-semibold chameleon-text">
                    {totalAmount.toLocaleString()}원
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column — Notes Timeline */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[#D4AF37]/15 bg-black/40 p-5">
            <h3 className="mb-4 text-sm font-semibold text-white flex items-center gap-2">
              <MessageSquare size={14} />
              상담 이력
            </h3>

            {/* Add Note */}
            <div className="mb-4 space-y-2">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="상담 내용을 기록하세요..."
                rows={3}
                className="w-full rounded-lg border border-[#D4AF37]/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none resize-none"
              />
              <input
                type="text"
                value={noteAction}
                onChange={(e) => setNoteAction(e.target.value)}
                placeholder="다음 액션 (선택)"
                className="w-full rounded-lg border border-[#D4AF37]/15 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none"
              />
              <button
                onClick={addNote}
                disabled={addingNote || !noteText.trim()}
                className="btn-accent w-full py-2 text-xs font-semibold text-white"
              >
                {addingNote ? "저장 중..." : "메모 추가"}
              </button>
            </div>

            {/* Timeline */}
            {client.notes.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-500">
                상담 기록이 없습니다
              </p>
            ) : (
              <div className="space-y-3">
                {client.notes.map((note) => (
                  <div
                    key={note.id}
                    className="relative border-l-2 border-purple-500/30 pl-3"
                  >
                    <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full chameleon-bg" />
                    <p className="text-xs text-slate-300 whitespace-pre-wrap">
                      {note.content}
                    </p>
                    {note.nextAction && (
                      <p className="mt-1 text-[10px] chameleon-text">
                        → {note.nextAction}
                      </p>
                    )}
                    <p className="mt-1 text-[10px] text-slate-600">
                      {new Date(note.createdAt).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Project Modal */}
      {showAddProject && (
        <AddProjectModal
          clientId={client.id}
          onClose={() => setShowAddProject(false)}
          onCreated={() => {
            setShowAddProject(false);
            load();
          }}
        />
      )}

      {/* Quote Modal */}
      {showQuote && (
        <QuoteModal
          client={client}
          onClose={() => setShowQuote(false)}
        />
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-slate-300">{value || "-"}</p>
    </div>
  );
}

function AddProjectModal({
  clientId,
  onClose,
  onCreated,
}: {
  clientId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [type, setType] = useState(PROJECT_TYPES[0].value);
  const [title, setTitle] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(PROJECT_TYPES[0].price);
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);

  const handleTypeChange = (v: string) => {
    setType(v);
    const found = PROJECT_TYPES.find((t) => t.value === v);
    if (found) setUnitPrice(found.price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await trpc.crm.createProject.mutate({
      clientId,
      projectType: type,
      title: title || undefined,
      quantity,
      unitPrice,
      deadline: deadline || undefined,
    });
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#D4AF37]/20 bg-[#0d0d0d] p-6">
        <h2 className="mb-4 text-lg font-bold text-white">프로젝트 추가</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-slate-400">
              콘텐츠 유형
            </label>
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full rounded-lg border border-[#D4AF37]/15 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none"
            >
              {PROJECT_TYPES.map((t) => (
                <option key={t.value} value={t.value} className="bg-[#111]">
                  {t.label} ({t.price.toLocaleString()}원)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">
              프로젝트명 (선택)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-[#D4AF37]/15 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400">수량</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full rounded-lg border border-[#D4AF37]/15 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">
                단가 (원)
              </label>
              <input
                type="number"
                min={0}
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                className="w-full rounded-lg border border-[#D4AF37]/15 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">
              납품 기한
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-lg border border-[#D4AF37]/15 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between border-t border-[#D4AF37]/10 pt-3">
            <span className="text-sm text-slate-400">합계</span>
            <span className="text-lg font-bold chameleon-text">
              {(quantity * unitPrice).toLocaleString()}원
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1 py-2 text-sm text-slate-300"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-accent flex-1 py-2 text-sm font-semibold text-white"
            >
              {saving ? "저장 중..." : "추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function QuoteModal({
  client,
  onClose,
}: {
  client: ClientDetail;
  onClose: () => void;
}) {
  const totalAmount = client.projects.reduce(
    (sum, p) => sum + p.quantity * p.unitPrice,
    0
  );
  const vat = Math.round(totalAmount * 0.1);

  const handleDownload = () => {
    const today = new Date().toLocaleDateString("ko-KR");
    let text = `
━━━━━━━━━━━━━━━━━━━━━━━━━━
      카멜레온 콘텐츠 공장
          견 적 서
━━━━━━━━━━━━━━━━━━━━━━━━━━

발행일: ${today}
고객명: ${client.name}
사업장: ${client.businessName || "-"}
업  종: ${client.businessType || "-"}

────────────────────────────
항목                수량    단가         금액
────────────────────────────
`;

    client.projects.forEach((p) => {
      const name = (p.title || p.projectType).padEnd(16, " ");
      const qty = String(p.quantity).padStart(4, " ");
      const price = p.unitPrice.toLocaleString().padStart(10, " ");
      const total = (p.quantity * p.unitPrice).toLocaleString().padStart(12, " ");
      text += `${name}${qty}  ${price}원  ${total}원\n`;
    });

    text += `────────────────────────────
공급가액:                    ${totalAmount.toLocaleString()}원
부가세(10%):                 ${vat.toLocaleString()}원
━━━━━━━━━━━━━━━━━━━━━━━━━━
합  계:                      ${(totalAmount + vat).toLocaleString()}원
━━━━━━━━━━━━━━━━━━━━━━━━━━

* 본 견적서는 발행일로부터 30일간 유효합니다.
* 카멜레온 콘텐츠 공장
`;

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `견적서_${client.name}_${today.replace(/\./g, "")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[#D4AF37]/20 bg-[#0d0d0d] p-6 max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">견적서 미리보기</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Quote Content */}
        <div className="rounded-xl border border-[#D4AF37]/15 bg-black/40 p-5 mb-4">
          <div className="text-center mb-4">
            <p className="text-lg font-bold chameleon-text">
              카멜레온 콘텐츠 공장
            </p>
            <p className="text-xl font-bold text-white mt-1">견적서</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm mb-4 pb-4 border-b border-white/10">
            <div>
              <p className="text-xs text-slate-500">고객명</p>
              <p className="text-white">{client.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">발행일</p>
              <p className="text-white">
                {new Date().toLocaleDateString("ko-KR")}
              </p>
            </div>
          </div>

          {client.projects.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500">
              프로젝트를 먼저 추가하세요
            </p>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                {client.projects.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-300">
                      {p.title || p.projectType}{" "}
                      <span className="text-slate-500">x{p.quantity}</span>
                    </span>
                    <span className="text-white">
                      {(p.quantity * p.unitPrice).toLocaleString()}원
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">공급가액</span>
                  <span className="text-white">
                    {totalAmount.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">부가세 (10%)</span>
                  <span className="text-white">{vat.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-white/10">
                  <span className="text-white">합계</span>
                  <span className="chameleon-text">
                    {(totalAmount + vat).toLocaleString()}원
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="btn-ghost flex-1 py-2.5 text-sm text-slate-300"
          >
            닫기
          </button>
          <button
            onClick={handleDownload}
            disabled={client.projects.length === 0}
            className="btn-accent flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white"
          >
            <Download size={14} />
            다운로드
          </button>
        </div>
      </div>
    </div>
  );
}
