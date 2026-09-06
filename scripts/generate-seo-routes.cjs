const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const siteUrl = 'https://naukaekonomii.pl';
const siteName = 'Nauka Ekonomii';
const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const appRoutes = [
  ['ucz-sie', 'learn', 'Nauka ekonomii online — tryb adaptacyjny | Nauka Ekonomii', 'Ucz się mikroekonomii i makroekonomii online bez logowania. Adaptacyjne pytania wracają do zagadnień, które wymagają powtórki.', true],
  ['fiszki', 'flashcards', 'Fiszki z mikroekonomii i makroekonomii | Nauka Ekonomii', '487 bezpłatnych fiszek z mikroekonomii i makroekonomii. Powtarzaj pojęcia, oznaczaj trudne zagadnienia i zapisuj postęp bez logowania.', true],
  ['quizy', 'quiz', 'Quiz z mikroekonomii i makroekonomii online | Nauka Ekonomii', 'Bezpłatny quiz z mikroekonomii i makroekonomii z natychmiastowym wynikiem. Wybierz zakres i sprawdź wiedzę bez zakładania konta.', true],
  ['arkusze-olimpijskie', 'owe', 'Arkusze Olimpiady Wiedzy Ekonomicznej | Nauka Ekonomii', 'Rozwiązuj 300 pytań opartych na archiwalnych arkuszach Olimpiady Wiedzy Ekonomicznej i od razu sprawdzaj odpowiedzi.', true],
  ['olimpiada-zagadnienia', 'olympiadConcepts', 'Zagadnienia do Olimpiady Wiedzy Ekonomicznej | Nauka Ekonomii', '155 sprawdzonych definicji pojęć ekonomicznych do przygotowań do Olimpiady Wiedzy Ekonomicznej.', true],
  ['olimpiada-fiszki', 'olympiadFlashcards', 'Fiszki do Olimpiady Wiedzy Ekonomicznej | Nauka Ekonomii', '155 interaktywnych fiszek z pojęć wymaganych podczas przygotowań do Olimpiady Wiedzy Ekonomicznej.', true],
  ['olimpiada-quiz', 'olympiadQuiz', 'Quiz do Olimpiady Wiedzy Ekonomicznej | Nauka Ekonomii', '195 pytań quizowych z definicji i zastosowań pojęć do Olimpiady Wiedzy Ekonomicznej.', true],
  ['zagadnienia', 'concepts', 'Pojęcia z mikroekonomii i makroekonomii — słownik | Nauka Ekonomii', 'Słownik 487 pojęć z mikroekonomii i makroekonomii. Znajdź krótkie definicje i przejdź do odpowiedniego rozdziału.', true],
  ['wiecej', 'more', 'Narzędzia do nauki ekonomii | Nauka Ekonomii', 'Testy, wyszukiwarka odpowiedzi, streszczenia, wzory matematyczne oraz informacje o źródłach w jednym miejscu.', true],
  ['test', 'test', 'Test z mikroekonomii i makroekonomii online | Nauka Ekonomii', 'Bezpłatny test z mikroekonomii i makroekonomii. Samodzielnie wpisuj nazwy pojęć, sprawdzaj odpowiedzi i utrwalaj materiał.', true],
  ['odpowiedzi', 'answers', 'Odpowiedzi z ekonomii | Nauka Ekonomii', 'Wyszukuj odpowiedzi na pytania z ekonomii i przechodź do właściwych zagadnień oraz rozdziałów.', false],
  ['zakres-i-streszczenia', 'scope', 'Streszczenia z mikroekonomii i makroekonomii | Nauka Ekonomii', 'Przeglądaj zakres i najważniejsze wnioski z 37 rozdziałów mikroekonomii i makroekonomii.', true],
  ['wzory-matematyczne', 'math', 'Wzory z mikroekonomii i makroekonomii | Nauka Ekonomii', '94 wzory z mikroekonomii i makroekonomii wraz z opisem zmiennych, interpretacją i zastosowaniem.', true],
  ['zrodla-i-prawa', 'legal', 'Źródła, prawa i prywatność | Nauka Ekonomii', 'Bibliografia, prawa autorskie, zasady opracowania treści oraz informacja o przetwarzaniu danych w serwisie Nauka Ekonomii.', true]
].map(([slug, mode, title, description, indexable]) => ({ slug, mode, title, description, indexable }));

