// ==================== ELEMENTS ====================
const hero = document.getElementById("hero");
const sidebar = document.querySelector(".sidebar");
const glow = document.querySelector(".cursor-glow");
const blobs = document.querySelectorAll(".blob");
const themeToggle = document.getElementById("themeToggle");
const wordElement = document.getElementById("changing-word");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ==================== DARK MODE ====================
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    document.documentElement.classList.add("dark-mode");
}

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const html = document.documentElement;
        html.classList.toggle("dark-mode");
        localStorage.setItem("theme", html.classList.contains("dark-mode") ? "dark" : "light");
    }, { passive: true });
}

// ==================== SCROLL (SIDEBAR) ====================
let sidebarVisible = false;
function updateSidebar() {
    if (!hero || !sidebar) return;
    const shouldShow = window.scrollY > hero.offsetHeight - 180;
    if (shouldShow !== sidebarVisible) {
        sidebarVisible = shouldShow;
        sidebar.classList.toggle("show", shouldShow);
    }
}
window.addEventListener("scroll", updateSidebar, { passive: true });

// ==================== HERO ANIMATIONS ====================
let mouseX = 0, mouseY = 0;
let currentX = 0, currentY = 0;
let targetX = 0, targetY = 0;
let currentTargetX = 0, currentTargetY = 0;
let heroVisible = true;

function centerGlow() {
    if (!hero || !glow) return;
    currentX = hero.clientWidth / 2;
    currentY = hero.clientHeight / 2;
    glow.style.left = `${currentX}px`;
    glow.style.top = `${currentY}px`;
}

if (hero) {
    hero.addEventListener("mousemove", (e) => {
        const rect = hero.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        targetX = mouseX / rect.width - 0.5;
        targetY = mouseY / rect.height - 0.5;
    }, { passive: true });
}

function animateHero() {
    if (heroVisible && !prefersReducedMotion) {
        // Cursor glow
        if (glow) {
            currentX += (mouseX - currentX) * 0.055;
            currentY += (mouseY - currentY) * 0.055;
            glow.style.left = `${currentX}px`;
            glow.style.top = `${currentY}px`;
        }

        // Water blobs
        currentTargetX += (targetX - currentTargetX) * 0.12;
        currentTargetY += (targetY - currentTargetY) * 0.12;
        if (blobs[0]) blobs[0].style.transform = `translate(${currentTargetX * -110}px, ${currentTargetY * -95}px)`;
        if (blobs[1]) blobs[1].style.transform = `translate(${currentTargetX * 105}px, ${currentTargetY * -120}px)`;
        if (blobs[2]) blobs[2].style.transform = `translate(${currentTargetX * -75}px, ${currentTargetY * 100}px)`;
    }
    requestAnimationFrame(animateHero);
}
animateHero();

// Pause hero animations when not visible
if (hero) {
    const heroObserver = new IntersectionObserver((entries) => {
        heroVisible = entries[0].isIntersecting;
    }, { threshold: 0 });
    heroObserver.observe(hero);
}

// ==================== SCROLL RESTORE ====================
if (history.scrollRestoration) {
    history.scrollRestoration = "manual";
}

document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("http")) return;
    sessionStorage.setItem("scrollPos", window.scrollY);
});

// ==================== SMOOTH SCROLL ====================
document.addEventListener("click", (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor || anchor.getAttribute("href") === "#") return;
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute("href"));
    if (target) target.scrollIntoView({ behavior: "smooth" });
});

// ==================== CHANGING WORDS ====================
const words = {
    en: ["UX/UI", "Digital Experiences", "Visual Content"],
    es: ["UX/UI", "Experiencias Digitales", "Contenido Visual"]
};

let currentLanguage = localStorage.getItem("language") || "es";
let wordIndex = 0;
let typeTimer = null;
let deleteTimer = null;
let loopTimer = null;

function stopTypewriter() {
    clearInterval(typeTimer);
    clearInterval(deleteTimer);
    clearTimeout(loopTimer);
    typeTimer = null;
    deleteTimer = null;
    loopTimer = null;
}

function typeWord(word, callback) {
    if (!wordElement) return;
    let i = 0;
    typeTimer = setInterval(() => {
        wordElement.textContent = word.slice(0, i);
        i++;
        if (i > word.length) {
            clearInterval(typeTimer);
            typeTimer = null;
            loopTimer = setTimeout(callback, 1700);
        }
    }, 75);
}

function deleteWord(callback) {
    if (!wordElement) return;
    let text = wordElement.textContent;
    deleteTimer = setInterval(() => {
        text = text.slice(0, -1);
        wordElement.textContent = text;
        if (text.length === 0) {
            clearInterval(deleteTimer);
            deleteTimer = null;
            callback();
        }
    }, 40);
}

function loopWords() {
    deleteWord(() => {
        wordIndex = (wordIndex + 1) % words[currentLanguage].length;
        typeWord(words[currentLanguage][wordIndex], loopWords);
    });
}

function startTypewriter() {
    stopTypewriter();
    if (!wordElement) return;
    if (prefersReducedMotion) {
        wordElement.textContent = words[currentLanguage][0];
        return;
    }
    wordIndex = 0;
    wordElement.textContent = words[currentLanguage][0];
    loopTimer = setTimeout(loopWords, 1800);
}

