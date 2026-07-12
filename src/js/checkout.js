// Checkout page: cart review, address form, WhatsApp message.

import * as cart from './cart.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ADDRESS_KEY = 'malabarAddress';

const emptyEl = $('[data-checkout-empty]');
const bodyEl = $('[data-checkout-body]');
const itemsEl = $('[data-checkout-items]');
const subEl = $('[data-subtotal]');
const shipEl = $('[data-shipping]');
const totalEl = $('[data-total]');
const form = $('[data-address-form]');

function isKerala(pincode) {
  return /^(67|68|69)\d{4}$/.test(pincode);
}

function shippingFor(pincode) {
  if (/^[1-9]\d{5}$/.test(pincode)) {
    return isKerala(pincode)
      ? { amount: window.CATALOG_META.keralaFlat, label: cart.inr(window.CATALOG_META.keralaFlat) + ' (Kerala)' }
      : { amount: null, label: 'Confirmed on WhatsApp' };
  }
  return { amount: undefined, label: 'Enter pincode below' };
}

function render() {
  const items = cart.items();
  emptyEl.hidden = items.length > 0;
  bodyEl.hidden = items.length === 0;
  if (!items.length) return;

  itemsEl.innerHTML = items
    .map((i) => {
      const p = window.CATALOG[i.slug];
      const v = p.variants.find((x) => x.id === i.variant);
      return `<li class="checkout-item">
        <a href="${p.url}"><img src="${p.thumb}" alt="" width="72" height="90"></a>
        <div class="checkout-item-info">
          <a href="${p.url}">${p.name}</a>
          <span>${v.label} · ${cart.inr(v.price)}</span>
          <div class="qty qty-sm">
            <button type="button" data-line-minus data-slug="${i.slug}" data-variant="${i.variant}" aria-label="One less">−</button>
            <output>${i.qty}</output>
            <button type="button" data-line-plus data-slug="${i.slug}" data-variant="${i.variant}" aria-label="One more">+</button>
          </div>
        </div>
        <div class="checkout-item-side">
          <strong>${cart.inr(v.price * i.qty)}</strong>
          <button type="button" class="line-remove" data-line-remove data-slug="${i.slug}" data-variant="${i.variant}">Remove</button>
        </div>
      </li>`;
    })
    .join('');

  const sub = cart.subtotal();
  const ship = shippingFor(form.pincode.value.trim());
  subEl.textContent = cart.inr(sub);
  shipEl.textContent = ship.label;
  totalEl.textContent = ship.amount != null ? cart.inr(sub + ship.amount) : cart.inr(sub) + ' + shipping';
}

/* line qty buttons are handled by main.js delegation; re-render on change */
cart.onChange(render);

/* ---- address persistence ---- */
function loadAddress() {
  try {
    const saved = JSON.parse(localStorage.getItem(ADDRESS_KEY));
    if (!saved) return;
    ['name', 'phone', 'address', 'pincode', 'notes'].forEach((k) => {
      if (saved[k]) form[k].value = saved[k];
    });
  } catch {
    /* ignore bad data */
  }
}

function saveAddress() {
  const data = {};
  ['name', 'phone', 'address', 'pincode', 'notes'].forEach((k) => (data[k] = form[k].value.trim()));
  try {
    localStorage.setItem(ADDRESS_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

form.addEventListener('input', (e) => {
  saveAddress();
  if (e.target.name === 'pincode') render();
  e.target.closest('label, .phone-wrap')?.classList.remove('is-invalid');
  e.target.closest('.phone-wrap')?.closest('label')?.classList.remove('is-invalid');
});

/* ---- validation + WhatsApp send ---- */
function validate() {
  let ok = true;
  [...form.elements].forEach((el) => {
    if (!el.name || el.type === 'submit') return;
    const label = el.closest('label');
    const bad = el.required && !el.checkValidity();
    if (label) label.classList.toggle('is-invalid', bad);
    if (bad) ok = false;
  });
  return ok;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!cart.items().length) return;
  if (!validate()) {
    form.querySelector('.is-invalid input, .is-invalid textarea')?.focus();
    return;
  }

  const lines = cart.items().map((i) => {
    const p = window.CATALOG[i.slug];
    const v = p.variants.find((x) => x.id === i.variant);
    return `▪️ ${p.name} — ${v.label} × ${i.qty} — ${cart.inr(v.price * i.qty)}`;
  });

  const sub = cart.subtotal();
  const ship = shippingFor(form.pincode.value.trim());
  const totalLine = ship.amount != null
    ? `*Total: ${cart.inr(sub + ship.amount)}*`
    : `*Total: ${cart.inr(sub)} + shipping*`;

  const msg = [
    '🛒 *New order — malabaridiyirachi.com*',
    '',
    ...lines,
    '',
    `Subtotal: ${cart.inr(sub)}`,
    `Shipping: ${ship.label}`,
    totalLine,
    '',
    '📍 *Deliver to*',
    form.name.value.trim(),
    '+91 ' + form.phone.value.trim(),
    form.address.value.trim(),
    'PIN: ' + form.pincode.value.trim(),
    form.notes.value.trim() ? 'Note: ' + form.notes.value.trim() : null
  ]
    .filter((l) => l !== null)
    .join('\n');

  window.location.href = `https://wa.me/${window.CATALOG_META.phone}?text=${encodeURIComponent(msg)}`;
});

loadAddress();
render();
