import { ScoreCard } from "./ScoreCard";

interface Props {
  total: number;
  answered: number;
  correct: number;
  wrongCount: number;
  onRetryWrong: () => void;
  onRestart: () => void;
  onReview: () => void;
}

export function ResultPanel({ total, answered, correct, wrongCount, onRetryWrong, onRestart, onReview }: Props) {
  return (
    <section className="flex flex-col gap-4 py-6" aria-label="풀이 결과">
      <ScoreCard total={total} answered={answered} correct={correct} wrongCount={wrongCount} />

      <button type="button" onClick={onRetryWrong} disabled={wrongCount === 0} className="btn-primary py-3.5 text-sm">
        {wrongCount > 0 ? `틀린 ${wrongCount}문항 다시 풀기` : "틀린 문항이 없어요"}
      </button>
      <div className="flex gap-3">
        <button type="button" onClick={onRestart} className="btn-ghost flex-1 py-3.5 text-sm" aria-label="초기화하고 1번부터 다시 풀기">
          🔄 초기화
        </button>
        <button type="button" onClick={onReview} disabled={answered === 0} className="btn-ghost flex-1 py-3.5 text-sm">
          📝 풀이 확인
        </button>
      </div>
      <p className="-mt-1 text-center text-[11px] text-ink-mute">초기화하면 이 PART의 풀이 기록을 지우고 처음 화면으로 돌아가요.</p>
    </section>
  );
}
