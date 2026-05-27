const DEFAULT_PRODUCT_IMAGE = "/images/product-fallback-ai.png";
const CLIENT_CONFIG_ENDPOINT = "/api/config/client";
const STORE_EMAIL="lgs239495@gmail.com"
const CART_FALLBACK_KEY="bh_cart"
const CART_STORAGE_KEYS=['bh_cart','bhcelularCart','bhCelularCart','bh-celular-cart','cart','carrinho','cartItems','shoppingCart'];
const EMAILJS_PUBLIC_KEY='n-Rb-rryzLQR-2vwQ';
const EMAILJS_SERVICE_ID='service_7f3g7px';
const EMAILJS_TEMPLATE_ID='template_m3t7u0e';
const EMAILJS_RECEIVER_EMAIL='lgs239495@gmail.com';
const WHATSAPP_ORDER_TO='5531996626094';


const BRAZILIAN_DDDS = new Set([
    "11", "12", "13", "14", "15", "16", "17", "18", "19",
    "21", "22", "24", "27", "28",
    "31", "32", "33", "34", "35", "37", "38",
    "41", "42", "43", "44", "45", "46", "47", "48", "49",
    "51", "53", "54", "55",
    "61", "62", "63", "64", "65", "66", "67", "68", "69",
    "71", "73", "74", "75", "77", "79",
    "81", "82", "83", "84", "85", "86", "87", "88", "89",
    "91", "92", "93", "94", "95", "96", "97", "98", "99"
]);

const COUPONS = {
    BHCELULAR10: { label: "10% de desconto aplicado.", type: "percent", value: 0.1 },
    PRIMEIRA50: { label: "R$ 50,00 de desconto aplicado.", type: "fixed", value: 50 }
};

const cartConfig = {
    cartFallbackKey: CART_FALLBACK_KEY,
    cartKeys: CART_STORAGE_KEYS,
    emailjs: {
        blockHeadless: true,
        limitRate: {
            id: "bh-celular-checkout",
            throttle: 10000
        },
        publicKey: EMAILJS_PUBLIC_KEY,
        receiverEmail: EMAILJS_RECEIVER_EMAIL,
        serviceId: EMAILJS_SERVICE_ID,
        templateId: EMAILJS_TEMPLATE_ID
    },
    productFallbackImage: "",
    storeEmail: STORE_EMAIL,
    whatsappNumber: WHATSAPP_ORDER_TO
};

const cartState = {
    activeCoupon: null,
    cartKey: null,
    emailjsInitialized: false,
    items: []
};

const cartElements = {
    cartCount: document.querySelector("#cart-count"),
    cartItems: document.querySelector("#cart-items"),
    checkoutForm: document.querySelector("#checkout-form"),
    checkoutStatus: document.querySelector("#checkout-status"),
    copyButton: document.querySelector("#copy-order"),
    couponButton: document.querySelector("#apply-coupon"),
    couponInput: document.querySelector("#coupon-input"),
    couponMessage: document.querySelector("#coupon-message"),
    discount: document.querySelector("#discount-value"),
    emptyCart: document.querySelector("#empty-cart"),
    finishButton: document.querySelector("#finish-order"),
    phoneInput: document.querySelector("input[name='customerPhone']"),
    phoneMessage: document.querySelector("#phone-validation-message"),
    pickupDate: document.querySelector("input[name='pickupDate']"),
    pickupPeriod: document.querySelector("select[name='pickupPeriod']"),
    pickupSummary: document.querySelector("#shipping-value"),
    whatsappButton: document.querySelector("#send-whatsapp"),
    subtotal: document.querySelector("#subtotal-value"),
    total: document.querySelector("#total-value")
};

function getStorage() {
    try {
        const testKey = "__bh_storage_test__";
        window.localStorage.setItem(testKey, testKey);
        window.localStorage.removeItem(testKey);
        return window.localStorage;
    } catch {
        return null;
    }
}

function getCartFallbackKey() {
    return cartConfig.cartFallbackKey;
}

