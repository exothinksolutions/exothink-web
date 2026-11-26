// EXOTHINK · interacciones del sitio (solo front end)
(function () {
  const body = document.body;
  const hdr = document.querySelector('.hdr');

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

  // Animaciones de entrada
  const els = document.querySelectorAll('.rv, .step');
  if ('IntersectionObserver' in window) {
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
  if ('IntersectionObserver' in window) {
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
  if (reduce) {
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
