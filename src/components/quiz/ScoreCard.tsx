import { Mascot } from "@/components/brand/Mascot";

interface Props {
  total: number;
  answered: number;
  correct: number;
  wrongCount: number;
  /** 점수 아래 추가 정보 (예: 소요 시간) */
  extra?: React.ReactNode;
  /** "answered": 푼 문항 기준(연습) · "total": 전체 문항 기준(모의고사, 안 푼 문항은 0점) */
  scoreBase?: "answered" | "total";
}

function cheer(rate: number) {
  if (rate >= 90) return { mood: "wow" as const, text: "완벽에 가까워요! 시험장도 문제없어요!" };
  if (rate >= 70) return { mood: "happy" as const, text: "잘하고 있어요! 틀린 문제만 한 번 더 볼까요?" };
  return { mood: "think" as const, text: "괜찮아요, 오답을 다시 풀면 금방 올라가요!" };
}

/** 점수·정답·오답·미풀이를 보여 주는 공통 결과 카드 */
export function ScoreCard({ total, answered, correct, wrongCount, extra, scoreBase = "answered" }: Props) {
  const base = scoreBase === "total" ? total : answered;
  const rate = base > 0 ? Math.round((correct / base) * 100) : 0;
  const unanswered = total - answered;
  const { mood, text } = cheer(rate);

  return (
    <div className="card overflow-hidden p-6 text-center">
      <div className="airmail -mx-6 -mt-6 mb-5 rounded-none" aria-hidden />
      <Mascot size={72} mood={mood} className="mx-auto animate-wiggle" />
      <p className="mt-3 font-cute text-6xl tabular-nums text-post">
        {rate}
        <span className="text-3xl">점</span>
      </p>
      <p className="mt-2 text-sm text-ink-soft">
        {base}문항 중 <b className="text-ink">{correct}문항</b> 정답 · {text}
      </p>
      {extra}
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
  );
}