const escapeHtml = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const escapeXml = value => escapeHtml(value);

function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/ł/g, 'l')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function replaceMeta(html, selector, value) {
  const pattern = new RegExp(`(<meta\\s+${selector}\\s+content=")[^"]*("\\s*\\/?>)`, 'i');
  if (!pattern.test(html)) throw new Error(`Nie znaleziono meta: ${selector}`);
  return html.replace(pattern, `$1${escapeHtml(value)}$2`);
}

function structuredData(title, canonical, type = 'WebPage', breadcrumbs = []) {
  const graph = [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      url: `${siteUrl}/`,
      name: siteName,
      alternateName: 'NaukaEkonomii.pl',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/assets/logo-square-512.png`,
        width: 512,
        height: 512
      }
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: `${siteUrl}/`,
      name: siteName,
      alternateName: ['NaukaEkonomii.pl', 'naukaekonomii.pl'],
      description: 'Bezpłatna platforma do nauki mikroekonomii i makroekonomii.',
      inLanguage: 'pl-PL',
      publisher: { '@id': `${siteUrl}/#organization` }
    },
    {
      '@type': type,
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: title.replace(/ \| Nauka Ekonomii$/, ''),
      isPartOf: { '@id': `${siteUrl}/#website` },
      inLanguage: 'pl-PL'
    }
  ];
  if (breadcrumbs.length) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2).replace(/</g, '\\u003c');
}

function activatePanel(html, mode) {
  html = html.replace(/<body class="[^"]*" data-mode="[^"]*">/, `<body class="${mode}-active" data-mode="${mode}">`);
  html = html.replace(/(<section class=")([^"]*\bstudy-panel\b[^"]*)(" id="[^"]+" data-panel="[^"]+">)/g, (_, start, classes, end) => `${start}${classes.replace(/\s+active\b/g, '')}${end}`);
  const target = new RegExp(`(<section class=")([^"]*\\bstudy-panel\\b[^"]*)(" id="${mode}" data-panel="${mode}">)`);
  html = html.replace(target, (_, start, classes, end) => `${start}${classes} active${end}`);
  html = html.replace(/(<a class=")([^"]*)("[^>]+data-menu-mode="[^"]+")/g, (_, start, classes, end) => `${start}${classes.replace(/\s+active\b/g, '')}${end}`);
  const menuTarget = new RegExp(`(<a class=")([^"]*)("[^>]+data-menu-mode="${mode}")`, 'g');
  return html.replace(menuTarget, (_, start, classes, end) => `${start}${classes} active${end}`);
}

