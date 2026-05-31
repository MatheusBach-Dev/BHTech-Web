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
    return String(
        product.image
        || product.imageUrl
        || product.image_url
        || product.thumbnail
        || product.photo
        || product.picture
        || ""
    ).trim();
}

function normalizeBHCartItem(product, qty) {
    const image = normalizeBHCartImage(product);

    return {
        category: product.category,
        id: product.id,
        image,
        imageUrl: image,
        name: product.name,
        price: product.price,
        quantity: qty
    };
}

function readBHCart() {
    const storage = getBHCartStorage();

    if (!storage) {
        return [];
    }

    try {
        const raw = storage.getItem(bhCartKey);
        const cart = raw ? JSON.parse(raw) : [];
        return Array.isArray(cart) ? cart : [];
    } catch {
        return [];
    }
}

function writeBHCart(cart) {
    const storage = getBHCartStorage();

    if (!storage) {
        return;
    }

    storage.setItem(bhCartKey, JSON.stringify(Array.isArray(cart) ? cart : []));
}

function addToBHCart(product, qty = 1) {
    if (!product || product.id == null) {
        return;
    }

    const cart = readBHCart();
    const item = cart.find(cartItem => String(cartItem.id) === String(product.id));
    const image = normalizeBHCartImage(product);

    if (item) {
        item.quantity = Math.max(1, Number(item.quantity || 1)) + qty;

        if (image && !item.image) {
            item.image = image;
            item.imageUrl = image;
        }
    } else {
        cart.push(normalizeBHCartItem(product, qty));
    }

    writeBHCart(cart);
}


window.BHCart = {
    addToCart: addToBHCart,
    getCart: readBHCart,
    saveCart: writeBHCart,
    setKey(key) {
        bhCartKey = key || bhCartKey;
    }
};
