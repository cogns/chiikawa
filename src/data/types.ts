export type CharacterId = 'chiikawa' | 'hachiware' | 'usagi'

export interface Gift {
  id: string
  characterId: CharacterId
  name: string
  description: string
  image: string
  episode?: string
}
