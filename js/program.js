(async function () {
  const D = window.DB;
  await D.gotowe;
  function odswiez() { D.rysujNawigacje('program.html'); D.rysujKonto(); }
  D.onAuth(odswiez); D.poZalogowaniu = odswiez; odswiez();

  const filar = (t, o) => '<div class="card gold"><h3>' + t + '</h3><p style="margin:0">' + o + '</p></div>';

  D.$('#main').innerHTML =
    '<div class="eyebrow">Nasze wartości i cele</div><h1 class="head">Program partii</h1><div class="rule"></div>' +
    '<p class="lede">Demokracja Bezpośrednia to partia o charakterze centrowym, której podstawowym celem jest zwiększenie rzeczywistego wpływu obywateli Republiki Pruskiej na decyzje publiczne — przede wszystkim przez rozwój instytucji demokracji bezpośredniej.</p>' +

    '<h2 style="margin-top:34px">Zasady, na których się opieramy</h2>' +
    '<div class="grid g3" style="margin-top:12px">' +
      filar('Demokracja bezpośrednia', 'Referenda, inicjatywy obywatelskie i konsultacje jako realne narzędzia współdecydowania, a nie fasada.') +
      filar('Wolność obywatelska', 'Ochrona wolności słowa, zrzeszania się i działalności politycznej każdego obywatela.') +
      filar('Liberalizm gospodarczy', 'Wspieranie przedsiębiorczości, konkurencji i swobody działalności gospodarczej.') +
      filar('Samorządność', 'Decentralizacja władzy i wzmacnianie niezależności samorządów lokalnych.') +
      filar('Praworządność', 'Poszanowanie praw obywatelskich i równość wobec prawa.') +
      filar('Jawność i odpowiedzialność', 'Przejrzystość życia publicznego oraz rozliczalność osób sprawujących władzę.') +
    '</div>' +

    '<div class="card" style="margin-top:22px"><h2>Do czego dążymy</h2>' +
    '<ul style="margin:10px 0 0;padding-left:22px;line-height:1.9">' +
      '<li>Zwiększenie wpływu obywateli na decyzje publiczne przez rozwój demokracji bezpośredniej.</li>' +
      '<li>Rozwijanie inicjatyw obywatelskich oraz konsultacji społecznych.</li>' +
      '<li>Wzmacnianie niezależności samorządów lokalnych.</li>' +
      '<li>Wspieranie przedsiębiorczości, konkurencji i swobody działalności gospodarczej.</li>' +
      '<li>Przeciwdziałanie korupcji i nadużyciom władzy.</li>' +
      '<li>Zwiększanie przejrzystości finansów publicznych.</li>' +
      '<li>Rozwijanie cyfrowych form uczestnictwa obywateli i bezpiecznego głosowania elektronicznego.</li>' +
      '<li>Zapewnianie dostępu do informacji publicznej.</li>' +
      '<li>Wzmacnianie odpowiedzialności przedstawicieli wybieranych w wyborach powszechnych.</li>' +
    '</ul></div>' +

    '<div class="card gold" style="margin-top:16px"><h2>Jak działamy</h2>' +
    '<p>Nasze cele realizujemy metodami pokojowymi i demokratycznymi: przez udział w wyborach, zgłaszanie kandydatów, przedstawianie projektów ustaw, wspieranie obywatelskich inicjatyw ustawodawczych i referendalnych, organizowanie debat i konsultacji, prowadzenie kampanii informacyjnych oraz współpracę z organizacjami społecznymi i samorządowymi.</p>' +
    '<p style="margin-bottom:0"><a class="btn ghost sm" href="statut.html">Pełny statut partii →</a> <a class="btn ghost sm" href="projekty.html">Nasze projekty i referenda →</a></p></div>' +

    '<p class="muted" style="margin-top:16px">Program opracowany na podstawie zasad i celów określonych w Statucie partii (Rozdz. I–II, XI).</p>';
})();
