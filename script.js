(() => {
  'use strict';

  const cursor     = document.createElement('div');
  const cursorRing = document.createElement('div');
  cursor.className     = 'cursor';
  cursorRing.className = 'cursor-ring';
  document.body.append(cursor, cursorRing);

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  const animateCursor = () => {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(animateCursor);
  };
  animateCursor();

  document.querySelectorAll('a, button, .nav-cta, .indicator').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hover');
      cursorRing.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hover');
      cursorRing.classList.remove('hover');
    });
  });

  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  document.body.prepend(progressBar);

  const sections = [
    { id: 'hero',      label: 'Top' },
    { id: 'mountains', label: 'Mountains' },
    { id: 'ocean',     label: 'Ocean' },
    { id: 'forest',    label: 'Forest' },
    { id: 'desert',    label: 'Desert' },
    { id: 'city',      label: 'City' },
    { id: 'aurora',    label: 'Aurora' },
  ];

  const indicatorContainer = document.createElement('nav');
  indicatorContainer.className = 'section-indicators';

  const indicators = sections.map(({ id, label }) => {
    const dot = document.createElement('div');
    dot.className = 'indicator';
    dot.setAttribute('title', label);
    dot.setAttribute('aria-label', `Go to ${label}`);
    dot.addEventListener('click', () => smoothScrollTo(id));
    indicatorContainer.appendChild(dot);
    return { el: dot, id };
  });

  document.body.appendChild(indicatorContainer);

  function smoothScrollTo(targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;

    const startY    = window.scrollY;
    const endY      = target.getBoundingClientRect().top + startY;
    const distance  = endY - startY;
    const duration  = Math.min(1200, Math.max(500, Math.abs(distance) * 0.4));
    let   startTime = null;

    const easeInOutQuart = t =>
      t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

    const step = timestamp => {
      if (!startTime) startTime = timestamp;
      const elapsed  = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY + distance * easeInOutQuart(progress));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }

  const parallaxLayers = [
    { selector: '#hero-bg',      speed: 0.45 },
    { selector: '.mountains-bg', speed: 0.40 },
    { selector: '.ocean-bg',     speed: 0.38 },
    { selector: '.forest-bg',    speed: 0.42 },
    { selector: '.desert-bg',    speed: 0.35 },
    { selector: '.city-bg',      speed: 0.40 },
    { selector: '.aurora-bg',    speed: 0.36 },
  ];

  const resolvedLayers = parallaxLayers
    .map(({ selector, speed }) => ({
      el: document.querySelector(selector),
      speed,
    }))
    .filter(l => l.el);

  const revealTargets = [
    '.section-content .section-number',
    '.section-content .section-title',
    '.section-content .section-text',
    '.section-content .section-detail',
    '.content-inner .section-tag',
    '.content-inner h2',
    '.content-inner p',
  ];

  revealTargets.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      if (i % 3 === 1) el.classList.add('reveal-delay-1');
      if (i % 3 === 2) el.classList.add('reveal-delay-2');
    });
  });

  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  const update = () => {
    ticking = false;
    const scrollY = window.scrollY;
    const docH    = document.documentElement.scrollHeight - window.innerHeight;

    progressBar.style.width = (scrollY / docH * 100) + '%';

    const nav = document.querySelector('.nav');
    if (scrollY > 80) nav.classList.add('scrolled');
    else              nav.classList.remove('scrolled');

    resolvedLayers.forEach(({ el, speed }) => {
      const parent = el.parentElement;
      const rect   = parent.getBoundingClientRect();
      const relY   = rect.top + scrollY;
      const offset = (scrollY - relY) * speed;
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    });

    document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.88) {
        el.classList.add('visible');
      }
    });

    let activeIdx = 0;
    indicators.forEach(({ id }, i) => {
      const sec = document.getElementById(id);
      if (!sec) return;
      const rect = sec.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.5) activeIdx = i;
    });
    indicators.forEach(({ el }, i) => {
      el.classList.toggle('active', i === activeIdx);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  update();

  const heroBg      = document.getElementById('hero-bg');
  const heroSection = document.querySelector('.parallax-hero');

  if (heroBg && heroSection) {
    document.addEventListener('mousemove', e => {
      const rect = heroSection.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const xPct = (e.clientX / window.innerWidth  - 0.5) * 2;
      const yPct = (e.clientY / window.innerHeight - 0.5) * 2;
      heroBg.style.transform = `translate3d(${xPct * -12}px, ${yPct * -8}px, 0)`;
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const hash = a.getAttribute('href');
      const id   = hash.replace('#', '');
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        smoothScrollTo(id);
      }
    });
  });

  document.querySelectorAll('.section-content').forEach(el => {
    const parent = el.closest('.parallax-section');
    if (!parent) return;

    parent.addEventListener('mousemove', e => {
      const rect = parent.getBoundingClientRect();
      const xPct = (e.clientX - rect.left)  / rect.width  - 0.5;
      const yPct = (e.clientY - rect.top)   / rect.height - 0.5;
      el.style.transform = `translate3d(${xPct * 8}px, ${yPct * 5}px, 0)`;
    });

    parent.addEventListener('mouseleave', () => {
      el.style.transform = 'translate3d(0, 0, 0)';
    });

    el.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  });

  const eyebrow = document.querySelector('.hero-eyebrow');
  if (eyebrow) {
    const text = eyebrow.textContent;
    eyebrow.textContent = '';

    setTimeout(() => {
      let i = 0;
      const type = () => {
        if (i < text.length) {
          eyebrow.textContent += text[i++];
          setTimeout(type, 55);
        }
      };
      type();
    }, 400);
  }

})();
