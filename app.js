const $ = selector => document.querySelector(selector);

const publicModeRoutes = {
  home: {
    slug: '',
    title: 'Nauka ekonomii online — mikroekonomia i makroekonomia',
    description: 'Darmowa nauka ekonomii online: mikroekonomia, makroekonomia, pojęcia, wzory, fiszki, quizy, testy i pytania Olimpiady Wiedzy Ekonomicznej.'
  },
  learn: {
    slug: 'ucz-sie/',
    title: 'Nauka ekonomii online — tryb adaptacyjny | Nauka Ekonomii',
    description: 'Ucz się mikroekonomii i makroekonomii online bez logowania. Adaptacyjne pytania wracają do zagadnień, które wymagają powtórki.'
  },
  flashcards: {
    slug: 'fiszki/',
    title: 'Fiszki z mikroekonomii i makroekonomii | Nauka Ekonomii',
    description: '487 bezpłatnych fiszek z mikroekonomii i makroekonomii. Powtarzaj pojęcia, oznaczaj trudne zagadnienia i zapisuj postęp bez logowania.'
  },
  quiz: {
    slug: 'quizy/',
    title: 'Quiz z mikroekonomii i makroekonomii online | Nauka Ekonomii',
    description: 'Bezpłatny quiz z mikroekonomii i makroekonomii z natychmiastowym wynikiem. Wybierz zakres i sprawdź wiedzę bez zakładania konta.'
  },
  owe: {
    slug: 'arkusze-olimpijskie/',
    title: 'Arkusze Olimpiady Wiedzy Ekonomicznej | Nauka Ekonomii',
    description: 'Rozwiązuj 300 pytań opartych na archiwalnych arkuszach Olimpiady Wiedzy Ekonomicznej i od razu sprawdzaj odpowiedzi.'
  },
  olympiadConcepts: {
    slug: 'olimpiada-zagadnienia/',
    title: 'Zagadnienia do Olimpiady Wiedzy Ekonomicznej | Nauka Ekonomii',
    description: '155 sprawdzonych definicji pojęć ekonomicznych do przygotowań do Olimpiady Wiedzy Ekonomicznej.'
  },
  olympiadFlashcards: {
    slug: 'olimpiada-fiszki/',
    title: 'Fiszki do Olimpiady Wiedzy Ekonomicznej | Nauka Ekonomii',
    description: '155 interaktywnych fiszek z pojęć wymaganych podczas przygotowań do Olimpiady Wiedzy Ekonomicznej.'
  },
  olympiadQuiz: {
    slug: 'olimpiada-quiz/',
    title: 'Quiz do Olimpiady Wiedzy Ekonomicznej | Nauka Ekonomii',
    description: '195 pytań quizowych z definicji i zastosowań pojęć do Olimpiady Wiedzy Ekonomicznej.'
  },
  concepts: {
    slug: 'zagadnienia/',
    title: 'Pojęcia z mikroekonomii i makroekonomii — słownik | Nauka Ekonomii',
    description: 'Słownik 487 pojęć z mikroekonomii i makroekonomii. Znajdź krótkie definicje i przejdź do odpowiedniego rozdziału.'
  },
  more: {
    slug: 'wiecej/',
    title: 'Narzędzia do nauki ekonomii | Nauka Ekonomii',
    description: 'Testy, wyszukiwarka odpowiedzi, streszczenia, wzory matematyczne oraz informacje o źródłach w jednym miejscu.'
  },
  test: {
    slug: 'test/',
    title: 'Test z mikroekonomii i makroekonomii online | Nauka Ekonomii',
    description: 'Bezpłatny test z mikroekonomii i makroekonomii. Samodzielnie wpisuj nazwy pojęć, sprawdzaj odpowiedzi i utrwalaj materiał.'
  },
  answers: {
    slug: 'odpowiedzi/',
    title: 'Odpowiedzi z ekonomii | Nauka Ekonomii',
    description: 'Wyszukuj odpowiedzi na pytania z ekonomii i przechodź do właściwych zagadnień oraz rozdziałów.',
    indexable: false
  },
  scope: {
    slug: 'zakres-i-streszczenia/',
    title: 'Streszczenia z mikroekonomii i makroekonomii | Nauka Ekonomii',
    description: 'Przeglądaj zakres i najważniejsze wnioski z 37 rozdziałów mikroekonomii i makroekonomii.'
  },
  math: {
    slug: 'wzory-matematyczne/',
    title: 'Wzory z mikroekonomii i makroekonomii | Nauka Ekonomii',
    description: '94 wzory z mikroekonomii i makroekonomii wraz z opisem zmiennych, interpretacją i zastosowaniem.'
  },
  legal: {
    slug: 'zrodla-i-prawa/',
    title: 'Źródła, prawa i prywatność | Nauka Ekonomii',
    description: 'Bibliografia, prawa autorskie, zasady opracowania treści oraz informacja o przetwarzaniu danych w serwisie Nauka Ekonomii.'
  }
};
const modeByRouteSlug = Object.fromEntries(
  Object.entries(publicModeRoutes)
    .filter(([, route]) => route.slug)
    .map(([mode, route]) => [route.slug.replace(/\/$/, ''), mode])
);
const legacyOlympiadHashModes = {
  '#arkusze': 'owe',
  '#pojecia': 'olympiadConcepts',
  '#fiszki': 'olympiadFlashcards',
  '#quizy': 'olympiadQuiz'
};
const siteBaseUrl = document.querySelector('base')?.href || new URL('./', window.location.href).href;

function publicModeFromLocation() {
  const slug = decodeURIComponent(window.location.pathname.replace(/\/+$/, '').split('/').pop() || '');
  if (slug === 'arkusze-olimpijskie' && legacyOlympiadHashModes[window.location.hash]) {
    return legacyOlympiadHashModes[window.location.hash];
  }
  return modeByRouteSlug[slug] || 'home';
}

