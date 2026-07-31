'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';
  const LogoTag = isHome ? 'h1' : 'p';

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // On the homepage, these are same-page smooth-scrolls. On any other page
  // (e.g. a case study article), the href already points at "/#id" so the
  // browser just navigates there — no interception needed.
  const scrollTo = (id: string, e: React.MouseEvent) => {
    if (!isHome) {
      setIsOpen(false);
      return;
    }
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
        <LogoTag className="logo with-cursor">
          <Link href="/">YASIN MANJOTHI</Link>
        </LogoTag>
        <button className="menu-toggle" onClick={toggleMenu}>
           [ {isOpen ? 'CLOSE' : 'MENU'} ]
        </button>
      </header>

      <div className="menu-overlay" data-lenis-prevent>
        <nav className="menu-nav">
          <div className="menu-section">
            <span className="section-label">01. NAVIGATION</span>
            <Link href="/#about" className="menu-link" onClick={(e) => scrollTo('about', e)}>PROFILE</Link>
            <Link href="/#design" className="menu-link" onClick={(e) => scrollTo('design', e)}>DESIGN &amp; MARKETING</Link>
            <Link href="/#development" className="menu-link" onClick={(e) => scrollTo('development', e)}>DEVELOPMENT</Link>
            <Link href="/#case-studies" className="menu-link" onClick={(e) => scrollTo('case-studies', e)}>RECENT CASE STUDIES</Link>
          </div>

          <div className="menu-section">
            <span className="section-label">02. SOCIALS</span>
            <a href="https://github.com/yasinmanjothi-sys" target="_blank" rel="noopener noreferrer" className="menu-link">GITHUB</a>
            <a href="https://www.behance.net/yasinmanjo84df" target="_blank" rel="noopener noreferrer" className="menu-link">BEHANCE</a>
            <a href="https://www.instagram.com/yasin_manjothi/" target="_blank" rel="noopener noreferrer" className="menu-link">INSTAGRAM</a>
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
          padding: 4vh 10vw;
          overflow-y: auto;
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
          margin-bottom: 1.5rem;
          opacity: 0.4;
        }

        /* :global() here because next/link doesn't forward styled-jsx's
           scoping class the way a plain <a> would.
           Sized in vw + a rem cap so a long single word (e.g. INSTAGRAM)
           never outgrows its column, and four stacked items (some
           wrapping to two lines) still fit inside the viewport height. */
        :global(.menu-link) {
          font-size: clamp(1.8rem, 4.2vw, 5rem);
          font-weight: bold;
          text-decoration: none;
          color: inherit;
          line-height: 1.05;
          margin-bottom: 0.75rem;
          transition: color 0.3s ease;
        }

        :global(.menu-link:hover) {
          color: var(--accent-color);
        }

        @media (max-width: 768px) {
          .menu-nav {
            grid-template-columns: 1fr;
            gap: 6vh;
          }
          :global(.menu-link) {
            font-size: 2.2rem;
          }
        }
      `}</style>
    </>
  );
}
