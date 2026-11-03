import type { Metadata } from "next";

import { TermsClient } from "@/components/study/TermsClient";
import { listGlossaryTerms } from "@/lib/textbook/repository";

export const metadata: Metadata = { title: "핵심 용어 카드" };

export default function Page() {
  return <TermsClient terms={listGlossaryTerms()} />;
}
