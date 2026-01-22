// Hamburger menu
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    const navbarDrawer = document.getElementById('navbarDrawer');
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navbarDrawer.classList.toggle('active');
    });
    
    // Zamknij menu po kliknięciu w link
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navbarDrawer.classList.remove('active');
        });
    });

    // Płynne przewijanie do sekcji
    const allLinks = document.querySelectorAll('.nav-menu a, .btn-primary');
    
    allLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Chowanie/pokazywanie topbara przy scrollowaniu
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // Jeśli menu jest otwarte, nie chowaj topbara
        if (navMenu.classList.contains('active')) {
            return;
        }
        
        if (currentScroll <= 0) {
            navbar.classList.remove('navbar-hidden');
            return;
        }
        
        if (currentScroll > lastScroll && currentScroll > 100) {
            navbar.classList.add('navbar-hidden');
        } else if (currentScroll < lastScroll) {
            navbar.classList.remove('navbar-hidden');
        }
        
        lastScroll = currentScroll;
    });
    
    console.log('Portfolio Łukasza Dudy - strona załadowana!');
});