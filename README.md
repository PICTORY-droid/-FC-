# 우체국 FC 문제은행 (모바일 학습 앱)

『우체국보험 개론 – 성공으로 가는 첫 걸음』(2026.1) Chapter 2 평가시험 문제은행 **240문항**을 휴대폰에서 풀고, 교재 문장 그대로 답하는 **누리 도우미**에게 질문할 수 있는 앱입니다. 홈 화면에 설치할 수 있고(PWA), 인터넷 없이도 동작합니다.

- 제작: 김서인 (PICTORY-droid)
- 링크: https://fc-bice.vercel.app
- 스택: Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · PWA(Service Worker)
- 외부 AI API 없음 · API 키 불필요

| 파트 | 주제 | 문항 |
|---|---|---|
| PART 1 | 생명보험의 이해 | 108 |
| PART 2 | 우체국보험 약관해설 | 102 |
| PART 3 | 보험과 세제 | 30 |

## 실행

```bash
npm install
npm run dev   # http://localhost:3000
```

`main` 브랜치에 push하면 Vercel이 자동으로 배포합니다.

## 누리 도우미 (규칙 기반, API 없음)

도우미는 휴대폰 안에서 동작합니다. 질문 의도를 파악한 뒤 **교재 데이터 문장만으로** 답을 조립하며, 새로운 사실을 만들어 내지 않습니다.

| 질문 예 | 답변 근거 |
|---|---|
| 왜 이게 정답이야? | 정답 선지 + 교재 해설 |
| ②번은 왜 틀려? | 해설 중 ② 부분, 정답 안내 |
| 사회보장제도가 뭐야? | 교재의 정의 문장("○○란 …", "…을 ○○이라 한다") — 정의 160개 |
| 연금세법 문제 중 "언더라이팅이 뭐야?" | 교재 본문·용어해설에서 찾아 쪽수와 함께 답하고, 다른 단원이면 "지금 문제와 어떤 연관이 궁금하세요?"라고 되물음 |
| 이 문제랑 무슨 상관이야? | 두 용어가 함께 나오는 교재 문단(없으면 같은 단원, 그래도 없으면 "직접 연결한 부분은 없어요" + 각각의 설명) |
| 언더라이팅 알려줘 | 정의가 없으면 그 용어가 나오는 교재 문장 검색(사실 문장 591개, 오타 1글자 허용) |
| 힌트 줘 (풀기 전) | 오답 선지 하나 제거 + 관련 개념 |
| 날씨, 주식 등 | 범위 밖 안내 문장 |

- 답을 고르기 전에는 정답을 알려주지 않고 힌트만 줍니다.
- 사실 문장은 ① 빈칸 문항에 정답을 넣은 문장 ② 교재 해설 ③ '틀린 것은?' 문항의 나머지 선지 ④ '맞는 것은?' 문항의 정답 선지에서만 가져옵니다. 거짓 문장은 쓰지 않습니다.
- 아직 채점하지 않은 문항의 문장은 정답을 가린 형태로만 보여줍니다.
- 관련 코드는 `src/lib/chat/`에 있습니다. `rule-engine.ts`는 의도별 답변을, `glossary.ts`는 지식(정의·사실 문장·검색)을, `korean.ts`는 조사 처리를 맡습니다.
- 사용한 오픈소스(MIT): [es-hangul](https://github.com/toss/es-hangul)(조사 처리), [MiniSearch](https://github.com/lucaong/minisearch)(교재 문장 검색)

## 구조

```
data/raw/                       교재 판독 원본(문항·정답 분리 JSONL)
scripts/build_question_bank.py  병합 + 무결성 검증 → src/data/question-bank.json
scripts/build_app_icons.py      앱 아이콘(누리) 생성
scripts/build_og_image.mjs      링크 공유 미리보기 이미지(public/og-image.png) 생성
data/raw/textbook/*.md          교재 본문 7~110쪽 판독 원본(@part/@page/@term 표시)
scripts/build_textbook.py       교재 → src/data/textbook.json (문단 518개, 용어해설 68개)
src/
  app/                 페이지 · manifest
  components/{brand,home,quiz,chat,pwa}   UI
  hooks/               useQuizSession · useFactChat · useInstallPrompt · useKeyboardSafeViewport
  lib/question-bank/   데이터 접근(server-only)
  lib/chat/            규칙 기반 도우미 엔진
  lib/storage/         진행 기록 저장
public/sw.js           오프라인 캐시
```

## 디자인

`src/app/globals.css`의 토큰(주홍 `post`, 민트 `correct`, 햇살 `sunny`, 크림 `canvas`)과 공통 클래스(`card`, `btn-primary`, `btn-ghost`, `chip`, `stamp`, `airmail`)를 모든 화면이 함께 씁니다. 색을 바꾸려면 토큰만 수정하면 됩니다.

## 입장 (초대 링크 + 비밀번호, 기기별 30일)

환경변수(코드에 쓰지 않음):
- `APP_PASSWORD` — FC가 입력하는 입장 비밀번호
- `ADMIN_PASSWORD` — `/admin` 초대 링크 발급용 (8자 이상)

흐름:
1. 관리자가 `/admin`에서 초대 링크(`/join?c=…`)를 발급 — 링크는 **7일** 안에 열어야 함
2. FC가 링크를 열고 비밀번호 입력 → 그 기기에서 **30일** 이용 (홈 화면 앱에서는 초대 코드를 직접 입력해도 됨)
3. 30일이 지나면 서버(미들웨어)와 기기 안 스크립트(오프라인 포함)가 모두 잠그고, 이 앱의 저장 기록·캐시·서비스워커를 지운 뒤 `/expired` 안내
4. 새 링크로 다시 입장하면 30일 재시작

서명은 HMAC(두 비밀번호에서 파생)이라 DB가 필요 없고, 둘 중 하나를 바꾸면 모든 링크·기기 입장이 무효가 됩니다. 5회 틀리면 10분 잠금.

## 데이터 수정

`data/raw/*.jsonl`을 고친 뒤 `npm run data:build`를 실행하세요. 문항 번호 연속성, 선지 4개, 정답 범위를 검증하며, 하나라도 어긋나면 빌드가 중단됩니다.

## 유의

원문 저작권은 우정사업본부에 있습니다. 저장소는 Private으로 유지하고 개인 학습용으로만 사용하세요.
