<?php
$page_title = 'JMR Turris Fortis Realty Corporation - Premium Real Estate Development';
$home_link = '#home';
$show_theme_switcher = true;
$show_home_loan = false;
$show_services = false;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $page_title; ?></title>
    <meta name="description" content="JMR Turris Fortis Realty Corporation - Your trusted partner in premium real estate development. Featuring exclusive properties from Alveo Land and Landco Pacific.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
</head>
<body>
    <!-- Navigation Header -->
    <header class="header">
        <nav class="navbar">
            <div class="nav-container">
                <div class="nav-logo">
                    <img src="assets/jmr-logo.svg" alt="JMR Turris Fortis Realty Corporation" class="logo">
                </div>
                <ul class="nav-menu">
                    <li class="nav-item">
                        <a href="#home" class="nav-link">Home</a>
                    </li>
                    <li class="nav-item">
                        <a href="#properties" class="nav-link">Properties</a>
                    </li>
                    <li class="nav-item">
                        <a href="#about" class="nav-link">About</a>
                    </li>
                    <li class="nav-item">
                        <a href="#contact" class="nav-link">Contact</a>
                    </li>
                    <li class="nav-item">
                        <?php include 'includes/theme-switcher.php'; ?>
                    </li>
                </ul>
                <div class="nav-toggle">
                    <span class="bar"></span>
                    <span class="bar"></span>
                    <span class="bar"></span>
                </div>
            </div>
        </nav>
    </header>

    <!-- Hero Section -->
    <section id="home" class="hero">
        <div class="hero-container">
            <div class="hero-content">
                <h1 class="hero-title">
                    <span class="hero-subtitle">JMR Turris Fortis</span>
                    <span class="hero-main">Realty Corporation</span>
                </h1>
                <p class="hero-description">
                    Brokering modern, sustainable, and well-designed communities that meet the evolving needs of Filipino families and businesses in South Luzon and Metro Manila.
                </p>
                <div class="hero-stats">
                    <div class="stat-item">
                        <span class="stat-number">5+</span>
                        <span class="stat-label">Premium Developments</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">100+</span>
                        <span class="stat-label">Happy Families</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">10+</span>
                        <span class="stat-label">Years Experience</span>
                    </div>
                </div>
                <div class="hero-cta">
                    <a href="#properties" class="btn btn-primary">Explore Properties</a>
                    <a href="#contact" class="btn btn-secondary">Contact Us</a>
                </div>
            </div>
            <div class="hero-image">
                <img src="assets/hero-property.svg" alt="Premium Real Estate Development" class="hero-img">
            </div>
        </div>
        <div class="hero-scroll">
            <span class="scroll-text">Scroll to explore</span>
            <div class="scroll-indicator"></div>
        </div>
    </section>

    <!-- Featured Properties Section -->
    <section id="properties" class="properties">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Featured Developments</h2>
                <p class="section-subtitle">Discover our premium residential and commercial properties from trusted developers</p>
            </div>

            <!-- Alveo Land Properties -->
            <div class="developer-section">
                <div class="developer-header">
                    <img src="assets/alveo-logo.svg" alt="Alveo Land" class="developer-logo">
                    <div class="developer-info">
                        <h3 class="developer-name">Alveo Land</h3>
                        <p class="developer-description">Premium real estate developer creating vibrant communities across the Philippines</p>
                    </div>
                </div>
                <div class="properties-grid">
                    <div class="property-card">
                        <div class="property-img">
                            <img src="assets/hillside-ridge-hero.jpg" alt="Alveo HILLSIDE RIDGE PH2">
                            <div class="property-badge">Featured</div>
                        </div>
                        <div class="property-content">
                            <h3 class="property-title">Alveo HILLSIDE RIDGE PH2</h3>
                            <p class="property-location">Antipolo, Rizal</p>
                            <p class="property-description">Premium hillside residential development offering modern living with stunning views and world-class amenities.</p>
                            <div class="property-features">
                                <span class="feature">2-3 Bedrooms</span>
                                <span class="feature">Hillside Views</span>
                                <span class="feature">Premium Amenities</span>
                            </div>
                            <div class="property-actions">
                                <a href="alveo-hillside-ridge.html" class="btn btn-primary">View Details</a>
                                <button class="btn btn-secondary" onclick="showComingSoon('Alveo HILLSIDE RIDGE PH2')">Inquire Now</button>
                            </div>
                        </div>
                    </div>

                    <div class="property-card">
                        <div class="property-img">
                            <img src="assets/verdea-logo-green.jpg" alt="Alveo Verdea">
                            <div class="property-badge">New</div>
                        </div>
                        <div class="property-content">
                            <h3 class="property-title">Alveo Verdea</h3>
                            <p class="property-location">Pasig City</p>
                            <p class="property-description">A green sanctuary in the heart of the city, offering sustainable living with modern conveniences.</p>
                            <div class="property-features">
                                <span class="feature">1-3 Bedrooms</span>
                                <span class="feature">Green Living</span>
                                <span class="feature">City Access</span>
                            </div>
                            <div class="property-actions">
                                <a href="alveo-verdea.html" class="btn btn-primary">View Details</a>
                                <button class="btn btn-secondary" onclick="showComingSoon('Alveo Verdea')">Inquire Now</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Landco Pacific Properties -->
            <div class="developer-section">
                <div class="developer-header">
                    <img src="assets/landco-pacific-logo.svg" alt="Landco Pacific" class="developer-logo">
                    <div class="developer-info">
                        <h3 class="developer-name">Landco Pacific</h3>
                        <p class="developer-description">Creating exceptional communities with innovative design and sustainable development</p>
                    </div>
                </div>
                <div class="properties-grid">
                    <div class="property-card">
                        <div class="property-img">
                            <img src="assets/lanewood-hills-hero.jpg" alt="Lanewood Hills">
                            <div class="property-badge">Premium</div>
                        </div>
                        <div class="property-content">
                            <h3 class="property-title">Lanewood Hills</h3>
                            <p class="property-location">Silang, Cavite</p>
                            <p class="property-description">Exclusive hillside community offering luxury living surrounded by nature's beauty and tranquility.</p>
                            <div class="property-features">
                                <span class="feature">Luxury Homes</span>
                                <span class="feature">Hillside Location</span>
                                <span class="feature">Nature Views</span>
                            </div>
                            <div class="property-actions">
                                <a href="lanewood-hills.html" class="btn btn-primary">View Details</a>
                                <button class="btn btn-secondary" onclick="showComingSoon('Lanewood Hills')">Inquire Now</button>
                            </div>
                        </div>
                    </div>

                    <div class="property-card">
                        <div class="property-img">
                            <img src="assets/spg-elevation-map.jpg" alt="South Palmgrove">
                            <div class="property-badge">Available</div>
                        </div>
                        <div class="property-content">
                            <h3 class="property-title">South Palmgrove</h3>
                            <p class="property-location">Silang, Cavite</p>
                            <p class="property-description">Modern residential community designed for contemporary Filipino families seeking quality and comfort.</p>
                            <div class="property-features">
                                <span class="feature">Family Homes</span>
                                <span class="feature">Modern Design</span>
                                <span class="feature">Community Living</span>
                            </div>
                            <div class="property-actions">
                                <a href="south-palmgrove.html" class="btn btn-primary">View Details</a>
                                <button class="btn btn-secondary" onclick="showComingSoon('South Palmgrove')">Inquire Now</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section id="about" class="about">
        <div class="container">
            <div class="about-content">
                <div class="about-text">
                    <h2 class="section-title">About JMR Turris Fortis</h2>
                    <p class="about-description">
                        JMR Turris Fortis Realty Corporation is your trusted partner in premium real estate development. 
                        We specialize in brokering modern, sustainable, and well-designed communities that meet the 
                        evolving needs of Filipino families and businesses in South Luzon and Metro Manila.
                    </p>
                    <div class="about-features">
                        <div class="feature-item">
                            <h4>Premium Developments</h4>
                            <p>Curated selection of high-quality residential and commercial properties</p>
                        </div>
                        <div class="feature-item">
                            <h4>Trusted Partnerships</h4>
                            <p>Collaborating with leading developers like Alveo Land and Landco Pacific</p>
                        </div>
                        <div class="feature-item">
                            <h4>Expert Guidance</h4>
                            <p>Professional real estate services with personalized customer support</p>
                        </div>
                    </div>
                </div>
                <div class="about-image">
                    <img src="assets/hero-property.svg" alt="About JMR Turris Fortis" class="about-img">
                </div>
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="contact">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Get In Touch</h2>
                <p class="section-subtitle">Ready to find your dream property? Contact us today for expert guidance</p>
            </div>
            <div class="contact-content">
                <div class="contact-info">
                    <div class="contact-item">
                        <h4>Phone</h4>
                        <p>+63 917 123 4567</p>
                    </div>
                    <div class="contact-item">
                        <h4>Email</h4>
                        <p>info@jmrturrisfortis.com</p>
                    </div>
                    <div class="contact-item">
                        <h4>Office</h4>
                        <p>Metro Manila, Philippines</p>
                    </div>
                </div>
                <form class="contact-form">
                    <div class="form-group">
                        <input type="text" name="name" placeholder="Your Name" required>
                    </div>
                    <div class="form-group">
                        <input type="email" name="email" placeholder="Your Email" required>
                    </div>
                    <div class="form-group">
                        <input type="tel" name="phone" placeholder="Your Phone">
                    </div>
                    <div class="form-group">
                        <textarea name="message" placeholder="Your Message" rows="5" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Send Message</button>
                </form>
            </div>
        </div>
    </section>

    <script src="script.js"></script>
    <script src="includes/theme-switcher.js"></script>
</body>
</html>