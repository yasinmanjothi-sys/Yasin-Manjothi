'use client';

export default function AboutSection() {
  return (
    <section className="about-section" id="about">
      <div className="container">
        <h2 className="section-title with-cursor">PROFILE</h2>
        
        <div className="grid-3-col">
          <div className="col">
            <h3 className="with-cursor">01. <br/>EXPERTISE</h3>
            <ul>
              <li>Graphic Design</li>
              <li>UI/UX & Web Dev</li>
              <li>Brand Strategy</li>
              <li>Event Production</li>
              <li>3D Visualisation</li>
            </ul>
          </div>
          
          <div className="col">
            <h3 className="with-cursor">02. <br/>CLIENTS</h3>
            <ul>
              <li>VISA (FIFA World Cup)</li>
              <li>Nivea (Beiersdorf)</li>
              <li>TotalEnergies</li>
              <li>Don Julio (Diageo)</li>
              <li>Monster Energy</li>
              <li>Java House</li>
            </ul>
          </div>

          <div className="col">
            <h3 className="with-cursor">03. <br/>PRINCIPLES</h3>
            <p>
              Merging high-end aesthetic precision with brutal functional code. Specializing in tactile digital experiences, 
              scalable design systems, and immersive physical brand activations.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .about-section {
          padding: 15vh 0;
          border-top: 1px solid rgba(26, 26, 26, 0.1);
        }

        .section-title {
          font-family: var(--font-mono);
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 5rem;
          opacity: 0.6;
        }

        .grid-3-col {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4rem;
        }

        .col h3 {
          font-size: clamp(2rem, 3vw, 3rem);
          line-height: 1.1;
          margin-bottom: 2rem;
          letter-spacing: -1px;
        }

        .col ul {
          list-style: none;
          padding: 0;
        }

        .col li {
          font-family: var(--font-mono);
          font-size: 1rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid rgba(26, 26, 26, 0.2);
          padding-bottom: 1rem;
          display: flex;
          justify-content: space-between;
        }

        .col p {
          font-family: var(--font-mono);
          font-size: 1.1rem;
          line-height: 1.6;
          opacity: 0.8;
        }

        @media (max-width: 900px) {
          .grid-3-col {
            grid-template-columns: 1fr;
            gap: 5rem;
          }
        }
      `}</style>
    </section>
  );
}
