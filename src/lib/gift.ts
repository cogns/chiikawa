import { giftsByCharacter } from '../data/gifts/index.ts'
import type { CharacterId, Gift } from '../data/types.ts'

export const EMPTY_BOX_PROBABILITY = 0.15

export type GiftResult = { kind: 'empty' } | { kind: 'gift'; gift: Gift }

export function drawGift(characterId: CharacterId, random = Math.random): GiftResult {
  if (random() < EMPTY_BOX_PROBABILITY) return { kind: 'empty' }

  const gifts = giftsByCharacter[characterId]
  return { kind: 'gift', gift: gifts[Math.floor(random() * gifts.length)] }
}
