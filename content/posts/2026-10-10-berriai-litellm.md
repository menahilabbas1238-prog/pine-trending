---
title: "BerriAI/litellm — 최신 이슈 1개 리뷰"
date: "2026-10-10"
repo: "BerriAI/litellm"
repoUrl: "https://github.com/BerriAI/litellm"
description: "The fastest, litest AI Gateway. Rust core with Python SDK. Call 100+ LLM APIs in OpenAI (or native) format with cost tracking, guardrails, load balancing, and logging [Bedrock, Azure, OpenAI, Anthropic, OpenAI, VertexAI, vLLM, Nvidia NIM]"
tags: ["trending", "daily"]
---

## TL;DR

- 오늘 트렌딩: **BerriAI/litellm** (Python · ⭐ 60,788)
- 고른 이슈: **[Bug]: OpenTelemetry callback creates no span for a streaming call the app stops reading early** (open · 2026-10-10)
- 링크: https://github.com/BerriAI/litellm/issues/45736

## 이슈 요약 (내가 이해한 문제)

- 한 줄 요약: ### Description With LiteLLM's OpenTelemetry callback enabled (`litellm.callbacks = [OpenTelemetry(...)]`), a streaming `completion` / `acompletion` produces spans only if the application reads the stream to the end. If…

## 왜 이게 중요함

- 사용자 경험/신뢰에 바로 영향 줄 수 있는 유형인지 체크
- 유지보수 관점에서: 비슷한 이슈가 반복되면 제품/라이브러리 채택 비용이 급상승

## 빠른 분석

- 재현 가능성: 이슈 본문이 구체적이면 **해결 속도**가 빨라짐
- 영향 범위: 코어 기능/빌드/배포를 깨면 우선순위가 급상승
- 커뮤니케이션: 라벨/템플릿/로그 요구가 잘 되어 있으면 건강한 레포

## 내가 제안하는 다음 액션

1) 이슈 템플릿대로 재현 절차 + 로그/버전 정보 보강
2) 최소 재현 리포(MRE) 있으면 바로 붙이기
3) 원인 후보를 2~3개로 좁혀서(최근 커밋/릴리즈, 환경 차이, breaking change) 확인

## 개인 의견

이 프로젝트는 "The fastest, litest AI Gateway. Rust core with Python SDK. Call 100+ LLM APIs in OpenAI (or native) format with cost tracking, guardrails, load balancing, and logging [Bedrock, Azure, OpenAI, Anthropic, OpenAI, VertexAI, vLLM, Nvidia NIM]" 쪽 문제를 건드려서 트렌딩 탔을 확률이 높고, 이슈 관리가 탄탄하면 ‘팀에 도입’까지 이어질 가능성이 큼. 현재 이 이슈의 댓글 수는 2개라서, 관심도/논의 강도를 가늠할 수 있음. 라벨은 `bug`, `llm translation`가 붙어있어서 분류는 어느 정도 되어 보임. 

---

참고: https://docs.litellm.ai/docs/

## 추가 관찰(체크리스트)

- 보안: 토큰/키가 로그에 찍히지 않는지, 기본 CORS가 과하게 열려있지 않은지
- DX: 이슈 템플릿에 버전/OS/재현 단계가 잘 유도되는지
- 품질: 관련 테스트가 있는지(없으면 최소 재현 테스트부터 추가)
- 운영: 라벨링/triage 속도, 최근 릴리즈 노트 품질
