// Kıskaç Cafe & Bar — Admin Panel JavaScript

document.addEventListener('DOMContentLoaded', () => {
    let isLoggedIn = false;
    let currentEditId = null;
    let currentEditType = null; // 'category' or 'item'
    let currentTab = 'dashboard';

    const loginScreen = document.getElementById('loginScreen');
    const adminLayout = document.getElementById('adminLayout');

    // Oturum kontrolü
    if (sessionStorage.getItem('kiskac_admin') === 'true') {
        showAdmin();
    }

    // ---- LOGIN ----
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('loginPassword').value;
        const data = getMenuData();

        if (password === data.restaurant.adminPassword) {
            sessionStorage.setItem('kiskac_admin', 'true');
            showAdmin();
        } else {
            document.getElementById('loginError').style.display = 'block';
            document.getElementById('loginPassword').value = '';
        }
    });

    function showAdmin() {
        isLoggedIn = true;
        loginScreen.style.display = 'none';
        adminLayout.classList.add('visible');
        refreshDashboard();
        refreshCategories();
        refreshItems();
    }

    // ---- LOGOUT ----
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('kiskac_admin');
        location.reload();
    });

    // ---- TABS ----
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`panel-${target}`).classList.add('active');
            currentTab = target;
        });
    });

    // ---- DASHBOARD ----
    function refreshDashboard() {
        const data = getMenuData();
        document.getElementById('statCategories').textContent = data.categories.length;
        document.getElementById('statItems').textContent = data.items.length;
        const pricedItems = data.items.filter(i => i.price > 0).length;
        document.getElementById('statPriced').textContent = pricedItems;
        document.getElementById('statUnpriced').textContent = data.items.length - pricedItems;
    }

    // ---- CATEGORIES ----
    function refreshCategories() {
        const data = getMenuData();
        const tbody = document.getElementById('categoriesTableBody');
        const categories = data.categories.sort((a, b) => a.order - b.order);

        if (categories.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="4" style="text-align:center; color: var(--admin-text-muted); padding: 40px;">
                    Henüz kategori eklenmemiş
                </td></tr>
            `;
            return;
        }

        tbody.innerHTML = categories.map(cat => {
            const itemCount = data.items.filter(i => i.categoryId === cat.id).length;
            return `
                <tr>
                    <td>${cat.icon} ${cat.name}</td>
                    <td>${itemCount} ürün</td>
                    <td>${cat.order}</td>
                    <td class="actions-cell">
                        <button class="btn btn-ghost btn-sm" onclick="editCategory('${cat.id}')">✏️ Düzenle</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteCategory('${cat.id}')">🗑️ Sil</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    document.getElementById('addCategoryBtn').addEventListener('click', () => {
        currentEditId = null;
        currentEditType = 'category';
        document.getElementById('modalTitle').textContent = 'Yeni Kategori Ekle';
        document.getElementById('categoryForm').style.display = 'block';
        document.getElementById('itemForm').style.display = 'none';
        document.getElementById('catName').value = '';
        document.getElementById('catIcon').value = '🐟';
        document.getElementById('catOrder').value = '';
        openModal();
    });

    window.editCategory = function (id) {
        const data = getMenuData();
        const cat = data.categories.find(c => c.id === id);
        if (!cat) return;

        currentEditId = id;
        currentEditType = 'category';
        document.getElementById('modalTitle').textContent = 'Kategori Düzenle';
        document.getElementById('categoryForm').style.display = 'block';
        document.getElementById('itemForm').style.display = 'none';
        document.getElementById('catName').value = cat.name;
        document.getElementById('catIcon').value = cat.icon;
        document.getElementById('catOrder').value = cat.order;
        openModal();
    };

    window.deleteCategory = function (id) {
        if (!confirm('Bu kategoriyi ve altındaki tüm ürünleri silmek istediğinizden emin misiniz?')) return;

        const data = getMenuData();
        data.categories = data.categories.filter(c => c.id !== id);
        data.items = data.items.filter(i => i.categoryId !== id);
        saveMenuData(data);
        refreshAll();
        showToast('Kategori silindi', 'success');
    };

    // ---- ITEMS ----
    function refreshItems() {
        const data = getMenuData();
        const tbody = document.getElementById('itemsTableBody');
        const categories = data.categories.sort((a, b) => a.order - b.order);

        // Populate category filter
        const filterSelect = document.getElementById('itemCategoryFilter');
        filterSelect.innerHTML = '<option value="all">Tüm Kategoriler</option>';
        categories.forEach(cat => {
            filterSelect.innerHTML += `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`;
        });

        let items = data.items.sort((a, b) => {
            const catA = data.categories.find(c => c.id === a.categoryId);
            const catB = data.categories.find(c => c.id === b.categoryId);
            const catOrderA = catA ? catA.order : 999;
            const catOrderB = catB ? catB.order : 999;
            if (catOrderA !== catOrderB) return catOrderA - catOrderB;
            return a.order - b.order;
        });

        // Apply filter
        const filterValue = filterSelect.value;
        if (filterValue !== 'all') {
            items = items.filter(i => i.categoryId === filterValue);
        }

        if (items.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="5" style="text-align:center; color: var(--admin-text-muted); padding: 40px;">
                    Henüz ürün eklenmemiş
                </td></tr>
            `;
            return;
        }

        tbody.innerHTML = items.map(item => {
            const cat = data.categories.find(c => c.id === item.categoryId);
            const catName = cat ? `${cat.icon} ${cat.name}` : 'Bilinmiyor';
            const priceDisplay = item.price > 0
                ? `<span class="price-badge">₺${item.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>`
                : `<span class="price-badge no-price">Belirtilmemiş</span>`;

            const imageDisplay = item.image
                ? `<div style="width:30px;height:30px;border-radius:4px;overflow:hidden;border:1px solid var(--admin-border)"><img src="${item.image}" style="width:100%;height:100%;object-fit:cover;"></div>`
                : `<span style="opacity:0.3">🖼️ Yok</span>`;

            return `
                <tr>
                    <td>${imageDisplay}</td>
                    <td><strong>${item.name}</strong>${item.description ? `<br><small style="color:var(--admin-text-muted)">${item.description}</small>` : ''}</td>
                    <td><span class="category-badge">${catName}</span></td>
                    <td>${priceDisplay}</td>
                    <td>${item.order}</td>
                    <td class="actions-cell">
                        <button class="btn btn-ghost btn-sm" onclick="editItem('${item.id}')">✏️</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteItem('${item.id}')">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Category filter change
    document.getElementById('itemCategoryFilter').addEventListener('change', refreshItems);

    document.getElementById('addItemBtn').addEventListener('click', () => {
        currentEditId = null;
        currentEditType = 'item';
        document.getElementById('modalTitle').textContent = 'Yeni Ürün Ekle';
        document.getElementById('categoryForm').style.display = 'none';
        document.getElementById('itemForm').style.display = 'block';

        // Populate category select
        const data = getMenuData();
        const select = document.getElementById('itemCategory');
        select.innerHTML = data.categories.sort((a, b) => a.order - b.order).map(cat =>
            `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`
        ).join('');

        document.getElementById('itemName').value = '';
        document.getElementById('itemDescription').value = '';
        document.getElementById('itemPrice').value = '';
        document.getElementById('itemImage').value = '';
        document.getElementById('itemOrder').value = '';
        openModal();
    });

    window.editItem = function (id) {
        const data = getMenuData();
        const item = data.items.find(i => i.id === id);
        if (!item) return;

        currentEditId = id;
        currentEditType = 'item';
        document.getElementById('modalTitle').textContent = 'Ürün Düzenle';
        document.getElementById('categoryForm').style.display = 'none';
        document.getElementById('itemForm').style.display = 'block';

        const select = document.getElementById('itemCategory');
        select.innerHTML = data.categories.sort((a, b) => a.order - b.order).map(cat =>
            `<option value="${cat.id}" ${cat.id === item.categoryId ? 'selected' : ''}>${cat.icon} ${cat.name}</option>`
        ).join('');

        document.getElementById('itemName').value = item.name;
        document.getElementById('itemDescription').value = item.description || '';
        document.getElementById('itemPrice').value = item.price > 0 ? item.price : '';
        document.getElementById('itemImage').value = item.image || '';
        document.getElementById('itemOrder').value = item.order;
        openModal();
    };

    window.deleteItem = function (id) {
        if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;

        const data = getMenuData();
        data.items = data.items.filter(i => i.id !== id);
        saveMenuData(data);
        refreshAll();
        showToast('Ürün silindi', 'success');
    };

    // ---- MODAL ----
    function openModal() {
        document.getElementById('modalOverlay').classList.add('active');
    }

    function closeModal() {
        document.getElementById('modalOverlay').classList.remove('active');
        currentEditId = null;
        currentEditType = null;
    }

    document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
    document.getElementById('modalCancelBtn').addEventListener('click', closeModal);

    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modalOverlay')) closeModal();
    });

    // ---- SAVE (Modal) ----
    document.getElementById('modalSaveBtn').addEventListener('click', () => {
        const data = getMenuData();

        if (currentEditType === 'category') {
            const name = document.getElementById('catName').value.trim();
            const icon = document.getElementById('catIcon').value.trim();
            const order = parseInt(document.getElementById('catOrder').value) || 1;

            if (!name) {
                showToast('Kategori adı gerekli', 'error');
                return;
            }

            if (currentEditId) {
                // Güncelle
                const cat = data.categories.find(c => c.id === currentEditId);
                if (cat) {
                    cat.name = name;
                    cat.icon = icon;
                    cat.order = order;
                }
                showToast('Kategori güncellendi', 'success');
            } else {
                // Yeni ekle
                data.categories.push({
                    id: generateId(),
                    name: name,
                    icon: icon || '📋',
                    order: order
                });
                showToast('Kategori eklendi', 'success');
            }
        } else if (currentEditType === 'item') {
            const name = document.getElementById('itemName').value.trim();
            const description = document.getElementById('itemDescription').value.trim();
            const price = parseFloat(document.getElementById('itemPrice').value.replace(',', '.')) || 0;
            const categoryId = document.getElementById('itemCategory').value;
            const image = document.getElementById('itemImage').value.trim();
            const order = parseInt(document.getElementById('itemOrder').value) || 1;

            if (!name) {
                showToast('Ürün adı gerekli', 'error');
                return;
            }

            if (currentEditId) {
                const item = data.items.find(i => i.id === currentEditId);
                if (item) {
                    item.name = name;
                    item.description = description;
                    item.price = price;
                    item.image = image;
                    item.categoryId = categoryId;
                    item.order = order;
                }
                showToast('Ürün güncellendi', 'success');
            } else {
                data.items.push({
                    id: generateId(),
                    categoryId: categoryId,
                    name: name,
                    description: description,
                    price: price,
                    image: image,
                    order: order
                });
                showToast('Ürün eklendi', 'success');
            }
        }

        saveMenuData(data);
        refreshAll();
        closeModal();
    });

    // ---- EXPORT / IMPORT ----
    document.getElementById('exportBtn').addEventListener('click', () => {
        const data = getMenuData();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kiskac_menu_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Yedek dosyası indirildi', 'success');
    });

    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });

    document.getElementById('importFile').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                if (importedData.restaurant && importedData.categories && importedData.items) {
                    if (confirm('Mevcut menü verileri yedeğinizle değiştirilecek. Devam etmek istiyor musunuz?')) {
                        saveMenuData(importedData);
                        refreshAll();
                        showToast('Veriler başarıyla içe aktarıldı', 'success');
                    }
                } else {
                    showToast('Geçersiz dosya formatı', 'error');
                }
            } catch (err) {
                showToast('Dosya okunamadı', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    // ---- RESET DATA ----
    document.getElementById('resetDataBtn').addEventListener('click', () => {
        if (confirm('Tüm menü verilerini varsayılana sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
            localStorage.removeItem('kiskac_menu_data');
            initializeData();
            refreshAll();
            showToast('Veriler varsayılana sıfırlandı', 'success');
        }
    });

    // ---- PASSWORD CHANGE ----
    document.getElementById('changePasswordBtn').addEventListener('click', () => {
        const currentPw = document.getElementById('currentPassword').value;
        const newPw = document.getElementById('newPassword').value;
        const data = getMenuData();

        if (currentPw !== data.restaurant.adminPassword) {
            showToast('Mevcut şifre yanlış', 'error');
            return;
        }

        if (newPw.length < 4) {
            showToast('Yeni şifre en az 4 karakter olmalı', 'error');
            return;
        }

        data.restaurant.adminPassword = newPw;
        saveMenuData(data);
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        showToast('Şifre başarıyla değiştirildi', 'success');
    });

    // ---- GITHUB SYNC LOGIC ----
    async function pushToGitHub(menuData) {
        // Token ve Ayarlar (Kullanıcının isteği üzerine koda gömüldü)
        const token = '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';
        const username = 'TolgaMst';
        const repo = 'Kiskac';
        const path = 'data.json';

        if (!token || !username || !repo) {
            showToast('GitHub ayarları eksik. Sadece yerel kaydedildi.', 'info');
            return;
        }

        showToast('GitHub\'a gönderiliyor...', 'info');

        try {
            // 1. Get current file SHA
            const getUrl = `https://api.github.com/repos/${username}/${repo}/contents/${path}`;
            const res = await fetch(getUrl, {
                headers: { 'Authorization': `token ${token}` }
            });

            let sha = '';
            if (res.ok) {
                const fileData = await res.json();
                sha = fileData.sha;
            }

            // 2. Push update
            const content = btoa(unescape(encodeURIComponent(JSON.stringify(menuData, null, 4))));
            const putRes = await fetch(getUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Menu update: ${new Date().toLocaleString()}`,
                    content: content,
                    sha: sha
                })
            });

            if (putRes.ok) {
                showToast('GitHub başarıyla güncellendi! 🚀', 'success');
            } else {
                const err = await putRes.json();
                throw new Error(err.message || 'GitHub hatası');
            }
        } catch (err) {
            console.error('GitHub Push Error:', err);
            showToast('GitHub hatası: ' + err.message, 'error');
        }
    }

    // ---- RESTAURANT SETTINGS ----
    document.getElementById('saveRestaurantBtn').addEventListener('click', () => {
        const data = getMenuData();
        data.restaurant.name = document.getElementById('restName').value.trim() || data.restaurant.name;
        data.restaurant.slogan = document.getElementById('restSlogan').value.trim();
        data.restaurant.phone = document.getElementById('restPhone').value.trim();
        data.restaurant.email = document.getElementById('restEmail').value.trim();
        data.restaurant.whatsapp = document.getElementById('restWhatsapp').value.trim();
        data.restaurant.facebook = document.getElementById('restFacebook').value.trim();
        data.restaurant.mapsLink = document.getElementById('restMapsLink').value.trim();
        data.restaurant.openingHours = document.getElementById('restOpeningHours').value.trim();
        data.restaurant.address = document.getElementById('restAddress').value.trim();
        data.restaurant.instagram = document.getElementById('restInstagram').value.trim();
        data.restaurant.isOpen = document.getElementById('restIsOpen').checked;
        saveMenuData(data);
        showToast('Yerel değişiklikler kaydedildi', 'success');

        // GitHub'a gönder (Ayarlar varsa)
        pushToGitHub(data);
    });

    // Load restaurant settings
    function loadRestaurantSettings() {
        const data = getMenuData();
        document.getElementById('restName').value = data.restaurant.name || '';
        document.getElementById('restSlogan').value = data.restaurant.slogan || '';
        document.getElementById('restPhone').value = data.restaurant.phone || '';
        document.getElementById('restEmail').value = data.restaurant.email || '';
        document.getElementById('restWhatsapp').value = data.restaurant.whatsapp || '';
        document.getElementById('restFacebook').value = data.restaurant.facebook || '';
        document.getElementById('restMapsLink').value = data.restaurant.mapsLink || '';
        document.getElementById('restOpeningHours').value = data.restaurant.openingHours || '';
        document.getElementById('restAddress').value = data.restaurant.address || '';
        document.getElementById('restInstagram').value = data.restaurant.instagram || '';
        document.getElementById('restIsOpen').checked = data.restaurant.isOpen !== false;
    }

    // ---- HELPERS ----
    function refreshAll() {
        refreshDashboard();
        refreshCategories();
        refreshItems();
        loadRestaurantSettings();
    }

    function showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const icons = { success: '✅', error: '❌', info: 'ℹ️' };
        toast.innerHTML = `${icons[type] || ''} ${message}`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            toast.style.transition = '0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ---- QR CODE GENERATOR ----
    const generateQrBtn = document.getElementById('generateQrBtn');
    const downloadQrBtn = document.getElementById('downloadQrBtn');
    const menuUrlInput = document.getElementById('menuUrlInput');
    const qrContainer = document.getElementById('qrCodeContent');
    let qrcodeInstance = null;

    if (generateQrBtn) {
        generateQrBtn.addEventListener('click', () => {
            const url = menuUrlInput.value.trim();
            if (!url) {
                showToast('Lütfen geçerli bir URL girin', 'error');
                return;
            }

            qrContainer.innerHTML = '';
            qrcodeInstance = new QRCode(qrContainer, {
                text: url,
                width: 256,
                height: 256,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });

            // Make it look better (fix canvas size and display)
            setTimeout(() => {
                const qrImg = qrContainer.querySelector('img');
                if (qrImg) {
                    qrImg.style.width = '150px';
                    qrImg.style.height = '150px';
                }
                downloadQrBtn.style.display = 'inline-flex';
            }, 100);

            showToast('QR Kod başarıyla oluşturuldu', 'success');
        });
    }

    if (downloadQrBtn) {
        downloadQrBtn.addEventListener('click', () => {
            const qrCanvas = qrContainer.querySelector('canvas');
            if (qrCanvas) {
                const url = qrCanvas.toDataURL("image/png");
                const a = document.createElement('a');
                a.href = url;
                a.download = 'kiskac_menu_qr.png';
                a.click();
                showToast('QR Kod indiriliyor...', 'info');
            }
        });
    }

    // İlk yükleme
    loadRestaurantSettings();
});
