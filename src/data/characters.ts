import type { CharacterId } from './types.ts'

export type CharacterMood = 'idle' | 'happy' | 'surprised'

interface Character {
  id: CharacterId
  name: string
  concept: string
  speech: {
    selected: string
    arrival: string
    surprised: string
    result: string
    stolen?: string
  }
  images: {
    default: string
    holdingGift: string
    stolenGift?: string
    idle?: string
    happy?: string
    surprised?: string
  }
}

export const characters: Record<CharacterId, Character> = {
  chiikawa: {
    id: 'chiikawa',
    name: '치이카와',
    concept: '',
    speech: {
      selected: '와아...!',
      arrival: '우... 우와앗...!',
      surprised: '하앗...?!',
      result: '와아...! 에헤헤...!',
    },
    images: {
      default: '/images/characters/chiikawa/idle.png',
      holdingGift: '/images/characters/chiikawa/holding-gift.png',
    },
  },
  hachiware: {
    id: 'hachiware',
    name: '하치와레',
    concept: '',
    speech: {
      selected: '좋아! 선물하러 가자!',
      arrival: '짜잔~! 선물이야!',
      surprised: '뭔가 나올 것 같아!',
      result: '에헤헤! 마음에 들었으면 좋겠다!',
    },
    images: {
      default: '/images/characters/hachiware/idle.png',
      holdingGift: '/images/characters/hachiware/holding-gift.png',
    },
  },
  usagi: {
    id: 'usagi',
    name: '우사기',
    concept: '',
    speech: {
      selected: '우라!!',
      arrival: '야하!! 우라!!',
      surprised: '하아?! 우라?!',
      result: '우라라!! 야하!!',
      stolen: '야하하!! 우라!!',
    },
    images: {
      default: '/images/characters/usagi/idle.png',
      holdingGift: '/images/characters/usagi/holding-gift.png',
      stolenGift: '/images/characters/usagi/stolen-gift.png',
    },
  },
}

export const commonImages = {
  emptyBox: '/images/common/empty-box.png',
}

export function isCharacterId(value: string | null): value is CharacterId {
  return value !== null && Object.hasOwn(characters, value)
}
