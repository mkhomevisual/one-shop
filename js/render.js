/* One-Shop — Dynamic content renderer + UI
 * Načítá data z /data/*.json a renderuje sekce:
 *   - Pobočky (stores)
 *   - Tým (team)
 *   - Novinky (news)
 *   - Leták (letak)
 *
 * UI: dark mode, language switch, smooth scroll,
 *     fade-in, counter animation, beams background.
 */

// ──────────────────────────────────────────────
// GLOBAL STATE
// ──────────────────────────────────────────────
let lang  = localStorage.getItem('os-lang')  || document.documentElement.dataset.defaultLang || 'cz';
let theme = localStorage.getItem('os-theme') || 'light';
let stores = [], letakPages = [];
let lbPhotos = [], lbIdx = 0;

// ──────────────────────────────────────────────
// INIT THEME
// ──────────────────────────────────────────────
document.documentElement.setAttribute('data-theme', theme);

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmtDate(dateStr) {
  try {
    const d = new Date(dateStr);
    const loc = lang === 'vn' ? 'vi-VN' : 'cs-CZ';
    return d.toLocaleDateString(loc, { day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return dateStr || ''; }
}

// ──────────────────────────────────────────────
// LANGUAGE
// ──────────────────────────────────────────────
function setLang(l) {
  lang = l;
  localStorage.setItem('os-lang', l);
  applyLang();
  if (window._letakData) applyLetakData(window._letakData);
  if (window._teamData)  renderTeam(window._teamData);
  if (window._newsData)  renderNews(window._newsData);
  if (stores.length) {
    renderSidebar();
    const activeTab = document.querySelector('.branch-tab.active');
    const idx = activeTab ? +activeTab.dataset.idx : 0;
    renderBranch(idx);
  }
}

function applyLang() {
  // Static [data-cz] / [data-vn] elements
  document.querySelectorAll('[data-cz]').forEach(el => {
    const v = el.getAttribute('data-' + lang);
    if (v !== null) el.innerHTML = v;
  });
  document.querySelectorAll('[data-cz-ph]').forEach(el => {
    const v = el.getAttribute('data-' + lang + '-ph');
    if (v) el.placeholder = v;
  });
  // Active lang buttons
  document.querySelectorAll('.lang-btn[data-for-lang],.mob-lang-btn[data-for-lang]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.forLang === lang);
  });
  document.querySelectorAll('.footer-lang-btn[data-for-lang]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.forLang === lang);
  });
}

// ──────────────────────────────────────────────
// THEME
// ──────────────────────────────────────────────
function toggleTheme() {
  const html = document.documentElement;
  html.classList.add('theme-tr');
  theme = theme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', theme);
  localStorage.setItem('os-theme', theme);
  setTimeout(() => html.classList.remove('theme-tr'), 280);
}

// ──────────────────────────────────────────────
// SMOOTH SCROLL
// ──────────────────────────────────────────────
function sc(sel) {
  const el = document.querySelector(sel);
  if (!el) return false;
  const nav = document.getElementById('nav');
  const off = nav ? nav.getBoundingClientRect().height : 0;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - off, behavior: 'smooth' });
  return false;
}

// ──────────────────────────────────────────────
// MOBILE NAV
// ──────────────────────────────────────────────
function toggleMob() { document.getElementById('mob').classList.toggle('open'); }
function closeMob()  { document.getElementById('mob').classList.remove('open'); }

