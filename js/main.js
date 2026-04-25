/* BBbandits.nl – main.js */

// ── Sticky header ──────────────────────────────────────────
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// ── Mobile nav toggle ──────────────────────────────────────
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

// ── Stats counter animation ────────────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const start  = performance.now();
  const tick = now => {
    const p = Math.min((now - start) / 1400, 1);
    el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  };
  requestAnimationFrame(tick);
}
const statsSection = document.querySelector('.stats');
if (statsSection) {
  new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.stat__number').forEach(animateCounter);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: .4 }).observe(statsSection);
}

// ── Filter buttons ─────────────────────────────────────────
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

// ── Renderers ──────────────────────────────────────────────
const CAT_LABEL = { highlight: 'Highlight', game: 'Full Game', bts: 'Behind the Scenes' };
const PLAY_ICON = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
const PERSON_ICON = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>`;

function videoCardHTML(v) {
  const id   = v.youtube;
  const href = id ? `https://www.youtube.com/watch?v=${id}` : null;
  const thumb = id
    ? `<a href="${href}" target="_blank" rel="noopener" class="yt-thumb-link">
         <img src="https://img.youtube.com/vi/${id}/maxresdefault.jpg"
              onerror="this.src='https://img.youtube.com/vi/${id}/hqdefault.jpg'"
              alt="${v.title}" loading="lazy">
         <span class="play-overlay">${PLAY_ICON}</span>
       </a>`
    : `<div class="video-thumb-placeholder">${PLAY_ICON}</div>`;
  return `
    <div class="video-card" data-category="${v.category}">
      <div class="video-card__thumb">${thumb}<span class="video-card__tag">${CAT_LABEL[v.category] || v.category}</span></div>
      <div class="video-card__info">
        <h3>${v.title}</h3><p>${v.desc}</p>
        <span class="video-card__meta">${v.duration} · ${v.year}</span>
      </div>
    </div>`;
}

function teamCardHTML(m) {
  const av = m.avatar
    ? `<img src="${m.avatar}" alt="${m.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
    : `<div class="avatar-placeholder">${PERSON_ICON}</div>`;
  return `
    <div class="team-card">
      <div class="team-card__avatar">${av}</div>
      <h3 class="team-card__name">${m.name}</h3>
      <span class="team-card__role">${m.role}</span>
      <p class="team-card__bio">${m.bio}</p>
    </div>`;
}

function renderVideos(el, limit) {
  if (!el) return;
  const vids = BBData.getVideos();
  el.innerHTML = (limit ? vids.slice(0, limit) : vids).map(videoCardHTML).join('');
  fadeIn(el.querySelectorAll('.video-card'));
}
function renderTeam(el, limit) {
  if (!el) return;
  const team = BBData.getTeam();
  el.innerHTML = (limit ? team.slice(0, limit) : team).map(teamCardHTML).join('');
  fadeIn(el.querySelectorAll('.team-card'));
}

// ── Fade-in on scroll ──────────────────────────────────────
function fadeIn(els) {
  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        o.unobserve(e.target);
      }
    });
  }, { threshold: .08 });
  els.forEach(el => {
    el.style.cssText += 'opacity:0;transform:translateY(24px);transition:opacity .45s ease,transform .45s ease';
    obs.observe(el);
  });
}
fadeIn(document.querySelectorAll('.stat'));

// ── Contact form ───────────────────────────────────────────
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const n = contactForm.querySelector('#name').value.trim();
    const em = contactForm.querySelector('#email').value.trim();
    const msg = contactForm.querySelector('#message').value.trim();
    if (!n || !em || !msg) return;
    document.getElementById('formSuccess').classList.add('show');
    contactForm.reset();
    setTimeout(() => document.getElementById('formSuccess').classList.remove('show'), 5000);
  });
}

// ── Page-specific init ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderVideos(document.getElementById('homeVideos'), 3);
  renderVideos(document.getElementById('videosGrid'));
  renderTeam(document.getElementById('homeTeam'), 4);
  renderTeam(document.getElementById('teamGrid'));

  // Inject settings-based links
  const s = BBData.getSettings();
  document.querySelectorAll('[data-yt]').forEach(el => el.href = s.youtube);
  document.querySelectorAll('[data-ig]').forEach(el => el.href = s.instagram);
  document.querySelectorAll('[data-mail]').forEach(el => {
    el.href = 'mailto:' + s.email;
    if (!el.dataset.keepText) el.textContent = s.email;
  });
});
