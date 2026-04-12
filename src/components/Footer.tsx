'use client';

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="container">
        <a href="mailto:contact@yasinmanjothi.com" className="cta-giant">
          LET'S TALK
        </a>
        
        <div className="footer-bottom">
            <a href="https://www.behance.net/yasinmanjo84df" target="_blank" rel="noopener noreferrer">Behance</a>
            <a href="https://www.instagram.com/yasin_manjothi/" target="_blank" rel="noopener noreferrer">Instagram</a>
          <div className="copyright">
            <p>&copy; {new Date().getFullYear()} Yasin Manjothi. Built from Scratch.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer-section {
          background-color: var(--bg-color);
          color: var(--text-color);
          padding: 10vh 0 5vh;
          text-align: center;
        }

        .cta-giant {
          display: block;
          font-size: clamp(4rem, 15vw, 15rem);
          font-weight: bold;
          letter-spacing: -2px;
          line-height: 0.8;
          margin-bottom: 10vh;
          transition: opacity 0.3s ease;
        }

        .cta-giant:hover {
          opacity: 0.5;
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: var(--font-mono);
          font-size: 0.9rem;
          border-top: 1px solid rgba(26, 26, 26, 0.2);
          padding-top: 2rem;
        }

        .links {
          display: flex;
          gap: 2rem;
        }

        .links a {
          text-transform: uppercase;
          position: relative;
        }

        .links a::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 1px;
          bottom: -2px;
          left: 0;
          background-color: var(--text-color);
          transform: scaleX(0);
          transform-origin: bottom right;
          transition: transform 0.3s ease;
        }

        .links a:hover::after {
          transform: scaleX(1);
          transform-origin: bottom left;
        }

        @media (max-width: 768px) {
          .footer-bottom {
            flex-direction: column;
            gap: 2rem;
          }
          .links {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </footer>
  );
}
