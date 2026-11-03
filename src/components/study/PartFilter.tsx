"use client";

import type { Part } from "@/types/question";

interface Props {
  parts: Part[];
  value: number | null;
  counts: Record<number, number>;
  total: number;
  onChange: (part: number | null) => void;
}

/** 전체 / PART별 필터 칩 */
export function PartFilter({ parts, value, counts, total, onChange }: Props) {
  const items: { key: number | null; label: string; count: number }[] = [
    { key: null, label: "전체", count: total },
    ...parts.map((p) => ({ key: p.part, label: `PART ${p.part}`, count: counts[p.part] ?? 0 })),
  ];
  return (
    <div role="tablist" aria-label="PART 선택" className="grid grid-cols-4 gap-1.5">
      {items.map((item) => {
        const active = value === item.key;
        return (
          <button
            key={String(item.key)}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.key)}
            className={`rounded-2xl border-[1.5px] px-1 py-2 text-[11px] font-bold transition-colors ${
              active ? "border-post bg-post-soft text-post ring-2 ring-post/25" : "border-line bg-surface text-ink-soft active:bg-post-soft"
            }`}
          >
            {item.label}
            <span className="block font-cute text-[15px] tabular-nums">{item.count}</span>
          </button>
        );
      })}
    </div>
  );
}

export function countByPart(ids: string[]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const id of ids) {
    const part = Number(/^p(\d+)-/.exec(id)?.[1] ?? 0);
    counts[part] = (counts[part] ?? 0) + 1;
  }
  return counts;
}

export function inPart(id: string, part: number | null): boolean {
  return part === null || id.startsWith(`p${part}-`);
}
