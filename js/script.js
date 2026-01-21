// Płynne przewijanie do sekcji
document.addEventListener('DOMContentLoaded', function() {
    
    // Znajdź wszystkie linki w nawigacji
    const navLinks = document.querySelectorAll('.nav-menu a, .btn-primary');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Sprawdź czy link prowadzi do sekcji na tej samej stronie
            const href = this.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                
                // Znajdź docelową sekcję
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    // Płynne przewijanie
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    console.log('Portfolio Łukasza Dudy - strona załadowana!');
});