function applyPublicModeMetadata(mode) {
  const route = publicModeRoutes[mode];
  if (!route) return;
  const canonicalUrl = new URL(route.slug, 'https://naukaekonomii.pl/').href;
  document.title = route.title;
  const description = document.querySelector('meta[name="description"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const ogUrl = document.querySelector('meta[property="og:url"]');
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  const twitterDescription = document.querySelector('meta[name="twitter:description"]');
  const robots = document.querySelector('meta[name="robots"]');
  const canonical = document.querySelector('link[rel="canonical"]');
  const structuredDataElement = document.querySelector('#websiteStructuredData');
  if (description) description.content = route.description;
  if (ogTitle) ogTitle.content = route.title;
  if (ogDescription) ogDescription.content = route.description;
  if (ogUrl) ogUrl.content = canonicalUrl;
  if (twitterTitle) twitterTitle.content = route.title;
  if (twitterDescription) twitterDescription.content = route.description;
  if (robots) robots.content = route.indexable === false ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
  if (canonical) canonical.href = canonicalUrl;
  if (structuredDataElement) {
    structuredDataElement.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': 'https://naukaekonomii.pl/#organization',
          url: 'https://naukaekonomii.pl/',
          name: 'Nauka Ekonomii',
          alternateName: 'NaukaEkonomii.pl',
          logo: {
            '@type': 'ImageObject',
            url: 'https://naukaekonomii.pl/assets/logo-square-512.png',
            width: 512,
            height: 512
          }
        },
        {
          '@type': 'WebSite',
          '@id': 'https://naukaekonomii.pl/#website',
          url: 'https://naukaekonomii.pl/',
          name: 'Nauka Ekonomii',
          alternateName: ['NaukaEkonomii.pl', 'naukaekonomii.pl'],
          description: 'Bezpłatna platforma do nauki mikroekonomii i makroekonomii.',
          inLanguage: 'pl-PL',
          publisher: { '@id': 'https://naukaekonomii.pl/#organization' }
        },
        {
          '@type': 'WebPage',
          '@id': `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: route.title.replace(/ \| (?:NaukaEkonomii\.pl|Nauka Ekonomii)$/, ''),
          isPartOf: { '@id': 'https://naukaekonomii.pl/#website' },
          inLanguage: 'pl-PL'
        }
      ]
    });
  }
}

function updatePublicModeRoute(mode) {
  const route = publicModeRoutes[mode];
  if (!route) return;
  const target = new URL(route.slug, siteBaseUrl);
  if (window.location.pathname !== target.pathname) {
    window.location.replace(target.href);
    return;
  }
  applyPublicModeMetadata(mode);
}

const storageKey = 'mankiw-taylor-study-progress-v14';
const legacyStorageKeys = ['mankiw-taylor-study-progress-v13', 'mankiw-taylor-study-progress-v12', 'mankiw-taylor-study-progress-v11', 'mankiw-taylor-study-progress-v9', 'mankiw-taylor-study-progress-v7', 'mankiw-taylor-study-progress-v5'];
const studyRewardSeconds = 15 * 60;
const studyRewardPoints = 20;
const boostDurationMs = 30 * 60 * 1000;
const notificationStorageKey = 'mankiw-taylor-notifications-v1';
const notificationReadStorageKey = 'mankiw-taylor-notifications-read-v1';
const flashcardDirectionStorageKey = 'mankiw-taylor-flashcard-direction-v1';
const subjectStorageKey = 'ekonomia-active-subject-v1';
const themeStorageKey = 'ekonomia-theme-v1';
const learnKnowledgeStorageKey = 'ekonomia-learn-knowledge-v1';
const oweQuestions = [
  ...(Array.isArray(window.OWE_QUESTIONS) ? window.OWE_QUESTIONS : []),
  ...(Array.isArray(window.OWE_EXTRA_QUESTIONS) ? window.OWE_EXTRA_QUESTIONS : []),
  ...(Array.isArray(window.OWE_MISSING_QUESTIONS) ? window.OWE_MISSING_QUESTIONS : [])
];

const siteUpdateNotifications = [
  {
    id: 'update-quests-and-owe-points-2026-09-01',
    type: 'update',
    title: 'Questy, skrzynki i arkusze olimpijskie',
    message: 'Ukończ cele, otwieraj skrzynki z nagrodami 50–200 pkt i zdobywaj punkty także w arkuszach olimpijskich.',
    createdAt: '2026-09-01T12:00:00+02:00'
  },
  {
    id: 'update-reversed-flashcards-2026-08-17',
    type: 'update',
    title: 'Odwrócona kolejność fiszek',
    message: 'Na fiszce możesz teraz ustawić, czy najpierw widzisz zagadnienie, czy jego wyjaśnienie.',
    createdAt: '2026-08-17T22:00:00+02:00'
  },
  {
    id: 'update-clean-menu-2026-08-17',
    type: 'update',
    title: 'Nowe, czystsze menu',
    message: 'Nawigacja, punkty, lokalny postęp i powiadomienia są teraz dostępne w jednym miejscu.',
    createdAt: '2026-08-17T20:45:00+02:00'
  },
  {
    id: 'update-study-tools-2026-08-16',
    type: 'update',
    title: 'Tryb skupienia i dzienny boost',
    message: 'Fiszki i quiz mają tryb skupienia, a raz dziennie możesz włączyć mnożnik punktów ×2.',
    createdAt: '2026-08-16T18:00:00+02:00'
  }
];

const ranks = [
  { name: 'Początkujący', threshold: 0, emblem: 'I', description: 'Poznajesz podstawy i budujesz pierwszy rytm nauki.' },
  { name: 'Adept', threshold: 100, emblem: 'II', description: 'Regularnie wracasz do pojęć, quizów i powtórek.' },
  { name: 'Analityk', threshold: 300, emblem: 'III', description: 'Łączysz teorię z zadaniami i coraz trafniej analizujesz problemy.' },
  { name: 'Ekonomista', threshold: 700, emblem: 'IV', description: 'Swobodnie poruszasz się między mikro- i makroekonomią.' },
  { name: 'Strateg', threshold: 1200, emblem: 'V', description: 'Rozwiązujesz złożone zestawy i planujesz skuteczne powtórki.' },
  { name: 'Mistrz ekonomii', threshold: 2000, emblem: 'VI', description: 'Masz szeroką, utrwaloną wiedzę i wysoką skuteczność.' },
  { name: 'Olimpijczyk', threshold: 3500, emblem: 'VII', description: 'Osiągasz poziom przygotowania do najtrudniejszych arkuszy olimpijskich.' }
];

const questPool = [
  {
    id: 'daily-quiz-sprint-2',
    code: 'QZ',
    title: 'Quizowy sprint',
    description: 'Ukończ dziś 2 quizy z mikro- lub makroekonomii.',
    metric: 'completedQuizzes',
    target: 2
  },
  {
    id: 'daily-owe-training-1',
    code: 'OLI',
    title: 'Trening olimpijczyka',
    description: 'Ukończ dziś 1 arkusz olimpijski.',
    metric: 'completedOweQuizzes',
    target: 1
  },
  {
    id: 'daily-focus-quarter-1',
    code: '15′',
    title: 'Kwadrans skupienia',
    description: 'Zdobądź dziś premię za 15 minut aktywnej nauki.',
    metric: 'awardedStudyBlocks',
    target: 1
  },
  {
    id: 'daily-learn-path-1',
    code: '↗',
    title: 'Regularna nauka',
    description: 'Doprowadź dziś do końca 1 sesję w trybie Ucz się.',
    metric: 'completedLearnSessions',
    target: 1
  },
  {
    id: 'daily-written-test-1',
    code: 'ABC',
    title: 'Próba bez podpowiedzi',
    description: 'Ukończ dziś 1 test z samodzielnym wpisywaniem odpowiedzi.',
    metric: 'completedTests',
    target: 1
  },
  {
    id: 'daily-flashcards-5',
    code: '▱',
    title: 'Piątka fiszek',
    description: 'Opanuj dziś 5 nowych fiszek.',
    metric: 'awardedFlashcards',
    target: 5
  },
  {
    id: 'daily-quiz-marathon-4',
    code: '4×',
    title: 'Quizowy maraton',
    description: 'Ukończ dziś 4 quizy z dowolnych rozdziałów.',
    metric: 'completedQuizzes',
    target: 4
  },
  {
    id: 'daily-owe-double-2',
    code: 'II',
    title: 'Podwójny olimpijski',
    description: 'Ukończ dziś 2 treningi z arkuszy olimpijskich.',
    metric: 'completedOweQuizzes',
    target: 2
  },
  {
    id: 'daily-learn-double-2',
    code: '2×',
    title: 'Dwie sesje nauki',
    description: 'Ukończ dziś 2 sesje w adaptacyjnym trybie Ucz się.',
    metric: 'completedLearnSessions',
    target: 2
  },
  {
    id: 'daily-test-double-2',
    code: 'T2',
    title: 'Podwójna próba',
    description: 'Ukończ dziś 2 testy z wpisywaniem odpowiedzi.',
    metric: 'completedTests',
    target: 2
  }
];

const escapeHtml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const shuffle = list => {
  const result = [...list];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
};

const polishCount = (number, one, few, many) => {
  if (number === 1) return `${number} ${one}`;
  const lastTwo = number % 100;
  const last = number % 10;
  if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return `${number} ${few}`;
  return `${number} ${many}`;
};

function loadRuntimeNotifications() {
  try {
    const value = JSON.parse(localStorage.getItem(notificationStorageKey) || '[]');
    return Array.isArray(value) ? value
      .filter(item => item && typeof item.id === 'string')
      .filter(item => !(
        item.type === 'info'
        && (item.title === 'Włączono: Mikroekonomia' || item.title === 'Włączono: Makroekonomia')
      ))
      .slice(0, 30) : [];
  } catch {
    return [];
  }
}

function loadReadNotificationIds() {
  try {
    const value = JSON.parse(localStorage.getItem(notificationReadStorageKey) || '[]');
    return new Set(Array.isArray(value) ? value.filter(item => typeof item === 'string') : []);
  } catch {
    return new Set();
  }
}

function notificationDateLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const today = localDateKey();
  if (localDateKey(date) === today) return `Dzisiaj, ${date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`;
  return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
}

function allNotifications() {
  return [...runtimeNotifications, ...siteUpdateNotifications]
    .filter((item, index, items) => items.findIndex(candidate => candidate.id === item.id) === index)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function renderNotifications() {
  const list = $('#notificationList');
  if (!list) return;
  const notifications = allNotifications();
  list.innerHTML = notifications.length ? notifications.map(item => {
    const unread = !readNotificationIds.has(item.id);
    return `
      <article class="notification-item ${unread ? 'unread' : ''}">
        <span class="notification-dot" aria-hidden="true"></span>
        <div class="notification-copy">
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.message)}</p>
          <time datetime="${escapeHtml(item.createdAt)}">${escapeHtml(notificationDateLabel(item.createdAt))}</time>
        </div>
      </article>
    `;
  }).join('') : '<p class="notification-empty">Nie masz jeszcze żadnych powiadomień.</p>';

  const unreadCount = notifications.filter(item => !readNotificationIds.has(item.id)).length;
  ['#menuUnreadBadge', '#notificationUnreadBadge'].forEach(selector => {
    const badge = $(selector);
    if (!badge) return;
    badge.hidden = unreadCount === 0;
    badge.textContent = unreadCount > 9 ? '9+' : String(unreadCount);
  });
}

function addNotification({ title, message, type = 'info' }) {
  const notification = {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    title,
    message,
    createdAt: new Date().toISOString()
  };
  runtimeNotifications = [notification, ...runtimeNotifications].slice(0, 30);
  localStorage.setItem(notificationStorageKey, JSON.stringify(runtimeNotifications));
  renderNotifications();
}

function markAllNotificationsRead() {
  allNotifications().forEach(item => readNotificationIds.add(item.id));
  localStorage.setItem(notificationReadStorageKey, JSON.stringify([...readNotificationIds]));
  renderNotifications();
}

const blankProgress = () => ({
  mastered: [],
  starred: [],
  points: 0,
  awardedFlashcards: [],
  completedQuizzes: 0,
  completedOweQuizzes: 0,
  completedTests: 0,
  completedLearnSessions: 0,
  studySeconds: 0,
  awardedStudyBlocks: 0,
  boostActivatedOn: '',
  boostEndsAt: '',
  dailyStreak: 0,
  bestDailyStreak: 0,
  lastStudyDate: '',
  dailyQuestDate: '',
  dailyQuestIds: [],
  dailyQuestBaseline: {},
  questRewards: {}
});

const normalizeProgress = value => {
  const parsed = value && typeof value === 'object' ? value : {};
  return {
    mastered: Array.isArray(parsed.mastered) ? parsed.mastered.filter(item => typeof item === 'string') : [],
    starred: Array.isArray(parsed.starred) ? parsed.starred.filter(item => typeof item === 'string') : [],
    points: Number.isFinite(parsed.points) ? Math.max(0, Math.floor(parsed.points)) : 0,
    awardedFlashcards: Array.isArray(parsed.awardedFlashcards) ? parsed.awardedFlashcards.filter(item => typeof item === 'string') : [],
    completedQuizzes: Number.isFinite(parsed.completedQuizzes) ? Math.max(0, Math.floor(parsed.completedQuizzes)) : 0,
    completedOweQuizzes: Number.isFinite(parsed.completedOweQuizzes) ? Math.max(0, Math.floor(parsed.completedOweQuizzes)) : 0,
    completedTests: Number.isFinite(parsed.completedTests) ? Math.max(0, Math.floor(parsed.completedTests)) : 0,
    completedLearnSessions: Number.isFinite(parsed.completedLearnSessions) ? Math.max(0, Math.floor(parsed.completedLearnSessions)) : 0,
    studySeconds: Number.isFinite(parsed.studySeconds) ? Math.max(0, parsed.studySeconds) : 0,
    awardedStudyBlocks: Number.isFinite(parsed.awardedStudyBlocks) ? Math.max(0, Math.floor(parsed.awardedStudyBlocks)) : 0,
    boostActivatedOn: typeof parsed.boostActivatedOn === 'string' ? parsed.boostActivatedOn : '',
    boostEndsAt: typeof parsed.boostEndsAt === 'string' ? parsed.boostEndsAt : '',
    dailyStreak: Number.isFinite(parsed.dailyStreak) ? Math.max(0, Math.floor(parsed.dailyStreak)) : 0,
    bestDailyStreak: Number.isFinite(parsed.bestDailyStreak) ? Math.max(0, Math.floor(parsed.bestDailyStreak)) : 0,
    lastStudyDate: typeof parsed.lastStudyDate === 'string' ? parsed.lastStudyDate : '',
    dailyQuestDate: typeof parsed.dailyQuestDate === 'string' ? parsed.dailyQuestDate : '',
    dailyQuestIds: Array.isArray(parsed.dailyQuestIds)
      ? [...new Set(parsed.dailyQuestIds.filter(item => typeof item === 'string'))].slice(0, 3)
      : [],
    dailyQuestBaseline: parsed.dailyQuestBaseline && typeof parsed.dailyQuestBaseline === 'object' && !Array.isArray(parsed.dailyQuestBaseline)
      ? Object.fromEntries(Object.entries(parsed.dailyQuestBaseline)
        .filter(([id, baseline]) => typeof id === 'string' && Number.isFinite(baseline) && baseline >= 0)
        .map(([id, baseline]) => [id, Math.floor(baseline)]))
      : {},
    questRewards: parsed.questRewards && typeof parsed.questRewards === 'object' && !Array.isArray(parsed.questRewards)
      ? Object.fromEntries(Object.entries(parsed.questRewards)
        .filter(([id, reward]) => typeof id === 'string' && Number.isFinite(reward) && reward >= 50 && reward <= 200)
        .map(([id, reward]) => [id, Math.floor(reward)]))
      : {}
  };
};

const loadProgress = () => {
  try {
    const saved = localStorage.getItem(storageKey)
      || legacyStorageKeys.map(key => localStorage.getItem(key)).find(Boolean)
      || '{}';
    return normalizeProgress(JSON.parse(saved));
  } catch {
    return blankProgress();
  }
};

let progress = loadProgress();
let selectedFlashcardChapter = 'all';
let selectedLearnChapter = 'all';
let selectedLearnGoal = '10';
let learnSessionState = null;
let showStarredOnly = false;
let cardTransitioning = false;
let selectedQuizChapter = 'all';
let selectedQuizLength = 20;
let selectedOweQuizDifficulty = 'all';
let oweQuizState = null;
let activeQuestOpening = '';
let questRewardTimer = null;
let lastQuestTrigger = null;
let currentCard = 0;
let flashcardDefinitionFirst = false;
try {
  flashcardDefinitionFirst = localStorage.getItem(flashcardDirectionStorageKey) === 'definition-first';
} catch {
  flashcardDefinitionFirst = false;
}
let quizSet = [];
let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;
let quizRewardGranted = false;
let quizBasePoints = 0;
let lastStudyTick = Date.now();
let unsavedStudySeconds = 0;
let selectedAnswerChapter = 'all';
let selectedMathChapter = 'all';
let selectedTestChapter = 'all';
let selectedTestLength = 10;
let testSet = [];
let testIndex = 0;
let testScore = 0;
let testAnswered = false;
let testRewardGranted = false;
let testBasePoints = 0;
let runtimeNotifications = loadRuntimeNotifications();
let readNotificationIds = loadReadNotificationIds();
let activeSubject = 'micro';
try {
  const requestedSubject = new URLSearchParams(window.location.search).get('subject');
  activeSubject = requestedSubject === 'macro' || requestedSubject === 'micro'
    ? requestedSubject
    : localStorage.getItem(subjectStorageKey) === 'macro' ? 'macro' : 'micro';
} catch {
  activeSubject = 'micro';
}

function loadLearnKnowledge() {
  try {
    const parsed = JSON.parse(localStorage.getItem(learnKnowledgeStorageKey) || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => value && typeof value === 'object'));
  } catch {
    return {};
  }
}

let learnKnowledge = loadLearnKnowledge();

function applyTheme(theme, { persist = true } = {}) {
  const dark = theme === 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  const toggle = $('#darkModeToggle');
  if (toggle) toggle.checked = dark;
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.content = dark ? '#111817' : '#f6f3ed';
  if (persist) {
    try { localStorage.setItem(themeStorageKey, dark ? 'dark' : 'light'); } catch {}
  }
}

function initializeTheme() {
  let savedTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  try { savedTheme = localStorage.getItem(themeStorageKey) === 'dark' ? 'dark' : 'light'; } catch {}
  applyTheme(savedTheme, { persist: false });
}

const normalizeText = value => String(value)
  .toLocaleLowerCase('pl-PL')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replaceAll('ł', 'l')
  .replace(/[^a-z0-9ąćęłńóśźż]+/gi, ' ')
  .trim();

const searchTokens = value => normalizeText(value)
  .split(/\s+/)
  .filter(token => token.length > 2 && !['jak', 'czy', 'dla', 'oraz', 'jest', 'sie', 'tego', 'ktory', 'ktore', 'czym'].includes(token));

const subjectCatalog = {
  micro: {
    id: 'micro',
    label: 'Mikroekonomia',
    mark: 'μ',
    chapters: bookChapters,
    concepts: bookConcepts,
    outline: fullBookOutline,
    guides: chapterGuides,
    formulas: formulaCatalog,
    conceptAssignments: conceptChapterAssignments
  },
  macro: {
    id: 'macro',
    label: 'Makroekonomia',
    mark: 'M',
    chapters: macroBookChapters,
    concepts: macroBookConcepts,
    outline: macroFullBookOutline,
    guides: macroChapterGuides,
    formulas: macroFormulaCatalog,
    conceptAssignments: Object.fromEntries(macroBookConcepts.map(item => [item.term, item.chapter]))
  }
};

const subjectData = (subject = activeSubject) => subjectCatalog[subject] || subjectCatalog.micro;
const chapterByNumber = (number, subject = activeSubject) => subjectData(subject).chapters.find(chapter => chapter.number === Number(number));
const currentStudyCards = () => studyCards.filter(item => item.subject === activeSubject);
const currentAnswerEntries = () => allAnswerEntries.filter(item => item.subject === activeSubject);

const topicExplanationRules = [
  { chapter: 1, terms: ['koszt alternatywny'], answer: 'Koszt alternatywny to wartość najlepszej niewybranej możliwości. Oceniając decyzję, porównuje się korzyść z wybranego działania z tym, z czego trzeba zrezygnować.' },
  { chapter: 1, terms: ['analiza marginalna'], answer: 'Decyzja marginalna dotyczy małej zmiany działania. Jest racjonalna, gdy dodatkowa korzyść przewyższa dodatkowy koszt; optimum występuje w punkcie ich zrównania.' },
  { chapter: 1, terms: ['bodzce'], answer: 'Bodziec zmienia korzyści lub koszty działania, dlatego wpływa na zachowanie. Cena, podatek, kara albo premia mogą skłonić ludzi do innego wyboru.' },
  { chapter: 2, terms: ['granica mozliwosci produkcyjnych'], answer: 'Granica możliwości produkcyjnych pokazuje maksymalne kombinacje dwóch dóbr możliwe przy danych zasobach i technologii. Punkty na granicy są efektywne, pod nią osiągalne, lecz nieefektywne, a nad nią obecnie nieosiągalne.' },
  { chapter: 2, terms: ['ekonomia pozytywna'], answer: 'Ekonomia pozytywna opisuje i wyjaśnia fakty oraz zależności, które można sprawdzić danymi. Ekonomia normatywna zawiera sądy wartościujące o tym, jak powinno być.' },
  { chapter: 2, terms: ['model ekonomiczny'], answer: 'Model ekonomiczny jest celowym uproszczeniem rzeczywistości. Izoluje najważniejsze zależności przy założeniu ceteris paribus, aby wyjaśniać zjawiska i przewidywać skutki zmian.' },
  { chapter: 3, terms: ['przesuniecie krzywej popytu'], answer: 'Zmiana ceny badanego dobra powoduje ruch wzdłuż krzywej popytu. Zmiana dochodu, gustów, oczekiwań, liczby nabywców lub cen dóbr powiązanych przesuwa całą krzywą.' },
  { chapter: 3, terms: ['rownowaga rynkowa'], answer: 'Równowaga występuje tam, gdzie wielkość popytu równa się wielkości podaży. Niedobór wywiera presję na wzrost ceny, a nadwyżka na jej spadek, co kieruje rynek ku równowadze.' },
  { chapter: 5, terms: ['czy wszystkie krzywe popytu'], answer: 'Nie. Typowa krzywa popytu jest malejąca, lecz istnieją szczególne wyjątki, przede wszystkim dobro Giffena, dla którego silny efekt dochodowy może przeważyć nad efektem substytucyjnym.' },
  { chapter: 4, terms: ['elastycznosc cenowa popytu'], answer: 'Elastyczność cenowa popytu mierzy procentową reakcję wielkości popytu na jednoprocentową zmianę ceny. Wartość bezwzględna powyżej 1 oznacza popyt elastyczny, poniżej 1 — nieelastyczny.' },
  { chapter: 4, terms: ['metoda punktu srodkowego'], answer: 'Metoda punktu środkowego dzieli zmianę przez średnią z wartości początkowej i końcowej. Daje tę samą elastyczność niezależnie od kierunku porównania dwóch punktów.' },
  { chapter: 4, terms: ['utarg calkowity'], answer: 'Utarg całkowity to cena pomnożona przez sprzedaną ilość. Przy popycie elastycznym obniżka ceny zwiększa utarg, a przy nieelastycznym go zmniejsza; przy elastyczności jednostkowej pozostaje bez zmian.' },
  { chapter: 5, terms: ['linia budzetowa'], answer: 'Linia budżetowa pokazuje wszystkie koszyki dwóch dóbr dostępne przy danym dochodzie i cenach. Jej nachylenie wynosi −Px/Py i odzwierciedla rynkowy koszt alternatywny jednego dobra.' },
  { chapter: 5, terms: ['optimum konsumenta'], answer: 'Optimum konsumenta leży na najwyższej osiągalnej krzywej obojętności, zwykle w punkcie styczności z linią budżetową. W optimum krańcowa stopa substytucji jest równa relacji cen.' },
  { chapter: 5, terms: ['efekt dochodowy', 'efekt substytucyjny'], answer: 'Efekt substytucyjny wynika ze zmiany ceny względnej i skłania ku dobru relatywnie tańszemu. Efekt dochodowy wynika ze zmiany realnej siły nabywczej; jego kierunek zależy od tego, czy dobro jest normalne, czy niższego rzędu.' },
  { chapter: 6, terms: ['koszt krancowy'], answer: 'Koszt krańcowy to przyrost kosztu całkowitego po wytworzeniu dodatkowej jednostki. Przecina przeciętny koszt całkowity i przeciętny koszt zmienny w ich minimach.' },
  { chapter: 6, terms: ['maksymalizacja zysku'], answer: 'Przedsiębiorstwo maksymalizuje zysk przy wielkości produkcji, dla której utarg krańcowy jest równy kosztowi krańcowemu, o ile produkcja spełnia warunek kontynuowania działalności.' },
  { chapter: 6, terms: ['zamkniecie', 'zaprzestanie produkcji'], answer: 'W krótkim okresie firma konkurencyjna wstrzymuje produkcję, gdy cena spada poniżej przeciętnego kosztu zmiennego. W długim okresie opuszcza rynek, gdy cena nie pokrywa przeciętnego kosztu całkowitego.' },
  { chapter: 7, terms: ['nadwyzka konsumenta'], answer: 'Nadwyżka konsumenta to różnica między skłonnością do zapłaty a faktyczną ceną. Na wykresie jest polem pod krzywą popytu i nad poziomem ceny.' },
  { chapter: 7, terms: ['efektywnosc rynku'], answer: 'Konkurencyjna równowaga maksymalizuje łączną nadwyżkę konsumentów i producentów, jeśli nie występują zawodności rynku. Oznacza to, że dobra trafiają do nabywców ceniących je najwyżej, a produkcja do najtańszych wytwórców.' },
  { chapter: 8, terms: ['cena maksymalna'], answer: 'Wiążąca cena maksymalna leży poniżej ceny równowagi i powoduje niedobór. Niewiążący pułap powyżej równowagi nie zmienia wyniku rynkowego.' },
  { chapter: 8, terms: ['cena minimalna'], answer: 'Wiążąca cena minimalna leży powyżej ceny równowagi i powoduje nadwyżkę podaży. Przykładem jest płaca minimalna, która może zwiększyć podaż pracy względem popytu na nią.' },
  { chapter: 8, terms: ['ciezar podatku'], answer: 'Ekonomiczny ciężar podatku ponosi bardziej nieelastyczna strona rynku, niezależnie od tego, kto formalnie odprowadza podatek. Podatek tworzy klin między ceną płaconą przez nabywcę a ceną otrzymywaną przez sprzedawcę.' },
  { chapter: 9, terms: ['cztery zasady podatkowe', 'adama smitha'], answer: 'Cztery klasyczne zasady Smitha to: równość (sprawiedliwość obciążenia), pewność (jasna kwota i termin), dogodność poboru oraz taniość, czyli możliwie małe koszty poboru i zakłócenia gospodarcze.' },
  { chapter: 9, terms: ['zbedna strata'], answer: 'Zbędna strata podatku to utracona nadwyżka całkowita z transakcji, które nie dochodzą do skutku. Zwykle rośnie więcej niż proporcjonalnie wraz ze stawką podatku i jest większa przy bardziej elastycznym popycie lub podaży.' },
  { chapter: 10, terms: ['dobra publiczne'], answer: 'Dobro publiczne jest jednocześnie nierywalizacyjne i niewykluczalne. Rynek może dostarczać go za mało z powodu problemu gapowicza, dlatego państwo porównuje korzyści społeczne z kosztami dostarczenia.' },
  { chapter: 10, terms: ['tragedia wspolnego pastwiska'], answer: 'Tragedia wspólnego pastwiska powstaje, gdy rywalizacyjny, lecz niewykluczalny zasób jest nadmiernie eksploatowany. Użytkownik uzyskuje prywatną korzyść, a część kosztu przerzuca na innych.' },
  { chapter: 11, terms: ['efekt zewnetrzny'], answer: 'Efekt zewnętrzny występuje, gdy działanie jednej strony wpływa na dobrobyt osoby trzeciej bez odpowiedniej zapłaty. Negatywny efekt prowadzi do nadprodukcji, a pozytywny do niedostatecznej produkcji względem optimum społecznego.' },
  { chapter: 11, terms: ['twierdzenie coase'], answer: 'Twierdzenie Coase’a mówi, że przy jasno określonych prawach własności i niskich kosztach transakcyjnych strony mogą wynegocjować efektywny wynik niezależnie od początkowego przydziału praw.' },
  { chapter: 11, terms: ['podatek pigou'], answer: 'Podatek Pigou ma zrównać prywatny koszt krańcowy z kosztem społecznym poprzez obciążenie odpowiadające zewnętrznemu kosztowi krańcowemu. Dzięki temu cena uwzględnia szkodę dla osób trzecich.' },
  { chapter: 12, terms: ['negatywna selekcja'], answer: 'Negatywna selekcja pojawia się przed zawarciem transakcji, gdy gorzej poinformowana strona nie potrafi odróżnić typów jakości lub ryzyka. Może to wypierać z rynku dobre produkty albo niskie ryzyko.' },
  { chapter: 12, terms: ['pokusa naduzycia'], answer: 'Pokusa nadużycia pojawia się po zawarciu umowy, gdy chroniona lub słabiej obserwowana osoba podejmuje większe ryzyko, ponieważ część kosztów ponosi ktoś inny.' },
  { chapter: 12, terms: ['efekt posiadania'], answer: 'Efekt posiadania oznacza, że ludzie wyceniają rzecz wyżej, gdy już ją posiadają. Wiąże się to z niechęcią do straty i może naruszać standardowe założenie stabilnych preferencji.' },
  { chapter: 13, terms: ['funkcja produkcji'], answer: 'Funkcja produkcji opisuje maksymalną produkcję możliwą z danych nakładów i technologii. Jej nachylenie względem jednego nakładu pokazuje produkt krańcowy tego czynnika.' },
  { chapter: 13, terms: ['izokwanta'], answer: 'Izokwanta łączy kombinacje nakładów dające tę samą produkcję. Optymalna technika produkcji leży zwykle w punkcie styczności izokwanty z najniższą osiągalną linią jednakowego kosztu.' },
  { chapter: 14, terms: ['monopol', 'maksymalizacja'], answer: 'Monopolista wybiera ilość, przy której MR = MC, a następnie odczytuje cenę z krzywej popytu. Ponieważ cena przewyższa koszt krańcowy, wynik tworzy zbędną stratę względem konkurencji.' },
  { chapter: 14, terms: ['roznicowanie ceny'], answer: 'Różnicowanie ceny polega na sprzedaży tego samego dobra różnym klientom po różnych cenach niezwiązanych wyłącznie z kosztami. Może zwiększać zysk i produkcję, a doskonałe różnicowanie przejmuje całą nadwyżkę konsumenta.' },
  { chapter: 15, terms: ['konkurencja monopolistyczna'], answer: 'Konkurencja monopolistyczna łączy wielu sprzedawców i swobodę wejścia ze zróżnicowanymi produktami. W długim okresie zysk ekonomiczny zanika, lecz firma zwykle ma nadwyżkę zdolności produkcyjnych i cenę wyższą od kosztu krańcowego.' },
  { chapter: 16, terms: ['zlamane krzywe popytu'], answer: 'Model załamanej krzywej popytu wyjaśnia sztywność cen w oligopolu: konkurenci mogą naśladować obniżkę ceny, lecz nie podwyżkę. W punkcie załamania utarg krańcowy ma nieciągłość, więc umiarkowana zmiana kosztu nie musi zmienić ceny.' },
  { chapter: 16, terms: ['dylemat wieznia'], answer: 'Dylemat więźnia pokazuje, że indywidualnie racjonalna strategia dominująca może doprowadzić do wyniku gorszego dla obu stron niż współpraca. Pomaga wyjaśniać trudność utrzymania kartelu.' },
  { chapter: 17, terms: ['produkt krancowy pracy'], answer: 'Wartość produktu krańcowego pracy to produkt krańcowy pomnożony przez cenę produktu. Firma maksymalizująca zysk zatrudnia do punktu, w którym ta wartość zrówna się z płacą.' },
  { chapter: 17, terms: ['kapital ludzki'], answer: 'Kapitał ludzki obejmuje wiedzę, umiejętności, doświadczenie i zdrowie zwiększające produktywność. Inwestycje w niego mogą podnosić przyszłe wynagrodzenia, ale wiążą się z kosztem obecnym i kosztem alternatywnym czasu.' },
  { chapter: 18, terms: ['krzywa lorenza'], answer: 'Krzywa Lorenza zestawia skumulowany udział ludności ze skumulowanym udziałem dochodu. Im dalej leży od linii pełnej równości, tym większa nierówność; współczynnik Giniego mierzy względne pole między tymi liniami.' },
  { chapter: 18, terms: ['wspolczynnik giniego'], answer: 'Współczynnik Giniego przyjmuje wartości od 0 do 1: 0 oznacza pełną równość, a wartości bliższe 1 większą koncentrację dochodu. Jest oparty na polu między krzywą Lorenza a linią równości.' },
  { chapter: 19, terms: ['przewaga komparatywna'], answer: 'Przewaga komparatywna wynika z niższego kosztu alternatywnego, nie z większej bezwzględnej wydajności. Specjalizacja zgodna z kosztami alternatywnymi i wymiana mogą zwiększyć łączną konsumpcję obu stron.' },
  { chapter: 19, terms: ['clo'], answer: 'Cło podnosi cenę krajową importowanego dobra, zwiększa produkcję krajową i zmniejsza konsumpcję oraz import. Przynosi dochód państwu, lecz tworzy straty efektywności po stronie produkcji i konsumpcji.' },
  { chapter: 19, terms: ['kontyngent'], answer: 'Kontyngent ogranicza ilość importu. Podobnie jak cło podnosi cenę krajową i powoduje stratę dobrobytu, ale zamiast dochodu podatkowego tworzy rentę kontyngentową dla posiadaczy uprawnień importowych.' }
];

function explanationForOutlineTopic(topic, chapterNumber, data = subjectData()) {
  const guide = data.guides.find(item => item.number === chapterNumber);
  const normalizedTopic = normalizeText(topic);
  const directRule = data.id === 'micro' && topicExplanationRules.find(rule => rule.chapter === chapterNumber
    && rule.terms.every(term => normalizedTopic.includes(normalizeText(term))));
  if (directRule) return directRule.answer;
  const topicTokens = searchTokens(topic);
  const candidates = [
    ...guide.qa.map(([title, answer]) => ({ title, answer })),
    ...data.formulas.filter(item => item.chapter === chapterNumber).map(item => ({
      title: item.name,
      answer: `${item.formula}. ${item.use} ${item.variables}`
    })),
    ...data.concepts.map(item => ({ title: item.term, answer: item.definition }))
  ];
  const ranked = candidates.map(candidate => {
    const title = normalizeText(candidate.title);
    let score = title === normalizedTopic ? 100 : title.includes(normalizedTopic) || normalizedTopic.includes(title) ? 30 : 0;
    topicTokens.forEach(token => {
      if (title.includes(token)) score += 5;
      if (normalizeText(candidate.answer).includes(token)) score += 1;
    });
    return { ...candidate, score };
  }).sort((a, b) => b.score - a.score);
  return ranked[0]?.score >= 10
    ? ranked[0].answer
    : `${guide.overview} Temat „${topic}” należy do tego mechanizmu i należy analizować go przy założeniach opisanych w rozdziale.`;
}

function buildAnswerEntries(data) {
  return [
  ...data.guides.flatMap(guide => guide.qa.map(([question, answer]) => ({
    type: 'Odpowiedź',
    subject: data.id,
    chapter: guide.number,
    title: question,
    answer,
    context: chapterByNumber(guide.number, data.id)?.title || ''
  }))),
  ...data.formulas.map(item => ({
    type: 'Wzór',
    subject: data.id,
    chapter: item.chapter,
    title: `Jak obliczyć: ${item.name}?`,
    answer: `${item.formula}. ${item.use} ${item.variables}`,
    context: item.group
  })),
  ...data.outline.flatMap(outline => outline.topics.map(topic => ({
    type: 'Zakres',
    subject: data.id,
    chapter: outline.number,
    title: topic,
    answer: explanationForOutlineTopic(topic, outline.number, data),
    context: chapterByNumber(outline.number, data.id)?.title || ''
  }))),
  ...data.concepts.map(item => {
    const chapter = inferConceptChapter(item, data.id);
    return {
    type: 'Pojęcie',
    subject: data.id,
    chapter,
    title: `Co oznacza „${item.term}”?`,
    answer: item.definition,
    context: chapterByNumber(chapter, data.id)?.title || 'Słownik pojęć'
    };
  })
  ];
}

const allAnswerEntries = [
  ...buildAnswerEntries(subjectCatalog.micro),
  ...buildAnswerEntries(subjectCatalog.macro)
];

function inferConceptChapter(concept, subject = activeSubject) {
  return concept.chapter ?? subjectData(subject).conceptAssignments[concept.term] ?? null;
}

const studyCards = [
  ...bookConcepts.map((item, index) => {
  const chapter = inferConceptChapter(item, 'micro');
  return {
    id: `concept-${index}`,
    subject: 'micro',
    chapter,
    term: item.term,
    type: 'Zagadnienie',
    front: item.note ? `${item.term} (${item.note})` : item.term,
    back: item.definition
  };
  }),
  ...macroBookConcepts.map((item, index) => ({
    id: `macro-concept-${index}`,
    subject: 'macro',
    chapter: inferConceptChapter(item, 'macro'),
    term: item.term,
    type: 'Zagadnienie',
    front: item.note ? `${item.term} (${item.note})` : item.term,
    back: item.definition
  }))
];

function persistLocalProgress() {
  localStorage.setItem(storageKey, JSON.stringify(progress));
}

function saveProgress() {
  persistLocalProgress();
  updateProgress();
}

function rankIndexForPoints(points) {
  return ranks.reduce((current, rank, index) => points >= rank.threshold ? index : current, 0);
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function previousLocalDateKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return localDateKey(date);
}

function progressMetricValue(metric, source = progress) {
  const value = source[metric];
  if (Array.isArray(value)) return value.length;
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function pickDailyQuests() {
  const selected = [];
  const usedMetrics = new Set();
  shuffle(questPool).forEach(quest => {
    if (selected.length >= 3 || usedMetrics.has(quest.metric)) return;
    selected.push(quest);
    usedMetrics.add(quest.metric);
  });
  return selected;
}

function ensureDailyQuests({ persist = true } = {}) {
  const today = localDateKey();
  const validIds = new Set(questPool.map(quest => quest.id));
  const activeIdsAreValid = progress.dailyQuestIds.length === 3
    && progress.dailyQuestIds.every(id => validIds.has(id));
  if (progress.dailyQuestDate === today && activeIdsAreValid) return false;

  const selected = pickDailyQuests();
  progress.dailyQuestDate = today;
  progress.dailyQuestIds = selected.map(quest => quest.id);
  progress.dailyQuestBaseline = Object.fromEntries(
    selected.map(quest => [quest.id, progressMetricValue(quest.metric)])
  );
  progress.questRewards = {};
  if (persist) {
    persistLocalProgress();
  }
  return true;
}

function activeQuestDefinitions() {
  ensureDailyQuests();
  return progress.dailyQuestIds
    .map(id => questPool.find(quest => quest.id === id))
    .filter(Boolean);
}

function recordStudyDay() {
  const today = localDateKey();
  if (progress.lastStudyDate === today) return false;
  progress.dailyStreak = progress.lastStudyDate === previousLocalDateKey()
    ? Math.max(1, progress.dailyStreak + 1)
    : 1;
  progress.bestDailyStreak = Math.max(progress.bestDailyStreak, progress.dailyStreak);
  progress.lastStudyDate = today;
  return true;
}

function visibleDailyStreak() {
  if (!progress.lastStudyDate) return 0;
  return [localDateKey(), previousLocalDateKey()].includes(progress.lastStudyDate)
    ? progress.dailyStreak
    : 0;
}

function isBoostActive() {
  return progress.boostActivatedOn === localDateKey() && new Date(progress.boostEndsAt).getTime() > Date.now();
}

function showPointsAnimation(amount, label, sourceElement) {
  if (!amount) return;
  const preferredAnchor = sourceElement instanceof Element && sourceElement.getClientRects().length ? sourceElement : null;
  const anchor = preferredAnchor || $('#appMenuButton');
  const rect = anchor?.getBoundingClientRect();
  if (!rect) return;
  const bubble = document.createElement('div');
  bubble.className = 'points-burst';
  bubble.innerHTML = `<strong>+${amount}</strong><span>${escapeHtml(label)}</span>`;
  bubble.style.left = `${Math.min(window.innerWidth - 92, Math.max(10, rect.left + rect.width / 2 - 38))}px`;
  bubble.style.top = `${Math.max(12, rect.top + Math.min(rect.height * .5, 70))}px`;
  document.body.appendChild(bubble);
  $('#pointsAnnouncer').textContent = `Zdobyto ${amount} punktów: ${label}`;
  bubble.addEventListener('animationend', () => bubble.remove(), { once: true });
}

function showRankCelebration(rank) {
  $('#celebrationEmblem').textContent = rank.emblem;
  $('#celebrationRank').textContent = rank.name;
  $('#rankCelebration').hidden = false;
  requestAnimationFrame(() => $('#rankCelebration').classList.add('visible'));
}

function awardPoints(amount, label, sourceElement, { useBoost = true } = {}) {
  if (amount <= 0) return 0;
  recordStudyDay();
  const boostApplied = useBoost && isBoostActive();
  const awardedAmount = boostApplied ? amount * 2 : amount;
  const previousRankIndex = rankIndexForPoints(progress.points);
  progress.points += awardedAmount;
  const currentRankIndex = rankIndexForPoints(progress.points);
  saveProgress();
  showPointsAnimation(awardedAmount, boostApplied ? `${label} · boost ×2` : label, sourceElement);
  if (currentRankIndex > previousRankIndex) {
    window.setTimeout(() => showRankCelebration(ranks[currentRankIndex]), 650);
  }
  return awardedAmount;
}

function questProgressValue(quest) {
  const value = progressMetricValue(quest.metric);
  const baseline = Number(progress.dailyQuestBaseline[quest.id]) || 0;
  return Math.max(0, value - baseline);
}

function questCardMarkup(quest) {
  const value = questProgressValue(quest);
  const completed = value >= quest.target;
  const reward = progress.questRewards[quest.id];
  const claimed = Number.isFinite(reward);
  const percent = Math.min(100, Math.round((value / quest.target) * 100));
  const stateClass = claimed ? 'claimed' : completed ? 'ready' : 'in-progress';
  const actionLabel = claimed
    ? `Odebrano +${reward} pkt`
    : completed
      ? 'Otwórz skrzynkę'
      : `${Math.min(value, quest.target)} / ${quest.target}`;
  const actionHint = completed && !claimed ? `Otwórz skrzynkę za quest „${quest.title}”` : actionLabel;
  return `
    <article class="quest-card ${stateClass}" data-quest-id="${escapeHtml(quest.id)}">
      <div class="quest-card-top">
        <span class="quest-code" aria-hidden="true">${escapeHtml(quest.code)}</span>
        <div><strong>${escapeHtml(quest.title)}</strong><p>${escapeHtml(quest.description)}</p></div>
      </div>
      <div class="quest-progress-row">
        <div class="quest-progress-track" aria-hidden="true"><i style="width:${percent}%"></i></div>
        <span>${Math.min(value, quest.target)} / ${quest.target}</span>
      </div>
      <button class="quest-chest-button" type="button" data-claim-quest="${escapeHtml(quest.id)}" aria-label="${escapeHtml(actionHint)}" ${completed && !claimed ? '' : 'disabled'}>
        <span class="quest-chest-icon" aria-hidden="true">${claimed ? '✓' : '🎁'}</span>
        <b>${escapeHtml(actionLabel)}</b>
        ${completed && !claimed ? '<small>Losowo 50–200 pkt</small>' : ''}
      </button>
    </article>
  `;
}

function renderQuests() {
  const questDefinitions = activeQuestDefinitions();
  const pointsList = $('#pointsQuestList');
  if (pointsList) pointsList.innerHTML = questDefinitions.map(questCardMarkup).join('');
  const completedCount = questDefinitions.filter(quest => questProgressValue(quest) >= quest.target).length;
  const readyCount = questDefinitions.filter(quest => (
    questProgressValue(quest) >= quest.target && !Number.isFinite(progress.questRewards[quest.id])
  )).length;
  const readyBadge = $('#questReadyBadge');
  readyBadge.hidden = readyCount === 0;
  readyBadge.textContent = String(readyCount);
  $('#questQuickButton').classList.toggle('has-ready', readyCount > 0);
  $('#questQuickButton').setAttribute('aria-label', readyCount
    ? `Otwórz questy — ${polishCount(readyCount, 'nagroda gotowa', 'nagrody gotowe', 'nagród gotowych')}`
    : 'Otwórz questy');
  $('#pointsQuestSummary').textContent = readyCount
    ? `${completedCount}/${questDefinitions.length} · ${readyCount} do odebrania`
    : `${completedCount}/${questDefinitions.length} ukończonych`;
  const resetLabel = $('#pointsQuestResetLabel');
  if (resetLabel) resetLabel.textContent = 'Codziennie losujemy 3 z 10 celów. Nowy zestaw pojawi się po północy.';
}

function closeRewardChest() {
  const modal = $('#questRewardModal');
  if (!modal || modal.hidden || activeQuestOpening) return;
  modal.classList.remove('opening', 'revealed');
  modal.hidden = true;
  $('#questRewardBackdrop').hidden = true;
  document.body.classList.remove('quest-reward-open');
  lastQuestTrigger?.focus?.();
  lastQuestTrigger = null;
}

function openQuestChest(questId, sourceElement) {
  const quest = activeQuestDefinitions().find(item => item.id === questId);
  if (!quest || activeQuestOpening || progress.questRewards[quest.id] || questProgressValue(quest) < quest.target) return;
  const modal = $('#questRewardModal');
  if (!modal) return;
  activeQuestOpening = quest.id;
  lastQuestTrigger = sourceElement;
  window.clearTimeout(questRewardTimer);
  $('#questRewardTitle').textContent = quest.title;
  $('#questRewardAmount').textContent = 'Losowanie 50–200 pkt…';
  $('#questRewardCopy').textContent = 'Skrzynka otwiera się — za chwilę poznasz nagrodę.';
  $('#questRewardClose').hidden = true;
  $('#questRewardBackdrop').hidden = false;
  modal.hidden = false;
  modal.classList.remove('opening', 'revealed');
  document.body.classList.add('quest-reward-open');
  requestAnimationFrame(() => modal.classList.add('opening'));

  const revealDelay = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 100 : 900;
  questRewardTimer = window.setTimeout(() => {
    const reward = Math.floor(Math.random() * 151) + 50;
    progress.questRewards[quest.id] = reward;
    activeQuestOpening = '';
    const awarded = awardPoints(reward, `skrzynka za quest: ${quest.title}`, $('#questChestVisual'), { useBoost: false });
    $('#questRewardAmount').textContent = `+${awarded} pkt`;
    $('#questRewardCopy').textContent = 'Nagroda została dodana do Twojego salda punktów.';
    $('#questRewardClose').hidden = false;
    modal.classList.add('revealed');
    addNotification({
      type: 'reward',
      title: `Quest ukończony: ${quest.title}`,
      message: `Otwarta skrzynka przyniosła Ci ${awarded} pkt.`
    });
  }, revealDelay);
}

function updateProgress() {
  const validIds = new Set(studyCards.map(item => item.id));
  progress.mastered = [...new Set(progress.mastered)].filter(id => validIds.has(id));
  progress.starred = [...new Set(progress.starred)].filter(id => validIds.has(id));
  progress.awardedFlashcards = [...new Set(progress.awardedFlashcards)].filter(id => validIds.has(id));
  const subjectCards = currentStudyCards();
  const subjectCardIds = new Set(subjectCards.map(item => item.id));
  const mastered = progress.mastered.filter(id => subjectCardIds.has(id)).length;
  const total = subjectCards.length;
  const data = subjectData();
  const masteryPercent = total ? Math.round((mastered / total) * 100) : 0;
  const rankIndex = rankIndexForPoints(progress.points);
  const rank = ranks[rankIndex];
  const nextRank = ranks[rankIndex + 1];
  const rankStart = rank.threshold;
  const rankEnd = nextRank?.threshold ?? rank.threshold;
  const rankRange = Math.max(1, rankEnd - rankStart);
  const rankPercent = nextRank ? Math.min(100, ((progress.points - rankStart) / rankRange) * 100) : 100;

  $('#masteredCount').textContent = mastered;
  $('#totalCards').textContent = total;
  $('#starredCount').textContent = progress.starred.filter(id => subjectCardIds.has(id)).length;
  $('#heroConceptCount').textContent = data.concepts.length;
  $('#heroTopicCount').textContent = data.outline.reduce((sum, chapter) => sum + chapter.topics.length, 0);
  $('#heroFormulaCount').textContent = data.formulas.length;
  $('#masteryBar').style.width = `${masteryPercent}%`;
  $('#masteryPercent').textContent = `${masteryPercent}%`;
  $('#topPoints').textContent = progress.points;
  $('#progressPoints').textContent = `${progress.points} pkt`;
  $('#progressRank').textContent = rank.name;
  $('#menuQuickRank').textContent = rank.name;
  $('#rankName').textContent = rank.name;
  const rankDescription = $('#rankDescription');
  if (rankDescription) rankDescription.textContent = rank.description;
  $('#rankEmblem').textContent = rank.emblem;
  $('#menuPoints').textContent = progress.points;
  $('#rankBar').style.width = `${rankPercent}%`;
  $('#menuRankBar').style.width = `${rankPercent}%`;
  $('#nextRankLabel').textContent = nextRank ? `DO RANGI: ${nextRank.name.toLocaleUpperCase('pl-PL')}` : 'NAJWYŻSZA RANGA';
  $('#rankProgressText').textContent = nextRank ? `${progress.points} / ${nextRank.threshold}` : `${progress.points} pkt`;
  $('#menuNextRank').textContent = nextRank ? `Następna ranga: ${nextRank.name}` : 'Zdobyto najwyższą rangę';
  $('#menuRankProgress').textContent = nextRank ? `${progress.points} / ${nextRank.threshold}` : `${progress.points} pkt`;
  const dailyStreak = visibleDailyStreak();
  const streakBadge = $('#workspaceStreak');
  const streakLabel = $('#workspaceStreakLabel');
  if (streakBadge) {
    streakBadge.textContent = String(dailyStreak);
    streakBadge.title = dailyStreak
      ? `${polishCount(dailyStreak, 'dzień', 'dni', 'dni')} serii · rekord ${progress.bestDailyStreak}`
      : 'Rozpocznij serię nauki';
  }
  if (streakLabel) {
    streakLabel.textContent = progress.lastStudyDate === localDateKey()
      ? `Dziś zaliczone · rekord ${progress.bestDailyStreak}`
      : dailyStreak ? 'Wróć dziś, aby utrzymać serię' : 'Rozpocznij serię dziś';
  }
  updateBoostUi();
  renderQuests();

  $('#rankLadder').innerHTML = ranks.map((item, index) => `
    <div class="rank-step ${index <= rankIndex ? 'reached' : ''} ${index === rankIndex ? 'current' : ''}">
      <span>${escapeHtml(item.emblem)}</span>
      <div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.description)}</small><em>od ${item.threshold} pkt</em></div>
      <b>${index < rankIndex ? '✓' : index === rankIndex ? 'TERAZ' : ''}</b>
    </div>
  `).join('');
}

function updateStudyTimer() {
  const elapsedInBlock = progress.studySeconds % studyRewardSeconds;
  const secondsLeft = Math.max(0, Math.ceil(studyRewardSeconds - elapsedInBlock));
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  $('#studyTimerLabel').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  $('#studyTimerBar').style.width = `${Math.min(100, (elapsedInBlock / studyRewardSeconds) * 100)}%`;
}

function updateBoostUi() {
  const button = $('#activateBoost');
  const status = $('#boostStatus');
  if (!button || !status) return;
  const active = isBoostActive();
  const usedToday = progress.boostActivatedOn === localDateKey();
  if (active) {
    const remaining = Math.max(0, new Date(progress.boostEndsAt).getTime() - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    status.textContent = `Aktywny jeszcze ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    button.textContent = 'Boost aktywny';
    button.disabled = true;
    document.body.classList.add('boost-active');
  } else if (usedToday) {
    status.textContent = 'Dzisiejszy boost został wykorzystany';
    button.textContent = 'Wróć jutro';
    button.disabled = true;
    document.body.classList.remove('boost-active');
  } else {
    status.textContent = 'Dostępny raz dziennie przez 30 minut';
    button.textContent = 'Aktywuj ×2';
    button.disabled = false;
    document.body.classList.remove('boost-active');
  }
}

