import { esc, inr, picture, productCard, badgeChips, CATEGORIES, icon } from './partials.js';

// ctx = { site, products }, p = the enriched product
export function productPage(ctx, p) {
  const { products } = ctx;
  const multi = p.variants.length > 1;
  const first = p.variants[0];

  const related = [
    ...products.filter((x) => x.slug !== p.slug && x.category === p.category),
    ...products.filter((x) => x.slug !== p.slug && x.category !== p.category)
  ].slice(0, 3);

  const thumbs = p.images.length > 1
    ? `<div class="gallery-thumbs" role="group" aria-label="More photos">
        ${p.images.map((img, i) => `<button type="button" class="gallery-thumb${i === 0 ? ' is-active' : ''}" data-thumb data-base="${img.base}" data-fallback="${img.fallback}" data-width="${img.width}" data-height="${img.height}" aria-label="Photo ${i + 1}">
          <img src="${img.base}-400.webp" width="${img.width}" height="${img.height}" alt="" loading="lazy">
        </button>`).join('\n        ')}
      </div>`
    : '';

  return `
  <div class="wrap">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Home</a> › <a href="/#shop">${esc(CATEGORIES[p.category])}</a> › <span aria-current="page">${esc(p.name)}</span>
    </nav>

    <section class="product-layout">
      <div class="gallery">
        <div class="gallery-main" data-gallery-main>
          ${picture(p.images[0], { alt: p.name, sizes: '(min-width: 900px) 520px, 92vw', lazy: false })}
        </div>
        ${thumbs}
      </div>

      <div class="product-info">
        <h1>${esc(p.name)}</h1>
        <p class="product-tagline">${esc(p.tagline)}</p>
        <p class="product-price"><span data-price>${inr(first.price)}</span></p>

        ${multi ? `<div class="variant-row" role="radiogroup" aria-label="Size">
          ${p.variants.map((v, i) => `<button type="button" class="variant-btn${i === 0 ? ' is-active' : ''}" data-variant-btn data-variant="${v.id}" data-price="${v.price}" role="radio" aria-checked="${i === 0}">${esc(v.label)}<small>${inr(v.price)}</small></button>`).join('\n          ')}
        </div>` : `<p class="variant-single">Size: ${esc(first.label)}</p>`}

        <div class="buy-row">
          <div class="qty" aria-label="Quantity">
            <button type="button" data-qty-minus aria-label="One less">−</button>
            <output data-qty>1</output>
            <button type="button" data-qty-plus aria-label="One more">+</button>
          </div>
          <button type="button" class="btn btn-primary btn-lg" data-product-add data-slug="${p.slug}">Add to cart</button>
        </div>
        <button type="button" class="btn btn-wa btn-block" data-buy-now data-slug="${p.slug}">${icon('whatsapp')} Buy now on WhatsApp</button>

        ${badgeChips(p.badges)}

        <div class="product-desc">
          ${p.description.map((d) => `<p>${esc(d)}</p>`).join('\n          ')}
        </div>

        <table class="specs">
          <tbody>
            <tr><th>Ingredients</th><td>${esc(p.ingredients)}</td></tr>
            <tr><th>Shelf life</th><td>${esc(p.shelfLife)}</td></tr>
            <tr><th>Serves</th><td>${esc(p.serves)}</td></tr>
            <tr><th>Sizes</th><td>${p.variants.map((v) => `${esc(v.label)} — ${inr(v.price)}`).join(' · ')}</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="section related">
      <h2 class="reveal">You might also like</h2>
      <div class="grid grid-3">
        ${related.map((r) => productCard(r)).join('\n')}
      </div>
    </section>
  </div>
`;
}
