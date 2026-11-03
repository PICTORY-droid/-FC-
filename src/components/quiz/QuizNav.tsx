interface Props {
  canPrev: boolean;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function QuizNav({ canPrev, isLast, onPrev, onNext }: Props) {
  return (
    <nav className="flex w-full gap-3" aria-label="문항 이동">
      <button type="button" onClick={onPrev} disabled={!canPrev} className="btn-ghost flex-1 py-3.5 text-sm">
        이전 문항
      </button>
      <button type="button" onClick={onNext} className="btn-primary flex-1 py-3.5 text-sm">
        {isLast ? "결과 보기 📮" : "다음 문항 →"}
      </button>
    </nav>
  );
}
