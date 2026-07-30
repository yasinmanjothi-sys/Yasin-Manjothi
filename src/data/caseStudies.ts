import caseStudiesData from './caseStudies.json';

export interface CaseStudyLink {
  label: string;
  url: string;
  screenshot: string | null;
}

export interface CaseStudy {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  cover: string | null;
  links: CaseStudyLink[];
  bodyHtml: string;
}

export const caseStudies = caseStudiesData as CaseStudy[];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
