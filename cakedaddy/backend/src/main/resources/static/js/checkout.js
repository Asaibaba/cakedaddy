// js/checkout.js
const API_BASE_URL = 'http://localhost:8080/api';
let cart = JSON.parse(localStorage.getItem('cart')) || [];

document.addEventListener('DOMContentLoaded', function() {
    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    displayOrderItems();
    updateOrderSummary();
    updateCartCount();
    setupFormValidation();
});

function displayOrderItems() {
    const orderItems = document.getElementById('orderItems');
    
    orderItems.innerHTML = cart.map(item => `
        <div class="order-item">
            <div class="item-info">
                <span class="item-name">${item.name} × ${item.quantity}</span>
            </div>
            <span class="item-total">$${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');
}

function updateOrderSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const shipping = 5.00;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    document.getElementById('orderSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('orderShipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('orderTax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('orderTotal').textContent = `$${total.toFixed(2)}`;
}

function setupFormValidation() {
    const form = document.getElementById('checkoutForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            await placeOrder();
        }
    });

    // Real-time validation
    const inputs = form.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
}

function validateForm() {
    const form = document.getElementById('checkoutForm');
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Remove existing error
    field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Validation rules
    switch (field.id) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            break;
        case 'phone':
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
            break;
        case 'cardNumber':
            const cardRegex = /^[0-9]{16}$/;
            const cleanCardNumber = value.replace(/\s/g, '');
            if (!cardRegex.test(cleanCardNumber)) {
                isValid = false;
                errorMessage = 'Please enter a valid 16-digit card number';
            }
            break;
        case 'expiryDate':
            const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
            if (!expiryRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid expiry date (MM/YY)';
            }
            break;
        case 'cvv':
            const cvvRegex = /^[0-9]{3,4}$/;
            if (!cvvRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid CVV';
            }
            break;
        default:
            if (!value) {
                isValid = false;
                errorMessage = 'This field is required';
            }
    }

    if (!isValid) {
        field.classList.add('error');
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = errorMessage;
        errorElement.style.cssText = 'color: #e74c3c; font-size: 0.8rem; margin-top: 5px;';
        field.parentNode.appendChild(errorElement);
    }

    return isValid;
}

async function placeOrder() {
    const formData = new FormData(document.getElementById('checkoutForm'));
    const orderData = {
        userId: 'user_' + Date.now(), // In real app, use logged-in user ID
        customerName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        deliveryAddress: formData.get('address'),
        items: cart.map(item => ({
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        totalAmount: parseFloat(document.getElementById('orderTotal').textContent.replace('$', '')),
        specialInstructions: formData.get('specialInstructions')
    };

    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            const order = await response.json();
            localStorage.removeItem('cart');
            showSuccessMessage(order.id);
        } else {
            throw new Error('Failed to place order');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        showNotification('Error placing order. Please try again.');
    }
}

function showSuccessMessage(orderId) {
    const successHTML = `
        <div class="order-success">
            <i class="fas fa-check-circle"></i>
            <h2>Order Placed Successfully!</h2>
            <p>Thank you for your order. Your order ID is: <strong>${orderId}</strong></p>
            <p>We'll send a confirmation email shortly.</p>
            <div class="success-actions">
                <a href="products.html" class="cta-button">Continue Shopping</a>
                <a href="index.html" class="secondary-button">Back to Home</a>
            </div>
        </div>
    `;
    
    document.querySelector('.checkout-container').innerHTML = successHTML;
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
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
