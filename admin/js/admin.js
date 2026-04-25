/* BBbandits Admin JS */

const PERSON_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>`;
const PLAY_SVG  = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
const CAT_LABEL = { highlight: 'Highlight', game: 'Full Game', bts: 'Behind the Scenes' };

// ── Auth ───────────────────────────────────────────────────
const loginScreen = document.getElementById('loginScreen');
const dashboard   = document.getElementById('dashboard');
const loginForm   = document.getElementById('loginForm');
const loginError  = document.getElementById('loginError');

function isLoggedIn() { return sessionStorage.getItem('bbb_admin') === '1'; }
function showDashboard() { loginScreen.hidden = true; dashboard.hidden = false; init(); }
function showLogin()     { loginScreen.hidden = false; dashboard.hidden = true; }

if (isLoggedIn()) { showDashboard(); } else { showLogin(); }

loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const pw = document.getElementById('pwInput').value;
  if (BBData.checkPassword(pw)) {
    sessionStorage.setItem('bbb_admin', '1');
    loginError.classList.remove('show');
    showDashboard();
  } else {
    loginError.classList.add('show');
    document.getElementById('pwInput').value = '';
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem('bbb_admin');
  showLogin();
  document.getElementById('pwInput').value = '';
});

// ── Tab switching ──────────────────────────────────────────
function switchTab(name) {
  document.querySelectorAll('.sidebar__link').forEach(l => l.classList.toggle('active', l.dataset.tab === name));
  document.querySelectorAll('.admin-panel').forEach(p => p.hidden = p.id !== 'panel-' + name);
}

document.querySelectorAll('.sidebar__link').forEach(l => {
  l.addEventListener('click', e => { e.preventDefault(); switchTab(l.dataset.tab); });
});

// ── Init ───────────────────────────────────────────────────
function init() {
  switchTab('videos');
  renderVideoList();
  renderMemberList();
  loadSettings();
}

// ══ VIDEO MANAGEMENT ══════════════════════════════════════
const videoForm     = document.getElementById('videoForm');
const videoFormTitle = document.getElementById('videoFormTitle');
const videoList     = document.getElementById('videoList');

document.getElementById('addVideoBtn').addEventListener('click', () => {
  clearVideoForm();
  videoFormTitle.textContent = 'Video toevoegen';
  videoForm.hidden = false;
  videoForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});
document.getElementById('cancelVideoBtn').addEventListener('click', () => { videoForm.hidden = true; });

document.getElementById('saveVideoBtn').addEventListener('click', () => {
  const title = document.getElementById('vTitle').value.trim();
  if (!title) { alert('Voer een titel in.'); return; }
  const data = {
    title,
    desc:     document.getElementById('vDesc').value.trim(),
    category: document.getElementById('vCategory').value,
    youtube:  BBData.parseYTId(document.getElementById('vYoutube').value.trim()),
    duration: document.getElementById('vDuration').value.trim() || '–',
    year:     document.getElementById('vYear').value.trim() || new Date().getFullYear().toString()
  };
  const editId = document.getElementById('vEditId').value;
  if (editId) { BBData.updateVideo(editId, data); } else { BBData.addVideo(data); }
  videoForm.hidden = true;
  renderVideoList();
});

function clearVideoForm() {
  ['vYoutube','vTitle','vDesc','vDuration','vYear','vEditId'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('vCategory').value = 'highlight';
}

function editVideo(id) {
  const v = BBData.getVideos().find(x => x.id === id);
  if (!v) return;
  document.getElementById('vEditId').value   = v.id;
  document.getElementById('vYoutube').value  = v.youtube || '';
  document.getElementById('vTitle').value    = v.title;
  document.getElementById('vDesc').value     = v.desc;
  document.getElementById('vCategory').value = v.category;
  document.getElementById('vDuration').value = v.duration;
  document.getElementById('vYear').value     = v.year;
  videoFormTitle.textContent = 'Video bewerken';
  videoForm.hidden = false;
  videoForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function deleteVideo(id) {
  if (!confirm('Deze video verwijderen?')) return;
  BBData.deleteVideo(id);
  renderVideoList();
}

function renderVideoList() {
  const vids = BBData.getVideos();
  if (!vids.length) { videoList.innerHTML = '<p class="empty-state">Nog geen video\'s. Voeg er een toe!</p>'; return; }
  videoList.innerHTML = vids.map(v => {
    const thumb = v.youtube
      ? `<img src="https://img.youtube.com/vi/${v.youtube}/mqdefault.jpg" alt="${v.title}">`
      : PLAY_SVG;
    return `
      <div class="item-row">
        <div class="item-thumb">${thumb}</div>
        <div class="item-info">
          <strong>${v.title}</strong>
          <span>${v.duration} · ${v.year}</span>
        </div>
        <span class="item-tag">${CAT_LABEL[v.category] || v.category}</span>
        <div class="item-actions">
          <button class="btn-admin btn-admin--ghost btn-admin--sm" onclick="editVideo('${v.id}')">Bewerk</button>
          <button class="btn-admin btn-admin--danger btn-admin--sm" onclick="deleteVideo('${v.id}')">Verwijder</button>
        </div>
      </div>`;
  }).join('');
}

// ══ TEAM MANAGEMENT ══════════════════════════════════════
const memberForm      = document.getElementById('memberForm');
const memberFormTitle = document.getElementById('memberFormTitle');
const memberList      = document.getElementById('memberList');

document.getElementById('addMemberBtn').addEventListener('click', () => {
  clearMemberForm();
  memberFormTitle.textContent = 'Lid toevoegen';
  memberForm.hidden = false;
  memberForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});
document.getElementById('cancelMemberBtn').addEventListener('click', () => { memberForm.hidden = true; });

document.getElementById('saveMemberBtn').addEventListener('click', () => {
  const name = document.getElementById('mName').value.trim();
  if (!name) { alert('Voer een naam in.'); return; }
  const data = {
    name,
    role:   document.getElementById('mRole').value.trim(),
    bio:    document.getElementById('mBio').value.trim(),
    avatar: document.getElementById('mAvatar').value.trim()
  };
  const editId = document.getElementById('mEditId').value;
  if (editId) { BBData.updateMember(editId, data); } else { BBData.addMember(data); }
  memberForm.hidden = true;
  renderMemberList();
});

function clearMemberForm() {
  ['mName','mRole','mBio','mAvatar','mEditId'].forEach(id => document.getElementById(id).value = '');
}

function editMember(id) {
  const m = BBData.getTeam().find(x => x.id === id);
  if (!m) return;
  document.getElementById('mEditId').value  = m.id;
  document.getElementById('mName').value    = m.name;
  document.getElementById('mRole').value    = m.role;
  document.getElementById('mBio').value     = m.bio;
  document.getElementById('mAvatar').value  = m.avatar || '';
  memberFormTitle.textContent = 'Lid bewerken';
  memberForm.hidden = false;
  memberForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function deleteMember(id) {
  if (!confirm('Dit teamlid verwijderen?')) return;
  BBData.deleteMember(id);
  renderMemberList();
}

function renderMemberList() {
  const team = BBData.getTeam();
  if (!team.length) { memberList.innerHTML = '<p class="empty-state">Nog geen teamleden. Voeg er een toe!</p>'; return; }
  memberList.innerHTML = team.map(m => {
    const av = m.avatar ? `<img src="${m.avatar}" alt="${m.name}">` : PERSON_SVG;
    return `
      <div class="item-row">
        <div class="item-avatar">${av}</div>
        <div class="item-info">
          <strong>${m.name}</strong>
          <span>${m.role}</span>
        </div>
        <div class="item-actions">
          <button class="btn-admin btn-admin--ghost btn-admin--sm" onclick="editMember('${m.id}')">Bewerk</button>
          <button class="btn-admin btn-admin--danger btn-admin--sm" onclick="deleteMember('${m.id}')">Verwijder</button>
        </div>
      </div>`;
  }).join('');
}

// ══ SETTINGS ══════════════════════════════════════════════
function loadSettings() {
  const s = BBData.getSettings();
  document.getElementById('sYoutube').value   = s.youtube || '';
  document.getElementById('sInstagram').value = s.instagram || '';
  document.getElementById('sEmail').value     = s.email || '';
}

function flashConfirm(id, msg = 'Opgeslagen!') {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

document.getElementById('saveSocialBtn').addEventListener('click', () => {
  BBData.saveSettings({
    youtube:   document.getElementById('sYoutube').value.trim(),
    instagram: document.getElementById('sInstagram').value.trim(),
    email:     document.getElementById('sEmail').value.trim()
  });
  flashConfirm('socialSaved');
});

document.getElementById('savePwBtn').addEventListener('click', () => {
  const p1 = document.getElementById('sNewPw').value;
  const p2 = document.getElementById('sNewPw2').value;
  if (!p1) { flashConfirm('pwSaved', 'Voer een wachtwoord in.'); return; }
  if (p1 !== p2) { flashConfirm('pwSaved', 'Wachtwoorden komen niet overeen.'); return; }
  BBData.saveSettings({ password: p1 });
  document.getElementById('sNewPw').value = '';
  document.getElementById('sNewPw2').value = '';
  flashConfirm('pwSaved', 'Wachtwoord gewijzigd!');
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Weet je zeker dat je alle gegevens wilt resetten naar standaard?')) return;
  localStorage.removeItem('bbb_videos');
  localStorage.removeItem('bbb_team');
  localStorage.removeItem('bbb_settings');
  renderVideoList();
  renderMemberList();
  loadSettings();
  alert('Gegevens gereset naar standaard.');
});
