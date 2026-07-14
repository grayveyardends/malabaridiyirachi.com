// Product page: variant selection, quantity stepper, gallery, add / buy now.

import * as cart from './cart.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ---- variant selection ---- */
const addBtn = $('[data-product-add]');
const slug = addBtn.dataset.slug;
const priceEl = $('[data-price]');
const variantBtns = $$('[data-variant-btn]');
let currentVariant = variantBtns.length
  ? variantBtns[0].dataset.variant
  : window.CATALOG[slug].variants[0].id;

variantBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    variantBtns.forEach((b) => {
      const active = b === btn;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-checked', String(active));
    });
    currentVariant = btn.dataset.variant;
    priceEl.textContent = cart.inr(Number(btn.dataset.price));
  });
});

/* ---- quantity stepper ---- */
const qtyOut = $('[data-qty]');
let qty = 1;
$('[data-qty-minus]').addEventListener('click', () => {
  qty = Math.max(1, qty - 1);
  qtyOut.textContent = qty;
});
$('[data-qty-plus]').addEventListener('click', () => {
  qty = Math.min(99, qty + 1);
  qtyOut.textContent = qty;
});

/* ---- add to cart / buy now ---- */
addBtn.addEventListener('click', () => {
  cart.add(slug, currentVariant, qty);
  // main.js opens the drawer on [data-add]; here we open it explicitly.
  document.querySelector('[data-open-cart]').click();
});
$('[data-buy-now]').addEventListener('click', () => {
  cart.add(slug, currentVariant, qty);
  window.location.href = '/checkout/';
});

/* ---- gallery thumbnails ----
   The photos live in a snap-scrolling carousel (see main.js). The thumbs are
   its dots: they scroll it, and follow along when the shopper swipes instead. */
const gallery = $('.gallery[data-carousel]');
const thumbs = $$('[data-thumb]');

thumbs.forEach((thumb) => {
  thumb.addEventListener('click', () => gallery.goToSlide(Number(thumb.dataset.index)));
});

gallery?.addEventListener('slidechange', (e) => {
  thumbs.forEach((t) => t.classList.toggle('is-active', Number(t.dataset.index) === e.detail.index));
});
