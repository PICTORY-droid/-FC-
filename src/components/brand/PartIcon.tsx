const STROKE = "#e8541e";
const FILL = "#fff8f1";
const ACCENT = "#ffc94d";
const MINT = "#1f8a5b";

/** PART 아이콘 — 마스코트 '누리'와 같은 주홍 선·크림 채움 스타일. */
export function PartIcon({ part, size = 36 }: { part: number; size?: number }) {
  const common = { fill: "none", stroke: STROKE, strokeWidth: 2.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      {part === 1 && (
        // 생명보험의 이해: 새싹 화분
        <>
          <path d="M11 24h18l-2.5 10h-13z" {...common} fill={FILL} />
          <path d="M20 24v-8" {...common} />
          <path d="M20 17c0-5 3.5-8 9-8 0 5.5-3.5 8-9 8z" fill={MINT} stroke={MINT} strokeWidth={2} strokeLinejoin="round" />
          <path d="M20 19c0-4-3-6.5-7.5-6.5 0 4.5 3 6.5 7.5 6.5z" fill={ACCENT} stroke={STROKE} strokeWidth={2} strokeLinejoin="round" />
        </>
      )}
      {part === 2 && (
        // 약관해설: 도장 찍힌 약관 문서
        <>
          <path d="M10 6h14l6 6v22H10z" {...common} fill={FILL} />
          <path d="M24 6v6h6" {...common} />
          <path d="M14 17h10M14 22h12M14 27h6" {...common} strokeWidth={2.2} />
          <circle cx="27" cy="29" r="4.5" fill={ACCENT} stroke={STROKE} strokeWidth={2} />
        </>
      )}
      {part === 3 && (
        // 보험과 세제: 세금 영수증 + 동전
        <>
          <path d="M9 6h17v28l-3-2-2.7 2-2.8-2-2.8 2-2.7-2L9 34z" {...common} fill={FILL} />
          <path d="M13 13h9M13 18h9M13 23h5" {...common} strokeWidth={2.2} />
          <circle cx="29" cy="26" r="6" fill={ACCENT} stroke={STROKE} strokeWidth={2.2} />
          <path d="M27 24.5l2 3.5 2-3.5M27 26.5h4" fill="none" stroke={STROKE} strokeWidth={1.6} strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
