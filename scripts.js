gsap.registerPlugin(ScrollTrigger, TextPlugin);
// hello
// --- DATA ---
const products = [
    { id: "chicken-100", name: "Chicken Idiyirachi (100g Tin)", price: 235, image: "images/chicken_idiyirachi_250g_tin.jpg.jpeg", desc: "Dried & smoked finest chicken meat. Low fat, high protein." },
    { id: "chicken-250", name: "Chicken Idiyirachi (250g Tin)", price: 585, image: "images/chicken_idiyirachi-100g-tin.jpg.jpeg", desc: "Serves 13-14 persons. No preservatives. 100% Coconut oil." },
    { id: "ivy-gourd", name: "Ivy Gourd / Kovakhya Fry (500g)", price: 250, image: "images/ivy-gourd-fry.jpg.jpeg", desc: "Crispy Kovakka fry. Authentic Malabar vegetarian taste." },
    { id: "meat-100", name: "Meat Cheenth (100g Tin)", price: 305, image: "images/meat_cheenth_100g_tin.jpg.jpeg", desc: "Buffalo meat. Bigger & more flavorful than chicken variants." },
    { id: "meat-250", name: "Meat Cheenth (250g Tin)", price: 760, image: "images/meat_cheenth_250g_tin.jpg.jpeg", desc: "Premium Buffalo meat. Serves 13-14. Now in pouches." },
    { id: "beef-pickle", name: "Beef Pickle / Acchaar (500g)", price: 700, image: "images/beef-pickle-250.jpg.jpeg", desc: "Wet roasted with spices & vinegar. Serves 20-22." },
    { id: "idiyirachi-100", name: "Idiyirachi (100g Tin)", price: 280, image: "images/idiyirachi_100g_tin.jpg.jpeg", desc: "Traditional dried buffalo meat. Robust smoky flavor." },
    { id: "idiyirachi-250", name: "Idiyirachi (250g Tin)", price: 700, image: "images/idiyirachi_250g_tin.jpg.jpeg", desc: "Large pack. Serves 13-14. High protein content." },
    { id: "fish-pickle", name: "Fish Pickle / Acchaar (500g)", price: 700, image: "images/fish-pickle-250g.jpg.jpeg", desc: "Marinated fresh fish fried for a tangy kick." }
];

let cart = JSON.parse(localStorage.getItem('malabarCart')) || [];
let currentModalProductId = null;

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    renderProducts();
    updateCartDisplay();
    setupEvents();
    initCarousel();
});

// --- ANIMATIONS ---
function initLoader() {
    const tl = gsap.timeline({ onComplete: initHeroText });
    tl.to(".loader-text", { scale: 1.2, duration: 0.8, ease: "back.out(1.7)" })
      .to(".loader", { yPercent: -100, duration: 0.8, ease: "power4.inOut", delay: 0.3 });
}

function initHeroText() {
    // 1. Text Changing
    const words = ["Tradition", "Quality", "Spices", "Memories"];
    let i = 0;
    setInterval(() => {
        i = (i + 1) % words.length;
        gsap.to("#changing-text", {
            duration: 0.5, opacity: 0, y: -20,
            onComplete: function() {
                document.getElementById("changing-text").innerText = words[i];
                gsap.to("#changing-text", { duration: 0.5, opacity: 1, y: 0 });
            }
        });
    }, 3000);

    // 2. Blob Animation
    gsap.to(".blob", {
        scale: 1.1, rotation: 10, duration: 4, yoyo: true, repeat: -1, ease: "sine.inOut"
    });
}

// --- CAROUSEL ---
function initCarousel() {
    const images = document.querySelectorAll(".hero-img");
    let currentIndex = 0;

    // Set initial state
    gsap.set(images, { opacity: 0, scale: 0.8, rotation: -10 });
    gsap.set(images[0], { opacity: 1, scale: 1, rotation: 0 });

    setInterval(() => {
        const nextIndex = (currentIndex + 1) % images.length;
        
        // Exit current
        gsap.to(images[currentIndex], { opacity: 0, scale: 0.8, rotation: 10, duration: 1 });
        
        // Enter next
        gsap.to(images[nextIndex], { opacity: 1, scale: 1, rotation: 0, duration: 1 });

        currentIndex = nextIndex;
    }, 4000); // Change every 4 seconds
}

// --- PRODUCT GRID ---
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = products.map(p => `
        <div class="product-card" onclick="openProductModal('${p.id}')">
            <div class="p-img-container">
                <img src="${p.image}" alt="${p.name}" loading="lazy">
            </div>
            <h3>${p.name}</h3>
            <p style="color:#666; font-size:0.9rem">Click for details</p>
            <div style="display:flex; justify-content:space-between; margin-top:10px; align-items:center">
                <span class="price">₹${p.price}</span>
                <span style="font-size:1.5rem">👉</span>
            </div>
        </div>
    `).join('');

    // Animate grid items entry
    gsap.from(".product-card", {
        scrollTrigger: { trigger: ".products-grid", start: "top 80%" },
        y: 50, opacity: 0, duration: 0.6, stagger: 0.1
    });
}

