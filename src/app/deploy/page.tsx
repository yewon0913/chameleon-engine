"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Check,
  X,
  Zap,
  Clock,
  ExternalLink,
  Copy,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const CHANNEL_LIST = ["인스타", "틱톡", "유튜브", "스레드", "블로그"] as const;

const CHANNEL_STATUS: Record<string, { label: string; color: string }> = {
  인스타: { label: "준비중", color: "bg-yellow-500/20 text-yellow-300" },
  틱톡: { label: "준비중", color: "bg-yellow-500/20 text-yellow-300" },
  유튜브: { label: "준비중", color: "bg-yellow-500/20 text-yellow-300" },
  스레드: { label: "준비중", color: "bg-yellow-500/20 text-yellow-300" },
  블로그: { label: "준비중", color: "bg-yellow-500/20 text-yellow-300" },
};

const CHANNEL_SPECS: Record<string, string> = {
  인스타: "캡션 150자 + 해시태그 5개",
  틱톡: "캡션 300자 + 화면텍스트 키워드",
  유튜브: "제목 70자 + 설명 5000자 + 태그 15개",
  스레드: "500자 + 태그 1개",
  블로그: "SEO 최적화 + 메타 디스크립션",
};

interface PendingContent {
  id: string;
  date: string;
  title: string;
  contentType: string;
  channels: string[] | null;
}

interface DeployRecord {
  id: string;
  calendarId: string | null;
  channel: string;
  status: string;
  metricsViews: number | null;
  metricsLikes: number | null;
  metricsComments: number | null;
  metricsShares: number | null;
  deployedAt: string | null;
  calendarTitle?: string;
  calendarType?: string;
  calendarDate?: string;
}

