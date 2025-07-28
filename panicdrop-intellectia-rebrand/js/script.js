// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const dropdowns = document.querySelectorAll('.dropdown');

    // Ensure hamburger menu is visible and functional
    if (hamburger && navMenu) {
        // Toggle mobile menu
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Dropdown functionality
    if (dropdowns.length > 0) {
        dropdowns.forEach(dropdown => {
            const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
            const dropdownContent = dropdown.querySelector('.dropdown-content');
            const mainLink = dropdown.querySelector('.main-link');
            const toggleArrow = dropdown.querySelector('.toggle-arrow');
            let hoverTimeout;
            let clickTimeout;
            
            if (!dropdownToggle || !dropdownContent) return;
        
        // Handle click on main link (for mobile)
        if (mainLink) {
            mainLink.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    // On mobile, allow navigation to main page
                    return; // Let the link work normally
                }
            });
        }
        
        // Handle click on toggle arrow (for mobile)
        if (toggleArrow) {
            toggleArrow.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Close other dropdowns
                    dropdowns.forEach(otherDropdown => {
                        if (otherDropdown !== dropdown) {
                            otherDropdown.classList.remove('active');
                        }
                    });
                    
                    // Toggle current dropdown
                    dropdown.classList.toggle('active');
                }
            });
        }
        
        // Handle click on dropdown toggle (unified for desktop and mobile)
        dropdownToggle.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                // Mobile: Only handle if not clicking on the main link
                if (e.target === toggleArrow || e.target === dropdownToggle) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Close other dropdowns
                    dropdowns.forEach(otherDropdown => {
                        if (otherDropdown !== dropdown) {
                            otherDropdown.classList.remove('active');
                        }
                    });
                    
                    // Toggle current dropdown
                    dropdown.classList.toggle('active');
                }
            } else {
                // Desktop: Handle dropdown toggle
                if (dropdown.classList.contains('show')) {
                    // If already open, navigate to main page
                    if (mainLink) {
                        window.location.href = mainLink.getAttribute('href');
                    }
                } else {
                    // If not open, show dropdown
                    e.preventDefault();
                    dropdown.classList.add('show');
                    
                    // Close other dropdowns
                    dropdowns.forEach(otherDropdown => {
                        if (otherDropdown !== dropdown) {
                            otherDropdown.classList.remove('show');
                        }
                    });
                }
            }
        });
        
        // Handle double-click for immediate navigation (desktop)
        dropdownToggle.addEventListener('dblclick', function(e) {
            if (window.innerWidth > 768 && mainLink) {
                window.location.href = mainLink.getAttribute('href');
            }
        });
        
        // Desktop hover behavior
        dropdown.addEventListener('mouseenter', function() {
            if (window.innerWidth > 768) {
                clearTimeout(hoverTimeout);
                clearTimeout(clickTimeout);
                dropdown.classList.add('show');
            }
        });
        
        dropdown.addEventListener('mouseleave', function() {
            if (window.innerWidth > 768) {
                hoverTimeout = setTimeout(() => {
                    dropdown.classList.remove('show');
                }, 150);
            }
        });
        
        // Handle clicking on dropdown items
        const dropdownLinks = dropdown.querySelectorAll('.dropdown-content a');
        dropdownLinks.forEach(link => {
            link.addEventListener('click', function() {
                clearTimeout(clickTimeout);
                // Close mobile menu
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                dropdown.classList.remove('active');
                dropdown.classList.remove('show');
            });
        });
        });
    }

    // Close mobile menu when clicking on a nav link
    if (navLinks.length > 0 && hamburger && navMenu) {
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (!link.classList.contains('dropdown-toggle')) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });
        });
    }

    // Close dropdowns when clicking outside
    if (dropdowns.length > 0) {
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.dropdown')) {
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                    dropdown.classList.remove('show');
                });
            }
        });
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // Close mobile menu on resize to desktop
            if (hamburger && navMenu) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
            if (dropdowns.length > 0) {
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll effect to navbar
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(15, 15, 35, 0.98)';
        } else {
            navbar.style.background = 'rgba(15, 15, 35, 0.95)';
        }
    });

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe feature cards and course elements
    document.querySelectorAll('.feature-card, .course-content').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // FAQ Toggle Functionality
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const toggle = this.querySelector('.faq-toggle');
            
            // Close other FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                    item.querySelector('.faq-toggle').textContent = '+';
                }
            });
            
            // Toggle current FAQ item
            faqItem.classList.toggle('active');
            toggle.textContent = faqItem.classList.contains('active') ? '−' : '+';
        });
    });
});

// Add active class to hamburger animation
document.querySelector('.hamburger').addEventListener('click', function() {
    this.classList.toggle('active');
});

// Enhanced hamburger animation
const style = document.createElement('style');
style.textContent = `
    .hamburger.active .bar:nth-child(2) {
        opacity: 0;
    }
    .hamburger.active .bar:nth-child(1) {
        transform: translateY(8px) rotate(45deg);
    }
    .hamburger.active .bar:nth-child(3) {
        transform: translateY(-8px) rotate(-45deg);
    }
`;
document.head.appendChild(style);