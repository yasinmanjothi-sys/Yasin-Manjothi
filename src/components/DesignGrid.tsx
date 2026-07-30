'use client';

import { useState } from 'react';
import { designProjects, Project } from '@/data/projects';
import ProjectOverlay from './ProjectOverlay';

export default function DesignGrid() {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <section className="works-container" id="design">
      <div className="section-header">
        <h2 className="section-label with-cursor">DESIGN &amp; MARKETING</h2>
        <span className="project-count">[{designProjects.length}]</span>
      </div>

      <div className="projects-grid">
        {designProjects.map((project) => (
          <div
            key={project.id}
            className="project-card"
            onMouseEnter={() => setHoveredProject(project.id)}
            onMouseLeave={() => setHoveredProject(null)}
            onClick={() => setSelectedProject(project)}
          >
            <div className="image-container">
              {project.heroImages[0] && (
                <img
                  src={project.heroImages[0]}
                  alt={project.title || project.id}
                  loading="lazy"
                  className="project-image"
                />
              )}

              <div className={`hover-overlay ${hoveredProject === project.id ? 'active' : ''}`}>
                <div className="overlay-content">
                  <h3 className="project-title with-cursor">{project.title}</h3>
                  <div className="project-meta">
                    <span>{project.client}</span>
                    <span className="dot">•</span>
                    <span>{project.year}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProject && (
        <ProjectOverlay
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      <style jsx>{`
        .works-container {
          padding: 10vh 5vw;
          background-color: var(--bg-color);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 4rem;
          border-bottom: 1px solid rgba(26, 26, 26, 0.1);
          padding-bottom: 1rem;
        }

        .section-label {
          font-family: var(--font-mono);
          font-size: 0.9rem;
          letter-spacing: 2px;
          opacity: 0.6;
        }

        .project-count {
          font-family: var(--font-mono);
          font-size: 0.9rem;
          opacity: 0.4;
        }

        .projects-grid {
          column-count: 2;
          column-gap: 2rem;
          width: 100%;
        }

        .project-card {
          break-inside: avoid;
          margin-bottom: 2rem;
          position: relative;
          cursor: pointer;
          overflow: hidden;
          background-color: #eee;
        }

        .image-container {
          position: relative;
          width: 100%;
          line-height: 0;
        }

        .project-image {
          width: 100%;
          height: auto;
          display: block;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .project-card:hover .project-image {
          transform: scale(1.05);
        }

        .hover-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(26, 26, 26, 0.8) 0%, transparent 60%);
          color: var(--bg-color);
          opacity: 0;
          transition: opacity 0.4s ease;
          display: flex;
          align-items: flex-end;
          padding: 2rem;
        }

        .hover-overlay.active {
          opacity: 1;
        }

        .project-title {
          font-size: clamp(1.2rem, 2.5vw, 2rem);
          margin-bottom: 0.5rem;
          letter-spacing: -1px;
          text-transform: uppercase;
          line-height: 1;
        }

        .project-meta {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          text-transform: uppercase;
          opacity: 0.8;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .dot {
          opacity: 0.4;
        }

        @media (max-width: 900px) {
          .projects-grid {
            column-count: 1;
          }

          .hover-overlay {
            opacity: 1;
            background: linear-gradient(to top, rgba(26, 26, 26, 0.9) 0%, transparent 80%);
          }

          .project-image {
            filter: brightness(0.8);
          }
        }
      `}</style>
    </section>
  );
}
