// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// --- DATA ---
// Merged from your "Old HTML" for accuracy
const products = [
    {
        id: "chicken-100",
        name: "Chicken Idiyirachi (100g Tin)",
        price: 235,
        image: "images/chicken_idiyirachi_250g_tin.jpg.jpeg", // Note: Swapped img based on old HTML class logic
        desc: "Dried & smoked finest chicken meat. Low fat, high protein.",
        category: "chicken"
    },
    {
        id: "chicken-250",
        name: "Chicken Idiyirachi (250g Tin)",
        price: 585,
        image: "images/chicken_idiyirachi-100g-tin.jpg.jpeg",
        desc: "Serves 13-14 persons. No preservatives. 100% Coconut oil.",
        category: "chicken"
    },
    {
        id: "ivy-gourd",
        name: "Ivy Gourd / Kovakhya Fry (500g)",
        price: 250,
        image: "images/ivy-gourd-fry.jpg.jpeg",
        desc: "Crispy Kovakka fry. Authentic Malabar vegetarian taste.",
        category: "veg"
    },
    {
        id: "meat-100",
        name: "Meat Cheenth (100g Tin)",
        price: 305,
        image: "images/meat_cheenth_100g_tin.jpg.jpeg",
        desc: "Buffalo meat. Bigger & more flavorful than chicken variants.",
        category: "meat"
    },
    {
        id: "meat-250",
        name: "Meat Cheenth (250g Tin)",
        price: 760,
        image: "images/meat_cheenth_250g_tin.jpg.jpeg",
        desc: "Premium Buffalo meat. Serves 13-14. Now in pouches.",
        category: "meat"
    },
    {
        id: "beef-pickle",
        name: "Beef Pickle / Acchaar (500g)",
        price: 700,
        image: "images/beef-pickle-250.jpg.jpeg",
        desc: "Wet roasted with spices & vinegar. Serves 20-22.",
        category: "pickle"
    },
    {
        id: "idiyirachi-100",
        name: "Idiyirachi (100g Tin)",
        price: 280,
        image: "images/idiyirachi_100g_tin.jpg.jpeg",
        desc: "Traditional dried buffalo meat. Robust smoky flavor.",
        category: "meat"
    },
    {
        id: "idiyirachi-250",
        name: "Idiyirachi (250g Tin)",
        price: 700,
        image: "images/idiyirachi_250g_tin.jpg.jpeg",
        desc: "Large pack. Serves 13-14. High protein content.",
        category: "meat"
    },
    {
        id: "fish-pickle",
        name: "Fish Pickle / Acchaar (500g)",
        price: 700,
        image: "images/fish-pickle-250g.jpg.jpeg",
        desc: "Marinated fresh fish fried for a tangy kick.",
        category: "pickle"
    }
];

// --- APP STATE ---
let cart = JSON.parse(localStorage.getItem('malabarCart')) || [];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    renderProducts();
    updateCartDisplay();
    setupEvents();
});

// --- GSAP ANIMATIONS ---
function initLoader() {
    const tl = gsap.timeline({
        onComplete: () => {
            initHeroAnimations();
        }
    });

    tl.to(".loader-text", {
        scale: 1.2,
        duration: 0.8,
        ease: "back.out(1.7)"
    })
    .to(".loader", {
        yPercent: -100,
        duration: 0.8,
        ease: "power4.inOut",
        delay: 0.3
    });
}

function initHeroAnimations() {
    // 1. Text changing animation (Small Chops style)
    const words = ["Tradition", "Quality", "Spices", "Memories"];
    let i = 0;
    
    // Initial reveal
    gsap.from(".hero h1", { y: 50, opacity: 0, duration: 1, ease: "power3.out" });
    gsap.from(".hero-img", { x: 50, opacity: 0, rotation: 10, duration: 1.2, delay: 0.2 });

    // Loop words
    setInterval(() => {
        i = (i + 1) % words.length;
        gsap.to("#changing-text", {
            duration: 0.5,
            opacity: 0,
            y: -20,
            onComplete: function() {
                document.getElementById("changing-text").innerText = words[i];
                gsap.to("#changing-text", { duration: 0.5, opacity: 1, y: 0 });
            }
        });
    }, 3000);

    // 2. Scroll Trigger for Products
    gsap.from(".product-card", {
        scrollTrigger: {
            trigger: ".products-grid",
            start: "top 80%",
        },
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out"
    });
}

// --- RENDERING ---
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = products.map(p => `
        <div class="product-card">
            <div class="p-img-container">
                <img src="${p.image}" alt="${p.name}" loading="lazy">
            </div>
            <div class="p-details">
                <h3>${p.name}</h3>
                <p class="p-desc">${p.desc}</p>
                <div class="p-footer">
                    <span class="price">₹${p.price}</span>
                    <button class="add-btn" onclick="addToCart('${p.id}')">Add +</button>
                </div>
            </div>
        </div>
    `).join('');
}

// --- CART LOGIC ---
function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    saveCart();
    updateCartDisplay();
    
    // Animation for feedback
    const btn = document.getElementById('cart-toggle');
    gsap.fromTo(btn, {scale: 1}, {scale: 1.2, duration: 0.1, yoyo: true, repeat: 1});
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartDisplay();
}

function saveCart() {
    localStorage.setItem('malabarCart', JSON.stringify(cart));
}

function updateCartDisplay() {
    // Update Badge
    const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
    document.getElementById('cart-count').innerText = totalQty;

    // Update List
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total');
    
    let totalPrice = 0;

    if (cart.length === 0) {
        container.innerHTML = `<div class="empty-state" style="text-align:center; padding:2rem; color:#999">Your cart feels light! 🍖</div>`;
    } else {
        container.innerHTML = cart.map(item => {
            const itemTotal = item.price * item.qty;
            totalPrice += itemTotal;
            return `
                <div class="cart-item-row">
                    <div>
                        <strong>${item.name}</strong><br>
                        <small>₹${item.price} x ${item.qty}</small>
                    </div>
                    <div style="text-align:right">
                        <div>₹${itemTotal}</div>
                        <button onclick="removeFromCart('${item.id}')" style="color:red; background:none; border:none; cursor:pointer;">Remove</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    totalEl.innerText = `₹${totalPrice}`;
}

// --- EVENTS ---
function setupEvents() {
    const cartOverlay = document.getElementById('cart-overlay');
    
    // Toggle Cart
    document.getElementById('cart-toggle').addEventListener('click', () => {
        cartOverlay.classList.add('active');
    });

    document.getElementById('close-cart').addEventListener('click', () => {
        cartOverlay.classList.remove('active');
    });

    // Close on clicking outside
    cartOverlay.addEventListener('click', (e) => {
        if (e.target === cartOverlay) {
            cartOverlay.classList.remove('active');
        }
    });

    // WhatsApp Integration
    document.getElementById('whatsapp-checkout').addEventListener('click', () => {
        if (cart.length === 0) {
            alert("Add some delicious meat to your cart first!");
            return;
        }

        const phoneNumber = "919207220042"; // From your old HTML
        let message = "Hello Malabar Idiyirachi! I would like to order:%0a%0a";
        let finalTotal = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.qty;
            finalTotal += itemTotal;
            // Format: Product Name (x2) - ₹Price
            message += `▪️ ${item.name} (x${item.qty}) - ₹${itemTotal}%0a`;
        });

        message += `%0a*Total Amount: ₹${finalTotal}*`;
        message += "%0a%0aPlease confirm my order.";

        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    });
}
