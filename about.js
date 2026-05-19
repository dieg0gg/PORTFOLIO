const lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// ─── FADE OUT antes de navegar ─────────────────────────────────────────────
function navigateFade(href) {
    document.body.style.transition = 'opacity 0.4s ease';
    document.body.style.opacity = '0';
    setTimeout(() => window.location.href = href, 400);
}

document.getElementById('back-btn').addEventListener('click', e => {
    e.preventDefault();
    navigateFade('index.html');
});

document.getElementById('view-projects-btn').addEventListener('click', e => {
    e.preventDefault();
    navigateFade('index.html?view=projects');
});

