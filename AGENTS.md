# Agent guide — saucejoo portfolio

## Source of truth

- **Next app:** `site/` (마이그레이션 진행 중·전환 후 단일 소스)
- **Legacy (read-only):** 루트 `index.html`, `dinos.html`, `aot.html` — 삭제·수정 금지

## Where to edit

| 변경 | 파일 |
|------|------|
| 메인 그리드 카드 | `site/content/manifest.ts` |
| AOT 상세 카피/이미지 | `site/content/projects/aot.yaml` + `site/components/works/aot/` |
| DINOS 상세 | `site/content/projects/dinos.yaml` + `site/components/works/dinos/` |
| 메인 레이아웃/필터/모달 | `site/components/portfolio/` |
| 스타일 (픽셀 유지) | `site/styles/*.css` — class 이름 변경 금지 |
| 챗 위젯 | `site/components/chat/ChatWidget.tsx` |

## Rules

1. 새 work 추가: `manifest.ts` + (상세 있으면) `app/works/[slug]/` + `public/assets/`
2. 섹션 타입은 기존 컴포넌트 재사용; 임의 HTML/CSS prefix 발명 금지
3. 배포는 `output: 'export'` 정적 빌드 (`site/out`)
4. 에셋 경로는 `/assets/...` (public 미러)

## Cloudflare Pages

Root: `site` · Output: `out` · Build: `npm ci && npm run build`
