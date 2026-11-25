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
        : `mailto:info@exothink.biz?subject=${encodeURIComponent('Contacto desde exothink.biz')}&body=${encodeURIComponent(msg)}`;
      window.open(url, via === 'wa' ? '_blank' : '_self');
      form.classList.add('sent');
    };
    form.addEventListener('submit', e => { e.preventDefault(); send('mail'); });
    const waBtn = form.querySelector('[data-wa]');
    if (waBtn) waBtn.addEventListener('click', () => send('wa'));
  }

  // Año en el footer
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
