import type { Metadata, Viewport } from "next";

import { ServiceWorkerRegistrar } from "@/components/pwa/ServiceWorkerRegistrar";

import "./globals.css";

export const metadata: Metadata = {
  title: { default: "우체국보험 문제은행", template: "%s · 우체국보험 문제은행" },
  description: "우체국보험 개론 평가시험 문제은행 240문항 모바일 학습과 교재 기반 AI 해설",
  applicationName: "FC 문제은행",
  robots: { index: false, follow: false },
  authors: [{ name: "김서인" }],
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: { capable: true, title: "FC 문제은행", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#0054a6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-dvh antialiased">
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
