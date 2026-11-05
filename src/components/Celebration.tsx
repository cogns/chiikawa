import { useEffect, useState, type CSSProperties } from 'react'
import type { CharacterId } from '../data/types'

const particles = Array.from({ length: 16 }, (_, index) => ({
  kind: ['square', 'heart', 'spark'][index % 3],
  left: 8 + (index * 29) % 84,
  top: 16 + (index % 4) * 7,
  drift: (index % 2 ? -1 : 1) * (18 + index * 3),
  fall: 130 + (index % 4) * 42,
  delay: (index % 4) * 45,
}))

export function Celebration({ characterId }: { characterId: CharacterId }) {
  const [visible, setVisible] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    if (!visible) return
    const timer = window.setTimeout(() => setVisible(false), 1450)
    return () => window.clearTimeout(timer)
  }, [visible])

  if (!visible) return null

  return (
    <div className={`celebration letter--${characterId}`} aria-hidden="true">
      <div className="celebration-caption">
        <span className="pixel-panel celebration-message">선물이 도착했어요!</span>
      </div>
      {particles.map((particle, index) => (
        <span
          key={index}
          className={`celebration-particle pixel-icon pixel-icon--${particle.kind}`}
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDelay: `${particle.delay}ms`,
            '--drift': `${particle.drift}px`,
            '--fall': `${particle.fall}px`,
            '--spin': `${index % 2 ? -160 : 160}deg`,
          } as CSSProperties}
        />
      ))}
    </div>
  )
}