function writeAppRoutes() {
  for (const route of appRoutes) {
    const canonical = `${siteUrl}/${route.slug}/`;
    let html = activatePanel(source, route.mode);
    html = replaceMeta(html, 'name="description"', route.description);
    html = replaceMeta(html, 'name="robots"', route.indexable ? 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1' : 'noindex,follow');
    html = replaceMeta(html, 'property="og:title"', route.title);
    html = replaceMeta(html, 'property="og:description"', route.description);
    html = replaceMeta(html, 'property="og:url"', canonical);
    html = replaceMeta(html, 'name="twitter:title"', route.title);
    html = replaceMeta(html, 'name="twitter:description"', route.description);
    html = html.replace(/<link rel="canonical" href="[^"]+"\s*\/>/i, `<link rel="canonical" href="${canonical}" />`);
    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(route.title)}</title>`);
    html = html.replace(/<script type="application\/ld\+json" id="websiteStructuredData">[\s\S]*?<\/script>/i, `<script type="application/ld+json" id="websiteStructuredData">\n${structuredData(route.title, canonical)}\n    </script>`);
    const outputDirectory = path.join(root, route.slug);
    fs.mkdirSync(outputDirectory, { recursive: true });
    fs.writeFileSync(path.join(outputDirectory, 'index.html'), html, 'utf8');
  }
}

function loadData() {
  const context = {};
  vm.createContext(context);
  const code = [
    fs.readFileSync(path.join(root, 'book-data.js'), 'utf8'),
    fs.readFileSync(path.join(root, 'curriculum-data.js'), 'utf8'),
    fs.readFileSync(path.join(root, 'macro-data.js'), 'utf8'),
    'this.__seoData = { bookChapters, bookConcepts, conceptChapterAssignments, fullBookOutline, chapterGuides, formulaCatalog, macroBookChapters, macroBookConcepts, macroFullBookOutline, macroChapterGuides, macroFormulaCatalog };'
  ].join('\n');
  vm.runInContext(code, context, { filename: 'seo-content-data.js' });
  return context.__seoData;
}

const brandMark = `
  <span class="brand-mark" aria-hidden="true">
    <svg viewBox="0 0 24 24" focusable="false"><path d="M2 4.5A2.5 2.5 0 0 1 4.5 2H9a3 3 0 0 1 3 3v17a3 3 0 0 0-3-3H4.5A2.5 2.5 0 0 0 2 21.5z"></path><path d="M22 4.5A2.5 2.5 0 0 0 19.5 2H15a3 3 0 0 0-3 3v17a3 3 0 0 1 3-3h4.5a2.5 2.5 0 0 1 2.5 2.5z"></path></svg>
  </span>`;

function contentSubjectGroup(slug, label, mark, canonical) {
  const subject = slug === 'makroekonomia' ? 'macro' : 'micro';
  const active = canonical.startsWith(`${siteUrl}/${slug}/`);
  return `<details class="content-subject-group${active ? ' active' : ''}">
      <summary><span>${mark}</span><strong>${label}</strong><i aria-hidden="true">⌄</i></summary>
      <div><a class="${active ? 'active' : ''}" href="/${slug}/">Wszystkie rozdziały</a><a href="/ucz-sie/?subject=${subject}">Ucz się</a><a href="/fiszki/?subject=${subject}">Fiszki</a><a href="/quizy/?subject=${subject}">Quiz</a><a href="/test/?subject=${subject}">Test</a><a href="/zagadnienia/?subject=${subject}">Zagadnienia</a></div>
    </details>`;
}

function pageShell({ title, description, canonical, body, pageType = 'WebPage', breadcrumbs = [], toolsPage = false }) {
  return `<!doctype html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8851383447848259" crossorigin="anonymous"></script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#f6f3ed" />
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="pl_PL" />
  <meta property="og:site_name" content="${siteName}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${siteUrl}/assets/og-nauka-ekonomii.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Nauka Ekonomii — mikroekonomia i makroekonomia bezpłatnie" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${siteUrl}/assets/og-nauka-ekonomii.png" />
  <link rel="canonical" href="${canonical}" />
  <link rel="icon" type="image/png" sizes="96x96" href="/assets/favicon-96.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <title>${escapeHtml(title)}</title>
  <script type="application/ld+json">${structuredData(title, canonical, pageType, breadcrumbs)}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/seo-content.css?v=20260905-navigation" />
  <link rel="stylesheet" href="/navigation-icons.css?v=20260905-sidebar" />
  <script defer src="/content-sidebar.js?v=20260905-1"></script>
${toolsPage ? '  <link rel="stylesheet" href="/economic-tools.css?v=20260905-1" /><script defer src="/economic-tools-math.js?v=20260905-1"></script><script defer src="/economic-tools.js?v=20260905-1"></script>' : ''}
</head>
<body class="content-page">
  <a class="skip-link" href="#tresc">Przejdź do treści</a>
  <div class="content-page-shell">
    <aside class="content-sidebar" aria-label="Nawigacja materiałów">
      <a class="content-brand content-sidebar-brand" href="/" aria-label="Nauka Ekonomii — strona główna">${brandMark}<span><b>Nauka Ekonomii</b></span></a>
      <nav class="content-sidebar-nav" aria-label="Główna nawigacja">
        <p>TWÓJ PANEL</p>
        <a class="content-home-link" href="/"><span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path class="icon-accent" d="M9 21v-6h6v6"/></svg></span><strong>Strona główna</strong></a>
        <p>DZIAŁY NAUKI</p>
        ${contentSubjectGroup('mikroekonomia', 'Mikroekonomia', 'μ', canonical)}
        ${contentSubjectGroup('makroekonomia', 'Makroekonomia', 'M', canonical)}
        <p>OLIMPIADA</p>
        <a class="content-owe-link" href="/arkusze-olimpijskie/"><span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 4h8v4a4 4 0 0 1-8 0z"/><path d="M8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4"/><path class="icon-accent" d="M12 12v5M8 21h8M9 17h6v4"/></svg></span><strong>Arkusze OWE</strong></a>
        <a class="content-owe-link" href="/olimpiada-zagadnienia/"><span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path class="icon-accent" d="M8 8h7M8 12h7M8 16h4"/></svg></span><strong>Zagadnienia</strong></a>
        <a class="content-owe-link" href="/olimpiada-fiszki/"><span aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="4" y="6" width="16" height="12" rx="2"/><path class="icon-accent" d="M7 3h10M7 21h10M8 10h8M8 14h5"/></svg></span><strong>Fiszki</strong></a>
        <a class="content-owe-link" href="/olimpiada-quiz/"><span aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6"/><path class="icon-accent" d="m9 16 2 2 4-4"/></svg></span><strong>Quiz</strong></a>
        <p>NARZĘDZIA</p>
        <a class="content-tool-link${canonical.endsWith('/narzedzia/kalkulator-elastycznosci-popytu/') ? ' active' : ''}" href="/narzedzia/kalkulator-elastycznosci-popytu/"><span aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="3"/><path d="M8 7h8M8 11h2M14 11h2M8 15h2M14 15h2M8 18h2M14 18h2"/></svg></span><strong>Elastyczność popytu</strong></a>
        <a class="content-tool-link${canonical.endsWith('/narzedzia/podaz-i-popyt/') ? ' active' : ''}" href="/narzedzia/podaz-i-popyt/"><span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 3v17h17M7 6l12 11M7 17 19 6"/></svg></span><strong>Podaż i popyt</strong></a>
      </nav>
      <div class="content-sidebar-foot"><span id="contentStreak">0</span><div><strong>Seria nauki</strong><small id="contentStreakLabel">Rozpocznij serię dziś</small></div></div>
    </aside>
    <div class="content-workspace">
      <header class="content-header">
        <a class="content-brand" href="/" aria-label="Nauka Ekonomii — strona główna">${brandMark}<span><b>Nauka Ekonomii</b></span></a>
        <nav aria-label="Wybierz dział"><a href="/mikroekonomia/">Mikroekonomia</a><a href="/makroekonomia/">Makroekonomia</a><a href="/narzedzia/">Narzędzia</a></nav>
      </header>
      <main id="tresc" class="content-main">${body}</main>
      <footer class="content-footer"><span>© 2026 Nauka Ekonomii</span><nav><a href="/zrodla-i-prawa/">Źródła i prawa</a><a href="/polityka-prywatnosci/">Prywatność</a></nav></footer>
    </div>
  </div>
</body>
</html>`;
}

function breadcrumbMarkup(items) {
  return `<nav class="breadcrumbs" aria-label="Okruszki">${items.map((item, index) => index === items.length - 1 ? `<span aria-current="page">${escapeHtml(item.name)}</span>` : `<a href="${item.path}">${escapeHtml(item.name)}</a>`).join('<i>›</i>')}</nav>`;
}

function subjectHub(subject) {
  const canonical = `${siteUrl}/${subject.slug}/`;
  const subjectId = subject.slug === 'makroekonomia' ? 'macro' : 'micro';
  const title = `${subject.name} — kurs, pojęcia i wzory | Nauka Ekonomii`;
  const description = `${subject.name} online bezpłatnie: ${subject.chapters.length} rozdziałów, ${subject.concepts.length} pojęć, ${subject.formulas.length} wzorów, streszczenia, fiszki i quizy.`;
  const crumbs = [{ name: siteName, url: `${siteUrl}/` }, { name: subject.name, url: canonical }];
  const cards = subject.chapters.map(chapter => {
    const slug = chapterPath(subject, chapter);
    const conceptCount = subject.conceptsForChapter(chapter.number).length;
    const formulaCount = subject.formulas.filter(item => item.chapter === chapter.number).length;
    return `<article class="chapter-card"><span>Rozdział ${chapter.number}</span><h2><a href="/${slug}/">${escapeHtml(chapter.title)}</a></h2><p>${escapeHtml(chapter.sections.slice(0, 3).join(' · '))}</p><small>${conceptCount} pojęć${formulaCount ? ` · ${formulaCount} wzorów` : ''}</small></article>`;
  }).join('\n');
  const body = `
    ${breadcrumbMarkup([{ name: 'Strona główna', path: '/' }, { name: subject.name, path: `/${subject.slug}/` }])}
    <section class="content-hero subject-hero"><div><span class="eyebrow">Bezpłatny kurs online</span><h1>${subject.name}</h1><p>${escapeHtml(subject.intro)}</p><div class="hero-actions"><a class="button primary" href="/ucz-sie/?subject=${subjectId}">Rozpocznij naukę</a><a class="button" href="/quizy/?subject=${subjectId}">Sprawdź wiedzę</a></div></div><dl class="subject-stats"><div><dt>Rozdziały</dt><dd>${subject.chapters.length}</dd></div><div><dt>Pojęcia</dt><dd>${subject.concepts.length}</dd></div><div><dt>Wzory</dt><dd>${subject.formulas.length}</dd></div></dl></section>
    <section class="content-section tool-section subject-tools-section"><div class="section-title"><span>Szybki start</span><h2>Jak chcesz się uczyć?</h2></div><div class="tool-links"><a href="/ucz-sie/?subject=${subjectId}"><b>Ucz się</b><span>Adaptacyjna sesja dopasowana do postępu.</span></a><a href="/fiszki/?subject=${subjectId}"><b>Fiszki</b><span>Powtarzaj definicje i oznaczaj trudne pojęcia.</span></a><a href="/quizy/?subject=${subjectId}"><b>Quiz</b><span>Sprawdź wynik od razu po odpowiedzi.</span></a><a href="/test/?subject=${subjectId}"><b>Test</b><span>Samodzielnie wpisuj odpowiedzi.</span></a><a href="/zagadnienia/?subject=${subjectId}"><b>Zagadnienia</b><span>Przejrzyj słownik najważniejszych pojęć.</span></a></div></section>
    <section class="content-section"><div class="section-title"><span>Ścieżka nauki</span><h2>Wszystkie rozdziały ${subject.genitive}</h2><p>Zacznij od podstaw albo przejdź prosto do tematu, który chcesz powtórzyć.</p></div><div class="chapter-grid">${cards}</div></section>`;
  return pageShell({ title, description, canonical, body, pageType: 'CollectionPage', breadcrumbs: crumbs });
}

function chapterPath(subject, chapter) {
  return `${subject.slug}/rozdzial-${chapter.number}-${slugify(chapter.title)}`;
}

function chapterPage(subject, chapter, index) {
  const route = chapterPath(subject, chapter);
  const canonical = `${siteUrl}/${route}/`;
  const subjectId = subject.slug === 'makroekonomia' ? 'macro' : 'micro';
  const outline = subject.outlines.find(item => item.number === chapter.number) || { topics: chapter.sections, pages: chapter.pages || '' };
  const guide = subject.guides.find(item => item.number === chapter.number) || { overview: chapter.sections.join('. '), qa: [] };
  const concepts = subject.conceptsForChapter(chapter.number);
  const formulas = subject.formulas.filter(item => item.chapter === chapter.number);
  const title = `${chapter.title} — ${subject.name.toLowerCase()} | Nauka Ekonomii`;
  const description = `${guide.overview} Poznaj kluczowe pojęcia, pytania kontrolne${formulas.length ? ' i wzory' : ''} z rozdziału ${chapter.number}.`.slice(0, 300);
  const breadcrumbs = [
    { name: siteName, url: `${siteUrl}/` },
    { name: subject.name, url: `${siteUrl}/${subject.slug}/` },
    { name: `Rozdział ${chapter.number}`, url: canonical }
  ];
  const topicItems = (outline.topics || chapter.sections).map(topic => `<li>${escapeHtml(topic)}</li>`).join('');
  const questions = guide.qa.map(([question, answer]) => `<details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`).join('\n');
  const conceptItems = concepts.length
    ? concepts.map(item => `<div><dt>${escapeHtml(item.term)}</dt><dd>${escapeHtml(item.definition)}</dd></div>`).join('\n')
    : '<p>Kluczowe pojęcia z tego rozdziału są objaśniane w pytaniach kontrolnych i streszczeniu.</p>';
  const formulaItems = formulas.map(item => `<article><span>${escapeHtml(item.group)}</span><h3>${escapeHtml(item.name)}</h3><code>${escapeHtml(item.formula)}</code><p>${escapeHtml(item.variables)}</p><small>${escapeHtml(item.use)}</small></article>`).join('\n');
  const previous = subject.chapters[index - 1];
  const next = subject.chapters[index + 1];
  const pager = `<nav class="chapter-pagination" aria-label="Nawigacja między rozdziałami">${previous ? `<a href="/${chapterPath(subject, previous)}/"><span>← Poprzedni</span><b>${escapeHtml(previous.title)}</b></a>` : '<span></span>'}${next ? `<a class="next" href="/${chapterPath(subject, next)}/"><span>Następny →</span><b>${escapeHtml(next.title)}</b></a>` : '<span></span>'}</nav>`;
  const body = `
    ${breadcrumbMarkup([{ name: 'Strona główna', path: '/' }, { name: subject.name, path: `/${subject.slug}/` }, { name: `Rozdział ${chapter.number}`, path: `/${route}/` }])}
    <article class="chapter-article">
      <header class="content-hero chapter-hero"><div><span class="eyebrow">${escapeHtml(subject.name)} · rozdział ${chapter.number}</span><h1>${escapeHtml(chapter.title)}</h1><p>${escapeHtml(guide.overview)}</p><div class="hero-actions"><a class="button primary" href="/ucz-sie/?subject=${subjectId}">Ucz się aktywnie</a><a class="button" href="/quizy/?subject=${subjectId}">Rozwiąż quiz</a></div></div><aside><span>W tym opracowaniu</span><b>${concepts.length} pojęć</b><b>${guide.qa.length} pytań kontrolnych</b>${formulas.length ? `<b>${formulas.length} wzorów</b>` : ''}${outline.pages ? `<small>Zakres źródłowy: s. ${escapeHtml(outline.pages)}</small>` : ''}</aside></header>
      <div class="article-layout"><div class="article-body">
        <section id="zakres" class="content-section"><div class="section-title"><span>Zakres</span><h2>Czego dotyczy ten rozdział?</h2></div><ul class="topic-list">${topicItems}</ul></section>
        ${questions ? `<section id="pytania" class="content-section"><div class="section-title"><span>Sprawdź rozumienie</span><h2>Pytania i odpowiedzi</h2></div><div class="qa-list">${questions}</div></section>` : ''}
        <section id="pojecia" class="content-section"><div class="section-title"><span>Słownik</span><h2>Najważniejsze pojęcia</h2></div><dl class="concept-list">${conceptItems}</dl></section>
        ${formulas.length ? `<section id="wzory" class="content-section"><div class="section-title"><span>Obliczenia</span><h2>Wzory i zastosowania</h2></div><div class="formula-list">${formulaItems}</div></section>` : ''}
        <aside class="source-note"><b>Jak korzystać z materiału?</b><p>Najpierw przeczytaj streszczenie, następnie odpowiedz samodzielnie na pytania i dopiero potem rozwiń odpowiedzi. Definicje są autorskim opracowaniem dydaktycznym; pełna bibliografia znajduje się na stronie źródeł.</p><a href="/zrodla-i-prawa/">Zobacz źródła i zasady opracowania →</a></aside>
      </div><nav class="article-toc" aria-label="Spis treści strony"><b>Na tej stronie</b><a href="#zakres">Zakres rozdziału</a>${questions ? '<a href="#pytania">Pytania i odpowiedzi</a>' : ''}<a href="#pojecia">Najważniejsze pojęcia</a>${formulas.length ? '<a href="#wzory">Wzory</a>' : ''}<a href="/${subject.slug}/">Wszystkie rozdziały</a></nav></div>
      ${pager}
    </article>`;
  return pageShell({ title, description, canonical, body, breadcrumbs });
}

function writeContentPages() {
  const data = loadData();
  const subjects = [
    {
      slug: 'mikroekonomia', name: 'Mikroekonomia', genitive: 'mikroekonomii',
      intro: 'Zrozum decyzje konsumentów i przedsiębiorstw, działanie rynków, konkurencję, podatki, handel oraz zawodności rynku. Każdy rozdział łączy krótkie wyjaśnienie z pojęciami, pytaniami kontrolnymi i wzorami.',
      chapters: data.bookChapters, concepts: data.bookConcepts, outlines: data.fullBookOutline,
      guides: data.chapterGuides, formulas: data.formulaCatalog,
      conceptsForChapter: number => data.bookConcepts.filter(item => data.conceptChapterAssignments[item.term] === number)
    },
    {
      slug: 'makroekonomia', name: 'Makroekonomia', genitive: 'makroekonomii',
      intro: 'Poznaj PKB, inflację, bezrobocie, wzrost, pieniądz, finanse publiczne i politykę gospodarczą. Materiał jest podzielony na przejrzyste rozdziały ze streszczeniami, pytaniami, definicjami i wzorami.',
      chapters: data.macroBookChapters, concepts: data.macroBookConcepts, outlines: data.macroFullBookOutline,
      guides: data.macroChapterGuides, formulas: data.macroFormulaCatalog,
      conceptsForChapter: number => data.macroBookConcepts.filter(item => item.chapter === number)
    }
  ];
  const urls = [];
  for (const subject of subjects) {
    const hubDirectory = path.join(root, subject.slug);
    fs.mkdirSync(hubDirectory, { recursive: true });
    fs.writeFileSync(path.join(hubDirectory, 'index.html'), subjectHub(subject), 'utf8');
    urls.push(`/${subject.slug}/`);
    subject.chapters.forEach((chapter, index) => {
      const route = chapterPath(subject, chapter);
      const outputDirectory = path.join(root, ...route.split('/'));
      fs.mkdirSync(outputDirectory, { recursive: true });
      fs.writeFileSync(path.join(outputDirectory, 'index.html'), chapterPage(subject, chapter, index), 'utf8');
      urls.push(`/${route}/`);
    });
  }
  return urls;
}

function writeToolPages() {
  return require('./economic-tools-pages.cjs').map(tool => {
    const canonical = `${siteUrl}/${tool.slug}/`;
    const crumbs = [{name:siteName,url:`${siteUrl}/`},{name:'Narzędzia',url:`${siteUrl}/narzedzia/`}];
    if (tool.slug !== 'narzedzia') crumbs.push({name:tool.label,url:canonical});
    const body = breadcrumbMarkup(crumbs.map(item => ({name:item.name,path:new URL(item.url).pathname}))) + tool.body;
    const directory = path.join(root, tool.slug);
    fs.mkdirSync(directory, {recursive:true});
    fs.writeFileSync(path.join(directory,'index.html'), pageShell({...tool, canonical, body, toolsPage:true, breadcrumbs:crumbs}), 'utf8');
    return `/${tool.slug}/`;
  });
}

function writeSitemap(contentUrls) {
  const appUrls = appRoutes.filter(route => route.indexable).map(route => `/${route.slug}/`);
  const urls = ['/', ...appUrls, ...contentUrls];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url>\n    <loc>${escapeXml(`${siteUrl}${url}`)}</loc>\n  </url>`).join('\n')}\n</urlset>\n`;
  fs.writeFileSync(path.join(root, 'sitemap.xml'), xml, 'utf8');
  return urls.length;
}

writeAppRoutes();
const contentUrls = [...writeContentPages(), ...writeToolPages()];
const sitemapCount = writeSitemap(contentUrls);
console.log(`Wygenerowano ${appRoutes.length} podstron aplikacji, ${contentUrls.length} stron treści i sitemapę z ${sitemapCount} adresami.`);
