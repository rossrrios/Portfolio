// ==================== THEME SYNC ====================
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    document.documentElement.classList.add("dark-mode");
}

const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const html = document.documentElement;
        html.classList.toggle("dark-mode");
        localStorage.setItem("theme", html.classList.contains("dark-mode") ? "dark" : "light");
    });
}

// ==================== LANGUAGE SYNC ====================
let currentLanguage = localStorage.getItem("language") || "es";

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
    document.documentElement.lang = lang;
    const titleEl = document.querySelector("title");
    if (titleEl) {
        titleEl.textContent = lang === "en" ? titleEl.dataset.en : titleEl.dataset.es;
    }
}

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

/* Prevent placeholder links from navigating */
document.addEventListener("click", (e) => {
    const btn = e.target.closest("a[href='#']");
    if (btn) e.preventDefault();
});

// ==================== INSTAGRAM LIGHTBOX ====================
(function () {
    'use strict';

    const feedItems = document.querySelectorAll('.ig-feed-item');
    if (feedItems.length === 0) return;

    // Create lightbox element
    const lightbox = document.createElement('div');
    lightbox.className = 'ig-lightbox';
    lightbox.innerHTML = `
        <button type="button" class="ig-lightbox-close" aria-label="Close preview">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <button type="button" class="ig-lightbox-nav ig-lightbox-prev" aria-label="Previous image">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <img class="ig-lightbox-img" src="" alt="Preview">
        <button type="button" class="ig-lightbox-nav ig-lightbox-next" aria-label="Next image">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('.ig-lightbox-img');
    const closeBtn = lightbox.querySelector('.ig-lightbox-close');
    const prevBtn = lightbox.querySelector('.ig-lightbox-prev');
    const nextBtn = lightbox.querySelector('.ig-lightbox-next');

    let currentIndex = 0;
    const images = Array.from(feedItems).map(item => item.dataset.lightbox);

    function openLightbox(index) {
        currentIndex = index;
        lightboxImg.src = images[currentIndex];
        lightboxImg.alt = feedItems[currentIndex].querySelector('img').alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function navigate(direction) {
        currentIndex = (currentIndex + direction + images.length) % images.length;
        lightboxImg.src = images[currentIndex];
        lightboxImg.alt = feedItems[currentIndex].querySelector('img').alt;
    }

    feedItems.forEach((item, index) => {
        item.addEventListener('click', () => openLightbox(index));
    });

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', () => navigate(-1));
    nextBtn.addEventListener('click', () => navigate(1));

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigate(-1);
        if (e.key === 'ArrowRight') navigate(1);
    });
})();
