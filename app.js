/* =========================================================
   agriStore Ghana — real auth, two roles, owner dashboard
   ========================================================= */

const CFG = {
  ADMIN_EMAIL: 'admin@agristore.gh',
  ADMIN_PASSWORD: 'Admin123!',
  KEYS: {
    users:     'as_gh_users',
    session:   'as_gh_session',
    bookings:  'as_gh_bookings',
    favorites: 'as_gh_favorites',
    reviews:   'as_gh_reviews',
    theme:     'as_gh_theme'
  }
};

const REGIONS = [
  "Greater Accra","Ashanti","Northern","Western","Central",
  "Upper East","Upper West","Volta","Eastern","Bono"
];

const WAREHOUSES = [
  { id:"w1",  name:"Tamale Grain Hub", region:"Northern", city:"Tamale", price:35, unit:"GHS / tonne / month", capacity:600, rating:4.9,
    features:["Climate control","24/7 security","Moisture control","Weighbridge"],
    image:"https://images.unsplash.com/photo-1654372031868-ff34dc668820?q=80&w=1200&auto=format&fit=crop",
    coords:[9.4008,-0.8393] },
  { id:"w2",  name:"Kumasi Cocoa Storage", region:"Ashanti", city:"Kumasi", price:42, unit:"GHS / tonne / month", capacity:320, rating:4.7,
    features:["Pest control","Fumigation","Weighbridge"],
    image:"https://images.unsplash.com/photo-1569718974246-7b898eae87d3?q=80&w=1200&auto=format&fit=crop",
    coords:[6.6885,-1.6244] },
  { id:"w3",  name:"Accra Cold & Dry", region:"Greater Accra", city:"Tema", price:55, unit:"GHS / tonne / month", capacity:180, rating:4.8,
    features:["Cold room","Dry storage","CCTV","Loading bay"],
    image:"https://images.unsplash.com/photo-1741655262435-4890ab9918fa?q=80&w=1200&auto=format&fit=crop",
    coords:[5.6698,0.0166] },
  { id:"w4",  name:"Bolgatanga Farmers Co-op", region:"Upper East", city:"Bolgatanga", price:28, unit:"GHS / tonne / month", capacity:250, rating:4.6,
    features:["Solar backup","Loading bay","Moisture meters"],
    image:"https://images.pexels.com/photos/29746992/pexels-photo-29746992.jpeg?auto=compress&cs=tinysrgb&w=1200",
    coords:[10.7856,-0.8514] },
  { id:"w5",  name:"Takoradi Port Storage", region:"Western", city:"Takoradi", price:48, unit:"GHS / tonne / month", capacity:800, rating:4.8,
    features:["Port access","Customs bonded","Forklift","CCTV"],
    image:"https://images.unsplash.com/photo-1724709162875-fe100dd0e04b?q=80&w=1200&auto=format&fit=crop",
    coords:[4.9016,-1.7831] },
  { id:"w6",  name:"Cape Coast AgriStore", region:"Central", city:"Cape Coast", price:32, unit:"GHS / tonne / month", capacity:200, rating:4.5,
    features:["Humidity control","Pallet racks","Night guard"],
    image:"https://images.unsplash.com/photo-1721939203156-c059bb47f9b1?q=80&w=1200&auto=format&fit=crop",
    coords:[5.1315,-1.2795] },
  { id:"w7",  name:"Ho Valley Silo", region:"Volta", city:"Ho", price:30, unit:"GHS / tonne / month", capacity:420, rating:4.4,
    features:["Aeration","Pest control","Loading bay"],
    image:"https://images.pexels.com/photos/14050016/pexels-photo-14050016.jpeg?auto=compress&cs=tinysrgb&w=1200",
    coords:[6.6008,0.4713] },
  { id:"w8",  name:"Koforidua Grain Store", region:"Eastern", city:"Koforidua", price:33, unit:"GHS / tonne / month", capacity:280, rating:4.6,
    features:["Moisture control","24/7 security","Weighbridge"],
    image:"https://images.unsplash.com/photo-1654372031868-ff34dc668820?q=80&w=1200&auto=format&fit=crop",
    coords:[6.0940,-0.2591] },
  { id:"w9",  name:"Wa Farmers Warehouse", region:"Upper West", city:"Wa", price:26, unit:"GHS / tonne / month", capacity:180, rating:4.3,
    features:["Solar backup","Night guard","Loading bay"],
    image:"https://images.unsplash.com/photo-1724709162875-fe100dd0e04b?q=80&w=1200&auto=format&fit=crop",
    coords:[10.0601,-2.5099] },
  { id:"w10", name:"Sunyani AgriHub", region:"Bono", city:"Sunyani", price:31, unit:"GHS / tonne / month", capacity:350, rating:4.7,
    features:["Climate control","Fumigation","CCTV","Weighbridge"],
    image:"https://images.unsplash.com/photo-1569718974246-7b898eae87d3?q=80&w=1200&auto=format&fit=crop",
    coords:[7.3399,-2.3268] }
];

/* ---------- UTILITIES ---------- */
const $  = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => [...c.querySelectorAll(s)];

/* Safe accessor for form field values (avoids [OverrideBuiltins] pitfalls). */
function formVal(form, fieldName, fallback = ''){
  const el = form.elements.namedItem(fieldName);
  if (!el) return fallback;
  if (typeof el.value === 'string') return el.value;
  if (el instanceof RadioNodeList) return el.value;
  return fallback;
}

function hashPassword(pw){
  const salt = 'agristore_gh_2025_salt_';
  const str = salt + pw + salt;
  let h1 = 0x811c9dc5;
  for (let i=0;i<str.length;i++){ h1 ^= str.charCodeAt(i); h1 = Math.imul(h1, 0x01000193); }
  let h2 = 0x811c9dc5;
  for (let i=str.length-1;i>=0;i--){ h2 ^= str.charCodeAt(i); h2 = Math.imul(h2, 0x01000193); }
  return (h1>>>0).toString(16).padStart(8,'0') + (h2>>>0).toString(16).padStart(8,'0');
}

function uid(p='id'){ return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function esc(s){ return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function fmtGHS(n){ return 'GHS ' + Number(n||0).toLocaleString('en-GH'); }
function fmtDate(iso){ if(!iso) return '—'; return new Date(iso).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); }
function initials(name){ return (name||'?').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase(); }
function todayISO(){ return new Date().toISOString().split('T')[0]; }
function monthsBetween(a,b){ if(!a||!b) return 1; return Math.max(1, Math.ceil((new Date(b)-new Date(a))/(1000*60*60*24*30))); }

function toast(msg, type='success'){
  const stack = $('#toastStack');
  const el = document.createElement('div');
  el.className = 'toast' + (type==='error' ? ' error' : '');
  el.innerHTML = `<i class="fa-solid ${type==='error'?'fa-circle-exclamation':'fa-circle-check'}"></i><span>${esc(msg)}</span>`;
  stack.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transform='translateX(20px)'; el.style.transition='.3s'; setTimeout(()=>el.remove(),320); }, 3400);
}

/* ---------- DATABASE ---------- */
const DB = {
  getUsers(){ try { return JSON.parse(localStorage.getItem(CFG.KEYS.users)) || []; } catch { return []; } },
  saveUsers(u){ localStorage.setItem(CFG.KEYS.users, JSON.stringify(u)); },
  getSession(){ try { return JSON.parse(localStorage.getItem(CFG.KEYS.session)) || null; } catch { return null; } },
  setSession(s){ localStorage.setItem(CFG.KEYS.session, JSON.stringify(s)); },
  clearSession(){ localStorage.removeItem(CFG.KEYS.session); },
  getBookings(){ try { return JSON.parse(localStorage.getItem(CFG.KEYS.bookings)) || []; } catch { return []; } },
  saveBookings(b){ localStorage.setItem(CFG.KEYS.bookings, JSON.stringify(b)); },
  getFavorites(){ try { return JSON.parse(localStorage.getItem(CFG.KEYS.favorites)) || []; } catch { return []; } },
  saveFavorites(f){ localStorage.setItem(CFG.KEYS.favorites, JSON.stringify(f)); },
  getReviews(){ try { return JSON.parse(localStorage.getItem(CFG.KEYS.reviews)) || {}; } catch { return {}; } },
  saveReviews(r){ localStorage.setItem(CFG.KEYS.reviews, JSON.stringify(r)); },
  currentUser(){
    const s = this.getSession();
    if (!s) return null;
    return this.getUsers().find(u => u.id === s.userId) || null;
  }
};

