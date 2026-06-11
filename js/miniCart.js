const MINI_CART_MAX = 3;
const CART_KEYS = ['bh_cart','bhcelularCart','bhCelularCart','bh-celular-cart','cart','carrinho','cartItems','shoppingCart'];

function getCart() {
    try {
        for (const key of CART_KEYS) {
            const raw = localStorage.getItem(key);
            if (raw) {
                const parsed = JSON.parse(raw);
                const items = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.items) ? parsed.items : [];
                return items;
            }
        }
    } catch {}
    return [];
}

function removeFromCart(id) {
    const cart = getCart().filter(i => String(i.id) !== String(id));
    // Salva em todas as chaves encontradas no localStorage
    for (const key of CART_KEYS) {
        if (localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify(cart));
            break;
        }
    }
    if (!CART_KEYS.some(k => localStorage.getItem(k))) {
        localStorage.setItem('bh_cart', JSON.stringify(cart));
    }
    updateCartUI();
    renderMiniCart();
}

function getTotalItems() {
    return getCart().reduce((sum, i) => sum + i.quantity, 0);
}

function getTotalPrice() {
    return getCart().reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function formatMiniCartCurrency(value) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function updateCartUI() {
    const badge = document.getElementById("cart-badge");
    if (!badge) return;
    const total = getTotalItems();
    badge.hidden = total === 0;
    badge.textContent = total;
}

function animateCartBtn() {
    const btn = document.getElementById("cart-btn");
    if (!btn) return;
    btn.classList.remove("bounce");
    void btn.offsetWidth;
    btn.classList.add("bounce");
    btn.addEventListener("animationend", () => btn.classList.remove("bounce"), { once: true });
}

function showCartToast(productName) {
    const existing = document.querySelector(".cart-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "cart-toast";
    toast.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
        <span><strong>${productName}</strong> adicionado ao carrinho!</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "toastOut 0.3s ease forwards";
        toast.addEventListener("animationend", () => toast.remove());
    }, 3000);
}

function getProductIcon() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
}

function renderMiniCart() {
    const itemsEl = document.getElementById("mini-cart-items");
    const extraEl = document.getElementById("mini-cart-extra");
    const footerEl = document.getElementById("mini-cart-footer");
    const emptyEl = document.getElementById("mini-cart-empty");
    const totalEl = document.getElementById("mini-cart-total-value");

    if (!itemsEl) return;

    const cart = getCart();

    if (cart.length === 0) {
        itemsEl.innerHTML = "";
        extraEl.hidden = true;
        footerEl.hidden = true;
        emptyEl.classList.add("visivel");
        return;
    }

    emptyEl.classList.remove("visivel");
    footerEl.hidden = false;

    const visible = cart.slice(0, MINI_CART_MAX);
    const hiddenCount = cart.length - MINI_CART_MAX;

    itemsEl.innerHTML = visible.map(item => `
        <div class="mini-cart-item">
            <div class="mini-cart-item-img">
                ${item.image
                    ? `<img src="${item.image}" alt="${item.name}" onerror="this.parentElement.innerHTML='${getProductIcon()}`
                    : getProductIcon()
                }
            </div>
            <div class="mini-cart-item-info">
                <div class="mini-cart-item-name">${item.name}</div>
                <div class="mini-cart-item-price">${formatMiniCartCurrency(item.price)}</div>
                <div class="mini-cart-item-qty">Qtd: ${item.quantity}</div>
            </div>
            <button class="mini-cart-item-remove" data-id="${item.id}" aria-label="Remover">×</button>
        </div>
    `).join("");

    itemsEl.querySelectorAll(".mini-cart-item-remove").forEach(btn => {
        btn.addEventListener("click", () => removeFromCart(btn.dataset.id));
    });

    if (hiddenCount > 0) {
        extraEl.hidden = false;
        extraEl.textContent = `+${hiddenCount} produto${hiddenCount > 1 ? "s" : ""} adicional${hiddenCount > 1 ? "" : ""} no carrinho`;
    } else {
        extraEl.hidden = true;
    }

    totalEl.textContent = formatMiniCartCurrency(getTotalPrice());
}

function toggleMiniCart() {
    const miniCart = document.getElementById("mini-cart");
    const overlay = document.getElementById("mini-cart-overlay");
    if (!miniCart) return;

    const isOpen = !miniCart.hidden;
    if (isOpen) {
        miniCart.hidden = true;
        if (overlay) overlay.classList.remove("ativo");
    } else {
        miniCart.hidden = false;
        if (overlay) overlay.classList.add("ativo");
        renderMiniCart();
    }
}

function closeMiniCart() {
    const miniCart = document.getElementById("mini-cart");
    const overlay = document.getElementById("mini-cart-overlay");
    if (miniCart) miniCart.hidden = true;
    if (overlay) overlay.classList.remove("ativo");
}

function initMiniCart() {
    updateCartUI();

    const cartBtn = document.getElementById("cart-btn");
    const closeBtn = document.getElementById("mini-cart-close");
    const overlay = document.getElementById("mini-cart-overlay");

    if (cartBtn && !cartBtn.dataset.miniCartInit) {
        cartBtn.dataset.miniCartInit = "1";
        cartBtn.addEventListener("click", toggleMiniCart);
    }
    if (closeBtn && !closeBtn.dataset.miniCartInit) {
        closeBtn.dataset.miniCartInit = "1";
        closeBtn.addEventListener("click", closeMiniCart);
    }
    if (overlay && !overlay.dataset.miniCartInit) {
        overlay.dataset.miniCartInit = "1";
        overlay.addEventListener("click", closeMiniCart);
    }
}

window.BHMiniCart = { updateCartUI, showCartToast, animateCartBtn, renderMiniCart };

document.addEventListener("DOMContentLoaded", initMiniCart);
if (document.readyState !== "loading") initMiniCart();

// Escuta evento do cart.js ao adicionar produto
window.addEventListener("bhCartUpdated", (e) => {
    updateCartUI();
    animateCartBtn();
    if (e.detail?.product?.name) showCartToast(e.detail.product.name);
});

// Atualiza badge quando outra aba ou script salva no localStorage
window.addEventListener("storage", (e) => {
    if (CART_KEYS.includes(e.key)) updateCartUI();
});
