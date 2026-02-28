// Kıskaç Cafe & Bar — Menü Sayfası JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const data = getMenuData();
    let activeCategory = null;

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

    function updateRestaurantInfo(data) {
        const r = data.restaurant;
        // Splash
        document.getElementById('splashName').textContent = r.name;
        document.getElementById('splashSlogan').textContent = r.slogan || 'Denizin En Taze Hali';

        const statusEl = document.getElementById('splashStatus');
        const statusDot = statusEl.querySelector('.status-dot');
        const statusText = statusEl.querySelector('.status-text');
        if (r.isOpen) {
            statusDot.classList.remove('closed');
            statusText.textContent = 'Açık';
        } else {
            statusDot.classList.add('closed');
            statusText.textContent = 'Kapalı';
        }

        // Navbar
        document.getElementById('navTitle').textContent = r.name;
        const navStatusDot = document.querySelector('.navbar-status .status-dot');
        const navStatusText = document.querySelector('.navbar-status .status-text');
        if (r.isOpen) {
            navStatusDot.classList.remove('closed');
            navStatusText.textContent = 'Açık';
        } else {
            navStatusDot.classList.add('closed');
            navStatusText.textContent = 'Kapalı';
        }

        // Footer
        document.getElementById('footerBrand').textContent = r.name;
    }

    function renderCategories(data) {
        const container = document.getElementById('categoryScroll');
        const categories = data.categories.sort((a, b) => a.order - b.order);

        // "Tümü" butonu
        let html = `
            <div class="category-item active" data-category="all" onclick="filterCategory('all', this)">
                <div class="category-icon">📋</div>
                <span class="category-label">Tümü</span>
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

    function renderMenu(data, filterCatId = null) {
        const container = document.getElementById('menuContainer');
        const categories = data.categories.sort((a, b) => a.order - b.order);
        let html = '';

        categories.forEach(cat => {
            const items = data.items
                .filter(item => item.categoryId === cat.id)
                .sort((a, b) => a.order - b.order);

            if (items.length === 0) return;
            if (filterCatId && filterCatId !== 'all' && filterCatId !== cat.id) return;

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

                html += `
                    <div class="menu-item-card">
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
                    <p class="empty-state-text">Menü yakında güncellenecek...</p>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    // Kategori filtresi — global yapıyoruz
    window.filterCategory = function (catId, element) {
        // Active sınıfını güncelle
        document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
        element.classList.add('active');

        // Menüyü güncelle
        const data = getMenuData();
        renderMenu(data, catId);

        // Eğer belirli bir kategori seçildiyse o bölüme scroll
        if (catId !== 'all') {
            setTimeout(() => {
                const section = document.getElementById(`section-${catId}`);
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
