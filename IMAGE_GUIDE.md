# 이미지 추가 가이드

아래 상대 경로는 프로젝트 루트 기준입니다. 모든 이미지는 PNG 형식으로 저장합니다. 아래 파일명에 맞춰 추가하면 다음 빌드부터 사용됩니다. 파일명을 변경하면 `src/data/characters.ts` 또는 `src/data/gifts/`의 해당 `/images/…` 경로도 함께 바꿔 주세요.

## 캐릭터

| 이미지 | 캐릭터 ID | 파일명 | 프로젝트 기준 상대 경로 |
| --- | --- | --- | --- |
| 치이카와 기본 | `chiikawa` | `idle.png` | `public/images/characters/chiikawa/idle.png` |
| 치이카와 선물을 든 모습 | `chiikawa` | `holding-gift.png` | `public/images/characters/chiikawa/holding-gift.png` |
| 하치와레 기본 | `hachiware` | `idle.png` | `public/images/characters/hachiware/idle.png` |
| 하치와레 선물을 든 모습 | `hachiware` | `holding-gift.png` | `public/images/characters/hachiware/holding-gift.png` |
| 우사기 기본 | `usagi` | `idle.png` | `public/images/characters/usagi/idle.png` |
| 우사기 선물을 든 모습 | `usagi` | `holding-gift.png` | `public/images/characters/usagi/holding-gift.png` |
| 우사기 선물을 가져간 모습 | `usagi` | `stolen-gift.png` | `public/images/characters/usagi/stolen-gift.png` |

표정별 이미지를 추가하려면 `src/data/characters.ts`의 각 캐릭터 `images`에 아래 선택 필드를 등록하세요. `<캐릭터 ID>`에는 `chiikawa`, `hachiware`, `usagi`를 넣습니다.

| 선택 필드 | 예시 상대 경로 | 사용 시점 |
| --- | --- | --- |
| `idle` | `public/images/characters/<캐릭터 ID>/idle.png` | 대기 |
| `happy` | `public/images/characters/<캐릭터 ID>/happy.png` | 선택과 가벼운 터치 반응 |
| `surprised` | `public/images/characters/<캐릭터 ID>/surprised.png` | 강한 터치와 개봉 반응 |

실제 데이터에는 `/images/characters/…` 형태로 경로를 입력합니다. 메인 카드의 기본 모습은 `images.default`를 우선 사용합니다. 선택·깜짝 반응에는 `happy`·`surprised`를 먼저 사용하며, 해당 이미지가 없으면 현재 화면의 포즈, `default`, `idle` 순서로 확인합니다. 도착·일반 결과 화면의 포즈는 `holdingGift`입니다. 모든 후보가 실패하면 CSS 플레이스홀더를 표시합니다. 우사기의 `stolen-gift.png`는 빈 상자 장면에서 계속 사용합니다.

## 공통

| 이미지 | ID | 파일명 | 프로젝트 기준 상대 경로 |
| --- | --- | --- | --- |
| 빈 상자 | `empty-box` | `empty-box.png` | `public/images/common/empty-box.png` |

## 선물

### 치이카와

| 선물 | ID | 파일명 | 프로젝트 기준 상대 경로 |
| --- | --- | --- | --- |
| 분홍색 토벌봉 | `pink-punisher` | `pink-punisher.png` | `public/images/gifts/chiikawa/pink-punisher.png` |
| 곰돌이 파우치 | `bear-pouch` | `bear-pouch.png` | `public/images/gifts/chiikawa/bear-pouch.png` |
| 곰돌이 인형 | `bear-plush` | `bear-plush.png` | `public/images/gifts/chiikawa/bear-plush.png` |
| 제초 검정 공부책 | `weeding-workbook` | `weeding-workbook.png` | `public/images/gifts/chiikawa/weeding-workbook.png` |
| 제초 검정 수험표 | `weeding-admission-ticket` | `weeding-admission-ticket.png` | `public/images/gifts/chiikawa/weeding-admission-ticket.png` |
| 병아리 알람시계 | `chick-alarm-clock` | `chick-alarm-clock.png` | `public/images/gifts/chiikawa/chick-alarm-clock.png` |
| 보수 봉투 | `pay-envelope` | `pay-envelope.png` | `public/images/gifts/chiikawa/pay-envelope.png` |
| 반짝이 카드 | `sparkly-card` | `sparkly-card.png` | `public/images/gifts/chiikawa/sparkly-card.png` |
| 추억의 리본 | `memory-ribbon` | `memory-ribbon.png` | `public/images/gifts/chiikawa/memory-ribbon.png` |
| 단단한 푸딩 | `firm-pudding` | `firm-pudding.png` | `public/images/gifts/chiikawa/firm-pudding.png` |

