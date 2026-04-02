import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "./nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "카멜레온 — AI 마케팅 수익화 플랫폼",
  description: "소상공인 마케팅 자동화. 콘텐츠 제작, CRM, 영업 자동화, 수익 분석까지 18개 모듈 통합.",
  openGraph: {
    title: "카멜레온 — AI 마케팅 수익화 플랫폼",
    description: "릴스/블로그/카드뉴스 자동 제작 + CRM + 영업 자동화 + 수익 분석. 18개 모듈 통합.",
    siteName: "카멜레온",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className="min-h-full bg-[#0a0a0a] text-white pb-16 lg:pb-0">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
