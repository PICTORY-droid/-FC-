import type { Metadata } from "next";

import { StarsClient } from "@/components/study/StarsClient";
import { listFullParts } from "@/lib/question-bank/repository";

export const metadata: Metadata = { title: "즐겨찾기" };

export default function Page() {
  return <StarsClient parts={listFullParts()} />;
}
