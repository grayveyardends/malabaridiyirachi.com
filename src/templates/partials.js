// Shared template helpers. All functions return HTML strings.

export function esc(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function inr(n) {
  return '₹' + n.toLocaleString('en-IN');
}

export const CATEGORIES = {
  'dried-meats': 'Dried Meats',
  'pickles': 'Pickles',
  'veg': 'Veg'
};

// Responsive <picture> for an image processed by build.js.
// img = { base, widths, fallback, width, height }
export function picture(img, { alt = '', sizes = '100vw', lazy = true, cls = '' } = {}) {
  const srcset = img.widths.map((w) => `${img.base}-${w}.webp ${w}w`).join(', ');
  const attrs = [
    `src="${img.fallback}"`,
    `width="${img.width}"`,
    `height="${img.height}"`,
    `alt="${esc(alt)}"`,
    lazy ? 'loading="lazy" decoding="async"' : 'fetchpriority="high"'
  ].join(' ');
  return `<picture${cls ? ` class="${cls}"` : ''}>
    <source type="image/webp" srcset="${srcset}" sizes="${sizes}">
    <img ${attrs}>
  </picture>`;
}

const ICONS = {
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="20" r="1.6"/><circle cx="17" cy="20" r="1.6"/><path d="M3 4h2l2.4 12.2a1 1 0 0 0 1 .8h9.4a1 1 0 0 0 1-.8L20.5 8H6"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.2-.8l.4-.5c.1-.2.1-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.9.9-1.1 2.2-.2 3.7a11.6 11.6 0 0 0 4.5 4.2c1.7.8 2.5.9 3.3.8.6-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2Z"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 8.4-7 10-4-1.6-7-5.5-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/></svg>',
  award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5 7 21l5-2.5L17 21l-1.5-7.5"/></svg>',
  leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20C4 10 10 4 20 4c0 10-6 16-16 16Z"/><path d="M4 20c4-6 8-10 12-12"/></svg>',
  truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 6h13v11h-13z"/><path d="M14.5 10h4l3 3v4h-7"/><circle cx="6" cy="18.5" r="1.8"/><circle cx="17.5" cy="18.5" r="1.8"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
};

export function icon(name) {
  return `<span class="icon">${ICONS[name]}</span>`;
}

export function badgeChips(badges) {
  if (!badges || !badges.length) return '';
  return `<ul class="chips">${badges.map((b) => `<li class="chip${b === 'Bestseller' ? ' chip-gold' : ''}">${esc(b)}</li>`).join('')}</ul>`;
}

// Product card for grids. Whole card links to the product page;
// single-variant products also get a quick add-to-cart button.
export function productCard(p) {
  const from = p.variants.length > 1;
  const minPrice = Math.min(...p.variants.map((v) => v.price));
  const action = from
    ? `<span class="card-cta">Choose size</span>`
    : `<button class="btn-quick-add" type="button" data-add data-slug="${p.slug}" data-variant="${p.variants[0].id}" aria-label="Add ${esc(p.name)} to cart">Add to cart</button>`;
  return `<article class="card reveal" data-category="${p.category}">
    <a class="card-media" href="${p.url}" tabindex="-1" aria-hidden="true">
      ${picture(p.images[0], { alt: p.name, sizes: '(min-width: 900px) 300px, (min-width: 640px) 45vw, 90vw' })}
      ${p.featured ? '<span class="card-flag">Bestseller</span>' : ''}
    </a>
    <div class="card-body">
      <h3 class="card-name"><a href="${p.url}">${esc(p.name)}</a></h3>
      <p class="card-tagline">${esc(p.tagline)}</p>
      <div class="card-foot">
        <span class="card-price">${from ? `<small>from</small> ` : ''}${inr(minPrice)}</span>
        ${action}
      </div>
    </div>
  </article>`;
}

export function trustStrip(site) {
  const items = [
    { ic: 'shield', label: 'FSSAI licensed' },
    { ic: 'award', label: `${site.iso} certified` },
    { ic: 'leaf', label: 'No preservatives' },
    { ic: 'truck', label: 'Ships all over India' }
  ];
  return `<section class="trust" aria-label="Why buy from us">
    <ul class="trust-list">
      ${items.map((i) => `<li>${icon(i.ic)}<span>${esc(i.label)}</span></li>`).join('')}
    </ul>
  </section>`;
}

export function faqSection(faq) {
  return `<section class="section faq" id="faq">
    <div class="wrap narrow">
      <h2 class="reveal">Questions people ask us</h2>
      <div class="faq-list reveal">
        ${faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n')}
      </div>
    </div>
  </section>`;
}

export function testimonials(list) {
  if (!list || !list.length) return '';
  return `<section class="section testimonials">
    <div class="wrap">
      <h2 class="reveal">What customers say</h2>
      <div class="testimonial-grid">
        ${list.map((t) => `<figure class="testimonial reveal"><blockquote>${esc(t.text)}</blockquote><figcaption>— ${esc(t.name)}${t.place ? `, ${esc(t.place)}` : ''}</figcaption></figure>`).join('\n')}
      </div>
    </div>
  </section>`;
}

export function whatsappHref(site, text) {
  return `https://wa.me/${site.phone}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}
