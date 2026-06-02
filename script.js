/* =========================================================
   MADRI PERFUMARIA — script.js
   JS puro, sem dependências.
   ========================================================= */
(() => {
  'use strict';

  /* ====== CONFIGURAÇÃO — edite aqui ======
     Troque pelo número real (formato internacional, só dígitos)
     e pelo @ do Instagram da MADRI. */
  const CONFIG = {
    whatsapp: '5599999999999',                 // ex.: 55 + DDD + número
    waMessage: 'Olá! Vim pela MADRI Perfumaria e gostaria de uma indicação personalizada.',
    instagram: 'https://instagram.com/madriperfumaria'
  };

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ====== Links de WhatsApp / Instagram ====== */
  function wireLinks() {
    const wa = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.waMessage)}`;
    $$('[data-wa]').forEach(el => {
      el.setAttribute('href', wa);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener');
    });
    $$('[data-ig]').forEach(el => {
      el.setAttribute('href', CONFIG.instagram);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener');
    });
  }

  /* ====== Ano no rodapé ====== */
  function setYear() {
    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ====== Header muda ao rolar ====== */
  function headerScroll() {
    const header = $('#header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ====== Menu mobile ====== */
  function mobileNav() {
    const toggle = $('#navToggle');
    const menu = $('#mobileNav');
    if (!toggle || !menu) return;

    const setState = open => {
      toggle.classList.toggle('open', open);
      menu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-hidden', String(!open));
      document.body.style.overflow = open ? 'hidden' : '';
    };

    toggle.addEventListener('click', () => setState(!menu.classList.contains('open')));
    $$('.mobile-nav__link, .mobile-nav__cta', menu).forEach(a =>
      a.addEventListener('click', () => setState(false))
    );
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.classList.contains('open')) setState(false);
    });
  }

  /* ====== Scroll reveal (com stagger por grupo) ====== */
  function scrollReveal() {
    const items = $$('.reveal');
    if (prefersReduced || !('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('in-view'));
      return;
    }
    // Stagger: filhos diretos de um .grid recebem atraso incremental
    $$('.grid').forEach(grid => {
      $$(':scope > .reveal', grid).forEach((el, i) =>
        el.style.setProperty('--d', `${i * 0.09}s`)
      );
    });
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in-view'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    items.forEach(el => io.observe(el));
  }

  /* ====== Brilho que segue o cursor + glow nos cards ====== */
  function cursorGlow() {
    if (!isFinePointer || prefersReduced) return;
    const glow = $('.cursor-glow');
    let raf = null, x = 0, y = 0;
    window.addEventListener('mousemove', e => {
      x = e.clientX; y = e.clientY;
      if (glow) glow.style.opacity = '1';
      if (!raf) raf = requestAnimationFrame(() => {
        if (glow) glow.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        raf = null;
      });
    }, { passive: true });
    document.addEventListener('mouseleave', () => { if (glow) glow.style.opacity = '0'; });

    // Luz interna seguindo o mouse dentro de cada card
    $$('.card').forEach(card => {
      const g = $('.card__glow', card);
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        if (g) {
          g.style.setProperty('--mx', `${e.clientX - r.left}px`);
          g.style.setProperty('--my', `${e.clientY - r.top}px`);
        }
      });
    });
  }

  /* ====== Parallax leve ====== */
  function parallax() {
    if (prefersReduced) return;
    const els = $$('[data-parallax]');
    if (!els.length) return;
    let raf = null;
    const update = () => {
      const vh = window.innerHeight;
      els.forEach(el => {
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const off = (center - vh / 2) * -parseFloat(el.dataset.parallax || '0.1');
        el.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0)`;
      });
      raf = null;
    };
    window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    update();
  }

  /* ====== Partículas douradas no hero (canvas) ====== */
  function particles() {
    const canvas = $('#particles');
    if (!canvas || prefersReduced) return;
    const ctx = canvas.getContext('2d');
    let w, h, parts = [], raf;
    const COUNT = Math.min(46, Math.floor(window.innerWidth / 28));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = canvas.offsetWidth * dpr;
      h = canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const rnd = (a, b) => a + Math.random() * (b - a);
    const make = () => ({
      x: rnd(0, canvas.offsetWidth), y: rnd(0, canvas.offsetHeight),
      r: rnd(0.6, 2.1), s: rnd(0.12, 0.5), a: rnd(0.15, 0.7),
      tw: rnd(0.004, 0.02), dir: Math.random() < 0.5 ? 1 : -1, drift: rnd(0.05, 0.25)
    });

    const init = () => { resize(); parts = Array.from({ length: COUNT }, make); };

    const tick = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      parts.forEach(p => {
        p.y -= p.s;
        p.x += Math.sin(p.y * 0.01) * p.drift * p.dir;
        p.a += p.tw * p.dir;
        if (p.a > 0.75 || p.a < 0.12) p.dir *= -1;
        if (p.y < -6) { p.y = canvas.offsetHeight + 6; p.x = rnd(0, canvas.offsetWidth); }
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        grd.addColorStop(0, `rgba(244,227,161,${p.a})`);
        grd.addColorStop(1, 'rgba(214,180,93,0)');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2); ctx.fill();
      });
      raf = requestAnimationFrame(tick);
    };

    init();
    tick();
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(init, 200); });
    // Pausa fora da viewport (economia)
    new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting) { if (!raf) tick(); }
        else { cancelAnimationFrame(raf); raf = null; }
      });
    }, { threshold: 0 }).observe(canvas);
  }

  /* ====== Constelação de fragrâncias ====== */
  function constellation() {
    const wrap = $('#constellation');
    if (!wrap) return;
    const core = $('#famCore');
    const titleEl = $('.core__title', core);
    const textEl = $('.core__text', core);
    const lines = $$('.constellation__lines line');
    const fams = $$('.fam', wrap);

    const activate = (fam, i) => {
      wrap.classList.add('active');
      titleEl.textContent = fam.dataset.title;
      textEl.textContent = fam.dataset.text;
      lines.forEach((l, j) => l.style.opacity = j === i ? '1' : '0.18');
      if (lines[i]) lines[i].style.strokeWidth = '1.6';
    };
    const reset = () => {
      wrap.classList.remove('active');
      lines.forEach(l => { l.style.opacity = ''; l.style.strokeWidth = ''; });
    };

    fams.forEach((fam, i) => {
      fam.addEventListener('mouseenter', () => activate(fam, i));
      fam.addEventListener('focus', () => activate(fam, i));
      fam.addEventListener('mouseleave', reset);
      fam.addEventListener('blur', reset);
    });
  }

  /* ====== Pirâmide olfativa (sincroniza nível ↔ segmento) ====== */
  function pyramid() {
    const segs = $$('.pyr-seg');
    const levels = $$('.level');
    if (!segs.length) return;
    const link = (level, on) => {
      segs.forEach(s => s.classList.toggle('lit', on && s.dataset.level === level));
      levels.forEach(l => l.style.borderLeftColor =
        (on && l.dataset.level === level) ? 'var(--gold)' : '');
    };
    levels.forEach(l => {
      l.addEventListener('mouseenter', () => link(l.dataset.level, true));
      l.addEventListener('mouseleave', () => link(l.dataset.level, false));
    });
    segs.forEach(s => {
      s.addEventListener('mouseenter', () => link(s.dataset.level, true));
      s.addEventListener('mouseleave', () => link(s.dataset.level, false));
    });
    // Acende em sequência ao entrar na viewport
    const pyr = $('#pyramid');
    if (pyr && !prefersReduced && 'IntersectionObserver' in window) {
      new IntersectionObserver((es, obs) => {
        es.forEach(e => {
          if (!e.isIntersecting) return;
          ['top', 'heart', 'base'].forEach((lv, i) => {
            setTimeout(() => {
              const s = segs.find(x => x.dataset.level === lv);
              if (s) { s.classList.add('lit'); setTimeout(() => s.classList.remove('lit'), 700); }
            }, i * 320);
          });
          obs.disconnect();
        });
      }, { threshold: 0.5 }).observe(pyr);
    }
  }

  /* ====== Init ====== */
  const init = () => {
    wireLinks();
    setYear();
    headerScroll();
    mobileNav();
    scrollReveal();
    cursorGlow();
    parallax();
    particles();
    constellation();
    pyramid();
  };

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init);
  else init();
})();
