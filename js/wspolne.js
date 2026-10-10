/* ============================================================
   Demokracja Bezpośrednia — wspólny moduł (Firebase)
   ============================================================ */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inicjaly = n => String(n || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?';

  const DB = { $, $$, esc, inicjaly, trybDemo: false, ja: null, adminUid: null, fb: null, auth: null, db: null, gotowe: null };
  window.DB = DB;

  // ---------- diagnostyka konfiguracji ----------
  function problemyKonfiguracji() {
    const p = [];
    if (typeof firebase === 'undefined' || !firebase.initializeApp) p.push('Nie wczytała się biblioteka Firebase (js/vendor).');
    const c = window.FIREBASE_CONFIG || {};
    if (!window.FIREBASE_CONFIG) p.push('Brak pliku config.js.');
    else if (!c.apiKey || String(c.apiKey).indexOf('TWOJ_') === 0) p.push('Nie uzupełniono danych Firebase w config.js.');
    else if (!c.projectId || String(c.projectId).indexOf('TWOJ_') === 0) p.push('Brak projectId w config.js.');
    return p;
  }

  DB.gotowe = (async function init() {
    const probl = problemyKonfiguracji();
    if (probl.length) { DB.trybDemo = true; console.warn('DB: tryb demonstracyjny —', probl.join(' ')); return; }
    firebase.initializeApp(window.FIREBASE_CONFIG);
    DB.fb = firebase; DB.auth = firebase.auth(); DB.db = firebase.firestore();
    await new Promise(res => {
      DB.auth.onAuthStateChanged(async user => {
        if (user) await poZalogowaniuWewn(user); else { DB.ja = null; }
        if (DB._onAuth) DB._onAuth();
        res();
      });
    });
  })();

  async function wczytajConfigApp() {
    try { const s = await DB.db.collection('config').doc('app').get(); DB.adminUid = s.exists ? (s.data().adminUid || '') : ''; }
    catch (e) { DB.adminUid = ''; }
  }

  async function poZalogowaniuWewn(user) {
    await wczytajConfigApp();
    // pierwszy zalogowany przejmuje rolę administratora (gdy wakat)
    if (!DB.adminUid) {
      try {
        await DB.db.collection('config').doc('app').set({ adminUid: user.uid }, { merge: true });
        DB.adminUid = user.uid;
      } catch (e) { /* ktoś inny zdążył pierwszy */ await wczytajConfigApp(); }
    }
    DB.ja = { uid: user.uid, email: user.email, imie: user.displayName || (user.email || '').split('@')[0], admin: DB.adminUid === user.uid };
  }
  DB.jestAdmin = () => !!(DB.ja && DB.ja.admin);
  DB.zalogowany = () => !!DB.ja;

  /* ---------- Dysk Google: link → osadzenie ---------- */
  DB.driveEmbed = function (url) {
    if (!url) return null;
    url = String(url).trim();
    let m, id = null, typ = 'file';
    if ((m = url.match(/\/document\/d\/([\w-]+)/))) { id = m[1]; typ = 'document'; }
    else if ((m = url.match(/\/spreadsheets\/d\/([\w-]+)/))) { id = m[1]; typ = 'spreadsheets'; }
    else if ((m = url.match(/\/presentation\/d\/([\w-]+)/))) { id = m[1]; typ = 'presentation'; }
    else if ((m = url.match(/\/file\/d\/([\w-]+)/))) { id = m[1]; typ = 'file'; }
    else if ((m = url.match(/[?&]id=([\w-]+)/))) { id = m[1]; typ = 'file'; }
    if (!id) return { embed: null, open: url, obraz: /\.(png|jpe?g|gif|webp)$/i.test(url) ? url : null };
    const embed = typ === 'file' ? `https://drive.google.com/file/d/${id}/preview` : `https://docs.google.com/${typ}/d/${id}/preview`;
    const obraz = typ === 'file' ? `https://drive.google.com/thumbnail?id=${id}&sz=w1200` : null;
    return { embed, open: url, id, obraz };
  };

  /* ---------- nagłówek: nawigacja + konto ---------- */
  DB.rysujNawigacje = function (aktywna) {
    const n = $('#menu'); if (!n) return;
    const link = (href, t, cls) => `<a href="${href}" class="${(aktywna === href ? 'on ' : '') + (cls || '')}">${t}</a>`;
    n.innerHTML =
      link('index.html', 'Aktualności') + link('wladze.html', 'Władze') +
      link('program.html', 'Program') + link('projekty.html', 'Projekty i referenda') +
      link('statut.html', 'Statut') +
      (DB.jestAdmin() ? link('admin.html', 'Administracja', 'adm') : '');
  };
  DB.rysujKonto = function () {
    const box = $('#acct'); if (!box) return;
    if (!DB.ja) { box.innerHTML = '<button id="k-login">Zaloguj / Dołącz</button>'; $('#k-login').onclick = () => DB.modalAuth('login'); return; }
    box.innerHTML = '<button id="k-wyl">' + esc((DB.ja.imie || '').split(' ')[0] || 'Konto') + (DB.ja.admin ? ' · Admin' : '') + ' ▾</button>';
    $('#k-wyl').onclick = async () => { if (confirm('Wylogować się?')) { await DB.auth.signOut(); location.href = 'index.html'; } };
  };

  /* ---------- modal logowania / rejestracji ---------- */
  let tryb = 'login';
  DB.modalAuth = function (t) {
    if (DB.trybDemo) { alert('Tryb demonstracyjny — logowanie działa po podłączeniu Firebase w config.js.'); return; }
    tryb = t || 'login';
    let r = $('#db-modal'); if (!r) { r = document.createElement('div'); r.id = 'db-modal'; document.body.appendChild(r); }
    r.innerHTML =
      '<div class="modal-bg" id="m-bg"><div class="modal">' +
        '<div class="modal-hd"><button class="x-close" id="m-x">×</button><img src="assets/logo.png" alt=""><b>Demokracja Bezpośrednia</b></div>' +
        '<div class="modal-bd">' +
          '<div class="tabs2" id="m-tabs"><button data-m="login" aria-pressed="true">Logowanie</button><button data-m="rejestr" aria-pressed="false">Rejestracja</button></div>' +
          '<div id="m-imie-box" hidden><label class="f"><span>Imię i nazwisko</span><input type="text" id="m-imie" placeholder="np. Michael Obermaier"></label></div>' +
          '<label class="f"><span>Adres e-mail</span><input type="email" id="m-email" autocomplete="email"></label>' +
          '<label class="f"><span>Hasło</span><input type="password" id="m-haslo" placeholder="min. 6 znaków"></label>' +
          '<button class="btn gold" id="m-ok" style="width:100%">Zaloguj się</button>' +
          '<div id="m-msg"></div>' +
          '<div class="muted" id="m-note" style="margin-top:14px;text-align:center"></div>' +
        '</div></div></div>';
    $('#m-x').onclick = zamknij; $('#m-bg').onclick = e => { if (e.target.id === 'm-bg') zamknij(); };
    $$('#m-tabs button').forEach(b => b.onclick = () => ustaw(b.dataset.m));
    $('#m-ok').onclick = wyslij;
    ['m-email', 'm-haslo', 'm-imie'].forEach(id => { const el = $('#' + id); if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') wyslij(); }); });
    ustaw(tryb);
  };
  function ustaw(m) {
    tryb = m;
    $$('#m-tabs button').forEach(b => b.setAttribute('aria-pressed', b.dataset.m === m));
    $('#m-imie-box').hidden = m !== 'rejestr';
    $('#m-ok').textContent = m === 'login' ? 'Zaloguj się' : 'Załóż konto';
    $('#m-note').innerHTML = m === 'rejestr' ? 'Pierwsze konto założone w systemie otrzymuje uprawnienia administratora partii.' : '';
    $('#m-msg').innerHTML = '';
  }
  function zamknij() { const r = $('#db-modal'); if (r) r.innerHTML = ''; }
  DB.nota = (sel, txt, typ) => { const el = $(sel); if (el) el.innerHTML = txt ? '<div class="note ' + (typ || 'info') + '">' + esc(txt) + '</div>' : ''; };

  async function wyslij() {
    const email = $('#m-email').value.trim(), haslo = $('#m-haslo').value, btn = $('#m-ok');
    if (!email || !haslo) { DB.nota('#m-msg', 'Podaj e-mail i hasło.', 'err'); return; }
    btn.disabled = true;
    try {
      if (tryb === 'login') { await DB.auth.signInWithEmailAndPassword(email, haslo); }
      else {
        const cred = await DB.auth.createUserWithEmailAndPassword(email, haslo);
        const imie = $('#m-imie').value.trim();
        if (imie) { try { await cred.user.updateProfile({ displayName: imie }); } catch (e) {} }
      }
      await poZalogowaniuWewn(DB.auth.currentUser);
      zamknij();
      if (DB.poZalogowaniu) DB.poZalogowaniu(); else location.reload();
    } catch (e) { DB.nota('#m-msg', tlumacz(e), 'err'); } finally { btn.disabled = false; }
  }
  function tlumacz(e) {
    const c = (e && e.code) || '', m = (e && e.message) || String(e);
    if (/wrong-password|invalid-credential|user-not-found/.test(c)) return 'Nieprawidłowy e-mail lub hasło.';
    if (/email-already-in-use/.test(c)) return 'Konto z tym adresem już istnieje.';
    if (/weak-password/.test(c)) return 'Hasło musi mieć co najmniej 6 znaków.';
    if (/invalid-email/.test(c)) return 'Nieprawidłowy adres e-mail.';
    if (/network-request-failed/.test(c)) return 'Brak połączenia z Firebase.';
    if (/too-many-requests/.test(c)) return 'Za dużo prób — odczekaj chwilę.';
    if (/permission-denied|insufficient/.test(c + m)) return 'Brak uprawnień do tej operacji.';
    return m;
  }
  DB.tlumacz = tlumacz;

  DB.wymagajAdmina = function () { if (!DB.ja || !DB.ja.admin) { location.href = 'index.html'; return false; } return true; };
  DB.formatData = d => { try { return new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return d || ''; } };

  DB.toast = function (txt, typ) {
    let t = $('#db-toast'); if (!t) { t = document.createElement('div'); t.id = 'db-toast'; t.style.cssText = 'position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:80;max-width:520px;width:calc(100% - 40px)'; document.body.appendChild(t); }
    t.innerHTML = '<div class="note ' + (typ || 'info') + '" style="margin:0;box-shadow:0 12px 30px rgba(0,0,0,.2)">' + esc(txt) + '</div>';
    clearTimeout(t._t); t._t = setTimeout(() => { t.innerHTML = ''; }, 3400);
  };

  // hak wywoływany po zmianie stanu logowania (ustawiany przez stronę)
  DB.onAuth = fn => { DB._onAuth = fn; };
})();
