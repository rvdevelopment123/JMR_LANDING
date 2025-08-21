// Property Details JavaScript

// Initialize property details functionality
document.addEventListener('DOMContentLoaded', function() {
    initPropertyInquiryForm();
    initImageGallery();
    initVideoPlayer();
    initScrollAnimations();
});

// Property Inquiry Form Handler
function initPropertyInquiryForm() {
    const form = document.getElementById('propertyInquiryForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Simulate form submission (replace with actual endpoint)
        setTimeout(() => {
            // Show success message
            showNotification('Thank you for your inquiry! We will contact you within 24 hours.', 'success');
            
            // Reset form
            form.reset();
            
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            // Log inquiry data (for development)
            console.log('Property Inquiry Submitted:', data);
        }, 2000);
    });
    
    // Add form field focus effects
    const formGroups = form.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        const input = group.querySelector('input, select, textarea');
        if (input) {
            input.addEventListener('focus', () => {
                group.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                if (!input.value) {
                    group.classList.remove('focused');
                }
            });
        }
    });
}

// Image Gallery Functionality
function initImageGallery() {
    const planImages = document.querySelectorAll('.plan-img');
    
    planImages.forEach(img => {
        img.addEventListener('click', function() {
            openImageModal(this.src, this.alt);
        });
    });
}

// Open Image Modal
function openImageModal(src, alt) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <img src="${src}" alt="${alt}" class="modal-image">
                <p class="modal-caption">${alt}</p>
            </div>
        </div>
    `;
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .image-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }
        
        .modal-overlay {
            position: relative;
            max-width: 90vw;
            max-height: 90vh;
        }
        
        .modal-content {
            position: relative;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .modal-image {
            width: 100%;
            height: auto;
            max-height: 80vh;
            object-fit: contain;
        }
        
        .modal-close {
            position: absolute;
            top: 15px;
            right: 15px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            font-size: 24px;
            cursor: pointer;
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .modal-close:hover {
            background: rgba(0, 0, 0, 0.9);
        }
        
        .modal-caption {
            padding: 1rem;
            text-align: center;
            color: #333;
            margin: 0;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.image-modal');
    
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    function closeModal() {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        }, 300);
    }
    
    // Add fadeOut animation
    style.textContent += `
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
}

// Video Player Enhancement
function initVideoPlayer() {
    const video = document.querySelector('.construction-video');
    if (!video) return;
    
    // Add custom controls or enhancements
    video.addEventListener('loadedmetadata', function() {
        console.log('Construction video loaded successfully');
    });
    
    video.addEventListener('error', function() {
        // Show fallback content if video fails to load
        const container = video.parentElement;
        container.innerHTML = `
            <div class="video-fallback">
                <div class="fallback-content">
                    <h3>Construction Update</h3>
                    <p>Video content is currently being updated. Please check back soon for the latest construction progress.</p>
                    <button class="btn btn-primary" onclick="location.reload()">Refresh Page</button>
                </div>
            </div>
        `;
        
        // Add fallback styles
        const style = document.createElement('style');
        style.textContent = `
            .video-fallback {
                height: 300px;
                background: #f8f9fa;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 16px;
                border: 2px dashed #ddd;
            }
            
            .fallback-content {
                text-align: center;
                padding: 2rem;
            }
            
            .fallback-content h3 {
                color: #333;
                margin-bottom: 1rem;
            }
            
            .fallback-content p {
                color: #666;
                margin-bottom: 1.5rem;
            }
        `;
        document.head.appendChild(style);
    });
}

// Scroll Animations
function initScrollAnimations() {
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
    
    // Animate elements on scroll
    const animateElements = document.querySelectorAll(
        '.overview-card, .amenity-category, .plan-item, .timeline-item'
    );
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 400px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        
        .notification-success {
            background: #28a745;
        }
        
        .notification-error {
            background: #dc3545;
        }
        
        .notification-info {
            background: #17a2b8;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // Auto remove notification
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        }, 300);
    }, 5000);
}

// Smooth scroll for anchor links
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Add loading states for buttons
document.addEventListener('click', function(e) {
    if (e.target.matches('.btn-outline')) {
        e.preventDefault();
        const btn = e.target;
        const originalText = btn.textContent;
        
        btn.textContent = 'Loading...';
        btn.disabled = true;
        
        // Simulate loading (replace with actual functionality)
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
            
            // Show notification for demo
            showNotification('Feature coming soon! Contact us for more details.', 'info');
        }, 1500);
    }
});

// Export functions for external use
window.PropertyDetails = {
    showNotification,
    openImageModal
};