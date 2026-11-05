# Vercel 배포 안내

이 프로젝트는 Vite + React + TypeScript로 빌드하는 정적 SPA입니다. 저장소는 `cogns/chiikawa`, 배포 브랜치는 `main`입니다.

**첫 배포 전에 GitHub 업로드를 완료하세요.**

2026년 11월 5일 점검 시 GitHub의 `main`에는 `README.md`만 있었고, 로컬의 소스·설정·이미지는 미추적 상태였습니다. 아래 파일을 커밋하고 push한 뒤 GitHub에서 `package.json`, `src/`, `public/images/`가 보이는지 확인하세요.

프로젝트 폴더에서 실행합니다.

```sh
git status --short
git add .gitignore package.json package-lock.json vite.config.ts tsconfig.json vercel.json index.html src public tests README.md IMAGE_GUIDE.md VERCEL_DEPLOY.md
git diff --cached --stat
git commit -m "Prepare Vite app for Vercel"
git push origin main
```

`node_modules/`, `dist/`, `.vercel/`, `.env`, `.env.*`, 로그는 `.gitignore`에서 제외합니다. 설명용 `.env.example`은 추적할 수 있습니다.

**Vercel 프로젝트를 연결합니다.**

1. Vercel에 가입하거나 로그인합니다. GitHub 연동과 저장소 접근 승인은 계정 소유자가 직접 진행합니다.
2. 대시보드에서 **Add New → Project**를 선택합니다.
3. GitHub 계정을 연결하고 `cogns/chiikawa` 저장소를 선택해 **Import**합니다. 목록에 없으면 GitHub의 Vercel 앱 설치 설정에서 해당 저장소 접근을 허용합니다.
4. 아래 설정을 확인하고 **Deploy**를 누릅니다.

| 항목 | 이 프로젝트의 값 |
| --- | --- |
| Framework Preset | Vite |
| Root Directory | 저장소 루트 `./` |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js Version | `24.x` |
| Production Branch | `main` |
| Environment Variables | 현재 앱에 필요한 항목 없음 |

Root Directory에는 `package.json`과 `vercel.json`이 있어야 합니다. 현재 저장소 구성에서는 하위 폴더를 지정할 필요가 없습니다.

