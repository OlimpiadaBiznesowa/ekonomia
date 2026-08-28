const $ = selector => document.querySelector(selector);

const storageKey = 'mankiw-taylor-study-progress-v13';
const legacyStorageKeys = ['mankiw-taylor-study-progress-v12', 'mankiw-taylor-study-progress-v11', 'mankiw-taylor-study-progress-v9', 'mankiw-taylor-study-progress-v7', 'mankiw-taylor-study-progress-v5'];
const studyRewardSeconds = 15 * 60;
const studyRewardPoints = 20;
const boostDurationMs = 30 * 60 * 1000;
const notificationStorageKey = 'mankiw-taylor-notifications-v1';
const notificationReadStorageKey = 'mankiw-taylor-notifications-read-v1';
const flashcardDirectionStorageKey = 'mankiw-taylor-flashcard-direction-v1';
const subjectStorageKey = 'ekonomia-active-subject-v1';
const themeStorageKey = 'ekonomia-theme-v1';
const learnKnowledgeStorageKey = 'ekonomia-learn-knowledge-v1';

const siteUpdateNotifications = [
  {
    id: 'update-reversed-flashcards-2026-08-17',
    type: 'update',
    title: 'Odwrócona kolejność fiszek',
    message: 'Na fiszce możesz teraz ustawić, czy najpierw widzisz zagadnienie, czy jego wyjaśnienie.',
    createdAt: '2026-08-17T22:00:00+02:00'
  },
  {
    id: 'update-summaries-ranking-2026-08-17',
    type: 'update',
    title: 'Streszczenia i szybszy dostęp do rankingu',
    message: 'Każdy rozdział ma teraz krótkie streszczenie, a ranking znajdziesz bezpośrednio w menu.',
    createdAt: '2026-08-17T21:30:00+02:00'
  },
  {
    id: 'update-clean-menu-2026-08-17',
    type: 'update',
    title: 'Nowe, czystsze menu',
    message: 'Nawigacja, konto, punkty i powiadomienia są teraz dostępne w jednym miejscu.',
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
  { name: 'Początkujący', threshold: 0, emblem: 'I' },
  { name: 'Adept', threshold: 100, emblem: 'II' },
  { name: 'Analityk', threshold: 300, emblem: 'III' },
  { name: 'Ekonomista', threshold: 700, emblem: 'IV' },
  { name: 'Strateg', threshold: 1200, emblem: 'V' },
  { name: 'Mistrz ekonomii', threshold: 2000, emblem: 'VI' },
  { name: 'Olimpijczyk', threshold: 3500, emblem: 'VII' }
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
  completedTests: 0,
  completedLearnSessions: 0,
  studySeconds: 0,
  awardedStudyBlocks: 0,
  boostActivatedOn: '',
  boostEndsAt: ''
});

const normalizeProgress = value => {
  const parsed = value && typeof value === 'object' ? value : {};
  return {
    mastered: Array.isArray(parsed.mastered) ? parsed.mastered.filter(item => typeof item === 'string') : [],
    starred: Array.isArray(parsed.starred) ? parsed.starred.filter(item => typeof item === 'string') : [],
    points: Number.isFinite(parsed.points) ? Math.max(0, Math.floor(parsed.points)) : 0,
    awardedFlashcards: Array.isArray(parsed.awardedFlashcards) ? parsed.awardedFlashcards.filter(item => typeof item === 'string') : [],
    completedQuizzes: Number.isFinite(parsed.completedQuizzes) ? Math.max(0, Math.floor(parsed.completedQuizzes)) : 0,
    completedTests: Number.isFinite(parsed.completedTests) ? Math.max(0, Math.floor(parsed.completedTests)) : 0,
    completedLearnSessions: Number.isFinite(parsed.completedLearnSessions) ? Math.max(0, Math.floor(parsed.completedLearnSessions)) : 0,
    studySeconds: Number.isFinite(parsed.studySeconds) ? Math.max(0, parsed.studySeconds) : 0,
    awardedStudyBlocks: Number.isFinite(parsed.awardedStudyBlocks) ? Math.max(0, Math.floor(parsed.awardedStudyBlocks)) : 0,
    boostActivatedOn: typeof parsed.boostActivatedOn === 'string' ? parsed.boostActivatedOn : '',
    boostEndsAt: typeof parsed.boostEndsAt === 'string' ? parsed.boostEndsAt : ''
  };
};

