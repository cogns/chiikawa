import { isCharacterId } from '../data/characters.ts'
import type { CharacterId } from '../data/types.ts'

export type Route =
  | { page: 'home' }
  | { page: 'gift'; linkId: string; characterId: CharacterId }
  | { page: 'invalid' }

export function parseRoute(url: URL): Route {
  if (url.pathname === '/') return { page: 'home' }

  const match = /^\/gift\/([a-zA-Z0-9_-]{1,128})\/?$/.exec(url.pathname)
  const characterId = url.searchParams.get('from')
  if (!match || !isCharacterId(characterId) || url.searchParams.getAll('from').length !== 1) {
    return { page: 'invalid' }
  }

  return { page: 'gift', linkId: match[1], characterId }
}

export function makeGiftLink(origin: string, characterId: CharacterId): string {
  const linkId = typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, '0')).join('')
  const url = new URL(`/gift/${linkId}`, origin)
  url.searchParams.set('from', characterId)
  return url.href
}