function activateDailyBoost() {
  if (progress.boostActivatedOn === localDateKey()) return;
  progress.boostActivatedOn = localDateKey();
  progress.boostEndsAt = new Date(Date.now() + boostDurationMs).toISOString();
  saveProgress();
  updateBoostUi();
}

function tickStudyTime() {
  const now = Date.now();
  const elapsed = Math.min(2, Math.max(0, (now - lastStudyTick) / 1000));
  lastStudyTick = now;
  if (document.visibilityState !== 'visible') return;

  progress.studySeconds += elapsed;
  unsavedStudySeconds += elapsed;
  const earnedBlocks = Math.floor(progress.studySeconds / studyRewardSeconds);
  if (earnedBlocks > progress.awardedStudyBlocks) {
    const newBlocks = earnedBlocks - progress.awardedStudyBlocks;
    progress.awardedStudyBlocks = earnedBlocks;
    unsavedStudySeconds = 0;
    awardPoints(newBlocks * studyRewardPoints, '15 minut aktywnej nauki', $('#appMenuButton'));
  } else if (unsavedStudySeconds >= 15) {
    persistLocalProgress();
    unsavedStudySeconds = 0;
  }
  updateStudyTimer();
  updateBoostUi();
}

function persistStudyTime() {
  persistLocalProgress();
  lastStudyTick = Date.now();
  unsavedStudySeconds = 0;
}

