// js/auth.js
const API_BASE_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    checkAdminAccess();
});

function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => button.classList.remove('active'));
    
    // Show selected tab content
    document.getElementById(tabName).classList.add('active');
    
    // Activate selected tab button
    event.target.classList.add('active');
}

// Login Form
document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        // In a real application, you would implement proper authentication
        const users = await fetch(`${API_BASE_URL}/users`).then(res => res.json());
        const user = users.find(u => u.email === email);
        
        if (user) {
            // Simple password check (in real app, use proper hashing)
            if (user.password === password) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                showNotification('Login successful!');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                showNotification('Invalid password');
            }
        } else {
            showNotification('User not found');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.');
    }
});

// Register Form
document.getElementById('registerForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const userData = {
        username: document.getElementById('registerName').value,
        email: document.getElementById('registerEmail').value,
        password: document.getElementById('registerPassword').value,
        role: 'CUSTOMER',
        phone: document.getElementById('registerPhone').value,
        address: document.getElementById('registerAddress').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            showNotification('Registration successful! Please login.');
            showTab('login');
            document.getElementById('registerForm').reset();
        } else {
            throw new Error('Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.');
    }
});

// Admin Login Form
document.getElementById('adminForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    try {
        const users = await fetch(`${API_BASE_URL}/users`).then(res => res.json());
        const adminUser = users.find(user => user.email === email && user.role === 'ADMIN');
        
        if (adminUser && adminUser.password === password) {
            localStorage.setItem('adminUser', JSON.stringify(adminUser));
            showNotification('Admin login successful!');
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
        } else {
            showNotification('Invalid admin credentials');
        }
    } catch (error) {
        console.error('Admin login error:', error);
        showNotification('Admin login failed. Please try again.');
    }
});

function checkAdminAccess() {
    if (window.location.pathname.includes('admin.html')) {
        const adminUser = JSON.parse(localStorage.getItem('adminUser'));
        if (!adminUser || adminUser.role !== 'ADMIN') {
            window.location.href = 'login.html';
        }
    }
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
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
