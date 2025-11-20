// js/contact.js
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    setupContactForm();
});

function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const contactData = {
                name: formData.get('contactName'),
                email: formData.get('contactEmail'),
                subject: formData.get('contactSubject'),
                message: formData.get('contactMessage'),
                timestamp: new Date().toISOString()
            };
            
            // In a real application, you would send this to your backend
            console.log('Contact form submission:', contactData);
            
            showNotification('Thank you for your message! We\'ll get back to you soon.');
            contactForm.reset();
        });
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
