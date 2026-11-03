"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-lg font-bold text-ink">화면을 불러오지 못했습니다</h1>
      <p className="text-sm text-ink-soft">잠시 후 다시 시도해 주세요.</p>
      <button type="button" onClick={reset} className="rounded-xl bg-post px-5 py-3 text-sm font-bold text-white">
        다시 시도
      </button>
    </main>
  );
}
