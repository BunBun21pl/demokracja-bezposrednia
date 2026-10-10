(async function () {
  const D = window.DB, $ = D.$, $$ = D.$$, esc = D.esc;
  await D.gotowe;
  function odswiez() { D.rysujNawigacje('projekty.html'); D.rysujKonto(); }
  D.onAuth(odswiez); D.poZalogowaniu = () => { odswiez(); wczytaj(); };
  odswiez();

  $('#main').innerHTML =
    '<div class="eyebrow">Działalność programowa</div><h1 class="head">Projekty ustaw i referenda</h1><div class="rule"></div>' +
    '<p class="lede">Projekty aktów prawnych i wnioski referendalne firmowane przez partię. Dokumenty prowadzone są na Dysku Google.</p>' +
    '<div class="tabs" id="filtry" style="margin-top:20px"><button data-f="all" aria-selected="true">Wszystko</button><button data-f="ustawa" aria-selected="false">Projekty ustaw</button><button data-f="referendum" aria-selected="false">Referenda</button></div>' +
    '<div id="lista"></div>';

  let dane = [];
  $('#filtry').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('#filtry button').forEach(x => x.setAttribute('aria-selected', x === b)); rysuj(b.dataset.f); });

  async function wczytaj() {
    const box = $('#lista');
    if (D.trybDemo) { box.innerHTML = '<div class="empty">Tryb demonstracyjny — podłącz Firebase w config.js.</div>'; return; }
    try {
      const snap = await D.db.collection('projekty').orderBy('utworzono', 'desc').get();
      dane = snap.docs.map(d => d.data());
      rysuj('all');
    } catch (e) { box.innerHTML = '<div class="note err">' + esc(D.tlumacz(e)) + '</div>'; }
  }

  function rysuj(f) {
    const box = $('#lista');
    const lista = dane.filter(p => f === 'all' || p.typ === f);
    if (!lista.length) { box.innerHTML = '<div class="empty">Brak pozycji.</div>'; return; }
    box.innerHTML = lista.map(kartaHTML).join('');
  }

  function kartaHTML(p) {
    const dr = p.driveLink ? D.driveEmbed(p.driveLink) : null;
    const embed = (dr && dr.embed) ? '<iframe class="drive-embed" src="' + esc(dr.embed) + '"></iframe>' : '';
    const link = (dr && dr.open) ? '<a class="btn ghost sm drive-btn" href="' + esc(dr.open) + '" target="_blank" rel="noopener">Otwórz w Google Drive ↗</a>' : '';
    return '<div class="card gold">' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between">' +
        '<h3 style="margin:0">' + esc(p.tytul || '') + '</h3>' +
        '<span class="chip ' + (p.typ === 'referendum' ? 'referendum' : 'ustawa') + '">' + (p.typ === 'referendum' ? 'Referendum' : 'Projekt ustawy') + '</span></div>' +
      '<div class="muted" style="margin-top:4px">' + [p.status ? '<span class="chip st">' + esc(p.status) + '</span>' : '', esc(p.data || D.formatData(p.utworzono))].filter(Boolean).join(' &nbsp; ') + '</div>' +
      (p.opis ? '<p style="white-space:pre-wrap">' + esc(p.opis) + '</p>' : '') +
      embed + (link ? '<div style="margin-top:10px">' + link + '</div>' : '') +
      '</div>';
  }

  wczytaj();
})();
