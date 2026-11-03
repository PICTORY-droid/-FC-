/** 우체국 소인 모양 도장 — 오늘의 10문제를 끝낸 날짜 */
export function Postmark({ date, active = true, size = 64 }: { date: string; active?: boolean; size?: number }) {
  const [, m, d] = date.split("-");
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full border-[2.5px] border-double text-center leading-none ${
        active ? "-rotate-12 border-post bg-post-soft text-post" : "border-line bg-surface text-ink-mute"
      }`}
      style={{ width: size, height: size }}
      aria-label={active ? `${Number(m)}월 ${Number(d)}일 완료` : `${Number(m)}월 ${Number(d)}일`}
    >
      <span>
        {size >= 56 && <span className="block text-[9px] font-bold tracking-wider">FC POST</span>}
        <span className={`block font-cute tabular-nums ${size >= 56 ? "text-[15px]" : "text-[11px]"}`}>
          {Number(m)}.{Number(d)}
        </span>
      </span>
    </span>
  );
}
