import type { Question } from "@/types/question";

const MARKS = ["①", "②", "③", "④"] as const;

interface Item {
  question: Question;
  note?: string;
}

/** 문항 미리보기 목록 (질문 + 정답 + 교재 해설) */
export function QuestionList({ items, action }: { items: Item[]; action?: (q: Question) => React.ReactNode }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map(({ question, note }) => (
        <li key={question.id} className="card p-4">
          <div className="flex items-center gap-1.5">
            <span className="chip bg-post-soft text-post">PART {question.id.slice(1, 2)}</span>
            <span className="chip bg-sunny-soft text-ink-soft">문항 {question.no}</span>
            {note && <span className="chip bg-signal-soft text-signal">{note}</span>}
            {action && <span className="ml-auto">{action(question)}</span>}
          </div>
          <p className="mt-2 text-[13.5px] font-semibold leading-[1.7] text-ink">{question.question}</p>
          <details className="group mt-2">
            <summary className="cursor-pointer list-none text-xs font-bold text-post">
              <span className="group-open:hidden">정답·풀이 보기 ▾</span>
              <span className="hidden group-open:inline">접기 ▴</span>
            </summary>
            <div className="mt-2 flex flex-col gap-1.5 text-[13px] leading-relaxed">
              <p className="rounded-xl bg-correct-soft px-3 py-2 text-ink">
                <b className="text-correct">정답</b> {MARKS[question.answer - 1]} {question.options[question.answer - 1]}
              </p>
              <p className="rounded-xl bg-post-soft/60 px-3 py-2 text-ink-soft">
                <b className="text-post">풀이</b> {question.explanation ?? "교재에 별도 해설이 없는 문항이에요."}
              </p>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
