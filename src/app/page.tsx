import { PartCard } from "@/components/home/PartCard";
import { getSource, listParts } from "@/lib/question-bank/repository";

export default function HomePage() {
  const parts = listParts();
  const total = parts.reduce((sum, p) => sum + p.total, 0);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-10 pt-[max(env(safe-area-inset-top),2.5rem)]">
      <header className="mb-8">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-signal" aria-hidden />
          <p className="text-[11px] font-semibold tracking-[0.2em] text-ink-mute">KOREA POST INSURANCE</p>
        </div>
        <h1 className="mt-3 text-[26px] font-extrabold leading-tight tracking-tight text-ink">
          평가시험
          <br />
          <span className="text-post">문제은행</span>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          교재 원문 기반 {total}문항. 풀이 즉시 채점과 해설, 문항 범위 안에서만 답하는 AI 도우미를 함께 제공합니다.
        </p>
      </header>

      <section aria-label="파트 선택" className="flex flex-col gap-3">
        {parts.map((p) => (
          <PartCard key={p.part} part={p} />
        ))}
      </section>

      <footer className="mt-auto pt-10 text-[11px] leading-relaxed text-ink-mute">
        <p>출처: {getSource()}</p>
        <p className="mt-1">개인 학습용 · 진행 기록은 이 기기에만 저장됩니다.</p>
      </footer>
    </main>
  );
}
