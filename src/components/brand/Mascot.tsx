type Mood = "happy" | "wow" | "think" | "sad";

interface Props {
  size?: number;
  mood?: Mood;
  className?: string;
}

const INK = "#3b2a20";

/** 편지봉투 캐릭터 '우편이' — FC 문제은행 전용 마스코트 (원본 디자인). */
export function Mascot({ size = 48, mood = "happy", className }: Props) {
  const eyes =
    mood === "happy" ? (
      // 웃는 눈 ^ ^
      <g fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round">
        <path d="M19.5 38.5q3.5 -4.5 7 0" />
        <path d="M37.5 38.5q3.5 -4.5 7 0" />
      </g>
    ) : (
      <g fill={INK}>
        <circle cx="23" cy="37.5" r="2.7" />
        <circle cx="41" cy="37.5" r="2.7" />
      </g>
    );

  const mouth = {
    happy: <path d="M27.5 43q4.5 4.5 9 0" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />,
    wow: <ellipse cx="32" cy="44.5" rx="2.8" ry="3.3" fill={INK} />,
    think: <path d="M28.5 45h7" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />,
    sad: <path d="M27.5 46.5q4.5 -4 9 0" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />,
  }[mood];

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect x="6" y="14" width="52" height="40" rx="9" fill="#fff8f1" stroke="#e8541e" strokeWidth="3" />
      {/* 봉투 덮개: 얕고 연하게 채워 눈썹처럼 보이지 않게 */}
      <path d="M9.5 16.5 L32 28 L54.5 16.5 Z" fill="#ffe1d2" stroke="#e8541e" strokeWidth="2.6" strokeLinejoin="round" />
      {eyes}
      <circle cx="17" cy="43" r="3.2" fill="#ff9f8a" opacity="0.7" />
      <circle cx="47" cy="43" r="3.2" fill="#ff9f8a" opacity="0.7" />
      {mouth}
      <g transform="translate(44 4)">
        <rect width="16" height="16" rx="3" fill="#ffc94d" stroke="#e8541e" strokeWidth="2" strokeDasharray="2.4 1.6" />
        <path d="M8 12.2l-3.6-3.4a2.2 2.2 0 013.6-2.6 2.2 2.2 0 013.6 2.6z" fill="#e8541e" />
      </g>
    </svg>
  );
}
