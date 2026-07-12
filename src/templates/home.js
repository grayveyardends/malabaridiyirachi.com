import { esc, inr, picture, productCard, trustStrip, faqSection, testimonials, CATEGORIES, whatsappHref } from './partials.js';

// ctx = { site, products, siteImages }
export function homePage(ctx) {
  const { site, products, siteImages } = ctx;
  const cats = [...new Set(products.map((p) => p.category))];

  return `
  <section class="hero">
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <p class="hero-kicker">From Kerala, with smoke</p>
        <h1>Smoked the old way.<br>Loved the same way.</h1>
        <p class="hero-sub">Idiyirachi, meat cheenth and homemade pickles — dried, smoked and pounded the way it's always been done in Malabar. Shipped anywhere in India.</p>
        <div class="hero-actions">
          <a class="btn btn-primary btn-lg" href="#shop">Shop the range</a>
          <a class="btn btn-ghost btn-lg" href="${whatsappHref(site, 'Hi! I have a question about your products.')}" target="_blank" rel="noopener">Ask us on WhatsApp</a>
        </div>
      </div>
      <div class="hero-media">
        ${picture(siteImages.hero, { alt: 'A plate of Malabar idiyirachi', sizes: '(min-width: 900px) 520px, 85vw', lazy: false })}
      </div>
    </div>
  </section>

  ${trustStrip(site)}

  <section class="section shop" id="shop">
    <div class="wrap">
      <h2 class="reveal">The products</h2>
      <p class="section-sub reveal">Everything is made in small batches and packed by hand.</p>
      <div class="filter-row reveal" role="group" aria-label="Filter products">
        <button class="pill is-active" type="button" data-filter="all">All</button>
        ${cats.map((c) => `<button class="pill" type="button" data-filter="${c}">${esc(CATEGORIES[c])}</button>`).join('\n        ')}
      </div>
      <div class="grid" data-product-grid>
        ${products.map((p) => productCard(p)).join('\n')}
      </div>
    </div>
  </section>

  <section class="section story" id="story">
    <div class="wrap story-grid">
      <div class="story-media reveal">
        ${picture(siteImages.storyPlate, { alt: 'Idiyirachi served with curry leaves, ginger and lime', sizes: '(min-width: 900px) 480px, 90vw' })}
      </div>
      <div class="story-copy reveal">
        <h2>${esc(site.story.heading)}</h2>
        ${site.story.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n        ')}
        <p class="story-cert">FSSAI licensed · ${esc(site.iso)} certified kitchen</p>
      </div>
    </div>
  </section>

  ${testimonials(site.testimonials)}

  <section class="section delivery">
    <div class="wrap">
      <h2 class="reveal">Delivery, simply put</h2>
      <div class="delivery-grid">
        <div class="delivery-card reveal">
          <h3>Within Kerala</h3>
          <p><strong>${inr(site.shipping.keralaFlat)} flat</strong>, delivered in ${site.shipping.keralaDays}.</p>
        </div>
        <div class="delivery-card reveal">
          <h3>Rest of India</h3>
          <p>We check the courier rate for your pincode and <strong>confirm it on WhatsApp before you pay</strong>. Usually ${site.shipping.indiaDays}.</p>
        </div>
      </div>
    </div>
  </section>

  ${faqSection(site.faq)}
`;
}
