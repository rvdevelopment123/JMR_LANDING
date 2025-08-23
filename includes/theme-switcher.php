<?php
/**
 * Theme Switcher Component
 * Reusable theme switcher for all pages
 */
?>
<div class="theme-switcher">
    <button class="theme-btn" id="theme-toggle" aria-label="Toggle theme">
        <span class="theme-icon" id="theme-icon">🌙</span>
    </button>
    <div class="theme-dropdown" id="theme-dropdown">
        <button class="theme-option" data-theme="light">
            <span class="theme-option-icon">☀️</span>
            <span class="theme-option-text">Light</span>
        </button>
        <button class="theme-option" data-theme="dark">
            <span class="theme-option-icon">🌙</span>
            <span class="theme-option-text">Dark</span>
        </button>
        <button class="theme-option" data-theme="system">
            <span class="theme-option-icon">💻</span>
            <span class="theme-option-text">System</span>
        </button>
    </div>
</div>