function getCartKeys() {
    const keys = cartConfig.cartKeys.length ? cartConfig.cartKeys : [getCartFallbackKey()].filter(Boolean);
    return [...new Set(keys)];
}

function createFallbackId() {
    if (window.crypto?.randomUUID) {
        return window.crypto.randomUUID();
    }

    return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeImageSource(value) {
    const image = String(value || "").trim();
    return image || "";
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getProductImage(item) {
    return normalizeImageSource(item.image) || cartConfig.productFallbackImage;
}

function normalizeCart(data) {
    const source = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.cart)
                ? data.cart
                : [];

    return source
        .map(item => ({
            category: String(item.category ?? "produto").trim(),
            id: item.id ?? item.productId ?? item.sku ?? createFallbackId(),
            image: normalizeImageSource(item.image ?? item.imageUrl ?? item.image_url ?? item.thumbnail ?? item.photo ?? item.picture),
            name: String(item.name ?? item.title ?? "Produto BH Celular").trim(),
            price: Number(item.price ?? item.unitPrice ?? 0),
            quantity: Math.max(1, Number(item.quantity ?? item.qty ?? 1))
        }))
        .filter(item => item.name && Number.isFinite(item.price) && item.price >= 0);
}

function parseCartValue(value) {
    try {
        return normalizeCart(JSON.parse(value));
    } catch {
        return [];
    }
}

function findCartByKnownKeys(storage) {
    for (const key of getCartKeys()) {
        const storedValue = storage.getItem(key);
        const items = storedValue ? parseCartValue(storedValue) : [];

        if (items.length) {
            return { key, items };
        }
    }

    return null;
}

function findCartByShape(storage) {
    for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        const lowerKey = String(key || "").toLowerCase();

        if (!key || lowerKey.includes("lastorder")) {
            continue;
        }

        const items = parseCartValue(storage.getItem(key));

        if (items.some(item => item.name && item.price && item.quantity)) {
            return { key, items };
        }
    }

    return null;
}

function loadCartFromStorage() {
    const storage = getStorage();

    if (!storage) {
        cartState.cartKey = getCartFallbackKey();
        return [];
    }

    const cart = findCartByKnownKeys(storage) || findCartByShape(storage);
    cartState.cartKey = cart?.key || getCartFallbackKey();
    return cart?.items || [];
}

function saveCartToStorage() {
    const storage = getStorage();

    if (!storage) {
        return;
    }

    storage.setItem(cartState.cartKey || getCartFallbackKey(), JSON.stringify(cartState.items));
}

function saveLastOrder(order, contactResult = {}) {
    const storage = getStorage();

    if (!storage) {
        return;
    }

    storage.setItem("bhcelularLastOrder", JSON.stringify({
        createdAt: new Date().toISOString(),
        contact: {
            channel: contactResult.channel || "email",
            receiver: contactResult.receiver || cartConfig.emailjs.receiverEmail,
            status: contactResult.status || null,
            text: contactResult.text || null
        },
        customer: order.checkoutData,
        id: order.orderId,
        items: cartState.items,
        totals: order.totals
    }));
}

function formatCurrency(value) {
    return new Intl.NumberFormat("pt-BR", {
        currency: "BRL",
        style: "currency"
    }).format(value);
}

function formatPickupDate(value) {
    if (!value) {
        return "Não informado";
    }

    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
}

function categoryLabel(category) {
    return category
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, letter => letter.toUpperCase());
}

function itemIcon(category) {
    const normalizedCategory = category.toLowerCase();

    if (normalizedCategory.includes("smart")) {
        return `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="7" y="2" width="10" height="20" rx="2"></rect>
                <path d="M11 18h2"></path>
            </svg>
        `;
    }

    if (normalizedCategory.includes("assist")) {
        return `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m14.7 6.3 3 3"></path>
                <path d="M3 21 14.7 9.3"></path>
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L18 8 15 5Z"></path>
            </svg>
        `;
    }

    return `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
            <path d="M3 6h18"></path>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
    `;
}

function getSubtotal() {
    return cartState.items.reduce((total, item) => total + item.price * item.quantity, 0);
}

