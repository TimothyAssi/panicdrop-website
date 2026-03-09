document.addEventListener('DOMContentLoaded', function() {

    // ── MOBILE NAVIGATION ──────────────────────────
    const hamburger = document.querySelector('.hamburger');
    const navMenu   = document.querySelector('.nav-menu');
    const navLinks  = document.querySelectorAll('.nav-link');
    const dropdowns = document.querySelectorAll('.dropdown');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // ── DROPDOWN MENU ──────────────────────────────
    if (dropdowns.length > 0) {
        dropdowns.forEach(dropdown => {
            const dropdownToggle  = dropdown.querySelector('.dropdown-toggle');
            const dropdownContent = dropdown.querySelector('.dropdown-content');
            const mainLink        = dropdown.querySelector('.main-link');
            const toggleArrow     = dropdown.querySelector('.toggle-arrow');

            if (!dropdownToggle || !dropdownContent) return;

            // Mobile: toggle arrow opens the dropdown sub-menu
            if (toggleArrow) {
                toggleArrow.addEventListener('click', function(e) {
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        e.stopPropagation();
                        dropdowns.forEach(d => { if (d !== dropdown) d.querySelector('.dropdown-content') && d.classList.remove('active'); });
                        dropdownContent.classList.toggle('active');
                        dropdown.classList.toggle('active');
                    }
                });
            }

            // Desktop hover
            let hoverTimeout;
            dropdown.addEventListener('mouseenter', function() {
                if (window.innerWidth > 768) {
                    clearTimeout(hoverTimeout);
                    dropdown.classList.add('show');
                }
            });
            dropdown.addEventListener('mouseleave', function() {
                if (window.innerWidth > 768) {
                    hoverTimeout = setTimeout(() => dropdown.classList.remove('show'), 150);
                }
            });

            // Close mobile menu when a dropdown link is clicked
            dropdown.querySelectorAll('.dropdown-content a').forEach(link => {
                link.addEventListener('click', function() {
                    if (hamburger && navMenu) {
                        hamburger.classList.remove('active');
                        navMenu.classList.remove('active');
                    }
                    dropdown.classList.remove('active', 'show');
                    dropdownContent.classList.remove('active');
                });
            });
        });
    }

    // ── CLOSE MENU ON NAV LINK CLICK ──────────────
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

    // ── CLOSE MENU ON OUTSIDE CLICK ───────────────
    document.addEventListener('click', function(e) {
        // Close mobile nav
        if (hamburger && navMenu && navMenu.classList.contains('active')) {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        }
        // Close dropdowns
        if (!e.target.closest('.dropdown')) {
            dropdowns.forEach(d => d.classList.remove('active', 'show'));
        }
    });

    // ── RESIZE HANDLER ────────────────────────────
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && hamburger && navMenu) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            dropdowns.forEach(d => d.classList.remove('active', 'show'));
        }
    });

    // ── NAVBAR SCROLL EFFECT ──────────────────────
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (navbar) {
            if (window.scrollY > 60) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

    // ── SMOOTH SCROLL FOR ANCHOR LINKS ────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ── SCROLL REVEAL ─────────────────────────────
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity  = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.feature-card, .course-content').forEach(el => {
        el.style.opacity   = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // ── FAQ TOGGLE (legacy) ────────────────────────
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const toggle  = this.querySelector('.faq-toggle');
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                    const t = item.querySelector('.faq-toggle');
                    if (t) t.textContent = '+';
                }
            });
            faqItem.classList.toggle('active');
            if (toggle) toggle.textContent = faqItem.classList.contains('active') ? '−' : '+';
        });
    });

});
