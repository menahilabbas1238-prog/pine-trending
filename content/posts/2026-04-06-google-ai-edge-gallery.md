---
title: "google-ai-edge/gallery — 최신 이슈 1개 리뷰"
date: "2026-04-06"
repo: "google-ai-edge/gallery"
repoUrl: "https://github.com/google-ai-edge/gallery"
description: "A gallery that showcases on-device ML/GenAI use cases and allows people to try and use models locally."
tags: ["trending", "daily"]
---

## TL;DR

- 오늘 트렌딩: **google-ai-edge/gallery** (Kotlin · ⭐ 17,121)
- 고른 이슈: **[iOS] Add Skill from URL always fails: "Expected at least two '---' sections"** (open · 2026-04-06)
- 링크: https://github.com/google-ai-edge/gallery/issues/583

## 이슈 요약 (내가 이해한 문제)

- 한 줄 요약: ## Bug Description On iOS (v1.0.2), adding a skill via URL always fails with the error: > Error parsing SKILL.md: Invalid format: Expected at least two '---' sections. This happens regardless of the SKILL.md format or U…

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

이 프로젝트는 "A gallery that showcases on-device ML/GenAI use cases and allows people to try and use models locally." 쪽 문제를 건드려서 트렌딩 탔을 확률이 높고, 이슈 관리가 탄탄하면 ‘팀에 도입’까지 이어질 가능성이 큼. 현재 이 이슈의 댓글 수는 0개라서, 관심도/논의 강도를 가늠할 수 있음. 라벨이 거의 없으면 triage를 먼저 하는 게 좋음. 

---

## 추가 관찰(체크리스트)

- 보안: 토큰/키가 로그에 찍히지 않는지, 기본 CORS가 과하게 열려있지 않은지
- DX: 이슈 템플릿에 버전/OS/재현 단계가 잘 유도되는지
- 품질: 관련 테스트가 있는지(없으면 최소 재현 테스트부터 추가)
- 운영: 라벨링/triage 속도, 최근 릴리즈 노트 품질

## 내가 유지보수자라면

- “재현 → 원인 후보 → 해결 → 회귀 방지(테스트)” 4단계로 이슈를 닫는 흐름을 템플릿화할 거야.
- 특히 트렌딩 타는 시기엔 신규 유입이 많아서, 답변이 늦으면 같은 질문이 중복으로 쌓여서 비용이 폭발함.
- 그래서 *짧게라도* 상태 업데이트(확인중/재현됨/다음 릴리즈 예정)를 남겨주는 게 제일 가성비가 좋음.
