// Kıskaç Cafe & Bar — Menü Sayfası JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const data = getMenuData();
    let activeCategory = 'all';
    let currentLang = localStorage.getItem('kiskac_lang') || 'tr';

    const translations = {
        tr: {
            open: "Açık",
            closed: "Kapalı",
            viewMenu: "Menüyü Gör",
            all: "Tümü",
            searchPlaceholder: "Ürün ara...",
            emptyMenu: "Menü yakında güncellenecek...",
            rights: "Tüm hakları saklıdır.",
            management: "Yönetim"
        },
        en: {
            open: "Open",
            closed: "Closed",
            viewMenu: "View Menu",
            all: "All",
            searchPlaceholder: "Search products...",
            emptyMenu: "Menu will be updated soon...",
            rights: "All rights reserved.",
            management: "Admin"
        }
    };

    // Splash ekranını yönet
    const splashBtn = document.getElementById('splashBtn');
    const splashScreen = document.getElementById('splashScreen');
    const mainContent = document.getElementById('mainContent');

    // Restoran bilgilerini güncelle
    updateRestaurantInfo(data);

    // Splash butonu
    if (splashBtn) {
        splashBtn.addEventListener('click', () => {
            splashScreen.classList.add('hide');
            setTimeout(() => {
                splashScreen.style.display = 'none';
                mainContent.classList.add('visible');
                renderCategories(data);
                renderMenu(data);
                createBubbles();
            }, 400);
        });
    }

    // Scroll to top butonu
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

    // Arama fonksiyonu
    const searchInput = document.getElementById('menuSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const data = getMenuData();

            if (query.length > 0) {
                // Herhangi bir kategori seçiliyse "Tümü"ne çek (görsel olarak)
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
        // Splash
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

        // Splash Button
        const splashBtn = document.getElementById('splashBtn');
        if (splashBtn) {
            splashBtn.innerHTML = `${translations[currentLang].viewMenu} <span>→</span>`;
        }

        // Navbar
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

        // Language Switcher State
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === currentLang);
        });

        // Footer
        document.getElementById('footerBrand').textContent = r.name;

        // Footer Description
        const footerDesc = document.querySelector('.footer-text');
        if (footerDesc) {
            footerDesc.textContent = r.description || translations[currentLang].emptyMenu;
        }

        // Footer Copyright
        const footerCopy = document.querySelector('.footer-text[style*="opacity: 0.6"]');
        if (footerCopy) {
            footerCopy.textContent = `© 2026 ${r.name}. ${translations[currentLang].rights}`;
        }

        // Admin Link
        const adminLink = document.querySelector('.footer-link');
        if (adminLink) {
            adminLink.textContent = translations[currentLang].management;
        }

        // Search Placeholder
        const searchInput = document.getElementById('menuSearch');
        if (searchInput) {
            searchInput.placeholder = translations[currentLang].searchPlaceholder;
        }

        // Social Links
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
    }

    // Dil seçimi event listeners
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            if (lang === currentLang) return;

            currentLang = lang;
            localStorage.setItem('kiskac_lang', lang);

            // Tüm sayfayı güncelle
            updateRestaurantInfo(data);
            renderCategories(data);
            renderMenu(data, activeCategory, document.getElementById('menuSearch')?.value.toLowerCase().trim() || '');
        });
    });

    function renderCategories(data) {
        const container = document.getElementById('categoryScroll');
        const categories = data.categories.sort((a, b) => a.order - b.order);

        // "Tümü" butonu
        let html = `
            <div class="category-item ${activeCategory === 'all' ? 'active' : ''}" data-category="all" onclick="filterCategory('all', this)">
                <div class="category-icon">📋</div>
                <span class="category-label">${translations[currentLang].all}</span>
            </div>
        `;

        categories.forEach(cat => {
            // Bu kategoriye ait ürün var mı kontrol et
            const hasItems = data.items.some(item => item.categoryId === cat.id);
            if (!hasItems) return;

            html += `
                <div class="category-item" data-category="${cat.id}" onclick="filterCategory('${cat.id}', this)">
                    <div class="category-icon">${cat.icon}</div>
                    <span class="category-label">${cat.name}</span>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    function renderMenu(data, filterCatId = null, searchQuery = '') {
        const container = document.getElementById('menuContainer');
        const categories = data.categories.sort((a, b) => a.order - b.order);
        let html = '';

        categories.forEach(cat => {
            let items = data.items
                .filter(item => item.categoryId === cat.id)
                .sort((a, b) => a.order - b.order);

            // Arama filtresi
            if (searchQuery) {
                items = items.filter(item =>
                    item.name.toLowerCase().includes(searchQuery) ||
                    (item.description && item.description.toLowerCase().includes(searchQuery))
                );
            }

            if (items.length === 0) return;
            if (filterCatId && filterCatId !== 'all' && filterCatId !== cat.id && !searchQuery) return;

            html += `
                <div class="menu-section" id="section-${cat.id}">
                    <div class="section-header">
                        <div class="section-icon">${cat.icon}</div>
                        <h2 class="section-title">
                            <span class="section-star">✦ </span>${cat.name}<span class="section-star"> ✦</span>
                        </h2>
                    </div>
                    <div class="menu-items">
            `;

            items.forEach(item => {
                const priceDisplay = item.price > 0
                    ? `<span class="item-price">₺${item.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>`
                    : `<span class="item-price no-price">—</span>`;

                const imageHtml = item.image
                    ? `<div class="item-image"><img src="${item.image}" alt="${item.name}" onerror="this.src='https://placehold.co/100x100?text=Kıskaç'"></div>`
                    : `<div class="item-image placeholder">🦐</div>`;

                html += `
                    <div class="menu-item-card ${item.image ? 'has-image' : ''}">
                        ${imageHtml}
                        <div class="item-info">
                            <div class="item-name">${item.name}</div>
                            ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
                        </div>
                        ${priceDisplay}
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

    // Kategori filtresi — global yapıyoruz
    window.filterCategory = function (catId, element) {
        activeCategory = catId;
        // Active sınıfını güncelle
        document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
        element.classList.add('active');

        // Menüyü güncelle
        const data = getMenuData();
        renderMenu(data, catId, document.getElementById('menuSearch')?.value.toLowerCase().trim() || '');

        // Eğer belirli bir kategori seçildiyse o bölüme scroll
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

    // Baloncuk animasyonları
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
