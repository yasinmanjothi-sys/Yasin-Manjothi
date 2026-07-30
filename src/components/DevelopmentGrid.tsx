'use client';

import { useState } from 'react';
import { developmentProjects, Project } from '@/data/projects';
import ProjectOverlay from './ProjectOverlay';

export default function DevelopmentGrid() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <section className="works-container" id="development">
      <div className="section-header">
        <h2 className="section-label with-cursor">DEVELOPMENT</h2>
        <span className="project-count">[{developmentProjects.length}]</span>
      </div>

      <div className="projects-grid">
        {developmentProjects.map((project) => {
          const stack = project.tools_used
            ? project.tools_used.split(',').map((t) => t.trim()).filter(Boolean)
            : [];

          return (
            <div
              key={project.id}
              className="project-card"
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
              </div>

              <div className="caption">
                <h3 className="project-title with-cursor">{project.title}</h3>
                {project.role && <p className="project-role">{project.role}</p>}

                {stack.length > 0 && (
                  <div className="stack-row">
                    {stack.map((tool) => (
                      <span key={tool} className="stack-pill">{tool}</span>
                    ))}
                  </div>
                )}

                {project.website && (
                  <a
                    href={project.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="live-link with-cursor"
                    onClick={(e) => e.stopPropagation()}
                  >
                    VIEW LIVE SITE
                  </a>
                )}
              </div>
            </div>
          );
        })}
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
          margin-bottom: 3rem;
          cursor: pointer;
        }

        .image-container {
          position: relative;
          width: 100%;
          line-height: 0;
          overflow: hidden;
          background-color: #eee;
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

        .caption {
          padding-top: 1.2rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          line-height: 1.4;
        }

        .project-title {
          font-size: clamp(1.1rem, 2vw, 1.5rem);
          letter-spacing: -0.5px;
          text-transform: uppercase;
          line-height: 1.1;
        }

        .project-role {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          text-transform: uppercase;
          opacity: 0.6;
          letter-spacing: 0.5px;
        }

        .stack-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-top: 0.2rem;
        }

        .stack-pill {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          text-transform: uppercase;
          border: 1px solid rgba(26, 26, 26, 0.25);
          padding: 0.2rem 0.5rem;
          opacity: 0.8;
        }

        .live-link {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          letter-spacing: 0.5px;
          text-decoration: underline;
          text-underline-offset: 4px;
          margin-top: 0.4rem;
          opacity: 0.9;
          transition: opacity 0.2s;
        }

        .live-link:hover {
          opacity: 0.6;
        }

        @media (max-width: 900px) {
          .projects-grid {
            column-count: 1;
          }
        }
      `}</style>
    </section>
  );
}