const subjectUiCopy = {
  micro: {
    title: 'Mikroekonomia · Mankiw i Taylor',
    eyebrow: 'MANKIW · TAYLOR · MIKROEKONOMIA',
    hero: 'Najważniejsze pojęcia, quizy i powtórki z mikroekonomii w jednym miejscu.',
    overviewTitle: 'Mikroekonomia w jednym miejscu.',
    overview: 'Materiał jest uporządkowany zgodnie z 19 rozdziałami przesłanego wydania. Możesz uczyć się pojęć, sprawdzać wiedzę i szybko wracać do streszczeń.',
    answerPlaceholder: 'Np. dlaczego podatek tworzy stratę społeczną?',
    prompts: [
      ['Jak znaleźć równowagę rynkową?', 'Równowaga rynkowa'],
      ['Kto ponosi ciężar podatku?', 'Ciężar podatku'],
      ['Jak monopol wybiera cenę i ilość?', 'Monopol'],
      ['Dlaczego handel przynosi korzyści?', 'Handel']
    ]
  },
  macro: {
    title: 'Makroekonomia · Mankiw i Taylor',
    eyebrow: 'MANKIW · TAYLOR · MAKROEKONOMIA',
    hero: 'PKB, inflacja i polityka gospodarcza — ucz się krócej, ale bardziej świadomie.',
    overviewTitle: 'Makroekonomia w jednym miejscu.',
    overview: 'Materiał jest uporządkowany zgodnie z 18 rozdziałami i 6 częściami przesłanego wydania. Pojęcia ze słownika są przypisane do rozdziałów, w których zostały omówione.',
    answerPlaceholder: 'Np. czym CPI różni się od deflatora PKB?',
    prompts: [
      ['Czym CPI różni się od deflatora PKB?', 'CPI a deflator'],
      ['Co powoduje inflację w długim okresie?', 'Inflacja'],
      ['Jak działa mnożnik wydatków?', 'Mnożnik'],
      ['Jak podwyżka stóp wpływa na gospodarkę?', 'Polityka pieniężna']
    ]
  }
};