// ──────────────────────────────────────────────
// LIGHTBOX
// ──────────────────────────────────────────────
function openLb(photos, idx) {
  lbPhotos = photos; lbIdx = idx;
  updateLb();
  document.getElementById('lb').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLb() {
  document.getElementById('lb').classList.remove('open');
  document.body.style.overflow = '';
}
function lbMove(dir) {
  if (!lbPhotos.length) return;
  lbIdx = (lbIdx + dir + lbPhotos.length) % lbPhotos.length;
  updateLb();
}
function updateLb() {
  document.getElementById('lb-img').src = lbPhotos[lbIdx] || '';
  document.getElementById('lb-counter').textContent = (lbIdx + 1) + ' / ' + lbPhotos.length;
}

// ──────────────────────────────────────────────
// LETAK
// ──────────────────────────────────────────────
function openLetak() {
  renderLetakGrid();
  document.getElementById('lp').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLetak() {
  document.getElementById('lp').classList.remove('open');
  document.body.style.overflow = '';
}

function renderLetakGrid() {
  const grid = document.getElementById('lp-grid');
  if (!grid) return;
  if (!letakPages.length) {
    grid.innerHTML = '<p style="color:var(--muted);padding:32px;text-align:center">' +
      (lang === 'vn' ? 'Chưa có ảnh letak.' : 'Žádné stránky letáku zatím nejsou nahrané.') + '</p>';
    return;
  }
  grid.innerHTML = letakPages.map((src, i) =>
    `<div class="lp-item" onclick="openLb(letakPages,${i})">
       <img src="${esc(src)}" alt="Leták – stránka ${i + 1}" loading="lazy"/>
     </div>`
  ).join('');
}

function applyLetakData(data) {
  letakPages = Array.isArray(data.pages) ? data.pages : [];

  const img = document.getElementById('letak-preview');
  if (img && data.preview_image) img.src = data.preview_image;

  const el = (id) => document.getElementById(id);
  if (el('letak-title'))       el('letak-title').innerHTML       = lang === 'vn' ? data.title_vn       : data.title_cz;
  if (el('letak-desc'))        el('letak-desc').innerHTML        = lang === 'vn' ? data.description_vn : data.description_cz;
  if (el('letak-validity'))    el('letak-validity').textContent   = lang === 'vn' ? data.validity_vn    : data.validity_cz;
  if (el('lp-title-text'))    el('lp-title-text').textContent    = lang === 'vn' ? data.title_vn       : data.title_cz;

  // Store for lang switching
  window._letakData = data;
}

// ──────────────────────────────────────────────
// STORES / BRANCHES
// ──────────────────────────────────────────────
function renderSidebar() {
  const sidebar   = document.getElementById('bsidebar');
  const dropdown  = document.getElementById('branch-select-dropdown');
  const label     = document.getElementById('branch-select-label');

  if (sidebar) {
    sidebar.innerHTML = stores.map((b, i) =>
      `<div class="branch-tab${i === 0 ? ' active' : ''}" onclick="selectBranch(${i})" data-idx="${i}">
         <div class="branch-tab-name">${esc(b.name)}</div>
         <div class="branch-tab-city">${esc(b.city_subtitle)}</div>
       </div>`
    ).join('');
  }
  if (dropdown) {
    dropdown.innerHTML = stores.map((b, i) =>
      `<div class="branch-select-option${i === 0 ? ' active' : ''}" onclick="selectBranchMob(${i})">
         <div class="branch-select-opt-name">${esc(b.name)}</div>
         <div class="branch-select-opt-city">${esc(b.city_subtitle)}</div>
       </div>`
    ).join('');
  }
  if (label && stores.length) {
    label.textContent = stores[0].name + ' — ' + stores[0].city_subtitle;
  }
}

function renderBranch(idx) {
  const el = document.getElementById('bdetail');
  if (!el || !stores[idx]) return;
  const b = stores[idx];
  const L = lang;
  const mapsUrl = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(b.address || '');
  const photos  = Array.isArray(b.photos) ? b.photos : [];

  const photosHtml = photos.length
    ? photos.map((p, pi) =>
        `<div class="gallery-thumb" onclick="openLb(stores[${idx}].photos,${pi})">
           <img src="${esc(p)}" alt="${esc(b.name)} – foto ${pi + 1}" loading="lazy"/>
         </div>`
      ).join('')
    : `<div style="color:var(--muted);font-size:.8rem;padding:8px 0">${L === 'vn' ? 'Chưa có ảnh.' : 'Žádné fotky zatím nejsou nahrané.'}</div>`;

  const mapSrc = 'https://maps.google.com/maps?q=' + encodeURIComponent(b.address || b.name || '') + '&output=embed&z=15';
  const mapHint = L === 'vn' ? 'Nhấn để xem bản đồ' : 'Klikněte pro zobrazení mapy';

  el.innerHTML = `
    <div class="branch-map branch-map-ph" data-src="${esc(mapSrc)}" onclick="loadBranchMap(this)">
      <div class="map-grid"></div>
      <div class="map-pin">
        <div class="map-pin-dot"></div>
        <span style="font-size:.75rem;color:rgba(249,115,22,.8);font-weight:600">${esc(b.name)}</span>
      </div>
      <div class="map-load-hint">${mapHint}</div>
    </div>
    <div class="branch-meta-row">
      <div class="branch-info-row">
        <div class="branch-info-item">
          <div class="branch-info-label">${L === 'vn' ? 'Địa chỉ' : 'Adresa'}</div>
          <div class="branch-info-val">${esc(b.address)}</div>
        </div>
        <div class="branch-info-item">
          <div class="branch-info-label">${L === 'vn' ? 'Điện thoại' : 'Telefon'}</div>
          <div class="branch-info-val"><a href="tel:${esc(b.phone.replace(/[^+0-9]/g,''))}" style="color:var(--orange)">${esc(b.phone)}</a></div>
        </div>
        <div class="branch-info-item">
          <div class="branch-info-label">${L === 'vn' ? 'Giờ mở cửa' : 'Otevírací doba'}</div>
          <div class="branch-info-val">${esc(L === 'vn' ? b.hours_vn : b.hours_cz)}</div>
        </div>
      </div>
      <a class="branch-nav-btn" href="${esc(mapsUrl)}" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
        ${L === 'vn' ? 'Điều hướng' : 'Navigovat'}
      </a>
    </div>
    <div class="testimonial">
      <div class="test-quote">${esc(L === 'vn' ? b.quote_vn : b.quote_cz)}</div>
      <div class="test-author">
        <div class="test-avatar">${esc(b.owner_initials)}</div>
        <div>
          <div class="test-name">${esc(b.owner_name)}</div>
          <div class="test-role">${esc(L === 'vn' ? b.owner_position_vn : b.owner_position_cz)}</div>
        </div>
      </div>
    </div>
    <div class="branch-gallery">
      <div class="gallery-label">${L === 'vn' ? 'Thư viện ảnh' : 'Fotogalerie'}</div>
      <div class="gallery-grid">${photosHtml}</div>
    </div>`;
}

function toggleBranchSelect() {
  const dd      = document.getElementById('branch-select-dropdown');
  const trigger = document.getElementById('branch-select-trigger');
  if (!dd) return;
  const isOpen = dd.classList.toggle('open');
  trigger && trigger.classList.toggle('open', isOpen);
}

function closeBranchSelect() {
  document.getElementById('branch-select-dropdown')?.classList.remove('open');
  document.getElementById('branch-select-trigger')?.classList.remove('open');
}

function selectBranchMob(idx) {
  selectBranch(idx);
  const label = document.getElementById('branch-select-label');
  if (label && stores[idx]) label.textContent = stores[idx].name + ' — ' + stores[idx].city_subtitle;
  document.querySelectorAll('.branch-select-option').forEach((o, i) => o.classList.toggle('active', i === idx));
  closeBranchSelect();
}

function loadBranchMap(el) {
  const src = el.dataset.src;
  if (!src) return;
  el.classList.remove('branch-map-ph');
  el.removeAttribute('onclick');
  el.innerHTML = `<iframe src="${src}" width="100%" height="100%" style="border:0;display:block;width:100%;height:100%" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>`;
}

function selectBranch(idx) {
  document.querySelectorAll('.branch-tab').forEach((t, i) => t.classList.toggle('active', i === idx));
  renderBranch(idx);
}

// ──────────────────────────────────────────────
// TEAM
// ──────────────────────────────────────────────
function renderTeam(team) {
  const grid = document.getElementById('team-grid');
  if (!grid) return;
  const SVG_PHONE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>`;
  const SVG_MAIL  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;

  grid.innerHTML = team.map((p, i) => {
    const delay = ['d1','d2','d3','d4','d5','d6'][i % 6];
    const pos   = lang === 'vn' ? p.position_vn : p.position_cz;
    return `<div class="team-card fade ${delay}">
      <div class="team-name">${esc(p.name)}</div>
      <div class="team-role-badge">${esc(pos)}</div>
      <div class="team-contacts">
        ${p.phone ? `<a class="team-contact-link" href="tel:${esc(p.phone.replace(/\s/g,''))}">${SVG_PHONE} ${esc(p.phone)}</a>` : ''}
        ${p.email ? `<a class="team-contact-link" href="mailto:${esc(p.email)}">${SVG_MAIL} ${esc(p.email)}</a>` : ''}
      </div>
    </div>`;
  }).join('');

  // Observe new cards for fade-in
  grid.querySelectorAll('.fade').forEach(el => fadeObserver.observe(el));
}

// ──────────────────────────────────────────────
// NEWS
// ──────────────────────────────────────────────
function renderNews(news) {
  const grid = document.getElementById('news-grid');
  if (!grid) return;
  const sorted = [...news].sort((a, b) => new Date(b.date) - new Date(a.date));

  grid.innerHTML = sorted.map((n, i) => {
    const delay  = ['d1','d2','d3'][i % 3];
    const title  = lang === 'vn' ? n.title_vn  : n.title_cz;
    const excerpt= lang === 'vn' ? n.excerpt_vn : n.excerpt_cz;
    const cat    = lang === 'vn' ? (n.category_vn || '') : (n.category_cz || '');
    const date   = fmtDate(n.date);
    const img    = n.image || '';

    const thumbContent = img
      ? `<img src="${esc(img)}" alt="${esc(title)}" loading="lazy" style="width:100%;height:100%;object-fit:cover">`
      : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted2);font-size:.75rem">${lang === 'vn' ? 'Chưa có ảnh' : 'Bez obrázku'}</div>`;

    return `<div class="news-card fade ${delay}">
      <div class="news-thumb" style="height:200px">
        <div class="news-thumb-inner">${thumbContent}</div>
        ${cat ? `<div class="news-category">${esc(cat)}</div>` : ''}
      </div>
      <div class="news-body">
        <div class="news-meta">${esc(date)}</div>
        <div class="news-title">${esc(title)}</div>
        <div class="news-excerpt">${esc(excerpt)}</div>
      </div>
    </div>`;
  }).join('');

  grid.querySelectorAll('.fade').forEach(el => fadeObserver.observe(el));
}