/* ---------- SEED ---------- */
function seedAdmin(){
  const users = DB.getUsers();
  if (users.some(u => u.email === CFG.ADMIN_EMAIL)) return;
  users.push({
    id: uid('u'),
    name: 'Administrator',
    email: CFG.ADMIN_EMAIL,
    phone: '+233 30 000 0000',
    password: hashPassword(CFG.ADMIN_PASSWORD),
    role: 'admin',
    createdAt: Date.now()
  });
  DB.saveUsers(users);
}

function seedReviews(){
  const existing = DB.getReviews();
  if (Object.keys(existing).length) return;
  DB.saveReviews({
    w1: [
      { id: uid('r'), user:'Kwame A.', rating:5, comment:'Excellent moisture control. My maize stayed dry for 3 months.', date: Date.now()-86400000*20 },
      { id: uid('r'), user:'Akosua M.', rating:4, comment:'Very secure facility. Loading bay is a bit small during peak season.', date: Date.now()-86400000*10 }
    ],
    w3: [{ id: uid('r'), user:'Joseph O.', rating:5, comment:'Cold storage saved 40% of my tomatoes. Highly recommended.', date: Date.now()-86400000*5 }],
    w5: [{ id: uid('r'), user:'Ama K.', rating:4, comment:'Port access is a huge advantage for export.', date: Date.now()-86400000*15 }]
  });
}

/* ---------- THEME ---------- */
function initTheme(){
  if (localStorage.getItem(CFG.KEYS.theme) === 'dark'){
    document.documentElement.setAttribute('data-theme','dark');
  }
}
function toggleTheme(){
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark){ document.documentElement.removeAttribute('data-theme'); localStorage.setItem(CFG.KEYS.theme,'light'); }
  else       { document.documentElement.setAttribute('data-theme','dark'); localStorage.setItem(CFG.KEYS.theme,'dark'); }
}

/* ---------- ROUTER ---------- */
const Router = {
  currentView: 'landing',
  go(view, opts={}){
    const user = DB.currentUser();

    if (view === 'dashboard' && (!user || user.role !== 'farmer')) {
      if (user?.role === 'owner') view = 'owner';
      else if (user?.role === 'admin') view = 'admin';
      else { view = 'auth'; opts.tab = 'login'; toast('Please sign in as a farmer to continue','error'); }
    }
    if (view === 'owner' && (!user || user.role !== 'owner')) {
      if (user?.role === 'farmer') view = 'dashboard';
      else if (user?.role === 'admin') view = 'admin';
      else { view = 'auth'; opts.tab = 'login'; toast('Please sign in as a warehouse owner','error'); }
    }
    if (view === 'admin' && user?.role !== 'admin') {
      view = user ? (user.role === 'owner' ? 'owner' : 'dashboard') : 'auth';
      toast('Admin access only','error');
    }

    $$('.view').forEach(v => v.classList.add('hidden'));
    const target = $('#view-' + view);
    if (!target) return;
    target.classList.remove('hidden');
    this.currentView = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    $('#navLinks').classList.remove('open');
    updateNav();

    if (view === 'auth')       initAuthView(opts.tab);
    if (view === 'warehouses') initWarehousesView();
    if (view === 'dashboard')  initDashboardView();
    if (view === 'owner')      initOwnerView();
    if (view === 'admin')      initAdminView();
  }
};

/* ---------- NAV ---------- */
function updateNav(){
  const user = DB.currentUser();
  const links = $('#navLinks');
  const actions = $('#navActions');
  const themeBtn = `<button class="theme-toggle" id="themeToggle" title="Toggle theme"><i class="fa-solid fa-moon"></i></button>`;

  if (user){
    const dashView = user.role === 'owner' ? 'owner' : user.role === 'admin' ? 'admin' : 'dashboard';
    const dashLabel = user.role === 'owner' ? 'Owner dashboard' : user.role === 'admin' ? 'Admin' : 'Dashboard';
    links.innerHTML = `
      <button class="nav-link" data-view="landing"><i class="fa-solid fa-house"></i> Home</button>
      <button class="nav-link" data-view="warehouses"><i class="fa-solid fa-warehouse"></i> Warehouses</button>
      <button class="nav-link" data-view="${dashView}"><i class="fa-solid fa-gauge-high"></i> ${dashLabel}</button>
    `;
    actions.innerHTML = `
      ${themeBtn}
      <div class="nav-user" data-view="${dashView}"><span class="avatar">${initials(user.name)}</span><span>${esc(user.name.split(' ')[0])}</span></div>
      <button class="btn btn-ghost" id="navLogout"><i class="fa-solid fa-right-from-bracket"></i> Sign out</button>
    `;
    $('#navLogout').addEventListener('click', doLogout);
  } else {
    links.innerHTML = `
      <button class="nav-link" data-view="landing"><i class="fa-solid fa-house"></i> Home</button>
      <button class="nav-link" data-view="warehouses"><i class="fa-solid fa-warehouse"></i> Warehouses</button>
    `;
    actions.innerHTML = `
      ${themeBtn}
      <button class="btn btn-ghost" data-view="auth" data-tab="login"><i class="fa-solid fa-user"></i> Sign in</button>
      <button class="btn btn-primary" data-view="auth" data-tab="signup"><i class="fa-solid fa-user-plus"></i> Sign up</button>
    `;
  }

  $('#themeToggle')?.addEventListener('click', toggleTheme);
}

function doLogout(){
  DB.clearSession();
  toast('Signed out');
  Router.go('landing');
}

/* ---------- MODALS ---------- */
function openModal(id){ $('#'+id).classList.add('open'); document.body.style.overflow='hidden'; }
function closeModal(id){ $('#'+id).classList.remove('open'); document.body.style.overflow=''; }

function initModals(){
  document.addEventListener('click', e => {
    const closer = e.target.closest('[data-close]');
    if (closer){ closeModal(closer.dataset.close); return; }
    const nav = e.target.closest('[data-view]');
    if (nav && !nav.closest('form')) {
      e.preventDefault();
      Router.go(nav.dataset.view, { tab: nav.dataset.tab });
    }
  });
  $$('.modal-overlay').forEach(ov => {
    ov.addEventListener('click', e => { if (e.target === ov) closeModal(ov.id); });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') $$('.modal-overlay.open').forEach(ov => closeModal(ov.id));
  });
}

/* =========================================================
   AUTH
   ========================================================= */
function initAuthView(defaultTab='login'){
  switchAuthTab(defaultTab);
  $$('[data-authtab]').forEach(btn => {
    if (btn.dataset.bound) return; btn.dataset.bound='1';
    btn.addEventListener('click', e => { e.preventDefault(); switchAuthTab(btn.dataset.authtab); });
  });
  $$('.pw-toggle').forEach(btn => {
    if (btn.dataset.bound) return; btn.dataset.bound='1';
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.innerHTML = input.type === 'password' ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>';
    });
  });
  const roleRadios = $$('input[name="role"]');
  roleRadios.forEach(r => {
    if (r.dataset.bound) return; r.dataset.bound='1';
    r.addEventListener('change', () => {
      const isOwner = $('#signupForm input[name="role"]:checked')?.value === 'owner';
      $('#warehousePickerField').classList.toggle('hidden', !isOwner);
      if (isOwner) populateWarehousePicker();
    });
  });
}