function getDiscount(subtotal) {
    if (!cartState.activeCoupon) {
        return 0;
    }

    if (cartState.activeCoupon.type === "percent") {
        return subtotal * cartState.activeCoupon.value;
    }

    if (cartState.activeCoupon.type === "fixed") {
        return Math.min(subtotal, cartState.activeCoupon.value);
    }

    return 0;
}

function getCartTotals() {
    const subtotal = getSubtotal();
    const discount = getDiscount(subtotal);
    const total = Math.max(0, subtotal - discount);

    return { discount, subtotal, total };
}

function getItemCount() {
    return cartState.items.reduce((total, item) => total + item.quantity, 0);
}

function updateSummary() {
    const totals = getCartTotals();
    const itemCount = getItemCount();

    cartElements.cartCount.textContent = `${itemCount} ${itemCount === 1 ? "item" : "itens"}`;
    cartElements.subtotal.textContent = formatCurrency(totals.subtotal);
    cartElements.discount.textContent = `- ${formatCurrency(totals.discount)}`;
    cartElements.pickupSummary.textContent = "Na loja";
    cartElements.total.textContent = formatCurrency(totals.total);
}

/**
 * Monta o conteúdo interno de um card do carrinho.
 * Mantém a estrutura visual separada dos cálculos e eventos.
 */
function createCartItemTemplate(item) {
    const imageSource = getProductImage(item);
    const itemName = escapeHtml(item.name);
    const itemCategory = escapeHtml(categoryLabel(item.category));

    return `
        <div class="item-visual">
            <img class="item-image" src="${escapeHtml(imageSource)}" alt="Imagem de ${itemName}">
        </div>
        <div class="item-info">
            <h3>${itemName}</h3>
            <span class="item-category">${itemCategory}</span>
            <p class="item-price">${formatCurrency(item.price)} cada</p>
        </div>
        <div class="item-actions">
            <div class="qty-control" aria-label="Quantidade de ${itemName}">
                <button type="button" data-action="decrease" aria-label="Diminuir quantidade">-</button>
                <span>${item.quantity}</span>
                <button type="button" data-action="increase" aria-label="Aumentar quantidade">+</button>
            </div>
            <button type="button" class="remove-item" data-action="remove">Remover</button>
        </div>
    `;
}

/**
 * Cria o elemento `<article>` de um produto no carrinho e adiciona na lista.
 */
function renderCartItem(item) {
    const article = document.createElement("article");
    article.className = "cart-item";
    article.dataset.id = item.id;
    article.innerHTML = createCartItemTemplate(item);
    cartElements.cartItems.appendChild(article);
}

function handleCartImageError(event) {
    const image = event.target.closest(".item-image");

    if (!image || image.dataset.fallbackApplied === "true") {
        return;
    }

    image.dataset.fallbackApplied = "true";
    image.src = DEFAULT_PRODUCT_IMAGE;
}

function renderCart() {
    cartElements.cartItems.innerHTML = "";
    cartElements.emptyCart.hidden = cartState.items.length > 0;
    cartState.items.forEach(renderCartItem);
    updateSummary();
}

function setCheckoutStatus(message, type = "") {
    cartElements.checkoutStatus.textContent = message;
    cartElements.checkoutStatus.className = `checkout-status ${type}`.trim();
}

function setCouponMessage(message, type = "") {
    cartElements.couponMessage.textContent = message;
    cartElements.couponMessage.className = `coupon-message ${type}`.trim();
}

function setFieldMessage(element, message, type = "") {
    if (!element) {
        return;
    }

    element.textContent = message;
    element.className = `field-hint ${type}`.trim();
}

function getOnlyDigits(value) {
    return String(value || "").replace(/\D/g, "");
}

function getBrazilianWhatsappDigits(value) {
    const digits = getOnlyDigits(value);
    const withoutCountryCode = digits.startsWith("55") && digits.length > 11
        ? digits.slice(2)
        : digits;

    return withoutCountryCode.slice(0, 11);
}

