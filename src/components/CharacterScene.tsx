import { useEffect, useRef, useState } from 'react'
import type { CharacterMood } from '../data/characters'
import type { CharacterId } from '../data/types'
import { CharacterPortrait } from './Artwork'

interface CharacterSceneProps {
  id: CharacterId
  pose?: 'default' | 'holdingGift' | 'stolenGift'
  mood?: CharacterMood
  cue?: string | number
  speech?: string
}

const reactions: Record<Exclude<CharacterMood, 'idle'>, Keyframe[]> = {
  happy: [
    { transform: 'none', offset: 0 },
    { transform: 'translateY(-10px) scale(1.08)', offset: 0.4 },
    { transform: 'translateY(2px) scale(0.98)', offset: 0.72 },
    { transform: 'none', offset: 1 },
  ],
  surprised: [
    { transform: 'none', offset: 0 },
    { transform: 'translateY(-12px) rotate(-5deg)', offset: 0.35 },
    { transform: 'translateY(-3px) rotate(4deg)', offset: 0.65 },
    { transform: 'none', offset: 1 },
  ],
}

export function CharacterScene({
  id,
  pose,
  mood = 'idle',
  cue = 0,
  speech,
}: CharacterSceneProps) {
  const sprite = useRef<HTMLSpanElement>(null)
  const [reacting, setReacting] = useState(false)

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!sprite.current || mood === 'idle' || motionPreference.matches) {
      setReacting(false)
      return
    }

    setReacting(true)
    const animation = sprite.current.animate(reactions[mood], {
      duration: mood === 'happy' ? 380 : 420,
      easing: 'cubic-bezier(.2,.7,.35,1)',
    })
    animation.onfinish = () => setReacting(false)
    const stopOnReduce = () => {
      if (motionPreference.matches) {
        animation.cancel()
        setReacting(false)
      }
    }
    motionPreference.addEventListener('change', stopOnReduce)
    return () => {
      animation.onfinish = null
      animation.cancel()
      motionPreference.removeEventListener('change', stopOnReduce)
    }
  }, [mood, cue])

  return (
    <span className={`character-scene character-scene--${id}`} data-reacting={reacting}>
      <span className="character-idle">
        <span className="character-reaction" ref={sprite}>
          <CharacterPortrait id={id} pose={pose} mood={mood} />
        </span>
      </span>
      <span className="character-sparkles" aria-hidden="true">
        <span className="pixel-icon pixel-icon--spark" />
        <span className="pixel-icon pixel-icon--spark" />
      </span>
      {mood === 'happy' && (
        <span className="selection-hearts" key={cue} aria-hidden="true">
          <span className="pixel-icon pixel-icon--heart" />
          <span className="pixel-icon pixel-icon--heart" />
          <span className="pixel-icon pixel-icon--heart" />
        </span>
      )}
      {speech && (
        <span className="speech-anchor">
          <span className="pixel-panel character-speech" key={`${mood}-${cue}`}>{speech}</span>
        </span>
      )}
    </span>
  )
}
