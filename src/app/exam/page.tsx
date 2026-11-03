import type { Metadata } from "next";

import { ExamClient } from "@/components/study/ExamClient";
import { listFullParts } from "@/lib/question-bank/repository";

export const metadata: Metadata = { title: "실전 모의고사" };

export default function Page() {
  return <ExamClient parts={listFullParts()} />;
}
