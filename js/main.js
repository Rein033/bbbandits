/* BBbandits.nl – main.js */

// ── Sticky header ──────────────────────────────────────────
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// ── Mobile nav ─────────────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
    });
  });
}

// ── Active nav link ────────────────────────────────────────
const currentFile = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav__links a[data-page]').forEach(a => {
  if (a.dataset.page === currentFile) a.classList.add('active');
});

// ── Stats counter ──────────────────────────────────────────
const statsSection = document.querySelector('.stats');
if (statsSection) {
  new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('.stat__number').forEach(el => {
        const target = parseInt(el.dataset.target, 10);
        const start  = performance.now();
        const tick   = now => {
          const p = Math.min((now - start) / 1400, 1);
          el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
          if (p < 1) requestAnimationFrame(tick); else el.textContent = target;
        };
        requestAnimationFrame(tick);
      });
      obs.unobserve(e.target);
    });
  }, { threshold: .4 }).observe(statsSection);
}

// ── Video filter ───────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('.video-card').forEach(c => {
      c.classList.toggle('hidden', f !== 'all' && c.dataset.category !== f);
    });
  });
});

// ── Fade-in on scroll ──────────────────────────────────────
const fadeObs = new IntersectionObserver((entries, obs) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.style.opacity  = '1';
    e.target.style.transform = 'translateY(0)';
    obs.unobserve(e.target);
  });
}, { threshold: .08 });

document.querySelectorAll('.video-card, .team-card, .stat, .fade-in').forEach(el => {
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(22px)';
  el.style.transition = 'opacity .45s ease, transform .45s ease';
  fadeObs.observe(el);
});

// ── Contact form ───────────────────────────────────────────
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const n   = contactForm.querySelector('#name').value.trim();
    const em  = contactForm.querySelector('#email').value.trim();
    const msg = contactForm.querySelector('#message').value.trim();
    if (!n || !em || !msg) return;
    document.getElementById('formSuccess').classList.add('show');
    contactForm.reset();
    setTimeout(() => document.getElementById('formSuccess').classList.remove('show'), 5000);
  });
}
