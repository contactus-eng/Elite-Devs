// Check if page is still loading
function checkPageLoadStatus() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        let loadHandled = false;
        const hideLoadingScreen = () => {
            if (loadHandled) return;
            loadHandled = true;
            document.body.style.overflow = '';
            if (typeof gsap !== 'undefined') {
        gsap.to(loadingScreen, {
            opacity: 0,
                    duration: 0.5,
            onComplete: () => {
                loadingScreen.style.display = 'none';
                initAnimations();
            }
        });
            } else {
                loadingScreen.classList.add('loaded');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    initAnimations();
                }, 500);
            }
        };
        if (document.readyState === 'complete') {
            document.body.style.overflow = '';
            hideLoadingScreen();
        } else {
            window.addEventListener('load', hideLoadingScreen);
            setTimeout(hideLoadingScreen, 5000);
        }
    } else {
        document.body.style.overflow = '';
        initAnimations();
    }
    }
    
    // Hero Section Animations
    function initHeroAnimations() {
    if (!document.querySelector('.hero-title')) return;
    
    if (typeof gsap === 'undefined') {
        // Fallback: ensure elements are visible
        const titleLines = document.querySelectorAll('.title-line');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroButtons = document.querySelector('.hero-buttons');
        const floatingCards = document.querySelectorAll('.floating-card');
        
        titleLines.forEach(line => {
            line.style.opacity = '1';
            line.style.transform = 'translateY(0)';
        });
        
        if (heroSubtitle) {
            heroSubtitle.style.opacity = '1';
            heroSubtitle.style.transform = 'translateY(0)';
        }
        
        if (heroButtons) {
            heroButtons.style.opacity = '1';
            heroButtons.style.transform = 'translateY(0)';
        }
        
        floatingCards.forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1) rotate(0deg)';
        });
        return;
    }
    
    const titleLines = document.querySelectorAll('.title-line');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroButtons = document.querySelector('.hero-buttons');
        const floatingCards = document.querySelectorAll('.floating-card');
        
        // Animate title lines
    if (titleLines.length > 0) {
        gsap.fromTo('.title-line', 
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power3.out" }
        );
    }
        
        // Animate subtitle
    if (heroSubtitle) {
        gsap.fromTo(heroSubtitle, 
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 1, delay: 0.8, ease: "power3.out" }
        );
    }
        
        // Animate buttons
    if (heroButtons && heroButtons.children) {
        gsap.fromTo(heroButtons.children, 
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, delay: 1.2, ease: "power3.out" }
        );
    }
        
        // Animate floating cards
    if (floatingCards && floatingCards.length > 0) {
        gsap.fromTo(floatingCards, 
            { opacity: 0, scale: 0.8, rotation: -10 },
            { opacity: 1, scale: 1, rotation: 0, duration: 1, stagger: 0.3, delay: 1.5, ease: "back.out(1.7)" }
        );
    }
    }
    
    // Scroll Animations
    function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    
        // Service cards animation
    const serviceCards = document.querySelectorAll('.service-card');
    const servicesSection = document.querySelector('.services');
    if (serviceCards.length > 0 && servicesSection) {
        gsap.fromTo('.service-card', 
            { opacity: 0, y: 100 },
            { 
                opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power3.out",
                scrollTrigger: {
                    trigger: '.services',
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }
        
        // Portfolio items animation
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const portfolioSection = document.querySelector('.portfolio');
    if (portfolioItems.length > 0 && portfolioSection) {
        gsap.fromTo('.portfolio-item', 
            { opacity: 0, scale: 0.8 },
            { 
                opacity: 1, scale: 1, duration: 1, stagger: 0.3, ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: '.portfolio',
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }
    }
    
    // Three.js Background Animation
    function initThreeJS() {
        const canvas = document.getElementById('hero-canvas');
    if (!canvas || typeof THREE === 'undefined') return;
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Create particles
        const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
        const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 10;
        posArray[i + 1] = (Math.random() - 0.5) * 10;
        posArray[i + 2] = (Math.random() - 0.5) * 10;
        
        colorsArray[i] = Math.random() * 0.5 + 0.5;
        colorsArray[i + 1] = Math.random() * 0.3 + 0.7;
        colorsArray[i + 2] = Math.random() * 0.5 + 0.5;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        vertexColors: true,
            transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
        });
        
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);
        
    camera.position.z = 3;
        
        // Mouse movement effect
        let mouseX = 0;
        let mouseY = 0;
        
        document.addEventListener('mousemove', (event) => {
            mouseX = event.clientX / window.innerWidth - 0.5;
            mouseY = event.clientY / window.innerHeight - 0.5;
        });
        
        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            
        particlesMesh.rotation.y += 0.002;
            particlesMesh.rotation.x += 0.001;
            
        particlesMesh.rotation.x += mouseY * 0.02;
        particlesMesh.rotation.y += mouseX * 0.02;
            
            renderer.render(scene, camera);
        }
        
        animate();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    // Particle System
    function initParticles() {
        const particlesContainer = document.querySelector('.hero-particles');
        if (!particlesContainer) return;
        
    particlesContainer.innerHTML = '';
    
    for (let i = 0; i < 100; i++) {
            createParticle(particlesContainer);
        }
    }
    
    function createParticle(container) {
        const particle = document.createElement('div');
    const size = Math.random() * 4 + 2;
    const colors = [
        'rgba(255, 255, 255, 1)',
        'rgba(255, 255, 255, 0.9)',
        'rgba(120, 119, 198, 0.8)',
        'rgba(255, 119, 198, 0.8)',
        'rgba(120, 219, 255, 0.8)'
    ];
    
        particle.style.position = 'absolute';
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
    particle.style.animation = `float ${Math.random() * 20 + 15}s linear infinite`;
    particle.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.6)';
    particle.style.zIndex = '1';
    particle.style.pointerEvents = 'none';
    
    const animationType = Math.random();
    if (animationType > 0.8) {
        particle.style.animation = `sparkle ${Math.random() * 3 + 2}s ease-in-out infinite`;
    } else if (animationType > 0.6) {
        particle.style.animation = `twinkle ${Math.random() * 2 + 1}s ease-in-out infinite`;
    } else if (animationType > 0.4) {
        particle.style.animation = `float ${Math.random() * 10 + 5}s ease-in-out infinite alternate`;
    }
        
        container.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
                createParticle(container);
            }
    }, 25000);
}
    
    // Mobile Menu
    function initMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
    
    if (!navToggle || !navMenu) return;
        
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        this.classList.toggle('active');
            
            const spans = this.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
        
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            
            const spans = navToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
            });
        });
    }
    
    // Smooth Scrolling
    function initSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
                
            if (targetElement) {
                if (typeof gsap !== 'undefined') {
                    gsap.to(window, {
                        duration: 1,
                        scrollTo: { y: targetElement, offsetY: 80 },
                        ease: "power3.out"
                    });
        } else {
                    targetElement.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// Dark Mode Toggle
function initDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (!darkModeToggle) return;
    
    const newToggle = darkModeToggle.cloneNode(true);
    darkModeToggle.parentNode.replaceChild(newToggle, darkModeToggle);
    
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    const icon = newToggle.querySelector('svg');
    if (icon) {
        icon.innerHTML = currentTheme === 'dark' ? 
            '<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />' :
            '<path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />';
    }
    
    newToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const icon = this.querySelector('svg');
        if (icon) {
            icon.innerHTML = newTheme === 'dark' ? 
                '<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />' :
                '<path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />';
        }
        
        if (typeof gsap !== 'undefined') {
            gsap.to(this, {
                rotation: 360,
                duration: 0.5,
                ease: "power2.out"
            });
        }
    });
}

// Initialize all animations
function initAnimations() {
    if (document.querySelector('.hero-title')) {
        initHeroAnimations();
    }
    
    initScrollAnimations();
    
    if (document.querySelector('.hero-visual')) {
        initThreeJS();
    }
    
    if (document.querySelector('.hero-particles')) {
        initParticles();
        
        setTimeout(() => {
            const particlesContainer = document.querySelector('.hero-particles');
            if (particlesContainer && particlesContainer.children.length === 0) {
                initParticles();
            }
        }, 1000);
    }

    initMobileMenu();
    initSmoothScrolling();
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize GSAP
    if (typeof gsap !== 'undefined') {
        try {
            gsap.registerPlugin(ScrollTrigger, TextPlugin, ScrollToPlugin);
        } catch (error) {
            console.warn('GSAP plugins not available:', error);
        }
    }
    
    // Check page load status and handle loading screen
    checkPageLoadStatus();
    
    // Initialize dark mode
    initDarkMode();
});
