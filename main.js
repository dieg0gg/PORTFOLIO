const title         = document.querySelector('.main-title');
const exploreBtn    = document.querySelector('#explore-btn');
const aboutBtn      = document.querySelector('#about-btn');
const welcomeScreen = document.querySelector('#welcome-screen');
const mainPortfolio = document.querySelector('#main-portfolio');

// ─── no iniciar xra responsive movil ────────────────────────────────────────────────────────────────────
const isMobile = () => window.innerWidth < 768;


// ─── LENIS SCROLL FLUIDO ────────────────────────────────────────────────────────────
const lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
});
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
lenis.stop();

// ─── ANIMACION NOMBRE K ESTIRA ─────────────────────────────────────────────────────────────
if (title) {
    title.addEventListener('mouseenter', () => {
        gsap.to(title, { scaleY: 8.2, duration: 0.6, ease: 'expo.out' });
        gsap.to(['.subtitle', '.btn-group'], { opacity: 0, duration: 0.4, ease: 'power2.out' });
    });
    title.addEventListener('mouseleave', () => {
        gsap.to(title, { scaleY: 4.2, duration: 0.6, ease: 'expo.out' });
        gsap.to(['.subtitle', '.btn-group'], { opacity: 1, duration: 0.4, ease: 'power2.out' });
    });
}

// ─── XRA JSON ──────────────────────────────────────────────────────────────
async function fetchProyectos() {
    const res = await fetch('proyectos.json');
    return await res.json();
}

