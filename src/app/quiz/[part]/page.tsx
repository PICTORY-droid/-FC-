import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { QuizClient } from "@/components/quiz/QuizClient";
import { getPart, listParts } from "@/lib/question-bank/repository";

interface Props {
  params: Promise<{ part: string }>;
}

function parsePart(raw: string): number | null {
  return /^[1-9]$/.test(raw) ? Number(raw) : null;
}

export function generateStaticParams() {
  return listParts().map((p) => ({ part: String(p.part) }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const no = parsePart((await params).part);
  const part = no ? getPart(no) : null;
  return { title: part ? `PART ${part.part} ${part.title}` : "문항 없음" };
}

export default async function QuizPage({ params }: Props) {
  const no = parsePart((await params).part);
  const part = no ? getPart(no) : null;
  if (!part) notFound();
  return <QuizClient part={part} />;
}
