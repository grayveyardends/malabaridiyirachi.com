// Client-side cart. Single source of truth is localStorage under `malabarCart`.
// Prices are always resolved from window.CATALOG (injected by the build),
// never trusted from storage.

const KEY = 'malabarCart';

// Product ids used by the old single-page site → { slug, variant }.
const LEGACY_IDS = {
  'chicken-100': ['chicken-idiyirachi', '100g'],
  'chicken-250': ['chicken-idiyirachi', '250g'],
  'meat-100': ['meat-cheenth', '100g'],
  'meat-250': ['meat-cheenth', '250g'],
  'beef-pickle': ['beef-pickle', '500g'],
  'idiyirachi-100': ['idiyirachi', '100g'],
  'idiyirachi-250': ['idiyirachi', '250g'],
  'fish-pickle': ['fish-pickle', '500g']
};

const listeners = [];

function valid(item) {
  const p = window.CATALOG[item.slug];
  return !!(p && p.variants.some((v) => v.id === item.variant) && item.qty > 0);
}

function load() {
  let raw;
  try {
    raw = JSON.parse(localStorage.getItem(KEY));
  } catch {
    raw = null;
  }
  if (Array.isArray(raw)) {
    // Legacy format from the old site: [{ id, qty, ... }]
    const items = raw
      .map((old) => {
        const mapped = LEGACY_IDS[old.id];
        return mapped ? { slug: mapped[0], variant: mapped[1], qty: old.qty || 1 } : null;
      })
      .filter((i) => i && valid(i));
    const cart = { v: 2, items };
    save(cart);
    return cart;
  }
  if (raw && raw.v === 2 && Array.isArray(raw.items)) {
    return { v: 2, items: raw.items.filter(valid) };
  }
  return { v: 2, items: [] };
}

function save(cart) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cart));
  } catch {
    /* storage full or blocked — cart still works for this page */
  }
}

function emit(cart) {
  listeners.forEach((fn) => fn(cart));
}

export function items() {
  return load().items;
}

export function count() {
  return items().reduce((n, i) => n + i.qty, 0);
}

export function priceOf(item) {
  const v = window.CATALOG[item.slug].variants.find((x) => x.id === item.variant);
  return v.price;
}

export function subtotal() {
  return items().reduce((sum, i) => sum + priceOf(i) * i.qty, 0);
}

export function add(slug, variant, qty = 1) {
  const cart = load();
  const found = cart.items.find((i) => i.slug === slug && i.variant === variant);
  if (found) found.qty += qty;
  else cart.items.push({ slug, variant, qty });
  save(cart);
  emit(cart);
}

export function setQty(slug, variant, qty) {
  const cart = load();
  const found = cart.items.find((i) => i.slug === slug && i.variant === variant);
  if (!found) return;
  found.qty = qty;
  if (found.qty <= 0) cart.items = cart.items.filter((i) => i !== found);
  save(cart);
  emit(cart);
}

export function remove(slug, variant) {
  setQty(slug, variant, 0);
}

export function onChange(fn) {
  listeners.push(fn);
}

export function inr(n) {
  return '₹' + n.toLocaleString('en-IN');
}
