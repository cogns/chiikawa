import type { CharacterId, Gift } from '../types.ts'
import { chiikawaGifts } from './chiikawa.ts'
import { hachiwareGifts } from './hachiware.ts'
import { usagiGifts } from './usagi.ts'

export const giftsByCharacter: Record<CharacterId, readonly Gift[]> = {
  chiikawa: chiikawaGifts,
  hachiware: hachiwareGifts,
  usagi: usagiGifts,
}
