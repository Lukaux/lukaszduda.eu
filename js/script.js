// Hamburger menu
document.addEventListener('DOMContentLoaded', function() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersReducedMotion = () => reduceMotion.matches;

    const safeStorage = {
        get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
        set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* unavailable */ } }
    };

    const hamburger = document.getElementById('hamburger');
    const navbarDrawer = document.getElementById('navbarDrawer');

    function closeMenu() {
        hamburger.classList.remove('active');
        navbarDrawer.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    }

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navbarDrawer.classList.toggle('active');
        const isOpen = hamburger.classList.contains('active');
        hamburger.setAttribute('aria-expanded', String(isOpen));
        window.umami?.track(isOpen ? 'menu-open' : 'menu-close');
    });

    // Zamknij menu po kliknięciu w link
    navbarDrawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Logo jako przycisk home — przeładowanie strony
    const logoLink = document.querySelector('.logo');
    if (logoLink) {
        logoLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo(0, 0);
            window.location.reload();
        });
    }

    // Płynne przewijanie do sekcji
    const allLinks = document.querySelectorAll('.navbar-nav a, .navbar-drawer a, .btn-primary');

    allLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            if (href.startsWith('#')) {
                e.preventDefault();

                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Smart navbar — hide on scroll down, show on scroll up
    const navbarWrapper = document.querySelector('.navbar-wrapper');
    let lastScrollY = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;

                if (currentScrollY > lastScrollY && currentScrollY > 56) {
                    // Scroll down — hide navbar
                    navbarWrapper.classList.add('navbar-hidden');
                    closeMenu();
                } else {
                    // Scroll up — show navbar
                    navbarWrapper.classList.remove('navbar-hidden');
                }

                lastScrollY = currentScrollY;
                ticking = false;
            });
            ticking = true;
        }
    });

    // Language toggle with auto-detection and localStorage persistence
    function applyLanguage(lang) {
        const isEn = lang === 'en';
        document.documentElement.lang = isEn ? 'en' : 'pl';
        document.body.classList.toggle('lang-en', isEn);

        document.querySelectorAll('[data-en]').forEach(el => {
            const isMeta = el.tagName === 'META';
            const read = () => isMeta ? el.getAttribute('content') : el.innerHTML;
            const write = (val) => isMeta ? el.setAttribute('content', val) : (el.innerHTML = val);

            if (isEn) {
                if (!el.dataset.pl) {
                    el.dataset.pl = read();
                }
                write(el.dataset.en);
            } else if (el.dataset.pl) {
                write(el.dataset.pl);
            }
        });
    }

    // Determine language: localStorage > auto-detect from browser
    const savedLang = safeStorage.get('lang');
    const detectedLang = navigator.language.startsWith('pl') ? 'pl' : 'en';
    const currentLang = savedLang || detectedLang;

    const langToggle = document.getElementById('langToggle');

    if (currentLang === 'en') {
        applyLanguage('en');
        if (langToggle) langToggle.setAttribute('aria-pressed', 'true');
    }

    if (langToggle) {
        langToggle.addEventListener('click', function() {
            const newLang = document.body.classList.contains('lang-en') ? 'pl' : 'en';
            safeStorage.set('lang', newLang);
            applyLanguage(newLang);
            langToggle.setAttribute('aria-pressed', String(newLang === 'en'));
            const announce = document.getElementById('lang-announcement');
            if (announce) {
                announce.textContent = newLang === 'en'
                    ? 'Language changed to English'
                    : 'Zmieniono język na polski';
            }
        });
    }

    // Portfolio expandable cards
    document.querySelectorAll('.pce-header').forEach(header => {
        header.addEventListener('click', function() {
            const card = this.closest('.pce');
            const isOpen = card.classList.contains('is-open');
            const willOpen = !isOpen;
            card.classList.toggle('is-open', willOpen);
            this.setAttribute('aria-expanded', String(willOpen));

            const cardId = this.dataset.card;
            if (cardId) {
                window.umami?.track((willOpen ? 'card-open-' : 'card-close-') + cardId);
            }

            const animSvg = card.querySelector('.pce-magnifier, .pce-satellite, .pce-crosshair, .pce-pen-tool, .pce-photo, .pce-robot');
            if (animSvg) {
                animSvg.classList.remove('animate');
                if (willOpen && !prefersReducedMotion()) {
                    // Wait for card to finish expanding before starting animation
                    setTimeout(() => animSvg.classList.add('animate'), 450);
                }
            }
        });
    });

    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarReopen = document.getElementById('sidebarReopen');

    const savedSidebar = safeStorage.get('sidebar');

    if (savedSidebar === 'closed') {
        document.body.classList.add('sidebar-hidden');
        if (sidebarToggle) sidebarToggle.setAttribute('aria-pressed', 'false');
    }

    function toggleSidebar() {
        document.body.classList.add('sidebar-transitioning');
        const isHidden = document.body.classList.toggle('sidebar-hidden');
        setTimeout(function() { document.body.classList.remove('sidebar-transitioning'); }, 260);
        safeStorage.set('sidebar', isHidden ? 'closed' : 'open');
        if (sidebarToggle) sidebarToggle.setAttribute('aria-pressed', String(!isHidden));
        window.umami?.track(isHidden ? 'sidebar-hide' : 'sidebar-show');
    }

    if (sidebarToggle) sidebarToggle.addEventListener('click', toggleSidebar);
    if (sidebarReopen) sidebarReopen.addEventListener('click', toggleSidebar);

    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    if (sections.length > 0) {
        const navLinks = document.querySelectorAll('.navbar-nav a[href^="#"]');

        const sectionObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(function(link) { link.classList.remove('active'); });
                    const activeLink = document.querySelector('.navbar-nav a[href="#' + id + '"]');
                    if (activeLink) activeLink.classList.add('active');
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40% 0px' });

        sections.forEach(function(section) { sectionObserver.observe(section); });
    }

    // Dark mode toggle with auto-detection and localStorage persistence
    const darkModeToggle = document.getElementById('darkModeToggle');

    const savedMode = safeStorage.get('darkMode');
    const detectedMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const currentMode = savedMode || detectedMode;

    if (currentMode === 'dark') {
        document.body.classList.add('dark-mode');
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            safeStorage.set('darkMode', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        });
    }

});
