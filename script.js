// Mobile Navigation Toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Header Background on Scroll
const header = document.querySelector('.header');

function getThemeAwareHeaderBackground() {
    const isDarkTheme = document.documentElement.hasAttribute('data-theme') && 
                       document.documentElement.getAttribute('data-theme') === 'dark';
    
    if (isDarkTheme) {
        return {
            scrolled: 'rgba(26, 26, 26, 0.98)',
            normal: 'rgba(26, 26, 26, 0.95)',
            shadow: '0 2px 20px rgba(255, 255, 255, 0.1)'
        };
    } else {
        return {
            scrolled: 'rgba(255, 255, 255, 0.98)',
            normal: 'rgba(255, 255, 255, 0.95)',
            shadow: '0 2px 20px rgba(0, 0, 0, 0.1)'
        };
    }
}

function updateHeaderBackground() {
    const colors = getThemeAwareHeaderBackground();
    
    if (window.scrollY > 100) {
        header.style.background = colors.scrolled;
        header.style.boxShadow = colors.shadow;
    } else {
        header.style.background = colors.normal;
        header.style.boxShadow = 'none';
    }
}

window.addEventListener('scroll', updateHeaderBackground);

// Listen for theme changes to update header colors
const themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
            updateHeaderBackground();
        }
    });
});

themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
});

// Initial header background setup
updateHeaderBackground();

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.property-card, .team-member, .about-content, .hero-content').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Counter Animation for Hero Stats
const animateCounters = () => {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace('+', ''));
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current) + '+';
                setTimeout(updateCounter, 20);
            } else {
                counter.textContent = target + '+';
            }
        };
        
        updateCounter();
    });
};

// Trigger counter animation when hero section is visible
const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            heroObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroSection = document.querySelector('.hero');
if (heroSection) {
    heroObserver.observe(heroSection);
}

// Contact Form Handling
const contactForm = document.querySelector('.form');

if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const message = formData.get('message');
        
        // Simple validation
        if (!name || !email || !message) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }
        
        // Get submit button and show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        try {
            // Send data to PHP script
            const response = await fetch('send_email.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    phone: phone,
                    message: message
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification(result.message, 'success');
                this.reset();
            } else {
                showNotification(result.message, 'error');
            }
            
        } catch (error) {
            console.error('Error:', error);
            showNotification('Sorry, there was an error sending your message. Please try again later.', 'error');
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-size: 14px;
        line-height: 1.4;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Property Filter Functionality
function initPropertyFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const propertyCards = document.querySelectorAll('.property-card');
    
    if (filterButtons.length === 0) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter properties
            propertyCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.6s ease forwards';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Image Lazy Loading
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
}

// Scroll to Top Button
function initScrollToTop() {
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '↑';
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #B8860B;
        color: white;
        border: none;
        font-size: 20px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(184, 134, 11, 0.3);
    `;
    
    document.body.appendChild(scrollBtn);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.visibility = 'visible';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.visibility = 'hidden';
        }
    });
    
    // Scroll to top functionality
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Property Card Hover Effects
function initPropertyCardEffects() {
    const propertyCards = document.querySelectorAll('.property-card');
    
    propertyCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Touch enhancements for mobile devices
function initTouchEnhancements() {
    // Add touch feedback for buttons
    const buttons = document.querySelectorAll('.btn, .property-card, .team-member');
    
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        }, { passive: true });
        
        button.addEventListener('touchend', function() {
            this.style.transform = '';
        }, { passive: true });
        
        button.addEventListener('touchcancel', function() {
            this.style.transform = '';
        }, { passive: true });
    });
    
    // Improve form inputs for mobile
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        // Add focus styles for better visibility
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
    
    // Add swipe gesture support for property cards
    let startX = 0;
    let startY = 0;
    
    document.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', function(e) {
        if (!startX || !startY) return;
        
        const diffX = startX - e.touches[0].clientX;
        const diffY = startY - e.touches[0].clientY;
        
        // Prevent horizontal scroll on mobile when swiping vertically
        if (Math.abs(diffY) > Math.abs(diffX)) {
            e.preventDefault();
        }
    }, { passive: false });
}

// Initialize all features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initPropertyFilter();
    initLazyLoading();
    initScrollToTop();
    initPropertyCardEffects();
    initTouchEnhancements();
    
    // Add loading animation to page
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Handle window resize
window.addEventListener('resize', () => {
    // Close mobile menu on resize
    if (window.innerWidth > 768) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    }
});

// Preload critical images
function preloadImages() {
    const criticalImages = [
        'assets/hero-property.jpg',
        'assets/jmr-logo.svg'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Call preload on page load
preloadImages();

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll events
const debouncedScrollHandler = debounce(() => {
    // Scroll-based animations can be added here
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close mobile menu
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    }
});

// Add focus management for accessibility
const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function trapFocus(element) {
    const focusableContent = element.querySelectorAll(focusableElements);
    const firstFocusableElement = focusableContent[0];
    const lastFocusableElement = focusableContent[focusableContent.length - 1];

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusableElement) {
                    lastFocusableElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusableElement) {
                    firstFocusableElement.focus();
                    e.preventDefault();
                }
            }
        }
    });
}

// Show coming soon notification for properties
function showComingSoon(propertyName) {
    showNotification(`${propertyName} details page coming soon! Contact us for more information about this property.`, 'info');
}

// Export functions for global use
window.JMRRealty = {
    showNotification,
    showComingSoon
};

// Console welcome message
console.log('%c🏠 JMR Turris Fortis Realty Corporation', 'color: #B8860B; font-size: 16px; font-weight: bold;');
console.log('%cBuilding modern, sustainable communities in South Luzon', 'color: #666; font-size: 12px;');