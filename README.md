# 갑옷 씨의 작은 선물 가게

`chiikawa-gift`는 치이카와, 하치와레, 우사기 중 한 명을 골라 친구에게 깜짝 선물 링크를 보내는 모바일 웹앱입니다.

## 설치 및 실행

Node.js 22.18 이상을 사용합니다. 프로젝트 루트에서 실행하세요.

```sh
npm ci
npm run dev
```

터미널에 표시된 로컬 주소를 엽니다. PowerShell에서 스크립트 실행 정책으로 `npm`이 차단되면 `npm.cmd`를 사용하세요.

```sh
npm test
npm run build
npm run preview
```

`build`는 TypeScript 검사 후 정적 파일을 `dist/`에 생성합니다. `preview`로 빌드된 결과와 `/gift/:id` 직접 접속을 확인할 수 있습니다.

## 프로젝트 구조

| 경로 | 역할 |
| --- | --- |
| `src/App.tsx` | 발신 화면, 도착 및 개봉 화면, 개봉 결과 |
| `src/components/Artwork.tsx` | 로컬 이미지와 CSS 플레이스홀더 |
| `src/components/CharacterScene.tsx` | 캐릭터 대기 모션, 터치 반응, 말풍선 |
| `src/components/Celebration.tsx` | 일반 선물의 짧은 축하 문구와 픽셀 파티클 |
| `src/data/characters.ts` | 캐릭터와 공통 이미지 경로 |
| `src/data/gifts/` | 캐릭터별 선물 목록 |
| `src/lib/` | 추첨과 공유 링크 처리 |
| `public/images/` | 캐릭터, 선물, 빈 상자 이미지 폴더 |

## 이미지 추가

- 캐릭터 이미지는 `public/images/characters/<캐릭터 ID>/`에 넣고 `src/data/characters.ts`의 `images.default`에 실제 파일 경로를 등록합니다. 세 캐릭터의 기본 파일명은 `idle.png`, 선물을 든 모습은 `holding-gift.png`이며 `images.holdingGift`에 등록합니다. 우사기가 선물을 가져간 장면에는 `public/images/characters/usagi/stolen-gift.png`를 사용합니다.
- 선물 이미지는 `public/images/gifts/<캐릭터 ID>/<선물 ID>.png`에 넣습니다. 빈 상자 이미지는 `public/images/common/empty-box.png`에 넣습니다.
- 파일명은 소문자 영문과 하이픈을 사용하고, 이미지 확장자는 모두 `.png`로 통일합니다. 데이터 경로는 `public`을 빼고 `/images/…`로 시작합니다.
- 포즈 이미지가 없으면 기본 캐릭터 이미지를 사용하고, 기본 이미지나 선물 이미지도 없으면 CSS 플레이스홀더가 표시됩니다.
- 표정 이미지는 선택 사항입니다. 메인 카드에서는 `images.default`를 우선 사용하며, `happy`·`surprised`는 선택·깜짝 반응에 연결됩니다. 도착·일반 결과 화면의 포즈는 `holdingGift`입니다. 상태별 이미지가 없으면 현재 화면의 포즈, `default`, `idle` 순서로 확인하고, 모두 실패했을 때 CSS 플레이스홀더를 표시합니다. 말풍선 문구는 같은 파일의 `speech`에서 수정합니다.

[IMAGE_GUIDE.md](IMAGE_GUIDE.md)에 모든 파일명과 상대 경로가 있습니다.

## 선물 목록과 확률 수정

- `src/data/gifts/`에서 캐릭터 ID와 이름이 같은 파일을 엽니다. 각 항목의 `name`, `description`, `image`를 따로 수정할 수 있습니다. 등장 회차를 표시하려면 `episode: '42화'`처럼 입력하세요.
- `src/lib/gift.ts`의 `EMPTY_BOX_PROBABILITY`가 빈 상자 확률입니다. 기본값 `0.15`는 빈 상자 15%, 일반 선물 85%입니다. 일반 선물은 발신 캐릭터의 목록에서 균등하게 뽑습니다. 확률을 바꾸면 해당 값을 검증하는 `tests/gift.test.mjs`의 기대값도 갱신하세요.
- 링크에는 고유 ID와 `from`만 담습니다. 받는 사람은 선물 상자를 톡톡 두드려 열 수 있습니다. 같은 링크를 새로고침하거나 다시 방문하면 미개봉 상자로 돌아가며, 상자를 열 때마다 새로 뽑습니다.

## Cloudflare Pages 배포

1. 프로젝트를 Git 저장소에 올리고, Cloudflare의 **Workers & Pages**에서 **Pages**를 선택해 저장소를 연결합니다.
2. 빌드 명령에 `npm run build`, 빌드 출력 디렉터리에 `dist`를 입력합니다. 빌드 환경의 `NODE_VERSION`은 `24`로 설정합니다.
3. 배포가 끝나면 발급된 `*.pages.dev` 주소에서 링크를 만들고, 생성한 `/gift/<id>?from=<캐릭터 ID>` 주소를 직접 열어 확인합니다.

Cloudflare Pages는 최상위 `404.html`이 없는 SPA의 경로를 앱 진입점으로 연결합니다. Vercel은 프로젝트의 `vercel.json`에 있는 리라이트로 처리합니다. [Cloudflare React 배포 가이드](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/) · [Cloudflare SPA 경로 처리](https://developers.cloudflare.com/pages/configuration/serving-pages/#single-page-application-spa-rendering) · [Vercel Vite 가이드](https://vercel.com/docs/frameworks/frontend/vite)

