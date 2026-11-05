import assert from 'node:assert/strict'
import test from 'node:test'
import { giftsByCharacter } from '../src/data/gifts/index.ts'
import { drawGift } from '../src/lib/gift.ts'
import { makeGiftLink, parseRoute } from '../src/lib/links.ts'

test('각 목록의 10종이 85% 구간에서 균등하고 빈 상자가 15%다', () => {
  for (const [characterId, gifts] of Object.entries(giftsByCharacter)) {
    assert.equal(gifts.length, 10)
    assert.equal(new Set(gifts.map(({ id }) => id)).size, 10)
    const counts = new Map()
    let empty = 0

    for (let outcome = 0; outcome < 100; outcome++) {
      for (let item = 0; item < 100; item++) {
        const rolls = [(outcome + 0.5) / 100, (item + 0.5) / 100]
        const result = drawGift(characterId, () => rolls.shift())
        if (result.kind === 'empty') {
          empty++
        } else {
          assert.equal(result.gift.characterId, characterId)
          const { id } = result.gift
          counts.set(id, (counts.get(id) ?? 0) + 1)
        }
      }
    }

    assert.equal(empty, 1500)
    assert.equal(counts.size, 10)
    for (const { id } of gifts) assert.equal(counts.get(id), 850)
    assert.equal(drawGift(characterId, () => 0.1499999).kind, 'empty')
    assert.equal(drawGift(characterId, () => 0.15).kind, 'gift')
  }
})

test('공유 링크는 결과를 담지 않고 같은 캐릭터에도 새 ID를 발급한다', () => {
  const origin = 'https://example.pages.dev'
  for (const characterId of Object.keys(giftsByCharacter)) {
    const first = new URL(makeGiftLink(origin, characterId))
    const second = new URL(makeGiftLink(origin, characterId))
    assert.notEqual(first.pathname, second.pathname)
    assert.deepEqual([...first.searchParams], [['from', characterId]])
    assert.deepEqual(parseRoute(first), {
      page: 'gift',
      linkId: first.pathname.split('/').at(-1),
      characterId,
    })
  }
})

test('알 수 없는 경로와 잘못된 선물 주소를 구분한다', () => {
  const origin = 'https://example.pages.dev'
  assert.deepEqual(parseRoute(new URL('/', origin)), { page: 'home' })
  for (const path of [
    '/gift/id',
    '/gift/id?from=unknown',
    '/gift/id?from=constructor',
    '/gift/id?from=usagi&from=hachiware',
    '/gift/%20?from=usagi',
    '/gift/id/extra?from=usagi',
    '/gift/',
    '/unknown',
  ]) {
    assert.deepEqual(parseRoute(new URL(path, origin)), { page: 'invalid' })
  }
})
