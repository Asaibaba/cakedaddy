// js/product-detail.js
const API_BASE_URL = 'http://localhost:8080/api';

let currentProduct = null;
let currentRating = 0;

document.addEventListener('DOMContentLoaded', function() {
    loadProductDetails();
    setupRatingStars();
    updateCartCount();
});

async function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        window.location.href = 'products.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        if (!response.ok) {
            throw new Error('Product not found');
        }
        
        currentProduct = await response.json();
        displayProductDetails();
        displayReviews();
    } catch (error) {
        console.error('Error loading product:', error);
        window.location.href = 'products.html';
    }
}

function displayProductDetails() {
    const productDetail = document.getElementById('productDetail');
    if (!productDetail || !currentProduct) return;

    productDetail.innerHTML = `
        <div class="product-image-section">
            <img src="${currentProduct.imageUrl || 'images/placeholder.jpg'}" 
                 alt="${currentProduct.name}" 
                 class="product-image-large">
        </div>
        <div class="product-info-detail">
            <h1>${currentProduct.name}</h1>
            <div class="product-price-detail">$${currentProduct.price}</div>
            <div class="product-rating-overview">
                ${generateStarRating(getAverageRating(currentProduct.ratings))}
                <span class="rating-text">${getAverageRating(currentProduct.ratings).toFixed(1)} 
                (${currentProduct.ratings ? currentProduct.ratings.length : 0} reviews)</span>
            </div>
            <p class="product-description-detail">${currentProduct.description}</p>
            <div class="product-meta">
                <div class="meta-item">
                    <i class="fas fa-box"></i>
                    <span>In Stock: ${currentProduct.stockQuantity}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-tag"></i>
                    <span>Category: ${currentProduct.category}</span>
                </div>
            </div>
            <div class="quantity-selector">
                <label for="quantity">Quantity:</label>
                <button class="quantity-btn" onclick="updateQuantity(-1)">-</button>
                <input type="number" id="quantity" class="quantity-input" value="1" min="1" max="${currentProduct.stockQuantity}">
                <button class="quantity-btn" onclick="updateQuantity(1)">+</button>
            </div>
            <div class="product-actions">
                <button class="cta-button add-to-cart-btn" onclick="addToCart()">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
                <button class="buy-now-btn" onclick="buyNow()">
                    <i class="fas fa-bolt"></i> Buy Now
                </button>
            </div>
        </div>
    `;
}

function displayReviews() {
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList || !currentProduct) return;

    const reviews = currentProduct.ratings || [];
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = `
            <div class="no-reviews">
                <i class="fas fa-comment-slash"></i>
                <h3>No reviews yet</h3>
                <p>Be the first to review this product!</p>
            </div>
        `;
        return;
    }

    reviewsList.innerHTML = reviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <div class="review-author">${review.userName}</div>
                <div class="review-rating">${generateStarRating(review.rating)}</div>
            </div>
            <div class="review-date">${formatDate(review.createdAt)}</div>
            <div class="review-comment">${review.comment}</div>
        </div>
    `).join('');
}

function setupRatingStars() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('star')) {
            const rating = parseInt(e.target.dataset.rating);
            setRating(rating);
        }
    });
}

function setRating(rating) {
    currentRating = rating;
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
    document.getElementById('ratingValue').value = rating;
}

document.getElementById('reviewForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const rating = currentRating;
    const userName = document.getElementById('userName').value;
    const comment = document.getElementById('reviewComment').value;
    
    if (rating === 0) {
        alert('Please select a rating');
        return;
    }
    
    if (!userName || !comment) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/products/${currentProduct.id}/ratings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: 'user_' + Date.now(),
                userName: userName,
                rating: rating,
                comment: comment
            })
        });

        if (response.ok) {
            showNotification('Review submitted successfully!');
            document.getElementById('reviewForm').reset();
            setRating(0);
            // Reload product to show new review
            loadProductDetails();
        } else {
            throw new Error('Failed to submit review');
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        showNotification('Error submitting review');
    }
});

function updateQuantity(change) {
    const quantityInput = document.getElementById('quantity');
    let quantity = parseInt(quantityInput.value) + change;
    quantity = Math.max(1, Math.min(quantity, currentProduct.stockQuantity));
    quantityInput.value = quantity;
}

function addToCart() {
    const quantity = parseInt(document.getElementById('quantity').value);
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === currentProduct.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            imageUrl: currentProduct.imageUrl,
            quantity: quantity
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Product added to cart!');
}

function buyNow() {
    addToCart();
    setTimeout(() => {
        window.location.href = 'cart.html';
    }, 1000);
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

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
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