function formatWhatsappNumber(value) {
    const digits = getBrazilianWhatsappDigits(value);

    if (!digits) {
        return "";
    }

    if (digits.length <= 2) {
        return `(${digits}`;
    }

    const ddd = digits.slice(0, 2);
    const number = digits.slice(2);

    if (number.length <= 5) {
        return `(${ddd}) ${number}`;
    }

    const prefixLength = digits.length > 10 ? 5 : 4;
    return `(${ddd}) ${number.slice(0, prefixLength)}-${number.slice(prefixLength)}`;
}

function isRepeatedDigits(value) {
    return /^(\d)\1+$/.test(value);
}

function validateWhatsappNumber(value) {
    const digits = getBrazilianWhatsappDigits(value);
    const ddd = digits.slice(0, 2);
    const number = digits.slice(2);

    if (!digits) {
        return { message: "Informe seu WhatsApp para a loja confirmar o pedido.", valid: false };
    }

    if (digits.length !== 11) {
        return { message: "Informe DDD + celular com 9 dígitos.", valid: false };
    }

    if (!BRAZILIAN_DDDS.has(ddd)) {
        return { message: "Confira o DDD informado.", valid: false };
    }

    if (!number.startsWith("9")) {
        return { message: "Informe um celular brasileiro válido começando com 9.", valid: false };
    }

    if (isRepeatedDigits(digits) || isRepeatedDigits(number)) {
        return { message: "Confira o número de WhatsApp informado.", valid: false };
    }

    return { message: "WhatsApp com formato válido.", valid: true };
}

function applyWhatsappMask() {
    cartElements.phoneInput.value = formatWhatsappNumber(cartElements.phoneInput.value);
    cartElements.phoneInput.setCustomValidity("");
    setFieldMessage(cartElements.phoneMessage, "Digite DDD + celular, por exemplo: (31) 99999-9999.");
}

function validateWhatsappField() {
    const result = validateWhatsappNumber(cartElements.phoneInput.value);
    cartElements.phoneInput.setCustomValidity(result.valid ? "" : result.message);
    setFieldMessage(cartElements.phoneMessage, result.message, result.valid ? "is-success" : "is-error");
    return result.valid;
}

function isEmailConfigPlaceholder(value) {
    const normalizedValue = String(value || "").trim().toUpperCase();
    return !normalizedValue || normalizedValue.startsWith("SEU_") || normalizedValue.startsWith("YOUR_");
}

function getMissingEmailConfigFields() {
    return [
        ["publicKey", cartConfig.emailjs.publicKey],
        ["templateId", cartConfig.emailjs.templateId],
        ["receiverEmail", cartConfig.emailjs.receiverEmail],
        ["serviceId", cartConfig.emailjs.serviceId]
    ]
        .filter(([, value]) => isEmailConfigPlaceholder(value))
        .map(([field]) => field);
}

function getEmailJsClient() {
    return window.emailjs;
}

function initializeEmailJs() {
    const emailjsClient = getEmailJsClient();

    if (!emailjsClient?.init || !emailjsClient?.send) {
        throw new Error("EMAILJS_SDK_MISSING");
    }

    const missingFields = getMissingEmailConfigFields();

    if (missingFields.length) {
        throw new Error(`EMAILJS_CONFIG_MISSING:${missingFields.join(", ")}`);
    }

    if (!cartState.emailjsInitialized) {
        emailjsClient.init({
            blockHeadless: cartConfig.emailjs.blockHeadless,
            limitRate: cartConfig.emailjs.limitRate,
            publicKey: cartConfig.emailjs.publicKey
        });
        cartState.emailjsInitialized = true;
    }

    return emailjsClient;
}

function getEmailJsErrorMessage(error) {
    const message = String(error?.message || "");

    if (message === "EMAILJS_SDK_MISSING") {
        return "Não foi possível carregar o EmailJS. Confira o script no HTML ou sua conexão.";
    }

    if (message.startsWith("EMAILJS_CONFIG_MISSING")) {
        return "Configure publicKey e templateId do EmailJS em js/cart.js antes de enviar pedidos reais.";
    }

    if (error?.status === 429) {
        return "Muitos envios em pouco tempo. Aguarde alguns segundos e tente novamente.";
    }

    return "Não foi possível enviar o pedido pelo EmailJS agora. Confira as configurações do serviço e tente novamente.";
}

