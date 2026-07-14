import { esc, inr, picture, artPicture, carousel, certBand, marquee, productCard, trustStrip, faqSection, testimonials, CATEGORIES, icon, whatsappHref } from './partials.js';

// ctx = { site, products, siteImages, gallery, certs }
export function homePage(ctx) {
  const { site, products, siteImages, gallery, certs } = ctx;
  const cats = [...new Set(products.map((p) => p.category))];

  return `
  <section class="hero">
    <div class="hero-bg">
      ${artPicture(siteImages.heroWide, siteImages.heroTall, { alt: '' })}
    </div>
    <i class="deco deco-chilli deco-1" aria-hidden="true"></i>
    <i class="deco deco-leaf deco-2" aria-hidden="true"></i>
    <div class="wrap hero-inner">
      <div class="hero-copy">
        <p class="hero-kicker">From Kerala, with smoke</p>
        <h1>Smoked the <span class="brush">old&nbsp;way</span>.<br>Made with <span class="rotator" data-words="tradition,smoke,spice,love,memories">tradition</span>.</h1>
        <p class="hero-sub">Idiyirachi, meat cheenth and homemade pickles — dried, smoked and pounded the way it's always been done in Malabar. Shipped anywhere in India.</p>
        <div class="hero-actions">
          <a class="btn btn-primary btn-lg" href="#shop">Shop the range</a>
          <a class="btn btn-ghost btn-lg" href="${whatsappHref(site, 'Hi! I have a question about your products.')}" target="_blank" rel="noopener">Ask us on WhatsApp</a>
        </div>
        <ul class="hero-pips">
          <li>Wood-smoked</li>
          <li>Small batch</li>
          <li>No preservatives</li>
        </ul>
      </div>
      <div class="hero-figure">
        <div class="smoke hero-smoke" aria-hidden="true"><i></i><i></i><i></i></div>
        ${picture(siteImages.heroFigure, { alt: 'Jars of idiyirachi and meat cheenth beside plates of the food', sizes: '(min-width: 900px) 440px, 100px' })}
        <p class="hero-tag"><strong>${inr(products[0].variants[0].price)}</strong> <span>${esc(products[0].variants[0].label)} jar</span></p>
      </div>
    </div>
    <a class="hero-cue" href="#shop" aria-label="Skip to the products">${icon('chevronDown')}</a>
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

  ${marquee(site.marquee)}

  <section class="section kitchen" id="kitchen">
    <div class="wrap">
      <h2 class="reveal">From our kitchen</h2>
      <p class="section-sub reveal">Swipe through — this is the food, not a stock photo.</p>
    </div>
    <div class="wrap kitchen-carousel reveal">
      ${carousel(gallery, { label: 'Photos from our kitchen', auto: true })}
    </div>
  </section>

  <section class="quote-band">
    <div class="quote-bg" aria-hidden="true">
      ${picture(siteImages.quote, { alt: '', sizes: '100vw' })}
    </div>
    <div class="wrap narrow quote-inner">
      <blockquote class="reveal">${esc(site.quote.text)}</blockquote>
      <p class="quote-by reveal">${esc(site.quote.attribution)}</p>
    </div>
  </section>

  <section class="section usage" id="usage">
    <div class="wrap usage-grid">
      <div class="usage-media reveal">
        ${picture(siteImages.usage, { alt: 'A spoonful of idiyirachi going over hot rice', sizes: '(min-width: 900px) 460px, 90vw', cls: 'usage-shot' })}
        ${picture(siteImages.spread, { alt: 'Idiyirachi on a banana leaf sadya', sizes: '(min-width: 900px) 240px, 45vw', cls: 'usage-inset' })}
      </div>
      <div class="usage-copy reveal">
        <h2>${esc(site.usage.heading)}</h2>
        <p class="section-sub">${esc(site.usage.sub)}</p>
        <ol class="usage-list">
          ${site.usage.ideas.map((i) => `<li>
            <h3>${esc(i.title)}</h3>
            <p>${esc(i.text)}</p>
          </li>`).join('\n          ')}
        </ol>
      </div>
    </div>
  </section>

  <section class="section story" id="story">
    <i class="deco deco-leaf deco-4" aria-hidden="true"></i>
    <i class="deco deco-chilli deco-5" aria-hidden="true"></i>
    <div class="wrap story-grid">
      <div class="story-media reveal">
        ${picture(siteImages.story, { alt: 'A bowl of freshly made meat cheenth', sizes: '(min-width: 900px) 480px, 90vw' })}
      </div>
      <div class="story-copy reveal">
        <h2>${esc(site.story.heading)}</h2>
        ${site.story.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n        ')}
        <p class="story-cert">FSSAI licensed · ${esc(site.iso)} certified kitchen</p>
      </div>
    </div>
  </section>

  ${certBand(certs, site)}

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
