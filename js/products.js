
const products = [
    { id: 1, name: "Smartphone Pro Max", desc: "256GB, câmera tripla, tela OLED.", price: 4999, category: "smartphones" },
    { id: 2, name: "Smartphone Ultra", desc: "512GB, alto desempenho.", price: 6499, category: "smartphones" },
    { id: 3, name: "Fone Sem Fio Pro", desc: "Cancelamento de ruído ativo.", price: 499, category: "accessories" },
    { id: 4, name: "Carregador Turbo 20W", desc: "Carregamento rápido.", price: 129, category: "accessories" },
    { id: 5, name: "Capa Antichoque", desc: "Proteção reforçada.", price: 79, category: "accessories" },
    { id: 6, name: "Película 3D Premium", desc: "Proteção de tela completa.", price: 59, category: "accessories" },
    { id: 7, name: "Powerbank 10.000mAh", desc: "Bateria extra para o dia todo.", price: 199, category: "accessories" },
    { id: 8, name: "Suporte Veicular", desc: "Fixação magnética forte.", price: 49, category: "accessories" },
    { id: 9, name: "Capinha aderente", desc: "Super aderência em superfícies planas.", price: 100, category: "accessories" },
    { id: 10, name: "Fone com fio", desc: "Microfone imbutido com equalização.", price: 20, category: "accessories" }
];

const productListContainer = document.getElementById('product-list');
const priceRangeInput = document.getElementById('price-range');
const priceDisplaySpan = document.getElementById('price-display');
const categoryButtons = document.querySelectorAll('.category-btn');

let activeCategory = 'all';
let maxPrice = 10000;

const formatCurrency = (value) => value.toLocaleString('pt-BR', { minimumFractionDigits: 0 });

function renderProducts() {

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
        card.setAttribute('data-id', product.id);
        card.className = 'product-card';
        

        card.innerHTML = `
            <div class="product-image"></div>
            <div class="product-details">
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p>${product.desc}</p>
                </div>
                <div class="product-price">R$ ${formatCurrency(product.price)}</div>
            </div>
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

const modal = document.getElementById('product-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalPrice = document.getElementById('modal-price');
const modalBuyBtn = document.getElementById('modal-buy-btn');

productListContainer.addEventListener('click', (event) => {
    const card = event.target.closest('.product-card');
    if (!card) return;

    const productId = parseInt(card.getAttribute('data-id'));
    const selectedProduct = products.find(p => p.id === productId);

    if (selectedProduct) {
        openModal(selectedProduct);
    }
});
function openModal(product) {
    modalTitle.textContent = product.name;
    modalDesc.textContent = product.desc;
    modalPrice.textContent = `R$ ${formatCurrency(product.price)}`;

    const phoneNumber = "5531989166024"; 
    const encodedMessage = encodeURIComponent(`Olá, vi o produto ${product.name} no site da bh celular e gostaria de comprar`);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    modalBuyBtn.setAttribute('href', whatsappUrl);
    
    modal.style.display = 'flex';
}

closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});


window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

renderProducts();