`vercel.json`에 Framework, 설치 명령, 빌드 명령, 출력 폴더가 명시되어 있습니다. `package.json`의 `engines.node`도 `24.x`로 고정했습니다. [Vercel의 Vite 설정](https://vercel.com/docs/frameworks/frontend/vite), [Node.js 버전 설정](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)

**배포 URL과 공유 흐름을 확인합니다.**

배포 상태가 **Ready**가 되면 해당 배포의 URL을 열거나 **Visit**을 누릅니다. 프로젝트의 **Domains**에서 운영 주소를 확인할 수 있습니다.

1. 캐릭터 세 명이 정상적으로 표시되는지 확인합니다.
2. 캐릭터를 선택하고 선물 링크를 생성합니다. 주소가 현재 배포 도메인으로 시작하는지 확인합니다.
3. 링크를 복사해 새 탭에서 직접 엽니다. 캐릭터 선택 화면을 거치지 않고 해당 캐릭터의 선물 상자가 표시되어야 합니다.
4. 상자를 다섯 번 눌러 개봉합니다. 일반 선물 또는 우사기가 가져간 빈 상자가 표시됩니다.
5. 같은 링크를 새로고침해 미개봉 상태로 돌아오는지 확인합니다.
6. 카카오톡에 운영 URL을 붙여 넣어 Android·iPhone에서 직접 열어 봅니다. 카드 정렬, 터치, 링크 복사와 새로고침을 확인합니다.

공유 주소는 `window.location.origin`과 고유 ID, `from`으로 생성됩니다. 도메인이나 Vercel 프로젝트 이름을 변경하면 새 링크는 변경된 접속 주소를 사용합니다. 복사 권한이 없는 브라우저에서는 주소 입력칸이 선택되며 수동 복사 안내가 표시됩니다.

**다음 변경부터 자동으로 재배포합니다.**

프로젝트의 Git 연결이 `cogns/chiikawa`이고 Production Branch가 `main`인지 확인합니다. 이후 로컬 변경을 저장하고 커밋하여 `main`에 push하면 Vercel이 새 빌드를 실행합니다. 대시보드의 **Deployments**에서 새 커밋과 배포 상태를 확인하세요. [Vercel의 GitHub 자동 배포](https://vercel.com/docs/git/vercel-for-github)

**빌드가 실패하면 로그를 확인합니다.**

**Project → Deployments → 실패한 배포 → Build Logs**를 열어 첫 오류와 설치·빌드 단계의 메시지를 확인합니다.

| 증상 | 확인할 항목 |
| --- | --- |
| `package.json`을 찾지 못함 | GitHub에 소스가 올라갔는지와 Root Directory 확인 |
| Node.js 버전 오류 | `package.json`과 프로젝트 설정이 `24.x`인지 확인 |
| TypeScript 또는 Vite 오류 | 같은 커밋에서 `npm install`, `npm run build`를 실행하고 로그의 파일·행 확인 |
| `dist`를 찾지 못함 | Build Command가 `npm run build`, Output Directory가 `dist`인지 확인 |
| 수정 전 화면이 보임 | 편집기 저장, 커밋·push, 배포의 커밋 SHA와 접속한 도메인 확인 |

로컬에서 프로덕션 결과를 확인할 때는 아래 명령을 사용합니다.

```sh
npm install
npm test
npm run build
npm run preview
```

Windows PowerShell의 실행 정책으로 `npm`이 실행되지 않으면 `npm.cmd`를 사용하세요. `npm run preview`에서 출력하는 로컬 주소는 빌드 확인용입니다.

**선물 링크의 404를 확인합니다.**

이 앱은 URL의 `/gift/<고유 ID>?from=<캐릭터 ID>`를 클라이언트에서 읽습니다. `vercel.json`의 SPA 리라이트가 직접 접속과 새로고침 요청을 `/index.html`로 연결합니다. `/assets/`와 `/images/`는 정적 파일로 처리하도록 제외되어 있습니다.

- `vercel.json`이 커밋되고 Root Directory에 있는지 확인합니다.
- 최종 배포에 `dist/index.html`이 생성되었는지 Build Logs에서 확인합니다.
- 설정 변경 후 커밋·push하여 새 배포를 만듭니다.
- `cleanUrls`를 추가로 켜거나 리라이트를 중복 등록하면 경로가 바뀔 수 있으므로 현재 설정을 기준으로 확인합니다.

[Vite SPA 직접 접속 설정](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas), [리라이트 설정 문법](https://vercel.com/docs/project-configuration/vercel-json#rewrites)

**이미지가 보이지 않으면 경로를 확인합니다.**

- 파일은 `public/images/…`에 저장하고 데이터에는 `/images/…`를 등록합니다.
- GitHub에도 이미지 파일이 올라갔는지 확인합니다. 로컬에만 있는 파일은 배포에 포함되지 않습니다.
- 파일명과 폴더명의 대소문자, 확장자가 데이터와 정확히 일치해야 합니다.
- 현재 등록 경로는 모두 PNG입니다. 렌더러는 브라우저가 지원하는 PNG·WebP를 로드하며, 다른 형식을 사용하면 실제 파일과 데이터의 확장자를 함께 맞춥니다.
- 배포 도메인에서 이미지 URL을 직접 열고 개발자 도구의 Network에서 상태 코드와 Content-Type을 확인합니다.
- 이미지가 없으면 기존의 기본 이미지 또는 CSS 플레이스홀더가 표시됩니다. 현재 `public/images/common/empty-box.png`는 미등록 상태이며 빈 상자는 CSS로 표시됩니다.

전체 파일명은 `IMAGE_GUIDE.md`에서 확인할 수 있습니다.

**공유 대표 이미지를 교체합니다.**

`public/og-preview.png`를 새 PNG로 교체하고 커밋·push하세요. 권장 크기는 1200×630px입니다. 파일 확장자뿐 아니라 실제 저장 형식도 PNG여야 합니다.

빌드할 때 `vite.config.ts`의 `socialPreview`가 이미지 내용에 따라 `dist/assets/og-preview-<해시>.png`를 만들고, 초기 HTML의 OG/Twitter 이미지 URL과 실제 가로·세로 크기를 자동으로 입력합니다. 이미지가 바뀌면 URL도 바뀌므로 `index.html`의 버전이나 크기를 직접 수정할 필요가 없습니다. 원본 `/og-preview.png` 경로도 유지됩니다. 운영 도메인이 바뀌면 `vite.config.ts`의 `SITE_ORIGIN`을 변경하세요.

배포가 Ready가 된 후 페이지 소스의 `og:image` 주소를 직접 열어 새 이미지가 나오는지 확인합니다. `/gift/...` 공유 링크도 같은 메타 정보를 포함합니다.

카카오톡은 이미 공유한 페이지 주소의 미리보기 정보를 캐시할 수 있습니다. 이전 미리보기가 계속 보이면 [카카오 공유 디버거](https://developers.kakao.com/tool/debugger/sharing)에 **실제로 공유한 전체 페이지 URL**을 입력하고 캐시를 초기화한 뒤 새 메시지로 공유하세요. 앱에서 선물 링크를 새로 생성하면 새로운 고유 ID의 주소를 사용할 수 있습니다. 이 빌드 설정이 카카오에 저장된 기존 메시지나 페이지 캐시를 강제로 삭제하지는 않습니다. [카카오의 OG 캐시 안내](https://developers.kakao.com/docs/ko/message-template/faq#q-스크랩한-미리보기-이미지가-바뀌지-않습니다)

**검증 범위**

로컬에서 `npm install`, `npm test`, `npm run build`, `npm run preview`를 확인했습니다. Vercel 공식 라우팅 유틸리티로 SPA 규칙과 정적 경로 제외를 검증했습니다.

데스크톱 Chrome과 320·360·430px 모바일 에뮬레이션에서 이미지 표시, 캐릭터 선택, 링크 생성·복사와 권한 거부 시 수동 복사 안내, A·A·B·B·C 개봉, 중복 입력 방지, 두 가지 결과, 새로고침·뒤로 가기 초기화, 키보드와 모션 감소 설정을 확인했습니다. PNG 37개는 브라우저 디코딩, 정확한 대소문자, Git 포함 가능 여부, `dist/` 복사본 일치를 확인했습니다. 현재 프로젝트에 실제 WebP 파일은 없습니다.

실제 Android 기기, iPhone Safari, 카카오톡 인앱 브라우저와 실제 Vercel 배포 도메인에서는 위 체크리스트로 최종 확인이 필요합니다. 점검에 사용한 Vercel 브라우저 세션은 로그인 화면이었으므로 계정 연결과 배포를 진행하지 않았습니다.
