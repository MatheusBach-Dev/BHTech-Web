function getLandingHighlights() {
    return (typeof products !== 'undefined' && Array.isArray(products)) ? products : [];
}

function renderHighlights() {
    const container = document.querySelector("#highlight-products");
    if (!container) return;

    const list = getLandingHighlights();

    const highlights = list.slice(0, 5);

    container.innerHTML = highlights
        .map(product => {
            const iconHtml = (typeof getProductIcon === 'function') ? getProductIcon(product.category) : '';
            const priceText = (typeof formatCurrency === 'function')
                ? `R$ ${formatCurrency(product.price)}`
                : `R$ ${product.price}`;

            return `
                <a class="product-card" href="/pages/products-detail.html?id=${product.id}" data-id="${product.id}">
                    <div class="card-image">${iconHtml}</div>
                    <div class="card-info">
                        <h4 class="card-name">${product.name}</h4>
                        <p class="card-desc">${product.desc}</p>
                        <div class="card-price">${priceText}</div>
                    </div>
                </a>
            `;
        })
        .join("");
}

renderHighlights();


