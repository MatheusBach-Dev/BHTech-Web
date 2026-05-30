(function () {

    const productsData = (typeof window.products !== 'undefined')
        ? window.products
        : (typeof products !== 'undefined' ? products : []);

    const formatCurrency = (value) => {
        try {
            return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 0 });
        } catch {
            return String(value);
        }
    };

    const getProductImageSrc = (product) => {
        const src = product?.image;
        if (!src) return '';

        if (src.startsWith("../products-images/")) {
            return `/products-images/${src.replace("../products-images/", "")}`;
        }
        if (src.startsWith("../images/")) {
            return `/images/${src.replace("../images/", "")}`;
        }
        if (src.startsWith("http") || src.startsWith("/")) return src;
        return `/${src}`;
    };

    const getCategoryLabel = (category) => {
        const labels = {
            smartphones: 'Smartphone',
            accessories: 'Acessório'
        };
        return labels[category] || category;
    };

    const renderImg = (src, alt) => {
        const safeSrc = src || '';
        const safeAlt = alt || 'Item';
        return `
            <img class="catalog-item-img" src="${safeSrc}" alt="${safeAlt}" loading="lazy"
                onerror="this.onerror=null; this.src='/images/product-fallback-ai.png';" />
        `;
    };

    const productsTbody = document.getElementById('products-table-body');
    const servicesTbody = document.getElementById('services-table-body');

    if (!productsTbody && !servicesTbody) return;

    const quantityForProduct = (p) => {
        const seed = Number(p?.id || 0) || 0;
        return (seed % 17) + 2;
    };

    const fillProducts = () => {
        if (!productsTbody) return;

        const rows = (productsData || []).map((p) => {
            const category = getCategoryLabel(p.category);
            const price = `R$ ${formatCurrency(p.price)}`;
            const qty = quantityForProduct(p);
            const imgSrc = getProductImageSrc(p);

            return `
                <tr class="catalog-row">
                    <td class="catalog-cell catalog-cat">${category}</td>
                    <td class="catalog-cell catalog-img-cell">${renderImg(imgSrc, p.name)}</td>
                    <td class="catalog-cell catalog-name">${p.name}</td>
                    <td class="catalog-cell catalog-price">${price}</td>
                    <td class="catalog-cell catalog-desc">${p.desc}</td>
                    <td class="catalog-cell catalog-qty">${qty}</td>
                </tr>
            `;
        });

        productsTbody.innerHTML = rows.join('');
    };

    const services = [
        {
            id: 's1',
            name: 'Conserto e Manutenção',
            desc: 'Diagnóstico e reparo para smartphones e acessórios.',
            price: 120,
            category: 'smartphones',
            image: '/images/icon-support.svg',
            quantity: 6
        },
        {
            id: 's2',
            name: 'Instalação de Acessórios',
            desc: 'Películas, capinhas e suporte veicular com instalação simples.',
            price: 35,
            category: 'accessories',
            image: '/images/icon-accessories.svg',
            quantity: 12
        },
        {
            id: 's3',
            name: 'Atualização e Configuração',
            desc: 'Backup, transferência de dados e configuração inicial.',
            price: 90,
            category: 'smartphones',
            image: '/images/icon-smartphones.svg',
            quantity: 8
        },
        {
            id: 's4',
            name: 'Entrega e Retirada',
            desc: 'Agendamento de retirada e entrega com acompanhamento.',
            price: 25,
            category: 'accessories',
            image: '/images/icon-delivery.svg',
            quantity: 20
        }
    ];

    const fillServices = () => {
        if (!servicesTbody) return;

        const rows = services.map((s) => {
            const price = `R$ ${formatCurrency(s.price)}`;
            const qty = Number(s.quantity ?? 0) || 0;

            return `
                <tr class="catalog-row">
                    <td class="catalog-cell catalog-name">${s.name}</td>
                    <td class="catalog-cell catalog-price">${price}</td>
                    <td class="catalog-cell catalog-desc">${s.desc}</td>
                    <td class="catalog-cell catalog-qty">${qty}</td>
                </tr>
            `;
        });

        servicesTbody.innerHTML = rows.join('');
    };

    
    const searchInput = document.getElementById('catalog-search');
    const openFiltersBtn = document.getElementById('open-filters');
    const modalEl = document.getElementById('filters-modal');
    const closeModalEls = document.querySelectorAll('[data-close-modal="true"]');

    const categorySelect = document.getElementById('filter-category');
    const typeSelect = document.getElementById('filter-type');
    const priceRange = document.getElementById('filter-price');
    const priceValue = document.getElementById('filter-price-value');

    const applyBtn = document.getElementById('apply-filters');
    const clearBtn = document.getElementById('clear-filters');

    const allProductsRows = () => Array.from(document.querySelectorAll('#products-table-body .catalog-row'));
    const allServicesRows = () => Array.from(document.querySelectorAll('#services-table-body .catalog-row'));

    const updateTypeAvailability = () => {
        if (!typeSelect || !categorySelect) return;
        const cat = categorySelect.value;
        typeSelect.disabled = cat !== 'products';
        if (typeSelect.disabled) typeSelect.value = 'all';
    };

    const getSearchQuery = () => (searchInput?.value || '').trim().toLowerCase();

    const parsePriceFromText = (row) => {
        const priceEl = row.querySelector('.catalog-price');
        if (!priceEl) return 0;
        const raw = priceEl.textContent.replace('R$', '').trim().replace('.', '').replace(',', '.');
        const num = Number(raw);
        return Number.isFinite(num) ? num : 0;
    };

    const applyFilters = () => {
        const category = categorySelect?.value || 'all';
        const type = typeSelect?.value || 'all';
        const maxPrice = Number(priceRange?.value ?? 1000);
        const q = getSearchQuery();

        if (productsTbody) {
            allProductsRows().forEach((row) => {
                const catLabel = row.querySelector('.catalog-cat')?.textContent?.toLowerCase() || '';
                const name = row.querySelector('.catalog-name')?.textContent?.toLowerCase() || '';
                const desc = row.querySelector('.catalog-desc')?.textContent?.toLowerCase() || '';
                const price = parsePriceFromText(row);

                const matchesCategory = (category === 'all' || category === 'products');
                const matchesType = (type === 'all') ||
                    (type === 'smartphones' && catLabel.includes('smartphone')) ||
                    (type === 'accessories' && (catLabel.includes('acess') || catLabel.includes('acessório')));

                const matchesPrice = price <= maxPrice;
                const matchesSearch = !q || name.includes(q) || desc.includes(q);

                row.style.display = (matchesCategory && matchesType && matchesPrice && matchesSearch) ? '' : 'none';
            });
        }

        if (servicesTbody) {
            allServicesRows().forEach((row) => {
                const name = row.querySelector('.catalog-name')?.textContent?.toLowerCase() || '';
                const desc = row.querySelector('.catalog-desc')?.textContent?.toLowerCase() || '';
                const price = parsePriceFromText(row);

                const matchesCategory = (category === 'all' || category === 'services');
                const matchesSearch = !q || name.includes(q) || desc.includes(q);
                const matchesPrice = price <= maxPrice;

                row.style.display = (matchesCategory && matchesPrice && matchesSearch) ? '' : 'none';
            });
        }
    };

    const openModal = () => {
        if (!modalEl) return;
        modalEl.hidden = false;
        setTimeout(() => {
            const closeBtn = document.querySelector('#filters-modal [data-close-modal="true"]');
            closeBtn?.focus?.();
        }, 0);
    };

    const closeModal = () => {
        if (!modalEl) return;
        modalEl.hidden = true;
    };

    openFiltersBtn?.addEventListener('click', () => {
        updateTypeAvailability();
        openModal();
    });

    closeModalEls.forEach((el) => {
        el.addEventListener('click', () => closeModal());
    });

    modalEl?.addEventListener('click', (e) => {
        if (e.target?.dataset?.closeModal === 'true') closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    categorySelect?.addEventListener('change', () => {
        updateTypeAvailability();
    });

    priceRange?.addEventListener('input', () => {
        if (priceValue) priceValue.textContent = String(priceRange.value);
    });

    applyBtn?.addEventListener('click', () => {
        closeModal();
        applyFilters();
    });

    clearBtn?.addEventListener('click', () => {
        if (categorySelect) categorySelect.value = 'all';
        if (typeSelect) typeSelect.value = 'all';
        if (priceRange) priceRange.value = 10000;
        if (priceValue) priceValue.textContent = '10000';
        updateTypeAvailability();
        if (searchInput) searchInput.value = '';
        applyFilters();
    });

    searchInput?.addEventListener('input', () => {
        applyFilters();
    });

    updateTypeAvailability();
    fillProducts();
    fillServices();
    applyFilters();
})();



