// js/products.js
const API_BASE_URL = 'http://localhost:8080/api';

let allProducts = [];
let filteredProducts = [];

document.addEventListener('DOMContentLoaded', function() {
    loadAllProducts();
    updateCartCount();
    setupSearch();
});

async function loadAllProducts() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/products`);
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        displayProducts();
        hideLoading();
    } catch (error) {
        console.error('Error loading products:', error);
        hideLoading();
    }
}

function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your search or filter criteria</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <img src="${product.imageUrl || 'images/placeholder.jpg'}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">$${product.price}</div>
                <div class="product-rating">
                    ${generateStarRating(getAverageRating(product.ratings))}
                    <span class="rating-count">(${product.ratings ? product.ratings.length : 0})</span>
                </div>
                <button class="add-to-cart" onclick="addToCart('${product.id}')">
                    Add to Cart
                </button>
                <a href="product-detail.html?id=${product.id}" class="view-details">View Details</a>
            </div>
        </div>
    `).join('');
}

function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    return stars;
}

function getAverageRating(ratings) {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return sum / ratings.length;
}

function filterProducts() {
    const category = document.getElementById('categorySelect').value;
    const priceRange = document.getElementById('priceSelect').value;
    
    filteredProducts = allProducts.filter(product => {
        let categoryMatch = !category || product.category === category;
        let priceMatch = true;
        
        if (priceRange) {
            const price = parseFloat(product.price);
            switch (priceRange) {
                case '0-25':
                    priceMatch = price <= 25;
                    break;
                case '25-50':
                    priceMatch = price > 25 && price <= 50;
                    break;
                case '50-100':
                    priceMatch = price > 50 && price <= 100;
                    break;
                case '100+':
                    priceMatch = price > 100;
                    break;
            }
        }
        
        return categoryMatch && priceMatch;
    });
    
    displayProducts();
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
    }
}

function searchProducts() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    
    if (!query) {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        );
    }
    
    displayProducts();
}

function showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = 'block';
    }
}

function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

// Cart functionality (from main.js)
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Product added to cart!');
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
