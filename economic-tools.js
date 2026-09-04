(function () {
  'use strict';
  const math = window.EconomicToolsMath;
  const $ = id => document.getElementById(id);
  const fmt = value => {
    if (value !== 0 && Math.abs(value) < .001) return value.toExponential(2).replace('.', ',');
    return new Intl.NumberFormat('pl-PL', {maximumFractionDigits: 3}).format(value);
  };
  const sign = value => (value > 0 ? '+' : '') + fmt(value);
  const form = $('elastic-form');
  if (form) {
    const ids = ['p1','p2','q1','q2'];
    const clearResult = message => { $('elastic-result').replaceChildren(); $('elastic-status').textContent = message; };
    function calculate() {
      $('elastic-error').hidden = true;
      ids.forEach(id => $(id).removeAttribute('aria-invalid'));
      try {
        const r = math.elasticity(ids.map(id => $(id).value), $('elastic-method').value);
        const midpoint = $('elastic-method').value === 'midpoint';
        $('elastic-status').textContent = `Wynik dla metody ${midpoint ? 'punktu środkowego' : 'wartości początkowej'}.`;
        $('elastic-result').innerHTML = `<div class="elastic-score"><span>ELASTYCZNOŚĆ · |E|</span><strong>${fmt(r.magnitude)}</strong><b>${r.kind}</b></div><p class="result-interpretation">${r.magnitude === 0 ? 'Wielkość popytu nie zmieniła się mimo zmiany ceny.' : `Zmiana ilości wynosi ${fmt(Math.abs(r.quantityChange * 100))}%, a ceny ${fmt(Math.abs(r.priceChange * 100))}%. ${r.kind === 'Jednostkowo elastyczny' ? 'Obie zmiany są proporcjonalne.' : r.magnitude < 1 ? 'Ilość reaguje proporcjonalnie słabiej niż cena.' : 'Ilość reaguje proporcjonalnie silniej niż cena.'}`}</p>${r.signed > 0 ? '<p class="tool-warning">Cena i ilość zmieniają się w tym samym kierunku. To nietypowe dla ruchu po standardowej krzywej popytu; sprawdź dane i wpływ innych czynników.</p>' : ''}<details class="calculation-steps" open><summary>Obliczenia krok po kroku</summary><ol><li><span>Zmiana wielkości popytu</span><code>(${fmt(r.q2)} − ${fmt(r.q1)}) / ${fmt(r.qBase)} × 100% = ${sign(r.quantityChange * 100)}%</code></li><li><span>Zmiana ceny</span><code>(${fmt(r.p2)} − ${fmt(r.p1)}) / ${fmt(r.pBase)} × 100% = ${sign(r.priceChange * 100)}%</code></li><li><span>Współczynnik ze znakiem</span><code>E = (${sign(r.quantityChange * 100)}%) / (${sign(r.priceChange * 100)}%) = ${fmt(r.signed)}</code></li></ol><p class="field-help">Wynik liczony z pełną precyzją; wartości na ekranie są zaokrąglone.</p></details><div class="revenue-box"><span>Przychód · cena × ilość</span><div><b>${fmt(r.revenue1)} zł</b><span aria-hidden="true">→</span><b>${fmt(r.revenue2)} zł</b></div><small>Zmiana: ${sign(r.revenue2-r.revenue1)} zł${r.revenue1 ? ` (${sign((r.revenue2/r.revenue1-1)*100)}%)` : ' · brak procentowego porównania z zerem'}.</small></div>`;
      } catch (error) {
        clearResult('Popraw dane, aby zobaczyć wynik.');
        $('elastic-error').textContent = error.message;
        $('elastic-error').hidden = false;
        ids.forEach(id => { try { math.number($(id).value); } catch { $(id).setAttribute('aria-invalid','true'); } });
      }
    }
    form.addEventListener('submit', e => { e.preventDefault(); calculate(); });
    form.addEventListener('input', () => { $('elastic-error').hidden = true; clearResult('Dane zmienione. Kliknij „Oblicz elastyczność”, aby zaktualizować wynik.'); });
    $('elastic-method').addEventListener('change', () => {
      $('method-help').textContent = $('elastic-method').value === 'midpoint' ? 'Metoda punktu środkowego daje tę samą wartość po zamianie danych „przed” i „po”.' : 'Zmiany procentowe odnosimy do danych początkowych. Nie jest to elastyczność punktowa wyznaczona z pochodnej funkcji.';
      calculate();
    });
    $('elastic-example').addEventListener('click', () => {
      [10,12,100,80].forEach((value,i) => { $(ids[i]).value = value; });
      calculate();
    });
    $('elastic-reset').addEventListener('click', () => {
      ids.forEach(id => { $(id).value = ''; $(id).removeAttribute('aria-invalid'); });
      $('elastic-error').hidden = true;
      clearResult('Wpisz dane i oblicz elastyczność.');
      $('p1').focus();
    });
    calculate();
  }

  if ($('market-chart')) {
    const inputIds = ['demand-shift','supply-shift','market-price','model-a','model-b','model-c','model-d'];
    // Keep the two main sliders next to the graph on a small screen.
    const mobileControls = document.createElement('div');
    mobileControls.className = 'mobile-market-controls';
    $('market-chart').before(mobileControls);
    const controlPanel = document.querySelector('.market-controls');
    const shiftLabels = ['demand-shift','supply-shift'].map(id => $(id).closest('label'));
    const smallScreen = window.matchMedia('(max-width:760px)');
    function placeControls() {
      if (smallScreen.matches) shiftLabels.forEach(label => mobileControls.append(label));
      else controlPanel.querySelector('.panel-heading').after(...shiftLabels);
    }
    smallScreen.addEventListener('change', placeControls);
    placeControls();
    function render() {
      const read = id => Number($(id).value);
      const params = {a:read('model-a'), b:read('model-b'), c:read('model-c'), d:read('model-d'), demandShift:read('demand-shift'), supplyShift:read('supply-shift'), price:read('market-price')};
      const r = math.market(params), base = math.market({...params, demandShift:0, supplyShift:0});
      const showPrice = $('show-price').checked;
      $('price-controls').hidden = !showPrice;
      inputIds.forEach(id => { $(id+'-value').textContent = fmt(read(id)) + (id === 'market-price' ? ' zł' : ''); });
      const pMax = Math.ceil(Math.max(60, r.A/params.b, params.a/params.b, -r.C/params.d, showPrice ? params.price : 0) * 1.15 / 10)*10;
      const qMax = Math.ceil(Math.max(60,r.A,params.a,r.feasible ? r.equilibriumQuantity*1.4 : 0,showPrice ? Math.max(r.demand,r.supply)*1.1 : 0) / 20)*20;
      const x = q => 65 + q/qMax*570, y = p => 345 - p/pMax*300;
      const line = (q1,p1,q2,p2,cls) => `<line x1="${x(q1)}" y1="${y(p1)}" x2="${x(q2)}" y2="${y(p2)}" class="${cls}"/>`;
      let grid = '';
      for (let i=0;i<=5;i++) {
        const q=qMax*i/5,p=pMax*i/5;
        grid += line(q,0,q,pMax,'grid-line') + line(0,p,qMax,p,'grid-line') + `<text x="${x(q)}" y="367" text-anchor="middle">${fmt(q)}</text><text x="53" y="${y(p)+4}" text-anchor="end">${fmt(p)}</text>`;
      }
      const description = r.feasible ? `Cena równowagi ${fmt(r.equilibriumPrice)} zł. Ilość równowagi ${fmt(r.equilibriumQuantity)} sztuk.` : 'Brak przecięcia krzywych przy nieujemnej cenie i ilości.';
      $('market-chart').innerHTML = `<svg viewBox="0 0 680 400" role="img" aria-labelledby="market-svg-title market-svg-desc"><title id="market-svg-title">Wykres podaży i popytu</title><desc id="market-svg-desc">${description} Popyt: Qd = ${fmt(r.A)} − ${fmt(params.b)}P. Podaż: Qs = ${fmt(r.C)} + ${fmt(params.d)}P.</desc><defs><clipPath id="market-clip"><rect x="65" y="45" width="570" height="300"/></clipPath></defs>${grid}<text x="65" y="23" class="axis-title">Cena P (zł)</text><text x="635" y="394" text-anchor="end" class="axis-title">Ilość Q (szt.)</text><g clip-path="url(#market-clip)">${line(params.a,0,params.a-params.b*pMax,pMax,'curve baseline demand')}${line(params.c,0,params.c+params.d*pMax,pMax,'curve baseline supply')}${line(r.A,0,r.A-params.b*pMax,pMax,'curve demand')}${line(r.C,0,r.C+params.d*pMax,pMax,'curve supply')}${showPrice ? line(0,params.price,qMax,params.price,'price-line') : ''}${r.feasible ? line(0,r.equilibriumPrice,r.equilibriumQuantity,r.equilibriumPrice,'equilibrium-guide')+line(r.equilibriumQuantity,0,r.equilibriumQuantity,r.equilibriumPrice,'equilibrium-guide')+`<circle cx="${x(r.equilibriumQuantity)}" cy="${y(r.equilibriumPrice)}" r="7" class="equilibrium-dot"/><text x="${x(r.equilibriumQuantity)+12}" y="${y(r.equilibriumPrice)-12}" class="point-label">E</text>` : ''}</g></svg>`;
      const eq = r.feasible ? `<div class="equilibrium-cards"><div><span>Cena równowagi · P*</span><strong>${fmt(r.equilibriumPrice)} <small>zł</small></strong><small>${base.feasible ? sign(r.equilibriumPrice-base.equilibriumPrice)+' zł względem rynku wyjściowego' : 'Brak porównywalnej równowagi wyjściowej'}</small></div><div><span>Ilość równowagi · Q*</span><strong>${fmt(r.equilibriumQuantity)} <small>szt.</small></strong><small>${base.feasible ? sign(r.equilibriumQuantity-base.equilibriumQuantity)+' szt. względem rynku wyjściowego' : 'Brak porównywalnej równowagi wyjściowej'}</small></div></div>` : '<p class="tool-warning">Brak równowagi wewnętrznej przy nieujemnej cenie i ilości. Zmień parametry krzywych lub zresetuj rynek.</p>';
      $('market-result').innerHTML = eq + `<p class="market-equations">Qd = ${fmt(r.A)} − ${fmt(params.b)}P <span>Qs = ${fmt(r.C)} + ${fmt(params.d)}P</span></p>`;
      $('market-price-result').hidden = !showPrice;
      $('market-price-result').innerHTML = `<div class="price-summary"><b>${Math.abs(r.gap)<1e-8 ? 'Popyt równy podaży' : r.gap > 0 ? `Niedobór: ${fmt(r.gap)} szt.` : `Nadwyżka podaży: ${fmt(-r.gap)} szt.`}</b><p>Przy cenie ${fmt(params.price)} zł kupujący chcą nabyć ${fmt(r.demand)} szt., a sprzedający oferują ${fmt(r.supply)} szt.</p></div>`;
    }
    inputIds.forEach(id => $(id).addEventListener('input', render));
    $('show-price').addEventListener('change', render);
    document.querySelectorAll('[data-scenario]').forEach(button => button.addEventListener('click', () => {
      const values = {'model-a':120,'model-b':2,'model-c':0,'model-d':2,'market-price':30,'demand-shift':0,'supply-shift':0};
      if(button.dataset.scenario==='demand') values['demand-shift']=40;
      if(button.dataset.scenario==='supply') values['supply-shift']=40;
      if(button.dataset.scenario==='cost') values['supply-shift']=-40;
      Object.entries(values).forEach(([id,value]) => { $(id).value=value; });
      $('show-price').checked=false;
      render();
    }));
    render();
  }
})();
