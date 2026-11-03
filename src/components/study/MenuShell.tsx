import Link from "next/link";

import { Mascot } from "@/components/brand/Mascot";

interface Props {
  emoji: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

/** 학습 메뉴 첫 화면의 공통 틀 — 홈과 같은 우체국 감성 헤더 */
export function MenuShell({ emoji, title, description, children }: Props) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-10 pt-[max(env(safe-area-inset-top),1rem)]">
      <header className="mb-5">
        <Link href="/" className="btn-ghost inline-block px-3 py-1.5 text-xs">
          ← 홈
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <span className="stamp grid size-14 shrink-0 place-items-center bg-post-soft text-[26px]" aria-hidden>
            {emoji}
          </span>
          <div className="min-w-0">
            <h1 className="font-cute text-[24px] leading-tight text-post">{title}</h1>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{description}</p>
          </div>
        </div>
        <div className="airmail mt-4" aria-hidden />
      </header>
      {children}
    </main>
  );
}

/** 빈 상태 안내 카드 */
export function EmptyCard({ title, text, mood = "think" }: { title: string; text: string; mood?: "think" | "wow" | "happy" }) {
  return (
    <div className="card flex flex-col items-center gap-2 p-6 text-center">
      <Mascot size={64} mood={mood} />
      <p className="font-cute text-[17px] text-ink">{title}</p>
      <p className="text-sm leading-relaxed text-ink-soft">{text}</p>
      <Link href="/" className="btn-primary mt-3 w-full py-3.5 text-sm">
        PART 문제 풀러 가기
      </Link>
    </div>
  );
}

/** 숫자 요약 타일 */
export function StatTile({ label, value, tone = "post" }: { label: string; value: React.ReactNode; tone?: "post" | "correct" | "signal" | "ink" }) {
  const color = { post: "text-post", correct: "text-correct", signal: "text-signal", ink: "text-ink" }[tone];
  const bg = { post: "bg-post-soft", correct: "bg-correct-soft", signal: "bg-signal-soft", ink: "bg-canvas" }[tone];
  return (
    <div className={`rounded-2xl ${bg} px-2 py-3 text-center`}>
      <p className="text-[11px] text-ink-mute">{label}</p>
      <p className={`font-cute text-xl tabular-nums ${color}`}>{value}</p>
    </div>
  );
}
