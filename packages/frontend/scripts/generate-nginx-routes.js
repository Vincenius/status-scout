import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pagesDir = path.join(__dirname, '../src/pages');
const nginxConfPath = path.join(__dirname, '../nginx.conf');

function getRoutes(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries
    .filter(e => !e.name.startsWith('_') && !e.name.startsWith('.'))
    .map(e => {
      let name = e.name;
      if (e.isDirectory()) return `/${name}`;
      // Remove extension for files
      name = name.replace(/\.[^/.]+$/, '');
      if (name === 'index') return '/';
      return `/${name}`;
    });
}

function generateLocationBlocks(routes) {
  return routes
    .filter(r => r !== '/404' && r !== '/') // skip 404 page and index
    .map(route => 
      `  location = ${route} {\n    try_files $uri $uri/ /index.html;\n  }`
    ).join('\n');
}

const routes = getRoutes(pagesDir);
console.log('DBG', routes)
const locationBlocks = generateLocationBlocks(routes);
console.log('Generated location blocks:\n', locationBlocks);

let conf = fs.readFileSync(nginxConfPath, 'utf8');
conf = conf.replace(/#\s*\{\{\s*frontend_routes\s*\}\}/, locationBlocks);

fs.writeFileSync(nginxConfPath, conf);
console.log('nginx.conf updated with frontend routes.');
