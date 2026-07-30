'use client';

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CaseStudy } from "@/data/caseStudies";

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function CaseStudyArticle({ entry }: { entry: CaseStudy }) {
  return (
    <main>
      <Header />

      <article className="article-container">
        <Link href="/#case-studies" className="back-link">← RECENT CASE STUDIES</Link>

        <div className="article-meta">
          <span>{formatDate(entry.date)}</span>
          {entry.tags.length > 0 && (
            <>
              <span className="dot">•</span>
              <span>{entry.tags.join(', ')}</span>
            </>
          )}
        </div>

        <h1 className="article-title with-cursor">{entry.title}</h1>

        {entry.links.length > 0 && (
          <div className="link-gallery">
            <span className="link-gallery-label">LIVE</span>

            <div className="link-gallery-grid">
              {entry.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-card"
                >
                  {link.screenshot && (
                    <div className="link-card-shot">
                      <img src={link.screenshot} alt={link.label} loading="lazy" />
                    </div>
                  )}
                  <span className="link-card-label">{link.label} ↗</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {entry.cover && (
          <div className="article-cover">
            <img src={entry.cover} alt={entry.title} />
          </div>
        )}

        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: entry.bodyHtml }}
        />

        <div className="article-footer">
          <Link href="/#case-studies" className="back-link">← RECENT CASE STUDIES</Link>
        </div>
      </article>

      <Footer />

      <style jsx>{`
        .article-container {
          padding: 18vh 5vw 10vh;
          max-width: 720px;
          margin: 0 auto;
        }

        .back-link {
          display: inline-block;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          letter-spacing: 1px;
          opacity: 0.5;
          text-decoration: none;
          margin-bottom: 3rem;
          transition: opacity 0.2s ease;
        }

        .back-link:hover {
          opacity: 1;
        }

        .article-meta {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          text-transform: uppercase;
          opacity: 0.5;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }

        .article-meta .dot {
          opacity: 0.5;
        }

        .article-title {
          font-size: clamp(2rem, 5vw, 3.5rem);
          letter-spacing: -1px;
          line-height: 1.05;
          margin-bottom: 1.5rem;
        }

        .link-gallery {
          margin-bottom: 3rem;
        }

        .link-gallery-label {
          display: block;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          letter-spacing: 1px;
          opacity: 0.4;
          margin-bottom: 1rem;
        }

        .link-gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 1.5rem;
        }

        .link-card {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          color: inherit;
          text-decoration: none;
        }

        .link-card-shot {
          width: 100%;
          aspect-ratio: 480 / 850;
          overflow: hidden;
          background-color: #eee;
          border: 1px solid rgba(26, 26, 26, 0.15);
        }

        .link-card-shot img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top;
          display: block;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .link-card:hover .link-card-shot img {
          transform: scale(1.03);
        }

        .link-card-label {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          line-height: 1.4;
          text-decoration: underline;
          text-underline-offset: 3px;
          opacity: 0.75;
          transition: opacity 0.2s ease;
        }

        .link-card:hover .link-card-label {
          opacity: 1;
        }

        .article-cover {
          width: 100%;
          margin-bottom: 3rem;
          background-color: #eee;
          line-height: 0;
        }

        .article-cover img {
          width: 100%;
          height: auto;
          display: block;
        }

        .article-body {
          font-size: 1.05rem;
          line-height: 1.75;
        }

        .article-body :global(h2) {
          font-size: 1.5rem;
          letter-spacing: -0.5px;
          margin: 3rem 0 1rem;
          line-height: 1.2;
        }

        .article-body :global(h3) {
          font-size: 1.2rem;
          margin: 2.5rem 0 1rem;
          line-height: 1.2;
        }

        .article-body :global(p) {
          margin-bottom: 1.5rem;
          opacity: 0.85;
        }

        .article-body :global(ul),
        .article-body :global(ol) {
          margin: 0 0 1.5rem 1.5rem;
          opacity: 0.85;
        }

        .article-body :global(li) {
          margin-bottom: 0.5rem;
        }

        .article-body :global(a) {
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .article-body :global(img) {
          width: 100%;
          height: auto;
          display: block;
          margin: 2.5rem 0;
        }

        .article-body :global(code) {
          font-family: var(--font-mono);
          font-size: 0.9em;
          background: rgba(26, 26, 26, 0.06);
          padding: 0.15em 0.4em;
        }

        .article-body :global(blockquote) {
          border-left: 2px solid rgba(26, 26, 26, 0.2);
          padding-left: 1.5rem;
          margin: 2rem 0;
          opacity: 0.75;
          font-style: italic;
        }

        .article-body :global(hr) {
          border: none;
          border-top: 1px solid rgba(26, 26, 26, 0.1);
          margin: 3rem 0;
        }

        .article-footer {
          margin-top: 5rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(26, 26, 26, 0.1);
        }

        .article-footer .back-link {
          margin-bottom: 0;
        }
      `}</style>
    </main>
  );
}
