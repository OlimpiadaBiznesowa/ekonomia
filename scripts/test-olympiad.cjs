const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'olympiad-concepts-data.js'), 'utf8'), context);
const data = context.window.OLYMPIAD_CONCEPTS;
const ids = new Set(data.concepts.map(item => item.id));
assert.equal(data.reviewedAt, '2026-09-06', 'Nieaktualna data przeglądu merytorycznego');
assert.equal(ids.size, data.concepts.length, 'Powtórzone identyfikatory');
assert.equal(new Set(data.concepts.map(item => item.term)).size, data.concepts.length, 'Powtórzone hasła');
for (const item of data.concepts) {
  assert(data.groups[item.group], `Brak działu: ${item.id}`);
  assert(data.sources[item.source], `Brak źródła: ${item.id}`);
  assert(item.definition.length > 50, `Brak definicji: ${item.id}`);
  assert(data.concepts.filter(other => other.group === item.group && other.id !== item.id).length >= 3, `Brak wariantów quizu: ${item.id}`);
}
for (const [name, url] of Object.values(data.sources)) {
  assert(name.length > 5);
  assert.equal(new URL(url).protocol, 'https:');
}
for (const question of data.applications) {
  assert(ids.has(question.conceptId), `Nieznane pojęcie: ${question.id}`);
  assert.equal(question.options.length, 4);
  assert.equal(new Set(question.options).size, 4);
  assert(Number.isInteger(question.correct) && question.correct >= 0 && question.correct < 4);
  assert(question.explanation.trim().length > 0, `Brak wyjaśnienia: ${question.id}`);
}
for (const [id, source] of Object.entries({
  'monetary-policy': 'monetaryPolicy',
  'technical-optimum': 'technicalOptimum',
  deflator: 'deflatorGus',
  'heckscher-ohlin': 'ohlin',
  leontief: 'ohlin'
})) {
  assert.equal(data.concepts.find(item => item.id === id).source, source, 'Nieprecyzyjne źródło: ' + id);
}
// Pokrycie wszystkich 87 + 26 głównych pozycji listy, w oryginalnej kolejności.
// Pozycje wieloczłonowe mają więcej niż jedno hasło; powtórzenia wskazują wspólny wpis.
const micro = [
 'ceteris', 'post-hoc', 'diminishing', 'ppf', 'ownership', 'seller-market buyer-market', 'demand-law supply-law', 'isoquant isocost', 'producer-optimum', 'flexibility expansibility', 'normative positive', 'supply-elasticity demand-elasticity', 'income-elasticity', 'cross-supply', 'mrt mrs mrts', 'indifference perfect-substitutes perfect-complements neutral-good', 'economies diseconomies constant-scale returns-scale', 'producer-surplus consumer-surplus', 'inferior normal', 'necessity luxury', 'engel', 'economic-good free-good', 'club-good common-resource private-good public-good', 'income-effect substitution', 'giffen veblen snob', 'production-function', 'free-good', 'demand-elasticity', 'income-elasticity', 'cross-demand', 'budget', 'pigou', 'explicit economic-cost', 'opportunity', 'coase', 'comparative absolute', 'prisoner', 'discrimination', 'factors', 'adverse-selection moral-hazard', 'efficiency-wage', 'horizontal-equity vertical-equity', 'commons', 'economic-optimum technical-optimum', 'short-equilibrium long-equilibrium', 'shutdown', 'natural-monopoly', 'cournot', 'discrimination-1 discrimination-2 discrimination-3', 'bilateral', 'monopsony labor-supply labor-demand', 'involuntary voluntary', 'discounting', 'pareto', 'free-rider', 'automatic', 'merit', 'heckscher-ohlin', 'leontief', 'lerner', 'hhi', 'lorenz', 'gini', 'isoquant', 'producer-optimum', 'marginal-revenue', 'total-revenue', 'average-revenue', 'average-product', 'marginal-product', 'total-product', 'explicit', 'implicit', 'economic-cost', 'economic-optimum', 'technical-optimum', 'economies', 'diseconomies', 'production-function', 'isocost', 'total-cost', 'average-cost', 'marginal-cost', 'fixed-cost', 'variable-cost', 'short-run', 'long-run'
];
const macro = [
 'gdp gnp net-product factor-prices', 'national-income disposable', 'neutrality', 'fundamental technical-analysis', 'appreciation depreciation', 'cyclical frictional structural natural-unemployment actual-unemployment', 'full-employment', 'budget-deficit trade-deficit', 'deflator cpi ppi', 'fisher', 'crowding-out', 'multiplier', 'quantity-theory', 'dichotomy', 'phillips', 'money-multiplier', 'net-capital-outflow', 'private-saving public-saving', 'fiscal-policy monetary-policy', 'inflation-tax', 'rational-expectations', 'full-reserve fractional-reserve bank-run', 'stagflation slumpflation taxflation', 'loanable', 'demand-shock supply-shock', 'ppp'
];
assert.equal(micro.length, 87);
assert.equal(macro.length, 26);
const covered = new Set([...micro, ...macro].flatMap(item => item.split(' ')));
for (const id of covered) assert(ids.has(id), `Niepokryte hasło listy: ${id}`);
for (const id of ids) assert(covered.has(id), `Hasło bez mapowania do listy: ${id}`);

