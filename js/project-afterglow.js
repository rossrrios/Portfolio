(function () {
    'use strict';

    /* ------------------------------------------
       Instagram Stories Autoplay
       ------------------------------------------ */

    const storiesContainer = document.getElementById('storiesContainer');
    const progressBars = document.querySelectorAll('.stories-progress-bar');
    const tapLeft = document.getElementById('storyTapLeft');
    const tapRight = document.getElementById('storyTapRight');
    const navHint = document.getElementById('storiesNavHint');

    if (!storiesContainer || progressBars.length === 0) return;

    const slides = storiesContainer.querySelectorAll('.story-slide');
    const totalStories = slides.length;
    let currentStory = 0;
    let storyTimer = null;
    const STORY_DURATION = 4500;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let hintHidden = false;

    function resetProgressBars() {
        progressBars.forEach(function (bar) {
            bar.classList.remove('filled', 'active');
            bar.style.animation = 'none';
            void bar.offsetWidth;
            bar.style.animation = '';
        });
    }

    function showStory(index) {
        if (index < 0) index = totalStories - 1;
        if (index >= totalStories) index = 0;

        slides.forEach(function (s) { s.classList.remove('active'); });
        slides[index].classList.add('active');

        resetProgressBars();

        for (let i = 0; i < index; i++) {
            progressBars[i].classList.add('filled');
        }

        if (progressBars[index]) {
            progressBars[index].classList.add('active');
        }

        currentStory = index;
        startStoryTimer();
    }

    function startStoryTimer() {
        clearTimeout(storyTimer);
        if (!prefersReducedMotion) {
            storyTimer = setTimeout(function () {
                showStory(currentStory + 1);
            }, STORY_DURATION);
        }
    }

    function hideNavHint() {
        if (!hintHidden && navHint) {
            navHint.classList.add('hidden');
            hintHidden = true;
        }
    }

    if (tapRight) {
        tapRight.addEventListener('click', function () {
            clearTimeout(storyTimer);
            hideNavHint();
            showStory(currentStory + 1);
        });
    }

    if (tapLeft) {
        tapLeft.addEventListener('click', function () {
            clearTimeout(storyTimer);
            hideNavHint();
            showStory(currentStory - 1);
        });
    }

    /* Pause on hover */
    const phone = storiesContainer.closest('.phone-mockup');
    if (phone) {
        phone.addEventListener('mouseenter', function () {
            clearTimeout(storyTimer);
        });
        phone.addEventListener('mouseleave', function () {
            startStoryTimer();
        });
    }

    /* Auto-hide nav hint */
    setTimeout(function () {
        hideNavHint();
    }, 6000);

    showStory(0);

})();
