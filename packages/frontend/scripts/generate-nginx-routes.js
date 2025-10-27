import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pagesDir = path.join(__dirname, '../src/pages');
const nginxConfPath = path.join(__dirname, '../nginx.conf');

function getRoutes(dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let routes = [];

  for (const e of entries) {
    if (e.name.startsWith('_') || e.name.startsWith('.')) continue;

    const fullPath = path.join(dir, e.name);

    if (e.isDirectory()) {
      // build new base without leading slash, e.g. 'parent/child'
      const newBase = base ? `${base}/${e.name}` : e.name;
      routes = routes.concat(getRoutes(fullPath, newBase));
      continue;
    }

    // file: remove extension
    const name = e.name.replace(/\.[^/.]+$/, '');

    let route;
    if (name === 'index') {
      route = base ? `/${base}` : '/';
    } else {
      route = `/${base ? `${base}/` : ''}${name}`;
    }

    // Normalize to posix-style slashes
    route = route.replace(/\\+/g, '/');

    if (route.includes('[id]')) {
      for (let i = 1; i <= 5; i++) {
        const dynamicRoute = route.replace('[id]', `${i}`);
        routes.push(dynamicRoute);
      }
    } else {
      routes.push(route);
    }
  }

  // dedupe while preserving order
  return [...new Set(routes)];
}

function generateLocationBlocks(routes) {
  return routes
    .filter(r => r !== '/404' && r !== '/') // skip 404 page and index
    .map(route => `  location = ${route} {\n    try_files $uri $uri/ /index.html;\n  }`)
    .join('\n');
}

const routes = getRoutes(pagesDir);
console.log('Generate routes:', routes)
const locationBlocks = generateLocationBlocks(routes);

let conf = fs.readFileSync(nginxConfPath, 'utf8');
conf = conf.replace(/#\s*\{\{\s*frontend_routes\s*\}\}/, locationBlocks);

fs.writeFileSync(nginxConfPath, conf);
console.log('nginx.conf updated with frontend routes.');