### 하치와레

| 선물 | ID | 파일명 | 프로젝트 기준 상대 경로 |
| --- | --- | --- | --- |
| 카메라 | `camera` | `camera.png` | `public/images/gifts/hachiware/camera.png` |
| 기타 | `guitar` | `guitar.png` | `public/images/gifts/hachiware/guitar.png` |
| 칭찬받은 리본 | `praised-ribbon` | `praised-ribbon.png` | `public/images/gifts/hachiware/praised-ribbon.png` |
| 파란색 토벌봉 | `blue-punisher` | `blue-punisher.png` | `public/images/gifts/hachiware/blue-punisher.png` |
| 물고기 파우치 | `fish-pouch` | `fish-pouch.png` | `public/images/gifts/hachiware/fish-pouch.png` |
| 리본이 달린 꽃병 | `ribbon-vase` | `ribbon-vase.png` | `public/images/gifts/hachiware/ribbon-vase.png` |
| 제초 검정 참고서 | `weeding-study-guide` | `weeding-study-guide.png` | `public/images/gifts/hachiware/weeding-study-guide.png` |
| 제초 검정 합격증 | `weeding-certificate` | `weeding-certificate.png` | `public/images/gifts/hachiware/weeding-certificate.png` |
| 작은 이불 | `little-blanket` | `little-blanket.png` | `public/images/gifts/hachiware/little-blanket.png` |
| 치이카와와 찍은 사진 | `photo-with-chiikawa` | `photo-with-chiikawa.png` | `public/images/gifts/hachiware/photo-with-chiikawa.png` |

### 우사기

| 선물 | ID | 파일명 | 프로젝트 기준 상대 경로 |
| --- | --- | --- | --- |
| 수상한 마법 지팡이 | `mysterious-wand` | `mysterious-wand.png` | `public/images/gifts/usagi/mysterious-wand.png` |
| 저주받은 나무 조각 | `cursed-wood` | `cursed-wood.png` | `public/images/gifts/usagi/cursed-wood.png` |
| 분홍색으로 빛나는 돌 | `glowing-pink-stone` | `glowing-pink-stone.png` | `public/images/gifts/usagi/glowing-pink-stone.png` |
| 우사기의 토벌봉 | `usagi-punisher` | `usagi-punisher.png` | `public/images/gifts/usagi/usagi-punisher.png` |
| 도토리 | `acorn` | `acorn.png` | `public/images/gifts/usagi/acorn.png` |
| 수상한 슬롯머신 | `mysterious-slot-machine` | `mysterious-slot-machine.png` | `public/images/gifts/usagi/mysterious-slot-machine.png` |
| 공중에 뜨는 버섯 | `floating-mushroom` | `floating-mushroom.png` | `public/images/gifts/usagi/floating-mushroom.png` |
| 맘보를 닮은 탈것 | `mambo-ride` | `mambo-ride.png` | `public/images/gifts/usagi/mambo-ride.png` |
| 피자호빵 | `pizza-bun` | `pizza-bun.png` | `public/images/gifts/usagi/pizza-bun.png` |
| 거대한 파이 스튜 | `giant-pie-stew` | `giant-pie-stew.png` | `public/images/gifts/usagi/giant-pie-stew.png` |

