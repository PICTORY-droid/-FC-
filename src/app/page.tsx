import { Mascot } from "@/components/brand/Mascot";
import { ModePicker } from "@/components/home/ModePicker";
import { PartCard } from "@/components/home/PartCard";
import { InstallAppCard } from "@/components/pwa/InstallAppCard";
import { getSource, listParts } from "@/lib/question-bank/repository";

export default function HomePage() {
  const parts = listParts();
  const total = parts.reduce((sum, p) => sum + p.total, 0);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-10 pt-[max(env(safe-area-inset-top),1.75rem)]">
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <Mascot size={56} />
          <h1 className="font-cute text-[28px] leading-tight text-post">우체국 FC 문제은행</h1>
        </div>
        <div className="airmail mt-5" aria-hidden />
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          교재 원문 그대로 담은 <b className="text-ink">{total}문항</b>이에요. 풀면 바로 채점하고 해설을 보여드려요. 궁금한 건
          누리 도우미에게 물어보세요 💌
        </p>
      </header>

      <InstallAppCard />

      <ModePicker />

      <section aria-label="파트 선택" className="flex flex-col gap-3">
        {parts.map((p) => (
          <PartCard key={p.part} part={p} />
        ))}
      </section>

      <footer className="mt-auto pt-10 text-[11px] leading-relaxed text-ink-mute">
        <p>출처: {getSource()}</p>
        <p className="mt-1">개인 학습용 · 진행 기록은 이 기기에만 저장돼요.</p>
      </footer>
    </main>
  );
}
