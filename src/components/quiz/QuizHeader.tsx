import Link from "next/link";

interface Props {
  partNo: number;
  title: string;
  position: number;
  total: number;
  correct: number;
  answered: number;
  isReview: boolean;
}

export function QuizHeader({ partNo, title, position, total, correct, answered, isReview }: Props) {
  return (
    <header className="sticky top-0 z-10 -mx-4 border-b border-line/70 bg-canvas/90 px-4 pb-3 pt-[max(env(safe-area-inset-top),0.75rem)] backdrop-blur">
      <div className="flex items-center justify-between">
        <Link href="/" className="-ml-1 rounded-lg px-1 py-1 text-sm font-medium text-ink-soft hover:text-post" aria-label="파트 목록으로">
          ← 목록
        </Link>
        <p className="text-[11px] font-semibold tracking-[0.16em] text-post">
          PART {partNo} {isReview && <span className="ml-1 text-signal">· 오답 다시풀기</span>}
        </p>
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <h1 className="truncate text-[15px] font-bold tracking-tight text-ink">{title}</h1>
        <p className="shrink-0 text-xs tabular-nums text-ink-mute">
          <span className="font-bold text-ink">{position}</span> / {total}
          {answered > 0 && <span className="ml-2">정답 {correct}</span>}
        </p>
      </div>
      <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-line/60" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={position}>
        <div className="h-full rounded-full bg-post transition-[width] duration-300" style={{ width: `${(position / total) * 100}%` }} />
      </div>
    </header>
  );
}
