(function() {
    'use strict';

    window.__app = window.__app || {};

    const CONFIG = {
        HEADER_HEIGHT: 72,
        HEADER_HEIGHT_MOBILE: 64,
        BREAKPOINT_MOBILE: 1024,
        ANIMATION_DURATION: 300,
        SCROLL_OFFSET: 100,
        DEBOUNCE_DELAY: 250,
        THROTTLE_DELAY: 100
    };

    const VALIDATORS = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^[\d\s+\-()]{10,20}$/,
        name: /^[a-zA-ZÀ-ÿ\s-']{2,50}$/,
        message: /^.{10,}$/
    };

    function throttle(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            if (!timeout) {
                timeout = setTimeout(function() {
                    timeout = null;
                    func.apply(context, args);
                }, wait);
            }
        };
    }

    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    }

    class BurgerMenu {
        constructor() {
            this.nav = document.querySelector('.c-nav, #navbarNav, .navbar-collapse');
            this.toggle = document.querySelector('.c-nav__toggle, .navbar-toggler');
            this.body = document.body;
            this.isOpen = false;
            
            if (!this.nav || !this.toggle) return;
            
            this.init();
        }

        init() {
            this.createOverlay();
            this.bindEvents();
            this.setHeight();
        }

        createOverlay() {
            this.overlay = document.createElement('div');
            this.overlay.className = 'menu-overlay';
            this.overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
                z-index: 998;
            `;
            document.body.appendChild(this.overlay);
        }

        setHeight() {
            const isMobile = window.innerWidth < CONFIG.BREAKPOINT_MOBILE;
            if (isMobile) {
                const headerHeight = window.innerWidth < 768 ? CONFIG.HEADER_HEIGHT_MOBILE : CONFIG.HEADER_HEIGHT;
                this.nav.style.height = `calc(100vh - ${headerHeight}px)`;
            } else {
                this.nav.style.height = '';
            }
        }

        open() {
            this.isOpen = true;
            this.nav.classList.add('is-open', 'show');
            this.toggle.classList.add('is-open');
            this.toggle.setAttribute('aria-expanded', 'true');
            this.body.classList.add('u-no-scroll');
            this.overlay.style.opacity = '1';
            this.overlay.style.visibility = 'visible';
        }

        close() {
            this.isOpen = false;
            this.nav.classList.remove('is-open', 'show');
            this.toggle.classList.remove('is-open');
            this.toggle.setAttribute('aria-expanded', 'false');
            this.body.classList.remove('u-no-scroll');
            this.overlay.style.opacity = '0';
            this.overlay.style.visibility = 'hidden';
        }

        toggle() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        }

        bindEvents() {
            this.toggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggle();
            });

            this.overlay.addEventListener('click', () => {
                this.close();
            });

            const navLinks = this.nav.querySelectorAll('.c-nav__item, .nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth < CONFIG.BREAKPOINT_MOBILE) {
                        this.close();
                    }
                });
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });

            window.addEventListener('resize', debounce(() => {
                this.setHeight();
                if (window.innerWidth >= CONFIG.BREAKPOINT_MOBILE && this.isOpen) {
                    this.close();
                }
            }, CONFIG.DEBOUNCE_DELAY));
        }
    }

    class ScrollEffects {
        constructor() {
            this.header = document.querySelector('.l-header, header');
            this.sections = document.querySelectorAll('section[id]');
            this.init();
        }

        init() {
            this.setupScrollSpy();
            this.setupStickyHeader();
            this.setupScrollAnimations();
            this.setupScrollToTop();
        }

        setupScrollSpy() {
            if (this.sections.length === 0) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        const navLink = document.querySelector(`.c-nav__item[href="#${id}"], .nav-link[href="#${id}"]`);
                        
                        document.querySelectorAll('.c-nav__item, .nav-link').forEach(link => {
                            link.classList.remove('active');
                            link.removeAttribute('aria-current');
                        });
                        
                        if (navLink) {
                            navLink.classList.add('active');
                            navLink.setAttribute('aria-current', 'page');
                        }
                    }
                });
            }, {
                rootMargin: '-20% 0px -70% 0px'
            });

            this.sections.forEach(section => observer.observe(section));
        }

        setupStickyHeader() {
            if (!this.header) return;

            let lastScroll = 0;
            const handleScroll = throttle(() => {
                const currentScroll = window.pageYOffset;
                
                if (currentScroll > 100) {
                    this.header.style.boxShadow = 'var(--shadow-md)';
                } else {
                    this.header.style.boxShadow = 'var(--shadow-sm)';
                }

                lastScroll = currentScroll;
            }, CONFIG.THROTTLE_DELAY);

            window.addEventListener('scroll', handleScroll, { passive: true });
        }

        setupScrollAnimations() {
            const animateElements = document.querySelectorAll('.c-card, .trust-badge, img, .c-button');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            animateElements.forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                observer.observe(el);
            });
        }

        setupScrollToTop() {
            const scrollBtn = document.createElement('button');
            scrollBtn.className = 'scroll-to-top';
            scrollBtn.setAttribute('aria-label', 'Nach oben scrollen');
            scrollBtn.innerHTML = '↑';
            scrollBtn.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 50px;
                height: 50px;
                background: var(--color-primary);
                color: var(--color-white);
                border: none;
                border-radius: 50%;
                font-size: 24px;
                cursor: pointer;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease-in-out;
                z-index: 999;
                box-shadow: var(--shadow-lg);
            `;

            document.body.appendChild(scrollBtn);

            const handleScroll = throttle(() => {
                if (window.pageYOffset > 300) {
                    scrollBtn.style.opacity = '1';
                    scrollBtn.style.visibility = 'visible';
                } else {
                    scrollBtn.style.opacity = '0';
                    scrollBtn.style.visibility = 'hidden';
                }
            }, CONFIG.THROTTLE_DELAY);

            window.addEventListener('scroll', handleScroll, { passive: true });

            scrollBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    class SmoothScroll {
        constructor() {
            this.init();
        }

        init() {
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a[href^="#"]');
                if (!link) return;

                const href = link.getAttribute('href');
                if (href === '#' || href === '#!') return;

                const targetId = href.substring(1);
                const target = document.getElementById(targetId);
                
                if (target) {
                    e.preventDefault();
                    const headerHeight = window.innerWidth < CONFIG.BREAKPOINT_MOBILE 
                        ? CONFIG.HEADER_HEIGHT_MOBILE 
                        : CONFIG.HEADER_HEIGHT;
                    const targetPosition = target.offsetTop - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        }
    }

    class Microinteractions {
        constructor() {
            this.init();
        }

        init() {
            this.setupButtonEffects();
            this.setupCardEffects();
            this.setupRippleEffect();
        }

        setupButtonEffects() {
            const buttons = document.querySelectorAll('.c-button, button, .btn');
            
            buttons.forEach(button => {
                button.addEventListener('mouseenter', (e) => {
                    const target = e.currentTarget;
                    target.style.transform = 'translateY(-2px)';
                });

                button.addEventListener('mouseleave', (e) => {
                    const target = e.currentTarget;
                    target.style.transform = 'translateY(0)';
                });
            });
        }

        setupCardEffects() {
            const cards = document.querySelectorAll('.c-card, .trust-badge, .accordion-item');
            
            cards.forEach(card => {
                card.addEventListener('mouseenter', (e) => {
                    const target = e.currentTarget;
                    target.style.transition = 'all 0.3s ease-out';
                    target.style.transform = 'translateY(-4px)';
                    target.style.boxShadow = 'var(--shadow-lg)';
                });

                card.addEventListener('mouseleave', (e) => {
                    const target = e.currentTarget;
                    target.style.transform = 'translateY(0)';
                    target.style.boxShadow = '';
                });
            });
        }

        setupRippleEffect() {
            const elements = document.querySelectorAll('.c-button, button, a, .nav-link');
            
            elements.forEach(element => {
                element.addEventListener('click', function(e) {
                    const ripple = document.createElement('span');
                    const rect = this.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    const x = e.clientX - rect.left - size / 2;
                    const y = e.clientY - rect.top - size / 2;

                    ripple.style.cssText = `
                        position: absolute;
                        width: ${size}px;
                        height: ${size}px;
                        border-radius: 50%;
                        background: rgba(255, 255, 255, 0.5);
                        left: ${x}px;
                        top: ${y}px;
                        transform: scale(0);
                        animation: ripple-animation 0.6s ease-out;
                        pointer-events: none;
                    `;

                    this.style.position = 'relative';
                    this.style.overflow = 'hidden';
                    this.appendChild(ripple);

                    setTimeout(() => ripple.remove(), 600);
                });
            });

            const style = document.createElement('style');
            style.textContent = `
                @keyframes ripple-animation {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    class FormValidation {
        constructor() {
            this.forms = document.querySelectorAll('form');
            this.init();
        }

        init() {
            this.forms.forEach(form => {
                this.setupForm(form);
            });
        }

        setupForm(form) {
            const fields = form.querySelectorAll('input, textarea, select');
            
            fields.forEach(field => {
                field.addEventListener('blur', () => this.validateField(field));
                field.addEventListener('input', () => {
                    if (field.classList.contains('is-invalid')) {
                        this.validateField(field);
                    }
                });
            });

            form.addEventListener('submit', (e) => this.handleSubmit(e, form));
        }

        validateField(field) {
            const value = field.value.trim();
            const type = field.type;
            const id = field.id;
            const name = field.name;
            let isValid = true;
            let errorMessage = '';

            if (field.hasAttribute('required') && !value) {
                isValid = false;
                errorMessage = 'Dieses Feld ist erforderlich.';
            } else if (value) {
                if (type === 'email' || id === 'email' || name === 'email' || id === 'newsletter-email') {
                    if (!VALIDATORS.email.test(value)) {
                        isValid = false;
                        errorMessage = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
                    }
                } else if (type === 'tel' || id === 'phone' || name === 'phone') {
                    if (!VALIDATORS.phone.test(value)) {
                        isValid = false;
                        errorMessage = 'Bitte geben Sie eine gültige Telefonnummer ein (10-20 Zeichen).';
                    }
                } else if (id === 'firstname' || id === 'lastname' || name === 'firstname' || name === 'lastname') {
                    if (!VALIDATORS.name.test(value)) {
                        isValid = false;
                        errorMessage = 'Bitte geben Sie einen gültigen Namen ein (2-50 Zeichen).';
                    }
                } else if (id === 'message' || name === 'message') {
                    if (!VALIDATORS.message.test(value)) {
                        isValid = false;
                        errorMessage = 'Die Nachricht muss mindestens 10 Zeichen lang sein.';
                    }
                }
            }

            if (type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
                isValid = false;
                errorMessage = 'Bitte akzeptieren Sie die Bedingungen.';
            }

            this.updateFieldStatus(field, isValid, errorMessage);
            return isValid;
        }

        updateFieldStatus(field, isValid, errorMessage) {
            const errorContainer = field.parentElement.querySelector('.c-form__error');
            
            if (isValid) {
                field.classList.remove('is-invalid');
                field.classList.add('is-valid');
                if (errorContainer) {
                    errorContainer.textContent = '';
                }
            } else {
                field.classList.remove('is-valid');
                field.classList.add('is-invalid');
                if (errorContainer) {
                    errorContainer.textContent = errorMessage;
                }
            }
        }

        handleSubmit(e, form) {
            e.preventDefault();
            
            const fields = form.querySelectorAll('input:not([type="hidden"]), textarea, select');
            let isFormValid = true;

            fields.forEach(field => {
                if (!this.validateField(field)) {
                    isFormValid = false;
                }
            });

            if (!isFormValid) {
                const firstInvalid = form.querySelector('.is-invalid');
                if (firstInvalid) {
                    firstInvalid.focus();
                }
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.textContent : '';
            
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Wird gesendet...';
            }

            setTimeout(() => {
                window.location.href = 'thank_you.html';
            }, 1000);
        }
    }

    class CountUpAnimation {
        constructor() {
            this.counters = document.querySelectorAll('[data-count]');
            this.init();
        }

        init() {
            if (this.counters.length === 0) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            this.counters.forEach(counter => observer.observe(counter));
        }

        animateCounter(element) {
            const target = parseInt(element.getAttribute('data-count'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += step;
                if (current < target) {
                    element.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    element.textContent = target;
                }
            };

            updateCounter();
        }
    }

    class ImageOptimization {
        constructor() {
            this.images = document.querySelectorAll('img');
            this.videos = document.querySelectorAll('video');
            this.init();
        }

        init() {
            this.optimizeImages();
            this.optimizeVideos();
        }

        optimizeImages() {
            this.images.forEach(img => {
                if (!img.hasAttribute('loading') && !img.classList.contains('c-logo__img')) {
                    img.setAttribute('loading', 'lazy');
                }

                if (!img.classList.contains('img-fluid')) {
                    img.classList.add('img-fluid');
                }

                img.addEventListener('error', (e) => {
                    const fallback = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IiM2Yzc1N2QiPkJpbGQ8L3RleHQ+PC9zdmc+';
                    e.target.src = fallback;
                });
            });
        }

        optimizeVideos() {
            this.videos.forEach(video => {
                if (!video.hasAttribute('loading')) {
                    video.setAttribute('loading', 'lazy');
                }
            });
        }
    }

    class PollSystem {
        constructor() {
            this.pollSection = document.getElementById('poll-section');
            this.voteButton = document.getElementById('vote-button');
            this.init();
        }

        init() {
            if (!this.pollSection || !this.voteButton) return;

            this.voteButton.addEventListener('click', () => this.handleVote());
        }

        handleVote() {
            const checkboxes = document.querySelectorAll('.c-checkbox:checked');
            
            if (checkboxes.length === 0) {
                alert('Bitte wählen Sie mindestens eine Option aus.');
                return;
            }

            const results = {
                'option-bavaria': 35,
                'option-berlin': 28,
                'option-coast': 22,
                'option-rhine': 15
            };

            checkboxes.forEach(checkbox => {
                const id = checkbox.id;
                if (results[id]) {
                    results[id] += 1;
                }
            });

            this.displayResults(results);
        }

        displayResults(results) {
            const total = Object.values(results).reduce((a, b) => a + b, 0);
            const pollOptions = document.querySelector('.poll-options');
            
            pollOptions.innerHTML = '<h4 class="mb-4">Ergebnisse:</h4>';

            Object.entries(results).forEach(([key, value]) => {
                const percentage = ((value / total) * 100).toFixed(1);
                const optionDiv = document.createElement('div');
                optionDiv.className = 'poll-result mb-4';
                optionDiv.innerHTML = `
                    <div class="d-flex justify-content-between mb-2">
                        <span>${this.getOptionLabel(key)}</span>
                        <span class="poll-percentage">${percentage}%</span>
                    </div>
                    <div class="poll-bar">
                        <div class="poll-fill" style="width: ${percentage}%"></div>
                    </div>
                `;
                pollOptions.appendChild(optionDiv);
            });

            this.voteButton.disabled = true;
            this.voteButton.textContent = 'Danke für Ihre Stimme!';
        }

        getOptionLabel(key) {
            const labels = {
                'option-bavaria': 'Bayern',
                'option-berlin': 'Berlin',
                'option-coast': 'Nordseeküste',
                'option-rhine': 'Rheintal'
            };
            return labels[key] || key;
        }
    }

    class PrivacyModal {
        constructor() {
            this.init();
        }

        init() {
            const privacyLinks = document.querySelectorAll('a[href*="privacy"], a[href*="datenschutz"]');
            
            privacyLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    if (link.getAttribute('href').includes('#')) {
                        e.preventDefault();
                        this.showModal();
                    }
                });
            });
        }

        showModal() {
            const modal = document.createElement('div');
            modal.className = 'privacy-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 20px;
            `;

            modal.innerHTML = `
                <div style="
                    background: white;
                    border-radius: 12px;
                    padding: 40px;
                    max-width: 600px;
                    max-height: 80vh;
                    overflow-y: auto;
                    position: relative;
                ">
                    <button style="
                        position: absolute;
                        top: 20px;
                        right: 20px;
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        width: 32px;
                        height: 32px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    " class="close-modal">×</button>
                    <h2>Datenschutzerklärung</h2>
                    <p>Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst...</p>
                    <a href="privacy.html" class="c-button c-button--primary mt-4">Vollständige Datenschutzerklärung</a>
                </div>
            `;

            document.body.appendChild(modal);

            modal.querySelector('.close-modal').addEventListener('click', () => {
                modal.remove();
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }
    }

    __app.init = function() {
        new BurgerMenu();
        new ScrollEffects();
        new SmoothScroll();
        new Microinteractions();
        new FormValidation();
        new CountUpAnimation();
        new ImageOptimization();
        new PollSystem();
        new PrivacyModal();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', __app.init);
    } else {
        __app.init();
    }

})();