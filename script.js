// Конфигурация приложения
const CONFIG = {
    scrollOffset: 100, // Отступ для активации кнопки "Наверх"
    counterSpeed: 200, // Скорость анимации счетчиков
    parallaxFactor: 0.3, // Интенсивность параллакс-эффекта
    mobileBreakpoint: 768 // Брейкпоинт для мобильных устройств
};

// Основной класс приложения
class PortfolioApp {
    constructor() {
        this.init();
    }

    // Инициализация приложения
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.initIntersectionObservers();
        this.checkScrollPosition();
        this.setupThemeToggle();
    }

    // Кэширование DOM-элементов
    cacheElements() {
        this.elements = {
            navbar: document.querySelector('.navbar'),
            burgerMenu: document.querySelector('.burger-menu'),
            navLinks: document.querySelector('.nav-links'),
            backToTop: document.querySelector('.back-to-top'),
            themeToggle: document.querySelector('.theme-toggle'),
            modal: document.querySelector('.modal'),
            modalContent: document.querySelector('.modal-content'),
            modalClose: document.querySelector('.close'),
            videoCards: document.querySelectorAll('.work-card video'),
            counters: document.querySelectorAll('.counter')
        };
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Бургер-меню
        this.elements.burgerMenu.addEventListener('click', this.toggleMenu.bind(this));

        // Закрытие меню при клике на ссылку
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', this.closeMenu.bind(this));
        });

        // Плавная прокрутка
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', this.smoothScroll.bind(this));
        });

        // Кнопка "Наверх"
        this.elements.backToTop.addEventListener('click', this.scrollToTop.bind(this));

        // Модальное окно
        this.elements.modalClose.addEventListener('click', this.closeModal.bind(this));
        this.elements.modal.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) this.closeModal();
        });

        // Автовоспроизведение видео
        this.setupVideoHover();

        // Обработчик скролла
        window.addEventListener('scroll', this.debounce(this.handleScroll.bind(this), { passive: true });

        // Обработчик движения мыши
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
    }

    // Инициализация Intersection Observer
    initIntersectionObservers() {
        // Для анимации при скролле
        this.scrollRevealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        // Для счетчиков
        this.counterObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateCounters(entry.target);
                        this.counterObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );

        // Наблюдаем за элементами
        document.querySelectorAll('.scroll-reveal').forEach(el => {
            this.scrollRevealObserver.observe(el);
        });

        this.elements.counters.forEach(counter => {
            this.counterObserver.observe(counter);
        });
    }

    // Управление бургер-меню
    toggleMenu() {
        this.elements.burgerMenu.classList.toggle('active');
        this.elements.navLinks.classList.toggle('active');
        this.elements.burgerMenu.setAttribute(
            'aria-expanded',
            this.elements.burgerMenu.classList.contains('active')
        );
    }

    closeMenu() {
        this.elements.burgerMenu.classList.remove('active');
        this.elements.navLinks.classList.remove('active');
        this.elements.burgerMenu.setAttribute('aria-expanded', 'false');
    }

    // Плавная прокрутка
    smoothScroll(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Управление скроллом
    handleScroll() {
        const scrollPosition = window.pageYOffset;
        
        // Параллакс эффект
        document.documentElement.style.setProperty('--scroll-y', scrollPosition);
        
        // Кнопка "Наверх"
        this.toggleBackToTop(scrollPosition > CONFIG.scrollOffset);
        
        // Навигация при скролле
        this.elements.navbar.classList.toggle('scrolled', scrollPosition > 50);
    }

    // Дебаунс для оптимизации скролла
    debounce(func, wait = 100) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(this, args);
            }, wait);
        };
    }

    // Кнопка "Наверх"
    toggleBackToTop(show) {
        this.elements.backToTop.classList.toggle('visible', show);
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Проверка позиции скролла при загрузке
    checkScrollPosition() {
        this.handleScroll();
    }

    // Управление видео при наведении
    setupVideoHover() {
        this.elements.videoCards.forEach(video => {
            const card = video.closest('.work-card');
            
            card.addEventListener('mouseenter', () => {
                video.play().catch(e => console.error("Автовоспроизведение не сработало:", e));
            });
            
            card.addEventListener('mouseleave', () => {
                video.pause();
                video.currentTime = 0;
            });
        });
    }

    // Анимация счетчиков
    animateCounters(target) {
        const counters = target ? [target] : this.elements.counters;
        
        counters.forEach(counter => {
            const targetValue = +counter.getAttribute('data-target');
            const isPercentage = counter.textContent.includes('%');
            const isPlus = counter.textContent.includes('+');
            const duration = CONFIG.counterSpeed;
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / duration, 1);
                const currentValue = Math.floor(progress * targetValue);
                
                counter.textContent = currentValue + (isPercentage ? '%' : isPlus ? '+' : '');
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    counter.textContent = targetValue + (isPercentage ? '%' : isPlus ? '+' : '');
                }
            };
            
            requestAnimationFrame(animate);
        });
    }

    // Управление модальным окном
    openModal(src) {
        this.elements.modalContent.src = src;
        this.elements.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.elements.modal.style.display = 'none';
        document.body.style.overflow = '';
        this.elements.modalContent.src = '';
    }

    // Переключение темы
    setupThemeToggle() {
        if (!this.elements.themeToggle) return;
        
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.classList.add(savedTheme);
        }
        
        this.elements.themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('light-theme');
            const theme = document.documentElement.classList.contains('light-theme') 
                ? 'light-theme' 
                : '';
            localStorage.setItem('theme', theme);
        });
    }

    // Эффект параллакса для курсора
    handleMouseMove(e) {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        document.documentElement.style.setProperty('--mouse-x', x);
        document.documentElement.style.setProperty('--mouse-y', y);
    }
}

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioApp();
});

// Preloader
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Инициализация анимации счетчиков после загрузки
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        counter.textContent = '0';
    });
});

// Service Worker для PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
            registration => console.log('ServiceWorker registration successful'),
            err => console.log('ServiceWorker registration failed: ', err)
        );
    });
}