function applySubjectUi() {
  const data = subjectData();
  const copy = subjectUiCopy[activeSubject];
  const parts = new Set(data.chapters.map(chapter => `${chapter.part}:${chapter.partTitle}`)).size;
  document.title = `Nauka Ekonomii · ${data.label}`;
  document.body.dataset.subject = activeSubject;
  document.body.classList.toggle('macro-active', activeSubject === 'macro');
  document.querySelectorAll('[data-subject]').forEach(button => {
    const selected = button.dataset.subject === activeSubject;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  $('#heroEyebrow').textContent = copy.eyebrow;
  $('#flashcardsEyebrow').textContent = `ZAGADNIENIA · ${data.chapters.length} ROZDZIAŁÓW · ${data.label.toLocaleUpperCase('pl-PL')}`;
  $('#learnEyebrow').textContent = `UCZ SIĘ · ${data.label.toLocaleUpperCase('pl-PL')}`;
  $('#quizEyebrow').textContent = `QUIZ · ${data.label.toLocaleUpperCase('pl-PL')}`;
  $('#testEyebrow').textContent = `TEST PISEMNY · ${data.label.toLocaleUpperCase('pl-PL')}`;
  $('#scopeEyebrow').textContent = 'SPIS TREŚCI I OPRACOWANIA';
  $('#scopeMeta').innerHTML = `<span id="scopeTopicCount">0</span> tematów · ${data.chapters.length} rozdziałów · ${parts} części`;
  $('#conceptsIntro').textContent = activeSubject === 'micro'
    ? 'Hasła są uporządkowane według rozdziałów i służą jako materiał do powtórki. Skorzystaj z wyszukiwarki, aby szybko znaleźć pojęcie.'
    : 'Hasła ze słownika książki są uporządkowane według rozdziałów, w których pojawiają się w materiale. Skorzystaj z wyszukiwarki, aby szybko znaleźć pojęcie.';
  $('#appMenuSubject').textContent = 'NAWIGACJA';
  $('#answerSearch').placeholder = copy.answerPlaceholder;
  $('#answerSearchLabel').textContent = `Wpisz pytanie z ${activeSubject === 'micro' ? 'mikroekonomii' : 'makroekonomii'}`;
  document.querySelectorAll('.answer-prompts button').forEach((button, index) => {
    const prompt = copy.prompts[index];
    if (!prompt) return;
    button.dataset.question = prompt[0];
    button.textContent = prompt[1];
  });
}

function switchSubject(nextSubject) {
  if (!subjectCatalog[nextSubject]) return;
  activeSubject = nextSubject;
  try { localStorage.setItem(subjectStorageKey, activeSubject); } catch {}
  selectedFlashcardChapter = 'all';
  selectedLearnChapter = 'all';
  selectedQuizChapter = 'all';
  selectedTestChapter = 'all';
  selectedAnswerChapter = 'all';
  selectedMathChapter = 'all';
  currentCard = 0;
  showStarredOnly = false;
  $('#starredFilter').classList.remove('active');
  $('#starredFilter').setAttribute('aria-pressed', 'false');
  ['#learnChapter', '#flashcardChapter', '#quizChapter', '#testChapter', '#answerChapter', '#mathChapter'].forEach(selector => {
    renderChapterSelect(selector, selector.includes('learn') || selector.includes('flashcard') || selector.includes('quiz') || selector.includes('test') ? `Cała ${activeSubject === 'micro' ? 'mikroekonomia' : 'makroekonomia'}` : 'Wszystkie rozdziały');
  });
  $('#conceptSearch').value = '';
  $('#answerSearch').value = '';
  $('#scopeSearch').value = '';
  $('#mathSearch').value = '';
  applySubjectUi();
  showLearnSetup();
  updateLearnPoolUi();
  renderCard();
  renderScope();
  renderAnswers();
  renderMath();
  renderConcepts();
  updateProgress();
  startQuiz();
  startTest();
}

function switchMode(mode) {
  if (document.body.classList.contains('focus-mode')) exitFocusMode();
  const secondaryModes = ['test', 'answers', 'scope', 'math', 'legal'];
  const menuMode = secondaryModes.includes(mode) ? 'more' : mode;
  document.querySelectorAll('[data-menu-mode]').forEach(button => {
    const subjectMatches = !button.dataset.subjectTarget || button.dataset.subjectTarget === activeSubject;
    button.classList.toggle('active', button.dataset.menuMode === menuMode && subjectMatches);
  });
  document.querySelectorAll('.subject-menu-group').forEach(group => {
    const containsActiveTool = Boolean(group.querySelector('[data-menu-mode].active'));
    group.classList.toggle('menu-has-active', containsActiveTool);
  });
  document.querySelectorAll('.study-panel').forEach(panel => {
    panel.classList.toggle('active', panel.dataset.panel === mode);
  });
  document.body.classList.toggle('home-active', mode === 'home');
  document.body.dataset.mode = mode;
  setAppMenu(false, { returnFocus: false });
  if (mode === 'learn' && !learnSessionState) updateLearnPoolUi();
  if (mode === 'owe') updateOweQuizPool();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function enterFocusMode(panelId) {
  const panel = document.getElementById(panelId);
  if (!panel) return;
  document.querySelectorAll('.study-panel').forEach(item => item.classList.toggle('focus-active', item === panel));
  document.body.classList.add('focus-mode');
  $('#focusExitButton').hidden = false;
  document.querySelectorAll('[data-focus]').forEach(button => {
    const active = button.dataset.focus === panelId;
    button.textContent = active ? '×' : '⛶';
    if (active) button.setAttribute('aria-label', `Wyłącz tryb skupienia ${focusModeLabel(panelId)}`);
  });
  document.documentElement.requestFullscreen?.().catch(() => {});
}

function exitFocusMode() {
  document.body.classList.remove('focus-mode');
  $('#focusExitButton').hidden = true;
  document.querySelectorAll('.study-panel').forEach(item => item.classList.remove('focus-active'));
  document.querySelectorAll('[data-focus]').forEach(button => {
    button.textContent = '⛶';
    button.setAttribute('aria-label', `Włącz tryb skupienia ${focusModeLabel(button.dataset.focus)}`);
  });
  if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
}

function focusModeLabel(panelId) {
  if (panelId === 'quiz' || panelId === 'olympiadQuiz') return 'quizu';
  if (panelId === 'learn') return 'nauki';
  return 'fiszek';
}

function filteredCards() {
  return currentStudyCards().filter(item => {
    const matchesChapter = selectedFlashcardChapter === 'all' || item.chapter === Number(selectedFlashcardChapter);
    const matchesStarred = !showStarredOnly || progress.starred.includes(item.id);
    return matchesChapter && matchesStarred;
  });
}

function flashcardSides(card) {
  const topicLabel = card.type.toLocaleUpperCase('pl-PL');
  return flashcardDefinitionFirst
    ? { front: card.back, back: card.front, frontLabel: 'WYJAŚNIENIE', backLabel: topicLabel }
    : { front: card.front, back: card.back, frontLabel: topicLabel, backLabel: 'WYJAŚNIENIE' };
}

function updateFlashcardDirectionButton() {
  const button = $('#reverseFlashcards');
  button.classList.toggle('active', flashcardDefinitionFirst);
  button.setAttribute('aria-pressed', String(flashcardDefinitionFirst));
  button.setAttribute(
    'aria-label',
    flashcardDefinitionFirst ? 'Najpierw pokazuj zagadnienie' : 'Najpierw pokazuj wyjaśnienie'
  );
  button.title = flashcardDefinitionFirst
    ? 'Teraz najpierw widzisz wyjaśnienie. Kliknij, aby zacząć od zagadnienia.'
    : 'Odwróć wszystkie fiszki i zacznij od wyjaśnienia.';
}

function renderCard() {
  const cards = filteredCards();
  $('#flashcardPoolCount').textContent = `${polishCount(cards.length, 'zagadnienie', 'zagadnienia', 'zagadnień')} w tej puli${showStarredOnly ? ' · tylko trudne' : ''}`;
  if (currentCard >= cards.length) currentCard = 0;
  if (currentCard < 0) currentCard = cards.length - 1;
  const card = cards[currentCard];
  const navigationButtons = [$('#prevCard'), $('#nextCard')];
  if (!card) {
    $('#flashcard').classList.remove('is-flipped');
    $('#cardPosition').textContent = '0 / 0';
    $('#cardPage').textContent = 'BRAK MATERIAŁU';
    $('#cardFront').textContent = 'W tym rozdziale nie ma przypisanych zagadnień.';
    $('#cardBack').textContent = showStarredOnly ? 'Oznacz wybrane fiszki gwiazdką albo wyłącz filtr „Tylko trudne”.' : 'Wybierz całą książkę albo inny rozdział.';
    $('#cardHint').textContent = 'FILTR';
    $('#starCard').hidden = true;
    $('#reverseFlashcards').hidden = true;
    $('#flipInstruction').hidden = true;
    $('#recallActions').hidden = true;
    navigationButtons.forEach(button => { button.disabled = true; });
    return;
  }
  navigationButtons.forEach(button => { button.disabled = false; });
  $('#starCard').hidden = false;
  $('#reverseFlashcards').hidden = false;

  $('#flashcard').classList.remove('is-flipped');
  $('#cardFront').setAttribute('aria-hidden', 'false');
  $('#cardBack').setAttribute('aria-hidden', 'true');
  $('#cardPosition').textContent = `${currentCard + 1} / ${cards.length}`;
  $('#cardPage').textContent = card.chapter ? `ROZDZIAŁ ${card.chapter}` : 'SŁOWNIK';
  const sides = flashcardSides(card);
  $('#cardFront').textContent = sides.front;
  $('#cardBack').textContent = sides.back;
  $('#cardHint').textContent = sides.frontLabel;
  $('#flashcard').setAttribute(
    'aria-label',
    flashcardDefinitionFirst ? 'Odwróć fiszkę i zobacz zagadnienie' : 'Odwróć fiszkę i zobacz wyjaśnienie'
  );
  $('#flipInstruction').hidden = currentCard !== 0;
  $('#flipInstruction').innerHTML = flashcardDefinitionFirst
    ? 'Kliknij, aby zobaczyć zagadnienie <b>↻</b>'
    : 'Kliknij, aby zobaczyć definicję <b>↻</b>';
  updateFlashcardDirectionButton();
  const isStarred = progress.starred.includes(card.id);
  $('#starCard').classList.toggle('active', isStarred);
  $('#starCard').setAttribute('aria-pressed', String(isStarred));
  $('#starCard').setAttribute('aria-label', isStarred ? 'Usuń fiszkę z trudnych' : 'Oznacz fiszkę jako trudną');
  $('#starCard').textContent = isStarred ? '★' : '☆';
  $('#recallActions').hidden = true;
}

function flipCard() {
  if (!filteredCards().length) return;
  const element = $('#flashcard');
  const flipped = element.classList.toggle('is-flipped');
  const card = filteredCards()[currentCard];
  const sides = flashcardSides(card);
  $('#cardFront').setAttribute('aria-hidden', String(flipped));
  $('#cardBack').setAttribute('aria-hidden', String(!flipped));
  $('#cardHint').textContent = flipped ? sides.backLabel : sides.frontLabel;
  $('#recallActions').hidden = !flipped;
}

function toggleFlashcardDirection() {
  flashcardDefinitionFirst = !flashcardDefinitionFirst;
  try {
    localStorage.setItem(
      flashcardDirectionStorageKey,
      flashcardDefinitionFirst ? 'definition-first' : 'topic-first'
    );
  } catch {
    // Preferencja nadal działa do końca bieżącej sesji.
  }
  renderCard();
}

function recall(type) {
  const card = filteredCards()[currentCard];
  if (!card) return;
  let earnedPoints = false;
  if (type === 'good' && !progress.mastered.includes(card.id)) {
    progress.mastered.push(card.id);
    if (!progress.awardedFlashcards.includes(card.id)) {
      progress.awardedFlashcards.push(card.id);
      earnedPoints = true;
    }
  }
  if (type === 'again') {
    progress.mastered = progress.mastered.filter(id => id !== card.id);
  }
  if (earnedPoints) awardPoints(5, 'opanowana fiszka', $('#flashcard'));
  else saveProgress();
  navigateCard(1);
}

function toggleStarredCard() {
  const card = filteredCards()[currentCard];
  if (!card) return;
  if (progress.starred.includes(card.id)) progress.starred = progress.starred.filter(id => id !== card.id);
  else progress.starred.push(card.id);
  saveProgress();
  if (showStarredOnly && !progress.starred.includes(card.id)) {
    currentCard = Math.min(currentCard, Math.max(0, filteredCards().length - 1));
  }
  renderCard();
}

function navigateCard(step) {
  const cards = filteredCards();
  if (!cards.length || cardTransitioning) return;
  cardTransitioning = true;
  const element = $('#flashcard');
  if (typeof element.animate !== 'function') {
    currentCard = (currentCard + step + cards.length) % cards.length;
    renderCard();
    cardTransitioning = false;
    return;
  }
  const exitX = step > 0 ? '-72px' : '72px';
  const enterX = step > 0 ? '72px' : '-72px';
  const exitAnimation = element.animate([
    { opacity: 1, transform: 'translateX(0) scale(1)' },
    { opacity: 0, transform: `translateX(${exitX}) scale(.985)` }
  ], { duration: 180, easing: 'ease-in', fill: 'forwards' });

  exitAnimation.finished.then(() => {
    currentCard = (currentCard + step + cards.length) % cards.length;
    renderCard();
    exitAnimation.cancel();
    const enterAnimation = element.animate([
      { opacity: 0, transform: `translateX(${enterX}) scale(.985)` },
      { opacity: 1, transform: 'translateX(0) scale(1)' }
    ], { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' });
    enterAnimation.finished.finally(() => { cardTransitioning = false; });
  }).catch(() => { cardTransitioning = false; });
}

function learnPool() {
  return currentStudyCards().filter(item => selectedLearnChapter === 'all' || item.chapter === Number(selectedLearnChapter));
}

function learnPriority(card) {
  const knowledge = learnKnowledge[card.id] || {};
  const familiarity = Number.isFinite(knowledge.level) ? knowledge.level : 0;
  const masteredPenalty = progress.mastered.includes(card.id) ? 2.5 : 0;
  const difficultBonus = progress.starred.includes(card.id) ? -2 : 0;
  return familiarity + masteredPenalty + difficultBonus;
}

function updateLearnPoolUi() {
  const pool = learnPool();
  const requested = selectedLearnGoal === 'all' ? pool.length : Number(selectedLearnGoal);
  const sessionSize = Math.min(pool.length, requested || 0);
  const unmastered = pool.filter(card => !progress.mastered.includes(card.id)).length;
  $('#learnPoolCount').textContent = pool.length
    ? `${sessionSize} w sesji · ${unmastered} jeszcze nieopanowanych · trudniejsze zagadnienia pojawią się wcześniej`
    : 'W wybranym rozdziale nie ma zagadnień do nauki.';
  $('#startLearn').disabled = sessionSize === 0;
}

function persistLearnKnowledge() {
  try { localStorage.setItem(learnKnowledgeStorageKey, JSON.stringify(learnKnowledge)); } catch {}
}

function updateLearnKnowledge(cardId, { correct, stage }) {
  const previous = learnKnowledge[cardId] || { level: 0, attempts: 0, correct: 0 };
  const step = correct ? (stage === 'written' ? 1 : .45) : -.65;
  learnKnowledge[cardId] = {
    level: Math.max(0, Math.min(5, (Number(previous.level) || 0) + step)),
    attempts: Math.max(0, Number(previous.attempts) || 0) + 1,
    correct: Math.max(0, Number(previous.correct) || 0) + (correct ? 1 : 0),
    lastSeen: new Date().toISOString()
  };
  persistLearnKnowledge();
}

function showLearnSetup() {
  learnSessionState = null;
  $('#learnSetup').hidden = false;
  $('#learnSession').hidden = true;
  $('#learnResult').hidden = true;
  $('#leaveLearnSession').hidden = true;
  updateLearnPoolUi();
}

function startLearnSession() {
  const pool = learnPool();
  const requested = selectedLearnGoal === 'all' ? pool.length : Number(selectedLearnGoal);
  const targets = shuffle(pool)
    .sort((a, b) => learnPriority(a) - learnPriority(b))
    .slice(0, Math.min(pool.length, requested || 0));
  if (!targets.length) return;

  const items = targets.map(card => {
    const familiarity = Number(learnKnowledge[card.id]?.level) || 0;
    return {
      card,
      stage: familiarity >= 2 || progress.mastered.includes(card.id) ? 'written' : 'choice',
      mistakes: 0,
      mastered: false
    };
  });

  learnSessionState = {
    targets,
    queue: shuffle(items),
    current: null,
    answered: false,
    attempts: 0,
    correct: 0,
    mastered: 0,
    streak: 0,
    bestStreak: 0,
    points: 0,
    rewardedStages: new Set(),
    difficultIds: new Set()
  };

  $('#learnSetup').hidden = true;
  $('#learnResult').hidden = true;
  $('#learnSession').hidden = false;
  $('#leaveLearnSession').hidden = false;
  renderNextLearnQuestion();
}

function insertLearnRetry(item, delay = 2) {
  const session = learnSessionState;
  if (!session) return;
  const position = Math.min(session.queue.length, Math.max(1, delay));
  session.queue.splice(position, 0, item);
}

function buildLearnOptions(item) {
  const pool = learnPool().filter(candidate => candidate.id !== item.id);
  const sameChapter = pool.filter(candidate => candidate.chapter === item.chapter);
  const other = pool.filter(candidate => !sameChapter.includes(candidate));
  return shuffle([item, ...shuffle(sameChapter), ...shuffle(other)].filter((candidate, index, items) => (
    items.findIndex(entry => entry.id === candidate.id) === index
  )).slice(0, 4));
}

function learnAccuracy() {
  if (!learnSessionState?.attempts) return null;
  return Math.round((learnSessionState.correct / learnSessionState.attempts) * 100);
}

function updateLearnSessionUi() {
  const session = learnSessionState;
  if (!session) return;
  const accuracy = learnAccuracy();
  $('#learnMasteredStat').textContent = `${session.mastered} / ${session.targets.length}`;
  $('#learnAccuracyStat').textContent = accuracy === null ? '—' : `${accuracy}%`;
  $('#learnStreakStat').textContent = session.streak >= 3 ? `${session.streak} 🔥` : String(session.streak);
  $('#learnPointsStat').textContent = `+${session.points}`;
  $('#learnProgressBar').style.width = `${session.targets.length ? (session.mastered / session.targets.length) * 100 : 0}%`;
}

function renderNextLearnQuestion() {
  const session = learnSessionState;
  if (!session) return;
  if (!session.queue.length) {
    completeLearnSession();
    return;
  }

  const item = session.queue.shift();
  session.current = item;
  session.answered = false;
  const written = item.stage === 'written';
  const card = item.card;
  $('#learnCard').classList.remove('correct', 'wrong');
  $('#learnQuestionType').textContent = written ? 'WPISZ ODPOWIEDŹ' : 'WYBÓR ODPOWIEDZI';
  $('#learnQuestionChapter').textContent = card.chapter ? `ROZDZIAŁ ${card.chapter}` : 'SŁOWNIK';
  $('#learnQuestionLabel').textContent = written
    ? 'Wpisz pojęcie, którego dotyczy ta definicja.'
    : 'Którego pojęcia dotyczy ta definicja?';
  $('#learnQuestion').textContent = card.back;
  $('#learnFeedback').textContent = '';
  $('#learnFeedback').className = 'learn-feedback';
  $('#nextLearnQuestion').hidden = true;
  $('#learnDontKnow').hidden = false;

  if (written) {
    $('#learnAnswerArea').innerHTML = `
      <form class="learn-written-form" id="learnWrittenForm">
        <label for="learnWrittenAnswer">Twoja odpowiedź</label>
        <div><input id="learnWrittenAnswer" type="text" autocomplete="off" spellcheck="false" placeholder="Wpisz nazwę pojęcia…" required /><button class="primary-button" type="submit">Sprawdź</button></div>
      </form>
    `;
    $('#learnWrittenForm').addEventListener('submit', event => {
      event.preventDefault();
      submitLearnWrittenAnswer($('#learnWrittenAnswer').value);
    });
    window.setTimeout(() => $('#learnWrittenAnswer')?.focus(), 0);
  } else {
    const options = buildLearnOptions(card);
    $('#learnAnswerArea').innerHTML = `<div class="learn-options">${options.map((option, index) => `
      <button class="answer" type="button" data-learn-card-id="${escapeHtml(option.id)}">
        <span class="letter">${'ABCD'[index]}</span><span>${escapeHtml(option.front)}</span>
      </button>
    `).join('')}</div>`;
    document.querySelectorAll('[data-learn-card-id]').forEach(button => {
      button.addEventListener('click', () => submitLearnChoice(button.dataset.learnCardId, button));
    });
  }
  updateLearnSessionUi();
}

function levenshteinDistance(left, right) {
  const a = String(left);
  const b = String(right);
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const saved = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = saved;
    }
  }
  return row[b.length];
}

function learnWrittenAnswerMatches(value, card) {
  const submitted = normalizeText(value);
  const expectedValues = [card.term, card.front, String(card.front).replace(/\s*\([^)]*\)\s*/g, ' ')]
    .map(normalizeText)
    .filter(Boolean);
  if (!submitted) return false;
  return expectedValues.some(expected => {
    if (submitted === expected) return true;
    const tolerance = expected.length >= 14 ? 2 : expected.length >= 7 ? 1 : 0;
    return tolerance > 0 && Math.abs(submitted.length - expected.length) <= tolerance
      && levenshteinDistance(submitted, expected) <= tolerance;
  });
}

function submitLearnChoice(cardId, sourceButton) {
  const session = learnSessionState;
  if (!session || session.answered) return;
  const item = session.current;
  const correct = cardId === item.card.id;
  document.querySelectorAll('[data-learn-card-id]').forEach(button => {
    button.disabled = true;
    if (button.dataset.learnCardId === item.card.id) button.classList.add('correct');
    if (button === sourceButton && !correct) button.classList.add('wrong');
  });
  resolveLearnAnswer({ correct, sourceElement: sourceButton });
}

function submitLearnWrittenAnswer(value) {
  const session = learnSessionState;
  if (!session || session.answered) return;
  const input = $('#learnWrittenAnswer');
  const correct = learnWrittenAnswerMatches(value, session.current.card);
  if (input) {
    input.disabled = true;
    input.classList.add(correct ? 'correct' : 'wrong');
  }
  $('#learnWrittenForm button').disabled = true;
  resolveLearnAnswer({ correct, sourceElement: input });
}

function resolveLearnAnswer({ correct, sourceElement, skipped = false }) {
  const session = learnSessionState;
  if (!session || session.answered) return;
  session.answered = true;
  const item = session.current;
  const stage = item.stage;
  session.attempts += 1;
  updateLearnKnowledge(item.card.id, { correct, stage });

  if (correct) {
    session.correct += 1;
    session.streak += 1;
    session.bestStreak = Math.max(session.bestStreak, session.streak);
    let rewardBase = 0;
    let rewardLabel = 'poprawna odpowiedź w trybie Ucz się';
    const rewardKey = `${item.card.id}:${stage}`;
    if (!session.rewardedStages.has(rewardKey)) {
      session.rewardedStages.add(rewardKey);
      rewardBase += 5;
    }
    if (stage === 'choice') {
      item.stage = 'written';
      insertLearnRetry(item, 2 + Math.floor(Math.random() * 2));
    } else {
      item.mastered = true;
      session.mastered += 1;
      if (!progress.mastered.includes(item.card.id)) progress.mastered.push(item.card.id);
      if (!progress.awardedFlashcards.includes(item.card.id)) {
        progress.awardedFlashcards.push(item.card.id);
        rewardBase += 5;
        rewardLabel = rewardBase > 5
          ? 'poprawna odpowiedź i opanowanie zagadnienia'
          : 'opanowanie nowego zagadnienia';
      }
    }
    if (rewardBase) session.points += awardPoints(rewardBase, rewardLabel, sourceElement || $('#learnCard'));
    else saveProgress();
  } else {
    session.streak = 0;
    item.mistakes += 1;
    session.difficultIds.add(item.card.id);
    progress.mastered = progress.mastered.filter(id => id !== item.card.id);
    insertLearnRetry(item, 2 + Math.min(2, item.mistakes));
    saveProgress();
  }

  $('#learnCard').classList.add(correct ? 'correct' : 'wrong');
  $('#learnFeedback').textContent = correct
    ? stage === 'choice'
      ? `Dobrze. Za chwilę wpiszesz „${item.card.term || item.card.front}” samodzielnie.`
      : `Opanowane: „${item.card.term || item.card.front}”.`
    : `${skipped ? 'Zapamiętaj' : 'Poprawna odpowiedź'}: „${item.card.term || item.card.front}”. To zagadnienie wróci za chwilę.`;
  $('#learnFeedback').classList.add(correct ? 'correct' : 'wrong');
  $('#learnAnswerArea').querySelectorAll('button,input').forEach(control => { control.disabled = true; });
  $('#learnDontKnow').hidden = true;
  $('#nextLearnQuestion').hidden = false;
  updateLearnSessionUi();
  window.setTimeout(() => $('#nextLearnQuestion').focus(), 0);
}

function completeLearnSession() {
  const session = learnSessionState;
  if (!session) return;
  const accuracy = learnAccuracy() ?? 0;
  const bonus = accuracy === 100 ? 10 : accuracy >= 80 ? 5 : 0;
  if (bonus) session.points += awardPoints(bonus, accuracy === 100 ? 'premia za bezbłędną naukę' : 'premia za skuteczność 80%+', $('#learnResult'));
  recordStudyDay();
  progress.completedLearnSessions += 1;
  saveProgress();
  $('#learnSession').hidden = true;
  $('#learnResult').hidden = false;
  $('#leaveLearnSession').hidden = true;
  $('#learnResultMastered').textContent = session.mastered;
  $('#learnResultAccuracy').textContent = `${accuracy}%`;
  $('#learnResultPoints').textContent = `+${session.points}`;
  $('#learnResultCopy').textContent = session.difficultIds.size
    ? `Świetnie — cel osiągnięty. ${session.difficultIds.size} trudniejszych ${session.difficultIds.size === 1 ? 'zagadnienie wróciło' : 'zagadnień wróciło'} w trakcie sesji, a najlepsza passa wyniosła ${session.bestStreak}.`
    : `Świetnie — cel osiągnięty bez pomyłek. Najlepsza passa wyniosła ${session.bestStreak}.`;
  updateLearnSessionUi();
}

function leaveLearnSession() {
  if (learnSessionState && learnSessionState.mastered < learnSessionState.targets.length
    && !window.confirm('Zakończyć bieżącą sesję? Zdobyte punkty i opanowane zagadnienia zostaną zachowane.')) return;
  showLearnSetup();
}

function quizPool() {
  return currentStudyCards().filter(item => selectedQuizChapter === 'all' || item.chapter === Number(selectedQuizChapter));
}

function buildQuizOptions(item) {
  const pool = quizPool().filter(candidate => candidate.id !== item.id);
  const sameTypeAndChapter = pool.filter(candidate => candidate.type === item.type && candidate.chapter === item.chapter);
  const sameType = pool.filter(candidate => candidate.type === item.type && !sameTypeAndChapter.includes(candidate));
  const globalFallback = currentStudyCards().filter(candidate => candidate.id !== item.id && !pool.includes(candidate));
  const distractors = [...shuffle(sameTypeAndChapter), ...shuffle(sameType), ...shuffle(globalFallback)].slice(0, 3);
  return shuffle([item, ...distractors]);
}

function startQuiz() {
  const pool = quizPool();
  const requestedLength = selectedQuizLength === 'all' ? pool.length : Number(selectedQuizLength);
  quizSet = shuffle(pool).slice(0, Math.min(requestedLength, pool.length));
  quizIndex = 0;
  quizScore = 0;
  quizAnswered = false;
  quizRewardGranted = false;
  quizBasePoints = 0;
  $('#quizPoolCount').textContent = `${pool.length} zagadnień · ${quizSet.length} pytań`;
  $('#quizPointsEarned').textContent = '';
  $('#quizCard').hidden = false;
  $('#quizResult').hidden = true;
  $('#quizResult').classList.remove('quiz-finished');
  if (!quizSet.length) {
    $('#quizQuestion').textContent = 'Brak pytań dla wybranego filtra.';
    $('#quizAnswers').innerHTML = '';
    $('#quizPage').textContent = '';
    $('#quizProgressLabel').textContent = '0 pytań';
    $('#quizProgressBar').style.width = '0%';
    return;
  }
  renderQuestion();
}

function renderQuestion() {
  const item = quizSet[quizIndex];
  quizAnswered = false;
  $('#quizProgressLabel').textContent = `Pytanie ${quizIndex + 1} z ${quizSet.length}`;
  $('#quizProgressBar').style.width = `${(quizIndex / quizSet.length) * 100}%`;
  $('#quizPage').textContent = item.chapter ? `ROZDZIAŁ ${item.chapter}` : 'SŁOWNIK';
  $('#quizQuestion').textContent = item.back;
  $('#quizCard').classList.remove('answer-correct', 'answer-wrong');
  const options = buildQuizOptions(item);
  $('#quizAnswers').innerHTML = options.map((option, index) => `
    <button class="answer" data-card-id="${escapeHtml(option.id)}">
      <span class="letter">${'ABCD'[index]}</span>
      <span>${escapeHtml(option.front)}</span>
    </button>
  `).join('');
  $('#quizFeedback').textContent = '';
  $('#quizFeedback').className = 'quiz-feedback';
  $('#nextQuestion').hidden = true;
  document.querySelectorAll('.answer').forEach(button => {
    button.addEventListener('click', () => answerQuestion(button.dataset.cardId, button));
  });
}

function answerQuestion(cardId, selectedButton) {
  if (quizAnswered) return;
  quizAnswered = true;
  const item = quizSet[quizIndex];
  const correct = cardId === item.id;
  if (correct) {
    quizScore += 1;
    const awarded = awardPoints(5, 'poprawna odpowiedź', selectedButton);
    quizBasePoints += awarded;
  }

  $('#quizCard').classList.remove('answer-correct', 'answer-wrong');
  requestAnimationFrame(() => $('#quizCard').classList.add(correct ? 'answer-correct' : 'answer-wrong'));

  document.querySelectorAll('.answer').forEach(button => {
    button.disabled = true;
    if (button.dataset.cardId === item.id) button.classList.add('correct');
    if (button.dataset.cardId === cardId && !correct) button.classList.add('wrong');
  });

  $('#quizFeedback').textContent = correct
    ? `Dobrze · +${isBoostActive() ? 10 : 5} pkt`
    : `Poprawna: „${item.front}”.`;
  $('#quizFeedback').classList.add(correct ? 'correct' : 'wrong');
  $('#nextQuestion').hidden = false;
}

function nextQuestion() {
  quizIndex += 1;
  if (quizIndex < quizSet.length) renderQuestion();
  else showResult();
}

function showResult() {
  $('#quizCard').hidden = true;
  $('#quizResult').hidden = false;
  $('#quizResult').classList.remove('quiz-finished');
  requestAnimationFrame(() => $('#quizResult').classList.add('quiz-finished'));
  $('#quizScore').textContent = quizScore;
  $('#quizTotal').textContent = quizSet.length;
  const resultRatio = quizSet.length ? quizScore / quizSet.length : 0;
  $('#quizResultText').textContent = resultRatio >= 0.9
    ? 'Bardzo dobra znajomość wybranego zakresu.'
    : resultRatio >= 0.65
      ? 'Solidny wynik — wróć do pomylonych zagadnień.'
      : 'Powtórz fiszki z tego rozdziału i spróbuj ponownie.';
  $('#quizProgressBar').style.width = '100%';
  if (!quizRewardGranted && quizSet.length) {
    quizRewardGranted = true;
    const resultRatio = quizScore / quizSet.length;
    const performanceBonus = resultRatio === 1 ? 10 : resultRatio >= 0.8 ? 5 : 0;
    recordStudyDay();
    progress.completedQuizzes += 1;
    const awardedBonus = performanceBonus
      ? awardPoints(performanceBonus, resultRatio === 1 ? 'premia za 100%' : 'premia za wynik 80%+', $('#quizResult'))
      : 0;
    const earned = quizBasePoints + awardedBonus;
    $('#quizPointsEarned').textContent = earned
      ? `${earned} pkt w tym zestawie${awardedBonus ? ` · premia +${awardedBonus}` : ''}`
      : 'Tym razem bez punktów — spróbuj ponownie po krótkiej powtórce.';
    if (!performanceBonus) saveProgress();
  }
}

function testPool() {
  return currentStudyCards().filter(item => selectedTestChapter === 'all' || item.chapter === Number(selectedTestChapter));
}

function startTest() {
  const pool = testPool();
  const requestedLength = selectedTestLength === 'all' ? pool.length : Number(selectedTestLength);
  testSet = shuffle(pool).slice(0, Math.min(requestedLength, pool.length));
  testIndex = 0;
  testScore = 0;
  testAnswered = false;
  testRewardGranted = false;
  testBasePoints = 0;
  $('#testPoolCount').textContent = `${pool.length} zagadnień · ${testSet.length} pytań`;
  $('#testPointsEarned').textContent = '';
  $('#testCard').hidden = false;
  $('#testResult').hidden = true;
  $('#testResult').classList.remove('quiz-finished');
  if (!testSet.length) {
    $('#testQuestion').textContent = 'Brak pytań dla wybranego rozdziału.';
    $('#testPage').textContent = '';
    $('#testAnswer').disabled = true;
    $('#testAnswerSubmit').disabled = true;
    $('#showTestAnswer').disabled = true;
    $('#testProgressLabel').textContent = '0 pytań';
    $('#testProgressBar').style.width = '0%';
    return;
  }
  renderTestQuestion();
}

function renderTestQuestion() {
  const item = testSet[testIndex];
  testAnswered = false;
  $('#testProgressLabel').textContent = `Pytanie ${testIndex + 1} z ${testSet.length}`;
  $('#testProgressBar').style.width = `${(testIndex / testSet.length) * 100}%`;
  $('#testPage').textContent = item.chapter ? `ROZDZIAŁ ${item.chapter}` : 'SŁOWNIK';
  $('#testQuestion').textContent = item.back;
  $('#testAnswer').value = '';
  $('#testAnswer').disabled = false;
  $('#testAnswerSubmit').disabled = false;
  $('#showTestAnswer').disabled = false;
  $('#testFeedback').textContent = '';
  $('#testFeedback').className = 'quiz-feedback';
  $('#testCard').classList.remove('answer-correct', 'answer-wrong');
  $('#nextTestQuestion').hidden = true;
  window.setTimeout(() => $('#testAnswer').focus(), 50);
}

function answerTest() {
  if (testAnswered) return;
  const answer = $('#testAnswer').value.trim();
  if (!answer) {
    $('#testFeedback').textContent = 'Najpierw wpisz odpowiedź.';
    $('#testFeedback').className = 'quiz-feedback wrong';
    return;
  }

  testAnswered = true;
  const item = testSet[testIndex];
  const normalizedAnswer = normalizeText(answer);
  const correct = normalizedAnswer === normalizeText(item.term) || normalizedAnswer === normalizeText(item.front);
  if (correct) {
    testScore += 1;
    const awarded = awardPoints(5, 'poprawna odpowiedź w teście', $('#testCard'));
    testBasePoints += awarded;
  }

  $('#testAnswer').disabled = true;
  $('#testAnswerSubmit').disabled = true;
  $('#showTestAnswer').disabled = true;
  $('#testCard').classList.remove('answer-correct', 'answer-wrong');
  requestAnimationFrame(() => $('#testCard').classList.add(correct ? 'answer-correct' : 'answer-wrong'));
  $('#testFeedback').textContent = correct ? `Dobrze · +${isBoostActive() ? 10 : 5} pkt` : `Poprawna odpowiedź: „${item.front}”.`;
  $('#testFeedback').className = `quiz-feedback ${correct ? 'correct' : 'wrong'}`;
  $('#nextTestQuestion').hidden = false;
}

function showTestAnswer() {
  if (testAnswered) return;
  testAnswered = true;
  const item = testSet[testIndex];
  if (!item) return;
  $('#testAnswer').disabled = true;
  $('#testAnswerSubmit').disabled = true;
  $('#showTestAnswer').disabled = true;
  $('#testCard').classList.remove('answer-correct', 'answer-wrong');
  requestAnimationFrame(() => $('#testCard').classList.add('answer-wrong'));
  $('#testFeedback').textContent = `Poprawna odpowiedź: „${item.front}”.`;
  $('#testFeedback').className = 'quiz-feedback revealed';
  $('#nextTestQuestion').hidden = false;
}

function nextTestQuestion() {
  testIndex += 1;
  if (testIndex < testSet.length) renderTestQuestion();
  else showTestResult();
}

function showTestResult() {
  $('#testCard').hidden = true;
  $('#testResult').hidden = false;
  $('#testResult').classList.remove('quiz-finished');
  requestAnimationFrame(() => $('#testResult').classList.add('quiz-finished'));
  $('#testScore').textContent = testScore;
  $('#testTotal').textContent = testSet.length;
  const resultRatio = testSet.length ? testScore / testSet.length : 0;
  $('#testResultText').textContent = resultRatio === 1
    ? 'Pełne opanowanie zestawu.'
    : resultRatio >= 0.8
      ? 'Bardzo dobry wynik.'
      : 'Oznacz trudne fiszki gwiazdką i powtórz materiał.';
  $('#testProgressBar').style.width = '100%';
  if (!testRewardGranted && testSet.length) {
    testRewardGranted = true;
    const performanceBonus = resultRatio === 1 ? 10 : resultRatio >= 0.8 ? 5 : 0;
    recordStudyDay();
    progress.completedTests += 1;
    const awardedBonus = performanceBonus
      ? awardPoints(performanceBonus, resultRatio === 1 ? 'premia za test 100%' : 'premia za test 80%+', $('#testResult'))
      : 0;
    const earned = testBasePoints + awardedBonus;
    $('#testPointsEarned').textContent = earned
      ? `${earned} pkt w tym teście${awardedBonus ? ` · premia +${awardedBonus}` : ''}`
      : 'Tym razem bez punktów — spróbuj po krótkiej powtórce.';
    if (!performanceBonus) saveProgress();
  }
}

function renderChapterSelect(selector, includeAllLabel) {
  $(selector).innerHTML = [
    `<option value="all">${escapeHtml(includeAllLabel)}</option>`,
    ...subjectData().chapters.map(chapter => `<option value="${chapter.number}">${chapter.number}. ${escapeHtml(chapter.title)}</option>`)
  ].join('');
}

function scoreAnswer(entry, query) {
  if (!query) return entry.type === 'Odpowiedź' ? 3 : entry.type === 'Wzór' ? 2 : 1;
  const normalizedQuery = normalizeText(query);
  const title = normalizeText(entry.title);
  const answer = normalizeText(entry.answer);
  const context = normalizeText(entry.context);
  const tokens = searchTokens(query);
  let score = 0;
  if (title === normalizedQuery) score += 120;
  if (title.includes(normalizedQuery)) score += 60;
  if (answer.includes(normalizedQuery)) score += 30;
  tokens.forEach(token => {
    if (title.includes(token)) score += 14;
    if (answer.includes(token)) score += 5;
    if (context.includes(token)) score += 3;
  });
  return score;
}

function renderAnswers() {
  const query = $('#answerSearch').value.trim();
  const entries = currentAnswerEntries();
  const matches = entries
    .filter(entry => selectedAnswerChapter === 'all' || entry.chapter === Number(selectedAnswerChapter))
    .map(entry => ({ ...entry, score: scoreAnswer(entry, query) }))
    .filter(entry => !query || entry.score > 0)
    .sort((a, b) => b.score - a.score || (a.chapter || 99) - (b.chapter || 99) || a.title.localeCompare(b.title, 'pl-PL'));
  const visible = matches.slice(0, query ? 60 : 18);

  const chapterLabel = selectedAnswerChapter === 'all' ? '' : ` w rozdziale ${selectedAnswerChapter}`;
  $('#answerCount').textContent = query
    ? `Znaleziono ${matches.length} odpowiedzi${chapterLabel}. Najtrafniejsze wyniki są na początku.`
    : `Baza obejmuje ${entries.length} odpowiedzi, tematów, definicji i objaśnień wzorów${chapterLabel}.`;
  $('#answerResults').innerHTML = visible.length
    ? visible.map(entry => {
      const chapter = entry.chapter ? chapterByNumber(entry.chapter) : null;
      return `
        <article class="answer-card">
          <div class="answer-meta">
            <span>${escapeHtml(entry.type)}</span>
            <span>${chapter ? `ROZDZIAŁ ${entry.chapter}` : escapeHtml(entry.context)}</span>
          </div>
          <h3>${escapeHtml(entry.title)}</h3>
          <p>${escapeHtml(entry.answer)}</p>
          ${chapter ? `<small>${escapeHtml(chapter.title)}</small>` : ''}
        </article>
      `;
    }).join('')
    : '<p class="concept-empty">Nie znaleziono bezpośredniej odpowiedzi. Spróbuj użyć krótszego hasła, np. „elastyczność”, „monopol” albo „podatek”.</p>';
}

function renderScope() {
  const query = normalizeText($('#scopeSearch').value);
  const data = subjectData();
  const totalTopics = data.outline.reduce((sum, chapter) => sum + chapter.topics.length, 0);
  $('#scopeTopicCount').textContent = totalTopics;

  const chapters = data.outline.map(outline => {
    const chapter = chapterByNumber(outline.number);
    const guide = data.guides.find(item => item.number === outline.number);
    const headingMatches = normalizeText(`${chapter.partTitle} ${chapter.title}`).includes(query);
    const summaryMatches = normalizeText(`${guide.overview} ${guide.qa.flat().join(' ')}`).includes(query);
    const matchingTopics = query && !headingMatches
      ? outline.topics.filter(topic => normalizeText(topic).includes(query))
      : outline.topics;
    return {
      chapter,
      guide,
      outline,
      matchingTopics,
      headingMatches,
      summaryMatches,
      matches: !query || headingMatches || summaryMatches || matchingTopics.length
    };
  }).filter(item => item.matches);

  $('#scopeList').innerHTML = chapters.length ? chapters.map(({ chapter, guide, matchingTopics, headingMatches, summaryMatches }) => {
    const topicsOpen = Boolean(query && (headingMatches || matchingTopics.length));
    const summaryOpen = Boolean(query && summaryMatches && !topicsOpen);
    return `
    <article class="scope-chapter ${topicsOpen ? 'topics-open' : ''} ${summaryOpen ? 'summary-open' : ''}">
      <div class="scope-chapter-head">
        <button class="scope-toggle" aria-expanded="${topicsOpen}">
          <span class="scope-number">${String(chapter.number).padStart(2, '0')}</span>
          <span class="scope-copy">
            <small>CZĘŚĆ ${escapeHtml(chapter.part)} · ${escapeHtml(chapter.partTitle)}</small>
            <strong>${escapeHtml(chapter.title)}</strong>
          </span>
          <span class="scope-topics-label">Tematy</span>
          <span class="scope-arrow" aria-hidden="true">+</span>
        </button>
        <button class="scope-summary-toggle" type="button" aria-expanded="${summaryOpen}">Streszczenie</button>
      </div>
      <div class="scope-summary-panel">
        <p>${escapeHtml(guide.overview)}</p>
        <strong class="scope-summary-label">Najważniejsze wnioski</strong>
        <ul>${guide.qa.map(([question, answer]) => `
          <li><strong>${escapeHtml(question)}</strong><span>${escapeHtml(answer)}</span></li>
        `).join('')}</ul>
      </div>
      <div class="scope-content">
        <div class="scope-content-head">
          <strong>${matchingTopics.length} tematów w rozdziale</strong>
          <button class="text-button" data-answer-chapter="${chapter.number}">Zobacz odpowiedzi →</button>
        </div>
        <ol>${matchingTopics.map(topic => `<li>${escapeHtml(topic)}</li>`).join('')}</ol>
      </div>
    </article>
  `;
  }).join('') : '<p class="concept-empty">Nie znaleziono takiego tematu ani informacji w streszczeniach.</p>';

  document.querySelectorAll('.scope-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const chapter = button.closest('.scope-chapter');
      const open = chapter.classList.toggle('topics-open');
      button.setAttribute('aria-expanded', String(open));
    });
  });
  document.querySelectorAll('.scope-summary-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const chapter = button.closest('.scope-chapter');
      const open = chapter.classList.toggle('summary-open');
      button.setAttribute('aria-expanded', String(open));
    });
  });
  document.querySelectorAll('[data-answer-chapter]').forEach(button => {
    button.addEventListener('click', () => {
      selectedAnswerChapter = button.dataset.answerChapter;
      $('#answerChapter').value = selectedAnswerChapter;
      $('#answerSearch').value = '';
      renderAnswers();
      switchMode('answers');
    });
  });
}

