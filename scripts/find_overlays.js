const fs = require('fs');
const path = require('path');

function searchFiles(dir, exts) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    if (item === 'node_modules' || item === 'dist' || item === '.git' || item === 'data') continue;
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(searchFiles(fullPath, exts));
    } else if (exts.some(ext => fullPath.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = searchFiles('.', ['.css', '.jsx', '.html', '.js']);
console.log('Searching files:', files.length);

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    const l = line.toLowerCase();
    if (
      l.includes('overlay') || 
      l.includes('backdrop') || 
      l.includes('overscroll') || 
      l.includes('fixed') || 
      l.includes('rubberband') || 
      l.includes('bounce') ||
      l.includes('overflow-anchor') ||
      l.includes('pointer-events: none') ||
      (l.includes('linear-gradient') && (l.includes('fixed') || l.includes('top') || l.includes('bottom')))
    ) {
      console.log(`${file}:${idx + 1}: ${line.trim().substring(0, 110)}`);
    }
  });
});