function setFinishButtonLoading(isLoading) {
    cartElements.finishButton.disabled = isLoading;
    cartElements.finishButton.setAttribute("aria-busy", String(isLoading));
}

function applyCoupon() {
    const code = cartElements.couponInput.value.trim().toUpperCase();

    if (!code) {
        cartState.activeCoupon = null;
        setCouponMessage("Digite um cupom para aplicar.");
        updateSummary();
        return;
    }

    if (!COUPONS[code]) {
        cartState.activeCoupon = null;
        setCouponMessage("Cupom não encontrado. Tente BHCELULAR10 ou PRIMEIRA50.", "is-error");
        updateSummary();
        return;
    }

    cartState.activeCoupon = { code, ...COUPONS[code] };
    setCouponMessage(cartState.activeCoupon.label, "is-success");
    updateSummary();
}

function findCartItemByElement(element) {
    const itemElement = element.closest(".cart-item");
    const itemId = itemElement?.dataset.id;
    return cartState.items.find(item => String(item.id) === String(itemId));
}

function updateItemQuantity(item, action) {
    if (action === "increase") {
        item.quantity += 1;
    }

    if (action === "decrease") {
        item.quantity = Math.max(1, item.quantity - 1);
    }
}

function removeItem(item) {
    cartState.items = cartState.items.filter(product => String(product.id) !== String(item.id));
}

function handleCartAction(event) {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const item = findCartItemByElement(button);

    if (!item) {
        return;
    }

    if (button.dataset.action === "remove") {
        removeItem(item);
    } else {
        updateItemQuantity(item, button.dataset.action);
    }

    saveCartToStorage();
    renderCart();
}

function getCheckoutData() {
    const formData = new FormData(cartElements.checkoutForm);

    return {
        customerEmail: String(formData.get("customerEmail") || "").trim(),
        customerName: String(formData.get("customerName") || "").trim(),
        customerNote: String(formData.get("customerNote") || "").trim(),
        customerPhone: String(formData.get("customerPhone") || "").trim(),
        payment: String(formData.get("payment") || "Não informado"),
        pickupDate: String(formData.get("pickupDate") || "").trim(),
        pickupPeriod: String(formData.get("pickupPeriod") || "").trim()
    };
}

function createOrderId() {
    const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
    const timePart = Date.now().toString().slice(-5);
    return `BH-${datePart}-${timePart}`;
}

function createItemLines() {
    return cartState.items.map(item => (
        `- ${item.quantity}x ${item.name} (${categoryLabel(item.category)}) | ${formatCurrency(item.price)} cada | subtotal ${formatCurrency(item.price * item.quantity)}`
    )).join("\n");
}

function createItemsJson() {
    return JSON.stringify(cartState.items.map(item => ({
        category: categoryLabel(item.category),
        id: item.id,
        name: item.name,
        price: item.price,
        priceFormatted: formatCurrency(item.price),
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
        subtotalFormatted: formatCurrency(item.price * item.quantity)
    })), null, 2);
}

function createOrderTemplateParams(order) {
    return {
        cart_key: cartState.cartKey || getCartFallbackKey(),
        coupon_code: cartState.activeCoupon?.code || "Nenhum",
        coupon_description: cartState.activeCoupon?.label || "Nenhum desconto aplicado",
        customer_email: order.checkoutData.customerEmail || "Não informado",
        customer_name: order.checkoutData.customerName,
        customer_note: order.checkoutData.customerNote || "Nenhuma",
        customer_phone: order.checkoutData.customerPhone,
        discount: formatCurrency(order.totals.discount),
        discount_raw: order.totals.discount.toFixed(2),
        from_email: order.checkoutData.customerEmail || "Não informado",
        from_name: order.checkoutData.customerName,
        item_count: String(getItemCount()),
        order_body: order.body,
        order_created_at: order.createdAt,
        order_id: order.orderId,
        order_items: order.itemLines,
        order_items_json: createItemsJson(),
        order_subject: order.subject,
        payment_method: order.checkoutData.payment,
        pickup_date: order.pickupDate,
        pickup_mode: "Retirada na loja",
        pickup_period: order.checkoutData.pickupPeriod || "Não informado",
        product_count: String(cartState.items.length),
        reply_to: order.checkoutData.customerEmail,
        source_page: window.location.href,
        store_email: cartConfig.emailjs.receiverEmail,
        subtotal: formatCurrency(order.totals.subtotal),
        subtotal_raw: order.totals.subtotal.toFixed(2),
        to_email: cartConfig.emailjs.receiverEmail,
        total: formatCurrency(order.totals.total),
        total_raw: order.totals.total.toFixed(2)
    };
}

