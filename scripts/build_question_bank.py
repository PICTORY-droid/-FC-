"""Merge raw transcribed question/answer files into a validated question bank.

Usage: python scripts/build_question_bank.py
Output: src/data/question-bank.json
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
OUT = ROOT / "src" / "data" / "question-bank.json"

PARTS = [
    {"part": 1, "title": "생명보험의 이해", "pages": "113-146", "q": "part1_[a-d].jsonl", "a": "part1_ans_*.jsonl", "expected": 108},
    {"part": 2, "title": "우체국보험 약관해설", "pages": "147-181", "q": "part2_[a-e].jsonl", "a": "part2_ans.jsonl", "expected": 102},
]


def read_jsonl(pattern: str) -> list[dict]:
    rows: list[dict] = []
    for f in sorted(RAW.glob(pattern)):
        for line_no, line in enumerate(f.read_text(encoding="utf-8").splitlines(), 1):
            if line.strip():
                try:
                    rows.append(json.loads(line))
                except json.JSONDecodeError as exc:
                    sys.exit(f"[ERROR] {f.name}:{line_no} invalid JSON: {exc}")
    return rows


def validate(part: int, questions: list[dict], expected: int) -> None:
    nos = [q["no"] for q in questions]
    if nos != list(range(1, expected + 1)):
        missing = sorted(set(range(1, expected + 1)) - set(nos))
        dup = sorted({n for n in nos if nos.count(n) > 1})
        sys.exit(f"[ERROR] PART{part} numbering broken. missing={missing} dup={dup}")
    for q in questions:
        tag = f"PART{part} Q{q['no']}"
        if len(q["options"]) != 4 or any(not o.strip() for o in q["options"]):
            sys.exit(f"[ERROR] {tag} must have 4 non-empty options")
        if q["answer"] not in (1, 2, 3, 4):
            sys.exit(f"[ERROR] {tag} answer out of range: {q['answer']}")
        if not q["question"].strip():
            sys.exit(f"[ERROR] {tag} empty question")


def build() -> dict:
    parts_out = []
    for spec in PARTS:
        qs = {r["no"]: r for r in read_jsonl(spec["q"])}
        ans = {r["no"]: r for r in read_jsonl(spec["a"])}
        if set(qs) != set(ans):
            sys.exit(f"[ERROR] PART{spec['part']} question/answer mismatch: {sorted(set(qs) ^ set(ans))}")
        questions = [
            {"id": f"p{spec['part']}-{n}", "no": n, "question": qs[n]["q"], "options": qs[n]["o"],
             "answer": ans[n]["a"], "explanation": ans[n]["e"]}
            for n in sorted(qs)
        ]
        validate(spec["part"], questions, spec["expected"])
        parts_out.append({"part": spec["part"], "title": spec["title"], "pages": spec["pages"], "questions": questions})

    p3 = json.loads((RAW / "part3.json").read_text(encoding="utf-8"))
    q3 = [{"id": f"p3-{q['no']}", "no": q["no"], "question": q["q"], "options": q["o"],
           "answer": q["a"], "explanation": q["e"]} for q in p3["questions"]]
    validate(3, q3, 30)
    parts_out.append({"part": 3, "title": p3["title"], "pages": "182-192", "questions": q3})

    return {
        "source": "우체국보험 개론 - 성공으로 가는 첫 걸음 (2026.1 발행, 우정사업본부 보험사업단) Chapter 2 평가시험 문제은행",
        "version": "2026.11.03",
        "parts": parts_out,
    }


if __name__ == "__main__":
    bank = build()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(bank, ensure_ascii=False, indent=2), encoding="utf-8")
    for p in bank["parts"]:
        dist = {k: sum(1 for q in p["questions"] if q["answer"] == k) for k in (1, 2, 3, 4)}
        expl = sum(1 for q in p["questions"] if q["explanation"])
        print(f"PART{p['part']} {p['title']}: {len(p['questions'])}문항, 정답분포 {dist}, 해설 {expl}개")
    print(f"OK -> {OUT.relative_to(ROOT)}")
