import { Mascot } from "@/components/brand/Mascot";

/** 초기화 직후 잠깐 보이는 안내. 화면 전체를 덮어 이동 전 조작을 막습니다. */
export function ResetNotice() {
  return (
    <div role="status" aria-live="assertive" className="fixed inset-0 z-50 grid place-items-center bg-canvas/85 px-6 backdrop-blur-sm">
      <div className="cheer-toast card flex flex-col items-center gap-2 px-8 py-6 text-center">
        <Mascot size={56} className="animate-wiggle" />
        <p className="font-cute text-[18px] text-post">초기화 되었어요</p>
        <p className="text-sm text-ink-soft">처음으로 돌아가요</p>
      </div>
    </div>
  );
}
