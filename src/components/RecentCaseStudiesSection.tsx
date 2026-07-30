'use client';

import Link from 'next/link';
import { caseStudies } from '@/data/caseStudies';

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

export default function RecentCaseStudiesSection() {
  return (
    <section className="case-studies-container" id="case-studies">
      <div className="section-header">
        <h2 className="section-label with-cursor">RECENT CASE STUDIES</h2>
        <span className="entry-count">[{caseStudies.length}]</span>
      </div>

      <p className="section-intro">Write-ups on specific problems I&apos;ve run into and solved — the reasoning, not just the result.</p>

      <div className="entries">
        {caseStudies.length === 0 && (
          <p className="empty-state">Nothing published yet — check back soon.</p>
        )}

        {caseStudies.map((entry) => (
          <Link key={entry.slug} href={`/case-studies/${entry.slug}`} className="entry">
            {entry.cover && (
              <div className="entry-cover">
                <img src={entry.cover} alt={entry.title} loading="lazy" />
              </div>
            )}
            <div className="entry-body">
              <div className="entry-meta">
                <span>{formatDate(entry.date)}</span>
                {entry.tags.length > 0 && (
                  <>
                    <span className="dot">•</span>
                    <span>{entry.tags.join(', ')}</span>
                  </>
                )}
              </div>
              <h3 className="entry-title with-cursor">{entry.title}</h3>
              <p className="entry-summary">{entry.summary}</p>
              <span className="entry-link">READ MORE</span>
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .case-studies-container {
          padding: 10vh 5vw;
          background-color: var(--bg-color);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid rgba(26, 26, 26, 0.1);
          padding-bottom: 1rem;
        }

        .section-label {
          font-family: var(--font-mono);
          font-size: 0.9rem;
          letter-spacing: 2px;
          opacity: 0.6;
        }

        .entry-count {
          font-family: var(--font-mono);
          font-size: 0.9rem;
          opacity: 0.4;
        }

        .section-intro {
          font-family: var(--font-mono);
          font-size: 0.9rem;
          opacity: 0.6;
          max-width: 500px;
          margin-bottom: 4vh;
        }

        .empty-state {
          font-family: var(--font-mono);
          font-size: 0.9rem;
          opacity: 0.5;
          padding: 4vh 0;
        }

        .entries {
          display: flex;
          flex-direction: column;
          max-width: 900px;
        }

        .entry {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 2rem;
          padding: 3rem 0;
          border-bottom: 1px solid rgba(26, 26, 26, 0.1);
          color: inherit;
          text-decoration: none;
        }

        .entry:first-child {
          padding-top: 0;
        }

        .entry-cover {
          width: 100%;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          background-color: #eee;
        }

        .entry-cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .entry:hover .entry-cover img {
          transform: scale(1.04);
        }

        .entry-body {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          min-width: 0;
        }

        .entry-meta {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          text-transform: uppercase;
          opacity: 0.5;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .entry-meta .dot {
          opacity: 0.5;
        }

        .entry-title {
          font-size: clamp(1.3rem, 2.5vw, 1.8rem);
          letter-spacing: -0.5px;
          line-height: 1.15;
        }

        .entry-summary {
          font-size: 0.95rem;
          line-height: 1.6;
          opacity: 0.75;
          max-width: 60ch;
        }

        .entry-link {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          letter-spacing: 1px;
          text-decoration: underline;
          text-underline-offset: 4px;
          opacity: 0.7;
          margin-top: 0.25rem;
        }

        .entry:hover .entry-link {
          opacity: 1;
        }

        @media (max-width: 700px) {
          .entry {
            grid-template-columns: 1fr;
          }

          .entry-cover {
            aspect-ratio: 16 / 9;
          }
        }
      `}</style>
    </section>
  );
}
