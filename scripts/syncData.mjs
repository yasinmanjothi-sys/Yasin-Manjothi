import fs from 'fs';
import path from 'path';

// Run from portfolio-web/ root. Parent directories contain the projects.
const ROOT_DIR = path.join(process.cwd(), '..');
const DOMAINS = [
  '01_identity_design',
  '02_digital_experiences',
  '03_strategic_marketing',
  '04_event_production'
];

const PUBLIC_PROJECTS_DIR = path.join(process.cwd(), 'public', 'projects');
const DATA_OUTPUT_PATH = path.join(process.cwd(), 'src', 'data', 'projects.json');

// Ensure destination directories exist
if (!fs.existsSync(PUBLIC_PROJECTS_DIR)) {
  fs.mkdirSync(PUBLIC_PROJECTS_DIR, { recursive: true });
}
if (!fs.existsSync(path.dirname(DATA_OUTPUT_PATH))) {
  fs.mkdirSync(path.dirname(DATA_OUTPUT_PATH), { recursive: true });
}

/**
 * Builds a flat array of images representing the gallery.
 * Ignores non-image files. Traverses recursively.
 */
function getGalleryImages(dirPath, projectPrefix, category = 'gallery') {
  let results = [];
  if (!fs.existsSync(dirPath)) return results;
  
  const items = fs.readdirSync(dirPath);
  items.forEach(item => {
    if (item.startsWith('.')) return; // skip hidden

    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      results = results.concat(getGalleryImages(fullPath, projectPrefix, category));
    } else {
      const extMatch = item.match(/\.(webp|png|jpg|jpeg)$/i);
      if (extMatch) {
        const ext = extMatch[1].toLowerCase();
        
        // Handle webp superseding original
        if (['png', 'jpg', 'jpeg'].includes(ext)) {
            const hasWebp = items.includes(item.replace(/\.[^.]+$/, '.webp'));
            if (hasWebp) return; // Skip
        }

        const cleanName = item.replace(/[-_]/g, ' ').replace(/\s+/g, '_');
        const uniqueName = `${projectPrefix}-${category}-${Date.now().toString().slice(-4)}-${cleanName}`;
        const destPath = path.join(PUBLIC_PROJECTS_DIR, uniqueName);
        fs.copyFileSync(fullPath, destPath);
        
        results.push(`/projects/${uniqueName}`);
      }
    }
  });

  return results;
}

const parseMarkdown = (mdContent) => {
  const data = {};
  const titleMatch = mdContent.match(/^#\s+(.+)$/m);
  if (titleMatch) data.title = titleMatch[1].trim();

  const sections = ['Client', 'Campaign', 'Year', 'Role', 'Brief', 'Scope of Work', 'Key Deliverables', 'Tools Used', 'Tags', 'Website'];
  sections.forEach(sec => {
    const regex = new RegExp(`## ${sec}\\n([\\s\\S]*?)(?=\\n## |$)`);
    const match = mdContent.match(regex);
    if (match) {
      data[sec.toLowerCase().replace(/\s+/g, '_')] = match[1].trim();
    }
  });
  return data;
};

const projectsData = [];

DOMAINS.forEach(domain => {
  const domainPath = path.join(ROOT_DIR, domain);
  if (!fs.existsSync(domainPath)) return;

  const projects = fs.readdirSync(domainPath).filter(f => !f.startsWith('.'));
  
  projects.forEach(project => {
    const projectPath = path.join(domainPath, project);
    if (!fs.statSync(projectPath).isDirectory()) return;

    const metaPath = path.join(projectPath, '04_meta', 'details.md');
    let projectMeta = { id: project, domain };

    if (fs.existsSync(metaPath)) {
      const mdContent = fs.readFileSync(metaPath, 'utf8');
      projectMeta = { ...projectMeta, ...parseMarkdown(mdContent) };
    }

    // Process Hero Images
    projectMeta.heroImages = getGalleryImages(path.join(projectPath, '01_hero'), project, 'hero');
    
    // Process Process Images
    const processImages = getGalleryImages(path.join(projectPath, '02_process'), project, 'process');
    
    // Process Final Images from 03_final
    const finalImages = getGalleryImages(path.join(projectPath, '03_final'), project, 'final');
    
    // Combine all into a single gallery array (excluding the main hero if needed, but let's keep them all for the grid)
    projectMeta.galleryImages = [...processImages, ...finalImages];
    
    if (projectMeta.title && projectMeta.heroImages.length > 0) {
      projectsData.push(projectMeta);
    }
  });
});

const FEATURED_ORDER = [
  'don-julio-tequila-experience',
  'chez-doneo-web',
  'dijo-web',
  'out-of-box-tools-web'
];

projectsData.sort((a, b) => {
  const indexA = FEATURED_ORDER.indexOf(a.id);
  const indexB = FEATURED_ORDER.indexOf(b.id);
  
  if (indexA !== -1 && indexB !== -1) return indexA - indexB;
  if (indexA !== -1) return -1;
  if (indexB !== -1) return 1;
  return 0; // Maintain original order for others
});

fs.writeFileSync(DATA_OUTPUT_PATH, JSON.stringify(projectsData, null, 2));
console.log(`Successfully Gallery-Synced ${projectsData.length} projects!`);
