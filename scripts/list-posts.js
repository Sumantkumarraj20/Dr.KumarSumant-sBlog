const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

function isDir(p) {
  try { return fs.statSync(p).isDirectory(); } catch { return false; }
}

function listPosts() {
  const results = [];
  if (!isDir(POSTS_DIR)) return results;
  const langs = fs.readdirSync(POSTS_DIR).filter(d => isDir(path.join(POSTS_DIR, d)));
  for (const lng of langs) {
    const langDir = path.join(POSTS_DIR, lng);
    const categories = fs.readdirSync(langDir).filter(d => isDir(path.join(langDir, d)));
    for (const cat of categories) {
      const dir = path.join(langDir, cat);
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'));
      for (const file of files) {
        const full = path.join(dir, file);
        let raw = '';
        try { raw = fs.readFileSync(full, 'utf8'); } catch(e) { continue; }
        let fm = {};
        try { fm = matter(raw).data || {}; } catch(e) { fm = {}; }
        const slug = typeof fm.slug === 'string' ? fm.slug : file.replace(/\.mdx$/, '');
        results.push(`/${lng}/${cat}/${slug}  (file: ${path.relative(process.cwd(), full)})`);
      }
    }
  }
  return results;
}

const posts = listPosts();
console.log(`Found ${posts.length} posts:`);
for (const p of posts) console.log(p);
