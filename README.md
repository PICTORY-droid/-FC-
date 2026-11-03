# 우체국보험 평가시험 문제은행 (모바일 학습 앱)

『우체국보험 개론 – 성공으로 가는 첫 걸음』(2026.1) Chapter 2 평가시험 문제은행 **240문항**을 모바일에서 풀고, 지금 보고 있는 문항 범위 안에서만 답하는 AI 도우미에게 질문할 수 있는 Next.js 앱입니다.

- 제작: 김서인 (PICTORY-droid)
- 스택: Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Zod · Google Gemini API(무료 등급)

| 파트 | 주제 | 문항 |
|---|---|---|
| PART 1 | 생명보험의 이해 | 108 |
| PART 2 | 우체국보험 약관해설 | 102 |
| PART 3 | 보험과 세제 | 30 |

## 실행

```bash
npm install
cp .env.example .env.local   # GEMINI_API_KEY 입력
npm run dev                  # http://localhost:3000
```

API 키는 Google AI Studio에서 무료로 발급받습니다. 키는 서버에서만 읽으며 브라우저로는 절대 전달되지 않습니다.

## 구조

```
data/raw/                  교재 판독 원본(문항·정답 분리 JSONL)
scripts/build_question_bank.py  병합 + 무결성 검증 → src/data/question-bank.json
src/
  app/                     페이지(서버 컴포넌트) · /api/chat 라우트
  components/{home,quiz,chat}  UI 전용
  hooks/                   useQuizSession · useFactChat · useKeyboardSafeViewport
  lib/question-bank/       데이터 접근(server-only)
  lib/chat/                가드레일 프롬프트 · 입력 정제/검증 · 레이트리밋 · 서비스
  lib/ai/                  LlmAdapter 인터페이스 + GeminiAdapter (모델 교체 지점)
  types/                   도메인 타입 · 요청/응답 DTO
```

## AI 가드레일 설계

1. **클라이언트는 문항 ID만 전송합니다.** 문항 본문, 정답, 해설은 서버가 원본 데이터에서 직접 찾아 context로 넣습니다. 그래서 클라이언트가 내용을 조작해 끼워 넣을 수 없습니다.
2. 범위를 벗어난 질문이나 프롬프트 인젝션에는 표준 예외 문장만 응답합니다.
3. 답을 고르기 전에는 **정답 대신 힌트만** 제공합니다.
4. 입력: 1~300자, 제어문자·제로폭 문자·꺾쇠괄호 제거, 같은 출처 요청만 허용, 본문 16KB 제한, IP당 분당 8회 제한
5. 출력은 평문으로만 렌더링합니다(`dangerouslySetInnerHTML` 미사용). 에러 메시지에는 내부 정보를 담지 않습니다.

## 데이터 수정

`data/raw/*.jsonl`을 고친 뒤 `npm run data:build`를 실행하세요. 문항 번호 연속성, 선지 4개, 정답 범위를 검증하며, 하나라도 어긋나면 빌드가 중단됩니다.

## 유의

원문 저작권은 우정사업본부에 있습니다. **저장소는 Private으로 유지하고 개인 학습용으로만 사용하세요.**
