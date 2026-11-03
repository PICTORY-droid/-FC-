import type { Metadata } from "next";

import { Mascot } from "@/components/brand/Mascot";
import { formatKoreanDateTime } from "@/lib/access/format-date";
import { checkInvite, formatInviteCode, normalizeInviteCode } from "@/lib/auth/invite";
import { ACCESS_DAYS } from "@/lib/auth/session";

export const metadata: Metadata = { title: "입장하기" };
export const dynamic = "force-dynamic";

const MESSAGES: Record<string, string> = {
  wrong: "비밀번호가 맞지 않아요. 다시 입력해 주세요.",
  locked: "여러 번 틀려서 10분 동안 입장이 잠겼어요. 잠시 후 다시 시도해 주세요.",
  setup: "아직 입장 설정이 끝나지 않았어요. 관리자에게 문의해 주세요.",
  invite: "초대 코드가 올바르지 않아요. 받은 링크를 다시 눌러 주세요.",
  "invite-expired": "초대 링크의 유효 기간(7일)이 지났어요. 담당 FC에게 새 링크를 받아 주세요.",
};

const FIELD =
  "w-full rounded-2xl border-[1.5px] border-line bg-canvas px-4 py-3.5 text-center text-ink placeholder:text-sm placeholder:tracking-normal placeholder:text-ink-mute focus:border-post focus:bg-surface focus:outline-none";

interface Props {
  searchParams: Promise<{ error?: string; c?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { error, c } = await searchParams;
  const code = normalizeInviteCode(c);
  const invite = code ? await checkInvite(code) : null;
  const inviteOk = invite?.status === "valid";

  const message =
    (error && MESSAGES[error]) ||
    (invite?.status === "expired" ? MESSAGES["invite-expired"] : invite?.status === "invalid" ? MESSAGES.invite : null);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-4 py-10">
      <div className="card w-full overflow-hidden p-6 text-center">
        <div className="airmail -mx-6 -mt-6 mb-6 rounded-none" aria-hidden />
        <Mascot size={80} className="mx-auto" />
        <h1 className="mt-3 font-cute text-[26px] text-post">우체국 FC 문제은행</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {inviteOk ? "초대를 확인했어요. 비밀번호를 입력해 주세요." : "담당 FC에게 받은 초대 링크(또는 코드)로 입장해요."}
        </p>

        <form action="/api/auth/login" method="post" className="mt-6 flex flex-col gap-3">
          {inviteOk && code ? (
            <>
              <input type="hidden" name="code" value={code} />
              <p className="rounded-2xl bg-correct-soft px-3 py-2.5 text-xs font-bold text-correct">
                💌 초대 확인 완료 · {formatKoreanDateTime(invite.expiresAt!)}까지 입장 가능
              </p>
            </>
          ) : (
            <>
              <label htmlFor="code" className="sr-only">
                초대 코드
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={512}
                defaultValue={code ? formatInviteCode(code) : undefined}
                placeholder="초대 코드 또는 링크 붙여넣기"
                className={`${FIELD} text-sm tracking-wider`}
              />
            </>
          )}

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
            className={`${FIELD} text-lg tracking-[0.4em]`}
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
      <p className="mt-6 text-center text-[11px] leading-relaxed text-ink-mute">
        입장한 날부터 {ACCESS_DAYS}일 동안 이 기기에서 이용할 수 있어요.
        <br />
        기간이 끝나면 담당 FC에게 새 링크를 받아 주세요.
      </p>
    </main>
  );
}
