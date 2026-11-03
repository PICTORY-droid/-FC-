import type { Metadata } from "next";

import { Mascot } from "@/components/brand/Mascot";

export const metadata: Metadata = { title: "입장하기" };

const MESSAGES: Record<string, string> = {
  wrong: "비밀번호가 맞지 않아요. 다시 입력해 주세요.",
  locked: "여러 번 틀려서 10분 동안 입장이 잠겼어요. 잠시 후 다시 시도해 주세요.",
  setup: "아직 비밀번호가 설정되지 않았어요. 관리자에게 문의해 주세요.",
};

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const message = error ? MESSAGES[error] : null;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-4 py-10">
      <div className="card w-full overflow-hidden p-6 text-center">
        <div className="airmail -mx-6 -mt-6 mb-6 rounded-none" aria-hidden />
        <Mascot size={80} className="mx-auto" />
        <h1 className="mt-3 font-cute text-[26px] text-post">우체국 FC 문제은행</h1>
        <p className="mt-1 text-sm text-ink-soft">FC 전용 학습 공간이에요. 비밀번호를 입력해 주세요.</p>

        <form action="/api/auth/login" method="post" className="mt-6 flex flex-col gap-3">
          <label htmlFor="password" className="sr-only">
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            required
            maxLength={64}
            placeholder="비밀번호"
            className="w-full rounded-2xl border-[1.5px] border-line bg-canvas px-4 py-3.5 text-center text-lg tracking-[0.4em] text-ink placeholder:tracking-normal placeholder:text-sm placeholder:text-ink-mute focus:border-post focus:bg-surface focus:outline-none"
          />
          {message && (
            <p role="alert" className="rounded-2xl bg-signal-soft px-3 py-2 text-xs text-signal">
              {message}
            </p>
          )}
          <button type="submit" className="btn-primary py-3.5 text-sm">
            입장하기
          </button>
        </form>
      </div>
      <p className="mt-6 text-[11px] text-ink-mute">한 번 입장하면 이 기기에서 30일 동안 유지돼요.</p>
    </main>
  );
}
