"use client";

import { useEffect, useRef, useState } from "react";

const MESSAGES = ["힘내요!", "잘 하고 있어요!", "가능성이 보여요!", "제가 응원하고 있어요!"] as const;
/** 몇 문항마다 응원할지 */
export const CHEER_EVERY = 35;
/** 화면에 머무는 시간(ms) — 짧게 보였다 사라짐 */
const VISIBLE_MS = 1400;

/**
 * 35문항마다 화면 위쪽에 살짝 나타났다 스스로 사라지는 응원 표시.
 * 클릭을 막지 않고(pointer-events: none), 풀이를 방해하지 않습니다.
 */
export function CheerToast({ answered, ready }: { answered: number; ready: boolean }) {
  const [message, setMessage] = useState<string | null>(null);
  const prevRef = useRef<number | null>(null);

  useEffect(() => {
    if (!ready) return;
    const prev = prevRef.current;
    prevRef.current = answered;
    // 처음 불러온 기록이나 '처음부터'로 줄어든 경우는 응원하지 않음
    if (prev === null || answered <= prev) return;
    if (answered % CHEER_EVERY !== 0) return;
    setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
  }, [answered, ready]);

  // 숨김 타이머는 메시지에만 묶어서, 그 사이 다음 문항을 풀어도 반드시 사라지게 함
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="cheer-toast pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+7.25rem)] z-40 flex justify-center px-4"
    >
      <span className="rounded-full bg-post px-4 py-2 font-cute text-[15px] text-white shadow-[var(--shadow-soft)]">
        📮 {message} <span className="opacity-80">· {answered}문항째</span>
      </span>
    </div>
  );
}
