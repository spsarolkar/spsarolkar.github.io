/**
 * Scroll Animations for Content Sections
 * Uses Intersection Observer API for performance
 */

(function () {
    'use strict';

    // Configuration
    const config = {
        threshold: 0.1, // Percentage of element visible before triggering
        rootMargin: '0px 0px -50px 0px', // Trigger slightly before element is fully visible
    };

    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
        console.warn('Intersection Observer not supported');
        // Show all elements immediately if not supported
        document.querySelectorAll('[data-animate]').forEach((el) => {
            el.classList.add('animated');
        });
        return;
    }

    // Create observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Add animated class when element comes into view
                entry.target.classList.add('animated');
                // Optionally unobserve after animation
                observer.unobserve(entry.target);
            }
        });
    }, config);

    // Initialize scroll animations
    function initScrollAnimations() {
        // Select all elements with data-animate attribute
        const animatedElements = document.querySelectorAll('[data-animate]');

        animatedElements.forEach((element) => {
            observer.observe(element);
        });

        // Add stagger effect to lists
        const lists = document.querySelectorAll('ul li, ol li');
        lists.forEach((item, index) => {
            if (index < 5) {
                // Only add delay to first 5 items
                item.setAttribute('data-animate', '');
                item.setAttribute('data-animate-delay', ((index % 5) + 1).toString());
                observer.observe(item);
            }
        });

        // Add animation to section headings
        const headings = document.querySelectorAll('article h2');
        headings.forEach((heading) => {
            heading.setAttribute('data-animate', '');
            observer.observe(heading);
        });

        // Add animation to cards
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            card.setAttribute('data-animate', '');
            if (index < 5) {
                card.setAttribute('data-animate-delay', ((index % 5) + 1).toString());
            }
            observer.observe(card);
        });

        // Add animation to Credly badges
        const badges = document.querySelectorAll('div[style*="border"][style*="text-align: center"]');
        badges.forEach((badge, index) => {
            badge.setAttribute('data-animate', '');
            if (index < 5) {
                badge.setAttribute('data-animate-delay', ((index % 5) + 1).toString());
            }
            observer.observe(badge);
        });
    }

    // Add smooth scroll for anchor links
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                    });
                }
            });
        });
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initScrollAnimations();
            initSmoothScroll();
        });
    } else {
        initScrollAnimations();
        initSmoothScroll();
    }

    // Add resize handler for responsive animations
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Could add additional responsive logic here if needed
            console.log('Window resized - animations adjusted');
        }, 250);
    });
})();
