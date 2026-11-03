# 우체국 FC 문제은행 (모바일 학습 앱)

『우체국보험 개론 – 성공으로 가는 첫 걸음』(2026.1) Chapter 2 평가시험 문제은행 **240문항**을 휴대폰에서 풀고, 교재 문장 그대로 답하는 **우편이 도우미**에게 질문할 수 있는 앱입니다. 홈 화면에 설치할 수 있고(PWA), 인터넷 없이도 동작합니다.

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

## 우편이 도우미 (규칙 기반, API 없음)

도우미는 휴대폰 안에서 동작합니다. 질문 의도를 파악한 뒤 **교재 데이터 문장만으로** 답을 조립하며, 새로운 사실을 만들어 내지 않습니다.

| 질문 예 | 답변 근거 |
|---|---|
| 왜 이게 정답이야? | 정답 선지 + 교재 해설 |
| ②번은 왜 틀려? | 해설 중 ② 부분, 정답 안내 |
| 예정위험률이 뭐야? | 빈칸형 문항에 정답을 넣어 만든 교재 문장(용어 사전 122개) |
| 힌트 줘 (풀기 전) | 오답 선지 하나 제거 + 관련 개념 |
| 날씨, 주식 등 | 범위 밖 안내 문장 |

- 답을 고르기 전에는 정답을 알려주지 않고 힌트만 줍니다.
- 관련 코드는 `src/lib/chat/`에 있습니다. `rule-engine.ts`는 의도별 답변을, `glossary.ts`는 용어 사전을, `korean.ts`는 조사 처리를 맡습니다.

## 구조

```
data/raw/                       교재 판독 원본(문항·정답 분리 JSONL)
scripts/build_question_bank.py  병합 + 무결성 검증 → src/data/question-bank.json
scripts/build_app_icons.py      앱 아이콘(우편이) 생성
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

## 데이터 수정

`data/raw/*.jsonl`을 고친 뒤 `npm run data:build`를 실행하세요. 문항 번호 연속성, 선지 4개, 정답 범위를 검증하며, 하나라도 어긋나면 빌드가 중단됩니다.

## 유의

원문 저작권은 우정사업본부에 있습니다. 저장소는 Private으로 유지하고 개인 학습용으로만 사용하세요.
