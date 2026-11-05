import { useState, type ReactNode } from 'react'
import { characters, type CharacterMood } from '../data/characters'
import type { CharacterId } from '../data/types'

interface ArtworkProps {
  src: string
  fallbackSrc?: string | readonly string[]
  className?: string
  children: ReactNode
}

export function Artwork({ src, fallbackSrc, className = '', children }: ArtworkProps) {
  const [failed, setFailed] = useState<string[]>([])
  const [loaded, setLoaded] = useState<string>()
  const fallbacks = typeof fallbackSrc === 'string' ? [fallbackSrc] : fallbackSrc ?? []
  const current = [src, ...fallbacks].find((path) => path.length > 0 && !failed.includes(path))
  const sources = [...new Set([loaded, current].filter((path): path is string => path !== undefined))]

  return (
    <span className={`artwork ${className}`} aria-hidden="true">
      {!loaded && !current && <span className="artwork-placeholder">{children}</span>}
      {sources.map((path) => (
        <img
          key={path}
          src={path}
          alt=""
          decoding="async"
          className={loaded === path ? 'artwork-image ready' : 'artwork-image'}
          onLoad={() => setLoaded(path)}
          onError={() => {
            setFailed((paths) => [...paths, path])
            if (loaded === path) setLoaded(undefined)
          }}
        />
      ))}
    </span>
  )
}

export function CharacterPortrait({
  id,
  pose = 'default',
  mood = 'idle',
}: {
  id: CharacterId
  pose?: 'default' | 'holdingGift' | 'stolenGift'
  mood?: CharacterMood
}) {
  const { images } = characters[id]
  const stateImage = pose === 'stolenGift' || mood === 'idle'
    ? images[pose]
    : images[mood] ?? images[pose]
  return (
    <Artwork
      src={stateImage ?? images.default}
      fallbackSrc={[images[pose] ?? '', images.default, images.idle ?? '']}
      className={`pixel-well portrait portrait--${id}`}
    >
      <span className="mascot">
        <span className="mascot-ear ear-left" />
        <span className="mascot-ear ear-right" />
        <span className="mascot-head"><span className="mascot-mouth" /></span>
      </span>
    </Artwork>
  )
}

export function Parcel({
  characterId = 'chiikawa',
  open = false,
}: {
  characterId?: CharacterId
  open?: boolean
}) {
  return (
    <span className={`parcel parcel--${characterId}${open ? ' parcel--open' : ''}`} aria-hidden="true">
      <span className="parcel-body" />
      <span className="parcel-top">
        <span className="parcel-lid" />
        <span className="parcel-bow"><span /></span>
      </span>
    </span>
  )
}
