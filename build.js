// Build script: reads src/data/*.json, auto-discovers product images,
// generates optimized images + static pages into dist/.
// Usage: node build.js

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

import { layout } from './src/templates/layout.js';
import { homePage } from './src/templates/home.js';
import { productPage } from './src/templates/product.js';
import { checkoutPage } from './src/templates/checkout.js';
import { notFoundPage } from './src/templates/notfound.js';
import { esc, CATEGORIES } from './src/templates/partials.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const IMG_EXT = /\.(jpe?g|png|webp)$/i;
const WIDTHS = [400, 800, 1200];

function fail(msg) {
  console.error(`\n✗ BUILD FAILED: ${msg}\n`);
  process.exit(1);
}

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    fail(`Could not read ${path.relative(ROOT, p)} — ${e.message}. Check for a missing comma or quote.`);
  }
}

/* ---------- load + validate data ---------- */
const site = readJson(path.join(ROOT, 'src/data/site.json'));
const products = readJson(path.join(ROOT, 'src/data/products.json'));

const seen = new Set();
for (const p of products) {
  if (!p.slug || !/^[a-z0-9-]+$/.test(p.slug)) fail(`Product with bad or missing slug: "${p.slug}". Use lowercase letters, numbers and dashes only.`);
  if (seen.has(p.slug)) fail(`Two products share the slug "${p.slug}". Slugs must be unique.`);
  seen.add(p.slug);
  if (!p.name) fail(`Product "${p.slug}" has no name.`);
  if (!CATEGORIES[p.category]) fail(`Product "${p.slug}" has unknown category "${p.category}". Valid: ${Object.keys(CATEGORIES).join(', ')}.`);
  if (!Array.isArray(p.variants) || p.variants.length === 0) fail(`Product "${p.slug}" needs at least one entry in "variants".`);
  for (const v of p.variants) {
    if (!v.id || !v.label || typeof v.price !== 'number') fail(`Product "${p.slug}": every variant needs "id", "label" and a numeric "price".`);
  }
  const dir = path.join(ROOT, 'images/products', p.slug);
  if (!fs.existsSync(dir)) fail(`Missing image folder images/products/${p.slug}/ — create it and add at least one photo.`);
  const files = fs.readdirSync(dir).filter((f) => IMG_EXT.test(f)).sort();
  if (files.length === 0) fail(`images/products/${p.slug}/ has no photos. Add at least one .jpg or .png.`);
  p.sourceImages = files.map((f) => path.join(dir, f));
}
products.sort((a, b) => (a.sort ?? 99) - (b.sort ?? 99));

/* ---------- helpers ---------- */
function outPath(rel) {
  const p = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  return p;
}

// Process one source image into responsive outputs.
// Returns { base, widths, fallback, width, height } with dist-absolute URLs.
async function processImage(srcFile, destDir, { fallbackExt = 'jpg', og = false } = {}) {
  const base = path.basename(srcFile).replace(IMG_EXT, '');
  const img = sharp(srcFile).rotate();
  const meta = await img.metadata();
  const urlBase = `${destDir}/${base}`;

  const jobs = [];
  const widths = [];
  for (const w of WIDTHS) {
    widths.push(w);
    jobs.push(
      img.clone().resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(outPath(`${urlBase}-${w}.webp`))
    );
  }

  const fallback = `${urlBase}-800.${fallbackExt}`;
  const fbImg = img.clone().resize({ width: 800, withoutEnlargement: true });
  jobs.push(
    fallbackExt === 'png'
      ? fbImg.png({ quality: 85 }).toFile(outPath(fallback))
      : fbImg.flatten({ background: '#ffffff' }).jpeg({ quality: 82 }).toFile(outPath(fallback))
  );

  if (og) {
    jobs.push(
      img.clone().resize({ width: 1200, withoutEnlargement: true })
        .flatten({ background: '#FBF5EA' })
        .jpeg({ quality: 82 })
        .toFile(outPath(`${urlBase}-og.jpg`))
    );
  }

  await Promise.all(jobs);

  // Scale stored dimensions to the 800px fallback's box so the
  // <img width/height> ratio matches what is actually shown.
  const ratio = meta.height / meta.width;
  const w = Math.min(800, meta.width);
  return {
    base: '/' + urlBase,
    widths,
    fallback: '/' + fallback,
    width: w,
    height: Math.round(w * ratio),
    og: og ? `/${urlBase}-og.jpg` : null
  };
}

/* ---------- build ---------- */
console.log('Building malabaridiyirachi.com …');
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

/* product images */
for (const p of products) {
  p.images = [];
  for (let i = 0; i < p.sourceImages.length; i++) {
    p.images.push(
      await processImage(p.sourceImages[i], `images/products/${p.slug}`, { og: i === 0 })
    );
  }
  p.url = `/products/${p.slug}/`;
}

/* site images */
const siteImages = {
  hero: await processImage('images/site/hero.png', 'images/site', { fallbackExt: 'png' }),
  storyPlate: await processImage('images/site/story-plate.png', 'images/site', { fallbackExt: 'png' })
};

