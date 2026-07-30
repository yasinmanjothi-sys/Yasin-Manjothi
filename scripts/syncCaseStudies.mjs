import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

// Run from portfolio-web/ root. Parent directory contains 06_case_studies.
const ROOT_DIR = path.join(process.cwd(), '..');
const CASE_STUDIES_DIR = path.join(ROOT_DIR, '06_case_studies');
const PUBLIC_DIR = path.join(process.cwd(), 'public', 'case-studies');
const DATA_OUTPUT_PATH = path.join(process.cwd(), 'src', 'data', 'caseStudies.json');

// Wipe and recreate the destination dir each run so removed/renamed
// articles don't leave orphaned image copies behind.
if (fs.existsSync(PUBLIC_DIR)) {
  fs.rmSync(PUBLIC_DIR, { recursive: true, force: true });
}
fs.mkdirSync(PUBLIC_DIR, { recursive: true });
fs.mkdirSync(path.dirname(DATA_OUTPUT_PATH), { recursive: true });

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg)$/i;

function copyImage(slug, sourceDir, filename) {
  if (!filename) return null;
  const sourcePath = path.join(sourceDir, filename);
  if (!fs.existsSync(sourcePath)) return null;

  const destDir = path.join(PUBLIC_DIR, slug);
  fs.mkdirSync(destDir, { recursive: true });
  const destPath = path.join(destDir, filename);
  fs.copyFileSync(sourcePath, destPath);
  return `/case-studies/${slug}/${filename}`;
}

// Rewrite ![alt](filename.ext) references (local files only — leaves
// http(s) URLs untouched) to point at the copied public path.
function resolveInlineImages(slug, articleDir, body) {
  const imagesDir = path.join(articleDir, 'images');
  return body.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    if (/^https?:\/\//i.test(src) || src.startsWith('/')) return match;
    if (!IMAGE_EXT.test(src)) return match;
    const publicPath = copyImage(slug, imagesDir, src);
    return publicPath ? `![${alt}](${publicPath})` : match;
  });
}

if (!fs.existsSync(CASE_STUDIES_DIR)) {
  fs.writeFileSync(DATA_OUTPUT_PATH, '[]');
  console.log('No 06_case_studies directory found — wrote empty caseStudies.json');
  process.exit(0);
}

const slugs = fs.readdirSync(CASE_STUDIES_DIR).filter((f) => !f.startsWith('.'));

const articles = [];

slugs.forEach((slug) => {
  const articleDir = path.join(CASE_STUDIES_DIR, slug);
  if (!fs.statSync(articleDir).isDirectory()) return;

  const detailsPath = path.join(articleDir, 'details.md');
  if (!fs.existsSync(detailsPath)) return;

  const raw = fs.readFileSync(detailsPath, 'utf8');
  const { data, content } = matter(raw);

  const coverPath = copyImage(slug, path.join(articleDir, '01_hero'), data.cover);
  const bodyWithResolvedImages = resolveInlineImages(slug, articleDir, content);
  const bodyHtml = marked.parse(bodyWithResolvedImages);

  const tags = typeof data.tags === 'string'
    ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : Array.isArray(data.tags) ? data.tags : [];

  const links = Array.isArray(data.links)
    ? data.links.filter((l) => l && l.url).map((l) => ({
        label: l.label || l.url,
        url: l.url,
        screenshot: l.screenshot
          ? copyImage(slug, path.join(articleDir, 'images'), l.screenshot)
          : null,
      }))
    : [];

  articles.push({
    slug,
    title: data.title || slug,
    date: data.date || '',
    summary: data.summary || '',
    tags,
    cover: coverPath,
    links,
    bodyHtml,
  });
});

// Newest first.
articles.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

fs.writeFileSync(DATA_OUTPUT_PATH, JSON.stringify(articles, null, 2));
console.log(`Successfully synced ${articles.length} case ${articles.length === 1 ? 'study' : 'studies'}!`);
