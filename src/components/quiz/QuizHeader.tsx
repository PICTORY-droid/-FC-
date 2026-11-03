import Link from "next/link";

interface Props {
  /** 오른쪽 위 칩 (예: "PART 1", "오답노트") */
  badge: string;
  title: string;
  position: number;
  total: number;
  correct: number;
  answered: number;
  isReview: boolean;
  modeLabel: string;
  /** 왼쪽 위 돌아가기 링크 */
  backHref?: string;
  backLabel?: string;
}

export function QuizHeader({ badge, title, position, total, correct, answered, isReview, modeLabel, backHref = "/", backLabel = "← 목록" }: Props) {
  return (
    <header className="sticky top-0 z-10 -mx-4 bg-canvas/95 px-4 pb-3 pt-[max(env(safe-area-inset-top),0.75rem)] backdrop-blur">
      <div className="flex items-center justify-between">
        <Link href={backHref} className="btn-ghost px-3 py-1.5 text-xs" aria-label="이전 화면으로">
          {backLabel}
        </Link>
        <div className="flex items-center gap-1.5">
          {isReview && <span className="chip bg-signal-soft text-signal">오답 다시풀기</span>}
          <span className="chip bg-sunny-soft text-ink-soft">{modeLabel}</span>
          <span className="chip bg-post-soft text-post">{badge}</span>
        </div>
      </div>
      <div className="mt-2.5 flex items-end justify-between gap-3">
        <h1 className="truncate font-cute text-[18px] text-ink">{title}</h1>
        <p className="shrink-0 text-xs tabular-nums text-ink-mute">
          <span className="font-bold text-post">{position}</span> / {total}
          {answered > 0 && <span className="chip ml-2 bg-correct-soft text-correct">정답 {correct}</span>}
        </p>
      </div>
      <div
        className="mt-2.5 h-2 overflow-hidden rounded-full bg-post-soft"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={position}
      >
        <div className="h-full rounded-full bg-post transition-[width] duration-300" style={{ width: `${(position / total) * 100}%` }} />
      </div>
    </header>
  );
}
