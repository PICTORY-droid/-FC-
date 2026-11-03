import Link from "next/link";

import { Mascot } from "@/components/brand/Mascot";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <Mascot size={88} mood="wow" />
      <p className="chip bg-post-soft text-post">404</p>
      <h1 className="font-cute text-2xl text-ink">이 주소에는 편지가 없어요</h1>
      <p className="text-sm text-ink-soft">요청하신 파트를 찾을 수 없어요.</p>
      <Link href="/" className="btn-primary px-6 py-3 text-sm">
        파트 목록으로
      </Link>
    </main>
  );
}
