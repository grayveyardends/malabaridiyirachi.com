// Runs on every page: header badge, cart drawer, quick-add buttons,
// category filter, mobile menu, reveal-on-scroll.

import * as cart from './cart.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- rotating headline word (home hero) ---- */
const rotator = $('.rotator');
if (rotator && !reduce) {
  const words = rotator.dataset.words.split(',');
  let i = 0;
  setInterval(() => {
    rotator.classList.add('is-out');
    setTimeout(() => {
      i = (i + 1) % words.length;
      rotator.textContent = words[i];
      rotator.classList.remove('is-out');
      rotator.classList.add('is-in');
      setTimeout(() => rotator.classList.remove('is-in'), 400);
    }, 280);
  }, 2800);
}

/* ---- header badge ---- */
const badge = $('[data-cart-badge]');
let lastCount = null;
function renderBadge() {
  const n = cart.count();
  badge.textContent = n;
  badge.hidden = n === 0;
  if (lastCount !== null && n > lastCount) {
    badge.classList.remove('pop');
    void badge.offsetWidth; // restart the animation
    badge.classList.add('pop');
  }
  lastCount = n;
}

/* ---- cart drawer ---- */
const drawer = $('.cart-drawer');
const overlay = $('.drawer-overlay');
const itemsEl = $('[data-cart-items]');
const emptyEl = $('[data-cart-empty]');
const footEl = $('[data-cart-foot]');

function renderDrawer() {
  const items = cart.items();
  emptyEl.hidden = items.length > 0;
  footEl.hidden = items.length === 0;
  itemsEl.innerHTML = items
    .map((i) => {
      const p = window.CATALOG[i.slug];
      const v = p.variants.find((x) => x.id === i.variant);
      return `<li class="drawer-item">
        <a href="${p.url}"><img src="${p.thumb}" alt="" width="64" height="80"></a>
        <div class="drawer-item-info">
          <a href="${p.url}">${p.name}</a>
          <span class="drawer-item-variant">${v.label}</span>
          <div class="qty qty-sm">
            <button type="button" data-line-minus data-slug="${i.slug}" data-variant="${i.variant}" aria-label="One less">−</button>
            <output>${i.qty}</output>
            <button type="button" data-line-plus data-slug="${i.slug}" data-variant="${i.variant}" aria-label="One more">+</button>
          </div>
        </div>
        <div class="drawer-item-side">
          <strong>${cart.inr(v.price * i.qty)}</strong>
          <button type="button" class="line-remove" data-line-remove data-slug="${i.slug}" data-variant="${i.variant}" aria-label="Remove ${p.name}">Remove</button>
        </div>
      </li>`;
    })
    .join('');
  const sub = $('[data-cart-subtotal]');
  if (sub) sub.textContent = cart.inr(cart.subtotal());
}

function openDrawer() {
  renderDrawer();
  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  overlay.hidden = false;
  document.body.classList.add('no-scroll');
}

function closeDrawer() {
  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  overlay.hidden = true;
  document.body.classList.remove('no-scroll');
}

document.addEventListener('click', (e) => {
  const t = e.target;
  if (t.closest('[data-open-cart]')) openDrawer();
  if (t.closest('[data-close-cart]')) closeDrawer();

  const add = t.closest('[data-add]');
  if (add) {
    cart.add(add.dataset.slug, add.dataset.variant, 1);
    openDrawer();
  }
  const plus = t.closest('[data-line-plus]');
  if (plus) {
    const i = cart.items().find((x) => x.slug === plus.dataset.slug && x.variant === plus.dataset.variant);
    if (i) cart.setQty(i.slug, i.variant, i.qty + 1);
  }
  const minus = t.closest('[data-line-minus]');
  if (minus) {
    const i = cart.items().find((x) => x.slug === minus.dataset.slug && x.variant === minus.dataset.variant);
    if (i) cart.setQty(i.slug, i.variant, i.qty - 1);
  }
  const rm = t.closest('[data-line-remove]');
  if (rm) cart.remove(rm.dataset.slug, rm.dataset.variant);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
});

