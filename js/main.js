/**
 * Všechno Caffe 2.0 - Main Logic
 * Handles Time-Based Mode Switching, Parallax, and Animations
 */

document.addEventListener('DOMContentLoaded', () => {
    initTimeManager();
    initAnimations();
    initParallax();
    initMobileMenu();
});

/* --- CONFIGURATION --- */
const MODES = {
    CAFE: 'cafe',
    LUNCH: 'lunch',
    CLUB: 'club'
};

const CONTENT = {
    [MODES.CAFE]: {
        title: 'Ranní<br>Probuzení',
        subtitle: 'Začněte svůj den s výběrovou kávou v atmosféře, která inspiruje.',
        btnText: 'Prohlédnout Menu',
        btnLink: '#menu'
    },
    [MODES.LUNCH]: {
        title: 'Polední<br>Symfonie',
        subtitle: 'Gastronomický zážitek uprostřed dne. Čerstvé suroviny, mistrovské provedení.',
        btnText: 'Denní Nabídka',
        btnLink: '#menu'
    },
    [MODES.CLUB]: {
        title: 'Noční<br>Život',
        subtitle: 'Exkluzivní atmosféra, signature koktejly a hudba, která vás pohltí.',
        btnText: 'Rezervovat VIP',
        btnLink: '#reservations'
    }
};

let manualOverride = false;

/* --- TIME MANAGER --- */
function initTimeManager() {
    // Switcher Buttons
    const buttons = document.querySelectorAll('.switch-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            manualOverride = true;
            applyMode(mode);
        });
    });

    // Initial Check
    updateMode();

    // Periodic Check (every minute)
    setInterval(() => {
        if (!manualOverride) {
            updateMode();
        }
    }, 60000);
}

function updateMode() {
    if (manualOverride) return;

    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const time = hour + minute / 60;

    let currentMode = MODES.CAFE;

    if (time >= 7 && time < 11.5) {
        currentMode = MODES.CAFE;
    } else if (time >= 11.5 && time < 15) {
        currentMode = MODES.LUNCH;
    } else if (time >= 19 || time < 4) {
        currentMode = MODES.CLUB;
    } else {
        currentMode = MODES.CAFE; // Default fallback
    }

    applyMode(currentMode);
}

function applyMode(mode) {
    const body = document.body;
    const content = CONTENT[mode];

    // Update Body Class
    Object.values(MODES).forEach(m => body.classList.remove(`mode-${m}`));
    body.classList.add(`mode-${mode}`);

    // Update Hero Content with Fade Effect
    const titleEl = document.getElementById('hero-title');
    const subtitleEl = document.getElementById('hero-subtitle');
    const btnEl = document.getElementById('hero-btn');

    if (titleEl && subtitleEl && btnEl) {
        // Simple fade out/in simulation
        titleEl.style.opacity = 0;
        subtitleEl.style.opacity = 0;
        
        setTimeout(() => {
            titleEl.innerHTML = content.title;
            subtitleEl.textContent = content.subtitle;
            btnEl.textContent = content.btnText;
            btnEl.href = content.btnLink;
            
            titleEl.style.opacity = 1;
            subtitleEl.style.opacity = 1;
        }, 300);
    }

    // Update Switcher State
    document.querySelectorAll('.switch-btn').forEach(btn => {
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

/* --- ANIMATIONS --- */
function initAnimations() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-delay-1, .reveal-delay-2, .reveal-delay-3');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => observer.observe(el));
}

/* --- PARALLAX --- */
function initParallax() {
    const parallaxImgs = document.querySelectorAll('.parallax-img');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        parallaxImgs.forEach(img => {
            const speed = 0.15;
            const rect = img.parentElement.getBoundingClientRect();
            // Only animate if in view
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const yPos = -(rect.top * speed);
                img.style.transform = `translateY(${yPos}px)`;
            }
        });
    });
}

/* --- MOBILE MENU --- */
function initMobileMenu() {
    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.nav-links');
    
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            toggle.classList.toggle('active');
        });
    }
}
