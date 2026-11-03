interface Props {
  canPrev: boolean;
  isLast: boolean;
  /** 직접 정답 확인 모드에서 아직 채점 전인 문항 */
  awaitingConfirm: boolean;
  canConfirm: boolean;
  onPrev: () => void;
  onNext: () => void;
  onConfirm: () => void;
}

export function QuizNav({ canPrev, isLast, awaitingConfirm, canConfirm, onPrev, onNext, onConfirm }: Props) {
  const nextLabel = isLast ? "결과 보기" : "다음 문항 →";

  return (
    <nav className="flex w-full flex-col gap-2" aria-label="문항 이동">
      <div className="flex gap-3">
        <button type="button" onClick={onPrev} disabled={!canPrev} className="btn-ghost flex-1 py-3.5 text-sm">
          이전 문항
        </button>
        {awaitingConfirm ? (
          <button type="button" onClick={onConfirm} disabled={!canConfirm} className="btn-primary flex-1 py-3.5 text-sm">
            정답 확인
          </button>
        ) : (
          <button type="button" onClick={onNext} className="btn-primary flex-1 py-3.5 text-sm">
            {nextLabel}
          </button>
        )}
      </div>
      {awaitingConfirm && (
        <button type="button" onClick={onNext} className="self-end px-1 text-xs font-bold text-ink-mute active:text-post">
          {isLast ? "풀지 않고 결과 보기 →" : "이 문항 건너뛰기 →"}
        </button>
      )}
    </nav>
  );
}