const mergeProgress = (localValue, cloudValue) => {
  const local = normalizeProgress(localValue);
  const cloud = normalizeProgress(cloudValue);
  return {
    mastered: [...new Set([...local.mastered, ...cloud.mastered])],
    starred: [...new Set([...local.starred, ...cloud.starred])],
    points: Math.max(local.points, cloud.points),
    awardedFlashcards: [...new Set([...local.awardedFlashcards, ...cloud.awardedFlashcards])],
    completedQuizzes: Math.max(local.completedQuizzes, cloud.completedQuizzes),
    completedTests: Math.max(local.completedTests, cloud.completedTests),
    completedLearnSessions: Math.max(local.completedLearnSessions, cloud.completedLearnSessions),
    studySeconds: Math.max(local.studySeconds, cloud.studySeconds),
    awardedStudyBlocks: Math.max(local.awardedStudyBlocks, cloud.awardedStudyBlocks),
    boostActivatedOn: local.boostActivatedOn > cloud.boostActivatedOn ? local.boostActivatedOn : cloud.boostActivatedOn,
    boostEndsAt: new Date(local.boostEndsAt || 0) > new Date(cloud.boostEndsAt || 0) ? local.boostEndsAt : cloud.boostEndsAt
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
let cloudClient = null;
let currentUser = null;
let currentProfile = null;
let authInitialized = false;
let cloudSyncTimer = null;
let cloudSyncRunning = false;
let cloudSyncQueued = false;
const supabaseSettings = window.SUPABASE_CONFIG || {};
const supabaseConfigured = Boolean(
  window.supabase?.createClient
  && /^https:\/\/.+\.supabase\.co$/i.test(String(supabaseSettings.url || ''))
  && String(supabaseSettings.publishableKey || '').length > 20
);
let selectedFlashcardChapter = 'all';
let selectedLearnChapter = 'all';
let selectedLearnGoal = '10';
let learnSessionState = null;
let showStarredOnly = false;
let cardTransitioning = false;
let selectedQuizChapter = 'all';
let selectedQuizLength = 20;
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
  activeSubject = localStorage.getItem(subjectStorageKey) === 'macro' ? 'macro' : 'micro';
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
  scheduleCloudSync();
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

function awardPoints(amount, label, sourceElement) {
  if (amount <= 0) return 0;
  const awardedAmount = isBoostActive() ? amount * 2 : amount;
  const previousRankIndex = rankIndexForPoints(progress.points);
  progress.points += awardedAmount;
  const currentRankIndex = rankIndexForPoints(progress.points);
  saveProgress();
  showPointsAnimation(awardedAmount, isBoostActive() ? `${label} · boost ×2` : label, sourceElement);
  if (currentRankIndex > previousRankIndex) {
    window.setTimeout(() => showRankCelebration(ranks[currentRankIndex]), 650);
  }
  return awardedAmount;
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
  $('#homeConceptCount').textContent = data.concepts.length;
  $('#heroTopicCount').textContent = data.outline.reduce((sum, chapter) => sum + chapter.topics.length, 0);
  $('#heroFormulaCount').textContent = data.formulas.length;
  $('#masteryBar').style.width = `${masteryPercent}%`;
  $('#masteryPercent').textContent = `${masteryPercent}%`;
  $('#topPoints').textContent = progress.points;
  $('#progressPoints').textContent = `${progress.points} pkt`;
  $('#progressRank').textContent = rank.name;
  $('#menuQuickRank').textContent = rank.name;
  $('#rankName').textContent = rank.name;
  $('#rankEmblem').textContent = rank.emblem;
  $('#menuPoints').textContent = progress.points;
  $('#rankBar').style.width = `${rankPercent}%`;
  $('#menuRankBar').style.width = `${rankPercent}%`;
  $('#nextRankLabel').textContent = nextRank ? `DO RANGI: ${nextRank.name.toLocaleUpperCase('pl-PL')}` : 'NAJWYŻSZA RANGA';
  $('#rankProgressText').textContent = nextRank ? `${progress.points} / ${nextRank.threshold}` : `${progress.points} pkt`;
  $('#menuNextRank').textContent = nextRank ? `Następna ranga: ${nextRank.name}` : 'Zdobyto najwyższą rangę';
  $('#menuRankProgress').textContent = nextRank ? `${progress.points} / ${nextRank.threshold}` : `${progress.points} pkt`;
  updateBoostUi();

  $('#rankLadder').innerHTML = ranks.map((item, index) => `
    <div class="rank-step ${index <= rankIndex ? 'reached' : ''} ${index === rankIndex ? 'current' : ''}">
      <span>${escapeHtml(item.emblem)}</span>
      <div><strong>${escapeHtml(item.name)}</strong><small>od ${item.threshold} pkt</small></div>
      <b>${index < rankIndex ? '✓' : index === rankIndex ? 'TERAZ' : ''}</b>
    </div>
  `).join('');
}

function cloudRowToProgress(row) {
  if (!row) return blankProgress();
  return normalizeProgress({
    mastered: row.mastered,
    starred: row.starred,
    points: row.points,
    awardedFlashcards: row.awarded_flashcards,
    completedQuizzes: row.completed_quizzes,
    completedTests: row.completed_tests,
    studySeconds: row.study_seconds,
    awardedStudyBlocks: row.awarded_study_blocks,
    boostActivatedOn: row.boost_activated_on,
    boostEndsAt: row.boost_ends_at
  });
}

function progressToCloudRow() {
  return {
    user_id: currentUser.id,
    mastered: progress.mastered,
    starred: progress.starred,
    points: progress.points,
    awarded_flashcards: progress.awardedFlashcards,
    completed_quizzes: progress.completedQuizzes,
    completed_tests: progress.completedTests,
    study_seconds: progress.studySeconds,
    awarded_study_blocks: progress.awardedStudyBlocks,
    boost_activated_on: progress.boostActivatedOn || null,
    boost_ends_at: progress.boostEndsAt || null,
    updated_at: new Date().toISOString()
  };
}

function displayNameForUser(user = currentUser) {
  const metadataName = String(currentProfile?.display_name || user?.user_metadata?.display_name || '').trim();
  if (metadataName.length >= 2) return metadataName.slice(0, 30);
  const emailName = String(user?.email || 'Uczeń').split('@')[0].trim();
  return (emailName.length >= 2 ? emailName : 'Uczeń').slice(0, 30);
}

function initialsForName(name) {
  const initials = String(name || 'U').trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('');
  return initials.toLocaleUpperCase('pl-PL') || 'U';
}

function setCloudStatus(message, state = '') {
  const status = $('#cloudStatus');
  const profileStatus = $('#profileSyncStatus');
  if (status) {
    status.textContent = message;
    status.dataset.state = state;
  }
  if (profileStatus) {
    profileStatus.textContent = message;
    profileStatus.dataset.state = state;
  }
}

function setAuthFeedback(message = '', state = '') {
  const feedback = $('#authFeedback');
  feedback.textContent = message;
  feedback.dataset.state = state;
}

function setProfileNameFeedback(message = '', state = '') {
  const feedback = $('#profileNameFeedback');
  if (!feedback) return;
  feedback.textContent = message;
  feedback.dataset.state = state;
}

function readableAuthError(error) {
  const message = String(error?.message || error || 'Nie udało się wykonać operacji.');
  if (/invalid login credentials/i.test(message)) return 'Nieprawidłowy e-mail lub hasło.';
  if (/email not confirmed/i.test(message)) return 'Najpierw potwierdź adres e-mail przez wiadomość od Supabase.';
  if (/already registered|already been registered/i.test(message)) return 'Konto z tym adresem e-mail już istnieje.';
  if (/password/i.test(message) && /least|short|characters/i.test(message)) return 'Hasło jest zbyt krótkie. Użyj co najmniej 8 znaków.';
  if (/failed to fetch|network/i.test(message)) return 'Brak połączenia z usługą logowania. Sprawdź internet i konfigurację Supabase.';
  return message;
}

function updateAccountUi() {
  const signedIn = Boolean(currentUser);
  const name = signedIn ? displayNameForUser() : 'Zaloguj się';
  const homeAccountCta = $('#homeAccountCta');
  if (homeAccountCta) {
    homeAccountCta.innerHTML = signedIn ? 'Zobacz ranking <span>→</span>' : 'Zaloguj się <span>→</span>';
    homeAccountCta.setAttribute('aria-label', signedIn ? 'Zobacz ranking uczniów' : 'Zaloguj się do konta ucznia');
  }
  $('#accountLabel').textContent = name;
  $('#accountAvatar').textContent = signedIn ? initialsForName(name) : '?';
  $('#accountButton').classList.toggle('signed-in', signedIn);
  $('#accountMenuStatus').textContent = signedIn ? 'Konto i synchronizacja postępu' : 'Zaloguj się lub utwórz konto';
  $('#authUnavailable').hidden = supabaseConfigured;
  $('#authSignedOut').hidden = signedIn || !supabaseConfigured;
  $('#authSignedIn').hidden = !signedIn;
  $('#authTitle').textContent = signedIn ? 'Twoje konto' : 'Zaloguj się';
  $('#deleteAccountConfirmation').value = '';
  $('#deleteAccountButton').disabled = true;
  if (signedIn) {
    $('#profileName').textContent = name;
    $('#profileEmail').textContent = currentUser.email || '';
    $('#profileAvatar').textContent = initialsForName(name);
    if (document.activeElement !== $('#profileNameInput')) $('#profileNameInput').value = name;
    setCloudStatus('Postęp zsynchronizowany', 'success');
  } else if (supabaseConfigured) {
    setCloudStatus('Zaloguj się, aby synchronizować postęp', 'local');
  } else {
    setCloudStatus('Postęp lokalny · skonfiguruj Supabase', 'local');
  }
}

function updateAuthGate({ closeAfterUnlock = false } = {}) {
  const locked = !currentUser;
  document.body.classList.remove('auth-locked');
  document.querySelectorAll('.topbar, main, footer').forEach(element => {
    element.inert = false;
    element.removeAttribute('inert');
    element.removeAttribute('aria-hidden');
  });
  $('#authClose').hidden = false;
  $('#authBackdrop').setAttribute('aria-label', 'Zamknij okno konta');
  if (locked) {
    if (document.body.classList.contains('focus-mode')) exitFocusMode();
    setAppMenu(false, { returnFocus: false });
    setPointsMenu(false);
    setAuthModal(true);
  } else if (closeAfterUnlock && $('#emailConfirmationPopup').hidden) {
    setAuthModal(false);
  }
}

function scheduleCloudSync() {
  if (!cloudClient || !currentUser) return;
  window.clearTimeout(cloudSyncTimer);
  cloudSyncTimer = window.setTimeout(() => syncProgressToCloud(), 900);
}

async function syncProgressToCloud() {
  if (!cloudClient || !currentUser) return;
  if (cloudSyncRunning) {
    cloudSyncQueued = true;
    return;
  }
  cloudSyncRunning = true;
  setCloudStatus('Synchronizowanie…', 'working');
  try {
    const displayName = displayNameForUser();
    const [progressResult, profileResult] = await Promise.all([
      cloudClient.from('study_progress').upsert(progressToCloudRow(), { onConflict: 'user_id' }),
      cloudClient.from('profiles').upsert({
        id: currentUser.id,
        display_name: displayName,
        points: progress.points,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
    ]);
    if (progressResult.error) throw progressResult.error;
    if (profileResult.error) throw profileResult.error;
    currentProfile = { ...(currentProfile || {}), display_name: displayName, points: progress.points };
    setCloudStatus('Postęp zsynchronizowany', 'success');
  } catch (error) {
    console.error('Nie udało się zsynchronizować postępu:', error);
    setCloudStatus('Błąd synchronizacji · postęp zapisano lokalnie', 'error');
  } finally {
    cloudSyncRunning = false;
    if (cloudSyncQueued) {
      cloudSyncQueued = false;
      scheduleCloudSync();
    }
  }
}

async function loadCloudProgress() {
  if (!cloudClient || !currentUser) return;
  setCloudStatus('Pobieranie postępu…', 'working');
  try {
    const [profileResult, progressResult] = await Promise.all([
      cloudClient.from('profiles').select('id, display_name, points, updated_at').eq('id', currentUser.id).maybeSingle(),
      cloudClient.from('study_progress').select('*').eq('user_id', currentUser.id).maybeSingle()
    ]);
    if (profileResult.error) throw profileResult.error;
    if (progressResult.error) throw progressResult.error;
    currentProfile = profileResult.data || {
      id: currentUser.id,
      display_name: displayNameForUser(currentUser),
      points: 0
    };
    progress = mergeProgress(progress, cloudRowToProgress(progressResult.data));
    if (Number.isFinite(currentProfile.points)) progress.points = Math.max(progress.points, currentProfile.points);
    persistLocalProgress();
    updateProgress();
    updateStudyTimer();
    renderCard();
    updateAccountUi();
    await syncProgressToCloud();
  } catch (error) {
    console.error('Nie udało się pobrać postępu:', error);
    setCloudStatus('Błąd chmury · postęp działa lokalnie', 'error');
  }
}

function renderLeaderboardRows(items = []) {
  const list = $('#leaderboardList');
  if (!items.length) {
    list.innerHTML = '<p class="leaderboard-empty">Ranking jest jeszcze pusty.</p>';
    return;
  }
  list.innerHTML = items.map((item, index) => {
    const points = Math.max(0, Number(item.points) || 0);
    const rank = ranks[rankIndexForPoints(points)];
    const name = String(item.display_name || 'Uczeń').slice(0, 30);
    return `
      <article class="leaderboard-row ${item.id === currentUser?.id ? 'current-user' : ''} ${index < 3 ? `podium podium-${index + 1}` : ''}">
        <span class="leaderboard-position" ${index === 0 ? 'title="Lider rankingu"' : ''}>${index === 0 ? '<i aria-hidden="true">♛</i><b>1</b>' : index + 1}</span>
        <span class="leaderboard-avatar" aria-hidden="true">${escapeHtml(initialsForName(name))}</span>
        <div><strong>${escapeHtml(name)}</strong><small>${escapeHtml(rank.name)}</small></div>
        <b>${points} pkt</b>
      </article>
    `;
  }).join('');
}

function evaluateLeaderboardMovement(items = []) {
  if (!currentUser) return;
  const currentIndex = items.findIndex(item => item.id === currentUser.id);
  if (currentIndex < 0) return;
  const currentPosition = currentIndex + 1;
  const snapshotKey = `mankiw-taylor-rank-snapshot-v1:${currentUser.id}`;
  const previousPosition = Number(localStorage.getItem(snapshotKey));
  if (Number.isFinite(previousPosition) && previousPosition > 0 && currentPosition > previousPosition) {
    const personAbove = items[currentIndex - 1];
    const name = String(personAbove?.display_name || '').trim();
    addNotification({
      type: 'ranking',
      title: 'Zmiana w rankingu',
      message: name
        ? `${name} wyprzedza Cię w rankingu. Zajmujesz teraz ${currentPosition}. miejsce.`
        : `Ktoś wyprzedził Cię w rankingu. Zajmujesz teraz ${currentPosition}. miejsce.`
    });
  }
  localStorage.setItem(snapshotKey, String(currentPosition));
}

async function loadLeaderboard({ silent = false } = {}) {
  const notice = $('#leaderboardNotice');
  if (!supabaseConfigured) {
    notice.textContent = 'Najpierw skonfiguruj Supabase według pliku SUPABASE_SETUP.md.';
    notice.dataset.state = 'local';
    renderLeaderboardRows([]);
    return;
  }
  if (!currentUser) {
    notice.textContent = 'Zaloguj się, aby zobaczyć ranking klasy.';
    notice.dataset.state = 'local';
    renderLeaderboardRows([]);
    return;
  }
  if (!silent) {
    notice.textContent = 'Pobieranie rankingu…';
    notice.dataset.state = 'working';
  }
  try {
    const { data, error } = await cloudClient
      .from('profiles')
      .select('id, display_name, points, updated_at')
      .order('points', { ascending: false })
      .order('updated_at', { ascending: true })
      .limit(100);
    if (error) throw error;
    notice.textContent = `${polishCount(data.length, 'uczestnik', 'uczestników', 'uczestników')} · aktualizacja na żywo po odświeżeniu`;
    notice.dataset.state = 'success';
    evaluateLeaderboardMovement(data);
    renderLeaderboardRows(data);
  } catch (error) {
    console.error('Nie udało się pobrać rankingu:', error);
    notice.textContent = 'Nie udało się pobrać rankingu. Sprawdź konfigurację bazy.';
    notice.dataset.state = 'error';
    renderLeaderboardRows([]);
  }
}

async function applyAuthSession(session, { initial = false } = {}) {
  const previousUserId = currentUser?.id || null;
  currentUser = session?.user || null;
  const shouldLoadProgress = Boolean(currentUser && (!authInitialized || previousUserId !== currentUser.id));
  authInitialized = true;
  if (currentUser) {
    updateAccountUi();
    if (shouldLoadProgress) await loadCloudProgress();
    if (shouldLoadProgress) await loadLeaderboard({ silent: true });
  } else {
    currentProfile = null;
    if (previousUserId && !initial) {
      progress = blankProgress();
      persistLocalProgress();
      updateProgress();
      updateStudyTimer();
      renderCard();
    }
    updateAccountUi();
  }
  updateAuthGate({ closeAfterUnlock: Boolean(currentUser && !previousUserId) });
}

async function initializeCloud() {
  updateAccountUi();
  updateAuthGate();
  if (!supabaseConfigured) {
    loadLeaderboard();
    return;
  }
  try {
    cloudClient = window.supabase.createClient(supabaseSettings.url, supabaseSettings.publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    const { data, error } = await cloudClient.auth.getSession();
    if (error) throw error;
    await applyAuthSession(data.session, { initial: true });
    cloudClient.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => applyAuthSession(session), 0);
    });
  } catch (error) {
    console.error('Nie udało się uruchomić logowania:', error);
    cloudClient = null;
    setCloudStatus('Logowanie jest chwilowo niedostępne', 'error');
    $('#authUnavailable').hidden = false;
    $('#authSignedOut').hidden = true;
  }
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
  if (!currentUser || document.visibilityState !== 'visible') return;

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
    scheduleCloudSync();
    unsavedStudySeconds = 0;
  }
  updateStudyTimer();
  updateBoostUi();
}

function persistStudyTime() {
  persistLocalProgress();
  scheduleCloudSync();
  lastStudyTick = Date.now();
  unsavedStudySeconds = 0;
}

const subjectUiCopy = {
  micro: {
    title: 'Mikroekonomia · Mankiw i Taylor',
    eyebrow: 'MANKIW · TAYLOR · MIKROEKONOMIA',
    hero: 'Fiszki, quizy, testy, streszczenia i wzory z mikroekonomii. Otwórz menu, wybierz rozdział i zacznij.',
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
    hero: 'Fiszki, quizy, testy, streszczenia i wzory z makroekonomii — od PKB i inflacji po politykę fiskalną oraz pieniężną.',
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
  document.title = copy.title;
  document.body.dataset.subject = activeSubject;
  document.body.classList.toggle('macro-active', activeSubject === 'macro');
  document.querySelectorAll('[data-subject]').forEach(button => {
    const selected = button.dataset.subject === activeSubject;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  $('#brandMark').textContent = data.mark;
  $('#brandName').innerHTML = `${activeSubject === 'micro' ? 'mikroekonomia' : 'makroekonomia'}<span class="muted-dot">.</span>`;
  $('.brand').setAttribute('aria-label', `${data.label} – strona główna`);
  $('#heroEyebrow').textContent = copy.eyebrow;
  $('#heroCopy').textContent = copy.hero;
  $('#homeOverviewTitle').textContent = copy.overviewTitle;
  $('#homeOverviewCopy').textContent = copy.overview;
  $('#homeChapterCount').textContent = `${data.chapters.length} rozdziałów`;
  $('#homeChapterDescription').textContent = activeSubject === 'micro'
    ? 'Zakres i streszczenia zachowują kolejność przesłanego wydania.'
    : 'Zakres i streszczenia zachowują kolejność przesłanego wydania.';
  $('#flashcardsEyebrow').textContent = `ZAGADNIENIA · ${data.chapters.length} ROZDZIAŁÓW · ${data.label.toLocaleUpperCase('pl-PL')}`;
  $('#learnEyebrow').textContent = `UCZ SIĘ · ${data.label.toLocaleUpperCase('pl-PL')}`;
  $('#quizEyebrow').textContent = `QUIZ · ${data.label.toLocaleUpperCase('pl-PL')}`;
  $('#testEyebrow').textContent = `TEST PISEMNY · ${data.label.toLocaleUpperCase('pl-PL')}`;
  $('#scopeEyebrow').textContent = 'SPIS TREŚCI I OPRACOWANIA';
  $('#scopeMeta').innerHTML = `<span id="scopeTopicCount">0</span> tematów · ${data.chapters.length} rozdziałów · ${parts} części`;
  $('#conceptsIntro').textContent = activeSubject === 'micro'
    ? 'Hasła są uporządkowane według rozdziałów i służą jako materiał do powtórki. Skorzystaj z wyszukiwarki, aby szybko znaleźć pojęcie.'
    : 'Hasła ze słownika książki są uporządkowane według rozdziałów, w których pojawiają się w materiale. Skorzystaj z wyszukiwarki, aby szybko znaleźć pojęcie.';
  $('#appMenuSubject').textContent = data.label.toLocaleUpperCase('pl-PL');
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
  const publicModes = ['home', 'legal'];
  if (!currentUser && !publicModes.includes(mode)) {
    setAuthModal(true);
    return;
  }
  if (document.body.classList.contains('focus-mode')) exitFocusMode();
  const secondaryModes = ['test', 'answers', 'scope', 'math'];
  const menuMode = secondaryModes.includes(mode) ? 'more' : mode;
  document.querySelectorAll('[data-menu-mode]').forEach(button => {
    button.classList.toggle('active', button.dataset.menuMode === menuMode);
  });
  document.querySelectorAll('.study-panel').forEach(panel => {
    panel.classList.toggle('active', panel.dataset.panel === mode);
  });
  document.body.classList.toggle('home-active', mode === 'home');
  setAppMenu(false, { returnFocus: false });
  if (mode === 'leaderboard') loadLeaderboard();
  if (mode === 'learn' && !learnSessionState) updateLearnPoolUi();
  document.getElementById(mode)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function enterFocusMode(panelId) {
  const panel = document.getElementById(panelId);
  if (!panel) return;
  document.querySelectorAll('.study-panel').forEach(item => item.classList.toggle('focus-active', item === panel));
  document.body.classList.add('focus-mode');
  document.querySelectorAll('[data-focus]').forEach(button => {
    const active = button.dataset.focus === panelId;
    button.textContent = active ? '×' : '⛶';
    if (active) button.setAttribute('aria-label', `Wyłącz tryb skupienia ${focusModeLabel(panelId)}`);
  });
  document.documentElement.requestFullscreen?.().catch(() => {});
}

function exitFocusMode() {
  document.body.classList.remove('focus-mode');
  document.querySelectorAll('.study-panel').forEach(item => item.classList.remove('focus-active'));
  document.querySelectorAll('[data-focus]').forEach(button => {
    button.textContent = '⛶';
    button.setAttribute('aria-label', `Włącz tryb skupienia ${focusModeLabel(button.dataset.focus)}`);
  });
  if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
}

function focusModeLabel(panelId) {
  if (panelId === 'quiz') return 'quizu';
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
  button.addEventListener('click', () => switchMode(button.dataset.go));
});

document.querySelectorAll('.mode-tab').forEach(tab => {
  tab.addEventListener('click', () => switchMode(tab.dataset.mode));
});

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

$('#resetProgress').addEventListener('click', () => {
  if (!window.confirm('Wyzerować tryb Ucz się, fiszki, oznaczenia trudności, punkty, rangi, czas nauki oraz historię quizów i testów?')) return;
  progress = blankProgress();
  learnKnowledge = {};
  try { localStorage.removeItem(learnKnowledgeStorageKey); } catch {}
  saveProgress();
  showStarredOnly = false;
  $('#starredFilter').classList.remove('active');
  $('#starredFilter').setAttribute('aria-pressed', 'false');
  renderCard();
  showLearnSetup();
  updateStudyTimer();
  setAuthModal(false);
});

function setAppMenu(open, { returnFocus = true } = {}) {
  $('#appMenu').hidden = !open;
  $('#appMenuBackdrop').hidden = !open;
  $('#appMenuButton').setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('app-menu-open', open);
  if (open) {
    renderNotifications();
    if (currentUser) loadLeaderboard({ silent: true });
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

function setPointsMenu(open) {
  if (open) setAppMenu(false, { returnFocus: false });
  $('#pointsMenu').hidden = !open;
  $('#pointsBackdrop').hidden = !open;
  $('#pointsMenuButton').setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('points-menu-open', open);
  if (open) $('#pointsMenuClose').focus();
}

function setAuthMode(mode) {
  const registering = mode === 'register';
  $('#loginTab').classList.toggle('active', !registering);
  $('#registerTab').classList.toggle('active', registering);
  $('#loginTab').setAttribute('aria-selected', String(!registering));
  $('#registerTab').setAttribute('aria-selected', String(registering));
  $('#loginForm').hidden = registering;
  $('#registerForm').hidden = !registering;
  $('#authTitle').textContent = registering ? 'Utwórz konto' : 'Zaloguj się';
  setAuthFeedback();
}

function setAuthModal(open) {
  if (open) setAppMenu(false, { returnFocus: false });
  $('#authModal').hidden = !open;
  $('#authBackdrop').hidden = !open;
  $('#accountButton').setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('auth-modal-open', open);
  if (open) {
    updateAccountUi();
    window.setTimeout(() => {
      if (currentUser) $('#authClose').focus();
      else if (supabaseConfigured) $('#loginEmail').focus();
      else $('#authClose').focus();
    }, 0);
  } else {
    const target = $('#appMenu').hidden ? $('#appMenuButton') : $('#accountButton');
    target?.focus();
  }
}

async function handleProfileNameUpdate(event) {
  event.preventDefault();
  if (!cloudClient || !currentUser) return;
  const input = $('#profileNameInput');
  const button = $('#profileNameSave');
  const displayName = input.value.trim().replace(/\s+/g, ' ');
  if (displayName.length < 2 || displayName.length > 30) {
    setProfileNameFeedback('Nazwa musi mieć od 2 do 30 znaków.', 'error');
    return;
  }
  if (displayName === displayNameForUser()) {
    setProfileNameFeedback('To jest już Twoja aktualna nazwa.', 'success');
    return;
  }

  button.disabled = true;
  input.disabled = true;
  setProfileNameFeedback('Zapisywanie…', 'working');
  try {
    const { error: profileError } = await cloudClient
      .from('profiles')
      .update({ display_name: displayName, updated_at: new Date().toISOString() })
      .eq('id', currentUser.id);
    if (profileError) throw profileError;

    const { data, error: metadataError } = await cloudClient.auth.updateUser({
      data: { display_name: displayName }
    });
    if (metadataError) console.warn('Nazwa profilu została zapisana bez aktualizacji metadanych konta:', metadataError);
    if (data?.user) currentUser = data.user;
    currentProfile = { ...(currentProfile || {}), id: currentUser.id, display_name: displayName };
    input.value = displayName;
    updateAccountUi();
    setProfileNameFeedback('Nazwa użytkownika została zmieniona.', 'success');
    await loadLeaderboard({ silent: true });
  } catch (error) {
    console.error('Nie udało się zmienić nazwy użytkownika:', error);
    setProfileNameFeedback(readableAuthError(error), 'error');
  } finally {
    button.disabled = false;
    input.disabled = false;
  }
}

function showEmailConfirmation(email) {
  $('#confirmationEmail').textContent = email || 'podany adres';
  $('#authModal').hidden = true;
  $('#authBackdrop').hidden = true;
  document.body.classList.remove('auth-modal-open');
  $('#emailConfirmationPopup').hidden = false;
  $('#emailConfirmationBackdrop').hidden = false;
  window.setTimeout(() => $('#emailConfirmationClose').focus(), 0);
}

function closeEmailConfirmation() {
  $('#emailConfirmationPopup').hidden = true;
  $('#emailConfirmationBackdrop').hidden = true;
  setAuthMode('login');
  setAuthModal(true);
}

async function handleLogin(event) {
  event.preventDefault();
  if (!cloudClient) return;
  const button = event.currentTarget.querySelector('button[type="submit"]');
  button.disabled = true;
  setAuthFeedback('Logowanie…', 'working');
  try {
    const { data, error } = await cloudClient.auth.signInWithPassword({
      email: $('#loginEmail').value.trim(),
      password: $('#loginPassword').value
    });
    if (error) throw error;
    await applyAuthSession(data.session);
    $('#loginPassword').value = '';
    setAuthFeedback();
  } catch (error) {
    if (/email not confirmed/i.test(String(error?.message || ''))) showEmailConfirmation($('#loginEmail').value.trim());
    else setAuthFeedback(readableAuthError(error), 'error');
  } finally {
    button.disabled = false;
  }
}

async function handleRegister(event) {
  event.preventDefault();
  if (!cloudClient) return;
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  const displayName = $('#registerName').value.trim().replace(/\s+/g, ' ');
  if (displayName.length < 2 || displayName.length > 30) {
    setAuthFeedback('Nazwa w rankingu musi mieć od 2 do 30 znaków.', 'error');
    return;
  }
  button.disabled = true;
  setAuthFeedback('Tworzenie konta…', 'working');
  try {
    const { data, error } = await cloudClient.auth.signUp({
      email: $('#registerEmail').value.trim(),
      password: $('#registerPassword').value,
      options: { data: { display_name: displayName } }
    });
    if (error) throw error;
    $('#registerPassword').value = '';
    if (data.session) {
      await applyAuthSession(data.session);
      setAuthFeedback();
    } else {
      showEmailConfirmation($('#registerEmail').value.trim());
    }
  } catch (error) {
    setAuthFeedback(readableAuthError(error), 'error');
  } finally {
    button.disabled = false;
  }
}

async function handleDeleteAccount() {
  if (!cloudClient || !currentUser || $('#deleteAccountConfirmation').value.trim() !== 'USUŃ') return;
  if (!window.confirm('Czy na pewno chcesz bezpowrotnie usunąć konto i cały postęp?')) return;
  const button = $('#deleteAccountButton');
  button.disabled = true;
  setCloudStatus('Usuwanie konta…', 'working');
  try {
    const { error } = await cloudClient.rpc('delete_own_account');
    if (error) throw error;
    progress = blankProgress();
    localStorage.removeItem(storageKey);
    legacyStorageKeys.forEach(key => localStorage.removeItem(key));
    currentUser = null;
    currentProfile = null;
    persistLocalProgress();
    updateProgress();
    updateStudyTimer();
    renderCard();
    updateAccountUi();
    setAuthModal(false);
    window.alert('Konto i zapisany postęp zostały usunięte.');
  } catch (error) {
    console.error('Nie udało się usunąć konta:', error);
    setCloudStatus('Nie udało się usunąć konta. Uruchom najnowszy plik supabase-setup.sql.', 'error');
    button.disabled = false;
  }
}

$('#appMenuButton').addEventListener('click', () => setAppMenu($('#appMenu').hidden));
document.querySelectorAll('[data-subject]').forEach(button => {
  button.addEventListener('click', () => switchSubject(button.dataset.subject));
});
$('#appMenuClose').addEventListener('click', () => setAppMenu(false));
$('#appMenuBackdrop').addEventListener('click', () => setAppMenu(false));
$('#notificationButton').addEventListener('click', toggleNotificationCenter);
$('#markNotificationsRead').addEventListener('click', markAllNotificationsRead);
document.querySelectorAll('[data-menu-mode]').forEach(button => {
  button.addEventListener('click', () => switchMode(button.dataset.menuMode));
});
$('.brand').addEventListener('click', event => {
  event.preventDefault();
  switchMode('home');
});
$('#pointsMenuButton').addEventListener('click', () => setPointsMenu(true));
$('#pointsMenuClose').addEventListener('click', () => setPointsMenu(false));
$('#pointsBackdrop').addEventListener('click', () => setPointsMenu(false));
$('#activateBoost').addEventListener('click', activateDailyBoost);
$('#accountButton').addEventListener('click', () => setAuthModal($('#authModal').hidden));
$('#homeAccountCta').addEventListener('click', () => {
  if (currentUser) switchMode('leaderboard');
  else setAuthModal(true);
});
$('#authClose').addEventListener('click', () => setAuthModal(false));
$('#authBackdrop').addEventListener('click', () => setAuthModal(false));
$('#darkModeToggle').addEventListener('change', event => applyTheme(event.target.checked ? 'dark' : 'light'));
$('#emailConfirmationClose').addEventListener('click', closeEmailConfirmation);
$('#emailConfirmationBackdrop').addEventListener('click', closeEmailConfirmation);
$('#loginTab').addEventListener('click', () => setAuthMode('login'));
$('#registerTab').addEventListener('click', () => setAuthMode('register'));
$('#loginForm').addEventListener('submit', handleLogin);
$('#registerForm').addEventListener('submit', handleRegister);
$('#profileNameForm').addEventListener('submit', handleProfileNameUpdate);
$('#deleteAccountConfirmation').addEventListener('input', event => {
  $('#deleteAccountButton').disabled = event.target.value.trim() !== 'USUŃ';
});
$('#deleteAccountButton').addEventListener('click', handleDeleteAccount);
$('#refreshLeaderboard').addEventListener('click', loadLeaderboard);
$('#profileLeaderboard').addEventListener('click', () => {
  setAuthModal(false);
  switchMode('leaderboard');
});
$('#logoutButton').addEventListener('click', async () => {
  if (!cloudClient) return;
  $('#logoutButton').disabled = true;
  setCloudStatus('Wylogowywanie…', 'working');
  try {
    const { error } = await cloudClient.auth.signOut();
    if (error) throw error;
    await applyAuthSession(null);
    setAuthMode('login');
  } catch (error) {
    setCloudStatus(readableAuthError(error), 'error');
  } finally {
    $('#logoutButton').disabled = false;
  }
});
$('#celebrationClose').addEventListener('click', () => {
  $('#rankCelebration').classList.remove('visible');
  window.setTimeout(() => { $('#rankCelebration').hidden = true; }, 250);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (document.body.classList.contains('focus-mode')) exitFocusMode();
    else if (!$('#emailConfirmationPopup').hidden) closeEmailConfirmation();
    else if (!$('#rankCelebration').hidden) $('#celebrationClose').click();
    else if (!$('#authModal').hidden) setAuthModal(false);
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

initializeTheme();
switchSubject(activeSubject);
renderNotifications();
updateStudyTimer();
initializeCloud();

window.setInterval(tickStudyTime, 1000);
window.setInterval(() => {
  if (currentUser && document.visibilityState === 'visible') loadLeaderboard({ silent: true });
}, 5 * 60 * 1000);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') persistStudyTime();
  else lastStudyTick = Date.now();
});
window.addEventListener('pagehide', persistStudyTime);
