const KEY = 'bh_cart';

const read = () => {
  try {
    const raw = localStorage.getItem(KEY);
    const cart = raw ? JSON.parse(raw) : [];
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
};

const write = (cart) => {
  localStorage.setItem(KEY, JSON.stringify(cart));
};

const addToCart = (product, qty = 1) => {
  if (!product || product.id == null) return;

  const cart = read();
  const item = cart.find(x => x.id === product.id);

  if (item) {
    item.quantity = (item.quantity || 1) + qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      quantity: qty
    });
  }

  write(cart);
};

window.BHCart = { addToCart, getCart: read, saveCart: write };

