class CashierSystem {
    constructor() {
        this.cart = [];
        this.products = [
            { id: 1, name: 'Ayam Bakar', price: 15000, category: 'Resto', image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=200&h=200&fit=crop', stock: 50 },
            { id: 2, name: 'Air Mineral', price: 5000, category: 'Cafe', image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=200&h=200&fit=crop', stock: 100 },
            { id: 3, name: 'Avocado Juice', price: 25000, category: 'Cafe', image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=200&h=200&fit=crop', stock: 30 },
            { id: 4, name: 'Ayam Goreng Bumbu', price: 15000, category: 'Resto', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&h=200&fit=crop', stock: 45 },
            { id: 5, name: 'Bakso Ikan Tusuk', price: 3000, category: 'Resto', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&h=200&fit=crop', stock: 80 },
            { id: 6, name: 'Nasi Goreng', price: 20000, category: 'Resto', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200&h=200&fit=crop', stock: 35 },
            { id: 7, name: 'Es Teh Manis', price: 8000, category: 'Cafe', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=200&fit=crop', stock: 60 },
            { id: 8, name: 'Mie Ayam', price: 18000, category: 'Resto', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&h=200&fit=crop', stock: 40 },
            { id: 9, name: 'Kopi Hitam', price: 10000, category: 'Cafe', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop', stock: 70 },
            { id: 10, name: 'Sate Ayam', price: 25000, category: 'Resto', image: 'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?w=200&h=200&fit=crop', stock: 25 }
        ];
        this.customers = [
            { id: 1, name: 'Walk-in Customer', phone: '-', type: 'regular' },
            { id: 2, name: 'John Doe', phone: '08123456789', type: 'member' },
            { id: 3, name: 'Jane Smith', phone: '08987654321', type: 'vip' }
        ];
        this.sales = [];
        this.discounts = [
            { id: 1, name: 'Diskon 10%', type: 'percentage', value: 10, minPurchase: 50000 },
            { id: 2, name: 'Diskon 5000', type: 'fixed', value: 5000, minPurchase: 100000 },
            { id: 3, name: 'Member Discount', type: 'percentage', value: 5, minPurchase: 0, customerType: 'member' }
        ];
        this.currentCategory = 'All Categories';
        this.currentView = 'Products';
        this.currentCustomer = null;
        this.currentDiscount = null;
        this.taxRate = 0.11;
        this.searchTerm = '';
        
        // Cloudinary Configuration
        this.cloudinaryConfig = {
            cloudName: 'dx4e3bdic',
            uploadPreset: 'viola-kasir',
            apiKey: '913871217173658'
        };
        
        this.init();
    }

    init() {
        this.renderProducts();
        this.updateCart();
        this.attachEventListeners();
        this.loadFromLocalStorage();
    }

    attachEventListeners() {
        document.querySelectorAll('.top-nav span').forEach(nav => {
            nav.addEventListener('click', (e) => this.switchView(e.currentTarget.textContent));
        });

        document.querySelectorAll('.cat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterByCategory(e.currentTarget.textContent));
        });

        document.querySelector('.plus-icon').addEventListener('click', () => this.showAddProductModal());
        document.querySelector('.total-button').addEventListener('click', () => this.checkout());
    }

    switchView(view) {
        this.currentView = view;
        document.querySelectorAll('.top-nav span').forEach(nav => nav.classList.toggle('active', nav.textContent === view));

        if (view === 'Custom') {
            this.showCustomItemModal();
        } else if (view === 'Barcode') {
            this.showBarcodeScanner();
        } else if (view === 'Reports') {
            this.showReports();
        } else if (view === 'Customers') {
            this.showCustomers();
        } else if (view === 'Menu Management') {
            this.showMenuManagement();
        }
    }

    filterByCategory(category) {
        this.currentCategory = category;
        document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.toggle('active', btn.textContent === category));
        this.renderProducts();
    }

    renderProducts() {
        const productGrid = document.querySelector('.product-grid');
        let filteredProducts = this.products;

        if (this.currentCategory !== 'All Categories') {
            if (this.currentCategory === 'Popular') {
                filteredProducts = this.products.slice(0, 6);
            } else {
                filteredProducts = this.products.filter(p => p.category === this.currentCategory);
            }
        }

        if (this.searchTerm) {
            filteredProducts = filteredProducts.filter(p => 
                p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                p.category.toLowerCase().includes(this.searchTerm.toLowerCase())
            );
        }

        if (!filteredProducts.length) {
            productGrid.innerHTML = '<div class="empty-state">Tidak ada produk yang cocok dengan pencarian Anda.</div>';
            return;
        }

        productGrid.innerHTML = filteredProducts.map(product => `
            <div class="card" onclick="cashier.addToCart(${product.id})">
                <img src="${product.image}" alt="${product.name}">
                <p class="name">${product.name}</p>
                <p class="price">${this.formatCurrency(product.price)}</p>
                <p class="stock">Stock: ${product.stock}</p>
            </div>
        `).join('');
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.cart.push({
                ...product,
                quantity: 1
            });
        }

        this.updateCart();
        this.saveToLocalStorage();
    }

    updateCart() {
        const cartItems = document.getElementById('cart-items');
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = '<tr><td colspan="3" class="empty-cart">Keranjang kosong</td></tr>';
        } else {
            cartItems.innerHTML = this.cart.map(item => `
                <tr>
                    <td>
                        ${item.name}
                        <div class="quantity-controls">
                            <button onclick="cashier.updateQuantity(${item.id}, -1)">-</button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button onclick="cashier.updateQuantity(${item.id}, 1)">+</button>
                        </div>
                    </td>
                    <td>${item.quantity}x</td>
                    <td>
                        ${this.formatCurrency(item.price * item.quantity)}
                        <button class="remove-item" onclick="cashier.removeFromCart(${item.id})">×</button>
                    </td>
                </tr>
            `).join('');
        }

        this.updateTotals();
    }

    updateQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (!item) return;

        item.quantity += change;
        
        if (item.quantity <= 0) {
            this.removeFromCart(productId);
        } else {
            this.updateCart();
            this.saveToLocalStorage();
        }
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCart();
        this.saveToLocalStorage();
    }

    updateTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let discount = 0;
        
        if (this.currentDiscount) {
            if (this.currentDiscount.type === 'percentage') {
                discount = subtotal * (this.currentDiscount.value / 100);
            } else {
                discount = this.currentDiscount.value;
            }
        }
        
        const afterDiscount = subtotal - discount;
        const tax = afterDiscount * this.taxRate;
        const total = afterDiscount + tax;

        let summaryHTML = `<div class="summary-line"><span>Subtotal</span> <span>${this.formatCurrency(subtotal)}</span></div>`;
        
        if (discount > 0) {
            summaryHTML += `<div class="summary-line"><span>Discount (${this.currentDiscount.name})</span> <span>-${this.formatCurrency(discount)}</span></div>`;
        }
        
        summaryHTML += `<div class="summary-line"><span>PPN 11%</span> <span>${this.formatCurrency(tax)}</span></div>`;
        
        document.querySelector('.receipt-footer').innerHTML = summaryHTML + `
            <div class="total-button">
                ${this.formatCurrency(total)}
            </div>
            <div class="action-buttons">
                <button onclick="cashier.showDiscountModal()">Diskon</button>
                <button onclick="cashier.showCustomerModal()">Pelanggan</button>
                <button onclick="cashier.printReceipt()">Print</button>
            </div>
        `;

        // Reattach click handler since innerHTML replaced the element
        const totalBtn = document.querySelector('.receipt-footer .total-button');
        if (totalBtn) {
            totalBtn.addEventListener('click', () => this.checkout());
        }
    }

    // Toast helper
    showToast(message, type = 'info', timeout = 3000) {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(8px)';
            setTimeout(() => toast.remove(), 240);
        }, timeout);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    }

    showAddProductModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Tambah Produk Baru</h3>
                <input type="text" id="new-product-name" placeholder="Nama Produk">
                <input type="number" id="new-product-price" placeholder="Harga">
                <input type="number" id="new-product-stock" placeholder="Stok" value="0">
                <select id="new-product-category">
                    <option value="Resto">Resto</option>
                    <option value="Cafe">Cafe</option>
                </select>
                <div class="image-upload-section">
                    <label for="new-product-image">Upload Gambar Produk:</label>
                    <input type="file" id="new-product-image" accept="image/*" onchange="cashier.previewImage(this, 'new-product-preview')">
                    <div id="new-product-preview" class="image-preview"></div>
                </div>
                <div class="modal-buttons">
                    <button onclick="cashier.addNewProduct()">Tambah</button>
                    <button onclick="this.closest('.modal').remove()">Batal</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async uploadToCloudinary(file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', this.cloudinaryConfig.uploadPreset);
        
        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${this.cloudinaryConfig.cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message);
            }
            
            return data.secure_url;
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            alert('Gagal upload gambar ke cloud. Menggunakan fallback.');
            return null;
        }
    }

    async addNewProduct() {
        const name = document.getElementById('new-product-name').value;
        const price = parseInt(document.getElementById('new-product-price').value);
        const stock = parseInt(document.getElementById('new-product-stock').value) || 0;
        const category = document.getElementById('new-product-category').value;
        const imageInput = document.getElementById('new-product-image');

        if (!name || !price) {
            alert('Mohon lengkapi semua field');
            return;
        }

        let imageUrl = 'https://via.placeholder.com/100';
        
        if (imageInput.files && imageInput.files[0]) {
            // Cek apakah Cloudinary sudah dikonfigurasi
            if (this.cloudinaryConfig.cloudName === 'YOUR_CLOUD_NAME') {
                // Fallback ke base64 jika Cloudinary belum dikonfigurasi
                const reader = new FileReader();
                reader.onload = (e) => {
                    imageUrl = e.target.result;
                    this.saveProduct(name, price, stock, category, imageUrl);
                };
                reader.readAsDataURL(imageInput.files[0]);
            } else {
                // Upload ke Cloudinary
                const uploadBtn = document.querySelector('.modal-buttons button:first-child');
                uploadBtn.textContent = 'Uploading...';
                uploadBtn.disabled = true;
                
                const cloudUrl = await this.uploadToCloudinary(imageInput.files[0]);
                
                if (cloudUrl) {
                    imageUrl = cloudUrl;
                } else {
                    // Fallback ke base64 jika gagal
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        imageUrl = e.target.result;
                        this.saveProduct(name, price, stock, category, imageUrl);
                    };
                    reader.readAsDataURL(imageInput.files[0]);
                    return;
                }
                
                this.saveProduct(name, price, stock, category, imageUrl);
            }
        } else {
            this.saveProduct(name, price, stock, category, imageUrl);
        }
    }

    saveProduct(name, price, stock, category, imageUrl) {
        const newProduct = {
            id: this.products.length + 1,
            name,
            price,
            stock,
            category,
            image: imageUrl
        };

        this.products.push(newProduct);
        this.renderProducts();
        document.querySelector('.modal').remove();
        this.saveToLocalStorage();
    }

    previewImage(input, previewId) {
        const preview = document.getElementById(previewId);
        
        if (input.files && input.files[0]) {
            const file = input.files[0];
            
            // Validasi format gambar
            if (!file.type.match('image.*')) {
                alert('Mohon upload file gambar (JPG, PNG, GIF)');
                input.value = '';
                return;
            }
            
            // Validasi ukuran file (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Ukuran gambar maksimal 2MB');
                input.value = '';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100px; max-height: 100px; border-radius: 8px;">`;
            };
            reader.readAsDataURL(file);
        }
    }

    showMenuManagement() {
        const modal = document.createElement('div');
        modal.className = 'modal large-modal';
        modal.innerHTML = `
            <div class="modal-content large">
                <h3>Menu Management</h3>
                <div class="menu-actions">
                    <button onclick="cashier.showAddProductModal()">+ Tambah Produk</button>
                    <button onclick="cashier.showCategoryManagement()">Kelola Kategori</button>
                    <button onclick="cashier.importProducts()">Import Produk</button>
                    <button onclick="cashier.exportProducts()">Export Produk</button>
                </div>
                <div class="product-management-table">
                    <table class="management-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Nama</th>
                                <th>Harga</th>
                                <th>Stok</th>
                                <th>Kategori</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.products.map(product => `
                                <tr>
                                    <td>
                                        <img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
                                    </td>
                                    <td>${product.name}</td>
                                    <td>${this.formatCurrency(product.price)}</td>
                                    <td>${product.stock}</td>
                                    <td>${product.category}</td>
                                    <td>
                                        <button onclick="cashier.editProduct(${product.id})">Edit</button>
                                        <button onclick="cashier.changeProductImage(${product.id})">Ganti Gambar</button>
                                        <button onclick="cashier.deleteProduct(${product.id})">Hapus</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="modal-buttons">
                    <button onclick="this.closest('.modal').remove()">Tutup</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Edit Produk</h3>
                <input type="text" id="edit-product-name" value="${product.name}" placeholder="Nama Produk">
                <input type="number" id="edit-product-price" value="${product.price}" placeholder="Harga">
                <input type="number" id="edit-product-stock" value="${product.stock}" placeholder="Stok">
                <select id="edit-product-category">
                    <option value="Resto" ${product.category === 'Resto' ? 'selected' : ''}>Resto</option>
                    <option value="Cafe" ${product.category === 'Cafe' ? 'selected' : ''}>Cafe</option>
                </select>
                <div class="image-upload-section">
                    <label>Gambar Saat Ini:</label>
                    <img src="${product.image}" alt="${product.name}" style="width: 80px; height: 80px; border-radius: 8px; margin-bottom: 10px;">
                    <label for="edit-product-image">Ganti Gambar:</label>
                    <input type="file" id="edit-product-image" accept="image/*" onchange="cashier.previewImage(this, 'edit-product-preview')">
                    <div id="edit-product-preview" class="image-preview"></div>
                </div>
                <div class="modal-buttons">
                    <button onclick="cashier.updateProduct(${productId})">Update</button>
                    <button onclick="this.closest('.modal').remove()">Batal</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async updateProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const name = document.getElementById('edit-product-name').value;
        const price = parseInt(document.getElementById('edit-product-price').value);
        const stock = parseInt(document.getElementById('edit-product-stock').value);
        const category = document.getElementById('edit-product-category').value;
        const imageInput = document.getElementById('edit-product-image');

        if (!name || !price) {
            alert('Mohon lengkapi semua field');
            return;
        }

        product.name = name;
        product.price = price;
        product.stock = stock;
        product.category = category;

        if (imageInput.files && imageInput.files[0]) {
            if (this.cloudinaryConfig.cloudName === 'YOUR_CLOUD_NAME') {
                // Fallback ke base64
                const reader = new FileReader();
                reader.onload = (e) => {
                    product.image = e.target.result;
                    this.finishProductUpdate();
                };
                reader.readAsDataURL(imageInput.files[0]);
            } else {
                // Upload ke Cloudinary
                const uploadBtn = document.querySelector('.modal-buttons button:first-child');
                uploadBtn.textContent = 'Uploading...';
                uploadBtn.disabled = true;
                
                const cloudUrl = await this.uploadToCloudinary(imageInput.files[0]);
                
                if (cloudUrl) {
                    product.image = cloudUrl;
                } else {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        product.image = e.target.result;
                        this.finishProductUpdate();
                    };
                    reader.readAsDataURL(imageInput.files[0]);
                    return;
                }
                
                this.finishProductUpdate();
            }
        } else {
            this.finishProductUpdate();
        }
    }

    finishProductUpdate() {
        this.renderProducts();
        document.querySelectorAll('.modal').forEach(modal => modal.remove());
        this.saveToLocalStorage();
    }

    changeProductImage(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Ganti Gambar Produk</h3>
                <p><strong>${product.name}</strong></p>
                <img src="${product.image}" alt="${product.name}" style="width: 100px; height: 100px; border-radius: 8px; margin-bottom: 20px;">
                <div class="image-upload-section">
                    <label for="change-product-image">Pilih Gambar Baru:</label>
                    <input type="file" id="change-product-image" accept="image/*" onchange="cashier.previewImage(this, 'change-product-preview')">
                    <div id="change-product-preview" class="image-preview"></div>
                </div>
                <div class="modal-buttons">
                    <button onclick="cashier.saveProductImage(${productId})">Simpan</button>
                    <button onclick="this.closest('.modal').remove()">Batal</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async saveProductImage(productId) {
        const product = this.products.find(p => p.id === productId);
        const imageInput = document.getElementById('change-product-image');

        if (imageInput.files && imageInput.files[0]) {
            if (this.cloudinaryConfig.cloudName === 'YOUR_CLOUD_NAME') {
                // Fallback ke base64
                const reader = new FileReader();
                reader.onload = (e) => {
                    product.image = e.target.result;
                    this.renderProducts();
                    document.querySelectorAll('.modal').forEach(modal => modal.remove());
                    this.saveToLocalStorage();
                };
                reader.readAsDataURL(imageInput.files[0]);
            } else {
                // Upload ke Cloudinary
                const uploadBtn = document.querySelector('.modal-buttons button:first-child');
                uploadBtn.textContent = 'Uploading...';
                uploadBtn.disabled = true;
                
                const cloudUrl = await this.uploadToCloudinary(imageInput.files[0]);
                
                if (cloudUrl) {
                    product.image = cloudUrl;
                    this.renderProducts();
                    document.querySelectorAll('.modal').forEach(modal => modal.remove());
                    this.saveToLocalStorage();
                } else {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        product.image = e.target.result;
                        this.renderProducts();
                        document.querySelectorAll('.modal').forEach(modal => modal.remove());
                        this.saveToLocalStorage();
                    };
                    reader.readAsDataURL(imageInput.files[0]);
                }
            }
        } else {
            alert('Mohon pilih gambar baru');
        }
    }

    deleteProduct(productId) {
        if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            return;
        }

        this.products = this.products.filter(p => p.id !== productId);
        this.renderProducts();
        this.saveToLocalStorage();
        
        // Refresh menu management jika sedang dibuka
        const managementModal = document.querySelector('.large-modal');
        if (managementModal) {
            managementModal.remove();
            this.showMenuManagement();
        }
    }

    showCategoryManagement() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Kelola Kategori</h3>
                <div class="category-list">
                    <div class="category-item">
                        <span>Resto</span>
                        <button onclick="alert('Kategori default tidak bisa dihapus')">Hapus</button>
                    </div>
                    <div class="category-item">
                        <span>Cafe</span>
                        <button onclick="alert('Kategori default tidak bisa dihapus')">Hapus</button>
                    </div>
                </div>
                <div class="add-category">
                    <input type="text" id="new-category-name" placeholder="Nama kategori baru">
                    <button onclick="cashier.addCategory()">Tambah Kategori</button>
                </div>
                <div class="modal-buttons">
                    <button onclick="this.closest('.modal').remove()">Tutup</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    addCategory() {
        const categoryName = document.getElementById('new-category-name').value.trim();
        
        if (!categoryName) {
            alert('Mohon masukkan nama kategori');
            return;
        }

        // Update category buttons di footer
        const categoryFooter = document.querySelector('.category-footer');
        const newCategoryBtn = document.createElement('div');
        newCategoryBtn.className = 'cat-btn';
        newCategoryBtn.textContent = categoryName;
        newCategoryBtn.onclick = () => this.filterByCategory(categoryName);
        categoryFooter.appendChild(newCategoryBtn);

        document.getElementById('new-category-name').value = '';
        alert(`Kategori "${categoryName}" berhasil ditambahkan`);
    }

    exportProducts() {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "ID,Nama,Harga,Stok,Kategori\n"
            + this.products.map(product => 
                `${product.id},"${product.name}",${product.price},${product.stock},${product.category}`
            ).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "daftar_produk.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    importProducts() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Import Produk</h3>
                <p>Upload file CSV dengan format: ID,Nama,Harga,Stok,Kategori</p>
                <input type="file" id="import-csv" accept=".csv" onchange="cashier.processImport(this)">
                <div class="modal-buttons">
                    <button onclick="this.closest('.modal').remove()">Batal</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    processImport(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split('\n');
            
            // Skip header
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                const [id, name, price, stock, category] = line.split(',').map(item => item.replace(/"/g, ''));
                
                if (name && price && stock && category) {
                    const existingProduct = this.products.find(p => p.id == id);
                    if (existingProduct) {
                        // Update existing product
                        existingProduct.name = name;
                        existingProduct.price = parseInt(price);
                        existingProduct.stock = parseInt(stock);
                        existingProduct.category = category;
                    } else {
                        // Add new product
                        this.products.push({
                            id: parseInt(id),
                            name,
                            price: parseInt(price),
                            stock: parseInt(stock),
                            category,
                            image: 'https://via.placeholder.com/100'
                        });
                    }
                }
            }
            
            this.renderProducts();
            this.saveToLocalStorage();
            document.querySelector('.modal').remove();
            alert('Import produk berhasil!');
        };
        reader.readAsText(file);
    }

    showCustomItemModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Tambah Item Custom</h3>
                <input type="text" id="custom-item-name" placeholder="Nama Item">
                <input type="number" id="custom-item-price" placeholder="Harga">
                <input type="number" id="custom-item-quantity" placeholder="Jumlah" value="1">
                <div class="modal-buttons">
                    <button onclick="cashier.addCustomItem()">Tambah</button>
                    <button onclick="this.closest('.modal').remove()">Batal</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    addCustomItem() {
        const name = document.getElementById('custom-item-name').value;
        const price = parseInt(document.getElementById('custom-item-price').value);
        const quantity = parseInt(document.getElementById('custom-item-quantity').value);

        if (!name || !price || !quantity) {
            alert('Mohon lengkapi semua field');
            return;
        }

        const customItem = {
            id: Date.now(),
            name,
            price,
            quantity,
            category: 'Custom',
            image: 'https://via.placeholder.com/100'
        };

        this.cart.push(customItem);
        this.updateCart();
        document.querySelector('.modal').remove();
        this.saveToLocalStorage();
    }

    showBarcodeScanner() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Scanner Barcode</h3>
                <input type="text" id="barcode-input" placeholder="Masukkan kode barcode">
                <div class="modal-buttons">
                    <button onclick="cashier.processBarcode()">Scan</button>
                    <button onclick="this.closest('.modal').remove()">Batal</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('barcode-input').focus();
    }

    processBarcode() {
        const barcode = document.getElementById('barcode-input').value;
        if (!barcode) {
            alert('Mohon masukkan kode barcode');
            return;
        }

        const product = this.products.find(p => p.id.toString() === barcode);
        if (product) {
            this.addToCart(product.id);
            document.querySelector('.modal').remove();
        } else {
            alert('Produk tidak ditemukan');
        }
    }

    checkout() {
        if (this.cart.length === 0) {
            alert('Keranjang masih kosong');
            return;
        }

        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * this.taxRate;
        const total = subtotal + tax;

        const receipt = `
            ===== STRUK PEMBAYARAN =====
            Tanggal: ${new Date().toLocaleString('id-ID')}
            
            ${this.cart.map(item => 
                `${item.name} (${item.quantity}x) = ${this.formatCurrency(item.price * item.quantity)}`
            ).join('\n            ')}
            
            Subtotal: ${this.formatCurrency(subtotal)}
            PPN (11%): ${this.formatCurrency(tax)}
            Total: ${this.formatCurrency(total)}
            ===========================
        `;

        if (confirm(`Apakah Anda ingin melanjutkan pembayaran?\n\n${receipt}`)) {
            alert('Pembayaran berhasil! Terima kasih.');
            this.cart = [];
            this.updateCart();
            this.saveToLocalStorage();
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('cashier_cart', JSON.stringify(this.cart));
        localStorage.setItem('cashier_products', JSON.stringify(this.products));
        localStorage.setItem('cashier_customers', JSON.stringify(this.customers));
        localStorage.setItem('cashier_sales', JSON.stringify(this.sales));
    }

    searchProducts(term) {
        this.searchTerm = term;
        this.renderProducts();
    }

    clearSearch() {
        this.searchTerm = '';
        document.getElementById('search-input').value = '';
        this.renderProducts();
    }

    showDiscountModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Pilih Diskon</h3>
                <div class="discount-list">
                    ${this.discounts.map(discount => `
                        <div class="discount-item" onclick="cashier.applyDiscount(${discount.id})">
                            <strong>${discount.name}</strong>
                            <span>${discount.type === 'percentage' ? discount.value + '%' : this.formatCurrency(discount.value)}</span>
                            <small>Min. ${this.formatCurrency(discount.minPurchase)}</small>
                        </div>
                    `).join('')}
                    <div class="discount-item" onclick="cashier.removeDiscount()">
                        <strong>Hapus Diskon</strong>
                    </div>
                </div>
                <div class="modal-buttons">
                    <button onclick="this.closest('.modal').remove()">Tutup</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    applyDiscount(discountId) {
        const discount = this.discounts.find(d => d.id === discountId);
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (subtotal < discount.minPurchase) {
            alert(`Minimum pembelian ${this.formatCurrency(discount.minPurchase)}`);
            return;
        }

        if (discount.customerType && this.currentCustomer && this.currentCustomer.type !== discount.customerType) {
            alert('Diskon hanya berlaku untuk tipe pelanggan tertentu');
            return;
        }

        this.currentDiscount = discount;
        this.updateCart();
        document.querySelector('.modal').remove();
    }

    removeDiscount() {
        this.currentDiscount = null;
        this.updateCart();
        document.querySelector('.modal').remove();
    }

    showCustomerModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Pilih Pelanggan</h3>
                <div class="customer-list">
                    ${this.customers.map(customer => `
                        <div class="customer-item" onclick="cashier.selectCustomer(${customer.id})">
                            <strong>${customer.name}</strong>
                            <span>${customer.phone}</span>
                            <small>${customer.type}</small>
                        </div>
                    `).join('')}
                    <div class="customer-item" onclick="cashier.addNewCustomer()">
                        <strong>+ Tambah Pelanggan Baru</strong>
                    </div>
                </div>
                <div class="modal-buttons">
                    <button onclick="this.closest('.modal').remove()">Tutup</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    selectCustomer(customerId) {
        this.currentCustomer = this.customers.find(c => c.id === customerId);
        document.querySelector('.header-blue').innerHTML = `
            ${this.currentCustomer.name} <span class="plus-icon">+</span>
        `;
        document.querySelector('.modal').remove();
    }

    addNewCustomer() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Tambah Pelanggan Baru</h3>
                <input type="text" id="new-customer-name" placeholder="Nama Pelanggan">
                <input type="text" id="new-customer-phone" placeholder="Nomor Telepon">
                <select id="new-customer-type">
                    <option value="regular">Regular</option>
                    <option value="member">Member</option>
                    <option value="vip">VIP</option>
                </select>
                <div class="modal-buttons">
                    <button onclick="cashier.saveNewCustomer()">Simpan</button>
                    <button onclick="this.closest('.modal').remove()">Batal</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    saveNewCustomer() {
        const name = document.getElementById('new-customer-name').value;
        const phone = document.getElementById('new-customer-phone').value;
        const type = document.getElementById('new-customer-type').value;

        if (!name) {
            alert('Nama pelanggan harus diisi');
            return;
        }

        const newCustomer = {
            id: this.customers.length + 1,
            name,
            phone: phone || '-',
            type
        };

        this.customers.push(newCustomer);
        this.selectCustomer(newCustomer.id);
        this.saveToLocalStorage();
    }

    showReports() {
        const modal = document.createElement('div');
        modal.className = 'modal large-modal';
        modal.innerHTML = `
            <div class="modal-content large">
                <h3>Laporan Penjualan</h3>
                <div class="report-filters">
                    <select id="report-period">
                        <option value="today">Hari Ini</option>
                        <option value="week">Minggu Ini</option>
                        <option value="month">Bulan Ini</option>
                    </select>
                    <button onclick="cashier.generateReport()">Generate</button>
                </div>
                <div id="report-content" class="report-content">
                    <p>Klik Generate untuk melihat laporan</p>
                </div>
                <div class="modal-buttons">
                    <button onclick="cashier.exportReport()">Export CSV</button>
                    <button onclick="this.closest('.modal').remove()">Tutup</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    generateReport() {
        const period = document.getElementById('report-period').value;
        const now = new Date();
        let filteredSales = this.sales;

        if (period === 'today') {
            filteredSales = this.sales.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.toDateString() === now.toDateString();
            });
        } else if (period === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filteredSales = this.sales.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate >= weekAgo;
            });
        } else if (period === 'month') {
            filteredSales = this.sales.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.getMonth() === now.getMonth() && 
                       saleDate.getFullYear() === now.getFullYear();
            });
        }

        const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
        const totalItems = filteredSales.reduce((sum, sale) => sum + sale.items.length, 0);

        const reportHTML = `
            <div class="report-summary">
                <div class="summary-card">
                    <h4>Total Transaksi</h4>
                    <p>${filteredSales.length}</p>
                </div>
                <div class="summary-card">
                    <h4>Total Pendapatan</h4>
                    <p>${this.formatCurrency(totalRevenue)}</p>
                </div>
                <div class="summary-card">
                    <h4>Total Item</h4>
                    <p>${totalItems}</p>
                </div>
            </div>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Tanggal</th>
                        <th>Pelanggan</th>
                        <th>Items</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredSales.slice(-10).reverse().map(sale => `
                        <tr>
                            <td>${new Date(sale.date).toLocaleString('id-ID')}</td>
                            <td>${sale.customer}</td>
                            <td>${sale.items.map(item => item.name).join(', ')}</td>
                            <td>${this.formatCurrency(sale.total)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        document.getElementById('report-content').innerHTML = reportHTML;
    }

    exportReport() {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Tanggal,Pelanggan,Items,Total\n"
            + this.sales.map(sale => 
                `${sale.date},${sale.customer},"${sale.items.map(item => item.name).join('; ')}",${sale.total}`
            ).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "laporan_penjualan.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    showCustomers() {
        const modal = document.createElement('div');
        modal.className = 'modal large-modal';
        modal.innerHTML = `
            <div class="modal-content large">
                <h3>Manajemen Pelanggan</h3>
                <div class="customer-actions">
                    <button onclick="cashier.addNewCustomer()">+ Tambah Pelanggan</button>
                </div>
                <table class="customer-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nama</th>
                            <th>Telepon</th>
                            <th>Tipe</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.customers.map(customer => `
                            <tr>
                                <td>${customer.id}</td>
                                <td>${customer.name}</td>
                                <td>${customer.phone}</td>
                                <td>${customer.type}</td>
                                <td>
                                    <button onclick="cashier.editCustomer(${customer.id})">Edit</button>
                                    <button onclick="cashier.deleteCustomer(${customer.id})">Hapus</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="modal-buttons">
                    <button onclick="this.closest('.modal').remove()">Tutup</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    editCustomer(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Edit Pelanggan</h3>
                <input type="text" id="edit-customer-name" value="${customer.name}" placeholder="Nama Pelanggan">
                <input type="text" id="edit-customer-phone" value="${customer.phone}" placeholder="Nomor Telepon">
                <select id="edit-customer-type">
                    <option value="regular" ${customer.type === 'regular' ? 'selected' : ''}>Regular</option>
                    <option value="member" ${customer.type === 'member' ? 'selected' : ''}>Member</option>
                    <option value="vip" ${customer.type === 'vip' ? 'selected' : ''}>VIP</option>
                </select>
                <div class="modal-buttons">
                    <button onclick="cashier.saveCustomerEdit(${customerId})">Simpan</button>
                    <button onclick="this.closest('.modal').remove()">Batal</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    saveCustomerEdit(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) return;

        const name = document.getElementById('edit-customer-name').value;
        const phone = document.getElementById('edit-customer-phone').value;
        const type = document.getElementById('edit-customer-type').value;

        if (!name || !phone) {
            alert('Mohon lengkapi semua field');
            return;
        }

        customer.name = name;
        customer.phone = phone;
        customer.type = type;

        this.saveToLocalStorage();
        document.querySelectorAll('.modal').forEach(modal => modal.remove());
        
        // Refresh customer modal
        this.showCustomers();
    }

    deleteCustomer(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) return;

        if (customer.name === 'Walk-in Customer') {
            alert('Walk-in Customer tidak dapat dihapus');
            return;
        }

        if (!confirm(`Apakah Anda yakin ingin menghapus pelanggan ${customer.name}?`)) {
            return;
        }

        this.customers = this.customers.filter(c => c.id !== customerId);
        this.saveToLocalStorage();
        
        // Refresh customer modal
        document.querySelectorAll('.modal').forEach(modal => modal.remove());
        this.showCustomers();
    }

    printReceipt() {
        if (this.cart.length === 0) {
            alert('Keranjang masih kosong');
            return;
        }

        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let discount = 0;
        
        if (this.currentDiscount) {
            if (this.currentDiscount.type === 'percentage') {
                discount = subtotal * (this.currentDiscount.value / 100);
            } else {
                discount = this.currentDiscount.value;
            }
        }
        
        const afterDiscount = subtotal - discount;
        const tax = afterDiscount * this.taxRate;
        const total = afterDiscount + tax;

        // Detect platform
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        const receiptContent = `
            <html>
                <head>
                    <title>Struk Pembayaran</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { 
                            font-family: 'Courier New', monospace; 
                            font-size: 12px; 
                            padding: 20px;
                            background: white;
                            color: black;
                            width: 100%;
                            max-width: 300px;
                            margin: 0 auto;
                        }
                        .receipt { 
                            width: 100%;
                            padding: 15px;
                        }
                        .header { 
                            text-align: center; 
                            margin-bottom: 15px; 
                            border-bottom: 1px dashed #000;
                            padding-bottom: 10px;
                        }
                        .header h1 { 
                            font-size: 18px; 
                            font-weight: bold; 
                            margin-bottom: 5px;
                        }
                        .header p { 
                            font-size: 11px; 
                            margin: 3px 0;
                        }
                        .items { 
                            margin: 15px 0; 
                        }
                        .item { 
                            display: flex; 
                            justify-content: space-between; 
                            margin: 5px 0;
                            font-size: 11px;
                        }
                        .item-name { 
                            flex: 1; 
                            white-space: nowrap; 
                            overflow: hidden; 
                            text-overflow: ellipsis;
                        }
                        .item-qty { 
                            margin-right: 10px;
                        }
                        .item-price { 
                            text-align: right;
                            min-width: 60px;
                        }
                        .total { 
                            border-top: 1px dashed #000; 
                            padding-top: 10px; 
                            margin-top: 15px;
                        }
                        .total-row { 
                            display: flex; 
                            justify-content: space-between; 
                            margin: 5px 0;
                            font-size: 11px;
                        }
                        .grand-total { 
                            font-weight: bold; 
                            font-size: 14px;
                            margin-top: 8px;
                            border-top: 1px solid #000;
                            padding-top: 8px;
                        }
                        .footer { 
                            text-align: center; 
                            margin-top: 20px;
                            border-top: 1px dashed #000;
                            padding-top: 10px;
                        }
                        .footer p { 
                            font-size: 11px; 
                            margin: 3px 0;
                        }
                        .print-actions {
                            position: fixed;
                            top: 10px;
                            right: 10px;
                            display: flex;
                            gap: 10px;
                            z-index: 1000;
                        }
                        .print-actions button {
                            padding: 8px 16px;
                            background: #667eea;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 14px;
                        }
                        .print-actions button:hover {
                            background: #5568d3;
                        }
                        @media print {
                            .print-actions { display: none; }
                            body { 
                                padding: 0; 
                                width: 80mm;
                                max-width: 80mm;
                                margin: 0;
                            }
                            .receipt { 
                                width: 80mm;
                                max-width: 80mm;
                                margin: 0;
                                padding: 5px;
                            }
                            .header { margin-bottom: 5px; padding-bottom: 5px; }
                            .header h1 { font-size: 14px; }
                            .header p { font-size: 9px; margin: 1px 0; }
                            .items { margin: 5px 0; }
                            .item { margin: 2px 0; font-size: 9px; }
                            .item-qty { margin-right: 5px; }
                            .item-price { min-width: 15mm; }
                            .total { padding-top: 5px; margin-top: 5px; }
                            .total-row { margin: 2px 0; font-size: 9px; }
                            .grand-total { font-size: 12px; margin-top: 3px; padding-top: 3px; }
                            .footer { margin-top: 8px; padding-top: 5px; }
                            .footer p { font-size: 9px; margin: 1px 0; }
                        }
                        @page {
                            size: 80mm auto;
                            margin: 0;
                        }
                        @media screen and (max-width: 768px) {
                            body { 
                                max-width: 100%;
                                padding: 10px;
                            }
                            .receipt { padding: 10px; }
                        }
                        @media screen and (min-width: 769px) {
                            body { 
                                max-width: 80mm;
                                margin: 0 auto;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="print-actions">
                        <button onclick="window.print()">Print</button>
                        <button onclick="window.close()">Tutup</button>
                    </div>
                    <div class="receipt">
                        <div class="header">
                            <h1>VIOLA KASIR</h1>
                            <p>${new Date().toLocaleString('id-ID')}</p>
                            <p>Pelanggan: ${this.currentCustomer ? this.currentCustomer.name : 'Walk-in'}</p>
                        </div>
                        <div class="items">
                            ${this.cart.map(item => `
                                <div class="item">
                                    <span class="item-name">${item.name}</span>
                                    <span class="item-qty">${item.quantity}x</span>
                                    <span class="item-price">${this.formatCurrency(item.price * item.quantity)}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="total">
                            <div class="total-row">
                                <span>Subtotal</span>
                                <span>${this.formatCurrency(subtotal)}</span>
                            </div>
                            ${discount > 0 ? `
                                <div class="total-row">
                                    <span>Diskon (${this.currentDiscount.name})</span>
                                    <span>-${this.formatCurrency(discount)}</span>
                                </div>
                            ` : ''}
                            <div class="total-row">
                                <span>PPN 11%</span>
                                <span>${this.formatCurrency(tax)}</span>
                            </div>
                            <div class="total-row grand-total">
                                <span>TOTAL</span>
                                <span>${this.formatCurrency(total)}</span>
                            </div>
                        </div>
                        <div class="footer">
                            <p>Terima Kasih</p>
                            <p>Selamat Berbelanja Kembali</p>
                        </div>
                    </div>
                    <script>
                        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                        if (!isMobile) {
                            window.onload = function() {
                                setTimeout(function() {
                                    window.print();
                                }, 500);
                            }
                        }
                    </script>
                </body>
            </html>
        `;

        try {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(receiptContent);
                printWindow.document.close();
            } else {
                // Fallback: show in current window if popup blocked
                alert('Popup diblokir. Silakan izinkan popup untuk print struk.');
            }
        } catch (e) {
            console.error('Print error:', e);
            alert('Gagal membuka window print. Silakan izinkan popup.');
        }
    }

    checkout() {
        if (this.cart.length === 0) {
            alert('Keranjang masih kosong');
            return;
        }

        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let discount = 0;
        
        if (this.currentDiscount) {
            if (this.currentDiscount.type === 'percentage') {
                discount = subtotal * (this.currentDiscount.value / 100);
            } else {
                discount = this.currentDiscount.value;
            }
        }
        
        const afterDiscount = subtotal - discount;
        const tax = afterDiscount * this.taxRate;
        const total = afterDiscount + tax;

        // Check stock availability before confirming
        const outOfStock = this.cart.find(ci => {
            const prod = this.products.find(p => p.id === ci.id);
            return prod && prod.stock < ci.quantity;
        });

        if (outOfStock) {
            this.showToast('Stok tidak mencukupi untuk beberapa item', 'error');
            return;
        }

        if (!confirm(`Total pembayaran: ${this.formatCurrency(total)}\n\nLanjutkan pembayaran?`)) {
            return;
        }

        // Disable UI while processing
        const totalBtn = document.querySelector('.receipt-footer .total-button');
        const actionBtns = document.querySelectorAll('.action-buttons button');
        if (totalBtn) {
            totalBtn.classList.add('disabled');
            totalBtn.textContent = 'Processing...';
        }
        actionBtns.forEach(b => b.disabled = true);

        // Simulate processing delay then finalize
        setTimeout(() => {
            const sale = {
                id: this.sales.length + 1,
                date: new Date().toISOString(),
                customer: this.currentCustomer ? this.currentCustomer.name : 'Walk-in',
                items: [...this.cart],
                subtotal,
                discount,
                tax,
                total
            };

            this.sales.push(sale);

            // Update stock
            this.cart.forEach(cartItem => {
                const product = this.products.find(p => p.id === cartItem.id);
                if (product) {
                    product.stock -= cartItem.quantity;
                }
            });

            this.showToast('Pembayaran berhasil!', 'success');

            // Low stock warnings
            this.cart.forEach(ci => {
                const p = this.products.find(x => x.id === ci.id);
                if (p && p.stock <= 5) {
                    this.showToast(`${p.name} stok tersisa ${p.stock}`, 'info', 4000);
                }
            });

            this.cart = [];
            this.currentCustomer = null;
            this.currentDiscount = null;
            this.updateCart();
            this.renderProducts();
            this.saveToLocalStorage();

            // Re-enable UI
            actionBtns.forEach(b => b.disabled = false);
            if (totalBtn) {
                // updateTotals will rewrite the button, so just remove disabled class
                totalBtn.classList.remove('disabled');
            }
        }, 600);
    }

    migrateProductImages() {
        const placeholderUrl = 'https://via.placeholder.com/100';
        const unsplashImages = [
            'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?w=200&h=200&fit=crop'
        ];
        
        let migrated = false;
        this.products.forEach((product, index) => {
            if (product.image === placeholderUrl || product.image.includes('via.placeholder.com')) {
                // Gunakan gambar Unsplash berdasarkan index
                product.image = unsplashImages[index % unsplashImages.length];
                migrated = true;
            }
        });
        
        if (migrated) {
            this.saveToLocalStorage();
        }
    }

    loadFromLocalStorage() {
        const savedCart = localStorage.getItem('cashier_cart');
        const savedProducts = localStorage.getItem('cashier_products');
        const savedCustomers = localStorage.getItem('cashier_customers');
        const savedSales = localStorage.getItem('cashier_sales');

        if (savedCart) {
            this.cart = JSON.parse(savedCart);
            this.updateCart();
        }

        if (savedProducts) {
            this.products = JSON.parse(savedProducts);
            // Migrasi gambar placeholder ke Unsplash
            this.migrateProductImages();
            this.renderProducts();
        }

        if (savedCustomers) {
            this.customers = JSON.parse(savedCustomers);
        }

        if (savedSales) {
            this.sales = JSON.parse(savedSales);
        }
    }
}

const cashier = new CashierSystem();

const modalStyles = `
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    max-width: 400px;
    width: 90%;
}

.modal-content h3 {
    margin-bottom: 20px;
    color: #333;
}

.modal-content input, .modal-content select {
    width: 100%;
    padding: 10px;
    margin-bottom: 15px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
}

.modal-content input:focus, .modal-content select:focus {
    outline: none;
    border-color: #2196F3;
}

.modal-buttons {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.modal-buttons button {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
}

.modal-buttons button:first-child {
    background: linear-gradient(45deg, #4CAF50, #45a049);
    color: white;
}

.modal-buttons button:last-child {
    background: #f44336;
    color: white;
}

.modal-buttons button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = modalStyles;
document.head.appendChild(styleSheet);
