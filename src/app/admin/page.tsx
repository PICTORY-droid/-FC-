import type { Metadata } from "next";

import { InvitePanel } from "@/components/access/InvitePanel";
import { Mascot } from "@/components/brand/Mascot";
import { INVITE_DAYS } from "@/lib/auth/invite";
import { ACCESS_DAYS } from "@/lib/auth/session";

export const metadata: Metadata = { title: "초대 링크 발급" };

/** Issuer screen: makes a fresh invite link for one FC to share. */
export default function AdminPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="card overflow-hidden p-6">
        <div className="airmail -mx-6 -mt-6 mb-6 rounded-none" aria-hidden />
        <div className="text-center">
          <Mascot size={64} className="mx-auto" />
          <h1 className="mt-2 font-cute text-[22px] text-post">초대 링크 발급</h1>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            링크는 {INVITE_DAYS}일 안에 열어야 하고, 입장한 날부터 {ACCESS_DAYS}일 동안 이용할 수 있어요.
          </p>
        </div>
        <InvitePanel />
      </div>
      <p className="mt-6 text-center text-[11px] text-ink-mute">입장 비밀번호는 링크와 따로 알려 주세요.</p>
    </main>
  );
}
