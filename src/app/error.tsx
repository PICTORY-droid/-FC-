"use client";

import { Mascot } from "@/components/brand/Mascot";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <Mascot size={88} mood="sad" />
      <h1 className="font-cute text-2xl text-ink">화면을 불러오지 못했어요</h1>
      <p className="text-sm text-ink-soft">잠시 후 다시 시도해 주세요.</p>
      <button type="button" onClick={reset} className="btn-primary px-6 py-3 text-sm">
        다시 시도
      </button>
    </main>
  );
}