const auditedVariableDetails = {
  'Nachylenie prostej': 'm - nachylenie; x - zmienna na osi poziomej; y - zmienna na osi pionowej; Δx i Δy - odpowiednie zmiany między dwoma punktami.',
  'Funkcja liniowa': 'y - zmienna objaśniana; x - zmienna objaśniająca; a - wyraz wolny, czyli wartość y przy x = 0; b - nachylenie, czyli zmiana y po wzroście x o jednostkę.',
  'Wartość realna': 'Wartość nominalna - wielkość w cenach bieżących; indeks cen - poziom cen względem okresu bazowego; 100 - wartość indeksu w okresie bazowym.',
  'Liniowa funkcja popytu': 'Qᴅ - wielkość zapotrzebowania; P - cena dobra; a - popyt przy P = 0; b - dodatni parametr reakcji popytu na cenę.',
  'Liniowa funkcja podaży': 'Qₛ - wielkość oferowana; P - cena dobra; c - wyraz wolny funkcji podaży, który może być ujemny; d - dodatni parametr reakcji podaży na cenę.',
  'Warunek równowagi rynkowej': 'Qᴅ(P*) - popyt przy cenie równowagi; Qₛ(P*) - podaż przy tej cenie; P* - cena równowagi; Q* - ilość równowagi.',
  'Popyt rynkowy': 'Qᴅʳ(P) - popyt całego rynku przy cenie P; Qᴅᵢ(P) - popyt kupującego i; i - numer kupującego; Σ - suma po wszystkich kupujących.',
  'Podaż rynkowa': 'Qₛʳ(P) - podaż całego rynku przy cenie P; Qₛᵢ(P) - podaż sprzedawcy i; i - numer sprzedawcy; Σ - suma po wszystkich sprzedawcach.',
  'Zmiana procentowa – punkt środkowy': '%ΔX - procentowa zmiana zmiennej X; X₁ - wartość początkowa; X₂ - wartość końcowa; (X₂ + X₁)/2 - średnia obu wartości.',
  'Elastyczność cenowa popytu': 'Eᴅ - elastyczność cenowa popytu; %ΔQᴅ - procentowa zmiana wielkości popytu; %ΔP - procentowa zmiana ceny; |Eᴅ| - wartość bezwzględna elastyczności.',
  'Punktowa elastyczność popytu': 'Eᴅ - elastyczność w punkcie; dQᴅ/dP - pochodna popytu względem ceny; P - cena w badanym punkcie; Qᴅ - popyt w tym punkcie.',
  'Elastyczność cenowa podaży': 'Eₛ - elastyczność cenowa podaży; %ΔQₛ - procentowa zmiana wielkości podaży; %ΔP - procentowa zmiana ceny.',
  'Punktowa elastyczność podaży': 'Eₛ - elastyczność w punkcie; dQₛ/dP - pochodna podaży względem ceny; P - cena w punkcie; Qₛ - podaż w punkcie.',
  'Elastyczność dochodowa popytu': 'Eʏ - elastyczność dochodowa; %ΔQᴅ - procentowa zmiana popytu; %ΔY - procentowa zmiana dochodu; Y - dochód konsumenta.',
  'Mieszana elastyczność cenowa': 'Eₓᵧ - mieszana elastyczność popytu na X względem ceny Y; Qₓ - popyt na dobro X; Pᵧ - cena dobra Y.',
  'Utarg całkowity': 'TR - utarg całkowity; P - cena jednej jednostki; Q - liczba sprzedanych jednostek.',
  'Ograniczenie budżetowe': 'Pₓ i Pᵧ - ceny dóbr X i Y; X i Y - kupowane ilości; I - dochód lub budżet konsumenta.',
  'Nachylenie linii budżetowej': 'Pₓ - cena dobra na osi X; Pᵧ - cena dobra na osi Y; −Pₓ/Pᵧ - liczba jednostek Y tracona przy zwiększeniu X o jednostkę.',
  'Użyteczność krańcowa': 'MU - użyteczność krańcowa; TU - użyteczność całkowita; Q - ilość dobra; ΔTU - przyrost użyteczności; ΔQ - przyrost ilości.',
  'Krańcowa stopa substytucji': 'MRSₓᵧ - liczba jednostek Y, z których konsument zrezygnuje za dodatkową jednostkę X; MUₓ i MUᵧ - użyteczności krańcowe dóbr X i Y.',
  'Optimum konsumenta': 'MRSₓᵧ - krańcowa stopa substytucji Y dobrem X; Pₓ/Pᵧ - relacja cen dóbr X i Y.',
  'Reguła wyrównania użyteczności': 'MUₓ i MUᵧ - użyteczności krańcowe; Pₓ i Pᵧ - ceny dóbr; MU/P - dodatkowa użyteczność z ostatniej jednostki pieniądza.',
  'Koszt całkowity': 'TC - koszt całkowity; FC - koszt stały niezależny od produkcji; VC - koszt zmienny zależny od produkcji.',
  'Przeciętny koszt stały': 'AFC - przeciętny koszt stały; FC - koszt stały; Q - liczba wytworzonych jednostek.',
  'Przeciętny koszt zmienny': 'AVC - przeciętny koszt zmienny; VC - koszt zmienny; Q - wielkość produkcji.',
  'Przeciętny koszt całkowity': 'ATC - przeciętny koszt całkowity; TC - koszt całkowity; AFC - przeciętny koszt stały; AVC - przeciętny koszt zmienny; Q - produkcja.',
  'Koszt krańcowy': 'MC - koszt krańcowy; ΔTC - zmiana kosztu całkowitego; ΔQ - zmiana produkcji.',
  'Produkt krańcowy': 'MPᴸ - produkt krańcowy pracy; Q - produkcja; L - nakład pracy; ΔQ - przyrost produkcji; ΔL - przyrost pracy.',
  'Zysk ekonomiczny': 'π - zysk ekonomiczny; TR - utarg całkowity; TC - koszt ekonomiczny obejmujący koszty jawne i ukryte.',
  'Utarg krańcowy': 'MR - utarg krańcowy; TR - utarg całkowity; Q - produkcja; ΔTR - przyrost utargu; ΔQ - przyrost sprzedaży.',
  'Warunek maksymalizacji zysku': 'MR - utarg krańcowy; MC - koszt krańcowy; równość wyznacza kandydata na ilość maksymalizującą zysk.',
  'Zysk na wykresie': 'π - zysk ekonomiczny; P - cena; ATC - przeciętny koszt całkowity przy produkcji Q; Q - sprzedana ilość.',
  'Firma konkurencyjna': 'P - cena rynkowa; MR - utarg krańcowy; AR - utarg przeciętny równy TR/Q.',
  'Nadwyżka konsumenta': 'CS - nadwyżka konsumentów; WTPᵢ - skłonność do zapłaty nabywcy i; P - cena; Σ - suma po zakupionych jednostkach.',
  'Nadwyżka producenta': 'PS - nadwyżka producentów; P - cena; kosztᵢ - koszt krańcowy i-tej sprzedanej jednostki; Σ - suma po transakcjach.',
  'Nadwyżka całkowita': 'TS - nadwyżka całkowita; CS - nadwyżka konsumentów; PS - nadwyżka producentów.',
  'Klin podatkowy': 'Pᵦ - cena brutto płacona przez kupującego; Pₛ - cena netto otrzymywana przez sprzedawcę; t - podatek na jednostkę.',
  'Przybliżony podział ciężaru podatku': 'Eₛ - elastyczność podaży; |Eᴅ| - bezwzględna elastyczność popytu; wynik - część podatku przypadająca kupującym.',
  'Dochód podatkowy': 'T - całkowity dochód podatkowy; t - podatek jednostkowy; Qₜ - liczba transakcji po nałożeniu podatku.',
  'Zbędna strata podatku': 'DWL - zbędna strata społeczna; t - podatek jednostkowy; Q* - ilość bez podatku; Qₜ - ilość po podatku; ½ - współczynnik pola trójkąta.',
  'Przeciętna stopa podatkowa': 'ATR - przeciętna stopa podatkowa; podatek całkowity - suma zapłaconego podatku; dochód całkowity - podstawa porównania.',
  'Krańcowa stopa podatkowa': 'MTR - krańcowa stopa podatkowa; Δpodatku - wzrost podatku; Δdochodu - odpowiadający mu wzrost dochodu.',
  'Społeczna skłonność do płacenia': 'MBₛ(Q) - społeczna korzyść krańcowa przy ilości Q; MBᵢ(Q) - korzyść krańcowa osoby i; Σ - pionowa suma po wszystkich osobach.',
  'Optimum dobra publicznego': 'MBᵢ(Q*) - korzyść krańcowa osoby i; MC(Q*) - koszt krańcowy; Q* - efektywna ilość dobra publicznego; Σ - suma korzyści.',
  'Krańcowy koszt społeczny': 'MSC - krańcowy koszt społeczny; MPC - krańcowy koszt prywatny; MEC - krańcowy koszt zewnętrzny.',
  'Krańcowa korzyść społeczna': 'MSB - krańcowa korzyść społeczna; MPB - krańcowa korzyść prywatna; MEB - krańcowa korzyść zewnętrzna.',
  'Optimum społeczne': 'MSB(Q*) - społeczna korzyść krańcowa; MSC(Q*) - społeczny koszt krańcowy; Q* - ilość maksymalizująca nadwyżkę społeczną.',
  'Podatek Pigou': 'tᴾ - podatek Pigou na jednostkę; MEC(Q*) - krańcowy koszt zewnętrzny oceniony przy społecznie optymalnej ilości Q*.',
  'Funkcja produkcji': 'Q - maksymalna produkcja; f - zależność technologiczna; L - nakład pracy; K - nakład kapitału.',
  'Równanie izokoszty': 'C - łączny koszt nakładów; w - cena jednostki pracy, czyli płaca; L - ilość pracy; r - cena jednostki kapitału; K - ilość kapitału.',
  'Nachylenie izokoszty': 'w - cena pracy; r - cena kapitału; −w/r - liczba jednostek kapitału oddawana za dodatkową jednostkę pracy przy stałym koszcie.',
  'Krańcowa stopa substytucji technicznej': 'MRTSᴸᴷ - techniczna stopa zastępowania kapitału pracą; MPᴸ - produkt krańcowy pracy; MPᴷ - produkt krańcowy kapitału.',
  'Minimum kosztu': 'MPᴸ i MPᴷ - produkty krańcowe pracy i kapitału; w i r - ich ceny; MP/cena - produkcja z ostatniej jednostki wydatku.',
  'Monopol – wybór ilości': 'MR(Qₘ) - utarg krańcowy przy ilości monopolowej; MC(Qₘ) - koszt krańcowy; Qₘ - ilość monopolowa; Pₘ - cena odczytana z popytu.',
  'Indeks Lernera': 'P - cena monopolowa; MC - koszt krańcowy; Eᴅ - elastyczność cenowa popytu przy ilości monopolowej; |Eᴅ| - jej wartość bezwzględna.',
  'Wskaźnik koncentracji': 'CRₙ - łączny udział n największych firm; n - liczba uwzględnionych firm; sᵢ - udział rynkowy firmy i; Σ₁ⁿ - suma od pierwszej do n-tej firmy.',
  'Indeks Herfindahla-Hirschmana': 'HHI - indeks koncentracji; sᵢ - udział rynkowy firmy i; sᵢ² - kwadrat udziału; Σ - suma po wszystkich firmach.',
  'Produkt krańcowy pracy': 'MPᴸ - produkt krańcowy pracy; Q - produkcja; L - zatrudnienie; ΔQ - przyrost produkcji; ΔL - przyrost pracy.',
  'Wartość produktu krańcowego pracy': 'VMPᴸ - wartość produktu krańcowego pracy; P - cena produktu; MPᴸ - produkt krańcowy pracy.',
  'Warunek zatrudnienia': 'w - płaca za jednostkę pracy; VMPᴸ - wartość produktu krańcowego ostatniej jednostki pracy.',
  'Renta ekonomiczna': 'Renta - nadwyżka wynagrodzenia; wynagrodzenie faktyczne - otrzymany dochód; dochód transferowy - minimum konieczne, aby czynnik pozostał w zastosowaniu.',
  'Współczynnik Giniego': 'G - współczynnik Giniego; A - pole między linią pełnej równości a krzywą Lorenza; B - pole pod krzywą Lorenza; A + B - całe pole pod linią równości.',
  'Stopa ubóstwa': 'Stopa ubóstwa - procent populacji poniżej progu; liczba osób ubogich - licznik; populacja - wszystkie badane osoby; 100% - zamiana udziału na procent.',
  'Koszt alternatywny produkcji': 'OCₓ - koszt alternatywny jednostki dobra X; Y - dobro poświęcane; X - dobro zwiększane.',
  'Warunek korzystnych warunków wymiany': 'OCₓᴬ i OCₓᴮ - koszty alternatywne X w krajach A i B; cena wymienna X - ilość Y płacona za jednostkę X.',
  'Import': 'M - wielkość importu; Qᴅ(Pw) - popyt krajowy przy cenie światowej; Qₛ(Pw) - podaż krajowa; Pw - cena światowa.',
  'Eksport': 'X - wielkość eksportu; Qₛ(Pw) - podaż krajowa przy cenie światowej; Qᴅ(Pw) - popyt krajowy; Pw - cena światowa.',
  'Dochód z cła': 'T - dochód państwa z cła; t - cło na jednostkę; Mₜ - wielkość importu po wprowadzeniu cła.'
};

