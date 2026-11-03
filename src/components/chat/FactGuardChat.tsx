"use client";

import { useRef, useState, type FormEvent } from "react";

import { Mascot } from "@/components/brand/Mascot";
import { useFactChat } from "@/hooks/useFactChat";
import { useKeyboardSafeViewport } from "@/hooks/useKeyboardSafeViewport";
import { suggestionsFor } from "@/lib/chat/rule-engine";
import { MESSAGE_MAX_LENGTH } from "@/lib/chat/sanitize";
import type { Question } from "@/types/question";

interface Props {
  question: Question;
  answered: boolean;
}

export function FactGuardChat({ question, answered }: Props) {
  const { turns, status, error, ask } = useFactChat(question, answered);
  const [draft, setDraft] = useState("");
  const zoneRef = useRef<HTMLElement>(null);
  useKeyboardSafeViewport(zoneRef);

  const loading = status === "loading";

  const send = async (text: string) => {
    setDraft("");
    const ok = await ask(text);
    if (!ok && text) setDraft((d) => d || text);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(draft);
  };

  return (
    <section ref={zoneRef} aria-label="누리 도우미" className="card flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mascot size={34} mood={loading ? "think" : "happy"} />
          <div>
            <h3 className="font-cute text-[15px] leading-none text-ink">누리 도우미</h3>
            <p className="mt-0.5 text-[10px] text-ink-mute">교재 내용으로만 답해요</p>
          </div>
        </div>
        <span className="chip bg-correct-soft text-correct">교재 기반</span>
      </div>

      <div className="flex flex-col gap-2 text-[13px] leading-relaxed" aria-live="polite">
        {turns.length === 0 && (
          <p className="rounded-2xl rounded-tl-sm bg-post-soft p-3 text-ink-soft">
            {answered
              ? "왜 이 선지가 정답인지, 다른 선지는 왜 틀렸는지, 용어 뜻을 물어보세요! 교재 문장 그대로 알려드릴게요."
              : "아직 답을 고르지 않으셨네요. 정답 대신 힌트를 드릴게요."}
          </p>
        )}
        {turns.map((t, i) =>
          t.role === "user" ? (
            <p key={i} className="ml-10 self-end whitespace-pre-wrap rounded-2xl rounded-br-sm bg-post px-3 py-2 text-white">
              {t.text}
            </p>
          ) : (
            <div key={i} className="mr-6 flex items-start gap-2">
              <Mascot size={26} className="mt-1 shrink-0" />
              <p className="whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-post-soft p-3 text-ink-soft">{t.text}</p>
            </div>
          ),
        )}
        {loading && (
          <div className="mr-6 flex items-center gap-2">
            <Mascot size={26} mood="think" className="shrink-0" />
            <p className="rounded-2xl rounded-tl-sm bg-post-soft px-3 py-2 text-ink-mute">교재를 펼쳐 보는 중…</p>
          </div>
        )}
        {error && (
          <p role="alert" className="rounded-2xl bg-signal-soft p-3 text-signal">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {suggestionsFor(answered, question).map((s) => (
          <button
            key={s}
            type="button"
            disabled={loading}
            onClick={() => void send(s)}
            className="chip border-[1.5px] border-post/30 bg-surface py-1.5 text-post active:bg-post-soft disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="relative flex items-center">
        <label htmlFor={`ask-${question.id}`} className="sr-only">
          이 문항에 대해 질문하기
        </label>
        <input
          id={`ask-${question.id}`}
          type="text"
          inputMode="text"
          enterKeyHint="send"
          autoComplete="off"
          maxLength={MESSAGE_MAX_LENGTH}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="이 문제에서 궁금한 점을 적어 주세요"
          className="w-full rounded-2xl border-[1.5px] border-line bg-canvas py-3 pl-4 pr-12 text-base text-ink placeholder:text-[13px] placeholder:text-ink-mute focus:border-post focus:bg-surface focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || draft.trim().length === 0}
          aria-label="질문 보내기"
          className="absolute right-1.5 grid size-9 place-items-center rounded-xl bg-post text-white transition-all hover:bg-post-deep active:scale-95 disabled:opacity-40"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 12l16-8-6 16-2.5-6.5L4 12z" />
          </svg>
        </button>
      </form>
      <p className="text-[10px] leading-snug text-ink-mute">
        누리는 인터넷 없이 이 기기 안에서 교재 문장을 찾아 답해요. 개인정보는 입력하지 마세요.
      </p>
    </section>
  );
}
