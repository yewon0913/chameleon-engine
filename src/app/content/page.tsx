"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Film, ShoppingBag, FileText, LayoutGrid, UserCircle,
  ChevronLeft, Copy, Check, Download, Loader2, Sparkles,
} from "lucide-react";

/* ═══════════════════════════════════════════
   상수 / 타입
   ═══════════════════════════════════════════ */

type TabKey = "reels" | "detail" | "blog" | "cardnews" | "profile";

const TABS: { key: TabKey; label: string; icon: typeof Film }[] = [
  { key: "reels", label: "릴스/숏폼", icon: Film },
  { key: "detail", label: "상세페이지", icon: ShoppingBag },
  { key: "blog", label: "블로그", icon: FileText },
  { key: "cardnews", label: "카드뉴스", icon: LayoutGrid },
  { key: "profile", label: "SNS 프로필", icon: UserCircle },
];

const INDUSTRIES = ["음식점", "카페", "뷰티", "패션", "제조", "IT", "기타"];

const VIDEO_STYLES = [
  { key: "beauty", label: "뷰티 광고", desc: "시네마틱 클로즈업" },
  { key: "food", label: "푸드 플레이팅", desc: "탑다운 ASMR" },
  { key: "product", label: "제품 광고", desc: "미니멀 프리미엄" },
  { key: "fashion", label: "패션 에디토리얼", desc: "하이엔드" },
  { key: "luxury", label: "자동차/럭셔리", desc: "시네마틱 트래킹" },
  { key: "popart", label: "팝아트/MV", desc: "그래픽" },
  { key: "vlog", label: "브이로그", desc: "자연스러운" },
  { key: "info", label: "정보형 릴스", desc: "텍스트 오버레이" },
  { key: "beforeafter", label: "Before/After", desc: "변환형" },
  { key: "story", label: "스토리텔링", desc: "감성형" },
];

const PLATFORMS = [
  { key: "kmong", label: "크몽" },
  { key: "smartstore", label: "스마트스토어" },
  { key: "kakao", label: "카카오비즈" },
  { key: "web", label: "자체 웹" },
];

const BLOG_PLATFORMS = [
  { key: "naver", label: "네이버" },
  { key: "tistory", label: "티스토리" },
  { key: "wordpress", label: "워드프레스" },
];

const BLOG_LENGTHS = [
  { key: "short", label: "짧은 (1,000자)" },
  { key: "medium", label: "보통 (2,000자)" },
  { key: "long", label: "긴 (3,000자+)" },
];

const BLOG_TONES = [
  { key: "info", label: "정보전달" },
  { key: "emotional", label: "감성" },
  { key: "expert", label: "전문가" },
  { key: "friendly", label: "친근" },
];

const CARD_PAGES = [
  { key: "5", label: "5장" },
  { key: "7", label: "7장" },
  { key: "10", label: "10장" },
];

const CARD_STYLES = [
  { key: "info", label: "정보형" },
  { key: "story", label: "스토리형" },
  { key: "compare", label: "비교형" },
];

const BRAND_TONES = [
  { key: "expert", label: "전문가" },
  { key: "friendly", label: "친근" },
  { key: "luxury", label: "럭셔리" },
  { key: "casual", label: "캐주얼" },
];

/* ═══════════════════════════════════════════
   메인 컴포넌트
   ═══════════════════════════════════════════ */

