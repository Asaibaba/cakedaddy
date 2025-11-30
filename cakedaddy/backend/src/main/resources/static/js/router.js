class SimpleRouter {
    constructor() {
        this.init();
    }
    
    init() {
        // Handle navigation without page reload
        this.setupNavigation();
        
        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.loadPage(window.location.pathname);
        });
        
        // Load initial page
        this.loadPage(window.location.pathname);
    }
    
    setupNavigation() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href) {
                const href = link.getAttribute('href');
                
                // Handle internal navigation
                if (href.startsWith('/') && !href.startsWith('//')) {
                    e.preventDefault();
                    this.navigate(href);
                }
            }
        });
    }
    
    navigate(path) {
        // Update URL without reload
        window.history.pushState({}, '', path);
        this.loadPage(path);
    }
    
    async loadPage(path) {
        // Default to home if root
        if (path === '/') path = '/index';
        
        try {
            // Remove leading slash and add .html
            const pageName = path.substring(1) || 'index';
            const pagePath = `/${pageName}.html`;
            
            const response = await fetch(pagePath);
            if (!response.ok) throw new Error('Page not found');
            
            const html = await response.text();
            this.renderPage(html, pageName);
        } catch (error) {
            console.error('Error loading page:', error);
            this.loadErrorPage();
        }
    }
    
    renderPage(html, pageName) {
        // Create temporary container to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Extract content between body tags or use full content
        const bodyContent = tempDiv.querySelector('body') || tempDiv;
        
        // Update main content area
        const mainElement = document.querySelector('main');
        if (mainElement) {
            // Remove existing content but keep navigation and footer
            const nav = document.querySelector('nav');
            const footer = document.querySelector('footer');
            
            // Clear main content
            mainElement.innerHTML = '';
            
            // Move all body content except nav and footer to main
            Array.from(bodyContent.children).forEach(child => {
                if (child.tagName !== 'NAV' && child.tagName !== 'FOOTER') {
                    mainElement.appendChild(child.cloneNode(true));
                }
            });
        } else {
            // Fallback: replace entire body
            document.body.innerHTML = bodyContent.innerHTML;
        }
        
        // Update active navigation
        this.updateActiveNav(pageName);
        
        // Reinitialize page-specific scripts
        this.reinitializeScripts(pageName);
    }
    
    updateActiveNav(currentPage) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `/${currentPage}` || (currentPage === 'index' && href === '/')) {
                link.classList.add('active');
            }
        });
    }
    
    reinitializeScripts(pageName) {
        // Page-specific initialization
        switch(pageName) {
            case 'products':
                if (typeof initProductsPage === 'function') initProductsPage();
                break;
            case 'cart':
                if (typeof initCartPage === 'function') initCartPage();
                break;
            case 'login':
                if (typeof initLoginPage === 'function') initLoginPage();
                break;
            default:
                if (typeof initPage === 'function') initPage();
        }
        
        // Always reinitialize main functionality
        if (typeof initMain === 'function') initMain();
    }
    
    loadErrorPage() {
        document.querySelector('main').innerHTML = `
            <section class="error-page">
                <div class="container">
                    <h1>Page Not Found</h1>
                    <p>The page you're looking for doesn't exist.</p>
                    <button onclick="router.navigate('/')" class="btn">Go Home</button>
                </div>
            </section>
        `;
    }
}

// Initialize router
const router = new SimpleRouter();