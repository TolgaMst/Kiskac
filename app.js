// Kıskaç Cafe & Bar — Menü Sayfası JavaScript

document.addEventListener('DOMContentLoaded', async () => {
    const data = await initializeData();
    let activeCategory = 'all';
    let currentLang = localStorage.getItem('kiskac_lang') || 'tr';

    // ─── FAVORİLER ───
    let favorites = JSON.parse(localStorage.getItem('kiskac_favorites') || '[]');

    function isFavorite(itemId) {
        return favorites.includes(itemId);
    }

    function toggleFavorite(itemId) {
        if (isFavorite(itemId)) {
            favorites = favorites.filter(id => id !== itemId);
        } else {
            favorites.push(itemId);
        }
        localStorage.setItem('kiskac_favorites', JSON.stringify(favorites));
    }

    // ─── SEPET ───
    let cart = JSON.parse(localStorage.getItem('kiskac_cart') || '[]');

    function saveCart() {
        localStorage.setItem('kiskac_cart', JSON.stringify(cart));
        updateCartBadge();
    }

    function addToCart(itemId) {
        const existing = cart.find(c => c.id === itemId);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ id: itemId, qty: 1 });
        }
        saveCart();
    }

    function removeFromCart(itemId) {
        cart = cart.filter(c => c.id !== itemId);
        saveCart();
    }

    function updateCartQty(itemId, delta) {
        const existing = cart.find(c => c.id === itemId);
        if (!existing) return;
        existing.qty += delta;
        if (existing.qty <= 0) {
            removeFromCart(itemId);
        } else {
            saveCart();
        }
    }

    function clearCart() {
        cart = [];
        saveCart();
    }

    function getCartTotal() {
        const menuData = getMenuData();
        let total = 0;
        cart.forEach(c => {
            const item = menuData.items.find(i => i.id === c.id);
            if (item && item.price > 0) {
                total += item.price * c.qty;
            }
        });
        return total;
    }

    function getCartCount() {
        return cart.reduce((sum, c) => sum + c.qty, 0);
    }

    function updateCartBadge() {
        const badge = document.getElementById('cartBadge');
        const floatBtn = document.getElementById('cartFloatBtn');
        const count = getCartCount();
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'flex';
            floatBtn.classList.add('visible');
        } else {
            badge.style.display = 'none';
            floatBtn.classList.remove('visible');
        }
    }

    // ─── ÇEVİRİLER ───
    const translations = {
        tr: {
            open: "Açık",
            closed: "Kapalı",
            viewMenu: "Menüyü Gör",
            all: "Tümü",
            searchPlaceholder: "Ürün ara...",
            emptyMenu: "Menü yakında güncellenecek...",
            rights: "Tüm hakları saklıdır.",
            management: "Yönetim",
            info: "Bilgi",
            businessInfo: "İşletme Bilgileri",
            address: "Adres",
            phone: "Telefon",
            openingHours: "Çalışma Saatleri",
            social: "Sosyal Medya",
            maps: "Haritada Gör",
            whatsapp: "WhatsApp ile Rezervasyon",
            askForPrice: "Fiyat Sorunuz",
            addToCart: "Sepete Ekle",
            added: "Eklendi ✓",
            cart: "Sepetim",
            total: "Toplam",
            sendOrder: "WhatsApp ile Sipariş",
            emptyCart: "Sepetiniz boş",
            clearCart: "Temizle",
            orderMessage: "Merhaba, sipariş vermek istiyorum:",
            tableNumber: "Masa Numarası",
            tableNumberPlaceholder: "Örn: 5",
            tableNumberMsg: "Masa No"
        },
        en: {
            open: "Open",
            closed: "Closed",
            viewMenu: "View Menu",
            all: "All",
            searchPlaceholder: "Search products...",
            emptyMenu: "Menu will be updated soon...",
            rights: "All rights reserved.",
            management: "Admin",
            info: "Info",
            businessInfo: "Business Info",
            address: "Address",
            phone: "Phone",
            openingHours: "Opening Hours",
            social: "Social Media",
            maps: "View on Maps",
            whatsapp: "Reservation via WhatsApp",
            askForPrice: "Ask for Price",
            addToCart: "Add to Cart",
            added: "Added ✓",
            cart: "My Cart",
            total: "Total",
            sendOrder: "Order via WhatsApp",
            emptyCart: "Your cart is empty",
            clearCart: "Clear",
            orderMessage: "Hello, I would like to order:",
            tableNumber: "Table Number",
            tableNumberPlaceholder: "e.g. 5",
            tableNumberMsg: "Table No"
        }
    };

    // ─── SPLASH EKRANI ───
    const splashBtn = document.getElementById('splashBtn');
    const splashScreen = document.getElementById('splashScreen');
    const mainContent = document.getElementById('mainContent');

    // Info Overlay yönetimi
    const infoToggle = document.getElementById('infoToggle');
    const infoOverlay = document.getElementById('infoOverlay');
    const infoClose = document.getElementById('infoClose');

    if (infoToggle) {
        infoToggle.addEventListener('click', () => {
            renderInfoContent(getMenuData());
            infoOverlay.classList.add('active');
        });
    }

    if (infoClose) {
        infoClose.addEventListener('click', () => {
            infoOverlay.classList.remove('active');
        });
    }

    infoOverlay.addEventListener('click', (e) => {
        if (e.target === infoOverlay) {
            infoOverlay.classList.remove('active');
        }
    });

    function renderInfoContent(data) {
        const r = data.restaurant;
        const body = document.getElementById('infoBody');
        if (!body) return;

        let html = '';

        if (r.phone) {
            html += `
                <a href="tel:${r.phone.replace(/\D/g, '')}" class="info-item">
                    <div class="info-icon">📞</div>
                    <div class="info-text">
                        <small>${translations[currentLang].phone}</small>
                        <div>${r.phone}</div>
                    </div>
                </a>
            `;
        }

        if (r.whatsapp) {
            html += `
                <a href="https://wa.me/${r.whatsapp.replace(/\D/g, '')}" class="info-item info-whatsapp">
                    <div class="info-icon">💬</div>
                    <div class="info-text">
                        <strong>${translations[currentLang].whatsapp}</strong>
                    </div>
                </a>
            `;
        }

        if (r.email) {
            html += `
                <a href="mailto:${r.email}" class="info-item">
                    <div class="info-icon">✉️</div>
                    <div class="info-text">
                        <small>Email</small>
                        <div>${r.email}</div>
                    </div>
                </a>
            `;
        }

        if (r.address) {
            html += `
                <div class="info-item">
                    <div class="info-icon">📍</div>
                    <div class="info-text">
                        <small>${translations[currentLang].address}</small>
                        <div>${r.address}</div>
                    </div>
                </div>
            `;
        }

        if (r.mapsLink) {
            html += `
                <a href="${r.mapsLink}" target="_blank" class="info-item">
                    <div class="info-icon">🗺️</div>
                    <div class="info-text">
                        <strong>${translations[currentLang].maps}</strong>
                    </div>
                </a>
            `;
        }

        if (r.openingHours) {
            html += `
                <div class="info-item">
                    <div class="info-icon">🕒</div>
                    <div class="info-text">
                        <small>${translations[currentLang].openingHours}</small>
                        <div>${r.openingHours}</div>
                    </div>
                </div>
            `;
        }

        if (r.instagram || r.facebook) {
            html += `
                <div class="info-item">
                    <div class="info-icon">🌐</div>
                    <div class="info-text">
                        <small>${translations[currentLang].social}</small>
                        <div style="display: flex; gap: 15px; margin-top: 5px;">
                            ${r.instagram ? `<a href="https://instagram.com/${r.instagram}" target="_blank" style="color: var(--text-gold); text-decoration: none;">Instagram</a>` : ''}
                            ${r.facebook ? `<a href="https://facebook.com/${r.facebook}" target="_blank" style="color: var(--text-gold); text-decoration: none;">Facebook</a>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }

        body.innerHTML = html;

        const header = document.querySelector('.info-header h2');
        if (header) header.textContent = translations[currentLang].businessInfo;
    }

    // Restoran bilgilerini güncelle
    updateRestaurantInfo(data);

    // Splash butonu
    if (splashBtn) {
        splashBtn.addEventListener('click', () => {
            splashScreen.classList.add('hide');
            setTimeout(() => {
                splashScreen.style.display = 'none';
                mainContent.classList.add('visible');
                setTimeout(() => {
                    renderCategories(data);
                    renderMenu(data);
                    createBubbles();
                    updateCartBadge();
                }, 300);
            }, 400);
        });
    }

    // Scroll to top
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ─── ARAMA ───
    const searchInput = document.getElementById('menuSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const data = getMenuData();

            if (query.length > 0) {
                document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
                const allTab = document.querySelector('[data-category="all"]');
                if (allTab) allTab.classList.add('active');
                renderMenu(data, 'all', query);
            } else {
                renderMenu(data, 'all');
            }
        });
    }

    function updateRestaurantInfo(data) {
        const r = data.restaurant;
        document.getElementById('splashName').textContent = r.name;
        document.getElementById('splashSlogan').textContent = r.slogan || (currentLang === 'tr' ? 'Denizin En Taze Hali' : 'Freshness from the Sea');

        const statusEl = document.getElementById('splashStatus');
        const statusDot = statusEl.querySelector('.status-dot');
        const statusText = statusEl.querySelector('.status-text');
        if (r.isOpen) {
            statusDot.classList.remove('closed');
            statusText.textContent = translations[currentLang].open;
        } else {
            statusDot.classList.add('closed');
            statusText.textContent = translations[currentLang].closed;
        }

        const splashBtn = document.getElementById('splashBtn');
        if (splashBtn) {
            splashBtn.innerHTML = `${translations[currentLang].viewMenu} <span>→</span>`;
        }

        document.getElementById('navTitle').textContent = r.name;
        const navStatusDot = document.querySelector('.navbar-status .status-dot');
        const navStatusText = document.querySelector('.navbar-status .status-text');
        if (r.isOpen) {
            navStatusDot.classList.remove('closed');
            navStatusText.textContent = translations[currentLang].open;
        } else {
            navStatusDot.classList.add('closed');
            navStatusText.textContent = translations[currentLang].closed;
        }

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === currentLang);
        });

        document.getElementById('footerBrand').textContent = r.name;

        const footerDesc = document.querySelector('.footer-text');
        if (footerDesc) {
            footerDesc.textContent = r.description || translations[currentLang].emptyMenu;
        }

        const footerCopy = document.querySelector('.footer-text[style*="opacity: 0.6"]');
        if (footerCopy) {
            footerCopy.textContent = `© 2026 ${r.name}. ${translations[currentLang].rights}`;
        }

        const adminLink = document.querySelector('.footer-link');
        if (adminLink) {
            adminLink.textContent = translations[currentLang].management;
        }

        const searchInput = document.getElementById('menuSearch');
        if (searchInput) {
            searchInput.placeholder = translations[currentLang].searchPlaceholder;
        }

        const socialContainer = document.getElementById('socialLinks');
        if (socialContainer) {
            let socialHtml = '';
            if (r.phone) {
                socialHtml += `<a href="tel:${r.phone}" class="social-btn" title="Ara">📞</a>`;
                socialHtml += `<a href="https://wa.me/${r.phone.replace(/\D/g, '')}" target="_blank" class="social-btn" title="WhatsApp">💬</a>`;
            }
            if (r.instagram) {
                socialHtml += `<a href="https://instagram.com/${r.instagram.replace('@', '')}" target="_blank" class="social-btn" title="Instagram">📸</a>`;
            }
            socialContainer.innerHTML = socialHtml;
        }

        // Cart çevirilerini güncelle
        updateCartTranslations();
    }

    function updateCartTranslations() {
        const cartTitle = document.getElementById('cartTitle');
        if (cartTitle) cartTitle.textContent = `🛒 ${translations[currentLang].cart}`;

        const cartClearBtn = document.getElementById('cartClearBtn');
        if (cartClearBtn) cartClearBtn.textContent = translations[currentLang].clearCart;

        const cartTotalLabel = document.getElementById('cartTotalLabel');
        if (cartTotalLabel) cartTotalLabel.textContent = translations[currentLang].total;

        const cartWhatsappText = document.getElementById('cartWhatsappText');
        if (cartWhatsappText) cartWhatsappText.textContent = translations[currentLang].sendOrder;

        const addToCartText = document.getElementById('addToCartText');
        if (addToCartText) addToCartText.textContent = translations[currentLang].addToCart;

        const tableNumberLabel = document.getElementById('tableNumberLabel');
        if (tableNumberLabel) tableNumberLabel.textContent = `🪑 ${translations[currentLang].tableNumber}`;

        const tableNumberInput = document.getElementById('tableNumberInput');
        if (tableNumberInput) tableNumberInput.placeholder = translations[currentLang].tableNumberPlaceholder;
    }

    // ─── DİL SEÇİMİ ───
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            if (lang === currentLang) return;

            currentLang = lang;
            localStorage.setItem('kiskac_lang', lang);

            updateRestaurantInfo(data);
            renderCategories(data);
            renderMenu(data, activeCategory, document.getElementById('menuSearch')?.value.toLowerCase().trim() || '');
        });
    });

    // ─── KATEGORİ RENDER ───
    function renderCategories(data) {
        const container = document.getElementById('categoryScroll');
        const categories = data.categories.sort((a, b) => a.order - b.order);

        let html = `
            <div class="category-item ${activeCategory === 'all' ? 'active' : ''}" data-category="all" onclick="filterCategory('all', this)">
                <div class="category-icon">📋</div>
                <span class="category-label">${translations[currentLang].all}</span>
            </div>
        `;

        categories.forEach(cat => {
            const hasItems = data.items.some(item => item.categoryId === cat.id);
            if (!hasItems) return;

            html += `
                <div class="category-item" data-category="${cat.id}" onclick="filterCategory('${cat.id}', this)">
                    <div class="category-icon">${cat.icon}</div>
                    <span class="category-label">${(currentLang === 'en' && cat.name_en) ? cat.name_en : cat.name}</span>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    // ─── MENÜ RENDER ───
    function renderMenu(data, filterCatId = null, searchQuery = '') {
        const container = document.getElementById('menuContainer');
        const categories = data.categories.sort((a, b) => a.order - b.order);
        let html = '';

        categories.forEach(cat => {
            let items = data.items
                .filter(item => item.categoryId === cat.id)
                .sort((a, b) => a.order - b.order);

            if (searchQuery) {
                items = items.filter(item =>
                    item.name.toLowerCase().includes(searchQuery) ||
                    (item.name_en && item.name_en.toLowerCase().includes(searchQuery)) ||
                    (item.description && item.description.toLowerCase().includes(searchQuery)) ||
                    (item.description_en && item.description_en.toLowerCase().includes(searchQuery))
                );
            }

            if (items.length === 0) return;
            if (filterCatId && filterCatId !== 'all' && filterCatId !== cat.id && !searchQuery) return;

            const catDisplayName = (currentLang === 'en' && cat.name_en) ? cat.name_en : cat.name;

            html += `
                <div class="menu-section" id="section-${cat.id}">
                    <div class="section-header">
                        <div class="section-icon">${cat.icon}</div>
                        <h2 class="section-title">
                            <span class="section-star">✦ </span>${catDisplayName}<span class="section-star"> ✦</span>
                        </h2>
                    </div>
                    <div class="menu-items">
            `;

            items.forEach(item => {
                const priceDisplay = item.price > 0
                    ? `<span class="item-price">₺${item.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>`
                    : `<span class="item-price no-price">${translations[currentLang].askForPrice}</span>`;

                const itemDisplayName = (currentLang === 'en' && item.name_en) ? item.name_en : item.name;
                const itemDisplayDesc = (currentLang === 'en' && item.description_en) ? item.description_en : item.description;

                const imageHtml = item.image
                    ? `<div class="item-image"><img src="${item.image}" alt="${itemDisplayName}" onerror="this.src='https://placehold.co/100x100?text=Kıskaç'"></div>`
                    : `<div class="item-image placeholder">🦐</div>`;

                const favIcon = isFavorite(item.id) ? '❤️' : '🤍';

                html += `
                    <div class="menu-item-card ${item.image ? 'has-image' : ''}" data-item-id="${item.id}" onclick="openItemDetail('${item.id}')">
                        ${imageHtml}
                        <div class="item-info">
                            <div class="item-name">${itemDisplayName}</div>
                            ${itemDisplayDesc ? `<div class="item-description">${itemDisplayDesc}</div>` : ''}
                        </div>
                        ${priceDisplay}
                        <button class="favorite-btn ${isFavorite(item.id) ? 'active' : ''}" onclick="event.stopPropagation(); toggleFav('${item.id}', this)">${favIcon}</button>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        if (!html) {
            html = `
                <div class="empty-state">
                    <div class="empty-state-icon">🐟</div>
                    <p class="empty-state-text">${translations[currentLang].emptyMenu}</p>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    // ─── FAVORİ TOGGLE (global) ───
    window.toggleFav = function (itemId, btnEl) {
        toggleFavorite(itemId);
        const isNowFav = isFavorite(itemId);
        btnEl.textContent = isNowFav ? '❤️' : '🤍';
        btnEl.classList.toggle('active', isNowFav);
    };

    // ─── ÜRÜN DETAY MODAL ───
    let currentDetailItemId = null;

    const itemModalOverlay = document.getElementById('itemModalOverlay');
    const itemModalClose = document.getElementById('itemModalClose');
    const itemModalFav = document.getElementById('itemModalFav');
    const addToCartBtn = document.getElementById('addToCartBtn');

    window.openItemDetail = function (itemId) {
        const menuData = getMenuData();
        const item = menuData.items.find(i => i.id === itemId);
        if (!item) return;

        currentDetailItemId = itemId;

        const imageContainer = document.getElementById('itemModalImage');
        const itemDisplayName = (currentLang === 'en' && item.name_en) ? item.name_en : item.name;
        const itemDisplayDesc = (currentLang === 'en' && item.description_en) ? item.description_en : item.description;

        // Görsel
        const closeBtnHtml = '<button class="item-modal-close" id="itemModalClose" onclick="closeItemDetail()">×</button>';
        const favBtnHtml = `<button class="item-modal-fav" id="itemModalFav" onclick="toggleModalFav()">${isFavorite(itemId) ? '❤️' : '🤍'}</button>`;

        if (item.image) {
            imageContainer.innerHTML = `
                ${favBtnHtml}
                ${closeBtnHtml}
                <img src="${item.image}" alt="${itemDisplayName}" onerror="this.style.display='none'">
            `;
        } else {
            imageContainer.innerHTML = `
                ${favBtnHtml}
                ${closeBtnHtml}
                <span class="placeholder-icon">🦐</span>
            `;
        }

        // İsim & Açıklama
        document.getElementById('itemModalName').textContent = itemDisplayName;
        document.getElementById('itemModalDesc').textContent = itemDisplayDesc || '';

        // Fiyat
        const priceEl = document.getElementById('itemModalPrice');
        if (item.price > 0) {
            priceEl.textContent = `₺${item.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;
            priceEl.classList.remove('no-price');
        } else {
            priceEl.textContent = translations[currentLang].askForPrice;
            priceEl.classList.add('no-price');
        }

        // Sepete ekle butonu güncelle
        const addBtn = document.getElementById('addToCartBtn');
        const addText = document.getElementById('addToCartText');
        addBtn.classList.remove('added');
        addText.textContent = translations[currentLang].addToCart;

        // Fiyatsız ürünler için sepet butonu gizle
        if (item.price <= 0) {
            addBtn.style.display = 'none';
        } else {
            addBtn.style.display = 'flex';
        }

        // Modalı aç
        itemModalOverlay.classList.add('active');
    };

    window.closeItemDetail = function () {
        itemModalOverlay.classList.remove('active');
        currentDetailItemId = null;
    };

    // Modal dışına tıklayınca kapat
    itemModalOverlay.addEventListener('click', (e) => {
        if (e.target === itemModalOverlay) {
            closeItemDetail();
        }
    });

    // Modal favori toggle
    window.toggleModalFav = function () {
        if (!currentDetailItemId) return;
        toggleFavorite(currentDetailItemId);
        const isNowFav = isFavorite(currentDetailItemId);

        // Modal butonunu güncelle
        const modalFavBtn = document.getElementById('itemModalFav');
        if (modalFavBtn) modalFavBtn.textContent = isNowFav ? '❤️' : '🤍';

        // Kart butonunu da güncelle
        const cardBtn = document.querySelector(`.menu-item-card[data-item-id="${currentDetailItemId}"] .favorite-btn`);
        if (cardBtn) {
            cardBtn.textContent = isNowFav ? '❤️' : '🤍';
            cardBtn.classList.toggle('active', isNowFav);
        }
    };

    // ─── SEPETE EKLE ───
    document.getElementById('addToCartBtn').addEventListener('click', () => {
        if (!currentDetailItemId) return;

        addToCart(currentDetailItemId);

        // Buton animasyonu
        const addBtn = document.getElementById('addToCartBtn');
        const addText = document.getElementById('addToCartText');
        addBtn.classList.add('added');
        addText.textContent = translations[currentLang].added;

        setTimeout(() => {
            addBtn.classList.remove('added');
            addText.textContent = translations[currentLang].addToCart;
        }, 1200);
    });

    // ─── SEPET MODAL ───
    const cartOverlay = document.getElementById('cartOverlay');
    const cartFloatBtn = document.getElementById('cartFloatBtn');
    const cartClose = document.getElementById('cartClose');
    const cartClearBtn = document.getElementById('cartClearBtn');
    const cartWhatsappBtn = document.getElementById('cartWhatsappBtn');

    cartFloatBtn.addEventListener('click', () => {
        renderCart();
        cartOverlay.classList.add('active');
    });

    cartClose.addEventListener('click', () => {
        cartOverlay.classList.remove('active');
    });

    cartOverlay.addEventListener('click', (e) => {
        if (e.target === cartOverlay) {
            cartOverlay.classList.remove('active');
        }
    });

    cartClearBtn.addEventListener('click', () => {
        clearCart();
        renderCart();
    });

    function renderCart() {
        const cartItemsEl = document.getElementById('cartItems');
        const cartFooter = document.getElementById('cartFooter');
        const menuData = getMenuData();

        if (cart.length === 0) {
            cartItemsEl.innerHTML = `
                <div class="cart-empty">
                    <div class="cart-empty-icon">🛒</div>
                    <p>${translations[currentLang].emptyCart}</p>
                </div>
            `;
            cartFooter.style.display = 'none';
            return;
        }

        cartFooter.style.display = 'block';
        let html = '';

        cart.forEach(c => {
            const item = menuData.items.find(i => i.id === c.id);
            if (!item) return;

            const itemName = (currentLang === 'en' && item.name_en) ? item.name_en : item.name;
            const itemPrice = item.price > 0
                ? `₺${item.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
                : translations[currentLang].askForPrice;
            const lineTotal = item.price > 0
                ? ` × ${c.qty} = ₺${(item.price * c.qty).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
                : '';

            html += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${itemName}</div>
                        <div class="cart-item-price">${itemPrice}${lineTotal}</div>
                    </div>
                    <div class="cart-qty-controls">
                        <button class="cart-qty-btn" onclick="updateCartItem('${c.id}', -1)">−</button>
                        <span class="cart-qty">${c.qty}</span>
                        <button class="cart-qty-btn" onclick="updateCartItem('${c.id}', 1)">+</button>
                    </div>
                </div>
            `;
        });

        cartItemsEl.innerHTML = html;

        // Toplam
        const total = getCartTotal();
        document.getElementById('cartTotalAmount').textContent = `₺${total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;
    }

    window.updateCartItem = function (itemId, delta) {
        updateCartQty(itemId, delta);
        renderCart();
    };

    // ─── WHATSAPP SİPARİŞ ───
    cartWhatsappBtn.addEventListener('click', () => {
        const menuData = getMenuData();
        const r = menuData.restaurant;

        if (cart.length === 0) return;

        const tableNumber = document.getElementById('tableNumberInput').value.trim();

        let message = translations[currentLang].orderMessage + '\n';

        // Masa numarası
        if (tableNumber) {
            message += `🪑 ${translations[currentLang].tableNumberMsg}: ${tableNumber}\n`;
        }

        message += '\n';

        cart.forEach(c => {
            const item = menuData.items.find(i => i.id === c.id);
            if (!item) return;
            const itemName = (currentLang === 'en' && item.name_en) ? item.name_en : item.name;
            const priceText = item.price > 0
                ? ` - ₺${(item.price * c.qty).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
                : '';
            message += `• ${c.qty}x ${itemName}${priceText}\n`;
        });

        const total = getCartTotal();
        if (total > 0) {
            message += `\n${translations[currentLang].total}: ₺${total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;
        }

        const whatsappNumber = r.whatsapp ? r.whatsapp.replace(/\D/g, '') : '';
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    });

    // ─── KATEGORİ FİLTRESİ (global) ───
    window.filterCategory = function (catId, element) {
        activeCategory = catId;
        document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
        element.classList.add('active');

        const data = getMenuData();
        renderMenu(data, catId, document.getElementById('menuSearch')?.value.toLowerCase().trim() || '');

        if (catId !== 'all') {
            setTimeout(() => {
                const section = document.getElementById(`section-${catId}`);
                if (section) {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const categoryNavHeight = document.querySelector('.category-nav').offsetHeight;
                    const offset = navbarHeight + categoryNavHeight + 10;
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const sectionRect = section.getBoundingClientRect().top;
                    const sectionPosition = sectionRect - bodyRect;
                    const offsetPosition = sectionPosition - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    };

    // ─── BALONCUK ANİMASYONLARI ───
    function createBubbles() {
        const bubblesContainer = document.getElementById('bubbles');
        if (!bubblesContainer) return;

        for (let i = 0; i < 15; i++) {
            const bubble = document.createElement('div');
            bubble.classList.add('bubble');
            const size = Math.random() * 30 + 10;
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.left = `${Math.random() * 100}%`;
            bubble.style.animationDuration = `${Math.random() * 15 + 10}s`;
            bubble.style.animationDelay = `${Math.random() * 10}s`;
            bubblesContainer.appendChild(bubble);
        }
    }
});
