'use client';

const DESIGN_TOOLS = [
  'Adobe Illustrator',
  'Adobe Photoshop',
  'Figma',
  'SketchUp',
  'Enscape',
  'Microsoft PowerPoint',
];

const DEV_TOOLS = [
  'Next.js',
  'React',
  'TypeScript',
  'Tailwind CSS',
  'Node.js',
  'Express',
  'Prisma',
  'HTML / CSS / JavaScript',
  'Hostinger AI Builder',
];

export default function SkillsStrip() {
  return (
    <section className="skills-strip" id="tools">
      <div className="skills-row">
        <span className="skills-label with-cursor">DESIGN &amp; MARKETING</span>
        <div className="skills-list">
          {DESIGN_TOOLS.map((tool) => (
            <span key={tool} className="skill-pill">{tool}</span>
          ))}
        </div>
      </div>

      <div className="skills-row">
        <span className="skills-label with-cursor">DEVELOPMENT</span>
        <div className="skills-list">
          {DEV_TOOLS.map((tool) => (
            <span key={tool} className="skill-pill">{tool}</span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .skills-strip {
          padding: 10vh 5vw 8vh;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          border-top: 1px solid rgba(26, 26, 26, 0.1);
        }

        .skills-row {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 1.5rem;
        }

        .skills-label {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          letter-spacing: 2px;
          opacity: 0.5;
          flex-shrink: 0;
          width: 9rem;
        }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          flex: 1;
        }

        .skill-pill {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          text-transform: uppercase;
          border: 1px solid rgba(26, 26, 26, 0.2);
          padding: 0.3rem 0.7rem;
          opacity: 0.75;
        }

        @media (max-width: 768px) {
          .skills-row {
            flex-direction: column;
            gap: 0.8rem;
          }

          .skills-label {
            width: auto;
          }
        }
      `}</style>
    </section>
  );
}
