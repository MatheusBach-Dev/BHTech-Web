const featuredProducts = [
    {
        id: "smartphone-pro-max",
        title: "Smartphone Pro Max",
        category: "Smartphones",
        description: "256GB, câmera tripla, tela OLED.",
        price: 4999,
        priceLabel: "R$ 4.999",
        installment: "12x sem juros",
        badge: "Mais vendido",
        image: "../imgs/product-pro-max-real.png",
        alt: "Smartphone escuro com conjunto de câmeras e tela roxa.",
        link: "#destaques"
    },
    {
        id: "smartphone-ultra",
        title: "Smartphone Ultra",
        category: "Smartphones",
        description: "512GB, alto desempenho, 5G.",
        price: 6499,
        priceLabel: "R$ 6.499",
        installment: "10x sem juros",
        badge: "Performance",
        image: "../imgs/product-ultra-real.png",
        alt: "Smartphone grafite com tela escura e detalhe amarelo.",
        link: "#destaques"
    },
    {
        id: "fone-sem-fio-pro",
        title: "Fone Sem Fio Pro",
        category: "Acessórios",
        description: "Cancelamento de ruído ativo.",
        price: 499,
        priceLabel: "R$ 499",
        installment: "6x sem juros",
        badge: "Áudio premium",
        image: "../imgs/product-earbuds-real.png",
        alt: "Fones sem fio pretos com estojo aberto.",
        link: "#destaques"
    },
    {
        id: "carregador-turbo-20w",
        title: "Carregador Turbo 20W",
        category: "Acessórios",
        description: "Carregamento rápido e seguro.",
        price: 129,
        priceLabel: "R$ 129",
        installment: "3x sem juros",
        badge: "Carga rápida",
        image: "../imgs/product-charger-real.png",
        alt: "Carregador branco compacto com cabo.",
        link: "#destaques"
    },
    {
        id: "capa-antichoque",
        title: "Capa Antichoque",
        category: "Proteção",
        description: "Proteção reforçada e acabamento premium.",
        price: 79,
        priceLabel: "R$ 79",
        installment: "à vista",
        badge: "Proteção",
        image: "../imgs/product-case-real.png",
        alt: "Capa escura para smartphone com bordas reforçadas.",
        link: "#destaques"
    }
];

function renderFeaturedProducts(products) {
    const container = document.querySelector("#highlight-products");

    if (!container) {
        return;
    }

    container.innerHTML = products.map(product => `
        <article class="section-highlights-card" data-product-id="${product.id}" data-category="${product.category}">
            <a class="section-highlights-card-image-wrap" href="${product.link}" aria-label="Ver ${product.title}">
                <img class="section-highlights-card-image" src="${product.image}" alt="${product.alt}" loading="lazy">
                <span class="section-highlights-card-badge">${product.badge}</span>
            </a>
            <div class="section-highlights-card-body">
                <h3 class="section-highlights-card-title">${product.title}</h3>
                <p class="section-highlights-card-description">${product.description}</p>
                <div class="section-highlights-card-meta">
                    <p class="section-highlights-card-price">${product.priceLabel}</p>
                    <span class="section-highlights-card-installment">${product.installment}</span>
                </div>
            </div>
        </article>
    `).join("");
}

renderFeaturedProducts(featuredProducts);
