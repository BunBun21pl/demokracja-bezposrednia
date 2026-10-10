(async function () {
  const D = window.DB, $ = D.$, $$ = D.$$, esc = D.esc;
  await D.gotowe;
  function odswiez() { D.rysujNawigacje('admin.html'); D.rysujKonto(); }
  D.onAuth(odswiez); odswiez();

  if (D.trybDemo) { $('#main').innerHTML = '<div class="empty">Tryb demonstracyjny — podłącz Firebase w config.js.</div>'; return; }
  if (!D.ja) { $('#main').innerHTML = '<div class="card"><h2>Administracja</h2><p>Zaloguj się, aby zarządzać treścią partii.</p><button class="btn gold" id="go-login">Zaloguj się</button></div>'; const b = $('#go-login'); if (b) b.onclick = () => D.modalAuth('login'); return; }
  if (!D.ja.admin) { $('#main').innerHTML = '<div class="empty">Panel administracyjny dostępny wyłącznie dla administratora partii (pierwsze zarejestrowane konto).</div>'; return; }

  const ORGANY = ['Przewodniczący Partii', 'Zarząd Krajowy', 'Rada Krajowa', 'Krajowa Komisja Rewizyjna', 'Krajowa Komisja Etyki i Rozstrzygania Sporów', 'Struktury regionalne i lokalne', 'Inne'];

  $('#main').innerHTML =
    '<div class="eyebrow">Panel administratora</div><h1 class="head">Administracja</h1><div class="rule"></div>' +
    '<div class="tabs" id="tabs"><button data-t="news" aria-selected="true">Aktualności</button><button data-t="wladze" aria-selected="false">Władze</button><button data-t="projekty" aria-selected="false">Projekty i referenda</button></div>' +
    '<div class="pane on" id="p-news"></div><div class="pane" id="p-wladze"></div><div class="pane" id="p-projekty"></div>';

  $('#tabs').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('#tabs button').forEach(x => x.setAttribute('aria-selected', x === b)); $$('.pane').forEach(p => p.classList.remove('on')); $('#p-' + b.dataset.t).classList.add('on'); });

  const pole = (id, label, ph, typ) => '<label class="f"><span>' + label + '</span>' + (typ === 'area' ? '<textarea id="' + id + '" placeholder="' + (ph || '') + '"></textarea>' : '<input type="' + (typ || 'text') + '" id="' + id + '" placeholder="' + (ph || '') + '">') + '</label>';
  const driveHint = 'Wklej link „Udostępnij” z Dysku Google (ustaw dostęp: „Każdy, kto ma link”).';

  /* ---------- AKTUALNOŚCI ---------- */
  $('#p-news').innerHTML =
    '<div class="card"><h3>Dodaj aktualność</h3>' +
      pole('n-tytul', 'Tytuł', 'np. Stanowisko partii w sprawie referendum') +
      pole('n-data', 'Data (opcjonalnie)', 'np. 9 października 2026') +
      pole('n-tresc', 'Treść', 'Treść aktualności…', 'area') +
      pole('n-drive', 'Załącznik / zdjęcie z Dysku Google (opcjonalnie)', driveHint, 'url') +
      '<button class="btn gold" id="n-add">Opublikuj</button><div id="n-msg"></div>' +
    '</div><div class="card"><h3>Opublikowane aktualności</h3><div id="n-lista"></div></div>';
  $('#n-add').onclick = async () => {
    const tytul = $('#n-tytul').value.trim(); if (!tytul) { D.nota('#n-msg', 'Podaj tytuł.', 'err'); return; }
    await dodaj('aktualnosci', { tytul, data: $('#n-data').value.trim(), tresc: $('#n-tresc').value.trim(), driveLink: $('#n-drive').value.trim() }, '#n-msg');
    ['n-tytul', 'n-data', 'n-tresc', 'n-drive'].forEach(i => $('#' + i).value = ''); listaNews();
  };

  /* ---------- WŁADZE ---------- */
  $('#p-wladze').innerHTML =
    '<div class="card"><h3>Dodaj osobę do władz</h3>' +
      pole('w-imie', 'Imię i nazwisko', 'np. Michael Obermaier') +
      pole('w-funkcja', 'Funkcja', 'np. Przewodniczący Partii') +
      '<label class="f"><span>Organ</span><select id="w-organ">' + ORGANY.map(o => '<option>' + o + '</option>').join('') + '</select></label>' +
      pole('w-kol', 'Kolejność (mniejsza = wyżej)', 'np. 1', 'text') +
      pole('w-drive', 'Zdjęcie z Dysku Google (opcjonalnie)', driveHint, 'url') +
      '<button class="btn gold" id="w-add">Dodaj</button><div id="w-msg"></div>' +
    '</div><div class="card"><h3>Władze</h3><div id="w-lista"></div></div>';
  $('#w-add').onclick = async () => {
    const imie = $('#w-imie').value.trim(); if (!imie) { D.nota('#w-msg', 'Podaj imię i nazwisko.', 'err'); return; }
    await dodaj('wladze', { imie, funkcja: $('#w-funkcja').value.trim(), organ: $('#w-organ').value, kolejnosc: parseInt($('#w-kol').value, 10) || 100, driveLink: $('#w-drive').value.trim() }, '#w-msg');
    ['w-imie', 'w-funkcja', 'w-kol', 'w-drive'].forEach(i => $('#' + i).value = ''); listaWladze();
  };

  /* ---------- PROJEKTY ---------- */
  $('#p-projekty').innerHTML =
    '<div class="card"><h3>Dodaj projekt ustawy lub referendum</h3>' +
      '<label class="f"><span>Rodzaj</span><select id="pr-typ"><option value="ustawa">Projekt ustawy</option><option value="referendum">Referendum</option></select></label>' +
      pole('pr-tytul', 'Tytuł', 'np. Projekt ustawy o inicjatywie obywatelskiej') +
      pole('pr-status', 'Status (opcjonalnie)', 'np. w konsultacjach, złożony, przyjęty') +
      pole('pr-data', 'Data (opcjonalnie)', 'np. 9 października 2026') +
      pole('pr-opis', 'Opis (opcjonalnie)', 'Krótki opis projektu…', 'area') +
      pole('pr-drive', 'Dokument z Dysku Google', driveHint, 'url') +
      '<button class="btn gold" id="pr-add">Opublikuj</button><div id="pr-msg"></div>' +
    '</div><div class="card"><h3>Opublikowane</h3><div id="pr-lista"></div></div>';
  $('#pr-add').onclick = async () => {
    const tytul = $('#pr-tytul').value.trim(); if (!tytul) { D.nota('#pr-msg', 'Podaj tytuł.', 'err'); return; }
    await dodaj('projekty', { typ: $('#pr-typ').value, tytul, status: $('#pr-status').value.trim(), data: $('#pr-data').value.trim(), opis: $('#pr-opis').value.trim(), driveLink: $('#pr-drive').value.trim() }, '#pr-msg');
    ['pr-tytul', 'pr-status', 'pr-data', 'pr-opis', 'pr-drive'].forEach(i => $('#' + i).value = ''); listaProjekty();
  };

  /* ---------- wspólne ---------- */
  async function dodaj(kol, obj, msg) {
    try { obj.autor = D.ja.email; obj.utworzono = Date.now(); await D.db.collection(kol).add(obj); D.nota(msg, 'Zapisano.', 'ok'); D.toast('Dodano.', 'ok'); setTimeout(() => D.nota(msg, ''), 2500); }
    catch (e) { D.nota(msg, D.tlumacz(e), 'err'); }
  }
  async function usun(kol, id, refresh) { if (!confirm('Usunąć pozycję?')) return; try { await D.db.collection(kol).doc(id).delete(); refresh(); } catch (e) { D.toast(D.tlumacz(e), 'err'); } }

  async function listaNews() {
    const snap = await D.db.collection('aktualnosci').orderBy('utworzono', 'desc').get();
    $('#n-lista').innerHTML = snap.empty ? '<div class="empty">Brak.</div>' : snap.docs.map(d => wiersz(d.id, d.data().tytul, D.formatData(d.data().utworzono), () => usun('aktualnosci', d.id, listaNews))).join('');
    pod();
  }
  async function listaWladze() {
    const snap = await D.db.collection('wladze').orderBy('kolejnosc', 'asc').get();
    $('#w-lista').innerHTML = snap.empty ? '<div class="empty">Brak.</div>' : snap.docs.map(d => wiersz(d.id, d.data().imie, esc(d.data().funkcja || '') + ' · ' + esc(d.data().organ || ''), () => usun('wladze', d.id, listaWladze))).join('');
    pod();
  }
  async function listaProjekty() {
    const snap = await D.db.collection('projekty').orderBy('utworzono', 'desc').get();
    $('#pr-lista').innerHTML = snap.empty ? '<div class="empty">Brak.</div>' : snap.docs.map(d => wiersz(d.id, d.data().tytul, (d.data().typ === 'referendum' ? 'Referendum' : 'Projekt ustawy') + (d.data().status ? ' · ' + esc(d.data().status) : ''), () => usun('projekty', d.id, listaProjekty))).join('');
    pod();
  }
  function wiersz(id, tytul, pod, onDel) {
    const el = document.createElement('div');
    return '<div class="news-item" style="display:flex;justify-content:space-between;gap:10px;align-items:center" data-id="' + id + '"><div><b>' + esc(tytul) + '</b><div class="muted">' + pod + '</div></div><button class="btn x" data-del>Usuń</button></div>';
  }
  // delegacja usuwania
  ['#n-lista', '#w-lista', '#pr-lista'].forEach(sel => {
    document.addEventListener('click', e => {
      const btn = e.target.closest(sel + ' [data-del]'); if (!btn) return;
      const id = btn.closest('[data-id]').dataset.id;
      const kol = sel === '#n-lista' ? 'aktualnosci' : sel === '#w-lista' ? 'wladze' : 'projekty';
      const ref = sel === '#n-lista' ? listaNews : sel === '#w-lista' ? listaWladze : listaProjekty;
      usun(kol, id, ref);
    });
  });
  function pod() { /* placeholder na ewentualne liczniki */ }

  listaNews(); listaWladze(); listaProjekty();
})();
