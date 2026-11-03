import type { Metadata } from "next";

import { TodayClient } from "@/components/study/TodayClient";
import { listFullParts } from "@/lib/question-bank/repository";

export const metadata: Metadata = { title: "오늘의 10문제" };

export default function Page() {
  return <TodayClient parts={listFullParts()} />;
}
