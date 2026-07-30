'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Code-split each game (canvas logic + listeners) out of the main bundle —
// this section is below the fold and not part of the critical path.
const PongGame = dynamic(() => import('./PongGame'), {
  ssr: false,
  loading: () => <div className="game-placeholder pong" />,
});

const HoopsGame = dynamic(() => import('./HoopsGame'), {
  ssr: false,
  loading: () => <div className="game-placeholder hoops" />,
});

type GameId = 'pong' | 'hoops';

const HINTS: Record<GameId, string> = {
  pong: 'first to 5 wins — paddles blink at rest, go solid on contact.',
  hoops: '24 second shot clock — drag distance and angle set your power and arc.',
};

export default function PlaySection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [active, setActive] = useState<GameId>('pong');

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    io.observe(el);

    return () => io.disconnect();
  }, []);

  return (
    <section ref={wrapperRef} className="play-section" id="play">
      <div className="section-header">
        <h2 className="section-label with-cursor">QUICK GAME BREAK</h2>

        <div className="tabs" role="tablist" aria-label="Choose a game">
          <button
            role="tab"
            aria-selected={active === 'pong'}
            className={`tab${active === 'pong' ? ' active' : ''}`}
            onClick={() => setActive('pong')}
          >
            [ PONG ]
          </button>
          <button
            role="tab"
            aria-selected={active === 'hoops'}
            className={`tab${active === 'hoops' ? ' active' : ''}`}
            onClick={() => setActive('hoops')}
          >
            [ HOOPS ]
          </button>
        </div>
      </div>

      <p className="play-hint">{HINTS[active]}</p>

      {shouldLoad ? (
        active === 'pong' ? <PongGame /> : <HoopsGame />
      ) : (
        <div className="game-placeholder" />
      )}

      <style jsx>{`
        .play-section {
          padding: 10vh 5vw 8vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .section-header {
          width: 100%;
          max-width: 700px;
          margin-bottom: 1rem;
          border-bottom: 1px solid rgba(26, 26, 26, 0.1);
          padding-bottom: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .section-label {
          font-family: var(--font-mono);
          font-size: 0.9rem;
          letter-spacing: 2px;
          opacity: 0.6;
        }

        .tabs {
          display: flex;
          gap: 1rem;
        }

        .tab {
          background: none;
          border: none;
          color: var(--text-color);
          font-family: var(--font-mono);
          font-size: 0.85rem;
          letter-spacing: 1px;
          opacity: 0.4;
          cursor: pointer;
          padding: 0;
          transition: opacity 0.2s ease;
        }

        .tab:hover {
          opacity: 0.7;
        }

        .tab.active {
          opacity: 1;
          font-weight: bold;
        }

        .play-hint {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          opacity: 0.5;
          text-align: center;
          max-width: 400px;
          margin-bottom: 2.5rem;
        }

        .game-placeholder {
          width: 100%;
          max-width: 700px;
          aspect-ratio: 600 / 400;
        }

        .game-placeholder.hoops {
          max-width: 440px;
          aspect-ratio: 440 / 520;
        }
      `}</style>
    </section>
  );
}
