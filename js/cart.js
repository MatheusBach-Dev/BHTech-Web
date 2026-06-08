const BH_CART_DEFAULT_KEY = "bh_cart";
let bhCartKey = BH_CART_DEFAULT_KEY;

function getBHCartStorage() {
    try {
        const testKey = "__bh_cart_test__";
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return localStorage;
    } catch {
        return null;
    }
}

function normalizeBHCartImage(product) {
    return String(product.image || product.imageUrl || product.thumbnail || "").trim();
}

function normalizeBHCartItem(product, qty) {
    const image = normalizeBHCartImage(product);
    return {
        id: product.id,
        name: String(product.name || product.title || "").trim(),
        price: Number(product.price || 0),
        image,
        category: String(product.category || "produto").trim(),
        quantity: Math.max(1, Number(qty || 1))
    };
}

function readBHCart() {
    const storage = getBHCartStorage();
    if (!storage) return [];
    try {
        const raw = storage.getItem(bhCartKey);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function writeBHCart(cart) {
    const storage = getBHCartStorage();
    if (!storage) return;
    storage.setItem(bhCartKey, JSON.stringify(Array.isArray(cart) ? cart : []));
}

function addToBHCart(product, qty = 1) {
    const cart = readBHCart();
    const image = normalizeBHCartImage(product);
    const existing = cart.find(i => String(i.id) === String(product.id));

    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push(normalizeBHCartItem(product, qty));
    }

    writeBHCart(cart);

    // Dispara evento para o miniCart.js atualizar
    window.dispatchEvent(new CustomEvent("bhCartUpdated", { detail: { product } }));
}

window.BHCart = {
    addToCart: addToBHCart,
    getCart: readBHCart,
    saveCart: writeBHCart,
    setKey(key) {
        bhCartKey = key || bhCartKey;
    }
};
