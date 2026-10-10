(async function () {
  const D = window.DB, $ = D.$, esc = D.esc;
  await D.gotowe;
  function odswiez() { D.rysujNawigacje('index.html'); D.rysujKonto(); }
  D.onAuth(odswiez); D.poZalogowaniu = () => { odswiez(); wczytaj(); };
  odswiez();

  async function wczytaj() {
    const box = $('#news');
    if (D.trybDemo) { box.innerHTML = '<div class="empty">Tryb demonstracyjny — podłącz Firebase w config.js, aby wyświetlać aktualności.</div>'; return; }
    try {
      const snap = await D.db.collection('aktualnosci').orderBy('utworzono', 'desc').get();
      if (snap.empty) { box.innerHTML = '<div class="empty">Brak aktualności. Zajrzyj wkrótce.</div>'; return; }
      box.innerHTML = '<div class="card">' + snap.docs.map(d => item(d.data())).join('') + '</div>';
    } catch (e) { box.innerHTML = '<div class="note err">' + esc(D.tlumacz(e)) + '</div>'; }
  }

  function item(a) {
    const dr = a.driveLink ? D.driveEmbed(a.driveLink) : null;
    const obraz = (dr && dr.obraz) ? '<img src="' + esc(dr.obraz) + '" alt="" style="width:100%;max-height:360px;object-fit:cover;border-radius:10px;margin:10px 0">' : '';
    const embed = (dr && dr.embed && !dr.obraz) ? '<iframe class="drive-embed" src="' + esc(dr.embed) + '" allow="autoplay"></iframe>' : '';
    const link = (dr && dr.open) ? '<div><a class="btn ghost sm drive-btn" href="' + esc(dr.open) + '" target="_blank" rel="noopener">Otwórz w Google Drive ↗</a></div>' : '';
    return '<div class="news-item">' +
      '<div class="data">' + esc(a.data || D.formatData(a.utworzono)) + '</div>' +
      '<h3>' + esc(a.tytul || '') + '</h3>' +
      obraz +
      (a.tresc ? '<div class="tresc">' + esc(a.tresc) + '</div>' : '') +
      embed + link +
      '</div>';
  }

  wczytaj();
})();
