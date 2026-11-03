"use client";

import { useRef, useState, type FormEvent } from "react";

import { useFactChat } from "@/hooks/useFactChat";
import { useKeyboardSafeViewport } from "@/hooks/useKeyboardSafeViewport";
import { MESSAGE_MAX_LENGTH } from "@/lib/chat/sanitize";

interface Props {
  questionId: string;
  answered: boolean;
}

export function FactGuardChat({ questionId, answered }: Props) {
  const { turns, status, error, ask } = useFactChat(questionId, answered);
  const [draft, setDraft] = useState("");
  const zoneRef = useRef<HTMLElement>(null);
  useKeyboardSafeViewport(zoneRef);

  const loading = status === "loading";

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = draft;
    setDraft("");
    const ok = await ask(text);
    if (!ok && text) setDraft((d) => d || text);
  };

  return (
    <section ref={zoneRef} aria-label="AI 학습 도우미" className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="size-2 animate-pulse rounded-full bg-signal" aria-hidden />
          <h3 className="text-xs font-extrabold tracking-tight text-ink">우체국 FC 학습 AI</h3>
        </div>
        <span className="rounded border border-line bg-canvas px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-ink-mute">
          Fact-Only Guard
        </span>
      </div>

      <div className="flex flex-col gap-2 text-[13px] leading-relaxed" aria-live="polite">
        {turns.length === 0 && (
          <p className="rounded-xl bg-canvas p-3 text-ink-soft">
            {answered
              ? "이 문항의 교재 문구와 해설 범위 안에서만 답합니다. 왜 이 선지가 정답인지, 다른 선지는 왜 틀렸는지 물어보세요."
              : "아직 답을 고르지 않았으니 정답 대신 힌트만 드립니다. 헷갈리는 용어를 물어보세요."}
          </p>
        )}
        {turns.map((t, i) =>
          t.role === "user" ? (
            <p key={i} className="ml-8 self-end whitespace-pre-wrap rounded-xl rounded-br-sm bg-post px-3 py-2 text-white">
              {t.text}
            </p>
          ) : (
            <div key={i} className="mr-4 rounded-xl rounded-bl-sm border border-line/70 bg-canvas p-3">
              <p className="mb-1 text-[11px] font-bold text-post">AI 분석 답변</p>
              <p className="whitespace-pre-wrap text-ink-soft">{t.text}</p>
            </div>
          ),
        )}
        {loading && <p className="mr-4 rounded-xl bg-canvas p-3 text-ink-mute">교재 문구를 대조하는 중…</p>}
        {error && (
          <p role="alert" className="rounded-xl bg-signal-soft p-3 text-signal">
            {error}
          </p>
        )}
      </div>

      <form onSubmit={onSubmit} className="relative flex items-center">
        <label htmlFor={`ask-${questionId}`} className="sr-only">
          이 문항에 대해 질문하기
        </label>
        <input
          id={`ask-${questionId}`}
          type="text"
          inputMode="text"
          enterKeyHint="send"
          autoComplete="off"
          maxLength={MESSAGE_MAX_LENGTH}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="이 문항 범위 안에서 궁금한 점을 입력하세요"
          className="w-full rounded-xl border border-line bg-canvas py-3 pl-3 pr-11 text-base text-ink shadow-inner placeholder:text-[13px] placeholder:text-ink-mute focus:border-post focus:bg-surface focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || draft.trim().length === 0}
          aria-label="질문 전송"
          className="absolute right-1.5 grid size-8 place-items-center rounded-lg bg-post text-white transition-all hover:bg-post-deep active:scale-95 disabled:opacity-40"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </form>
      <p className="text-[10px] leading-snug text-ink-mute">
        AI 답변은 교재 문구를 요약한 것으로 오류가 있을 수 있습니다. 개인정보는 입력하지 마세요.
      </p>
    </section>
  );
}
