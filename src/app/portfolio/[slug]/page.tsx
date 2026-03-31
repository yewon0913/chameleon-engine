"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Briefcase, TrendingUp } from "lucide-react";

import { trpc } from "@/lib/trpc";

interface PortfolioData {
  id: string;
  clientName?: string | null;
  projectSummary: string | null;
  results: Record<string, string> | null;
  createdAt: string;
}

export default function PublicPortfolioPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await trpc.portfolio.getBySlug.query({ slug });
        setData(result as unknown as PortfolioData);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="chameleon-spinner" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">포트폴리오를 찾을 수 없습니다</h1>
          <p className="mt-2 text-sm text-slate-400">비공개이거나 존재하지 않는 페이지입니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Brand */}
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold chameleon-text">CHAMELEON</p>
        <h1 className="mt-1 text-3xl font-extrabold chameleon-text">포트폴리오</h1>
        <div className="chameleon-underline mx-auto mt-4 w-24 rounded-full" />
      </div>

      {/* Portfolio Card */}
      <div className="rounded-2xl chameleon-border-slow bg-black/40 p-8 chameleon-glow">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl chameleon-bg">
            <Briefcase size={24} className="text-[#0a0a0a]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{data.clientName || "프로젝트"}</h2>
            <p className="text-xs text-slate-500">
              {new Date(data.createdAt).toLocaleDateString("ko-KR")}
            </p>
          </div>
        </div>

        {data.projectSummary && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">프로젝트 요약</h3>
            <p className="text-sm text-white leading-relaxed">{data.projectSummary}</p>
          </div>
        )}

        {data.results && Object.keys(data.results).length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-1">
              <TrendingUp size={14} /> 성과
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(data.results).map(([key, val]) => (
                <div key={key} className="rounded-xl chameleon-bg-subtle p-3 text-center">
                  <p className="text-[10px] text-slate-400">{key}</p>
                  <p className="text-lg font-bold chameleon-text">{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-slate-600">카멜레온 콘텐츠 공장</p>
      </div>
    </div>
  );
}