function changeLanguage(lang) {
    currentLanguage = lang;
    document.querySelectorAll("[data-es]").forEach(el => {
        if (lang === "en" && el.dataset.en) {
            if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                el.placeholder = el.dataset.en;
            } else {
                el.innerHTML = el.dataset.en;
            }
        } else if (el.dataset.es) {
            if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                el.placeholder = el.dataset.es;
            } else {
                el.innerHTML = el.dataset.es;
            }
        }
    });
    document.querySelectorAll("[data-es-aria]").forEach(el => {
        el.setAttribute("aria-label", lang === "en" ? el.dataset.enAria : el.dataset.esAria);
    });
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute("content", lang === "en"
            ? "Rosana Ríos — UX/UI Design and visual content for social media and digital products."
            : "Portafolio de Rosana Ríos — UX/UI Design y contenido visual para redes y productos digitales."
        );
    }
    document.documentElement.lang = lang;
    const titleEl = document.querySelector("title");
    if (titleEl) {
        titleEl.textContent = lang === "en" ? titleEl.dataset.en : titleEl.dataset.es;
    }
    startTypewriter();
}

// ==================== CAROUSELS ====================
function initCarousels() {
    document.querySelectorAll("[data-carousel]").forEach(carousel => {
        const track = carousel.querySelector(".carousel-track");
        const slides = carousel.querySelectorAll(".carousel-slide");
        const prevBtn = carousel.querySelector(".carousel-arrow--prev");
        const nextBtn = carousel.querySelector(".carousel-arrow--next");
        let current = 0;
        let autoTimer = null;
        const total = slides.length;

        function goTo(index) {
            current = (index + total) % total;
            track.style.transform = `translateX(-${current * 100}%)`;
        }

        function startAuto() {
            stopAuto();
            if (!prefersReducedMotion) {
                autoTimer = setInterval(() => goTo(current + 1), 4000);
            }
        }

        function stopAuto() {
            if (autoTimer) clearInterval(autoTimer);
        }

        if (prevBtn) prevBtn.addEventListener("click", (e) => { e.stopPropagation(); e.preventDefault(); goTo(current - 1); startAuto(); });
        if (nextBtn) nextBtn.addEventListener("click", (e) => { e.stopPropagation(); e.preventDefault(); goTo(current + 1); startAuto(); });

        carousel.addEventListener("click", (e) => {
            if (e.target.closest("a")) return;
            e.stopPropagation();
            e.preventDefault();
        });

        let touchStartX = 0;
        carousel.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; stopAuto(); }, { passive: true });
        carousel.addEventListener("touchend", (e) => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
                goTo(diff > 0 ? current + 1 : current - 1);
            }
            startAuto();
        }, { passive: true });

        carousel.addEventListener("mouseenter", stopAuto);
        carousel.addEventListener("mouseleave", startAuto);

        startAuto();
    });
}

// ==================== OVERLAY BUTTONS ====================
document.addEventListener("click", (e) => {
    const btn = e.target.closest(".overlay-btn[data-url]");
    if (!btn) return;
    e.stopPropagation();
    e.preventDefault();
    const url = btn.dataset.url;
    if (url && url !== "#") {
        window.open(url, "_blank", "noopener,noreferrer");
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const btn = e.target.closest(".overlay-btn[data-url]");
    if (!btn) return;
    e.preventDefault();
    const url = btn.dataset.url;
    if (url && url !== "#") {
        window.open(url, "_blank", "noopener,noreferrer");
    }
});

// ==================== DOM READY ====================
document.addEventListener("DOMContentLoaded", () => {
    // Restore scroll position
    const saved = sessionStorage.getItem("scrollPos");
    if (saved !== null) {
        window.scrollTo(0, parseInt(saved, 10));
        sessionStorage.removeItem("scrollPos");
    }

    // Hero entrance
    document.querySelector(".hero-headline")?.classList.add("show");
    document.querySelector(".changing-word-wrapper")?.classList.add("show");
    document.querySelector(".hero-ctas")?.classList.add("show");

    // Language switcher
    const langBtns = document.querySelectorAll(".lang-btn");
    langBtns.forEach(btn => {
        btn.classList.toggle("active", btn.dataset.lang === currentLanguage);
    });
    changeLanguage(currentLanguage);
    langBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            langBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            changeLanguage(btn.dataset.lang);
            localStorage.setItem("language", btn.dataset.lang);
        });
    });

    // Hamburger menu
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            const isOpen = menuToggle.classList.toggle("open");
            navLinks.classList.toggle("open");
            menuToggle.setAttribute("aria-expanded", isOpen);
        });
        navLinks.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                menuToggle.classList.remove("open");
                navLinks.classList.remove("open");
                menuToggle.setAttribute("aria-expanded", "false");
            });
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && navLinks.classList.contains("open")) {
                menuToggle.classList.remove("open");
                navLinks.classList.remove("open");
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.focus();
            }
        });
    }

    // Carousels
    initCarousels();

    // Filter projects
    const filterBtns = document.querySelectorAll(".filter-btn");
    const cards = document.querySelectorAll(".project-card");
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => {
                b.classList.remove("active");
                b.setAttribute("aria-pressed", "false");
            });
            btn.classList.add("active");
            btn.setAttribute("aria-pressed", "true");
            const filter = btn.dataset.filter;
            cards.forEach(card => {
                if (filter === "all" || (card.dataset.categories && card.dataset.categories.includes(filter))) {
                    card.classList.remove("hidden");
                } else {
                    card.classList.add("hidden");
                }
            });
        });
    });
});

// ==================== LOAD ====================
window.addEventListener("load", () => {
    centerGlow();
    setTimeout(centerGlow, 100);
    setTimeout(() => {
        centerGlow();
        if (glow) glow.classList.add("show");
    }, 400);
});
window.addEventListener("resize", centerGlow, { passive: true });