function createOrderText() {
    const checkoutData = getCheckoutData();
    const totals = getCartTotals();
    const orderId = createOrderId();
    const itemLines = createItemLines();
    const pickupDate = formatPickupDate(checkoutData.pickupDate);
    const createdAt = new Date().toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
    });
    const subject = `Pedido ${orderId} - BH Celular`;
    const body = [
        "Olá, equipe BH Celular.",
        "",
        "Tenho interesse em finalizar este pedido pelo site:",
        "",
        `Pedido: ${orderId}`,
        `Data do envio: ${createdAt}`,
        `Cliente: ${checkoutData.customerName}`,
        `E-mail: ${checkoutData.customerEmail || "Não informado"}`,
        `WhatsApp: ${checkoutData.customerPhone}`,
        "Retirada: Na loja",
        `Dia desejado para retirada: ${pickupDate}`,
        `Período desejado: ${checkoutData.pickupPeriod || "Não informado"}`,
        `Observação para retirada: ${checkoutData.customerNote || "Nenhuma"}`,
        `Pagamento preferido: ${checkoutData.payment}`,
        `Cupom: ${cartState.activeCoupon?.code || "Nenhum"}`,
        "",
        "Produtos:",
        itemLines,
        "",
        `Subtotal: ${formatCurrency(totals.subtotal)}`,
        `Desconto: ${formatCurrency(totals.discount)}`,
        "Retirada: Na loja",
        `Total estimado: ${formatCurrency(totals.total)}`,
        "",
        "Aguardo confirmação de disponibilidade, agendamento da retirada e forma de pagamento."
    ].join("\n");

    const order = {
        body,
        checkoutData,
        createdAt,
        customerEmail: checkoutData.customerEmail,
        itemLines,
        orderId,
        pickupDate,
        subject,
        totals
    };

    return {
        ...order,
        templateParams: createOrderTemplateParams(order)
    };
}

function createWhatsAppMessage(order) {
    return [
        "Olá, BH Celular! Quero finalizar este pedido pelo site.",
        "",
        `*Pedido:* ${order.orderId}`,
        `*Data do envio:* ${order.createdAt}`,
        `*Cliente:* ${order.checkoutData.customerName}`,
        `*E-mail:* ${order.checkoutData.customerEmail || "Não informado"}`,
        `*WhatsApp:* ${order.checkoutData.customerPhone}`,
        "",
        "*Retirada na loja*",
        `Dia desejado: ${order.pickupDate}`,
        `Período: ${order.checkoutData.pickupPeriod || "Não informado"}`,
        `Observação: ${order.checkoutData.customerNote || "Nenhuma"}`,
        `Pagamento preferido: ${order.checkoutData.payment}`,
        `Cupom: ${cartState.activeCoupon?.code || "Nenhum"}`,
        "",
        "*Produtos*",
        order.itemLines,
        "",
        `Subtotal: ${formatCurrency(order.totals.subtotal)}`,
        `Desconto: ${formatCurrency(order.totals.discount)}`,
        `Total estimado: ${formatCurrency(order.totals.total)}`,
        "",
        "Aguardo confirmação de disponibilidade e da retirada."
    ].join("\n");
}

function createWhatsAppUrl(order) {
    return `https://wa.me/${cartConfig.whatsappNumber}?text=${encodeURIComponent(createWhatsAppMessage(order))}`;
}

