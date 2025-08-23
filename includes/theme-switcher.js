/**
 * Theme Switcher JavaScript Component
 * Reusable theme switching functionality for all pages
 */
class ThemeSwitcher {
    constructor() {
        this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.updateUI();
        this.bindEvents();
        this.watchSystemTheme();
    }

    getStoredTheme() {
        return localStorage.getItem('theme');
    }

    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    applyTheme(theme) {
        const effectiveTheme = theme === 'system' ? this.getSystemTheme() : theme;
        
        if (effectiveTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
    }

    updateUI() {
        const themeIcon = document.getElementById('theme-icon');
        const themeOptions = document.querySelectorAll('.theme-option');
        
        if (!themeIcon || !themeOptions.length) return;
        
        // Update icon based on current theme
        const effectiveTheme = this.currentTheme === 'system' ? this.getSystemTheme() : this.currentTheme;
        themeIcon.textContent = effectiveTheme === 'dark' ? '🌙' : '☀️';
        
        // Update active option
        themeOptions.forEach(option => {
            option.classList.remove('active');
            if (option.dataset.theme === this.currentTheme) {
                option.classList.add('active');
            }
        });
    }

    bindEvents() {
        const themeToggle = document.getElementById('theme-toggle');
        const themeDropdown = document.getElementById('theme-dropdown');
        const themeOptions = document.querySelectorAll('.theme-option');
        
        // Toggle dropdown on button click
        if (themeToggle && themeDropdown) {
            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isVisible = themeDropdown.style.opacity === '1' || 
                                themeDropdown.style.visibility === 'visible';
                
                if (isVisible) {
                    this.hideDropdown();
                } else {
                    this.showDropdown();
                }
            });
        }
        
        // Handle theme option clicks
        themeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const selectedTheme = option.dataset.theme;
                this.applyTheme(selectedTheme);
                this.updateUI();
                this.hideDropdown();
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (themeDropdown && !e.target.closest('.theme-switcher')) {
                this.hideDropdown();
            }
        });
    }
    
    showDropdown() {
        const dropdown = document.getElementById('theme-dropdown');
        if (dropdown) {
            dropdown.style.opacity = '1';
            dropdown.style.visibility = 'visible';
            dropdown.style.transform = 'translateY(0)';
        }
    }
    
    hideDropdown() {
        const dropdown = document.getElementById('theme-dropdown');
        if (dropdown) {
            dropdown.style.opacity = '0';
            dropdown.style.visibility = 'hidden';
            dropdown.style.transform = 'translateY(-10px)';
        }
    }

    watchSystemTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', () => {
            if (this.currentTheme === 'system') {
                this.applyTheme('system');
                this.updateUI();
            }
        });
    }
}

// Initialize theme switcher when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThemeSwitcher();
});

// Export for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeSwitcher;
}