cart.onChange(() => {
  renderBadge();
  renderDrawer();
});
renderBadge();

/* ---- mobile menu ---- */
const menuBtn = $('[data-menu-toggle]');
const nav = $('#siteNav');
menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  menuBtn.setAttribute('aria-expanded', String(open));
});
nav.addEventListener('click', (e) => {
  if (e.target.matches('a')) {
    nav.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
});

/* ---- category filter pills ---- */
const grid = $('[data-product-grid]');
if (grid) {
  $$('.pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      $$('.pill').forEach((p) => p.classList.toggle('is-active', p === pill));
      const f = pill.dataset.filter;
      $$('[data-category]', grid).forEach((card) => {
        card.hidden = f !== 'all' && card.dataset.category !== f;
      });
    });
  });
}

/* ---- carousels ----
   The track scroll-snaps on its own, so a swipe works with no JS at all.
   This adds the arrows, the dots, and (where asked for) a gentle autoplay
   that stops for good the moment someone touches the carousel themselves. */
$$('[data-carousel]').forEach((root) => {
  const track = $('[data-carousel-track]', root);
  const prev = $('[data-carousel-prev]', root);
  const next = $('[data-carousel-next]', root);
  const dotsBox = $('[data-carousel-dots]', root);
  const slides = [...track.children];
  if (slides.length === 0) return;

  // One slide + one gap. Measured live: it changes at every breakpoint.
  const step = () =>
    slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
  const index = () => Math.round(track.scrollLeft / step());
  const lastIndex = () => {
    // With several slides in view, the final scroll position isn't slides-1.
    const max = track.scrollWidth - track.clientWidth;
    return Math.round(max / step());
  };

  function goTo(i) {
    const target = Math.max(0, Math.min(lastIndex(), i));
    track.scrollTo({ left: target * step(), behavior: reduce ? 'auto' : 'smooth' });
  }

  const dots = dotsBox
    ? slides.slice(0, lastIndex() + 1).map((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', `Go to photo ${i + 1}`);
        b.addEventListener('click', () => goTo(i));
        dotsBox.append(b);
        return b;
      })
    : [];

  function sync() {
    const i = index();
    if (prev) prev.disabled = track.scrollLeft < 8;
    if (next) next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 8;
    dots.forEach((d, di) => d.classList.toggle('is-active', di === i));
    root.dispatchEvent(new CustomEvent('slidechange', { detail: { index: i } }));
  }

  if (prev) prev.addEventListener('click', () => goTo(index() - 1));
  if (next) next.addEventListener('click', () => goTo(index() + 1));

  let scrollTimer;
  track.addEventListener(
    'scroll',
    () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(sync, 90);
    },
    { passive: true }
  );

  root.goToSlide = goTo; // product.js drives the gallery from its thumbnails
  sync();

  /* ---- autoplay ---- */
  if (!root.hasAttribute('data-carousel-auto') || reduce) return;
  let timer = null;
  let stopped = false;
  const pause = () => { clearInterval(timer); timer = null; };
  const play = () => {
    if (!timer && !stopped && !document.hidden) {
      timer = setInterval(() => goTo(index() >= lastIndex() ? 0 : index() + 1), 4500);
    }
  };
  const stop = () => { stopped = true; pause(); }; // they're driving now — get out of the way

  root.addEventListener('pointerenter', pause);
  root.addEventListener('pointerleave', play);
  root.addEventListener('focusin', pause);
  root.addEventListener('pointerdown', stop);
  root.addEventListener('keydown', stop);
  document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));

  // Only run while the gallery is actually on screen.
  new IntersectionObserver(([en]) => (en.isIntersecting ? play() : pause()), { threshold: 0.4 }).observe(root);
});

/* ---- reveal on scroll ---- */
if (reduce) {
  $$('.reveal').forEach((el) => el.classList.add('in-view'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('in-view');
          io.unobserve(en.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px' }
  );
  $$('.reveal').forEach((el) => io.observe(el));
}