export default function ChameleonContentPage() {
  const [tab, setTab] = useState<TabKey>("reels");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  // 릴스
  const [reelsIndustry, setReelsIndustry] = useState("");
  const [reelsStyle, setReelsStyle] = useState("");
  const [reelsProduct, setReelsProduct] = useState("");
  const [reelsMessage, setReelsMessage] = useState("");

  // 상세페이지
  const [detailPlatform, setDetailPlatform] = useState("");
  const [detailService, setDetailService] = useState("");
  const [detailPrice, setDetailPrice] = useState("");
  const [detailUsp, setDetailUsp] = useState("");
  const [detailTarget, setDetailTarget] = useState("");

  // 블로그
  const [blogTopic, setBlogTopic] = useState("");
  const [blogPlatform, setBlogPlatform] = useState("naver");
  const [blogLength, setBlogLength] = useState("medium");
  const [blogTone, setBlogTone] = useState("info");

  // 카드뉴스
  const [cardTopic, setCardTopic] = useState("");
  const [cardPages, setCardPages] = useState("7");
  const [cardStyle, setCardStyle] = useState("info");

  // SNS 프로필
  const [profileIndustry, setProfileIndustry] = useState("");
  const [profileTarget, setProfileTarget] = useState("");
  const [profileKeywords, setProfileKeywords] = useState("");
  const [profileTone, setProfileTone] = useState("expert");

  async function handleGenerate() {
    setGenerating(true);
    setResult("");
    setCopied(false);
    try {
      let res: { content: string };
      if (tab === "reels") {
        res = await trpc.chameleon.generateReels.mutate({
          industry: reelsIndustry,
          videoStyle: VIDEO_STYLES.find((s) => s.key === reelsStyle)?.label || reelsStyle,
          productName: reelsProduct,
          coreMessage: reelsMessage || undefined,
        });
      } else if (tab === "detail") {
        res = await trpc.chameleon.generateDetailPage.mutate({
          platform: PLATFORMS.find((p) => p.key === detailPlatform)?.label || detailPlatform,
          serviceName: detailService,
          priceRange: detailPrice,
          usp: detailUsp,
          targetCustomer: detailTarget,
        });
      } else if (tab === "blog") {
        res = await trpc.chameleon.generateBlog.mutate({
          topic: blogTopic,
          platform: blogPlatform,
          length: blogLength,
          tone: blogTone,
        });
      } else if (tab === "cardnews") {
        res = await trpc.chameleon.generateCardNews.mutate({
          topic: cardTopic,
          pages: cardPages,
          style: cardStyle,
        });
      } else {
        res = await trpc.chameleon.generateProfile.mutate({
          industry: profileIndustry,
          targetCustomer: profileTarget,
          keywords: profileKeywords,
          brandTone: profileTone,
        });
      }
      setResult(res.content);
    } catch (err) {
      console.error(err);
      setResult("생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
    setGenerating(false);
  }

  function canGenerate(): boolean {
    if (tab === "reels") return !!(reelsIndustry && reelsStyle && reelsProduct);
    if (tab === "detail") return !!(detailPlatform && detailService && detailPrice && detailUsp && detailTarget);
    if (tab === "blog") return !!blogTopic;
    if (tab === "cardnews") return !!cardTopic;
    if (tab === "profile") return !!(profileIndustry && profileTarget && profileKeywords);
    return false;
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([result], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chameleon-${tab}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/"
          className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-[#D4AF37] transition-colors"
        >
          <ChevronLeft size={16} /> 홈
        </Link>
        <p className="text-[10px] font-medium uppercase tracking-widest text-[#D4AF37]/60">
          Content Factory
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-white">
          콘텐츠 공장
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          원클릭으로 SNS 콘텐츠 제작
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setResult(""); setCopied(false); }}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all ${
              tab === t.key
                ? "chameleon-gradient text-white shadow-lg"
                : "bg-white/5 text-slate-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5"
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="card-luxury p-6 shadow-xl mb-6">
        {tab === "reels" && (
          <ReelsForm
            industry={reelsIndustry} setIndustry={setReelsIndustry}
            style={reelsStyle} setStyle={setReelsStyle}
            product={reelsProduct} setProduct={setReelsProduct}
            message={reelsMessage} setMessage={setReelsMessage}
          />
        )}
        {tab === "detail" && (
          <DetailForm
            platform={detailPlatform} setPlatform={setDetailPlatform}
            service={detailService} setService={setDetailService}
            price={detailPrice} setPrice={setDetailPrice}
            usp={detailUsp} setUsp={setDetailUsp}
            target={detailTarget} setTarget={setDetailTarget}
          />
        )}
        {tab === "blog" && (
          <BlogForm
            topic={blogTopic} setTopic={setBlogTopic}
            platform={blogPlatform} setPlatform={setBlogPlatform}
            length={blogLength} setLength={setBlogLength}
            tone={blogTone} setTone={setBlogTone}
          />
        )}
        {tab === "cardnews" && (
          <CardNewsForm
            topic={cardTopic} setTopic={setCardTopic}
            pages={cardPages} setPages={setCardPages}
            style={cardStyle} setStyle={setCardStyle}
          />
        )}
        {tab === "profile" && (
          <ProfileForm
            industry={profileIndustry} setIndustry={setProfileIndustry}
            target={profileTarget} setTarget={setProfileTarget}
            keywords={profileKeywords} setKeywords={setProfileKeywords}
            tone={profileTone} setTone={setProfileTone}
          />
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!canGenerate() || generating}
          className="btn-gold mt-6 w-full py-3.5 text-sm font-bold disabled:opacity-35 flex items-center justify-center gap-2"
        >
          {generating ? (
            <><Loader2 size={16} className="animate-spin" /> AI 생성 중...</>
          ) : (
            <><Sparkles size={16} /> 콘텐츠 생성</>
          )}
        </button>
      </div>

      {/* Result */}
      {(result || generating) && (
        <div className="card-luxury shadow-xl overflow-hidden">
          {generating ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full chameleon-gradient">
                <Loader2 size={24} className="animate-spin text-white" />
              </div>
              <p className="text-sm font-medium text-white">AI가 콘텐츠를 제작 중입니다...</p>
              <p className="text-[10px] text-slate-500">30초~1분 정도 소요됩니다</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/10">
                <h3 className="text-sm font-bold text-[#D4AF37]">생성 결과</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-lg bg-[#D4AF37]/5 border border-[#D4AF37]/20 px-3 py-1.5 text-xs text-slate-400 hover:text-[#D4AF37] transition-colors"
                  >
                    {copied ? <><Check size={12} className="text-emerald-400" /> 복사됨</> : <><Copy size={12} /> 복사</>}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 rounded-lg bg-[#D4AF37]/5 border border-[#D4AF37]/20 px-3 py-1.5 text-xs text-slate-400 hover:text-[#D4AF37] transition-colors"
                  >
                    <Download size={12} /> 다운로드
                  </button>
                </div>
              </div>
              <div className="px-6 py-5 max-h-[700px] overflow-y-auto prose prose-invert prose-sm max-w-none prose-headings:text-white prose-headings:font-bold prose-h2:text-base prose-h2:mt-6 prose-h2:mb-2 prose-h3:text-sm prose-h3:mt-4 prose-h3:mb-1 prose-p:text-slate-300 prose-p:leading-relaxed prose-li:text-slate-300 prose-strong:text-[#D4AF37] prose-code:text-[#D4AF37] prose-code:bg-[#D4AF37]/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-hr:my-4 prose-hr:border-[#D4AF37]/10">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   폼 컴포넌트들
   ═══════════════════════════════════════════ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-[#D4AF37]/70 mb-2">{children}</label>;
}

function SelectGrid({
  options,
  value,
  onChange,
  cols = "grid-cols-2 sm:grid-cols-4",
}: {
  options: { key: string; label: string; desc?: string }[];
  value: string;
  onChange: (v: string) => void;
  cols?: string;
}) {
  return (
    <div className={`grid gap-2 ${cols}`}>
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={`rounded-xl border p-3 text-left transition-all ${
            value === o.key
              ? "border-[#D4AF37]/40 bg-[#D4AF37]/10 text-white"
              : "border-[#D4AF37]/10 bg-black/30 text-slate-400 hover:border-[#D4AF37]/25 hover:text-white"
          }`}
        >
          <p className="text-xs font-medium">{o.label}</p>
          {o.desc && <p className="text-[10px] text-slate-500 mt-0.5">{o.desc}</p>}
        </button>
      ))}
    </div>
  );
}

function ToggleGroup({
  options,
  value,
  onChange,
}: {
  options: { key: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
            value === o.key
              ? "bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#0a0a0a]"
              : "bg-white/5 text-slate-400 hover:text-[#D4AF37]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  multiline,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  const cls =
    "w-full rounded-xl border border-[#D4AF37]/15 bg-black/40 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-[#D4AF37]/50 focus:outline-none focus:shadow-[0_0_15px_rgba(212,175,55,0.1)]";
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${cls} min-h-[80px] resize-y`}
      />
    );
  }
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cls}
    />
  );
}

/* ── 탭 1: 릴스/숏폼 ── */
function ReelsForm({
  industry, setIndustry, style, setStyle, product, setProduct, message, setMessage,
}: {
  industry: string; setIndustry: (v: string) => void;
  style: string; setStyle: (v: string) => void;
  product: string; setProduct: (v: string) => void;
  message: string; setMessage: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <SectionLabel>업종 선택</SectionLabel>
        <ToggleGroup
          options={INDUSTRIES.map((i) => ({ key: i, label: i }))}
          value={industry}
          onChange={setIndustry}
        />
      </div>
      <div>
        <SectionLabel>영상 스타일</SectionLabel>
        <SelectGrid
          options={VIDEO_STYLES}
          value={style}
          onChange={setStyle}
          cols="grid-cols-2 sm:grid-cols-5"
        />
      </div>
      <div>
        <SectionLabel>제품/서비스명 *</SectionLabel>
        <TextInput value={product} onChange={setProduct} placeholder="예: 수제 아메리카노, 피부관리 패키지" />
      </div>
      <div>
        <SectionLabel>핵심 메시지 (선택)</SectionLabel>
        <TextInput value={message} onChange={setMessage} placeholder="예: 하루 한 잔의 여유, 10분 만에 환한 피부" />
      </div>
    </div>
  );
}

/* ── 탭 2: 상세페이지 ── */
function DetailForm({
  platform, setPlatform, service, setService, price, setPrice, usp, setUsp, target, setTarget,
}: {
  platform: string; setPlatform: (v: string) => void;
  service: string; setService: (v: string) => void;
  price: string; setPrice: (v: string) => void;
  usp: string; setUsp: (v: string) => void;
  target: string; setTarget: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <SectionLabel>플랫폼 선택</SectionLabel>
        <ToggleGroup options={PLATFORMS} value={platform} onChange={setPlatform} />
      </div>
      <div>
        <SectionLabel>서비스/상품명 *</SectionLabel>
        <TextInput value={service} onChange={setService} placeholder="예: 블로그 마케팅 패키지" />
      </div>
      <div>
        <SectionLabel>가격대 (패키지 3개) *</SectionLabel>
        <TextInput value={price} onChange={setPrice} placeholder="예: 기본 19만원 / 표준 39만원 / 프리미엄 59만원" />
      </div>
      <div>
        <SectionLabel>핵심 USP 3개 *</SectionLabel>
        <TextInput value={usp} onChange={setUsp} placeholder="예: 1. 100% 환불 보장 2. 전담 매니저 배정 3. 7일 이내 납품" multiline />
      </div>
      <div>
        <SectionLabel>타겟 고객 *</SectionLabel>
        <TextInput value={target} onChange={setTarget} placeholder="예: 매출 1억 미만 소상공인, 온라인 진출 희망" />
      </div>
    </div>
  );
}

/* ── 탭 3: 블로그 ── */
function BlogForm({
  topic, setTopic, platform, setPlatform, length, setLength, tone, setTone,
}: {
  topic: string; setTopic: (v: string) => void;
  platform: string; setPlatform: (v: string) => void;
  length: string; setLength: (v: string) => void;
  tone: string; setTone: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <SectionLabel>주제/키워드 *</SectionLabel>
        <TextInput value={topic} onChange={setTopic} placeholder="예: 소상공인 정책자금 신청 방법 2026" />
      </div>
      <div>
        <SectionLabel>타겟 플랫폼</SectionLabel>
        <ToggleGroup options={BLOG_PLATFORMS} value={platform} onChange={setPlatform} />
      </div>
      <div>
        <SectionLabel>글 길이</SectionLabel>
        <ToggleGroup options={BLOG_LENGTHS} value={length} onChange={setLength} />
      </div>
      <div>
        <SectionLabel>톤</SectionLabel>
        <ToggleGroup options={BLOG_TONES} value={tone} onChange={setTone} />
      </div>
    </div>
  );
}

/* ── 탭 4: 카드뉴스 ── */
function CardNewsForm({
  topic, setTopic, pages, setPages, style, setStyle,
}: {
  topic: string; setTopic: (v: string) => void;
  pages: string; setPages: (v: string) => void;
  style: string; setStyle: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <SectionLabel>주제 *</SectionLabel>
        <TextInput value={topic} onChange={setTopic} placeholder="예: 2026 소상공인 필수 지원금 TOP 5" />
      </div>
      <div>
        <SectionLabel>장수</SectionLabel>
        <ToggleGroup options={CARD_PAGES} value={pages} onChange={setPages} />
      </div>
      <div>
        <SectionLabel>스타일</SectionLabel>
        <ToggleGroup options={CARD_STYLES} value={style} onChange={setStyle} />
      </div>
    </div>
  );
}

/* ── 탭 5: SNS 프로필 ── */
function ProfileForm({
  industry, setIndustry, target, setTarget, keywords, setKeywords, tone, setTone,
}: {
  industry: string; setIndustry: (v: string) => void;
  target: string; setTarget: (v: string) => void;
  keywords: string; setKeywords: (v: string) => void;
  tone: string; setTone: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <SectionLabel>업종 *</SectionLabel>
        <ToggleGroup
          options={INDUSTRIES.map((i) => ({ key: i, label: i }))}
          value={industry}
          onChange={setIndustry}
        />
      </div>
      <div>
        <SectionLabel>타겟 고객 *</SectionLabel>
        <TextInput value={target} onChange={setTarget} placeholder="예: 20~30대 여성, 다이어트 관심" />
      </div>
      <div>
        <SectionLabel>핵심 키워드 3개 *</SectionLabel>
        <TextInput value={keywords} onChange={setKeywords} placeholder="예: 건강식단, 다이어트도시락, 저칼로리" />
      </div>
      <div>
        <SectionLabel>브랜드 톤</SectionLabel>
        <ToggleGroup options={BRAND_TONES} value={tone} onChange={setTone} />
      </div>
    </div>
  );
}