// Niezależne przeliczenie kluczy zadań liczbowych (zapis odpowiedzi jest treścią ucznia).
const keyed = id => data.applications.find(q => q.conceptId === id).options[0];
assert.equal(keyed('producer-surplus'), `${900 - 500} zł`);
assert.equal(keyed('hhi'), String(50 ** 2 + 30 ** 2 + 20 ** 2));
assert.equal(keyed('lerner'), String((80 - 60) / 80).replace('.', ','));
assert.equal(keyed('net-product'), String(1000 + 40 - 100));
assert.equal(keyed('factor-prices'), String(900 - 100 + 20));
assert.equal(keyed('multiplier'), String(20 / (1 - .75)));
assert.equal(keyed('public-saving'), String(1000 - 650 - 250));
assert.equal(keyed('discounting'), `${Math.round(1210 / 1.1 ** 2)} zł`);
assert.equal(keyed('fisher'), `${((1.1 / 1.05 - 1) * 100).toFixed(2).replace('.', ',')}%`);
const olympiadRoutes = {
  'arkusze-olimpijskie/index.html': 'owe',
  'olimpiada-zagadnienia/index.html': 'olympiadConcepts',
  'olimpiada-fiszki/index.html': 'olympiadFlashcards',
  'olimpiada-quiz/index.html': 'olympiadQuiz'
};
for (const file of ['index.html', ...Object.keys(olympiadRoutes)]) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  for (const asset of ['olympiad-study.css', 'olympiad-study.js', 'olympiad-concepts-data.js']) assert(html.includes(asset), `${file}: brak ${asset}`);
  const htmlIds = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(htmlIds).size, htmlIds.length, `${file}: powtórzone id HTML`);
  for (const panel of ['owe', 'olympiadConcepts', 'olympiadFlashcards', 'olympiadQuiz']) assert(htmlIds.includes(panel));
  assert(!html.includes('olympiad-tabs'), file + ': pozostało wewnętrzne menu Olimpiady');
  assert(!html.includes('Zrozum. Powtórz. Sprawdź się.'), file + ': pozostał zbędny ekran wprowadzający');
  assert(html.includes('class="flashcard olympiad-card"'), file + ': fiszki nie używają wspólnego komponentu');
  assert(html.includes('class="answers" id="olympiadOptions"'), file + ': quiz nie używa wspólnego kontenera odpowiedzi');
  for (const mode of Object.values(olympiadRoutes)) {
    assert.equal([...html.matchAll(new RegExp(`data-menu-mode="${mode}"`, 'g'))].length, 2, `${file}: tryb ${mode} nie ma przycisku w obu menu`);
  }
  assert(!/<b>(Arkusze OWE|Zagadnienia|Fiszki|Quiz)<\/b><i/.test(html), `${file}: pozostały pomarańczowe liczniki w menu Olimpiady`);
  const expectedMode = olympiadRoutes[file];
  if (expectedMode) assert(html.includes(`data-mode="${expectedMode}"`), `${file}: nieaktywny właściwy panel`);
}
const olympiadCss = fs.readFileSync(path.join(root, 'olympiad-study.css'), 'utf8');
const olympiadJs = fs.readFileSync(path.join(root, 'olympiad-study.js'), 'utf8');
const appJs = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
assert(olympiadCss.includes('.olympiad-card .card-face.is-definition'), 'Brak typografii dla definicji na fiszce');
assert(olympiadCss.includes('.olympiad-quiz-settings'), 'Brak integracji ustawień quizu');
assert(!olympiadCss.includes('.owe-answer-option'), 'Moduł pojęć nadal nadpisuje osobny styl odpowiedzi OWE');
assert(olympiadJs.includes('class="answer" type="button" data-olympiad-answer'), 'Quiz nie używa wspólnego komponentu odpowiedzi');
assert(olympiadJs.includes("classList.toggle('is-flipped')"), 'Fiszka nie używa animowanego odwracania');
assert(olympiadJs.includes("{ duration: 180, easing: 'ease-in', fill: 'forwards' }"), 'Brak animacji wyjścia fiszki');
assert(olympiadJs.includes("{ duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' }"), 'Brak animacji wejścia następnej fiszki');
assert(olympiadJs.includes("classList.add(correct ? 'answer-correct' : 'answer-wrong')"), 'Quiz nie używa animacji odpowiedzi');
assert(!olympiadJs.includes('location.hash'), 'Moduł nadal używa zakładek w jednym adresie');
assert(!olympiadJs.includes('olympiadCardText'), 'Pozostało odwołanie do usuniętej karty');
assert(!appJs.includes('history.pushState') && !appJs.includes('history.replaceState'), 'Nawigacja nadal sztucznie zmienia URL bez przeładowania');
assert.equal((appJs.match(/if \(button\.matches\('a\[href\]'\)\) return;/g) || []).length, 2, 'Linki podstron nie są pozostawione natywnej nawigacji');
console.log(`OWE OK: ${data.concepts.length} definicji/fiszek, ${data.applications.length} zadań, 4 osobne podstrony, wspólne komponenty i animacje.`);
