import { icon } from './partials.js';

// ctx = { site }
export function checkoutPage(ctx) {
  const { site } = ctx;
  return `
  <div class="wrap narrow checkout">
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a> › <span aria-current="page">Checkout</span></nav>
    <h1>Your order</h1>

    <div data-checkout-empty hidden class="checkout-empty">
      <p>Your cart is empty.</p>
      <a class="btn btn-primary" href="/#shop">Browse the products</a>
    </div>

    <div data-checkout-body>
      <ul class="checkout-items" data-checkout-items></ul>

      <div class="totals">
        <div class="totals-row"><span>Subtotal</span><span data-subtotal></span></div>
        <div class="totals-row"><span>Shipping</span><span data-shipping>Enter pincode below</span></div>
        <div class="totals-row totals-grand"><span>Total</span><strong data-total></strong></div>
      </div>

      <h2>Delivery details</h2>
      <p class="form-hint">We remember these on this device, so next time is faster.</p>
      <form class="address-form" data-address-form novalidate>
        <label>Full name
          <input type="text" name="name" autocomplete="name" required>
          <span class="field-error">Please enter your name.</span>
        </label>
        <label>Phone (WhatsApp)
          <div class="phone-wrap"><span>+91</span>
          <input type="tel" name="phone" inputmode="numeric" autocomplete="tel-national" maxlength="10" pattern="[6-9][0-9]{9}" required></div>
          <span class="field-error">Please enter a valid 10-digit mobile number.</span>
        </label>
        <label>Full address
          <textarea name="address" rows="3" autocomplete="street-address" required placeholder="House / flat, street, area, town"></textarea>
          <span class="field-error">Please enter your delivery address.</span>
        </label>
        <div class="form-row">
          <label>Pincode
            <input type="text" name="pincode" inputmode="numeric" maxlength="6" pattern="[1-9][0-9]{5}" required>
            <span class="field-error">Please enter a valid 6-digit pincode.</span>
          </label>
          <label>Landmark / note <small>(optional)</small>
            <input type="text" name="notes">
          </label>
        </div>

        <button type="submit" class="btn btn-wa btn-lg btn-block">${icon('whatsapp')} Send order on WhatsApp</button>
        <p class="form-note">This opens WhatsApp with your order and address typed out — just press send. Nothing is paid on this site. We confirm your order and share payment details on WhatsApp (${site.phoneDisplay}).</p>
      </form>
    </div>
  </div>
`;
}
