import { useEffect, useRef, useState, type FormEvent, type Ref } from 'react'
import { Artwork, Parcel } from './components/Artwork'
import { CharacterScene } from './components/CharacterScene'
import { Celebration } from './components/Celebration'
import { characters, commonImages } from './data/characters'
import type { CharacterId } from './data/types'
import { drawGift, type GiftResult } from './lib/gift'
import { makeGiftLink, parseRoute } from './lib/links'

const TAPS_TO_OPEN = 5
// Keep the result transition after the delayed parcel-reveal animation.
const OPENING_MS = 1140

type OpeningState =
  | { phase: 'idle' }
  | { phase: 'tapping'; taps: number }
  | { phase: 'opening' }
  | { phase: 'revealing'; result: GiftResult }
  | { phase: 'opened'; result: GiftResult }

function WindowBar({ label }: { label: string }) {
  return (
    <p className="window-bar">
      <span className="pixel-icon pixel-icon--heart" aria-hidden="true" />
      {label}
    </p>
  )
}

function HomePage() {
  const [selected, setSelected] = useState<CharacterId>()
  const [link, setLink] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const [selectionCue, setSelectionCue] = useState(0)
  const [copyCue, setCopyCue] = useState(0)
  const linkInput = useRef<HTMLInputElement>(null)

  function createLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected) return
    setLink(makeGiftLink(window.location.origin, selected))
    setCopyStatus('')
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link)
      setCopyStatus('링크를 복사했어요!')
      setCopyCue((cue) => cue + 1)
    } catch {
      linkInput.current?.focus()
      linkInput.current?.select()
      setCopyStatus('선택된 주소를 길게 누르거나 복사 단축키를 사용해 주세요.')
    }
  }

  return (
    <section className="pixel-panel home-window" data-character-theme={selected}>
      <WindowBar label="갑옷 씨의 작은 선물 가게" />
      <div className="sender-intro">
        <h1 id="sender-heading">누가 선물을 보낼까요?</h1>
        <p className="lede" id="sender-hint">마음을 전해 줄 친구를 골라주세요!</p>
      </div>

      <form onSubmit={createLink} className="sender-form">
        <fieldset aria-labelledby="sender-heading" aria-describedby="sender-hint">
          <div className="character-grid">
            {Object.values(characters).map(({ id, name, concept, speech }) => (
              <label key={id} className={`character-card character-card--${id}`}>
                <input
                  type="radio"
                  name="sender"
                  value={id}
                  checked={selected === id}
                  onClick={() => setSelectionCue((cue) => cue + 1)}
                  onChange={() => {
                    setSelected(id)
                    setLink('')
                    setCopyStatus('')
                  }}
                />
                <span className="pixel-panel card-frame">
                  <span className="selection-mark" aria-hidden="true" />
                  <CharacterScene
                    id={id}
                    mood={selected === id ? 'happy' : 'idle'}
                    cue={selected === id ? selectionCue : 0}
                    speech={selected === id ? speech.selected : undefined}
                  />
                  <strong>{name}</strong>
                  <small>{concept}</small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <button className="pixel-panel pixel-button action" type="submit" disabled={!selected}>
          <span className="pixel-icon pixel-icon--heart" aria-hidden="true" />
          {link ? '새 선물 링크 만들기' : '선물 보내기'}
        </button>
      </form>

      {link ? (
        <section className="pixel-panel share-panel" key={link} aria-labelledby="share-label">
          <label id="share-label" htmlFor="share-link">선물이 준비됐어요!</label>
          <div className="share-fields">
            <input ref={linkInput} id="share-link" type="url" value={link} readOnly onFocus={(event) => event.target.select()} />
            <button type="button" className="pixel-panel pixel-button copy-button" onClick={copyLink}>링크 복사하기</button>
          </div>
          <p className="share-hint" role="status">
            <span className={copyStatus === '링크를 복사했어요!' ? 'copy-feedback copy-feedback--success' : 'copy-feedback'} key={copyCue}>
              {copyStatus || '이 링크를 선물을 받을 친구에게 보내 주세요.'}
            </span>
          </p>
        </section>
      ) : (
        <p className="secret-note">
          <span className="pixel-icon pixel-icon--spark" aria-hidden="true" />
          상자를 열기 전까지는 비밀! 가끔 예상치 못한 일이 생길지도..?
        </p>
      )}
    </section>
  )
}

function GiftPage({ characterId }: { characterId: CharacterId }) {
  const character = characters[characterId]
  const [state, setState] = useState<OpeningState>({ phase: 'idle' })
  const { phase } = state
  const heading = useRef<HTMLHeadingElement>(null)
  const replaying = useRef(false)

  useEffect(() => {
    function resetOnReturn(event: PageTransitionEvent) {
      if (event.persisted) setState({ phase: 'idle' })
    }

    window.addEventListener('pageshow', resetOnReturn)
    return () => window.removeEventListener('pageshow', resetOnReturn)
  }, [])

  useEffect(() => {
    if (state.phase !== 'opening' && state.phase !== 'revealing') return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(() => {
      if (state.phase === 'revealing') {
        setState({ phase: 'opened', result: state.result })
      } else {
        const result = drawGift(characterId)
        setState({ phase: reduceMotion ? 'opened' : 'revealing', result })
      }
    }, state.phase === 'revealing' && !reduceMotion ? OPENING_MS : 0)
    const cancelReveal = () => window.clearTimeout(timer)
    window.addEventListener('pagehide', cancelReveal)
    return () => {
      cancelReveal()
      window.removeEventListener('pagehide', cancelReveal)
    }
  }, [state, characterId])

  useEffect(() => {
    if (phase === 'idle' && replaying.current) {
      replaying.current = false
      window.scrollTo(0, 0)
      heading.current?.focus({ preventScroll: true })
    }
    if (phase === 'opened') heading.current?.focus({ preventScroll: true })
  }, [phase])

  if (state.phase === 'opened') {
    return (
      <GiftOutcome
        result={state.result}
        characterId={characterId}
        headingRef={heading}
        onReplay={() => {
          replaying.current = true
          setState({ phase: 'idle' })
        }}
      />
    )
  }

  function tapParcel() {
    setState((current) => {
      if (current.phase === 'idle') return { phase: 'tapping', taps: 1 }
      if (current.phase !== 'tapping') return current

      const taps = current.taps + 1
      return taps === TAPS_TO_OPEN ? { phase: 'opening' } : { phase: 'tapping', taps }
    })
  }

  const opening = state.phase === 'opening' || state.phase === 'revealing'
  const ribbonStep = state.phase === 'tapping' ? state.taps : opening ? TAPS_TO_OPEN : 0
  const motion = state.phase === 'tapping' ? (state.taps <= 2 ? 'bounce' : 'rattle') : opening ? 'opening' : 'idle'
  const characterMood = motion === 'bounce' ? 'happy' : motion === 'rattle' || opening ? 'surprised' : 'idle'
  const characterCue = state.phase === 'tapping' ? state.taps : motion
  const showSurprise = motion === 'rattle' || opening

  return (
    <section className={`pixel-panel letter arrival letter--${characterId}`}>
      <WindowBar label="당신 앞으로 온 선물" />
      <div className="letter-sender">
        <CharacterScene
          id={characterId}
          pose="holdingGift"
          mood={characterMood}
          cue={characterCue}
          speech={showSurprise ? character.speech.surprised : character.speech.arrival}
        />
      </div>
      <h1 className="arrival-title" tabIndex={-1} ref={heading}>{character.name}가 <br />선물을 보냈어요!</h1>
      <div className="parcel-stage">
        <button type="button" className="pixel-panel pixel-button pixel-well parcel-button" onClick={tapParcel} disabled={opening} aria-label="선물 상자 두드리기">
          <span className="pixel-icon pixel-icon--spark parcel-sparkle" aria-hidden="true" />
          <span
            className={`parcel-motion parcel-motion--${motion}`}
            data-ribbon-step={ribbonStep}
            key={state.phase === 'tapping' ? state.taps : motion}
          >
            <Parcel characterId={characterId} open={opening} />
            {opening && (
              <>
                <span className="parcel-glow" aria-hidden="true" />
                {state.phase === 'revealing' && state.result.kind === 'gift' && (
                  <span className="parcel-burst" aria-hidden="true">
                    <span className="pixel-icon pixel-icon--spark" />
                    <span className="pixel-icon pixel-icon--heart" />
                    <span className="pixel-icon pixel-icon--spark" />
                    <span className="pixel-icon pixel-icon--heart" />
                  </span>
                )}
              </>
            )}
            {state.phase === 'revealing' && state.result.kind === 'gift' && (
              <span className="parcel-reveal" aria-hidden="true">
                <Artwork src={state.result.gift.image} className="prize-art"><Parcel characterId={characterId} /></Artwork>
              </span>
            )}
          </span>
          <span className="parcel-hint" aria-hidden="true">상자를 톡톡!</span>
        </button>
      </div>
    </section>
  )
}

function GiftOutcome({
  result,
  characterId,
  headingRef,
  onReplay,
}: {
  result: GiftResult
  characterId: CharacterId
  headingRef: Ref<HTMLHeadingElement>
  onReplay: () => void
}) {
  const empty = result.kind === 'empty'
  const presenter = characters[empty ? 'usagi' : characterId]
  const giftName = result.kind === 'gift' ? result.gift.name : '빈 상자'

  return (
    <>
      {!empty && <Celebration characterId={characterId} />}
      <section className={`pixel-panel letter outcome outcome--${empty ? 'empty' : 'gift'} letter--${empty ? 'usagi' : characterId}`}>
        <WindowBar label={empty ? '장난스러운 소식' : `${characters[characterId].name}의 깜짝 선물`} />
        <h1 className="result-title" tabIndex={-1} ref={headingRef}>
          {empty ? '어라...?' : '선물이 도착했어요!'}
        </h1>
        <div className="result-intro">
          <div className="result-presenter">
            <CharacterScene
              id={presenter.id}
              pose={empty ? 'stolenGift' : 'holdingGift'}
              mood={empty ? 'idle' : 'happy'}
            />
          </div>
          <p className="pixel-panel result-speech">
            {empty ? presenter.speech.stolen ?? presenter.speech.result : presenter.speech.result}
          </p>
        </div>
        <article className="pixel-panel result-card" aria-labelledby="gift-name">
          <div className="pixel-well result-image-frame">
            <span className="pixel-icon pixel-icon--spark result-sparkle" aria-hidden="true" />
            <Artwork
              src={result.kind === 'gift' ? result.gift.image : commonImages.emptyBox}
              className="result-art"
            >
              {empty ? (
                <Parcel characterId={characterId} open />
              ) : (
                <span className="gift-placeholder">
                  <span className="pixel-icon pixel-icon--spark" />
                  <span>{giftName}</span>
                </span>
              )}
            </Artwork>
          </div>
          <h2 className="reward-name" id="gift-name">{empty ? '선물이 없어졌어요!' : giftName}</h2>
          <p className="reward-description">
            {result.kind === 'gift' ? result.gift.description : '우사기가 선물을 가져가 버렸어요!'}
          </p>
          {empty && <p className="reward-note">분명 선물이 들어 있었는데...</p>}
          {result.kind === 'gift' && result.gift.episode && <p className="episode">등장 회차 {result.gift.episode}</p>}
        </article>
        <button type="button" className="pixel-panel pixel-button action action--replay" onClick={onReplay}>
          <svg className="outcome-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <rect x="3" y="8" width="18" height="4" rx="1" />
            <path d="M5 12v9h14v-9M12 8v13m0-13H8.5a2.5 2.5 0 1 1 0-5C10.5 3 12 5.6 12 8Zm0 0h3.5a2.5 2.5 0 1 0 0-5C13.5 3 12 5.6 12 8Z" />
          </svg>
          다른 선물도 열어볼래?
        </button>
        <a className="pixel-panel pixel-button action" href="/">
          <svg className="outcome-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <path d="M12 20.5 4.7 13.2a4.5 4.5 0 0 1 6.4-6.4l.9.9.9-.9a4.5 4.5 0 0 1 6.4 6.4Z" />
          </svg>
          친구에게 선물 보내기
        </a>
      </section>
    </>
  )
}

export function App() {
  const route = parseRoute(new URL(window.location.href))

  return (
    <div className="site">
      {/* <header className="site-header">
        <a href="/" className="pixel-panel pixel-badge brand">
          <span className="pixel-icon pixel-icon--heart" aria-hidden="true" />
          먼작귀 선물 우체국
        </a>
      </header> */}
      <main>
        {route.page === 'home' && <HomePage />}
        {route.page === 'gift' && <GiftPage key={route.linkId} characterId={route.characterId} />}
        {route.page === 'invalid' && (
          <section className="pixel-panel letter letter--chiikawa invalid">
            <WindowBar label="길을 잃은 선물" />
            <Parcel />
            <h1>선물 링크를 확인해 주세요</h1>
            <p className="lede">주소가 빠짐없이 복사됐는지 확인하거나 선물 가게로 돌아가 주세요.</p>
            <a className="pixel-panel pixel-button action" href="/">선물 가게로 돌아가기</a>
          </section>
        )}
      </main>
    </div>
  )
}