// ─── PINTAR GRID JSON ──────────────────────────────────────────────────────────────
function renderGrid(proyectos) {
    const grid = document.querySelector('#proyectos-grid');
    if (!grid) return;

    grid.innerHTML = proyectos.map(p => `
        <div class="proyecto-card" data-id="${p.id}">
            <p class="proyecto-title">${p.title}</p>
            <div class="proyecto-thumb">
                <img src="${p.image}" alt="${p.title}" />
            </div>
            <div class="proyecto-cats">
                ${p.categories.map(c => `<span>${c}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

// ─── ANIMACION RARA CARRUSELLLLL ─────────────────────────────────────────────────────────────────
const POSITIONS = ['far-left', 'mid-left', 'center', 'near-right', 'mid-right', 'far-right'];

function renderCarrusel(proyectos) {
    const items = document.querySelectorAll('.carrusel-item');
    if (!items.length) return;

    // asignar imagen a cada cccuadro
    items.forEach((item, i) => {
        const p = proyectos[i % proyectos.length];
        item.style.backgroundImage = `url('${p.image}')`;
        item.style.backgroundSize = 'cover';
        item.style.backgroundPosition = 'center';
        item.dataset.index = i;
    });
}

function iniciarCarrusel(proyectos) {
    const items = Array.from(document.querySelectorAll('.carrusel-item'));
    if (!items.length) return;

    let delayedCall;
    // "cola" xra q entre cada proyecto y q los primeros ya salgan cargados
    let nextIn = items.length; 

    const defaults = {
        'far-left':   { blur: 30, opacity: 1, xPercent: 0, yPercent: 0, width: 330, height: 170 },
        'mid-left':   { blur: 10,  opacity: 1, xPercent: 0, yPercent: 0, width: 350, height: 190 },
        'center':     { blur: 0,  opacity: 1,    xPercent: 0, yPercent: 0, width: 420, height: 240 },
        'near-right': { blur: 10,  opacity: 1, xPercent: 0, yPercent: 0, width: 380, height: 200 },
        'mid-right':  { blur: 30,  opacity: 1, xPercent: 0, yPercent: 0, width: 350, height: 190 },
        'far-right':  { blur: 50, opacity: 1, xPercent: 0, yPercent: 0, width: 330, height: 170 }
    };

    const coords = {
        'far-left':   { top: '6%',  left: '9%' },
        'mid-left':   { top: '15%', left: '22%' },
        'center':     { top: '23%', left: '35%' },
        'near-right': { top: '37%', left: '50%' },
        'mid-right':  { top: '45%', left: '68%' },
        'far-right':  { top: '54%', left: '86%' }
    };

    let slots = [...items];

    // GSAP para q empiecen en su sitio 
    items.forEach((item, i) => {
        const pos = POSITIONS[i];
        const d   = defaults[pos];
        const c   = coords[pos];
        gsap.set(item, {
            top: c.top, left: c.left,
            xPercent: d.xPercent, yPercent: d.yPercent,
            opacity: d.opacity, filter: `blur(${d.blur}px)`
        });
    });

    function getPosClass(item) {
        return POSITIONS.find(p => item.classList.contains(p)) || 'center';
    }

    function avanzar() {
        const exitItem = slots[slots.length - 1];

        for (let i = slots.length - 1; i > 0; i--) slots[i] = slots[i - 1];
        slots[0] = exitItem;

        // Deberia salir el siguiente que este metido en json aunq no se vea en el carrusel
        const proj = proyectos[nextIn % proyectos.length];
        nextIn++;

        gsap.killTweensOf(exitItem);
        exitItem.style.backgroundImage = `url('${proj.image}')`;
        exitItem.className = 'carrusel-item far-left';
        const d0 = defaults['far-left'];

        gsap.set(exitItem, {
            top: coords['far-left'].top, left: '-12%',
            xPercent: 0, yPercent: 0, opacity: 0,
            filter: `blur(${d0.blur}px)`
        });

        // Animar todos los cuadros al siguiente sitio
        slots.forEach((item, slotIdx) => {
            const pos = POSITIONS[slotIdx];
            const d   = defaults[pos];
            const c   = coords[pos];
            item.className = 'carrusel-item ' + pos;
            gsap.to(item, {
                top: c.top, left: c.left,
                xPercent: d.xPercent, yPercent: d.yPercent,
                opacity: d.opacity, filter: `blur(${d.blur}px)`,
                duration: 0.8, ease: 'power2.inOut'
            });
        });
    }

    function loop() {
        avanzar();
        delayedCall = gsap.delayedCall(2.5, loop);
    }

    const centerIdx = POSITIONS.indexOf('center');
    items.forEach(item => {
        item.addEventListener('mouseenter', () => {
            if (slots[centerIdx] !== item) return;
            if (delayedCall) delayedCall.kill();
            gsap.to(item, { scale: 2.06, duration: 0.4, ease: 'power2.out' });
        });
        item.addEventListener('mouseleave', () => {
            if (slots[centerIdx] !== item) return;
            gsap.to(item, { scale: 1, duration: 0.4, ease: 'power2.out' });
            delayedCall = gsap.delayedCall(2.5, loop);
        });
    });

    delayedCall = gsap.delayedCall(2.5, loop);
}

// ─── MONTAR PARTE D PROYECTOS CON JSON ──────────────────────────────────────────────────
let yaInicializado = false;

async function montarProyectos() {
    const proyectos = await fetchProyectos();

    renderGrid(proyectos);
    if (!isMobile() && !yaInicializado) {
        renderCarrusel(proyectos);
        iniciarCarrusel(proyectos);
        yaInicializado = true;
    }
}

// ─── BOTONES DEL PORTFOLIO NAV ────────────────────────────────────────────
document.querySelector('#back-btn').addEventListener('click', volverAlWelcome);

document.querySelector('#about-btn-portfolio').addEventListener('click', () => {
    document.body.style.transition = 'opacity 0.4s ease';
    document.body.style.opacity = '0';
    setTimeout(() => window.location.href = 'about.html', 400);
});

// ─── TRANSICIÓN WELCOME A PORTFOLIO ──────────────────────────────────────────
exploreBtn.addEventListener('click', () => {
    gsap.set('body', { overflowY: 'hidden' });

    const tl = gsap.timeline({
        onStart:    () => window.scrollTo(0, 0),
        onComplete: () => lenis.start()
    });

    tl
    .to([exploreBtn, aboutBtn, '.subtitle'], {
        duration: 0.45, opacity: 0, y: -20,
        stagger: 0.08,  ease: 'power2.in'
    })
    .to(title, {
        duration: 1.1, scaleY: 60, ease: 'expo.inOut'
    }, '-=0.25')
    .to(welcomeScreen, {
        duration: 0.3, autoAlpha: 0, ease: 'none'
    }, '-=0.15')
    .set(mainPortfolio, { display: 'block' })
    .add(() => montarProyectos())
    .to(mainPortfolio, { duration: 0.15, autoAlpha: 1 });
});

// ─── BOTON D VOLVER AL WELCOME ────────────────────────────────────────────────────────
function volverAlWelcome() {
    lenis.stop();
    lenis.scrollTo(0, { immediate: true });

    const tl = gsap.timeline();

    tl
    .to(mainPortfolio, { duration: 0.8, autoAlpha: 0, ease: 'none' })
    .set(mainPortfolio, { display: 'none' })
    .set(welcomeScreen, { autoAlpha: 1 })
    .set(title, { scaleY: 4.2 })
    .to([exploreBtn, aboutBtn, '.subtitle'], {
        duration: 0.8, opacity: 1, y: 0,
        stagger: 0.08, ease: 'power2.out'
    });
}

// ─── BOTON D GET TO KNOW ME ─────────────────────────────────────────────────
aboutBtn.addEventListener('click', () => {
    gsap.set('body', { overflowY: 'hidden' });

    const tl = gsap.timeline({ onComplete: () => window.location.href = 'about.html' });

    tl
    .to([exploreBtn, aboutBtn, '.subtitle'], {
        duration: 0.45, opacity: 0, y: -20,
        stagger: 0.08, ease: 'power2.in'
    })
    .to(title, {
        duration: 1.1, scaleY: 60, ease: 'expo.inOut'
    }, '-=0.25')
    .to(welcomeScreen, {
        duration: 0.3, autoAlpha: 0, ease: 'none'
    }, '-=0.15');
});

// ─── xra q al entrar desde get to know me se salte el landing ─────────────────────────────────────────────
if (new URLSearchParams(window.location.search).get('view') === 'projects') {
    gsap.set(welcomeScreen, { autoAlpha: 0 });
    gsap.set(mainPortfolio, { display: 'block' });
    montarProyectos().then(() => gsap.set(mainPortfolio, { autoAlpha: 1 }));
    lenis.start();
}