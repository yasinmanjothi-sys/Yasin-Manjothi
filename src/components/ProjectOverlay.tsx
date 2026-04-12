'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { Project } from './WorksGrid';

interface ProjectOverlayProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectOverlay({ project, onClose }: ProjectOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    if (!overlayRef.current) return;

    // Entry animation
    gsap.fromTo(overlayRef.current, 
      { clipPath: 'inset(100% 0 0 0)' },
      { clipPath: 'inset(0% 0 0 0)', duration: 0.8, ease: 'power4.inOut' }
    );

    gsap.fromTo(contentRef.current,
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: 0.4, ease: 'power2.out' }
    );

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleClose = () => {
    gsap.to(overlayRef.current, {
      clipPath: 'inset(100% 0 0 0)',
      duration: 0.6,
      ease: 'power4.inOut',
      onComplete: onClose
    });
  };

  return (
    <div ref={overlayRef} className="project-overlay">
      <div className="overlay-header">
        <button className="close-btn" onClick={handleClose}>[ CLOSE ]</button>
      </div>

      <div ref={contentRef} className="overlay-scroll-container" data-lenis-prevent>
        <div className="metadata-container">
          <div className="meta-left">
            <h1 className="project-title with-cursor">{project.title}</h1>
            <p className="project-brief">{project.brief}</p>
          </div>
          
          <div className="meta-right">
            <div className="meta-item">
              <span className="label">CLIENT</span>
              <span className="value">{project.client}</span>
            </div>
            <div className="meta-item">
              <span className="label">YEAR</span>
              <span className="value">{project.year}</span>
            </div>
            <div className="meta-item">
              <span className="label">ROLE</span>
              <span className="value">{project.role}</span>
            </div>
            {project.scope_of_work && (
              <div className="meta-item">
                <span className="label">SCOPE OF WORK</span>
                <div className="list-value">{project.scope_of_work}</div>
              </div>
            )}
            {project.key_deliverables && (
              <div className="meta-item">
                <span className="label">KEY DELIVERABLES</span>
                <div className="list-value">{project.key_deliverables}</div>
              </div>
            )}
            {project.website && (
              <div className="meta-item">
                <span className="label">LIVE PROJECT</span>
                <a 
                  href={project.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="value with-cursor website-link"
                >
                  VIEW WEBSITE HERE
                </a>
              </div>
            )}
            <div className="meta-item">
              <span className="label">TOOLS</span>
              <span className="value">{project.tools_used}</span>
            </div>
          </div>
        </div>

        <div className="project-content-stream">
          {/* Featured Hero Visual */}
          {project.heroImages?.[0] && (
            <div className="stream-section full-width">
              <img 
                src={project.heroImages[0]} 
                alt={`${project.title} hero`} 
                loading="eager" 
                className="stream-image"
              />
            </div>
          )}
          
          {/* Masonry Gallery Grid */}
          {project.galleryImages && project.galleryImages.length > 0 && (
            <div className="masonry-gallery">
              {project.galleryImages.map((img, idx) => (
                <div key={idx} className="masonry-item" onClick={() => setLightboxImg(img)}>
                  <img src={img} alt={`${project.title} gallery ${idx}`} loading="lazy" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="overlay-footer">
          <button className="back-to-top" onClick={() => {
            document.querySelector('.overlay-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
          }}>[ BACK TO TOP ]</button>
        </div>
      </div>

      {/* Lightbox Viewer */}
      {lightboxImg && (
        <div className="lightbox-overlay" onClick={() => setLightboxImg(null)}>
          <button className="lightbox-close" onClick={() => setLightboxImg(null)}>[ CLOSE ]</button>
          <img src={lightboxImg} alt="Expanded view" className="lightbox-img" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <style jsx>{`
        .project-overlay {
          position: fixed;
          inset: 0;
          background-color: var(--bg-color);
          z-index: 3000;
          display: flex;
          flex-direction: column;
          color: var(--text-color);
          clip-path: inset(100% 0 0 0);
        }

        .overlay-header {
          padding: 2rem 5vw;
          display: flex;
          justify-content: flex-end;
          background-color: var(--bg-color);
          z-index: 10;
        }

        .close-btn {
          background: none;
          border: none;
          font-family: var(--font-mono);
          font-size: 1rem;
          cursor: pointer;
          color: inherit;
        }

        .overlay-scroll-container {
          flex: 1;
          overflow-y: auto;
          padding: 0 5vw 10vh;
        }

        .metadata-container {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 10vw;
          margin-bottom: 10vh;
          padding-top: 5vh;
        }

        .project-title {
          font-size: clamp(3rem, 8vw, 8rem);
          font-weight: bold;
          line-height: 0.9;
          margin-bottom: 3rem;
          letter-spacing: -3px;
          text-transform: uppercase;
        }

        .project-brief {
          font-size: 1.2rem;
          line-height: 1.6;
          opacity: 0.8;
          max-width: 600px;
        }

        .meta-right {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .meta-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          border-bottom: 1px solid rgba(26, 26, 26, 0.1);
          padding-bottom: 1rem;
        }

        .label {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          opacity: 0.5;
        }

        .value {
          font-weight: bold;
          font-size: 1.1rem;
        }

        .list-value {
          font-family: var(--font-mono);
          font-size: 0.9rem;
          line-height: 1.6;
          opacity: 0.8;
          white-space: pre-wrap;
        }

        .website-link {
          text-decoration: underline;
          text-underline-offset: 4px;
          transition: opacity 0.2s;
          display: inline-block;
        }

        .website-link:hover {
          opacity: 0.6;
        }

        .project-content-stream {
          display: flex;
          flex-direction: column;
          gap: 4rem;
        }

        .stream-section.full-width {
          width: 100%;
        }

        .stream-image {
          width: 100%;
          height: auto;
          display: block;
        }

        /* Unified Masonry Gallery */
        .masonry-gallery {
          column-count: 3;
          column-gap: 1.5rem;
          width: 100%;
        }

        .masonry-item {
          break-inside: avoid;
          margin-bottom: 1.5rem;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          background: #eee;
        }

        .masonry-item img {
          width: 100%;
          height: auto;
          display: block;
          transition: transform 0.4s ease, opacity 0.3s;
        }

        .masonry-item:hover img {
          transform: scale(1.02);
          opacity: 0.9;
        }

        @media (max-width: 1024px) {
          .masonry-gallery { column-count: 2; }
          .metadata-container {
            grid-template-columns: 1fr;
            gap: 5vh;
          }
        }

        @media (max-width: 640px) {
          .masonry-gallery { column-count: 1; }
        }

        /* Lightbox Viewer */
        .lightbox-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          z-index: 5000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          cursor: zoom-out;
          opacity: 0;
          animation: lightBoxFadeIn 0.3s forwards;
        }

        @keyframes lightBoxFadeIn {
          to { opacity: 1; }
        }

        .lightbox-close {
          position: absolute;
          top: 2rem;
          right: 2rem;
          background: none;
          border: none;
          color: white;
          font-family: var(--font-mono);
          font-size: 1rem;
          cursor: pointer;
          z-index: 5001;
        }

        .lightbox-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          cursor: default;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
        }

        .overlay-footer {
          margin-top: 10vh;
          display: flex;
          justify-content: center;
        }

        .back-to-top {
          background: none;
          border: none;
          font-family: var(--font-mono);
          font-size: 1rem;
          cursor: pointer;
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}
