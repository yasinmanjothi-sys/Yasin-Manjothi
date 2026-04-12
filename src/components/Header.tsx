'use client';

import { useState, useEffect } from 'react';
import gsap from 'gsap';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const scrollTo = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);
    
    // Slight delay to allow menu to close before scrolling
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 400);
  };

  useEffect(() => {
    // GSAP animation for the menu overlay
    if (isOpen) {
      gsap.to('.menu-overlay', {
        clipPath: 'circle(150% at 95% 5%)',
        duration: 0.8,
        ease: 'power4.inOut'
      });
      gsap.fromTo('.menu-link', 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, delay: 0.3, ease: 'power2.out' }
      );
      document.body.style.overflow = 'hidden';
    } else {
      gsap.to('.menu-overlay', {
        clipPath: 'circle(0% at 95% 5%)',
        duration: 0.6,
        ease: 'power4.inOut'
      });
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  return (
    <>
      <header className="brutalist-header">
        <div className="logo with-cursor">
          YASIN MANJOTHI
        </div>
        <button className="menu-toggle" onClick={toggleMenu}>
           [ {isOpen ? 'CLOSE' : 'MENU'} ]
        </button>
      </header>

      <div className="menu-overlay" data-lenis-prevent>
        <nav className="menu-nav">
          <div className="menu-section">
            <span className="section-label">01. NAVIGATION</span>
            <a href="#about" className="menu-link" onClick={(e) => scrollTo('about', e)}>PROFILE</a>
            <a href="#works" className="menu-link" onClick={(e) => scrollTo('works', e)}>WORKS</a>
          </div>

          <div className="menu-section">
            <span className="section-label">02. SOCIALS</span>
            <a href="https://www.behance.net/yasinmanjo84df" target="_blank" className="menu-link">BEHANCE</a>
            <a href="https://www.instagram.com/yasin_manjothi/" target="_blank" className="menu-link">INSTAGRAM</a>
          </div>
        </nav>
      </div>

      <style jsx>{`
        .brutalist-header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          padding: 2rem 5vw;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 2000;
          mix-blend-mode: difference;
          color: #F5F5F3;
        }

        .logo {
          font-family: inherit;
          font-weight: bold;
          font-size: 1.2rem;
          letter-spacing: -0.5px;
        }

        .menu-toggle {
          background: none;
          border: none;
          color: inherit;
          font-family: var(--font-mono);
          font-size: 1rem;
          cursor: pointer;
          padding: 0.5rem;
          transition: opacity 0.2s;
        }

        .menu-toggle:hover {
          opacity: 0.5;
        }

        .menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: var(--text-color);
          color: var(--bg-color);
          z-index: 1500;
          display: flex;
          align-items: center;
          padding: 0 10vw;
          clip-path: circle(0% at 95% 5%);
        }

        .menu-nav {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 5vw;
          width: 100%;
        }

        .menu-section {
          display: flex;
          flex-direction: column;
        }

        .section-label {
          font-family: var(--font-mono);
          font-size: 0.9rem;
          margin-bottom: 2rem;
          opacity: 0.4;
        }

        .menu-link {
          font-size: clamp(3rem, 8vw, 8rem);
          font-weight: bold;
          text-decoration: none;
          color: inherit;
          line-height: 1;
          margin-bottom: 1.5rem;
          transition: color 0.3s ease;
        }

        .menu-link:hover {
          color: var(--accent-color);
        }

        @media (max-width: 768px) {
          .menu-nav {
            grid-template-columns: 1fr;
            gap: 10vh;
          }
          .menu-link {
            font-size: 3rem;
          }
        }
      `}</style>
    </>
  );
}
