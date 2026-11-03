import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

import { DeviceWipe } from "@/components/access/DeviceWipe";
import { Mascot } from "@/components/brand/Mascot";
import { SESSION_COOKIE, readSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "이용 기간 종료" };
export const dynamic = "force-dynamic";

/** Shown once a device's 30 days are over. Clears everything the app stored on it. */
export default async function ExpiredPage() {
  const session = await readSession((await cookies()).get(SESSION_COOKIE)?.value);
  // Server says the 30 days are not over: the phone's clock is off, so don't wipe.
  if (session.status === "valid") return <ClockMismatch />;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-4 py-10">
      <DeviceWipe />
      <div className="card w-full overflow-hidden p-6 text-center">
        <div className="airmail -mx-6 -mt-6 mb-6 rounded-none" aria-hidden />
        <Mascot size={80} mood="sad" className="mx-auto" />
        <h1 className="mt-3 font-cute text-[24px] text-post">이용 기간이 끝났어요</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          담당 FC에게 새 링크를 받아 주세요.
          <br />새 링크로 입장하면 다시 30일 동안 이용할 수 있어요.
        </p>
        <Link href="/login" className="btn-primary mt-6 block py-3.5 text-sm">
          새 초대 코드 입력하기
        </Link>
      </div>
      <p className="mt-6 text-[11px] text-ink-mute">이 기기에 저장된 문제와 풀이 기록은 모두 지웠어요.</p>
    </main>
  );
}

function ClockMismatch() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-4 py-10">
      <div className="card w-full overflow-hidden p-6 text-center">
        <div className="airmail -mx-6 -mt-6 mb-6 rounded-none" aria-hidden />
        <Mascot size={80} mood="think" className="mx-auto" />
        <h1 className="mt-3 font-cute text-[22px] text-post">기기 시간을 확인해 주세요</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          아직 이용 기간이 남아 있어요.
          <br />
          휴대폰의 날짜·시간을 &lsquo;자동 설정&rsquo;으로 바꾼 뒤 다시 열어 주세요.
        </p>
        <Link href="/" className="btn-primary mt-6 block py-3.5 text-sm">
          다시 열기
        </Link>
      </div>
    </main>
  );
}