const formulaAuditNotes = {
  'Wartość realna': 'Indeks cen musi być zapisany przy bazie 100. Jeśli używa się indeksu w postaci 1,00, nie mnoży się wyniku przez 100.',
  'Elastyczność cenowa popytu': 'Dla zwykłej malejącej krzywej popytu wynik ma znak ujemny; przy klasyfikacji popytu zwykle używa się wartości bezwzględnej.',
  'Punktowa elastyczność popytu': 'Pochodna dQᴅ/dP jest zwykle ujemna. Do oceny siły reakcji stosuje się |Eᴅ|.',
  'Krańcowa stopa substytucji': 'Podana wartość jest dodatnią wielkością wymiany. Nachylenie krzywej obojętności ma znak przeciwny: −MUₓ/MUᵧ.',
  'Optimum konsumenta': 'Warunek dotyczy optimum wewnętrznego i różniczkowalnych preferencji. Przy rozwiązaniu narożnym równość nie musi zachodzić.',
  'Warunek maksymalizacji zysku': 'MC powinien przecinać MR od dołu; trzeba też sprawdzić warunek zamknięcia lub wyjścia z rynku.',
  'Nadwyżka całkowita': 'Gdy występuje podatek, do dobrobytu społecznego dodaje się dochód państwa: TS = CS + PS + T.',
  'Przybliżony podział ciężaru podatku': 'Wzór opisuje lokalny podział małego podatku przy standardowych krzywych popytu i podaży. Udział sprzedawców wynosi |Eᴅ|/(Eₛ + |Eᴅ|).',
  'Zbędna strata podatku': 'Dla liniowych krzywych jest to dokładne pole trójkąta; przy krzywych nieliniowych stanowi przybliżenie.',
  'Krańcowa stopa substytucji technicznej': 'Podana MRTS jest dodatnią liczbą jednostek kapitału zastępowanych jednostką pracy. Nachylenie izokwanty wynosi −MPᴸ/MPᴷ.',
  'Minimum kosztu': 'Warunek dotyczy rozwiązania wewnętrznego przy dodatnich cenach czynników i gładkiej izokwancie.',
  'Indeks Lernera': 'Równość z odwrotnością elastyczności obowiązuje dla jednoproduktowego monopolisty maksymalizującego zysk; Eᴅ mierzy się w punkcie wyboru monopolu.',
  'Indeks Herfindahla-Hirschmana': 'Przy udziałach procentowych HHI mieści się od wartości bliskiej 0 do 10 000; przy udziałach dziesiętnych od 0 do 1. Nie wolno mieszać skal.',
  'Warunek zatrudnienia': 'W tej postaci zakłada konkurencyjny rynek produktu i pracy. Przy sile rynkowej firmy właściwą wielkością jest krańcowy przychód z produktu pracy.',
  'Współczynnik Giniego': 'B oznacza pole pod krzywą Lorenza, a A + B całe pole pod linią pełnej równości. G mieści się od 0 do 1.',
  'Warunek korzystnych warunków wymiany': 'Cena wymienna i oba koszty alternatywne muszą być wyrażone w tej samej jednostce: ilości Y za jednostkę X.',
  'Import': 'Wzór dotyczy sytuacji, w której cena światowa jest niższa od ceny równowagi w autarkii.',
  'Eksport': 'Wzór dotyczy sytuacji, w której cena światowa jest wyższa od ceny równowagi w autarkii.'
};

function notationExplanation(formula) {
  const notes = ['= oznacza równość lewej i prawej strony'];
  if (formula.includes('Δ')) notes.push('Δ oznacza zmianę: wartość końcowa minus początkowa');
  if (formula.includes('%')) notes.push('% oznacza zmianę lub udział procentowy');
  if (formula.includes('Σ')) notes.push('Σ oznacza sumowanie po wskazanych osobach albo przedsiębiorstwach');
  if (formula.includes('×')) notes.push('× oznacza mnożenie');
  if (formula.includes('/')) notes.push('/ albo kreska ułamkowa oznacza dzielenie');
  if (formula.includes('−')) notes.push('− oznacza odejmowanie lub ujemne nachylenie');
  if (formula.includes('+')) notes.push('+ oznacza dodawanie składników');
  if (formula.includes('≈')) notes.push('≈ oznacza wartość przybliżoną');
  if (formula.includes('|')) notes.push('|·| oznacza wartość bezwzględną, czyli wielkość bez znaku');
  if (formula.includes('*')) notes.push('* przy zmiennej oznacza wartość równowagi albo optimum');
  if (formula.includes('dQ')) notes.push('d oznacza pochodną, czyli krańcowe tempo zmiany w punkcie');
  if (formula.includes('f(')) notes.push('f(·) oznacza funkcję łączącą argumenty z wynikiem');
  if (/[₀-₉ₐ-ₜᴬ-ᶻ]/u.test(formula)) notes.push('indeksy dolne i górne rozróżniają dobra, strony rynku lub warianty zmiennej');
  return notes.join('; ') + '.';
}

function completeFormulaExplanation(item) {
  const assumption = formulaAuditNotes[item.name] ? ` Ważne założenie: ${formulaAuditNotes[item.name]}` : '';
  return `${item.formula}. ${item.use} Zmienne i wartości: ${auditedVariableDetails[item.name] || item.variables} Znaki: ${notationExplanation(item.formula)}${assumption}`;
}

const formulaAnswerEntries = allAnswerEntries.filter(entry => entry.type === 'Wzór');
formulaAnswerEntries.forEach(entry => {
  const item = subjectData(entry.subject).formulas.find(formula => `Jak obliczyć: ${formula.name}?` === entry.title);
  if (item) entry.answer = completeFormulaExplanation(item);
});

function renderMath() {
  const data = subjectData();
  const query = normalizeText($('#mathSearch').value);
  const chapterFilter = item => selectedMathChapter === 'all' || item.chapter === Number(selectedMathChapter);
  const textFilter = item => !query || normalizeText(Object.values(item).join(' ')).includes(query)
    || searchTokens(query).some(token => normalizeText(Object.values(item).join(' ')).includes(token));
  const formulas = data.formulas.filter(chapterFilter).filter(textFilter);

  $('#formulaCount').textContent = data.formulas.length;
  $('#mathCount').textContent = `Wyświetlono ${formulas.length} z ${data.formulas.length} zweryfikowanych wzorów.`;

  $('#formulaGrid').innerHTML = formulas.length ? formulas.map(item => `
    <article class="formula-card">
      <div class="formula-meta"><span>ROZDZIAŁ ${item.chapter}</span><span>${escapeHtml(item.group)}</span></div>
      <h3>${escapeHtml(item.name)}</h3>
      <div class="formula-expression">${escapeHtml(item.formula)}</div>
      <div class="formula-detail"><strong>Co oznacza i kiedy stosować</strong><p>${escapeHtml(item.use)}</p></div>
      <div class="formula-detail"><strong>Zmienne i wartości</strong><p>${escapeHtml(auditedVariableDetails[item.name] || item.variables)}</p></div>
      <div class="formula-detail"><strong>Znaki i zapis</strong><p>${escapeHtml(notationExplanation(item.formula))}</p></div>
      ${formulaAuditNotes[item.name] ? `<div class="formula-detail audit-note"><strong>Ważne założenie</strong><p>${escapeHtml(formulaAuditNotes[item.name])}</p></div>` : ''}
    </article>
  `).join('') : '<p class="concept-empty">Nie znaleziono wzoru dla tego filtra.</p>';
}

const oweDifficultyByStage = {
  school: { value: 'basic', label: 'Podstawowy' },
  district: { value: 'intermediate', label: 'Średni' },
  central: { value: 'advanced', label: 'Zaawansowany' }
};

function oweQuestionDifficulty(question) {
  return oweDifficultyByStage[question.stage] || { value: 'basic', label: 'Podstawowy' };
}

function oweQuizPool() {
  return oweQuestions.filter(question => (
    selectedOweQuizDifficulty === 'all'
    || oweQuestionDifficulty(question).value === selectedOweQuizDifficulty
  ));
}

function correctOweAnswerIndices(question) {
  const answers = Array.isArray(question.correct) ? question.correct : [question.correct];
  return [...new Set(answers.map(Number).filter(Number.isInteger))].sort((a, b) => a - b);
}

function formatOweAnswers(question, indices, includeCopy = false) {
  return indices.map(index => {
    const letter = String.fromCharCode(65 + index);
    return includeCopy ? `${letter} — ${question.options[index]}` : letter;
  }).join(', ');
}

function updateOweQuizPool() {
  if (!$('#oweQuizPoolCount')) return;
  const pool = oweQuizPool();
  const difficulties = new Set(pool.map(question => oweQuestionDifficulty(question).value));
  const requestedCount = Number($('#oweQuizCount').value);
  if (requestedCount > pool.length && pool.length) {
    const availableCount = [30, 20, 10].find(value => value <= pool.length) || pool.length;
    $('#oweQuizCount').value = String(availableCount);
  }
  $('#oweQuizPoolCount').textContent = polishCount(pool.length, 'pytanie', 'pytania', 'pytań');
  $('#oweQuizPoolMeta').textContent = ` · ${polishCount(difficulties.size, 'poziom trudności', 'poziomy trudności', 'poziomów trudności')}`;
  if ($('#oweQuestionCount')) $('#oweQuestionCount').textContent = oweQuestions.length;
  if ($('#oweQuestionBankCount')) $('#oweQuestionBankCount').textContent = oweQuestions.length;
  $('#oweQuizStart').disabled = pool.length === 0;
}

function showOweQuizSetup() {
  $('#oweQuizSetup').hidden = false;
  $('#oweQuizSession').hidden = true;
  $('#oweQuizResult').hidden = true;
  updateOweQuizPool();
  $('#oweQuizSetup').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function startOweQuiz() {
  const pool = oweQuizPool();
  if (!pool.length) return;
  const requestedCount = Math.max(1, Number($('#oweQuizCount').value) || 10);
  const questions = shuffle(pool).slice(0, Math.min(requestedCount, pool.length));
  oweQuizState = {
    questions,
    index: 0,
    score: 0,
    answered: false,
    selectedAnswers: new Set(),
    responses: [],
    points: 0,
    rewardGranted: false
  };
  $('#oweQuizSetup').hidden = true;
  $('#oweQuizResult').hidden = true;
  $('#oweQuizSession').hidden = false;
  renderOweQuizQuestion();
  $('#oweQuizSession').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderOweQuizQuestion() {
  if (!oweQuizState) return;
  const { questions, index } = oweQuizState;
  const question = questions[index];
  const correctIndices = correctOweAnswerIndices(question);
  const isMultipleChoice = correctIndices.length > 1;
  const difficulty = oweQuestionDifficulty(question);
  oweQuizState.answered = false;
  oweQuizState.selectedAnswers = new Set();
  $('#oweQuizQuestionMeta').textContent = `POZIOM ${difficulty.label.toLocaleUpperCase('pl-PL')} · ARCHIWUM ${question.year} · PYTANIE ${question.number}`;
  $('#oweQuizProgressText').textContent = `Pytanie ${index + 1} z ${questions.length}`;
  $('#oweQuizProgressBar').style.width = `${((index + 1) / questions.length) * 100}%`;
  $('#oweQuizQuestion').textContent = question.question;
  $('#oweQuizFeedback').hidden = true;
  $('#oweQuizNext').hidden = true;
  $('#oweQuizSelectionHint').hidden = !isMultipleChoice;
  $('#oweQuizCheck').hidden = !isMultipleChoice;
  $('#oweQuizCheck').disabled = true;
  $('#oweQuizNext').innerHTML = index === questions.length - 1
    ? 'Zobacz wynik <span>→</span>'
    : 'Następne pytanie <span>→</span>';
  $('#oweQuizAnswers').innerHTML = question.options.map((option, optionIndex) => `
    <button class="owe-answer-option" type="button" data-owe-answer="${optionIndex}">
      <span>${String.fromCharCode(65 + optionIndex)}</span><b>${escapeHtml(option)}</b>
    </button>
  `).join('');
  document.querySelectorAll('[data-owe-answer]').forEach(button => {
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      const answerIndex = Number(button.dataset.oweAnswer);
      if (!isMultipleChoice) {
        answerOweQuizQuestion([answerIndex]);
        return;
      }
      if (oweQuizState.selectedAnswers.has(answerIndex)) {
        oweQuizState.selectedAnswers.delete(answerIndex);
      } else {
        oweQuizState.selectedAnswers.add(answerIndex);
      }
      const selected = oweQuizState.selectedAnswers.has(answerIndex);
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
      $('#oweQuizCheck').disabled = oweQuizState.selectedAnswers.size === 0;
    });
  });
}

