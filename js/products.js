const products = [
    { id: 1, name: "Smartphone Pro Max", desc: "256GB, câmera tripla, tela OLED.", price: 4999, category: "smartphones", features: ["256GB de armazenamento", "Câmera tripla de 48MP", "Tela OLED de 6.7 polegadas", "Bateria de 4500mAh", "Processador octa-core"] },
    { id: 2, name: "Smartphone Ultra", desc: "512GB, alto desempenho.", price: 6499, category: "smartphones", features: ["512GB de armazenamento", "Câmera quádrupla de 64MP", "Tela Super AMOLED de 6.9 polegadas", "Bateria de 5000mAh", "Processador topo de linha"] },
    { id: 3, name: "Fone Sem Fio Pro", desc: "Cancelamento de ruído ativo.", price: 499, category: "accessories", features: ["Cancelamento de ruído ativo (ANC)", "Bateria de até 30 horas", "Driver de 40mm", "Conexão Bluetooth 5.2", "Carregamento USB-C"] },
    { id: 4, name: "Carregador Turbo 20W", desc: "Carregamento rápido.", price: 129, category: "accessories", features: ["Potência de 20W", "Carregamento rápido PD", "Compatível com múltiplos dispositivos", "Proteção contra sobrecarga", "Cabo USB-C incluído"] },
    { id: 5, name: "Capa Antichoque", desc: "Proteção reforçada.", price: 79, category: "accessories", features: ["Material TPU de alta resistência", "Proteção em todas as pontas", "Suporte para cartão", "Design slim", "Disponível em várias cores"] },
    { id: 6, name: "Película 3D Premium", desc: "Proteção de tela completa.", price: 59, category: "accessories", features: ["Cobertura 3D completa", "Vidro temperado 9H", "Revestimento oleofóbico", "Sensibilidade touchscreen", "Fácil instalação sem bolhas"] },
    { id: 7, name: "Powerbank 10.000mAh", desc: "Bateria extra para o dia todo.", price: 199, category: "accessories", features: ["Capacidade de 10.000mAh", "Carregamento rápido bidirecional", "2 portas USB", "Indicador LED de carga", "Design compacto"] },
    { id: 8, name: "Suporte Veicular", desc: "Fixação magnética forte.", price: 49, category: "accessories", features: ["Ímã super forte", "Rotação 360°", "Compatível com qualquer aparelho", "Fácil instalação", "Não danifica o aparelho"] },
    { id: 9, name: "Capinha aderente", desc: "Super aderência em superfícies planas.", price: 100, category: "accessories", features: ["Material emborrachado antiderrapante", "Design ultrafino", "Proteção contra quedas", "Acesso fácil a todos os botões", "Leve e confortável"] },
    { id: 10, name: "Fone com fio", desc: "Microfone embutido com equalização.", price: 20, category: "accessories", features: ["Driver de 14.2mm", "Microfone embutido", "Cabo de 1.2m", "Conector P2 universal", "Controle de volume"] }
];

const phoneNumber = "5531989166024";

const formatCurrency = (value) => value.toLocaleString('pt-BR', { minimumFractionDigits: 0 });

