import type { MetadataRoute } from "next";

import { APP_ICONS } from "@/lib/brand/assets";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "우체국 FC 문제은행",
    short_name: "FC 문제은행",
    description: "우체국보험 개론 평가시험 문제은행 240문항 모바일 학습 · 누리 도우미",
    lang: "ko",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fff8f1",
    theme_color: "#fff8f1",
    categories: ["education"],
    icons: [
      { src: APP_ICONS.any192, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: APP_ICONS.any512, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: APP_ICONS.maskable512, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