// ──────────────────────────────────────────────
// FADE-IN OBSERVER
// ──────────────────────────────────────────────
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); fadeObserver.unobserve(e.target); }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -28px 0px' });

// ──────────────────────────────────────────────
// COUNTER ANIMATION
// ──────────────────────────────────────────────
function animCount(el) {
  const target = +el.dataset.target;
  const suffix = el.dataset.suffix || '';
  const dur    = 1800;
  const start  = performance.now();
  const tick   = now => {
    const t = Math.min(1, (now - start) / dur);
    const e = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(target * e).toLocaleString('cs-CZ') + suffix;
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString('cs-CZ') + suffix;
  };
  requestAnimationFrame(tick);
}

// ──────────────────────────────────────────────
// BEAMS BACKGROUND (contact section)
// ──────────────────────────────────────────────
function initBeams() {
  const canvas = document.getElementById('beams-canvas');
  if (!canvas) return;
  if (window.matchMedia?.('(prefers-reduced-motion:reduce)')?.matches) return;
  const ctx     = canvas.getContext('2d');
  const section = canvas.parentElement;
  const TOTAL   = 12, INTERVAL = 1000 / 30;
  let beams = [], raf, last = 0;

  function mkBeam(w, h) {
    return { x:Math.random()*w*1.5-w*.25, y:Math.random()*h*1.5-h*.25,
             width:70+Math.random()*90, length:h*2.5,
             angle:-35+Math.random()*10, speed:.35+Math.random()*.65,
             opacity:.13+Math.random()*.14, hue:20+Math.random()*12,
             pulse:Math.random()*Math.PI*2, pulseSpeed:.012+Math.random()*.018 };
  }
  function resetBeam(b, i, w, h) {
    const s = w/3;
    b.y=h+100; b.x=(i%3)*s+s/2+(Math.random()-.5)*s*.5;
    b.width=90+Math.random()*100; b.speed=.35+Math.random()*.5;
    b.hue=18+(i*20)/TOTAL; b.opacity=.13+Math.random()*.13;
  }
  function drawBeam(b) {
    ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(b.angle*Math.PI/180);
    const op = b.opacity*(0.8+Math.sin(b.pulse)*.2);
    const c  = `hsla(${b.hue},100%,50%,`;
    const g  = ctx.createLinearGradient(0,0,0,b.length);
    g.addColorStop(0,c+'0)'); g.addColorStop(.1,c+(op*.5)+')');
    g.addColorStop(.4,c+op+')'); g.addColorStop(.6,c+op+')');
    g.addColorStop(.9,c+(op*.5)+')'); g.addColorStop(1,c+'0)');
    ctx.fillStyle=g; ctx.fillRect(-b.width/2,0,b.width,b.length); ctx.restore();
  }
  function resize() {
    const dpr=Math.min(window.devicePixelRatio||1,2);
    const r=section.getBoundingClientRect();
    canvas.width=r.width*dpr; canvas.height=r.height*dpr;
    canvas.style.width=r.width+'px'; canvas.style.height=r.height+'px';
    ctx.scale(dpr,dpr);
    beams=Array.from({length:TOTAL},()=>mkBeam(r.width,r.height));
  }
  function animate(now) {
    raf=requestAnimationFrame(animate);
    if(now-last<INTERVAL) return; last=now;
    const dpr=Math.min(window.devicePixelRatio||1,2);
    const w=canvas.width/dpr, h=canvas.height/dpr;
    ctx.clearRect(0,0,w,h);
    beams.forEach((b,i)=>{
      b.y-=b.speed; b.pulse+=b.pulseSpeed;
      if(b.y+b.length<-100) resetBeam(b,i,w,h);
      drawBeam(b);
    });
  }
  resize(); raf=requestAnimationFrame(animate);
  new ResizeObserver(resize).observe(section);
}

