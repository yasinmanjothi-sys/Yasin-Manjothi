'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';

// Register standard TextPlugin. Next.JS SSR safe guard required.
if (typeof window !== "undefined") {
  gsap.registerPlugin(TextPlugin);
}

const SEQUENCE = [
  { text: "Yasin Manjothi", holdParams: 2 },
  { text: "Marketing Strategist", holdParams: 1.2 },
  { text: "Web Designer", holdParams: 1.2 },
  { text: "Event Producer", holdParams: 1.2 },
  { text: "Graphic Designer", holdParams: 1.2 },
  { text: "Artist", holdParams: 1.2 },
  { text: "Multidisciplinary Creative", holdParams: 1.2 } // End state
];

export default function HeroSequence() {
  const textRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!textRef.current || !cursorRef.current) return;

    // Fixed steady cursor blink (500ms on/off) independent of typing
    const cursorTl = gsap.to(cursorRef.current, {
      opacity: 0,
      duration: 0.1,
      repeat: -1,
      yoyo: true,
      repeatDelay: 0.4,
      ease: "steps(1)"
    });

    // Create an infinitely repeating master timeline
    const runSequence = () => {
      const tl = gsap.timeline({ repeat: -1 });

      SEQUENCE.forEach((item) => {
        const typeDuration = item.text.length * 0.05;

        tl.to(textRef.current, {
          duration: typeDuration,
          text: { value: item.text },
          ease: "none"
        });

        tl.to({}, { duration: item.holdParams }); // Hold

        tl.to(textRef.current, {
          duration: 0.4,
          text: { value: "" },
          ease: "none"
        });
      });
    };

    runSequence();

    return () => {
      gsap.killTweensOf(textRef.current);
      cursorTl.kill();
    };
  }, []);

  return (
    <section className="hero-container">
      <div className="hero-content">
        <div className="typewriter-box">
          <span ref={textRef} className="typewriter-text"></span>
          <span ref={cursorRef} className="cursor">█</span>
        </div>
      </div>

        <div className="scroll-indicator">
          <div className="mouse">
            <div className="wheel"></div>
          </div>
          <span>SCROLL</span>
        </div>

      <style jsx>{`
        .hero-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          width: 100%;
          position: relative;
          overflow: hidden;
        }

        .hero-content {
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          width: 100%;
        }
        
        .typewriter-box {
          font-size: clamp(2rem, 5vw, 4rem);
          font-weight: bold;
          line-height: 1.2;
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
        }

        .typewriter-text {
          white-space: pre;
        }

        .cursor {
          display: inline-block;
          margin-left: 2px;
          color: var(--text-color);
        }

        .scroll-indicator {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 2px;
          opacity: 0.5;
        }

        .mouse {
          width: 20px;
          height: 35px;
          border: 1px solid var(--text-color);
          border-radius: 10px;
          position: relative;
        }

        .wheel {
          width: 2px;
          height: 6px;
          background-color: var(--text-color);
          position: absolute;
          top: 6px;
          left: 50%;
          transform: translateX(-50%);
          animation: scrollDown 1.5s infinite;
        }

        @keyframes scrollDown {
          0% { transform: translate(-50%, 0); opacity: 1; }
          100% { transform: translate(-50%, 20px); opacity: 0; }
        }
        
        @media (max-width: 1024px) {
          .hero-content {
            flex-direction: column-reverse;
            gap: 2rem;
            text-align: center;
          }
          .typewriter-box {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 768px) {
          .typewriter-box {
            font-size: clamp(1.5rem, 5vw, 2.5rem);
          }
        }
      `}</style>
    </section>
  );
}
