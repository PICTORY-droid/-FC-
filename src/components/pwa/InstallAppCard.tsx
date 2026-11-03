"use client";

import { useState } from "react";

import { Mascot } from "@/components/brand/Mascot";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

export function InstallAppCard() {
  const { platform, install } = useInstallPrompt();
  const [showGuide, setShowGuide] = useState(false);

  if (platform === "installed") return null;

  const onClick = () => {
    if (platform === "native") void install();
    else setShowGuide((v) => !v);
  };

  return (
    <section className="mb-5 rounded-[var(--radius-card)] border-[1.5px] border-sunny bg-sunny-soft p-4">
      <div className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-post-soft" aria-hidden>
          <Mascot size={40} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-cute text-[15px] text-ink">앱으로 설치하기</p>
          <p className="text-xs text-ink-soft">홈 화면에서 바로 열고, 인터넷 없이도 풀 수 있어요.</p>
        </div>
        <button type="button" onClick={onClick} className="btn-primary shrink-0 px-4 py-2 text-xs">
          설치
        </button>
      </div>

      {showGuide && (
        <ol className="mt-3 list-decimal space-y-1 rounded-2xl bg-surface px-4 py-3 pl-8 text-xs leading-relaxed text-ink-soft">
          {platform === "ios" ? (
            <>
              <li>Safari 아래쪽의 <b className="text-ink">공유 버튼(□↑)</b>을 누르세요.</li>
              <li>목록에서 <b className="text-ink">홈 화면에 추가</b>를 누르세요.</li>
              <li>오른쪽 위 <b className="text-ink">추가</b>를 누르면 설치돼요.</li>
            </>
          ) : (
            <>
              <li>Chrome 오른쪽 위 <b className="text-ink">⋮ 메뉴</b>를 누르세요.</li>
              <li><b className="text-ink">앱 설치</b> 또는 <b className="text-ink">홈 화면에 추가</b>를 누르세요.</li>
              <li><b className="text-ink">설치</b>를 누르면 홈 화면에 아이콘이 생겨요.</li>
            </>
          )}
        </ol>
      )}
    </section>
  );
}