function switchAuthTab(tab){
  $$('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.authtab === tab));
  $('#loginForm').classList.toggle('hidden', tab !== 'login');
  $('#signupForm').classList.toggle('hidden', tab !== 'signup');
  $('#loginError').classList.remove('show');
  $('#signupError').classList.remove('show');
  if (tab === 'signup'){
    const isOwner = $('#signupForm input[name="role"]:checked')?.value === 'owner';
    $('#warehousePickerField').classList.toggle('hidden', !isOwner);
    if (isOwner) populateWarehousePicker();
  }
}

function populateWarehousePicker(){
  const taken = DB.getUsers().filter(u => u.role === 'owner').map(u => u.warehouseId);
  const available = WAREHOUSES.filter(w => !taken.includes(w.id));
  const sel = $('#warehousePicker');
  if (!sel) return;
  sel.innerHTML = available.length
    ? '<option value="">Select your warehouse…</option>' + available.map(w =>
        `<option value="${w.id}">${esc(w.name)} — ${esc(w.city)}, ${esc(w.region)}</option>`).join('')
    : '<option value="">All warehouses are already owned</option>';
}

function validatePassword(pw){
  if (pw.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(pw)) return 'Password must include an uppercase letter.';
  if (!/[0-9]/.test(pw)) return 'Password must include a number.';
  return null;
}

function initAuthHandlers(){
  $('#loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    const email = formVal(form, 'email').trim().toLowerCase();
    const password = formVal(form, 'password');
    const err = $('#loginError'); err.classList.remove('show');

    const user = DB.getUsers().find(u => u.email === email);
    if (!user){ err.textContent = 'No account found with that email.'; err.classList.add('show'); return; }
    if (user.password !== hashPassword(password)){ err.textContent = 'Incorrect password.'; err.classList.add('show'); return; }

    DB.setSession({ userId: user.id, createdAt: Date.now() });
    toast(`Welcome back, ${user.name.split(' ')[0]}!`);
    if (user.role === 'admin')       Router.go('admin');
    else if (user.role === 'owner')  Router.go('owner');
    else                             Router.go('dashboard');
  });

  $('#signupForm').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    const err = $('#signupError'); err.classList.remove('show');

    const role = form.querySelector('input[name="role"]:checked').value;
    const name = formVal(form, 'name').trim();
    const email = formVal(form, 'email').trim().toLowerCase();
    const phone = formVal(form, 'phone').trim();
    const password = formVal(form, 'password');
    const confirm = formVal(form, 'confirm');

    if (name.length < 2){ err.textContent='Please enter your full name.'; err.classList.add('show'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ err.textContent='Please enter a valid email.'; err.classList.add('show'); return; }
    if (!phone || phone.length < 7){ err.textContent='Please enter a valid phone number.'; err.classList.add('show'); return; }
    const pwErr = validatePassword(password);
    if (pwErr){ err.textContent = pwErr; err.classList.add('show'); return; }
    if (password !== confirm){ err.textContent='Passwords do not match.'; err.classList.add('show'); return; }

    const users = DB.getUsers();
    if (users.some(u => u.email === email)){ err.textContent='An account with that email already exists.'; err.classList.add('show'); return; }

    let warehouseId = null;
    if (role === 'owner'){
      warehouseId = formVal(form, 'warehouseId');
      if (!warehouseId){ err.textContent='Please select the warehouse you own.'; err.classList.add('show'); return; }
      const taken = users.some(u => u.role === 'owner' && u.warehouseId === warehouseId);
      if (taken){ err.textContent='That warehouse already has an owner.'; err.classList.add('show'); return; }
    }

    const newUser = {
      id: uid('u'), name, email, phone,
      password: hashPassword(password),
      role, warehouseId,
      createdAt: Date.now()
    };
    users.push(newUser);
    DB.saveUsers(users);
    DB.setSession({ userId: newUser.id, createdAt: Date.now() });
    toast(`Account created. Welcome, ${name.split(' ')[0]}!`);

    if (role === 'owner') Router.go('owner');
    else                  Router.go('dashboard');
  });

  const signupPw = $('#signupForm').querySelector('input[name="password"]');
  const strength = $('#pwStrength');
  if (signupPw && strength){
    signupPw.addEventListener('input', () => {
      const v = signupPw.value;
      let score = 0;
      if (v.length >= 8) score++;
      if (/[A-Z]/.test(v)) score++;
      if (/[0-9]/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v)) score++;
      strength.className = 'pw-strength ' + (score <= 1 ? 'weak' : score <= 3 ? 'medium' : 'strong');
    });
  }
}

/* =========================================================
   WAREHOUSES
   ========================================================= */
const WHState = { search:'', region:'', sort:'recommended', compare:[], showFavorites:false };

function initWarehousesView(){
  const regionSel = $('#regionFilter');
  if (!regionSel.options.length || regionSel.options.length === 1){
    regionSel.innerHTML = '<option value="">All regions</option>' +
      REGIONS.map(r => `<option value="${r}">${r}</option>`).join('');
  }
  renderWarehouses();
  renderCompareTray();
  updateFavCount();

  if (!window._whBound){
    window._whBound = true;
    $('#searchInput').addEventListener('input', e => { WHState.search = e.target.value.toLowerCase(); renderWarehouses(); });
    regionSel.addEventListener('change', e => { WHState.region = e.target.value; renderWarehouses(); });
    $('#sortFilter').addEventListener('change', e => { WHState.sort = e.target.value; renderWarehouses(); });
    $('#clearFiltersBtn').addEventListener('click', () => {
      WHState.search=''; WHState.region=''; WHState.sort='recommended'; WHState.showFavorites=false;
      $('#searchInput').value=''; $('#regionFilter').value=''; $('#sortFilter').value='recommended';
      $('#favoritesToggle').classList.remove('active');
      renderWarehouses(); updateFavCount();
    });
    $('#favoritesToggle').addEventListener('click', () => {
      WHState.showFavorites = !WHState.showFavorites;
      $('#favoritesToggle').classList.toggle('active', WHState.showFavorites);
      renderWarehouses();
    });
  }
}

/* ---------- FAVORITES (per-user) ---------- */
function getUserFavorites(){
  const user = DB.currentUser();
  if (!user) return [];
  const all = DB.getFavorites();
  if (Array.isArray(all)) return []; // discard legacy shared format
  return all[user.id] || [];
}

function saveUserFavorites(list){
  const user = DB.currentUser();
  if (!user) return;
  const all = DB.getFavorites();
  const map = Array.isArray(all) ? {} : all;
  map[user.id] = list;
  DB.saveFavorites(map);
}

function isFavorite(id){ return getUserFavorites().includes(id); }

function toggleFavorite(id){
  let favs = getUserFavorites();
  if (favs.includes(id)) favs = favs.filter(x => x !== id);
  else favs.push(id);
  saveUserFavorites(favs);
  updateFavCount();
  renderWarehouses();
  toast(favs.includes(id) ? 'Added to favorites ❤️' : 'Removed from favorites');
}

function updateFavCount(){
  const el = $('#favCount'); if (el) el.textContent = getUserFavorites().length;
}

function averageRating(w){
  const revs = DB.getReviews()[w.id] || [];
  if (!revs.length) return w.rating;
  const avg = revs.reduce((s,r)=>s+r.rating,0) / revs.length;
  return Math.round((avg + w.rating) / 2 * 10) / 10;
}