export default function DeployPage() {
  const [tab, setTab] = useState<"queue" | "channels" | "history">("queue");
  const [pending, setPending] = useState<PendingContent[]>([]);
  const [deploys, setDeploys] = useState<DeployRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [p, d] = await Promise.all([
        trpc.deploy.listPendingContent.query(),
        trpc.deploy.listDeploys.query(),
      ]);
      setPending(p as unknown as PendingContent[]);
      // Map nested { deploy, calendar } to flat DeployRecord
      setDeploys((d as unknown as { deploy: Record<string, unknown>; calendar: Record<string, unknown> | null }[]).map((row) => ({
        ...row.deploy,
        calendarTitle: row.calendar?.title,
        calendarType: row.calendar?.contentType,
        calendarDate: row.calendar?.date,
      })) as unknown as DeployRecord[]);
    } catch {
      setPending([]);
      setDeploys([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDeploy = async (calendarId: string, channel: string) => {
    try {
      await trpc.deploy.createDeploy.mutate({ calendarId, channel });
      load();
    } catch {
      alert("배포 생성 실패");
    }
  };

  const handleMarkDeployed = async (id: string) => {
    try {
      await trpc.deploy.updateDeployStatus.mutate({ id, status: "배포완료" });
      load();
    } catch { /* ignore */ }
  };

  const TABS = [
    { key: "queue" as const, label: "배포 대기열", icon: Clock },
    { key: "channels" as const, label: "채널 설정", icon: Zap },
    { key: "history" as const, label: "배포 이력", icon: Check },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft size={14} /> 대시보드
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl chameleon-bg shadow-lg">
            <Send size={20} className="text-[#0a0a0a]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold chameleon-text">배포 관리</h1>
            <p className="text-sm text-slate-400">원클릭 다채널 배포</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all ${tab === t.key ? "chameleon-bg text-[#0a0a0a]" : "chameleon-border-slow bg-black/40 text-slate-400"}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="chameleon-spinner" /></div>
      ) : tab === "queue" ? (
        /* Deploy Queue */
        <div className="space-y-3">
          {pending.length === 0 ? (
            <div className="py-20 text-center">
              <Clock size={48} className="mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400">배포 대기 콘텐츠가 없습니다</p>
              <p className="mt-1 text-sm text-slate-500">캘린더에서 콘텐츠를 완료로 변경하세요</p>
            </div>
          ) : (
            pending.map((item) => (
              <div key={item.id} className="rounded-xl chameleon-border-slow bg-black/40 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-500">{item.date}</span>
                      <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400">{item.contentType}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5 shrink-0">
                    {(item.channels || CHANNEL_LIST).map((ch) => (
                      <button key={ch} onClick={() => handleDeploy(item.id, ch)}
                        className="btn-ghost flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-slate-300 hover:chameleon-text">
                        <Send size={10} /> {ch}
                      </button>
                    ))}
                  </div>
                </div>
                <ChannelOptimizer title={item.title} />
              </div>
            ))
          )}
        </div>
      ) : tab === "channels" ? (
        /* Channel Settings */
        <div className="space-y-3">
          {CHANNEL_LIST.map((ch) => (
            <div key={ch} className="rounded-xl chameleon-border-slow bg-black/40 p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">{ch}</h3>
                <p className="text-xs text-slate-500">{CHANNEL_SPECS[ch]}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${CHANNEL_STATUS[ch].color}`}>
                  {CHANNEL_STATUS[ch].label}
                </span>
                <button className="btn-ghost px-3 py-1.5 text-xs text-slate-400 flex items-center gap-1">
                  <ExternalLink size={12} /> 연동
                </button>
              </div>
            </div>
          ))}
          <p className="text-xs text-slate-500 text-center pt-4">채널 API 연동은 향후 업데이트 예정입니다</p>
        </div>
      ) : (
        /* Deploy History */
        <div className="space-y-2">
          {deploys.length === 0 ? (
            <div className="py-20 text-center">
              <Send size={48} className="mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400">배포 이력이 없습니다</p>
            </div>
          ) : (
            <>
              <div className="hidden sm:grid grid-cols-[1fr_80px_80px_80px_80px_80px_100px] gap-4 px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                <span>콘텐츠</span>
                <span>채널</span>
                <span>조회수</span>
                <span>좋아요</span>
                <span>댓글</span>
                <span>공유</span>
                <span>상태</span>
              </div>
              {deploys.map((d) => (
                <div key={d.id} className="grid grid-cols-1 sm:grid-cols-[1fr_80px_80px_80px_80px_80px_100px] items-center gap-2 sm:gap-4 rounded-xl chameleon-border-slow bg-black/40 p-4">
                  <div>
                    <p className="text-sm font-medium text-white">{d.calendarTitle || "제목 없음"}</p>
                    <p className="text-[10px] text-slate-500">{d.calendarDate}</p>
                  </div>
                  <span className="text-xs text-slate-300">{d.channel}</span>
                  <MetricInput deployId={d.id} field="metricsViews" value={d.metricsViews} />
                  <MetricInput deployId={d.id} field="metricsLikes" value={d.metricsLikes} />
                  <MetricInput deployId={d.id} field="metricsComments" value={d.metricsComments} />
                  <MetricInput deployId={d.id} field="metricsShares" value={d.metricsShares} />
                  <div>
                    {d.status === "대기" ? (
                      <button onClick={() => handleMarkDeployed(d.id)} className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300 hover:bg-emerald-500/30">
                        배포 완료 처리
                      </button>
                    ) : (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                        {d.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MetricInput({ deployId, field, value }: { deployId: string; field: string; value: number | null }) {
  const [val, setVal] = useState(String(value || 0));

  const save = async () => {
    try {
      await trpc.deploy.updateMetrics.mutate({ id: deployId, [field]: Number(val) || 0 });
    } catch { /* ignore */ }
  };

  return (
    <input type="number" value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={save}
      className="w-full rounded-lg bg-white/5 px-2 py-1 text-xs text-white text-center focus:outline-none focus:ring-1 focus:ring-white/20"
    />
  );
}

function ChannelOptimizer({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState("인스타");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const optimize = async () => {
    setLoading(true);
    setResult("");
    try {
      const data = await trpc.deploy.optimizeForChannel.mutate({
        title,
        content: title,
        channel,
      });
      setResult(data.content);
    } catch {
      setResult("최적화 실패. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mt-2 text-[10px] chameleon-text hover:underline flex items-center gap-1">
        <Zap size={10} /> 채널별 자동 최적화
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-lg bg-white/5 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {CHANNEL_LIST.map((ch) => (
            <button key={ch} onClick={() => { setChannel(ch); setResult(""); }}
              className={`rounded px-2 py-1 text-[10px] font-medium transition-colors ${channel === ch ? "chameleon-bg text-[#0a0a0a]" : "bg-white/5 text-slate-400"}`}>
              {ch}
            </button>
          ))}
        </div>
        <button onClick={optimize} disabled={loading} className="btn-accent px-2 py-1 text-[10px]">
          {loading ? <Loader2 size={10} className="animate-spin" /> : "변환"}
        </button>
        <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white ml-auto"><X size={12} /></button>
      </div>
      <p className="text-[10px] text-slate-500">{CHANNEL_SPECS[channel]}</p>
      {result && (
        <div className="relative">
          <pre className="chameleon-bg-subtle rounded-lg p-3 text-xs text-white whitespace-pre-wrap">{result}</pre>
          <button onClick={() => navigator.clipboard.writeText(result)}
            className="absolute top-2 right-2 rounded bg-white/10 p-1 text-slate-400 hover:text-white">
            <Copy size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