const getProductIcon = (category, size = 56) => {
    return category === 'smartphones'
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></svg>`;
};

const getCategoryLabel = (category) => {
    const labels = {
        smartphones: 'Smartphone',
        accessories: 'Acessório'
    };
    return labels[category] || category;
};

const isDetailPage = window.location.pathname.includes('products-detail');

const productListContainer = document.getElementById('product-list');
const priceRangeInput = document.getElementById('price-range');
const priceDisplaySpan = document.getElementById('price-display');
const categoryButtons = document.querySelectorAll('.category-btn');
const paginationNumbers = document.getElementById('pagination-numbers');
const arrowNext = document.getElementById('arrow-next');

const PRODUCTS_PER_PAGE = 6;

let activeCategory = 'all';
let maxPrice = 10000;
let currentPage = 1;
let totalPages = 1;

function getFilteredProducts() {
    return products.filter(product => {
        const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
        const matchesPrice = product.price <= maxPrice;
        return matchesCategory && matchesPrice;
    });
}

function getPaginatedProducts(filteredProducts) {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
}

function renderPagination(filteredProducts) {
    totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

    paginationNumbers.innerHTML = '';

    if (totalPages <= 1) {
        arrowNext.style.display = 'none';
        return;
    }

    arrowNext.style.display = 'flex';

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = 'pagination-btn' + (i === currentPage ? ' active-page' : '');
        btn.textContent = i;
        btn.addEventListener('click', () => {
            currentPage = i;
            renderProducts();
        });
        paginationNumbers.appendChild(btn);
    }
}

function renderProducts() {
    const filteredProducts = getFilteredProducts();

    productListContainer.innerHTML = '';

    if (filteredProducts.length === 0) {
        productListContainer.innerHTML = '<div class="empty-state">Nenhum produto encontrado para estes filtros.</div>';
        paginationNumbers.innerHTML = '';
        arrowNext.style.display = 'none';
        return;
    }

    const paginatedProducts = getPaginatedProducts(filteredProducts);

    paginatedProducts.forEach(product => {
        const card = document.createElement('a');
        card.setAttribute('data-id', product.id);
        card.className = 'product-card';
        card.href = `/pages/products-detail.html?id=${product.id}`;

        card.innerHTML = `
            <div class="card-image">${getProductIcon(product.category)}</div>
            <div class="card-info">
                <h4 class="card-name">${product.name}</h4>
                <p class="card-desc">${product.desc}</p>
                <div class="card-price">R$ ${formatCurrency(product.price)}</div>
            </div>
        `;

        productListContainer.appendChild(card);
    });

    renderPagination(filteredProducts);
}

if (productListContainer) {
    priceRangeInput.addEventListener('input', (event) => {
        maxPrice = parseInt(event.target.value);
        priceDisplaySpan.textContent = `R$ ${formatCurrency(maxPrice)}`;
        currentPage = 1;
        renderProducts();
    });

    categoryButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            activeCategory = event.target.getAttribute('data-category');
            currentPage = 1;
            renderProducts();
        });
    });

    arrowNext.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderProducts();
        }
    });

    renderProducts();
}

if (isDetailPage) {
    document.addEventListener('DOMContentLoaded', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id'));
        const product = products.find(p => p.id === productId);

        if (product) {
            document.getElementById('product-name').textContent = product.name;
            document.getElementById('product-desc').textContent = product.desc;
            document.getElementById('product-price').textContent = `R$ ${formatCurrency(product.price)}`;
            document.getElementById('product-category').textContent = getCategoryLabel(product.category);
            document.getElementById('breadcrumb-product').textContent = product.name;
            document.getElementById('product-icon').innerHTML = getProductIcon(product.category, 180);


            const featuresList = document.getElementById('product-features');
            if (product.features && featuresList) {
                featuresList.innerHTML = product.features.map(feature =>
                    `<li>${feature}</li>`
                ).join('');
            }


            const encodedMessage = encodeURIComponent(
            `
            Olá! 

            Vi o produto *${product.name}* no site da BH Celular e tenho interesse em realizar a compra.
            Poderia me passar mais informações sobre disponibilidade, formas de pagamento e prazo de retirada?

            Obrigado!`);
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

            const buyButtonTop = document.getElementById('buy-button');
            if (buyButtonTop) buyButtonTop.setAttribute('href', whatsappUrl);

            const buyButtonBottom = document.getElementById('buy-button-bottom');
            if (buyButtonBottom) buyButtonBottom.setAttribute('href', whatsappUrl);

            const recommendedProducts = document.getElementById('recommended-products');
            if (recommendedProducts) {
                const recommendations = products
                    .filter(p => p.id !== productId)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 4);

                recommendedProducts.innerHTML = recommendations.map(rec => `
                    <a href="/pages/products-detail.html?id=${rec.id}" class="recommended-card">
                        <div class="rec-card-image">${getProductIcon(rec.category)}</div>
                        <div class="rec-card-info">
                            <h4 class="rec-card-name">${rec.name}</h4>
                            <p class="rec-card-desc">${rec.desc}</p>
                            <div class="rec-card-price">R$ ${formatCurrency(rec.price)}</div>
                        </div>
                    </a>
                `).join('');
            }

            document.title = `${product.name} - BH Celular`;

            // Botões no layout (WhatsApp e Carrinho)
            const addToCartBtnTop = document.getElementById('add-to-cart-btn');
            if (addToCartBtnTop) {
                addToCartBtnTop.addEventListener('click', () => {
                    if (!window.BHCart || typeof window.BHCart.addToCart !== 'function') return;
                    window.BHCart.addToCart(product, 1);
                });
            }

            const addToCartBtnBottom = document.getElementById('add-to-cart-btn-bottom');
            if (addToCartBtnBottom) {
                addToCartBtnBottom.addEventListener('click', () => {
                    if (!window.BHCart || typeof window.BHCart.addToCart !== 'function') return;
                    window.BHCart.addToCart(product, 1);
                });
            }
        } else {
            document.querySelector('.detail-container').innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px;">
                    <h2>Produto não encontrado</h2>
                    <p style="margin-top: 10px;">O produto que você procura não existe ou foi removido.</p>
                    <a href="/pages/products.html" class="back-btn" style="display: inline-flex; margin-top: 20px;">Voltar aos Produtos</a>
                </div>
            `;
        }
    });
}