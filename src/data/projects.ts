import projectsData from './projects.json';

export interface Project {
  id: string;
  domain: string;
  section: 'design' | 'development';
  title?: string;
  client?: string;
  campaign?: string;
  year?: string;
  role?: string;
  brief?: string;
  scope_of_work?: string;
  key_deliverables?: string;
  tools_used?: string;
  tags?: string;
  heroImages: string[];
  galleryImages?: string[];
  website?: string;
}

const allProjects = projectsData as Project[];

export const designProjects = allProjects.filter((p) => p.section === 'design');
export const developmentProjects = allProjects.filter((p) => p.section === 'development');
