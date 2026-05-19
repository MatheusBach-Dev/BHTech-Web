
const products = [
    { id: 1, name: "Smartphone Pro Max", desc: "256GB, câmera tripla, tela OLED.", price: 4999, category: "smartphones" },
    { id: 2, name: "Smartphone Ultra", desc: "512GB, alto desempenho.", price: 6499, category: "smartphones" },
    { id: 3, name: "Fone Sem Fio Pro", desc: "Cancelamento de ruído ativo.", price: 499, category: "accessories" },
    { id: 4, name: "Carregador Turbo 20W", desc: "Carregamento rápido.", price: 129, category: "accessories" },
    { id: 5, name: "Capa Antichoque", desc: "Proteção reforçada.", price: 79, category: "accessories" },
    { id: 6, name: "Película 3D Premium", desc: "Proteção de tela completa.", price: 59, category: "accessories" }
];


const productListContainer = document.getElementById('product-list');
const priceRangeInput = document.getElementById('price-range');
const priceDisplaySpan = document.getElementById('price-display');
const categoryButtons = document.querySelectorAll('.category-btn');


let activeCategory = 'all';
let maxPrice = 10000;

const formatCurrency = (value) => value.toLocaleString('pt-BR', { minimumFractionDigits: 0 });

function renderProducts() {
    productListContainer.innerHTML = ''; 

    const filteredProducts = products.filter(product => {
        const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
        const matchesPrice = product.price <= maxPrice;
        return matchesCategory && matchesPrice;
    });

    if (filteredProducts.length === 0) {
        productListContainer.innerHTML = '<div class="empty-state">Nenhum produto encontrado para estes filtros.</div>';
        return;
    }

    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-details">
                <div class="product-image"></div>
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p>${product.desc}</p>
                </div>
            </div>
            <div class="product-price">R$ ${formatCurrency(product.price)}</div>
        `;
        productListContainer.appendChild(card);
    });
}

priceRangeInput.addEventListener('input', (event) => {
    maxPrice = parseInt(event.target.value);
    priceDisplaySpan.textContent = `R$ ${formatCurrency(maxPrice)}`;
    renderProducts();
});

categoryButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        activeCategory = event.target.getAttribute('data-category');
        renderProducts();
    });
});

renderProducts();