// --- FLYING BOX (MODAL) ---
function openProductModal(id) {
    const p = products.find(x => x.id === id);
    if(!p) return;

    currentModalProductId = id;
    
    // Fill Data
    document.getElementById('modal-img').src = p.image;
    document.getElementById('modal-title').innerText = p.name;
    document.getElementById('modal-desc').innerText = p.desc;
    document.getElementById('modal-price').innerText = `₹${p.price}`;

    // Show Overlay
    const overlay = document.getElementById('product-modal');
    overlay.style.display = "flex";

    // Animate Box "Flying" in
    gsap.fromTo(".modal-box", 
        { scale: 0, opacity: 0, rotation: -5 },
        { scale: 1, opacity: 1, rotation: 0, duration: 0.5, ease: "back.out(1.7)" }
    );
}

function closeProductModal() {
    gsap.to(".modal-box", {
        scale: 0, opacity: 0, duration: 0.3, ease: "back.in(1.7)",
        onComplete: () => {
            document.getElementById('product-modal').style.display = "none";
        }
    });
}

// --- CART & SHIPPING LOGIC ---
function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);
    if (existing) { existing.qty++; } else { cart.push({ ...product, qty: 1 }); }
    saveCart();
    updateCartDisplay();
    
    // Feedback Animation
    gsap.fromTo("#cart-toggle", {scale: 1}, {scale: 1.3, duration: 0.1, yoyo: true, repeat: 1});
    
    // Close modal if open
    closeProductModal();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartDisplay();
}

function saveCart() { localStorage.setItem('malabarCart', JSON.stringify(cart)); }

function updateCartDisplay() {
    // 1. Update Count
    const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
    document.getElementById('cart-count').innerText = totalQty;

    // 2. Render Items
    const container = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const shippingNote = document.getElementById('shipping-note');
    const isIntl = document.getElementById('intl-shipping-toggle').checked;

    let subtotal = 0;

    if (cart.length === 0) {
        container.innerHTML = `<div class="empty-state" style="text-align:center; padding:2rem; color:#999">Your cart feels light! 🍖</div>`;
    } else {
        container.innerHTML = cart.map(item => {
            subtotal += item.price * item.qty;
            return `
                <div style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px dashed #eee; padding-bottom:5px;">
                    <div><b>${item.name}</b><br><small>₹${item.price} x ${item.qty}</small></div>
                    <div style="text-align:right">
                        <div>₹${item.price * item.qty}</div>
                        <span onclick="removeFromCart('${item.id}')" style="color:red; cursor:pointer; font-size:0.8rem">Remove</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 3. Calculate Shipping & Total
    let shippingCost = 0;
    let totalText = "";

    if (cart.length > 0) {
        if (isIntl) {
            shippingNote.innerText = "Shipping: Calculated manually after order";
            shippingNote.style.color = "#D9381E";
            totalText = `₹${subtotal} + Shipping (TBD)`;
        } else {
            shippingCost = 70;
            shippingNote.innerText = "Standard  Kerala Shipping: ₹70";
            shippingNote.style.color = "#666";
            totalText = `₹${subtotal + shippingCost}`;
        }
    } else {
        totalText = "₹0";
    }

    subtotalEl.innerText = `₹${subtotal}`;
    totalEl.innerText = totalText;
}

// --- EVENTS ---
function setupEvents() {
    // Modal
    document.getElementById('modal-close-btn').addEventListener('click', closeProductModal);
    document.getElementById('modal-add-btn').addEventListener('click', () => addToCart(currentModalProductId));
    document.getElementById('product-modal').addEventListener('click', (e) => {
        if(e.target.id === 'product-modal') closeProductModal();
    });

    // Cart Toggle
    const cartOverlay = document.getElementById('cart-overlay');
    document.getElementById('cart-toggle').addEventListener('click', () => cartOverlay.classList.add('active'));
    document.getElementById('close-cart').addEventListener('click', () => cartOverlay.classList.remove('active'));
    
    // Shipping Toggle
    document.getElementById('intl-shipping-toggle').addEventListener('change', updateCartDisplay);

    // WhatsApp Checkout
    document.getElementById('whatsapp-checkout').addEventListener('click', () => {
        if (cart.length === 0) return alert("Add items first!");

        const isIntl = document.getElementById('intl-shipping-toggle').checked;
        const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
        const shipping = isIntl ? "To be calculated" : "₹70";
        const total = isIntl ? `₹${subtotal} + Shipping` : `₹${subtotal + 70}`;
        const phoneNumber = "919207220042";

        let msg = "Hello Malabar Idiyirachi! New Order:%0a%0a";
        cart.forEach(item => {
            msg += `▪️ ${item.name} (x${item.qty}) - ₹${item.price * item.qty}%0a`;
        });
        
        msg += `%0aSubtotal: ₹${subtotal}`;
        msg += `%0aShipping: ${shipping} ${isIntl ? '(Outside Kerala)' : '(Kerala Standard)'}`;
        msg += `%0a*Grand Total: ${total}*`;
        msg += "%0a%0aPlease confirm my order.";

        window.open(`https://wa.me/${phoneNumber}?text=${msg}`, '_blank');
    });
}
