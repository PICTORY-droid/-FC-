import type { Metadata, Viewport } from "next";

import { ServiceWorkerRegistrar } from "@/components/pwa/ServiceWorkerRegistrar";
import { APP_ICONS, SHARE_IMAGE, siteUrl } from "@/lib/brand/assets";

import "./globals.css";

const SHARE_TITLE = "우체국 FC 문제은행";
const SHARE_DESCRIPTION = "교재 원문 240문항을 풀고 바로 채점 · 해설! 궁금한 건 누리 도우미에게 물어보세요 💌";

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: { default: SHARE_TITLE, template: "%s · FC 문제은행" },
  description: SHARE_DESCRIPTION,
  applicationName: "FC 문제은행",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: SHARE_TITLE,
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    images: [SHARE_IMAGE.url],
  },
  robots: { index: false, follow: false },
  authors: [{ name: "김서인" }],
  icons: {
    icon: [{ url: APP_ICONS.any192, sizes: "192x192", type: "image/png" }],
    apple: [{ url: APP_ICONS.apple180, sizes: "180x180" }],
  },
  appleWebApp: { capable: true, title: "FC 문제은행", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#fff8f1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jua&display=swap" />
      </head>
      <body className="min-h-dvh antialiased">
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
