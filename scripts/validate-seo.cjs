const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const origin = 'https://naukaekonomii.pl';
const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function pagePath(url) {
  const parsed = new URL(url);
  const cleanPath = decodeURIComponent(parsed.pathname);
  return cleanPath === '/'
    ? path.join(root, 'index.html')
    : path.join(root, ...cleanPath.split('/').filter(Boolean), cleanPath.endsWith('/') ? 'index.html' : '');
}

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert(urls.length === 56, `Sitemap ma ${urls.length} adresów zamiast 56.`);
assert(new Set(urls).size === urls.length, 'Sitemap zawiera zduplikowane adresy.');
assert(!urls.some(url => /\/(ranking|odpowiedzi)\/$/.test(url)), 'Sitemap zawiera stronę oznaczoną jako noindex.');

const canonicals = new Map();
for (const url of urls) {
  assert(url.startsWith(`${origin}/`), `Obcy adres w sitemapie: ${url}`);
  const file = pagePath(url);
  assert(fs.existsSync(file), `Brak pliku dla ${url}: ${file}`);
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/i)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  assert(title && title.length >= 25 && title.length <= 100, `Nieprawidłowy title dla ${url}.`);
  assert(description && description.length >= 70 && description.length <= 310, `Nieprawidłowy opis dla ${url}.`);
  assert(canonical === url, `Canonical ${canonical || 'brak'} nie odpowiada ${url}.`);
  assert(/<meta name="robots" content="index,follow/i.test(html), `Strona z sitemapy nie ma index,follow: ${url}`);
  assert(/<h1[\s>]/i.test(html), `Brak H1: ${url}`);
  assert(html.includes(`${origin}/assets/og-nauka-ekonomii.png`), `Brak karty OG: ${url}`);
  assert(/<link rel="icon" type="image\/png" sizes="96x96" href="\/assets\/favicon-96\.png"/i.test(html), `Brak głównej favicony 96x96: ${url}`);
  assert(html.includes('"name": "Nauka Ekonomii"'), `Brak preferowanej nazwy witryny w JSON-LD: ${url}`);
  assert(html.includes('/google-analytics.js'), `Brak konfiguracji Google Analytics: ${url}`);
  assert(html.includes('G-P2YY78KWV0'), `Brak identyfikatora GA4: ${url}`);
  const ldScripts = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  assert(ldScripts.length > 0, `Brak danych uporządkowanych: ${url}`);
  for (const script of ldScripts) {
    try { JSON.parse(script[1]); } catch (error) { errors.push(`Błędny JSON-LD dla ${url}: ${error.message}`); }
  }
  if (canonical) {
    assert(!canonicals.has(canonical), `Powielony canonical: ${canonical}`);
    canonicals.set(canonical, file);
  }
}

for (const route of ['ranking', 'odpowiedzi']) {
  const html = fs.readFileSync(path.join(root, route, 'index.html'), 'utf8');
  assert(/<meta name="robots" content="noindex,follow"/i.test(html), `/${route}/ powinno mieć noindex,follow.`);
}

for (const url of urls.filter(item => /\/(mikroekonomia|makroekonomia|narzedzia)\//.test(item))) {
  const html = fs.readFileSync(pagePath(url), 'utf8');
  const targets = [...html.matchAll(/(?:href|src)="(\/[^"#]+)"/g)].map(match => match[1]);
  for (const target of targets) {
    const pathname = target.split('?')[0];
    const localPath = pathname === '/'
      ? path.join(root, 'index.html')
      : pathname.endsWith('/')
        ? path.join(root, ...pathname.split('/').filter(Boolean), 'index.html')
        : path.join(root, ...pathname.split('/').filter(Boolean));
    assert(fs.existsSync(localPath), `Uszkodzony link ${target} na ${url}.`);
  }
}

const notFound = fs.readFileSync(path.join(root, '404.html'), 'utf8');
assert(/<meta name="robots" content="noindex,follow"/i.test(notFound), '404.html nie ma noindex,follow.');
assert(!/<link rel="canonical"/i.test(notFound), '404.html nie powinien mieć canonical.');
assert(!/<lastmod>/i.test(sitemap), 'Sitemap nie powinna sztucznie nadawać tej samej świeżej daty wszystkim stronom.');

for (const relative of [
  'favicon.ico',
  'assets/favicon-96.png',
  'assets/favicon-192.png',
  'assets/apple-touch-icon.png',
  'assets/logo-square-512.png',
  'assets/og-nauka-ekonomii.png',
  'google-analytics.js',
  'site.webmanifest',
  'seo-content.css',
  'economic-tools.css',
  'economic-tools.js',
  'economic-tools-math.js'
]) assert(fs.existsSync(path.join(root, ...relative.split('/'))), `Brak zasobu: ${relative}`);

try { JSON.parse(fs.readFileSync(path.join(root, 'site.webmanifest'), 'utf8')); }
catch (error) { errors.push(`Nieprawidłowy manifest: ${error.message}`); }

const analytics = fs.readFileSync(path.join(root, 'google-analytics.js'), 'utf8');
assert(analytics.includes("analytics_storage: 'denied'"), 'Google Analytics nie ma bezpieślnego domyślnego stanu zgody.');
assert(analytics.includes("'PL'"), 'Polska nie jest objęta regionalnym stanem zgody.');
assert(analytics.includes("gtag('config', 'G-P2YY78KWV0')"), 'Nieprawidłowy identyfikator Google Analytics.');

if (errors.length) {
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(`SEO OK: ${urls.length} unikalnych adresów, poprawne canonicale, indeksowanie, JSON-LD i zasoby.`);
