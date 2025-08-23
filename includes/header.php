<?php
/**
 * Reusable Header Component
 * Includes navigation and theme switcher
 */

// Default values
$page_title = isset($page_title) ? $page_title : 'JMR Turris Fortis Realty Corporation';
$home_link = isset($home_link) ? $home_link : 'index.html';
$show_theme_switcher = isset($show_theme_switcher) ? $show_theme_switcher : true;
$show_home_loan = isset($show_home_loan) ? $show_home_loan : true;
$show_services = isset($show_services) ? $show_services : true;
?>
<!-- Navigation Header -->
<header class="header">
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-logo">
                <a href="<?php echo $home_link; ?>">
                    <img src="assets/jmr-logo.svg" alt="JMR Turris Fortis Realty Corporation" class="logo">
                </a>
            </div>
            <ul class="nav-menu">
                <li class="nav-item">
                    <a href="<?php echo $home_link; ?>#home" class="nav-link">Home</a>
                </li>
                <li class="nav-item">
                    <a href="<?php echo $home_link; ?>#properties" class="nav-link">Properties</a>
                </li>
                <?php if ($show_services): ?>
                <li class="nav-item">
                    <a href="<?php echo $home_link; ?>#services" class="nav-link">Services</a>
                </li>
                <?php endif; ?>
                <li class="nav-item">
                    <a href="<?php echo $home_link; ?>#about" class="nav-link">About</a>
                </li>
                <li class="nav-item">
                    <a href="<?php echo $home_link; ?>#contact" class="nav-link">Contact</a>
                </li>
                <?php if ($show_home_loan): ?>
                <li class="nav-item">
                    <a href="<?php echo $home_link; ?>#home-loan" class="nav-link">Home Loan</a>
                </li>
                <?php endif; ?>
                <?php if ($show_theme_switcher): ?>
                <li class="nav-item">
                    <?php include 'includes/theme-switcher.php'; ?>
                </li>
                <?php endif; ?>
            </ul>
            <div class="nav-toggle">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </div>
        </div>
    </nav>
</header>