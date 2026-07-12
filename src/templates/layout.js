import { esc, icon, whatsappHref } from './partials.js';

// Full HTML document shell shared by every page.
// opts = { site, title, description, path, ogImage, jsonLd, noindex,
//          bodyClass, content, scripts, catalog }
export function layout(opts) {
  const {
    site, title, description, path, ogImage, jsonLd = [],
    noindex = false, bodyClass = '', content, scripts = [], catalog
  } = opts;

  const url = site.domain + path;
  const ga = site.gaId
    ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${site.gaId}"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${site.gaId}');</script>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script>document.documentElement.classList.add('js')</script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  ${noindex ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow">'}
  <link rel="canonical" href="${url}">
  <meta name="theme-color" content="#2C1E14">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(site.name)}">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${site.domain}${ogImage}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${site.domain}${ogImage}">

  <link rel="icon" type="image/png" sizes="32x32" href="/images/site/favicon-32.png">
  <link rel="apple-touch-icon" href="/images/site/apple-touch-icon.png">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/styles.css">
  ${jsonLd.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n  ')}
  ${ga}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
  <a class="skip-link" href="#main">Skip to content</a>

  <div class="announce">₹70 flat shipping across Kerala&ensp;·&ensp;Ships all over India</div>

  <header class="site-header">
    <div class="wrap header-row">
      <a class="brand" href="/">
        <img src="/images/site/logo.png" alt="" width="45" height="36">
        <span>${esc(site.name)}</span>
      </a>
      <nav class="site-nav" id="siteNav" aria-label="Main">
        <a href="/#shop">Shop</a>
        <a href="/#story">Our Story</a>
        <a href="/#faq">FAQ</a>
        <a href="/#contact">Contact</a>
      </nav>
      <div class="header-actions">
        <button class="cart-btn" type="button" data-open-cart aria-label="Open cart">
          ${icon('cart')}
          <span class="cart-badge" data-cart-badge hidden>0</span>
        </button>
        <button class="menu-btn" type="button" data-menu-toggle aria-expanded="false" aria-controls="siteNav" aria-label="Menu">
          ${icon('menu')}
        </button>
      </div>
    </div>
  </header>

  <main id="main">
${content}
  </main>

  <footer class="site-footer" id="contact">
    <div class="wrap footer-grid">
      <div class="footer-brand">
        <p class="footer-logo">${esc(site.name)}</p>
        <p>Smoked meats and pickles, made at home in Kerala and shipped all over India.</p>
        <p class="footer-cert">${site.fssai ? `FSSAI Lic. No. ${esc(site.fssai)}<br>` : ''}${esc(site.iso)} certified</p>
      </div>
      <nav class="footer-links" aria-label="Products">
        <p class="footer-head">Shop</p>
        ${opts.productLinks || ''}
      </nav>
      <div class="footer-contact">
        <p class="footer-head">Find us</p>
        <p>${esc(site.address.line1)},<br>${esc(site.address.line2)},<br>${esc(site.address.city)}, ${esc(site.address.state)}${site.address.pincode ? ` – ${esc(site.address.pincode)}` : ''}</p>
        <p><a href="${site.mapsUrl}" target="_blank" rel="noopener">Open in Google Maps</a></p>
        <p><a href="${whatsappHref(site, 'Hi! I have a question about your products.')}" target="_blank" rel="noopener">WhatsApp: ${esc(site.phoneDisplay)}</a></p>
      </div>
    </div>
    <div class="footer-bar"><div class="wrap">© ${new Date().getFullYear()} ${esc(site.name)} · Authentic homemade products</div></div>
  </footer>

  <a class="wa-float" href="${whatsappHref(site, 'Hi! I have a question about your products.')}" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">${icon('whatsapp')}</a>

  <div class="drawer-overlay" data-close-cart hidden></div>
  <aside class="cart-drawer" aria-label="Shopping cart" aria-hidden="true">
    <div class="drawer-head">
      <h2>Your cart</h2>
      <button type="button" class="drawer-close" data-close-cart aria-label="Close cart">${icon('close')}</button>
    </div>
    <ul class="drawer-items" data-cart-items></ul>
    <p class="drawer-empty" data-cart-empty>Your cart is empty.<br><a href="/#shop">Browse the products →</a></p>
    <div class="drawer-foot" data-cart-foot hidden>
      <div class="drawer-subtotal"><span>Subtotal</span><strong data-cart-subtotal></strong></div>
      <p class="drawer-note">Shipping is added at checkout.</p>
      <a class="btn btn-primary btn-block" href="/checkout/">Go to checkout</a>
    </div>
  </aside>

  <script>window.CATALOG = ${JSON.stringify(catalog)};
  window.CATALOG_META = ${JSON.stringify({ phone: site.phone, keralaFlat: site.shipping.keralaFlat })};</script>
  ${scripts.map((s) => `<script type="module" src="${s}"></script>`).join('\n  ')}
</body>
</html>`;
}
