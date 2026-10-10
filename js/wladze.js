(async function () {
  const D = window.DB, $ = D.$, esc = D.esc;
  await D.gotowe;
  const ORGANY = ['Przewodniczący Partii', 'Zarząd Krajowy', 'Rada Krajowa', 'Krajowa Komisja Rewizyjna', 'Krajowa Komisja Etyki i Rozstrzygania Sporów', 'Struktury regionalne i lokalne', 'Inne'];
  function odswiez() { D.rysujNawigacje('wladze.html'); D.rysujKonto(); }
  D.onAuth(odswiez); D.poZalogowaniu = () => { odswiez(); wczytaj(); };
  odswiez();

  $('#main').innerHTML = '<div class="eyebrow">Organy i osoby funkcyjne</div><h1 class="head">Władze partii</h1><div class="rule"></div><div id="wl" style="margin-top:24px"></div>';

  async function wczytaj() {
    const box = $('#wl');
    if (D.trybDemo) { box.innerHTML = '<div class="empty">Tryb demonstracyjny — podłącz Firebase w config.js.</div>'; return; }
    try {
      const snap = await D.db.collection('wladze').orderBy('kolejnosc', 'asc').get();
      if (snap.empty) { box.innerHTML = '<div class="empty">Władze nie zostały jeszcze dodane.</div>'; return; }
      const osoby = snap.docs.map(d => d.data());
      let html = '';
      ORGANY.forEach(org => {
        const lista = osoby.filter(o => (o.organ || 'Inne') === org);
        if (!lista.length) return;
        html += '<div class="organ-tyt">' + esc(org) + '</div><div class="grid g3">' + lista.map(osobaHTML).join('') + '</div>';
      });
      // organy spoza listy
      const inne = osoby.filter(o => ORGANY.indexOf(o.organ || 'Inne') < 0);
      box.innerHTML = html || '<div class="empty">Władze nie zostały jeszcze dodane.</div>';
    } catch (e) { box.innerHTML = '<div class="note err">' + esc(D.tlumacz(e)) + '</div>'; }
  }

  function osobaHTML(o) {
    const dr = o.driveLink ? D.driveEmbed(o.driveLink) : null;
    const foto = (dr && dr.obraz) ? '<img src="' + esc(dr.obraz) + '" alt="">' : esc(D.inicjaly(o.imie));
    return '<div class="osoba"><div class="av">' + foto + '</div>' +
      '<div class="imie">' + esc(o.imie || '') + '</div>' +
      '<div class="funkcja">' + esc(o.funkcja || '') + '</div></div>';
  }

  wczytaj();
})();
