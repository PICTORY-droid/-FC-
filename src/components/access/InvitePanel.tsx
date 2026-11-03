"use client";

import { useEffect, useState, type FormEvent } from "react";

import { formatKoreanDateTime } from "@/lib/access/format-date";
import { requestInvite, type InviteResponse } from "@/lib/access/invite-client";

const SHARE_TEXT = "우체국 FC 문제은행 초대 링크예요. 7일 안에 열고, 안내받은 비밀번호로 입장해 주세요.";

export function InvitePanel() {
  const [password, setPassword] = useState("");
  const [invite, setInvite] = useState<InviteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => setCanShare(typeof navigator.share === "function"), []);

  const issue = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError(null);
    setCopied(false);
    try {
      setInvite(await requestInvite(password));
    } catch (err) {
      setInvite(null);
      setError(err instanceof Error ? err.message : "잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!invite) return;
    try {
      await navigator.clipboard.writeText(invite.link);
      setCopied(true);
    } catch {
      setError("복사하지 못했어요. 링크를 길게 눌러 복사해 주세요.");
    }
  };

  const share = async () => {
    if (!invite) return;
    try {
      await navigator.share({ title: "우체국 FC 문제은행", text: SHARE_TEXT, url: invite.link });
    } catch {
      /* 사용자가 공유를 닫은 경우 */
    }
  };


  return (
    <div className="mt-6 flex flex-col gap-3">
      <form onSubmit={issue} className="flex flex-col gap-3">
        <label htmlFor="admin-password" className="sr-only">
          관리자 비밀번호
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={128}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="관리자 비밀번호"
          className="w-full rounded-2xl border-[1.5px] border-line bg-canvas px-4 py-3.5 text-center text-ink placeholder:text-sm placeholder:text-ink-mute focus:border-post focus:bg-surface focus:outline-none"
        />
        <button type="submit" disabled={!password || busy} className="btn-primary py-3.5 text-sm">
          {busy ? "만드는 중…" : invite ? "새 링크 하나 더 만들기" : "초대 링크 만들기"}
        </button>
      </form>

      {error && (
        <p role="alert" className="rounded-2xl bg-signal-soft px-3 py-2 text-center text-xs text-signal">
          {error}
        </p>
      )}

      {invite && (
        <section aria-live="polite" className="rounded-2xl border-[1.5px] border-post/30 bg-post-soft p-4">
          <p className="font-cute text-[15px] text-ink">💌 초대 링크가 준비됐어요</p>
          <p className="mt-0.5 text-xs text-ink-soft">{formatKoreanDateTime(invite.expiresAt)}까지 열 수 있어요.</p>

          <input
            readOnly
            value={invite.link}
            onFocus={(e) => e.currentTarget.select()}
            aria-label="초대 링크"
            className="mt-3 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-[12px] text-ink"
          />
          <p className="mt-2 text-[11px] text-ink-mute">
            초대 코드 <b className="font-mono tracking-wider text-ink">{invite.code}</b>
            <br />
            (홈 화면 앱에서는 링크 대신 이 코드를 입력해도 돼요)
          </p>

          <div className="mt-3 flex gap-2">
            <button type="button" onClick={copy} className="btn-ghost flex-1 py-3 text-sm">
              {copied ? "복사했어요 ✓" : "링크 복사"}
            </button>
            {canShare && (
              <button type="button" onClick={share} className="btn-primary flex-1 py-3 text-sm">
                공유하기
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