function renderWarehouses(){
  const user = DB.currentUser();
  const isOwner = user?.role === 'owner';
  const myWarehouseId = isOwner ? user.warehouseId : null;

  let list = [...WAREHOUSES];
  if (WHState.showFavorites) list = list.filter(w => isFavorite(w.id));
  if (WHState.search){
    list = list.filter(w =>
      w.name.toLowerCase().includes(WHState.search) ||
      w.region.toLowerCase().includes(WHState.search) ||
      w.city.toLowerCase().includes(WHState.search));
  }
  if (WHState.region) list = list.filter(w => w.region === WHState.region);
  if (WHState.sort === 'price-asc')     list.sort((a,b)=>a.price-b.price);
  if (WHState.sort === 'price-desc')    list.sort((a,b)=>b.price-a.price);
  if (WHState.sort === 'capacity-desc') list.sort((a,b)=>b.capacity-a.capacity);
  if (WHState.sort === 'rating-desc')   list.sort((a,b)=>averageRating(b)-averageRating(a));

  const grid = $('#warehouseGrid');
  const noRes = $('#noResults');
  if (!list.length){ grid.innerHTML=''; noRes.classList.remove('hidden'); return; }
  noRes.classList.add('hidden');

  grid.innerHTML = list.map(w => {
    const selected = WHState.compare.includes(w.id);
    const fav = isFavorite(w.id);
    const avg = averageRating(w);
    const mine = w.id === myWarehouseId;
    const canBook = !user || user.role === 'farmer';
    const bookBtn = isOwner
      ? (mine
          ? `<button class="btn btn-primary" data-view="owner"><i class="fa-solid fa-gauge-high"></i> Manage</button>`
          : `<button class="btn btn-outline" disabled><i class="fa-solid fa-lock"></i> Owners can't book</button>`)
      : canBook
        ? `<button class="btn btn-primary" data-book="${w.id}"><i class="fa-solid fa-calendar-check"></i> Book</button>`
        : `<button class="btn btn-outline" disabled><i class="fa-solid fa-lock"></i> Sign in as farmer</button>`;
    return `
      <article class="wh-card">
        <div class="wh-media" style="background-image:url('${w.image}')">
          ${mine
            ? `<span class="wh-badge owner"><i class="fa-solid fa-crown"></i> Your warehouse</span>`
            : `<span class="wh-badge"><i class="fa-solid fa-circle-check"></i> Verified</span>`}
          <div class="wh-actions-top">
            <button class="wh-icon-btn heart ${fav?'active':''}" data-fav="${w.id}" title="Favorite">
              <i class="fa-${fav?'solid':'regular'} fa-heart"></i>
            </button>
            <button class="wh-icon-btn ${selected?'active':''}" data-compare="${w.id}" title="Compare">
              <i class="fa-solid ${selected?'fa-check':'fa-plus'}"></i>
            </button>
          </div>
        </div>
        <div class="wh-body">
          <h3 class="wh-title">${esc(w.name)}</h3>
          <div class="wh-loc"><i class="fa-solid fa-location-dot"></i> ${esc(w.city)}, ${esc(w.region)}</div>
          <div class="wh-price">${fmtGHS(w.price)} <small>${w.unit}</small></div>
          <div class="wh-meta">
            <span class="rating"><i class="fa-solid fa-star"></i> ${avg}</span>
            <span><i class="fa-solid fa-box"></i> ${w.capacity.toLocaleString()} t</span>
          </div>
          <div class="wh-features">${w.features.slice(0,3).map(f=>`<span>${esc(f)}</span>`).join('')}</div>
          <div class="wh-footer">
            ${bookBtn}
            <button class="btn btn-outline btn-details" data-detail-wh="${w.id}" title="Details"><i class="fa-solid fa-circle-info"></i></button>
          </div>
        </div>
      </article>`;
  }).join('');

  $$('[data-fav]').forEach(b => b.addEventListener('click', () => toggleFavorite(b.dataset.fav)));
  $$('[data-compare]').forEach(b => b.addEventListener('click', () => toggleCompare(b.dataset.compare)));
  $$('[data-book]').forEach(b => b.addEventListener('click', () => openBookingModal(b.dataset.book)));
  $$('[data-detail-wh]').forEach(b => b.addEventListener('click', () => openWarehouseDetail(b.dataset.detailWh)));
}

function toggleCompare(id){
  const i = WHState.compare.indexOf(id);
  if (i >= 0) WHState.compare.splice(i,1);
  else {
    if (WHState.compare.length >= 3){ toast('You can compare up to 3 warehouses','error'); return; }
    WHState.compare.push(id);
  }
  renderWarehouses();
  renderCompareTray();
}

function renderCompareTray(){
  const tray = $('#compareTray');
  if (!WHState.compare.length){ tray.classList.add('hidden'); return; }
  tray.classList.remove('hidden');
  const chips = WHState.compare.map(id => {
    const w = WAREHOUSES.find(x=>x.id===id);
    return `<span class="compare-chip">${esc(w.name)} <button data-rm="${id}"><i class="fa-solid fa-xmark"></i></button></span>`;
  }).join('');
  tray.innerHTML = `
    <div class="compare-chips">${chips}</div>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
      <span style="font-size:.82rem;color:var(--muted)">${WHState.compare.length} selected</span>
      <button class="btn btn-secondary" id="openCompareBtn"><i class="fa-solid fa-scale-balanced"></i> Compare</button>
      <button class="btn btn-ghost" id="clearCompareBtn"><i class="fa-solid fa-eraser"></i> Clear</button>
    </div>`;
  $$('[data-rm]').forEach(b => b.addEventListener('click', () => toggleCompare(b.dataset.rm)));
  $('#openCompareBtn').addEventListener('click', openCompareModal);
  $('#clearCompareBtn').addEventListener('click', () => { WHState.compare=[]; renderWarehouses(); renderCompareTray(); });
}

