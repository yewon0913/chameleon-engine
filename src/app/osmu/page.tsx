"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Layers,
  Copy,
  Check,
  Mic,
  MicOff,
  Sparkles,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const CHANNELS = [
  { key: "thread", label: "스레드", desc: "500자 요약", color: "bg-pink-500/20 text-pink-300" },
  { key: "instagram", label: "인스타그램", desc: "캡션 150자 + 해시태그", color: "bg-fuchsia-500/20 text-fuchsia-300" },
  { key: "cardNews", label: "카드뉴스", desc: "5~10장 텍스트", color: "bg-yellow-500/20 text-yellow-300" },
  { key: "reels", label: "릴스 스크립트", desc: "30초 스크립트", color: "bg-purple-500/20 text-purple-300" },
  { key: "shorts", label: "유튜브 쇼츠", desc: "쇼츠 스크립트", color: "bg-red-500/20 text-red-300" },
] as const;

export default function OsmuPage() {
  const [content, setContent] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, string> | null>(null);
  const [copied, setCopied] = useState("");
  const [recording, setRecording] = useState(false);
  const [toast, setToast] = useState("");
  const [narrating, setNarrating] = useState<string | null>(null);
  const [narrationUrls, setNarrationUrls] = useState<Record<string, string>>({});

  const transform = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await trpc.osmu.transform.mutate({
        content,
        industry: industry || undefined,
      });
      if (typeof data.result === "object") {
        setResult(data.result as Record<string, string>);
      } else {
        setResult({ raw: String(data.result) });
      }
    } catch {
      setResult({ error: "변환에 실패했습니다. 다시 시도해주세요." });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleNarrate = async (text: string, key: string) => {
    if (narrationUrls[key]) {
      const audio = new Audio(narrationUrls[key]);
      audio.play();
      return;
    }
    setNarrating(key);
    try {
      const data = await trpc.osmu.narrate.mutate({ text: text.slice(0, 1000) });
      if (data.narrationUrl) {
        setNarrationUrls((prev) => ({ ...prev, [key]: data.narrationUrl! }));
        const audio = new Audio(data.narrationUrl);
        audio.play();
        setToast("나레이션 생성 완료"); setTimeout(() => setToast(""), 2000);
      } else {
        setToast("나레이션 서버 미응답"); setTimeout(() => setToast(""), 3000);
      }
    } catch {
      setToast("나레이션 생성 실패"); setTimeout(() => setToast(""), 3000);
    } finally {
      setNarrating(null);
    }
  };

  const toggleRecording = async () => {
    if (recording) {
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setContent((prev) => prev + "\n[음성 입력 완료 — 텍스트로 변환하려면 AI 변환 버튼을 클릭하세요]");
        setRecording(false);
      };

      mediaRecorder.start();
      setRecording(true);
      setTimeout(() => { if (mediaRecorder.state === "recording") mediaRecorder.stop(); }, 60000);
    } catch {
      setToast("마이크 접근 권한이 필요합니다."); setTimeout(() => setToast(""), 3000);
    }
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
            <Layers size={20} className="text-[#0a0a0a]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold chameleon-text">콘텐츠 재활용 (OSMU)</h1>
            <p className="text-sm text-slate-400">1개 입력 → 5개 출력</p>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="rounded-2xl chameleon-border-slow bg-black/40 p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white">원본 콘텐츠 입력</h2>
          <button onClick={toggleRecording}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${recording ? "bg-red-500/20 text-red-300" : "btn-ghost text-slate-400"}`}>
            {recording ? <><MicOff size={12} /> 녹음 중지</> : <><Mic size={12} /> 음성 입력</>}
          </button>
        </div>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6}
          placeholder="블로그 글, 콘텐츠 아이디어, 또는 긴 텍스트를 입력하세요. 음성으로도 입력 가능합니다."
          className="w-full rounded-xl border chameleon-border-slow bg-black/40 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none resize-none mb-3" />
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-slate-400">업종 (선택)</label>
            <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)}
              placeholder="카페, 음식점, 뷰티 등"
              className="w-full rounded-lg border chameleon-border-slow bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
          </div>
          <button onClick={transform} disabled={loading || !content.trim()}
            className="btn-accent px-6 py-2.5 text-sm font-semibold flex items-center gap-2">
            {loading ? <><div className="chameleon-spinner !w-4 !h-4 !border-2" /> 변환 중...</> : <><Sparkles size={14} /> 5채널 변환</>}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && !result.error && (
        <div className="space-y-4">
          <div className="text-center mb-2">
            <span className="chameleon-badge">✓ {Object.keys(result).filter((k) => k !== "raw").length || 5}개 채널 변환 완료</span>
          </div>
          {result.raw ? (
            <div className="rounded-2xl chameleon-border-slow bg-black/40 p-6">
              <pre className="text-sm text-white whitespace-pre-wrap">{result.raw}</pre>
            </div>
          ) : (
            CHANNELS.map((ch) => {
              const text = result[ch.key];
              if (!text) return null;
              return (
                <div key={ch.key} className="rounded-2xl chameleon-border-slow bg-black/40 p-5 transition-all hover:chameleon-glow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ch.color}`}>{ch.label}</span>
                      <span className="text-[10px] text-slate-500">{ch.desc}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleNarrate(text, ch.key)}
                        disabled={narrating === ch.key}
                        className="rounded-lg bg-white/10 p-1.5 text-slate-400 hover:text-white transition-colors"
                        title={narrationUrls[ch.key] ? "재생" : "나레이션 생성"}>
                        {narrating === ch.key ? <div className="chameleon-spinner !w-3.5 !h-3.5 !border-2" /> : narrationUrls[ch.key] ? <span className="text-xs">▶</span> : <Mic size={14} />}
                      </button>
                      {narrationUrls[ch.key] && (
                        <a href={narrationUrls[ch.key]} download={`narration-${ch.key}.mp3`}
                          className="rounded-lg bg-white/10 p-1.5 text-slate-400 hover:text-white transition-colors text-xs" title="다운로드">
                          ↓
                        </a>
                      )}
                      <button onClick={() => handleCopy(text, ch.key)}
                        className="rounded-lg bg-white/10 p-1.5 text-slate-400 hover:text-white transition-colors">
                        {copied === ch.key ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                  <pre className="chameleon-bg-subtle rounded-xl p-4 text-sm text-white whitespace-pre-wrap leading-relaxed">{text}</pre>
                </div>
              );
            })
          )}
        </div>
      )}

      {result?.error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center">
          <p className="text-sm text-red-300">{result.error}</p>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-red-500/90 px-5 py-2.5 text-sm font-bold text-white shadow-2xl animate-pulse">
          {toast}
        </div>
      )}
    </div>
  );
}