/* home OG image: hero on bark background, 1200x630 */
await sharp('images/site/hero.png')
  .resize(1200, 630, { fit: 'contain', background: '#2C1E14' })
  .flatten({ background: '#2C1E14' })
  .jpeg({ quality: 82 })
  .toFile(outPath('images/site/home-og.jpg'));

/* logo + favicons */
fs.copyFileSync('images/site/logo.png', outPath('images/site/logo.png'));
await sharp('images/site/logo.png').resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(outPath('images/site/favicon-32.png'));
await sharp('images/site/logo.png').resize(160, 160, { fit: 'contain', background: '#FBF5EA' }).extend({ top: 10, bottom: 10, left: 10, right: 10, background: '#FBF5EA' }).flatten({ background: '#FBF5EA' }).png().toFile(outPath('images/site/apple-touch-icon.png'));

/* catalog injected into every page for the client-side cart */
const catalog = {};
for (const p of products) {
  catalog[p.slug] = {
    name: p.name,
    url: p.url,
    thumb: `${p.images[0].base}-400.webp`,
    variants: p.variants.map((v) => ({ id: v.id, label: v.label, price: v.price }))
  };
}

const productLinks = products
  .map((p) => `<a href="${p.url}">${esc(p.name)}</a>`)
  .join('\n        ');

const ctx = { site, products, siteImages };

/* ---------- JSON-LD ---------- */
const businessLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: site.name,
  url: site.domain,
  image: `${site.domain}/images/site/home-og.jpg`,
  telephone: '+' + site.phone,
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${site.address.line1}, ${site.address.line2}`,
    addressLocality: site.address.city,
    addressRegion: site.address.state,
    ...(site.address.pincode ? { postalCode: site.address.pincode } : {}),
    addressCountry: 'IN'
  },
  geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
  ...(site.fssai ? { hasCredential: { '@type': 'EducationalOccupationalCredential', name: `FSSAI License ${site.fssai}` } } : {})
};

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: site.name,
  url: site.domain
};

function productLd(p) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.seoDescription || p.description[0],
    image: p.images.map((i) => site.domain + (i.og || i.fallback)),
    brand: { '@type': 'Brand', name: site.name },
    offers: p.variants.map((v) => ({
      '@type': 'Offer',
      url: site.domain + p.url,
      name: `${p.name} ${v.label}`,
      price: v.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock'
    }))
  };
}

/* ---------- render pages ---------- */
function page(relPath, html) {
  fs.writeFileSync(outPath(relPath), html);
}

page('index.html', layout({
  site, catalog, productLinks,
  title: `${site.name} | Kerala Smoked Meat, Idiyirachi & Pickles`,
  description: 'Authentic Malabar Idiyirachi, Meat Cheenth and homemade pickles — slow-dried, wood-smoked, made in small batches in Kerala and shipped all over India.',
  path: '/',
  ogImage: '/images/site/home-og.jpg',
  jsonLd: [businessLd, websiteLd],
  content: homePage(ctx),
  scripts: ['/js/main.js']
}));

for (const p of products) {
  page(`products/${p.slug}/index.html`, layout({
    site, catalog, productLinks,
    title: `${p.name} — ${site.name}`,
    description: p.seoDescription || p.description[0],
    path: p.url,
    ogImage: p.images[0].og,
    jsonLd: [productLd(p)],
    content: productPage(ctx, p),
    scripts: ['/js/main.js', '/js/product.js']
  }));
}

page('checkout/index.html', layout({
  site, catalog, productLinks,
  title: `Checkout — ${site.name}`,
  description: 'Review your order and send it to us on WhatsApp.',
  path: '/checkout/',
  ogImage: '/images/site/home-og.jpg',
  noindex: true,
  content: checkoutPage(ctx),
  scripts: ['/js/main.js', '/js/checkout.js']
}));

page('404.html', layout({
  site, catalog, productLinks,
  title: `Page not found — ${site.name}`,
  description: 'That page does not exist.',
  path: '/404.html',
  ogImage: '/images/site/home-og.jpg',
  noindex: true,
  content: notFoundPage(),
  scripts: ['/js/main.js']
}));

/* ---------- sitemap + robots + static copies ---------- */
const today = new Date().toISOString().slice(0, 10);
const urls = ['/', ...products.map((p) => p.url)];
page('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${site.domain}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);

page('robots.txt', `User-agent: *
Allow: /
Disallow: /checkout/

Sitemap: ${site.domain}/sitemap.xml
`);

fs.cpSync(path.join(ROOT, 'src/css'), path.join(DIST, 'css'), { recursive: true });
fs.cpSync(path.join(ROOT, 'src/js'), path.join(DIST, 'js'), { recursive: true });
if (fs.existsSync(path.join(ROOT, 'CNAME'))) fs.copyFileSync(path.join(ROOT, 'CNAME'), path.join(DIST, 'CNAME'));

const pageCount = 3 + products.length;
console.log(`✓ Built ${pageCount} pages and ${products.length} product image sets into dist/`);
