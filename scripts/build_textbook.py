"""Build the textbook knowledge file from the transcribed markdown.

Usage: python scripts/build_textbook.py
Input : data/raw/textbook/*.md   (markers: @part N 제목, @page N, @term 용어, # / ## / ### / #### headings)
Output: src/data/textbook.json   { source, passages: [...], terms: [...] }

Each passage keeps its page number and heading trail so the helper can cite
"교재 34쪽 · 제5절 보험계약의 선택".
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw" / "textbook"
OUT = ROOT / "src" / "data" / "textbook.json"

HEADING = re.compile(r"^(#{1,4})\s+(.*)$")


def clean(text: str) -> str:
    text = re.sub(r"^\s*[-*]\s+", "", text)
    text = re.sub(r"^\[(약관|박스|표|그림|공식|분류표|확인문제|변동금리상품[^\]]*)\]\s*", "", text)
    return re.sub(r"\s+", " ", text).strip()


def parse(path: Path):
    passages, terms = [], []
    part, part_title, page = None, "", None
    trail = ["", "", "", ""]
    buf: list[str] = []
    term_name, term_page, term_buf = None, None, []

    def flush():
        nonlocal buf
        text = clean(" ".join(buf))
        if len(text) >= 12:
            passages.append({
                "part": part, "partTitle": part_title, "page": page,
                "section": " · ".join(t for t in trail if t),
                "text": text,
            })
        buf = []

    def flush_term():
        nonlocal term_name, term_buf
        if term_name:
            text = clean(" ".join(term_buf))
            terms.append({"term": term_name, "page": term_page, "text": text})
            passages.append({"part": part, "partTitle": part_title, "page": term_page,
                             "section": f"생명보험 용어해설 · {term_name}", "text": text})
        term_name, term_buf = None, []

    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("<!--"):
            if not line:
                (term_buf if term_name else buf).append("") if False else None
                if not term_name:
                    flush()
            continue
        if line.startswith("@part "):
            _, num, *title = line.split()
            part, part_title = int(num), " ".join(title)
            continue
        if line.startswith("@page "):
            page = int(line.split()[1])
            if term_name and term_page is None:
                term_page = page
            continue
        if line.startswith("@term "):
            flush(); flush_term()
            term_name, term_page = line[6:].strip(), page
            continue
        h = HEADING.match(line)
        if h:
            flush(); flush_term()
            level = len(h.group(1)) - 1
            trail[level] = h.group(2).strip()
            for i in range(level + 1, 4):
                trail[i] = ""
            continue
        if term_name:
            term_buf.append(line)
            continue
        # 목록·표 항목은 한 줄이 하나의 문단
        if re.match(r"^([-*]|①|②|③|④|⑤|⑥|⑦|\d+\.|\[)", line):
            flush()
            buf.append(line)
            flush()
        else:
            buf.append(line)
    flush(); flush_term()
    return passages, terms


def main():
    files = sorted(RAW.glob("*.md"))
    if not files:
        sys.exit("[ERROR] data/raw/textbook/*.md 가 없습니다")
    passages, terms = [], []
    for f in files:
        p, t = parse(f)
        passages += p
        terms += t
    for i, p in enumerate(passages):
        if p["page"] is None or p["part"] is None:
            sys.exit(f"[ERROR] 쪽/파트 정보 없는 문단: {p['text'][:40]}")
        p["id"] = f"tb-{i}"
    pages = sorted({p["page"] for p in passages})
    OUT.write_text(json.dumps({
        "source": "우체국보험 개론 - 성공으로 가는 첫 걸음 (2026.1) Chapter 1 보험의 기초",
        "passages": passages, "terms": terms,
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"문단 {len(passages)}개 · 용어 {len(terms)}개 · 쪽 {pages[0]}~{pages[-1]} ({len(pages)}쪽) → {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
