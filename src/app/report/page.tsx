import type { Metadata } from "next";

import { ReportClient } from "@/components/study/ReportClient";
import { listFullParts } from "@/lib/question-bank/repository";
import { listGlossaryTerms } from "@/lib/textbook/repository";

export const metadata: Metadata = { title: "학습 리포트" };

export default function Page() {
  return <ReportClient parts={listFullParts()} termCount={listGlossaryTerms().length} />;
}
