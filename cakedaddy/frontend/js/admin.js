// js/admin.js
const API_BASE_URL = 'http://localhost:8080/api';

let products = [];
let orders = [];
let users = [];

document.addEventListener('DOMContentLoaded', function() {
    checkAdminAccess();
    loadAdminData();
    setupEventListeners();
});

function checkAdminAccess() {
    const adminUser = JSON.parse(localStorage.getItem('adminUser'));
    if (!adminUser || adminUser.role !== 'ADMIN') {
        window.location.href = 'login.html';
        return;
    }
}

async function loadAdminData() {
    try {
        await Promise.all([
            loadProducts(),
            loadOrders(),
            loadUsers()
        ]);
    } catch (error) {
        console.error('Error loading admin data:', error);
        showNotification('Error loading data');
    }
}

async function loadProducts() {
    const response = await fetch(`${API_BASE_URL}/products`);
    products = await response.json();
    displayProducts();
}

async function loadOrders() {
    const response = await fetch(`${API_BASE_URL}/orders`);
    orders = await response.json();
    displayOrders();
}

async function loadUsers() {
    const response = await fetch(`${API_BASE_URL}/users`);
    users = await response.json();
    displayUsers();
}

function displayProducts() {
    const productsGrid = document.getElementById('adminProductsGrid');
    if (!productsGrid) return;

    productsGrid.innerHTML = products.map(product => `
        <div class="admin-product-card">
            <img src="${product.imageUrl || 'images/placeholder.jpg'}" 
                 alt="${product.name}" 
                 style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 15px;">
            <h3>${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-details">
                <div><strong>Price:</strong> $${product.price}</div>
                <div><strong>Category:</strong> ${product.category}</div>
                <div><strong>Stock:</strong> ${product.stockQuantity}</div>
                <div><strong>Ratings:</strong> ${product.ratings ? product.ratings.length : 0}</div>
            </div>
            <div class="admin-actions">
                <button class="edit-btn" onclick="editProduct('${product.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-btn" onclick="deleteProduct('${product.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function displayOrders() {
    const ordersTableBody = document.getElementById('ordersTableBody');
    if (!ordersTableBody) return;

    ordersTableBody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.id.substring(0, 8)}...</td>
            <td>${order.customerName}</td>
            <td>$${order.totalAmount}</td>
            <td>
                <select onchange="updateOrderStatus('${order.id}', this.value)" 
                        style="padding: 5px; border-radius: 5px; border: 1px solid #ddd;">
                    <option value="PENDING" ${order.status === 'PENDING' ? 'selected' : ''}>Pending</option>
                    <option value="CONFIRMED" ${order.status === 'CONFIRMED' ? 'selected' : ''}>Confirmed</option>
                    <option value="BAKING" ${order.status === 'BAKING' ? 'selected' : ''}>Baking</option>
                    <option value="READY" ${order.status === 'READY' ? 'selected' : ''}>Ready</option>
                    <option value="DELIVERED" ${order.status === 'DELIVERED' ? 'selected' : ''}>Delivered</option>
                    <option value="CANCELLED" ${order.status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td>${new Date(order.orderDate).toLocaleDateString()}</td>
            <td>
                <button class="view-order-btn" onclick="viewOrderDetails('${order.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        </tr>
    `).join('');
}

function displayUsers() {
    const usersTableBody = document.getElementById('usersTableBody');
    if (!usersTableBody) return;

    usersTableBody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id.substring(0, 8)}...</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>
                <span class="role-badge ${user.role.toLowerCase()}">${user.role}</span>
            </td>
            <td>
                <button class="edit-btn" onclick="editUser('${user.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteUser('${user.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function showAdminTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.admin-tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.admin-tab-button');
    tabButtons.forEach(button => button.classList.remove('active'));
    
    // Show selected tab content
    document.getElementById(tabName).classList.add('active');
    
    // Activate selected tab button
    event.target.classList.add('active');
}

// Product Management
document.getElementById('addProductForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const productData = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        stockQuantity: parseInt(document.getElementById('productStock').value),
        imageUrl: 'images/placeholder.jpg' // In real app, handle image upload
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            showNotification('Product added successfully!');
            document.getElementById('addProductForm').reset();
            loadProducts(); // Reload products
            showAdminTab('products'); // Switch to products tab
        } else {
            throw new Error('Failed to add product');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        showNotification('Error adding product');
    }
});

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('Product deleted successfully!');
            loadProducts(); // Reload products
        } else {
            throw new Error('Failed to delete product');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Error deleting product');
    }
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        // Populate edit form (you might want to create a separate edit modal)
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productStock').value = product.stockQuantity;
        
        showAdminTab('addProduct');
        showNotification('Edit the product details and click "Update Product"');
    }
}

// Order Management
async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status?status=${newStatus}`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            showNotification(`Order status updated to ${newStatus}`);
            loadOrders(); // Reload orders
        } else {
            throw new Error('Failed to update order status');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showNotification('Error updating order status');
    }
}

function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        const details = `
Order ID: ${order.id}
Customer: ${order.customerName}
Email: ${order.email}
Phone: ${order.phone}
Address: ${order.deliveryAddress}
Total: $${order.totalAmount}
Status: ${order.status}
Order Date: ${new Date(order.orderDate).toLocaleString()}
Special Instructions: ${order.specialInstructions || 'None'}

Items:
${order.items.map(item => `- ${item.productName} × ${item.quantity} - $${item.price}`).join('\n')}
        `;
        alert(details);
    }
}

// User Management
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('User deleted successfully!');
            loadUsers(); // Reload users
        } else {
            throw new Error('Failed to delete user');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Error deleting user');
    }
}

function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        // In a real application, you would show an edit form/modal
        const newRole = prompt('Enter new role (ADMIN/CUSTOMER):', user.role);
        if (newRole && ['ADMIN', 'CUSTOMER'].includes(newRole.toUpperCase())) {
            updateUserRole(userId, newRole.toUpperCase());
        }
    }
}

async function updateUserRole(userId, newRole) {
    try {
        const user = users.find(u => u.id === userId);
        if (user) {
            user.role = newRole;
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            });
            
            if (response.ok) {
                showNotification('User role updated successfully!');
                loadUsers(); // Reload users
            } else {
                throw new Error('Failed to update user role');
            }
        }
    } catch (error) {
        console.error('Error updating user role:', error);
        showNotification('Error updating user role');
    }
}

function setupEventListeners() {
    // Add any additional event listeners here
}

function logout() {
    localStorage.removeItem('adminUser');
    window.location.href = 'login.html';
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #e91e63;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