function answerOweQuizQuestion(selection) {
  if (!oweQuizState || oweQuizState.answered) return;
  const question = oweQuizState.questions[oweQuizState.index];
  const selectedIndices = [...new Set(Array.from(selection).map(Number))].sort((a, b) => a - b);
  const correctIndices = correctOweAnswerIndices(question);
  const isCorrect = selectedIndices.length === correctIndices.length
    && selectedIndices.every((answer, index) => answer === correctIndices[index]);
  oweQuizState.answered = true;
  if (isCorrect) {
    oweQuizState.score += 1;
    oweQuizState.points += awardPoints(5, 'poprawna odpowiedź w arkuszu olimpijskim', $('#oweQuizSession'));
  }
  oweQuizState.responses.push({ question, selectedIndices, isCorrect });
  document.querySelectorAll('[data-owe-answer]').forEach(button => {
    const answerIndex = Number(button.dataset.oweAnswer);
    button.disabled = true;
    button.classList.toggle('correct', correctIndices.includes(answerIndex));
    button.classList.toggle('wrong', selectedIndices.includes(answerIndex) && !correctIndices.includes(answerIndex));
  });
  $('#oweQuizCheck').hidden = true;
  $('#oweQuizFeedback').hidden = false;
  $('#oweQuizFeedback').classList.toggle('is-correct', isCorrect);
  $('#oweQuizFeedback').classList.toggle('is-wrong', !isCorrect);
  $('#oweQuizFeedbackTitle').textContent = isCorrect
    ? `Dobra odpowiedź · +${isBoostActive() ? 10 : 5} pkt`
    : 'Jeszcze nie tym razem.';
  $('#oweQuizFeedbackCopy').textContent = isCorrect
    ? `Poprawna odpowiedź: ${formatOweAnswers(question, correctIndices)}.`
    : `${correctIndices.length > 1 ? 'Poprawne odpowiedzi to' : 'Poprawna odpowiedź to'} ${formatOweAnswers(question, correctIndices, true)}.`;
  $('#oweQuizQuestionSource').href = question.sourceUrl;
  $('#oweQuizNext').hidden = false;
  $('#oweQuizNext').focus({ preventScroll: true });
}

function showOweQuizResult() {
  if (!oweQuizState) return;
  const { score, questions, responses } = oweQuizState;
  const percent = Math.round((score / questions.length) * 100);
  const mistakes = responses.filter(response => !response.isCorrect);
  if (!oweQuizState.rewardGranted && questions.length) {
    oweQuizState.rewardGranted = true;
    recordStudyDay();
    progress.completedOweQuizzes += 1;
    const performanceBonus = percent === 100 ? 10 : percent >= 80 ? 5 : 0;
    if (performanceBonus) {
      oweQuizState.points += awardPoints(
        performanceBonus,
        percent === 100 ? 'premia za arkusz olimpijski bez błędu' : 'premia za wynik olimpijski 80%+',
        $('#oweQuizResult')
      );
    } else {
      saveProgress();
    }
  }
  $('#oweQuizSession').hidden = true;
  $('#oweQuizResult').hidden = false;
  $('#oweQuizScore').textContent = `${score}/${questions.length}`;
  $('#oweQuizPercent').textContent = `${percent}%`;
  $('#oweQuizResultTitle').textContent = percent >= 90
    ? 'Poziom olimpijski.'
    : percent >= 70
      ? 'Bardzo solidny wynik.'
      : percent >= 50
        ? 'Dobry punkt wyjścia.'
        : 'Ten zestaw warto powtórzyć.';
  $('#oweQuizResultCopy').textContent = mistakes.length
    ? `Masz ${polishCount(mistakes.length, 'pytanie', 'pytania', 'pytań')} do powtórki. Poniżej znajdziesz prawidłowe odpowiedzi i oficjalne źródła.`
    : 'Wszystkie odpowiedzi są poprawne. Spróbuj teraz innego poziomu trudności albo dłuższego zestawu.';
  $('#oweQuizPointsEarned').textContent = oweQuizState.points
    ? `+${oweQuizState.points} pkt za ten zestaw${percent >= 80 ? ' · premia za wynik wliczona' : ''}`
    : 'Tym razem bez punktów — przejrzyj odpowiedzi i spróbuj ponownie.';
  $('#oweQuizReview').innerHTML = mistakes.length
    ? `<h4>Do powtórki</h4>${mistakes.map(({ question, selectedIndices }) => {
        const correctIndices = correctOweAnswerIndices(question);
        return `
        <article>
          <span>Poziom ${escapeHtml(oweQuestionDifficulty(question).label)} · archiwum ${escapeHtml(question.year)} · pyt. ${question.number}</span>
          <strong>${escapeHtml(question.question)}</strong>
          <p>Twoja odpowiedź: ${escapeHtml(formatOweAnswers(question, selectedIndices, true) || 'brak')} · <b>${correctIndices.length > 1 ? 'Poprawne' : 'Poprawna'}: ${escapeHtml(formatOweAnswers(question, correctIndices, true))}</b></p>
          <a href="${escapeHtml(question.sourceUrl)}" target="_blank" rel="noopener noreferrer">Oficjalny klucz PTE ↗</a>
        </article>
      `; }).join('')}`
    : '<p class="owe-perfect-result">Bez błędów — świetna robota.</p>';
  $('#oweQuizResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function advanceOweQuiz() {
  if (!oweQuizState?.answered) return;
  if (oweQuizState.index >= oweQuizState.questions.length - 1) {
    showOweQuizResult();
    return;
  }
  oweQuizState.index += 1;
  renderOweQuizQuestion();
  $('#oweQuizSession').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderConcepts() {
  const data = subjectData();
  const query = $('#conceptSearch').value.trim().toLocaleLowerCase('pl-PL');
  const cards = currentStudyCards();
  const items = data.concepts.map((item, index) => ({ ...item, chapter: cards[index]?.chapter ?? item.chapter })).filter(item => {
    const searchable = `${item.term} ${item.note || ''} ${item.definition}`.toLocaleLowerCase('pl-PL');
    return searchable.includes(query);
  });

  $('#conceptCount').textContent = `Wyświetlono ${items.length} z ${data.concepts.length} zagadnień`;
  $('#conceptGrid').innerHTML = items.length
    ? items.map(item => `
      <article class="concept-card">
        <p class="concept-page">${item.chapter ? `ROZDZIAŁ ${item.chapter}` : 'SŁOWNIK'}</p>
        <h3>${escapeHtml(item.term)}</h3>
        ${item.note ? `<p class="concept-note">${escapeHtml(item.note)}</p>` : ''}
        <p>${escapeHtml(item.definition)}</p>
      </article>
    `).join('')
    : '<p class="concept-empty">Nie znaleziono zagadnienia. Spróbuj wpisać krótszą frazę.</p>';
}

document.querySelectorAll('[data-go]').forEach(button => {
  if (button.matches('a[href]')) return;
  button.addEventListener('click', event => {
    event.preventDefault();
    switchMode(button.dataset.go);
  });
});

document.querySelectorAll('.mode-tab').forEach(tab => {
  tab.addEventListener('click', event => {
    event.preventDefault();
    switchMode(tab.dataset.mode);
  });
});

$('#oweQuizCount').addEventListener('change', updateOweQuizPool);
document.querySelectorAll('[data-owe-quiz-difficulty]').forEach(button => {
  button.addEventListener('click', () => {
    selectedOweQuizDifficulty = button.dataset.oweQuizDifficulty;
    document.querySelectorAll('[data-owe-quiz-difficulty]').forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    updateOweQuizPool();
  });
});
$('#oweQuizStart').addEventListener('click', startOweQuiz);
$('#oweQuizCheck').addEventListener('click', () => answerOweQuizQuestion(oweQuizState?.selectedAnswers || []));
$('#oweQuizNext').addEventListener('click', advanceOweQuiz);
$('#oweQuizExit').addEventListener('click', showOweQuizSetup);
$('#oweQuizAgain').addEventListener('click', startOweQuiz);
$('#oweQuizChange').addEventListener('click', showOweQuizSetup);

$('#learnChapter').addEventListener('change', event => {
  selectedLearnChapter = event.target.value;
  updateLearnPoolUi();
});
$('#learnGoal').addEventListener('change', event => {
  selectedLearnGoal = event.target.value;
  updateLearnPoolUi();
});
$('#startLearn').addEventListener('click', startLearnSession);
$('#nextLearnQuestion').addEventListener('click', renderNextLearnQuestion);
$('#learnDontKnow').addEventListener('click', () => resolveLearnAnswer({ correct: false, sourceElement: $('#learnDontKnow'), skipped: true }));
$('#learnAgain').addEventListener('click', startLearnSession);
$('#learnChangeSettings').addEventListener('click', showLearnSetup);
$('#leaveLearnSession').addEventListener('click', leaveLearnSession);

$('#flashcardChapter').addEventListener('change', event => {
  selectedFlashcardChapter = event.target.value;
  currentCard = 0;
  renderCard();
});

$('#starredFilter').addEventListener('click', () => {
  showStarredOnly = !showStarredOnly;
  $('#starredFilter').classList.toggle('active', showStarredOnly);
  $('#starredFilter').setAttribute('aria-pressed', String(showStarredOnly));
  currentCard = 0;
  renderCard();
});

$('#flashcard').addEventListener('click', flipCard);
$('#starCard').addEventListener('click', toggleStarredCard);
$('#reverseFlashcards').addEventListener('click', toggleFlashcardDirection);
$('#prevCard').addEventListener('click', () => navigateCard(-1));
$('#nextCard').addEventListener('click', () => navigateCard(1));
document.querySelectorAll('[data-recall]').forEach(button => {
  button.addEventListener('click', () => recall(button.dataset.recall));
});

$('#nextQuestion').addEventListener('click', nextQuestion);
$('#restartQuiz').addEventListener('click', startQuiz);
$('#quizAgain').addEventListener('click', startQuiz);
$('#quizChapter').addEventListener('change', event => {
  selectedQuizChapter = event.target.value;
  startQuiz();
});
$('#quizLength').addEventListener('change', event => {
  selectedQuizLength = event.target.value;
  startQuiz();
});
$('#testAnswerForm').addEventListener('submit', event => {
  event.preventDefault();
  answerTest();
});
$('#showTestAnswer').addEventListener('click', showTestAnswer);
$('#nextTestQuestion').addEventListener('click', nextTestQuestion);
$('#restartTest').addEventListener('click', startTest);
$('#testAgain').addEventListener('click', startTest);
$('#testChapter').addEventListener('change', event => {
  selectedTestChapter = event.target.value;
  startTest();
});
$('#testLength').addEventListener('change', event => {
  selectedTestLength = event.target.value;
  startTest();
});
$('#conceptSearch').addEventListener('input', renderConcepts);
$('#answerSearch').addEventListener('input', renderAnswers);
$('#answerChapter').addEventListener('change', event => {
  selectedAnswerChapter = event.target.value;
  renderAnswers();
});
document.querySelectorAll('[data-question]').forEach(button => {
  button.addEventListener('click', () => {
    selectedAnswerChapter = 'all';
    $('#answerChapter').value = 'all';
    $('#answerSearch').value = button.dataset.question;
    renderAnswers();
  });
});
$('#scopeSearch').addEventListener('input', renderScope);
$('#mathChapter').addEventListener('change', event => {
  selectedMathChapter = event.target.value;
  renderMath();
});
$('#mathSearch').addEventListener('input', renderMath);

document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-claim-quest]');
  if (!trigger) return;
  openQuestChest(trigger.dataset.claimQuest, trigger);
});

$('#questRewardClose').addEventListener('click', closeRewardChest);
$('#questRewardBackdrop').addEventListener('click', closeRewardChest);

$('#resetProgress').addEventListener('click', () => {
  if (!window.confirm('Wyzerować tryb Ucz się, fiszki, oznaczenia trudności, punkty, rangi, questy, czas nauki oraz historię quizów, arkuszy olimpijskich i testów?')) return;
  progress = blankProgress();
  learnKnowledge = {};
  try { localStorage.removeItem(learnKnowledgeStorageKey); } catch {}
  window.dispatchEvent(new Event('study-progress-reset'));
  saveProgress();
  showStarredOnly = false;
  $('#starredFilter').classList.remove('active');
  $('#starredFilter').setAttribute('aria-pressed', 'false');
  renderCard();
  showLearnSetup();
  updateStudyTimer();
});

function setAppMenu(open, { returnFocus = true } = {}) {
  if (open && !$('#pointsMenu').hidden) setPointsMenu(false);
  $('#appMenu').hidden = !open;
  $('#appMenuBackdrop').hidden = !open;
  $('#appMenuButton').setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('app-menu-open', open);
  if (open) {
    renderNotifications();
    window.setTimeout(() => $('#appMenuClose').focus(), 0);
  } else {
    $('#notificationCenter').hidden = true;
    $('#notificationButton').setAttribute('aria-expanded', 'false');
    if (returnFocus) $('#appMenuButton').focus();
  }
}

function toggleNotificationCenter() {
  const opening = $('#notificationCenter').hidden;
  $('#notificationCenter').hidden = !opening;
  $('#notificationButton').setAttribute('aria-expanded', String(opening));
  renderNotifications();
  if (opening) window.setTimeout(() => $('#markNotificationsRead').focus(), 0);
}

function setPointsQuestsExpanded(expanded) {
  $('#pointsQuestBody').hidden = !expanded;
  $('#pointsQuestsToggle').setAttribute('aria-expanded', String(expanded));
  $('#pointsQuestsSection').classList.toggle('expanded', expanded);
}

function setPointsMenu(open, { showQuests = false } = {}) {
  if (open) setAppMenu(false, { returnFocus: false });
  $('#pointsMenu').hidden = !open;
  $('#pointsBackdrop').hidden = !open;
  $('#pointsMenuButton').setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('points-menu-open', open);
  if (open) setPointsQuestsExpanded(showQuests);
  if (open) {
    window.setTimeout(() => {
      const focusTarget = showQuests ? $('#pointsQuestsToggle') : $('#pointsMenuClose');
      focusTarget.focus();
      if (showQuests) focusTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }
}

$('#appMenuButton').addEventListener('click', () => setAppMenu($('#appMenu').hidden));
$('#questQuickButton').addEventListener('click', () => setPointsMenu($('#pointsMenu').hidden, { showQuests: true }));
document.querySelectorAll('[data-subject]').forEach(button => {
  button.addEventListener('click', () => switchSubject(button.dataset.subject));
});
$('#appMenuClose').addEventListener('click', () => setAppMenu(false));
$('#appMenuBackdrop').addEventListener('click', () => setAppMenu(false));
$('#notificationButton').addEventListener('click', toggleNotificationCenter);
$('#markNotificationsRead').addEventListener('click', markAllNotificationsRead);
document.querySelectorAll('[data-menu-mode]').forEach(button => {
  if (button.matches('a[href]')) return;
  button.addEventListener('click', event => {
    event.preventDefault();
    if (button.dataset.subjectTarget) switchSubject(button.dataset.subjectTarget);
    switchMode(button.dataset.menuMode);
  });
});
document.querySelectorAll('.subject-menu-group').forEach(group => {
  group.addEventListener('toggle', () => {
    if (!group.open) return;
    const menu = group.closest('.workspace-nav, .app-menu-nav');
    menu?.querySelectorAll('.subject-menu-group').forEach(sibling => {
      if (sibling !== group) sibling.open = false;
    });
  });
});
$('#pointsMenuButton').addEventListener('click', () => setPointsMenu(true));
$('#pointsMenuClose').addEventListener('click', () => setPointsMenu(false));
$('#pointsBackdrop').addEventListener('click', () => setPointsMenu(false));
$('#pointsQuestsToggle').addEventListener('click', () => {
  setPointsQuestsExpanded($('#pointsQuestsToggle').getAttribute('aria-expanded') !== 'true');
});
$('#activateBoost').addEventListener('click', activateDailyBoost);
$('#darkModeToggle').addEventListener('change', event => applyTheme(event.target.checked ? 'dark' : 'light'));
$('#celebrationClose').addEventListener('click', () => {
  $('#rankCelebration').classList.remove('visible');
  window.setTimeout(() => { $('#rankCelebration').hidden = true; }, 250);
});

const privacySettingsLink = $('#privacySettingsLink');
if (privacySettingsLink) {
  privacySettingsLink.addEventListener('click', event => {
    if (!window.googlefc?.callbackQueue || typeof window.googlefc.showRevocationMessage !== 'function') return;
    event.preventDefault();
    window.googlefc.callbackQueue.push(window.googlefc.showRevocationMessage);
  });
}

if (new URLSearchParams(window.location.search).get('privacy') === 'manage') {
  let privacyPanelAttempts = 0;
  const privacyPanelTimer = window.setInterval(() => {
    privacyPanelAttempts += 1;
    if (window.googlefc?.callbackQueue && typeof window.googlefc.showRevocationMessage === 'function') {
      window.googlefc.callbackQueue.push(window.googlefc.showRevocationMessage);
      window.clearInterval(privacyPanelTimer);
    } else if (privacyPanelAttempts >= 20) {
      window.clearInterval(privacyPanelTimer);
    }
  }, 250);
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (document.body.classList.contains('focus-mode')) exitFocusMode();
    else if (!$('#questRewardModal').hidden) closeRewardChest();
    else if (!$('#rankCelebration').hidden) $('#celebrationClose').click();
    else if (!$('#pointsMenu').hidden) setPointsMenu(false);
    else if (!$('#appMenu').hidden) setAppMenu(false);
  }
});

document.querySelectorAll('[data-focus]').forEach(button => {
  button.addEventListener('click', () => {
    if (document.body.classList.contains('focus-mode')) exitFocusMode();
    else enterFocusMode(button.dataset.focus);
  });
});
$('#focusExitButton').addEventListener('click', exitFocusMode);
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && document.body.classList.contains('focus-mode')) exitFocusMode();
});

document.addEventListener('keydown', event => {
  if (!$('#flashcards').classList.contains('active')) return;
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
  if (event.key === 'ArrowLeft') {
    navigateCard(-1);
  }
  if (event.key === 'ArrowRight') {
    navigateCard(1);
  }
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault();
    flipCard();
  }
});

window.addEventListener('popstate', () => {
  const mode = publicModeFromLocation();
  switchMode(mode);
  applyPublicModeMetadata(mode);
});

initializeTheme();
switchSubject(activeSubject);
const initialPublicMode = publicModeFromLocation();
switchMode(initialPublicMode);
updatePublicModeRoute(initialPublicMode);
updateOweQuizPool();
renderNotifications();
updateStudyTimer();

window.setInterval(tickStudyTime, 1000);
window.setInterval(() => {
  if (ensureDailyQuests()) updateProgress();
}, 60 * 1000);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') persistStudyTime();
  else {
    lastStudyTick = Date.now();
    if (ensureDailyQuests()) updateProgress();
  }
});
window.addEventListener('pagehide', persistStudyTime);
