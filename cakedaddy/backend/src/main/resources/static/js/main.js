// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// DOM Elements
const featuredProductsGrid = document.getElementById('featuredProducts');
const cartCount = document.querySelector('.cart-count');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadFeaturedProducts();
    setupEventListeners();
    updateCartCount();
    startCountdownTimer();
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Fade in elements on scroll
    const fadeElements = document.querySelectorAll('.fade-in');
    const fadeInOnScroll = function() {
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    };
    
    fadeInOnScroll();
    window.addEventListener('scroll', fadeInOnScroll);
});

// Setup event listeners
function setupEventListeners() {
    // Hamburger menu toggle
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            document.querySelector('.nav-menu').classList.toggle('active');
        });
    }
}

// Load featured products from API with 75/25 layout
async function loadFeaturedProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const products = await response.json();

        const carousel = document.getElementById('featuredCarousel');
        const list = document.getElementById('featuredList');

        // Left side: scrolling images carousel (75%)
        if (carousel) {
            carousel.classList.add('featured-carousel');
            carousel.innerHTML = products.slice(0, 10).map(p => `
                <div class="carousel-item">
                    <img src="${p.imageUrl || 'images/placeholder.jpg'}" alt="${p.name}" class="carousel-image">
                    <div class="carousel-overlay">
                        <h3>${p.name}</h3>
                    </div>
                </div>
            `).join('');

            // Auto-scroll carousel effect
            setTimeout(() => {
                if (carousel.scrollHeight > carousel.clientHeight) {
                    let scrollSpeed = 0.8;
                    let interval = setInterval(() => {
                        if (!carousel || !carousel.parentElement) {
                            clearInterval(interval);
                            return;
                        }
                        carousel.scrollTop += scrollSpeed;
                        if (carousel.scrollTop >= carousel.scrollHeight - carousel.clientHeight - 5) {
                            carousel.scrollTop = 0; // Loop back to top
                        }
                    }, 40);
                }
            }, 1000);
        }

        // Right side: items list (25%)
        if (list) {
            list.innerHTML = products.slice(0, 10).map(p => `
                <div class="featured-item">
                    <img src="${p.imageUrl || 'images/placeholder.jpg'}" alt="${p.name}" class="featured-item-thumb">
                    <div class="item-info">
                        <div class="item-name">${p.name || 'Delicious Treat'}</div>
                        <div class="item-price">$${(parseFloat(p.price) || 0).toFixed(2)}</div>
                    </div>
                    <button class="featured-add-btn" onclick="addToCart('${p.id}')" title="Quick add to cart">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading featured products:', error);
    }
}

// Create product card HTML
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card fade-in';
    
    const badge = product.isNew ? '<div class="product-badge">New</div>' : 
                 product.isBestseller ? '<div class="product-badge">Bestseller</div>' : '';
    
    card.innerHTML = `
        ${badge}
        <div class="product-image">
            <img src="${product.imageUrl || 'images/chocolate.jpg'}" alt="${product.name}">
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-price">
                <div class="price">₹${product.price}</div>
                <button class="add-to-cart" onclick="addToCart('${product.id}')">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Static products fallback
function loadStaticProducts() {
    const staticProducts = [
        {
            id: '1',
            name: 'Chocolate Fudge Cake',
            description: 'Rich, moist chocolate cake with creamy frosting',
            price: 450,
            imageUrl: 'images/chocolate.jpg',
            isBestseller: true
        },
        {
            id: '2',
            name: 'Red Velvet Cake',
            description: 'Classic red velvet with cream cheese frosting',
            price: 550,
            imageUrl: 'images/cake-category.jpg',
            isNew: true
        },
        {
            id: '3',
            name: 'Butter Croissant',
            description: 'Flaky, buttery croissants baked fresh daily',
            price: 120,
            imageUrl: 'images/pastry-category.jpg'
        },
        {
            id: '4',
            name: 'Chocolate Chip Cookies',
            description: 'Soft, chewy cookies with chocolate chunks',
            price: 80,
            imageUrl: 'images/cookie-category.jpg'
        }
    ];
    
    featuredProductsGrid.innerHTML = '';
    staticProducts.forEach(product => {
        const productCard = createProductCard(product);
        featuredProductsGrid.appendChild(productCard);
    });
}

// Add to cart functionality with validation
function addToCart(productId) {
    if (!productId) {
        showNotification('Invalid product. Please try again.', 'error');
        return;
    }

    try {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                productId: productId,
                quantity: 1,
                addedAt: new Date().toISOString()
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        
        // Show success message with animation
        showNotification('✓ Product added to cart!', 'success');
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Error adding product to cart. Please try again.', 'error');
    }
}

// Update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

// Show notification with improved styling
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    notification.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add enhanced styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' : 
                       type === 'error' ? 'linear-gradient(135deg, #f44336 0%, #da190b 100%)' :
                       'linear-gradient(135deg, #2196F3 0%, #0b7dda 100%)'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideInNotification 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        font-weight: 500;
        min-width: 280px;
        max-width: 400px;
        border-left: 4px solid rgba(255,255,255,0.3);
    `;
    
    // Add animation if not already in styles
    if (!document.querySelector('style[data-notification-animation]')) {
        const style = document.createElement('style');
        style.setAttribute('data-notification-animation', 'true');
        style.textContent = `
            @keyframes slideInNotification {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideInNotification 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) reverse';
            setTimeout(() => notification.remove(), 400);
        }
    }, 4000);
}

// Countdown timer for special offer
function startCountdownTimer() {
    function updateTimer() {
        const now = new Date();
        const weekend = new Date();
        
        // Set to next Saturday
        weekend.setDate(now.getDate() + (6 - now.getDay()));
        weekend.setHours(23, 59, 59, 0);
        
        const diff = weekend - now;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        
        if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
        if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
        if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
        if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
    }
    
    setInterval(updateTimer, 1000);
    updateTimer();
}

// Category filtering
function filterByCategory(category) {
    // Store the selected category in session storage
    sessionStorage.setItem('selectedCategory', category);
    // Redirect to products page
    window.location.href = 'products.html';
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .notification button {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;
document.head.appendChild(notificationStyles);

// ===========================
// GOOGLE MAP POPUP MODAL
// ===========================
const mapOpenBtn = document.getElementById("openMap");
const mapModal = document.getElementById("mapModal");
const mapFrame = document.getElementById("mapFrame");
const closeMapBtn = document.querySelector(".close-map");

if (mapOpenBtn) {
    mapOpenBtn.addEventListener("click", () => {
        const addressQuery = "near+meeseva,+Dattatreya+Colony,+Yellamma+Banda,+Kukatpally,+Hyderabad,+Telangana+500072";
        mapFrame.src = `https://www.google.com/maps?q=${addressQuery}&output=embed`;
        mapModal.style.display = "flex";
    });
}

if (closeMapBtn) {
    closeMapBtn.addEventListener("click", () => {
        mapModal.style.display = "none";
        mapFrame.src = "";
    });
}

window.addEventListener("click", (e) => {
    if (e.target === mapModal) {
        mapModal.style.display = "none";
        mapFrame.src = "";
    }
});
