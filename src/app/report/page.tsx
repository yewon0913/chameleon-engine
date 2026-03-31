"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Sparkles,
  Copy,
  Check,
  MessageSquare,
  Download,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface ClientOption {
  id: string;
  name: string;
  businessType: string | null;
}

export default function ReportPage() {
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState("");
  const [period, setPeriod] = useState<"weekly" | "monthly">("monthly");
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState("");
  const [clientName, setClientName] = useState("");
  const [kakaoText, setKakaoText] = useState("");
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const [copied, setCopied] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await trpc.report.listClients.query();
        setClients(data as unknown as ClientOption[]);
      } catch {
        setClients([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const generate = async () => {
    if (!selectedClient) return;
    setGenerating(true);
    setReport("");
    setKakaoText("");
    try {
      const data = await trpc.report.generateReport.mutate({
        clientId: selectedClient,
        period,
      });
      setReport(data.report);
      setClientName(data.clientName);
    } catch {
      setReport("리포트 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setGenerating(false);
    }
  };

  const generateKakao = async () => {
    if (!report) return;
    setKakaoLoading(true);
    try {
      const data = await trpc.report.generateKakaoText.mutate({ report });
      setKakaoText(data.kakaoText);
    } catch {
      setKakaoText("카톡 텍스트 변환 실패");
    } finally {
      setKakaoLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft size={14} /> 대시보드
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl chameleon-bg shadow-lg">
            <FileText size={20} className="text-[#0a0a0a]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold chameleon-text">고객 성과 리포트</h1>
            <p className="text-sm text-slate-400">AI가 자동으로 성과 리포트를 생성합니다</p>
          </div>
        </div>
      </div>

      {/* Report Generator */}
      <div className="rounded-2xl chameleon-border-slow bg-black/40 p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-4">리포트 생성</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-slate-400">고객 선택 *</label>
            {loading ? (
              <div className="text-sm text-slate-500">불러오는 중...</div>
            ) : (
              <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2.5 text-sm text-white focus:outline-none">
                <option value="" className="bg-[#0d0d0d]">고객을 선택하세요</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#0d0d0d]">
                    {c.name} {c.businessType ? `(${c.businessType})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-slate-400">기간</label>
            <div className="flex gap-2">
              <button onClick={() => setPeriod("weekly")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${period === "weekly" ? "chameleon-bg text-[#0a0a0a]" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
                주간
              </button>
              <button onClick={() => setPeriod("monthly")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${period === "monthly" ? "chameleon-bg text-[#0a0a0a]" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
                월간
              </button>
            </div>
          </div>

          <button onClick={generate} disabled={generating || !selectedClient}
            className="btn-accent w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2">
            {generating ? (
              <><div className="chameleon-spinner !w-4 !h-4 !border-2" /> 리포트 생성 중...</>
            ) : (
              <><Sparkles size={14} /> 리포트 자동 생성</>
            )}
          </button>
        </div>
      </div>

      {/* Report Result */}
      {report && (
        <div className="space-y-4">
          <div className="rounded-2xl chameleon-border-slow bg-black/40 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold chameleon-text">
                {clientName} — {period === "weekly" ? "주간" : "월간"} 리포트
              </h3>
              <button onClick={() => handleCopy(report, "report")}
                className="rounded-lg bg-white/10 p-1.5 text-slate-400 hover:text-white transition-colors">
                {copied === "report" ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <div className="chameleon-bg-subtle rounded-xl p-5">
              <pre className="text-sm text-white whitespace-pre-wrap leading-relaxed">{report}</pre>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={generateKakao} disabled={kakaoLoading}
              className="btn-ghost flex-1 flex items-center justify-center gap-2 py-2.5 text-sm text-slate-300">
              {kakaoLoading ? (
                <><div className="chameleon-spinner !w-4 !h-4 !border-2" /> 변환 중...</>
              ) : (
                <><MessageSquare size={14} /> 카톡 발송용 텍스트</>
              )}
            </button>
            <button className="btn-ghost flex-1 flex items-center justify-center gap-2 py-2.5 text-sm text-slate-300">
              <Download size={14} /> PDF 다운로드 (준비중)
            </button>
          </div>

          {/* Kakao Text */}
          {kakaoText && (
            <div className="rounded-2xl chameleon-border-slow bg-black/40 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-yellow-400" /> 카톡 발송용
                </h3>
                <button onClick={() => handleCopy(kakaoText, "kakao")}
                  className="rounded-lg bg-white/10 p-1.5 text-slate-400 hover:text-white transition-colors">
                  {copied === "kakao" ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/20 p-4">
                <pre className="text-sm text-white whitespace-pre-wrap leading-relaxed">{kakaoText}</pre>
              </div>
            </div>
          )}

          {/* Auto Schedule Info */}
          <div className="rounded-2xl chameleon-border-slow bg-black/40 p-4 text-center">
            <p className="text-xs text-slate-500">
              자동 발송 스케줄 (매주 월요일 / 매월 1일) 기능은 향후 업데이트 예정입니다
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
