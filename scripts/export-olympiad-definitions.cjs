const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'olympiad-concepts-data.js'), 'utf8'), context);
const data = context.window.OLYMPIAD_CONCEPTS;
const lines = [
  '# Pojęcia do Olimpiady Wiedzy Ekonomicznej', '',
  '155 haseł opracowanych z przekazanej listy. Powtórzenia scalono, a pozycje zbiorcze rozdzielono. Zakres obejmuje wszystkie 87 głównych pozycji pierwszej części i 26 pozycji drugiej części oraz podpunkt dotyczący szczególnych preferencji.', '',
  'Autorskie opracowanie do nauki. Warunki stosowania modeli i uwagi o konwencjach są integralną częścią definicji. Odsyłacze prowadzą do materiałów uzupełniających, a nie do oficjalnego klucza dla tych autorskich pytań.', '',
  '[Literatura zalecana przez PTE do XL OWE](https://owe.pte.pl/upload/files/literatura-i-zrodla-wiedzy/literatura-xl.pdf) obejmuje m.in. Mikroekonomię i Makroekonomię N.G. Mankiwa i M.P. Taylora (PWE, 2022). Ta lista pojęć nie stanowi całego programu OWE.', ''
];
let index = 0;
for (const [group, title] of Object.entries(data.groups)) {
  lines.push(`## ${title}`, '');
  for (const item of data.concepts.filter(item => item.group === group)) {
    const [name, url] = data.sources[item.source];
    lines.push(`### ${++index}. ${item.term}`, '', item.definition, '');
    if (item.note) lines.push(`**Zapamiętaj:** ${item.note}`, '');
    lines.push(`Dalsza nauka: [${name}](${url}).`, '');
  }
}
fs.writeFileSync(path.join(root, 'POJECIA_OWE.md'), lines.join('\n'), 'utf8');
console.log('Zapisano POJECIA_OWE.md — 155 definicji z uwagami i odsyłaczami.');
