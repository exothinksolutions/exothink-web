// EXOTHINK · interacciones del sitio (solo front end)
(function () {
  const body = document.body;
  const hdr = document.querySelector('.hdr');
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // GSAP + ScrollTrigger (assets/vendor). Si no cargan, se usa la versión simple de abajo.
  const G = !!(window.gsap && window.ScrollTrigger) && !REDUCE;
  if (G) { gsap.registerPlugin(ScrollTrigger); document.documentElement.classList.add('gsap'); }

  // Header sólido al hacer scroll
  const onScroll = () => hdr && hdr.classList.toggle('solid', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Menú móvil
  const burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', () => {
      const open = body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open);
    });
    document.querySelectorAll('.nav a').forEach(a =>
      a.addEventListener('click', () => body.classList.remove('menu-open')));
  }

  // Botón volver arriba: aparece al bajar y muestra el avance de lectura
  const top = document.querySelector('.totop');
  if (top) {
    const upd = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      top.classList.toggle('show', scrollY > 500);
      top.style.setProperty('--sp', max > 0 ? Math.min(scrollY / max, 1).toFixed(3) : 0);
    };
    upd();
    window.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    top.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: REDUCE ? 'auto' : 'smooth' });
      const b = document.querySelector('.brand'); if (b) b.focus({ preventScroll: true });
    });
  }

  // Menú desplegable de Productos
  document.querySelectorAll('.dd').forEach(dd => {
    const t = dd.querySelector('.dd-t');
    const set = open => { dd.classList.toggle('open', open); t.setAttribute('aria-expanded', open); };
    t.addEventListener('click', e => { e.stopPropagation(); set(!dd.classList.contains('open')); });
    dd.querySelectorAll('.dd-m a').forEach(a => a.addEventListener('click', () => set(false)));
    document.addEventListener('click', e => { if (!dd.contains(e.target)) set(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && dd.classList.contains('open')) { set(false); t.focus(); } });
  });

  // Animaciones de entrada
  const els = document.querySelectorAll('.rv, .step');
  if (G) {
    /* GSAP se encarga (ver más abajo) */
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
  } else {
    els.forEach(el => el.classList.add('in'));
  }

  // Contadores
  const counters = document.querySelectorAll('[data-count]');
  const run = el => {
    const end = parseFloat(el.dataset.count), t0 = performance.now(), dur = 1600;
    const tick = t => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (!G && 'IntersectionObserver' in window) {
    const co = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { run(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(c => co.observe(c));
  }

  // Logo animado: Safari no reproduce WebM con transparencia → usar SVG
  const v = document.querySelector('.hero-logo video');
  if (v) {
    const canWebm = v.canPlayType('video/webm; codecs="vp9"') || v.canPlayType('video/webm');
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (!canWebm || isSafari) {
      const img = document.createElement('img');
      img.src = v.getAttribute('poster'); img.alt = 'Exothink';
      v.replaceWith(img);
    }
  }

  // Formulario de contacto: sin backend, abre WhatsApp o correo con el mensaje armado
  const form = document.querySelector('#form-contacto');
  if (form) {
    const build = () => {
      const d = new FormData(form);
      return `Hola Exothink, soy ${d.get('nombre') || ''}` +
        (d.get('empresa') ? ` de ${d.get('empresa')}` : '') + '.\n' +
        (d.get('interes') ? `Me interesa: ${d.get('interes')}.\n` : '') +
        (d.get('mensaje') ? `${d.get('mensaje')}\n` : '') +
        (d.get('email') ? `Correo: ${d.get('email')}` : '') +
        (d.get('telefono') ? ` · Tel: ${d.get('telefono')}` : '');
    };
    const send = via => {
      if (!form.reportValidity()) return;
      const msg = build();
      const url = via === 'wa'
        ? `https://wa.me/593968545503?text=${encodeURIComponent(msg)}`
        : `mailto:info@exothink.tech?subject=${encodeURIComponent('Contacto desde exothink.tech')}&body=${encodeURIComponent(msg)}`;
      window.open(url, via === 'wa' ? '_blank' : '_self');
      form.classList.add('sent');
    };
    form.addEventListener('submit', e => { e.preventDefault(); send('mail'); });
    const waBtn = form.querySelector('[data-wa]');
    if (waBtn) waBtn.addEventListener('click', () => send('wa'));
  }


  // ---------- Animaciones ligadas al scroll ----------
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Divide un texto en palabras conservando <b>, <em>, etc.
  const splitWords = el => {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const sp = document.createElement('span'); sp.className = 'w'; sp.textContent = part; frag.appendChild(sp);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    return [...el.querySelectorAll('.w')];
  };
  const reveals = [...document.querySelectorAll('[data-reveal]')].map(el => ({ el, words: splitWords(el) }));
  const scrollers = [...document.querySelectorAll('[data-scroll]')];
  const timelines = [...document.querySelectorAll('[data-timeline]')];

  const clamp = v => Math.max(0, Math.min(1, v));
  const update = () => {
    const vh = window.innerHeight;
    // Progreso de cada sección: 0 cuando entra por abajo, 1 cuando sale por arriba
    scrollers.forEach(el => {
      const r = el.getBoundingClientRect();
      let p;
      if (el.classList.contains('bigmark')) p = clamp(-r.top / (r.height - vh));
      else if (el.hasAttribute('data-timeline')) p = clamp((vh * 0.6 - r.top) / r.height);
      else p = clamp((vh - r.top) / (r.height + vh));
      el.style.setProperty('--p', p.toFixed(4));
    });
    // Palabras que se encienden según el scroll
    reveals.forEach(({ el, words }) => {
      const r = el.getBoundingClientRect();
      const p = clamp((vh * 0.85 - r.top) / (vh * 0.55 + r.height * 0.5));
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < n));
    });
    // Pasos de la línea de tiempo
    timelines.forEach(tl => {
      tl.querySelectorAll('.tl-item').forEach(it => {
        const r = it.getBoundingClientRect();
        it.classList.toggle('on', r.top + 26 < vh * 0.6);
      });
    });
  };
  if (G) {
    const EASE = 'power3.out';

    // Entrada del hero (inicio y páginas internas)
    const heroBits = document.querySelectorAll('.hero .rv, .phero .rv');
    if (heroBits.length) gsap.fromTo(heroBits, { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.12, ease: EASE, delay: 0.15 });
    // clearProps: un transform en .hdr rompería el menú móvil (position:fixed)
    gsap.from('.hdr', { y: -30, opacity: 0, duration: 0.9, ease: EASE, clearProps: 'transform,opacity' });

    // Aparición escalonada del resto de elementos
    const rest = gsap.utils.toArray('.rv').filter(el => !el.closest('.hero, .phero'));
    gsap.set(rest, { opacity: 0, y: 44 });
    ScrollTrigger.batch(rest, {
      start: 'top 88%', once: true,
      onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 0.95, stagger: 0.1, ease: EASE, overwrite: true })
    });

    // Parallax en fondos e imágenes
    gsap.utils.toArray('.hero-bg, .phero .bg').forEach(bg => gsap.to(bg, {
      yPercent: 18, ease: 'none', scrollTrigger: { trigger: bg.parentElement, start: 'top top', end: 'bottom top', scrub: true }
    }));
    gsap.utils.toArray('.media img, .prod .pbg, .maplink img').forEach(img => gsap.fromTo(img,
      { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
    gsap.utils.toArray('.cta .bg').forEach(bg => gsap.fromTo(bg, { yPercent: -12 }, { yPercent: 12, ease: 'none',
      scrollTrigger: { trigger: bg.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));

    // Texto que se ilumina palabra por palabra
    reveals.forEach(({ el, words }) => gsap.to(words, {
      opacity: 1, ease: 'none', stagger: 0.08,
      scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 42%', scrub: 0.6 }
    }));

    // Palabra gigante de fondo y logotipo con imagen
    gsap.utils.toArray('.manifesto, .claim').forEach(sec => gsap.fromTo(sec, { '--p': 0 }, { '--p': 1, ease: 'none',
      scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: 1 } }));
    gsap.utils.toArray('.bigmark').forEach(sec => gsap.fromTo(sec, { '--p': 0 }, { '--p': 1, ease: 'none',
      scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 0.8 } }));

    // Línea de tiempo
    timelines.forEach(tl => {
      gsap.fromTo(tl, { '--p': 0 }, { '--p': 1, ease: 'none',
        scrollTrigger: { trigger: tl, start: 'top 60%', end: 'bottom 60%', scrub: 0.5 } });
      tl.querySelectorAll('.tl-item').forEach(it => ScrollTrigger.create({
        trigger: it, start: 'top 60%',
        onEnter: () => it.classList.add('on'), onLeaveBack: () => it.classList.remove('on')
      }));
    });

    // Contadores
    document.querySelectorAll('[data-count]').forEach(el => {
      const end = parseFloat(el.dataset.count);
      const obj = { v: 0 };
      el.textContent = '0';
      gsap.to(obj, { v: end, duration: 1.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => { el.textContent = Math.round(obj.v); } });
    });

    // Tarjetas: ligera inclinación al pasar el mouse (solo escritorio)
    if (window.matchMedia('(hover: hover)').matches) {
      document.querySelectorAll('.card, .mq-card').forEach(c => {
        c.addEventListener('mousemove', e => {
          const r = c.getBoundingClientRect();
          gsap.to(c, { rotateX: ((e.clientY - r.top) / r.height - .5) * -6, rotateY: ((e.clientX - r.left) / r.width - .5) * 6, transformPerspective: 800, duration: .4, ease: 'power2.out' });
        });
        c.addEventListener('mouseleave', () => gsap.to(c, { rotateX: 0, rotateY: 0, duration: .6, ease: 'power3.out' }));
      });
    }

    // Enlaces con ancla (p. ej. soluciones.html#exotalk): recolocar tras cargar imágenes y fuentes
    const goHash = () => {
      const target = location.hash && document.querySelector(location.hash);
      if (target) {
        // Ignora el desplazamiento temporal de la animación de entrada (y) al calcular la posición
        const y = target.getBoundingClientRect().top + scrollY - (parseFloat(gsap.getProperty(target, 'y')) || 0);
        window.scrollTo(0, y - (parseFloat(getComputedStyle(target).scrollMarginTop) || 0));
      }
    };
    window.addEventListener('load', () => { ScrollTrigger.refresh(); goHash(); });
    window.addEventListener('hashchange', goHash);
  } else if (reduce) {
    reveals.forEach(({ words }) => words.forEach(w => w.classList.add('on')));
    timelines.forEach(tl => tl.querySelectorAll('.tl-item').forEach(it => it.classList.add('on')));
  } else {
    let ticking = false;
    const onFrame = () => { ticking = false; update(); };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(onFrame); } };
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    update();
  }

  // Año en el footer
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
