import Link from "next/link";

interface Props {
  total: number;
  answered: number;
  correct: number;
  wrongCount: number;
  onRetryWrong: () => void;
  onRestart: () => void;
}

export function ResultPanel({ total, answered, correct, wrongCount, onRetryWrong, onRestart }: Props) {
  const rate = answered > 0 ? Math.round((correct / answered) * 100) : 0;
  const unanswered = total - answered;

  return (
    <section className="flex flex-col gap-4 py-6" aria-label="풀이 결과">
      <div className="rounded-2xl border border-line bg-surface p-6 text-center">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-ink-mute">RESULT</p>
        <p className="mt-3 text-5xl font-extrabold tabular-nums tracking-tight text-post">
          {rate}
          <span className="text-2xl">%</span>
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          {answered}문항 중 <b className="text-ink">{correct}문항</b> 정답
        </p>
        <dl className="mt-5 grid grid-cols-3 divide-x divide-line rounded-xl bg-canvas py-3 text-center">
          <div>
            <dt className="text-[11px] text-ink-mute">정답</dt>
            <dd className="mt-0.5 font-bold tabular-nums text-correct">{correct}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-ink-mute">오답</dt>
            <dd className="mt-0.5 font-bold tabular-nums text-signal">{wrongCount}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-ink-mute">미풀이</dt>
            <dd className="mt-0.5 font-bold tabular-nums text-ink-soft">{unanswered}</dd>
          </div>
        </dl>
      </div>

      <button
        type="button"
        onClick={onRetryWrong}
        disabled={wrongCount === 0}
        className="rounded-xl bg-post py-3.5 text-sm font-bold text-white shadow-md shadow-post/15 transition-all hover:bg-post-deep active:scale-[0.98] disabled:bg-ink-mute disabled:shadow-none"
      >
        {wrongCount > 0 ? `틀린 ${wrongCount}문항 다시 풀기` : "틀린 문항이 없습니다"}
      </button>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="flex-1 rounded-xl border border-line bg-surface py-3.5 text-sm font-bold text-ink-soft active:bg-canvas"
        >
          처음부터 다시
        </button>
        <Link href="/" className="flex-1 rounded-xl border border-line bg-surface py-3.5 text-center text-sm font-bold text-ink-soft active:bg-canvas">
          파트 목록
        </Link>
      </div>
    </section>
  );
}
