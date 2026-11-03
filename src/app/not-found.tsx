import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-ink-mute">404</p>
      <h1 className="text-lg font-bold text-ink">요청하신 파트를 찾을 수 없습니다</h1>
      <Link href="/" className="rounded-xl bg-post px-5 py-3 text-sm font-bold text-white">
        파트 목록으로
      </Link>
    </main>
  );
}
