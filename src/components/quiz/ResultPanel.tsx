import Link from "next/link";

import { Mascot } from "@/components/brand/Mascot";

interface Props {
  total: number;
  answered: number;
  correct: number;
  wrongCount: number;
  onRetryWrong: () => void;
  onRestart: () => void;
}

function cheer(rate: number) {
  if (rate >= 90) return { mood: "wow" as const, text: "완벽에 가까워요! 시험장도 문제없어요 🎉" };
  if (rate >= 70) return { mood: "happy" as const, text: "잘하고 있어요! 틀린 문제만 한 번 더 볼까요?" };
  return { mood: "think" as const, text: "괜찮아요, 오답을 다시 풀면 금방 올라가요 💪" };
}

export function ResultPanel({ total, answered, correct, wrongCount, onRetryWrong, onRestart }: Props) {
  const rate = answered > 0 ? Math.round((correct / answered) * 100) : 0;
  const unanswered = total - answered;
  const { mood, text } = cheer(rate);

  return (
    <section className="flex flex-col gap-4 py-6" aria-label="풀이 결과">
      <div className="card overflow-hidden p-6 text-center">
        <div className="airmail -mx-6 -mt-6 mb-5 rounded-none" aria-hidden />
        <Mascot size={72} mood={mood} className="mx-auto animate-wiggle" />
        <p className="mt-3 font-cute text-6xl tabular-nums text-post">
          {rate}
          <span className="text-3xl">점</span>
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          {answered}문항 중 <b className="text-ink">{correct}문항</b> 정답 · {text}
        </p>
        <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-correct-soft py-3">
            <dt className="text-[11px] text-ink-mute">정답</dt>
            <dd className="font-cute text-xl tabular-nums text-correct">{correct}</dd>
          </div>
          <div className="rounded-2xl bg-signal-soft py-3">
            <dt className="text-[11px] text-ink-mute">오답</dt>
            <dd className="font-cute text-xl tabular-nums text-signal">{wrongCount}</dd>
          </div>
          <div className="rounded-2xl bg-canvas py-3">
            <dt className="text-[11px] text-ink-mute">미풀이</dt>
            <dd className="font-cute text-xl tabular-nums text-ink-soft">{unanswered}</dd>
          </div>
        </dl>
      </div>

      <button type="button" onClick={onRetryWrong} disabled={wrongCount === 0} className="btn-primary py-3.5 text-sm">
        {wrongCount > 0 ? `틀린 ${wrongCount}문항 다시 풀기` : "틀린 문항이 없어요 🎉"}
      </button>
      <div className="flex gap-3">
        <button type="button" onClick={onRestart} className="btn-ghost flex-1 py-3.5 text-sm">
          처음부터 다시
        </button>
        <Link href="/" className="btn-ghost flex-1 py-3.5 text-center text-sm">
          파트 목록
        </Link>
      </div>
    </section>
  );
}