// ──────────────────────────────────────────────
// FETCH ALL DATA + INIT
// ──────────────────────────────────────────────
async function fetchJSON(url) {
  try {
    const r = await fetch(url, { cache: 'no-store' });
    return await r.json();
  } catch { return null; }
}

function normalizeRoot(data) {
  const arr = data?.root ?? data;
  return Array.isArray(arr) ? arr : [];
}

async function initAll() {
  const [storesData, teamData, newsData, letakData] = await Promise.all([
    fetchJSON('/data/stores.json'),
    fetchJSON('/data/team.json'),
    fetchJSON('/data/news.json'),
    fetchJSON('/data/letak.json'),
  ]);

  // Stores — normalize photos from 4 fixed fields or legacy array
  stores = normalizeRoot(storesData).map(s => {
    const p4 = [s.photo_1, s.photo_2, s.photo_3, s.photo_4].filter(Boolean);
    return { ...s, photos: p4.length ? p4 : (Array.isArray(s.photos) ? s.photos : []) };
  });
  if (stores.length) { renderSidebar(); renderBranch(0); }

  // Team
  const team = normalizeRoot(teamData);
  window._teamData = team;
  if (team.length) renderTeam(team);

  // News
  const news = normalizeRoot(newsData);
  window._newsData = news;
  if (news.length) renderNews(news);

  // Letak
  if (letakData) applyLetakData(letakData);

  // Apply language to all static [data-cz] elements
  applyLang();

  // Fade-in for pre-existing elements
  document.querySelectorAll('.fade,.fade-l,.fade-r').forEach(el => fadeObserver.observe(el));

  // Counters
  const cio = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { animCount(e.target); cio.unobserve(e.target); } });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-target]').forEach(el => cio.observe(el));

  // Beams
  initBeams();

  // Navbar scroll + hero background parallax
  const navEl = document.getElementById('nav');
  const heroEl = document.querySelector('.hero');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    navEl && navEl.classList.toggle('glow-nav', y > 60);
    if (heroEl && y < window.innerHeight) {
      heroEl.style.backgroundPositionY = `calc(50% + ${y * 0.22}px)`;
    }
  }, { passive: true });

  // Close custom branch dropdown when clicking outside
  document.addEventListener('click', e => {
    const wrap = document.getElementById('branch-custom-select');
    if (wrap && !wrap.contains(e.target)) closeBranchSelect();
  });

  // Keyboard shortcuts for lightbox / letak
  document.addEventListener('keydown', e => {
    const lpOpen = document.getElementById('lp')?.classList.contains('open');
    const lbOpen = document.getElementById('lb')?.classList.contains('open');
    if (lpOpen) { if (e.key === 'Escape') closeLetak(); return; }
    if (!lbOpen) return;
    if (e.key === 'ArrowLeft')  lbMove(-1);
    else if (e.key === 'ArrowRight') lbMove(1);
    else if (e.key === 'Escape') closeLb();
  });
}

// Run when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}
