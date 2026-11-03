import type { Metadata } from "next";

import { WrongNoteClient } from "@/components/study/WrongNoteClient";
import { listFullParts } from "@/lib/question-bank/repository";

export const metadata: Metadata = { title: "오답노트" };

export default function Page() {
  return <WrongNoteClient parts={listFullParts()} />;
}