async function validateCheckout() {
    if (!cartState.items.length) {
        setCheckoutStatus("Adicione produtos ao carrinho antes de finalizar.", "is-error");
        return false;
    }

    const isWhatsappValid = validateWhatsappField();

    if (!isWhatsappValid) {
        cartElements.checkoutForm.reportValidity();
        setCheckoutStatus("Revise o WhatsApp antes de continuar.", "is-error");
        return false;
    }

    if (!cartElements.checkoutForm.checkValidity()) {
        cartElements.checkoutForm.reportValidity();
        setCheckoutStatus("Preencha contato e agendamento da retirada para enviar o pedido.", "is-error");
        return false;
    }

    return true;
}

async function sendOrderWithEmailJs(order) {
    const emailjsClient = initializeEmailJs();

    return emailjsClient.send(
        cartConfig.emailjs.serviceId,
        cartConfig.emailjs.templateId,
        order.templateParams
    );
}

async function finishOrder() {
    if (!await validateCheckout()) {
        return;
    }

    const order = createOrderText();

    setFinishButtonLoading(true);
    setCheckoutStatus("Enviando pedido para a equipe BH Celular...", "");

    try {
        const emailResult = await sendOrderWithEmailJs(order);
        saveLastOrder(order, {
            channel: "email",
            receiver: cartConfig.emailjs.receiverEmail,
            status: emailResult.status,
            text: emailResult.text
        });
        setCheckoutStatus(`Pedido ${order.orderId} enviado para a BH Celular. A equipe fará a confirmação da retirada.`, "is-success");
    } catch (error) {
        setCheckoutStatus(getEmailJsErrorMessage(error), "is-error");
    } finally {
        setFinishButtonLoading(false);
    }
}

async function sendOrderByWhatsApp() {
    if (!await validateCheckout()) {
        return;
    }

    const order = createOrderText();

    saveLastOrder(order, {
        channel: "whatsapp",
        receiver: cartConfig.whatsappNumber,
        status: "opened",
        text: "WhatsApp aberto com resumo do pedido"
    });
    setCheckoutStatus("Abrimos o WhatsApp com o pedido preenchido. Revise e envie para a BH Celular.", "is-success");
    window.open(createWhatsAppUrl(order), "_blank", "noopener,noreferrer");
}

async function copyOrder() {
    if (!await validateCheckout()) {
        return;
    }

    const order = createOrderText();

    try {
        await navigator.clipboard.writeText(order.body);
        setCheckoutStatus("Resumo do pedido copiado para a área de transferência.", "is-success");
    } catch {
        setCheckoutStatus("Não foi possível copiar automaticamente. Use o envio por e-mail.", "is-error");
    }
}

function handleCouponKeydown(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        applyCoupon();
    }
}

function handlePhoneInput() {
    applyWhatsappMask();

    if (getBrazilianWhatsappDigits(cartElements.phoneInput.value).length === 11) {
        validateWhatsappField();
    }
}

function handlePhoneBlur() {
    validateWhatsappField();
}

function setMinimumPickupDate() {
    if (cartElements.pickupDate) {
        cartElements.pickupDate.min = new Date().toISOString().slice(0, 10);
    }
}

function bindCartEvents() {
    cartElements.cartItems.addEventListener("click", handleCartAction);
    cartElements.cartItems.addEventListener("error", handleCartImageError, true);
    cartElements.couponButton.addEventListener("click", applyCoupon);
    cartElements.couponInput.addEventListener("keydown", handleCouponKeydown);
    cartElements.finishButton.addEventListener("click", finishOrder);
    cartElements.phoneInput.addEventListener("blur", handlePhoneBlur);
    cartElements.phoneInput.addEventListener("change", handlePhoneBlur);
    cartElements.phoneInput.addEventListener("input", handlePhoneInput);
    cartElements.whatsappButton.addEventListener("click", sendOrderByWhatsApp);
    cartElements.copyButton.addEventListener("click", copyOrder);
}

async function initCartPage() {
    cartState.items = loadCartFromStorage();
    setMinimumPickupDate();
    applyWhatsappMask();
    bindCartEvents();
    renderCart();
}

initCartPage();