function openCompareModal(){
  const items = WHState.compare.map(id => WAREHOUSES.find(w=>w.id===id));
  const star = '<i class="fa-solid fa-star" style="color:var(--gold-500)"></i>';
  const rows = [
    { label:'Location', fn:w => `${esc(w.city)}, ${esc(w.region)}` },
    { label:'Price',    fn:w => `${fmtGHS(w.price)} <small style="color:var(--muted);font-weight:500">${w.unit}</small>` },
    { label:'Capacity', fn:w => `${w.capacity.toLocaleString()} tonnes` },
    { label:'Rating',   fn:w => `${averageRating(w)} ${star}` },
    { label:'Features', fn:w => w.features.map(esc).join(', ') }
  ];
  const head = items.map(w => `<th class="wh-name">${esc(w.name)}</th>`).join('');
  const body = rows.map(r => `<tr><td>${r.label}</td>${items.map(w=>`<td>${r.fn(w)}</td>`).join('')}</tr>`).join('');
  $('#compareBody').innerHTML = `<div style="overflow-x:auto"><table class="compare-table"><thead><tr><th></th>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  openModal('compareModal');
}

/* ---------- WAREHOUSE DETAIL ---------- */
function openWarehouseDetail(id){
  const w = WAREHOUSES.find(x=>x.id===id);
  if (!w) return;
  const reviews = DB.getReviews()[w.id] || [];
  const avg = averageRating(w);
  const user = DB.currentUser();

  const starFA = '<i class="fa-solid fa-star"></i>';
  const starEmptyFA = '<i class="fa-regular fa-star"></i>';
  const reviewList = reviews.length
    ? reviews.map(r => `
      <div class="review-item">
        <div class="review-head">
          <strong>${esc(r.user)}</strong>
          <span class="stars-display">${starFA.repeat(r.rating)}${starEmptyFA.repeat(5-r.rating)}</span>
          <small>${fmtDate(new Date(r.date).toISOString())}</small>
        </div>
        <p style="font-size:.85rem;color:var(--muted)">${esc(r.comment)}</p>
      </div>`).join('')
    : `<p style="color:var(--muted);font-size:.85rem">No reviews yet. Be the first to review this warehouse.</p>`;

  const [lat, lng] = w.coords, d = 0.05;
  const bbox = [lng-d, lat-d, lng+d, lat+d].join('%2C');
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;

  const reviewFormHTML = user && user.role === 'farmer'
    ? `<form id="reviewForm" class="form" style="margin-top:12px">
         <div class="stars-input" id="starsInput" data-value="0">
           ${[1,2,3,4,5].map(i=>`<i class="fa-solid fa-star" data-star="${i}"></i>`).join('')}
         </div>
         <label class="field"><span>Your review</span><textarea name="comment" rows="2" placeholder="Share your experience…" required></textarea></label>
         <div class="auth-error" id="reviewError"></div>
         <button type="submit" class="btn btn-primary"><i class="fa-solid fa-paper-plane"></i> Post review</button>
       </form>`
    : user
      ? `<p style="color:var(--muted);font-size:.85rem">Only farmers can post reviews.</p>`
      : `<p style="color:var(--muted);font-size:.85rem"><a href="#" data-view="auth" data-tab="login" style="color:var(--green-700);font-weight:700">Sign in</a> to leave a review.</p>`;

  $('#detailTitle').innerHTML = `<i class="fa-solid fa-warehouse"></i> ${esc(w.name)}`;
  $('#detailContent').innerHTML = `
    <div class="detail-hero" style="background-image:url('${w.image}')"></div>
    <div class="detail-grid">
      <div class="detail-item"><small>Location</small><strong>${esc(w.city)}, ${esc(w.region)}</strong></div>
      <div class="detail-item"><small>Price</small><strong>${fmtGHS(w.price)} ${w.unit}</strong></div>
      <div class="detail-item"><small>Capacity</small><strong>${w.capacity.toLocaleString()} tonnes</strong></div>
      <div class="detail-item"><small>Rating</small><strong>${avg} ${starFA} (${reviews.length} review${reviews.length!==1?'s':''})</strong></div>
    </div>
    <div class="detail-section">
      <h4>Features</h4>
      <div class="wh-features">${w.features.map(f=>`<span>${esc(f)}</span>`).join('')}</div>
    </div>
    <div class="detail-section">
      <h4>Location map</h4>
      <div class="map-wrap"><iframe src="${mapUrl}" loading="lazy"></iframe></div>
    </div>
    <div class="detail-section">
      <h4>Reviews</h4>
      ${reviewList}
      ${reviewFormHTML}
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;flex-wrap:wrap">
      <button class="btn btn-outline" data-close="warehouseDetailModal"><i class="fa-solid fa-xmark"></i> Close</button>
      ${user?.role === 'farmer' ? `<button class="btn btn-primary" id="detailBookBtn"><i class="fa-solid fa-calendar-check"></i> Book this warehouse</button>` : ''}
    </div>`;

  if (user && user.role === 'farmer'){
    const stars = $$('#starsInput i');
    stars.forEach(s => s.addEventListener('click', () => {
      const val = Number(s.dataset.star);
      $('#starsInput').dataset.value = val;
      stars.forEach(x => x.classList.toggle('active', Number(x.dataset.star) <= val));
    }));
    $('#reviewForm').addEventListener('submit', e => {
      e.preventDefault();
      const err = $('#reviewError'); err.classList.remove('show');
      const rating = Number($('#starsInput').dataset.value);
      const comment = formVal(e.target, 'comment').trim();
      if (!rating){ err.textContent='Please select a star rating.'; err.classList.add('show'); return; }
      if (!comment){ err.textContent='Please write a short review.'; err.classList.add('show'); return; }
      const all = DB.getReviews();
      if (!all[w.id]) all[w.id] = [];
      all[w.id].unshift({ id: uid('r'), user: user.name, rating, comment, date: Date.now() });
      DB.saveReviews(all);
      toast('Review posted. Thank you!');
      renderWarehouses();
      openWarehouseDetail(w.id);
    });
    const bookBtn = $('#detailBookBtn');
    if (bookBtn) bookBtn.addEventListener('click', () => { closeModal('warehouseDetailModal'); openBookingModal(w.id); });
  }

  openModal('warehouseDetailModal');
}

/* ---------- BOOKING MODAL ---------- */
let activeBookingWH = null;

function openBookingModal(id){
  const user = DB.currentUser();
  if (!user){ toast('Please sign in to book','error'); Router.go('auth', { tab:'login' }); return; }
  if (user.role !== 'farmer'){ toast('Only farmers can book warehouses','error'); return; }
  const w = WAREHOUSES.find(x=>x.id===id);
  if (!w) return;
  activeBookingWH = w;

  $('#bookingTitle').innerHTML = `<i class="fa-solid fa-calendar-check"></i> Book — ${esc(w.name)}`;
  $('#bookingSummary').innerHTML = `
    <strong>${esc(w.name)}</strong> · ${esc(w.city)}, ${esc(w.region)}<br>
    <span style="color:var(--muted)">${fmtGHS(w.price)} ${w.unit} · ${w.capacity.toLocaleString()} t capacity</span>`;
  const form = $('#bookingForm');
  form.reset();
  const startEl = form.elements.namedItem('startDate');
  const endEl   = form.elements.namedItem('endDate');
  const qtyEl   = form.elements.namedItem('qty');
  const today   = todayISO();
  startEl.value = today;
  startEl.min   = today;
  endEl.value   = today;
  endEl.min     = today;
  qtyEl.max     = w.capacity;
  $('#bookingError').classList.remove('show');
  updateEstimate();
  openModal('bookingModal');
}

function updateEstimate(){
  const w = activeBookingWH; const form = $('#bookingForm');
  if (!w || !form) return;

  const qty     = Number(formVal(form, 'qty')) || 0;
  const start   = formVal(form, 'startDate');
  const end     = formVal(form, 'endDate');
  const months  = monthsBetween(start, end);
  const total   = w.price * qty * months;
  const el      = $('#bookingEstimate');
  if (!el) return;

  if (!qty){ el.textContent = ''; return; }

  if (qty > w.capacity){
    el.innerHTML = `<span style="color:var(--danger)"><i class="fa-solid fa-circle-exclamation"></i> Max capacity: ${w.capacity.toLocaleString()} t</span>`;
    return;
  }
  el.textContent = `Estimate: ${fmtGHS(total)} for ${months} month(s)`;
}

function initBookingHandlers(){
  const form = $('#bookingForm');
  form.addEventListener('input', updateEstimate);
  form.elements.namedItem('startDate').addEventListener('change', () => {
    const startEl = form.elements.namedItem('startDate');
    const endEl   = form.elements.namedItem('endDate');
    endEl.min = startEl.value;
    if (endEl.value && endEl.value < startEl.value){
      endEl.value = startEl.value;
    }
    updateEstimate();
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const user = DB.currentUser();
    if (!user || user.role !== 'farmer'){ toast('Only farmers can book','error'); return; }
    const err = $('#bookingError'); err.classList.remove('show');
    const start = formVal(form, 'startDate');
    const end   = formVal(form, 'endDate');
    const qty   = Number(formVal(form, 'qty'));
    if (!start || !end){ err.textContent='Please select dates.'; err.classList.add('show'); return; }
    if (start < todayISO()){ err.textContent='Start date cannot be in the past.'; err.classList.add('show'); return; }
    if (new Date(end) < new Date(start)){ err.textContent='End date must be after start date.'; err.classList.add('show'); return; }
    if (!qty || qty < 1){ err.textContent='Quantity must be at least 1 tonne.'; err.classList.add('show'); return; }
    if (qty > activeBookingWH.capacity){ err.textContent=`This warehouse holds a maximum of ${activeBookingWH.capacity} tonnes.`; err.classList.add('show'); return; }

    const months = monthsBetween(start,end);
    const total  = activeBookingWH.price * qty * months;

    const bookings = DB.getBookings();
    bookings.unshift({
      id: uid('bk'),
      ref: 'AG-' + Date.now().toString(36).toUpperCase().slice(-6),
      userId: user.id, userName: user.name, userEmail: user.email, userPhone: user.phone,
      warehouseId: activeBookingWH.id, warehouseName: activeBookingWH.name, region: activeBookingWH.region,
      price: activeBookingWH.price, qty, months, total,
      startDate: start, endDate: end,
      crop:  formVal(form, 'crop'),
      notes: formVal(form, 'notes').trim(),
      status: 'pending', history: [{ status:'pending', at: Date.now() }], createdAt: Date.now()
    });
    DB.saveBookings(bookings);
    closeModal('bookingModal');
    toast(`Booking request sent to ${activeBookingWH.name}!`);
    if (Router.currentView === 'dashboard') initDashboardView({ keepTab: true });
  });
}

/* =========================================================
   FARMER DASHBOARD
   ========================================================= */
let dashFilter = 'all';
let currentDashTab = 'overview';

function activateDashTab(tab){
  currentDashTab = tab;
  $$('#view-dashboard .dash-link[data-dashtab]').forEach(l => l.classList.toggle('active', l.dataset.dashtab === tab));
  $$('#view-dashboard .dash-panel').forEach(p => p.classList.add('hidden'));
  $('#dash-' + tab)?.classList.remove('hidden');
}

function initDashboardView(opts = {}){
  const user = DB.currentUser();
  if (!user || user.role !== 'farmer') return;
  $('#userName').textContent = user.name;
  $('#userEmail').textContent = user.email;
  $('#userAvatar').textContent = initials(user.name);
  $('#firstName').textContent = user.name.split(' ')[0];

  activateDashTab(opts.keepTab ? currentDashTab : 'overview');

  renderDashboardStats();
  renderRecentBookings();
  renderAllBookings();

  if (!window._dashBound){
    window._dashBound = true;
    $$('#view-dashboard [data-dashtab]').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        activateDashTab(el.dataset.dashtab);
      });
    });
    $$('#trackerTabs .tab').forEach(t => {
      t.addEventListener('click', () => {
        $$('#trackerTabs .tab').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        dashFilter = t.dataset.filter;
        renderAllBookings();
      });
    });
    $('#logoutBtn').addEventListener('click', doLogout);
    $('#profileForm').addEventListener('submit', handleProfileUpdate);
    $('#passwordForm').addEventListener('submit', handlePasswordChange);
  }

  const pf = $('#profileForm');
  pf.elements.namedItem('name').value  = user.name;
  pf.elements.namedItem('email').value = user.email;
  pf.elements.namedItem('phone').value = user.phone;
}

function renderDashboardStats(){
  const user = DB.currentUser();
  const bookings = DB.getBookings().filter(b => b.userId === user.id);
  const pending = bookings.filter(b => b.status === 'pending').length;
  const active = bookings.filter(b => ['confirmed','stored'].includes(b.status)).length;
  const value = bookings.reduce((s,b) => s + (b.total||0), 0);

  $('#userStatGrid').innerHTML = `
    <div class="stat-card"><div class="stat-icon"><i class="fa-solid fa-clipboard-list"></i></div><div class="stat-label">Total bookings</div><div class="stat-value">${bookings.length}</div></div>
    <div class="stat-card"><div class="stat-icon gold"><i class="fa-solid fa-hourglass-half"></i></div><div class="stat-label">Pending</div><div class="stat-value">${pending}</div></div>
    <div class="stat-card"><div class="stat-icon blue"><i class="fa-solid fa-warehouse"></i></div><div class="stat-label">Active storage</div><div class="stat-value">${active}</div></div>
    <div class="stat-card"><div class="stat-icon purple"><i class="fa-solid fa-coins"></i></div><div class="stat-label">Total value</div><div class="stat-value" style="font-size:1.4rem">${fmtGHS(value)}</div></div>`;
}

function renderRecentBookings(){
  const user = DB.currentUser();
  const bookings = DB.getBookings().filter(b => b.userId === user.id).slice(0,3);
  const el = $('#recentBookings');
  if (!bookings.length){
    el.innerHTML = `<div class="empty-state" style="padding:36px 20px"><i class="fa-solid fa-clipboard-list"></i><h3>No bookings yet</h3><p>Your recent bookings will show here.</p></div>`;
    return;
  }
  el.innerHTML = bookings.map(b => bookingRowHTML(b)).join('');
  bindBookingActions();
}

function renderAllBookings(){
  const user = DB.currentUser();
  let list = DB.getBookings().filter(b => b.userId === user.id);
  if (dashFilter !== 'all') list = list.filter(b => b.status === dashFilter);
  const el = $('#allBookings'); const empty = $('#noBookings');
  if (!list.length){ el.innerHTML=''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  el.innerHTML = list.map(b => bookingRowHTML(b)).join('');
  bindBookingActions();
}

function bookingRowHTML(b){
  return `
    <div class="booking-row">
      <div class="booking-left">
        <div class="booking-icon"><i class="fa-solid fa-warehouse"></i></div>
        <div class="booking-info">
          <strong>${esc(b.warehouseName)}</strong>
          <small>${esc(b.region)} · ${b.qty} tonnes · ${fmtDate(b.startDate)} → ${fmtDate(b.endDate)}</small>
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        ${statusBadge(b.status)}
        <button class="btn btn-ghost" data-detail="${b.id}"><i class="fa-solid fa-receipt"></i> Details</button>
        ${b.status==='pending' ? `<button class="btn btn-ghost" data-cancel="${b.id}" style="color:var(--danger)"><i class="fa-solid fa-xmark"></i> Cancel</button>` : ''}
      </div>
    </div>`;
}

function bindBookingActions(){
  $$('[data-detail]').forEach(b => {
    if (b.dataset.bound) return; b.dataset.bound='1';
    b.addEventListener('click', () => openBookingDetail(b.dataset.detail));
  });
  $$('[data-cancel]').forEach(b => {
    if (b.dataset.bound) return; b.dataset.bound='1';
    b.addEventListener('click', () => {
      if (!confirm('Cancel this booking?')) return;
      const bookings = DB.getBookings();
      const bk = bookings.find(x=>x.id===b.dataset.cancel);
      if (!bk) return;
      bk.status = 'cancelled';
      bk.history.push({ status:'cancelled', at: Date.now() });
      DB.saveBookings(bookings);
      toast('Booking cancelled');
      initDashboardView({ keepTab: true });
    });
  });
}

function statusBadge(status){
  const map = {
    pending:   { label:'Pending',   icon:'fa-hourglass-half', cls:'status-pending' },
    confirmed: { label:'Confirmed', icon:'fa-circle-check',   cls:'status-confirmed' },
    stored:    { label:'Stored',    icon:'fa-warehouse',      cls:'status-stored' },
    released:  { label:'Released',  icon:'fa-truck',          cls:'status-released' },
    cancelled: { label:'Cancelled', icon:'fa-circle-xmark',   cls:'status-cancelled' }
  };
  const s = map[status] || map.pending;
  return `<span class="status-badge ${s.cls}"><i class="fa-solid ${s.icon}"></i> ${s.label}</span>`;
}

function openBookingDetail(id){
  const b = DB.getBookings().find(x => x.id === id);
  if (!b) return;
  const viewer = DB.currentUser();
  const showFarmer = viewer?.role === 'owner' || viewer?.role === 'admin';
  const steps = ['pending','confirmed','stored','released'];
  const cancelled = b.status === 'cancelled';
  const idx = cancelled ? -1 : steps.indexOf(b.status);
  const timeline = steps.map((s,i) => {
    const done = !cancelled && i <= idx;
    const active = !cancelled && i === idx;
    return `<div class="tl-item ${done?'done':''} ${active?'active':''}"><strong>${s.charAt(0).toUpperCase()+s.slice(1)}</strong><small>${done?'Completed':(active?'In progress':'Pending')}</small></div>`;
  }).join('');
  const cancelRow = cancelled ? `<div class="tl-item active"><strong style="color:var(--danger)">Cancelled</strong><small>This booking was cancelled</small></div>` : '';

  const farmerSection = showFarmer ? `
    <div class="detail-section">
      <h4>Farmer contact</h4>
      <div class="detail-grid">
        <div class="detail-item"><small>Name</small><strong>${esc(b.userName)}</strong></div>
        <div class="detail-item"><small>Email</small><strong>${esc(b.userEmail)}</strong></div>
        <div class="detail-item"><small>Phone</small><strong>${esc(b.userPhone)}</strong></div>
      </div>
    </div>` : '';

  $('#detailBody').innerHTML = `
    ${farmerSection}
    <div class="detail-grid">
      <div class="detail-item"><small>Reference</small><strong>${b.ref}</strong></div>
      <div class="detail-item"><small>Status</small><strong>${statusBadge(b.status)}</strong></div>
      <div class="detail-item"><small>Warehouse</small><strong>${esc(b.warehouseName)}</strong></div>
      <div class="detail-item"><small>Region</small><strong>${esc(b.region)}</strong></div>
      <div class="detail-item"><small>Quantity</small><strong>${b.qty} tonnes</strong></div>
      <div class="detail-item"><small>Crop</small><strong>${esc(b.crop)}</strong></div>
      <div class="detail-item"><small>Start date</small><strong>${fmtDate(b.startDate)}</strong></div>
      <div class="detail-item"><small>End date</small><strong>${fmtDate(b.endDate)}</strong></div>
      <div class="detail-item"><small>Duration</small><strong>${b.months} month(s)</strong></div>
      <div class="detail-item"><small>Total estimate</small><strong>${fmtGHS(b.total)}</strong></div>
    </div>
    ${b.notes ? `<div class="detail-item" style="margin-bottom:16px"><small>Notes</small><strong>${esc(b.notes)}</strong></div>` : ''}
    <h4 style="margin:20px 0 4px;font-size:.9rem;text-transform:uppercase;letter-spacing:.4px;color:var(--muted)">Progress</h4>
    <div class="timeline">${timeline}${cancelRow}</div>`;
  openModal('detailModal');
}

function handleProfileUpdate(e){
  e.preventDefault();
  const user = DB.currentUser(); if (!user) return;
  const form = e.target;
  const err = form.querySelector('.auth-error'); err.classList.remove('show');
  const name  = formVal(form, 'name').trim();
  const phone = formVal(form, 'phone').trim();
  if (name.length < 2){ err.textContent='Name too short.'; err.classList.add('show'); return; }
  if (phone.length < 7){ err.textContent='Please enter a valid phone.'; err.classList.add('show'); return; }
  const users = DB.getUsers();
  const u = users.find(x => x.id === user.id);
  if (!u) return;
  u.name = name; u.phone = phone;
  DB.saveUsers(users);
  toast('Profile updated');
  if (user.role === 'owner'){
    $('#ownerAvatar').textContent = initials(name);
    $('#ownerName').textContent = name;
    $('#ownerFirstName').textContent = name.split(' ')[0];
  } else {
    $('#userAvatar').textContent = initials(name);
    $('#userName').textContent = name;
    $('#firstName').textContent = name.split(' ')[0];
  }
  updateNav();
}

function handlePasswordChange(e){
  e.preventDefault();
  const user = DB.currentUser(); if (!user) return;
  const form = e.target;
  const err = form.querySelector('.auth-error'); err.classList.remove('show');
  const current = formVal(form, 'current');
  const newPass = formVal(form, 'newPass');
  const confirmPass = formVal(form, 'confirmPass');
  if (user.password !== hashPassword(current)){ err.textContent='Current password is incorrect.'; err.classList.add('show'); return; }
  const pwErr = validatePassword(newPass);
  if (pwErr){ err.textContent = pwErr; err.classList.add('show'); return; }
  if (newPass !== confirmPass){ err.textContent='New passwords do not match.'; err.classList.add('show'); return; }
  const users = DB.getUsers();
  const u = users.find(x => x.id === user.id);
  u.password = hashPassword(newPass);
  DB.saveUsers(users);
  form.reset();
  toast('Password updated');
}

/* =========================================================
   OWNER DASHBOARD
   ========================================================= */
function ownerBookings(){
  const user = DB.currentUser();
  if (!user || user.role !== 'owner') return [];
  return DB.getBookings().filter(b => b.warehouseId === user.warehouseId);
}

let currentOwnerTab = 'overview';

function activateOwnerTab(tab){
  currentOwnerTab = tab;
  $$('#view-owner .dash-link').forEach(l => l.classList.toggle('active', l.dataset.ownertab === tab));
  $$('#view-owner .dash-panel').forEach(p => p.classList.add('hidden'));
  $('#owner-' + tab)?.classList.remove('hidden');
}

function initOwnerView(opts = {}){
  const user = DB.currentUser();
  if (!user || user.role !== 'owner') return;

  const wh = WAREHOUSES.find(w => w.id === user.warehouseId);
  $('#ownerAvatar').textContent = initials(user.name);
  $('#ownerName').textContent = user.name;
  $('#ownerEmail').textContent = user.email;
  $('#ownerFirstName').textContent = user.name.split(' ')[0];
  $('#ownerWarehouseName').textContent = wh ? wh.name : '—';

  activateOwnerTab(opts.keepTab ? currentOwnerTab : 'overview');

  renderOwnerStats();
  renderOwnerRecentTable();
  renderOwnerBookingsTable();

  const pf = $('#ownerProfileForm');
  if (pf){
    pf.elements.namedItem('name').value      = user.name;
    pf.elements.namedItem('email').value     = user.email;
    pf.elements.namedItem('phone').value     = user.phone;
    pf.elements.namedItem('warehouse').value = wh ? `${wh.name} — ${wh.city}` : '—';
  }

  if (!window._ownerBound){
    window._ownerBound = true;
    $$('#view-owner [data-ownertab]').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        activateOwnerTab(el.dataset.ownertab);
      });
    });
    $('#logoutBtnOwner').addEventListener('click', doLogout);
    $('#ownerProfileForm').addEventListener('submit', handleProfileUpdate);
    $('#ownerPasswordForm').addEventListener('submit', handlePasswordChange);
  }
}

function renderOwnerStats(){
  const bookings = ownerBookings();
  const pending = bookings.filter(b => b.status === 'pending').length;
  const stored = bookings.filter(b => b.status === 'stored').length;
  const revenue = bookings.filter(b => ['confirmed','stored','released'].includes(b.status)).reduce((s,b)=>s+(b.total||0),0);

  $('#ownerStatGrid').innerHTML = `
    <div class="stat-card"><div class="stat-icon"><i class="fa-solid fa-clipboard-list"></i></div><div class="stat-label">Total bookings</div><div class="stat-value">${bookings.length}</div></div>
    <div class="stat-card"><div class="stat-icon gold"><i class="fa-solid fa-hourglass-half"></i></div><div class="stat-label">Pending approval</div><div class="stat-value">${pending}</div></div>
    <div class="stat-card"><div class="stat-icon blue"><i class="fa-solid fa-warehouse"></i></div><div class="stat-label">Currently stored</div><div class="stat-value">${stored}</div></div>
    <div class="stat-card"><div class="stat-icon purple"><i class="fa-solid fa-coins"></i></div><div class="stat-label">Revenue</div><div class="stat-value" style="font-size:1.4rem">${fmtGHS(revenue)}</div></div>`;
}

function renderOwnerRecentTable(){
  const recent = ownerBookings().slice(0,5);
  const t = $('#ownerRecentTable');
  if (!recent.length){ t.innerHTML = `<tr><td style="text-align:center;padding:36px;color:var(--muted)">No bookings yet</td></tr>`; return; }
  t.innerHTML = `<thead><tr><th>Ref</th><th>Farmer</th><th>Crop</th><th>Qty</th><th>Status</th></tr></thead>
    <tbody>${recent.map(b=>`<tr>
      <td class="ref">${b.ref}</td>
      <td><strong>${esc(b.userName)}</strong><div class="farmer-contact">${esc(b.userPhone)}</div></td>
      <td>${esc(b.crop)}</td>
      <td>${b.qty} t</td>
      <td>${statusBadge(b.status)}</td>
    </tr>`).join('')}</tbody>`;
}

function renderOwnerBookingsTable(){
  const bookings = ownerBookings();
  const t = $('#ownerBookingsTable'); const empty = $('#ownerNoBookings');
  if (!bookings.length){ t.innerHTML=''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  t.innerHTML = `<thead><tr><th>Ref</th><th>Farmer (contact)</th><th>Crop / Qty</th><th>Dates</th><th>Value</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>${bookings.map(b=>`<tr>
      <td class="ref">${b.ref}</td>
      <td>
        <strong>${esc(b.userName)}</strong>
        <div class="farmer-contact">
          <span><i class="fa-solid fa-envelope"></i> ${esc(b.userEmail)}</span>
          <span><i class="fa-solid fa-phone"></i> ${esc(b.userPhone)}</span>
        </div>
      </td>
      <td><strong>${esc(b.crop)}</strong><br><small style="color:var(--muted);font-size:.75rem">${b.qty} tonnes</small></td>
      <td style="font-size:.78rem">${fmtDate(b.startDate)}<br>→ ${fmtDate(b.endDate)}</td>
      <td><strong>${fmtGHS(b.total)}</strong></td>
      <td>${statusBadge(b.status)}</td>
      <td>
        <select data-ostatus="${b.id}">
          <option value="pending" ${b.status==='pending'?'selected':''}>Pending</option>
          <option value="confirmed" ${b.status==='confirmed'?'selected':''}>Confirm</option>
          <option value="stored" ${b.status==='stored'?'selected':''}>Mark stored</option>
          <option value="released" ${b.status==='released'?'selected':''}>Release</option>
          <option value="cancelled" ${b.status==='cancelled'?'selected':''}>Cancel</option>
        </select>
        <button class="btn btn-ghost" data-detail="${b.id}" style="margin-top:6px;font-size:.75rem;padding:4px 10px"><i class="fa-solid fa-receipt"></i> View</button>
      </td>
    </tr>`).join('')}</tbody>`;
  $$('[data-ostatus]').forEach(sel => {
    sel.addEventListener('change', () => {
      const bookings = DB.getBookings();
      const b = bookings.find(x=>x.id===sel.dataset.ostatus);
      if (!b) return;
      b.status = sel.value;
      b.history.push({ status: sel.value, at: Date.now() });
      DB.saveBookings(bookings);
      toast(`Booking ${b.ref}: ${sel.value}`);
      initOwnerView({ keepTab: true });
    });
  });
  bindBookingActions();
}

/* =========================================================
   ADMIN
   ========================================================= */
let currentAdminTab = 'overview';

function activateAdminTab(tab){
  currentAdminTab = tab;
  $$('#view-admin .dash-link').forEach(l => l.classList.toggle('active', l.dataset.admintab === tab));
  $$('#view-admin .dash-panel').forEach(p => p.classList.add('hidden'));
  $('#admin-' + tab)?.classList.remove('hidden');
}

function initAdminView(opts = {}){
  const user = DB.currentUser();
  if (!user || user.role !== 'admin') return;

  // Populate sidebar identity from current admin
  const av = $('#adminAvatar'); if (av) av.textContent = initials(user.name);
  const nm = $('#adminName');   if (nm) nm.textContent = user.name;
  const em = $('#adminEmail');  if (em) em.textContent = user.email;

  renderAdminStats();
  renderAdminRecentTable();
  renderAdminBookingsTable();
  renderAdminUsersTable();

  activateAdminTab(opts.keepTab ? currentAdminTab : 'overview');

  if (!window._adminBound){
    window._adminBound = true;
    $$('#view-admin [data-admintab]').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        activateAdminTab(el.dataset.admintab);
      });
    });
    $('#logoutBtnAdmin')?.addEventListener('click', doLogout);
  }
}

function renderAdminStats(){
  const bookings = DB.getBookings();
  const users = DB.getUsers().filter(u => u.role !== 'admin');
  const farmers = users.filter(u => u.role === 'farmer').length;
  const owners = users.filter(u => u.role === 'owner').length;
  const pending = bookings.filter(b => b.status === 'pending').length;
  const value = bookings.reduce((s,b)=>s+(b.total||0),0);
  $('#adminStatGrid').innerHTML = `
    <div class="stat-card"><div class="stat-icon"><i class="fa-solid fa-clipboard-list"></i></div><div class="stat-label">Bookings</div><div class="stat-value">${bookings.length}</div></div>
    <div class="stat-card"><div class="stat-icon gold"><i class="fa-solid fa-hourglass-half"></i></div><div class="stat-label">Pending</div><div class="stat-value">${pending}</div></div>
    <div class="stat-card"><div class="stat-icon blue"><i class="fa-solid fa-tractor"></i></div><div class="stat-label">Farmers</div><div class="stat-value">${farmers}</div></div>
    <div class="stat-card"><div class="stat-icon purple"><i class="fa-solid fa-warehouse"></i></div><div class="stat-label">Owners</div><div class="stat-value">${owners}</div></div>
    <div class="stat-card"><div class="stat-icon"><i class="fa-solid fa-coins"></i></div><div class="stat-label">Total value</div><div class="stat-value" style="font-size:1.4rem">${fmtGHS(value)}</div></div>`;
}

function renderAdminRecentTable(){
  const recent = DB.getBookings().slice(0,5);
  const t = $('#recentAdminTable');
  if (!recent.length){ t.innerHTML = `<tr><td style="text-align:center;padding:36px;color:var(--muted)">No bookings yet</td></tr>`; return; }
  t.innerHTML = `<thead><tr><th>Ref</th><th>Farmer</th><th>Warehouse</th><th>Qty</th><th>Status</th></tr></thead>
    <tbody>${recent.map(b=>`<tr><td class="ref">${b.ref}</td><td>${esc(b.userName)}</td><td>${esc(b.warehouseName)}</td><td>${b.qty} t</td><td>${statusBadge(b.status)}</td></tr>`).join('')}</tbody>`;
}

function renderAdminBookingsTable(){
  const bookings = DB.getBookings();
  const t = $('#bookingsTable'); const empty = $('#noBookingsAdmin');
  if (!bookings.length){ t.innerHTML=''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  t.innerHTML = `<thead><tr><th>Ref</th><th>Farmer</th><th>Warehouse</th><th>Qty</th><th>Value</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>${bookings.map(b=>`<tr>
      <td class="ref">${b.ref}</td>
      <td><strong>${esc(b.userName)}</strong><br><small style="color:var(--muted);font-size:.75rem">${esc(b.userEmail)}</small></td>
      <td>${esc(b.warehouseName)}</td>
      <td>${b.qty} t</td>
      <td>${fmtGHS(b.total)}</td>
      <td>${statusBadge(b.status)}</td>
      <td><select data-status="${b.id}">
        <option value="pending" ${b.status==='pending'?'selected':''}>Pending</option>
        <option value="confirmed" ${b.status==='confirmed'?'selected':''}>Confirmed</option>
        <option value="stored" ${b.status==='stored'?'selected':''}>Stored</option>
        <option value="released" ${b.status==='released'?'selected':''}>Released</option>
        <option value="cancelled" ${b.status==='cancelled'?'selected':''}>Cancelled</option>
      </select></td>
    </tr>`).join('')}</tbody>`;
  $$('[data-status]').forEach(sel => {
    sel.addEventListener('change', () => {
      const bookings = DB.getBookings();
      const b = bookings.find(x=>x.id===sel.dataset.status);
      if (!b) return;
      b.status = sel.value;
      b.history.push({ status: sel.value, at: Date.now() });
      DB.saveBookings(bookings);
      toast(`Booking ${b.ref}: ${sel.value}`);
      initAdminView({ keepTab: true });
    });
  });
}

function renderAdminUsersTable(){
  const users = DB.getUsers();
  const t = $('#usersTable');
  t.innerHTML = `<thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th></tr></thead>
    <tbody>${users.map(u=>`<tr>
      <td><strong>${esc(u.name)}</strong></td>
      <td>${esc(u.email)}</td>
      <td>${esc(u.phone)}</td>
      <td><span class="role-badge ${u.role}">${u.role}</span></td>
      <td style="font-size:.8rem;color:var(--muted)">${fmtDate(new Date(u.createdAt).toISOString())}</td>
    </tr>`).join('')}</tbody>`;
}

/* =========================================================
   BOOT
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  seedAdmin();
  seedReviews();
  initTheme();
  initModals();
  initAuthHandlers();
  initBookingHandlers();

  $('#hamburger').addEventListener('click', () => $('#navLinks').classList.toggle('open'));
  window.addEventListener('scroll', () => $('#navbar').classList.toggle('scrolled', window.scrollY > 8));
  $('#year').textContent = new Date().getFullYear();

  const user = DB.currentUser();
  if (user) Router.go(user.role === 'admin' ? 'admin' : user.role === 'owner' ? 'owner' : 'dashboard');
  else Router.go('landing');
});