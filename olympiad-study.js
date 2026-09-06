(function () {
  'use strict';

  const data = window.OLYMPIAD_CONCEPTS;
  if (!data?.concepts?.length) return;

  const $ = selector => document.querySelector(selector);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
  const normalize = value => String(value || '').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l').toLocaleLowerCase('pl');
  const storageKey = 'ekonomia-olympiad-concepts-v1';
  const directionStorageKey = 'ekonomia-olympiad-card-direction-v1';
  const byId = new Map(data.concepts.map(item => [item.id, item]));

  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch {
    // Nauka pozostaje dostępna także bez zapisu w pamięci przeglądarki.
  }
  const savedIds = key => new Set(
    (Array.isArray(saved[key]) ? saved[key] : []).filter(id => byId.has(id))
  );
  const known = savedIds('known');
  const difficult = savedIds('difficult');
  let definitionGroup = 'all';
  let cardGroup = 'all';
  let showDifficultOnly = false;
  let cardIndex = 0;
  let cardTransitioning = false;
  let quizSet = [];
  let quizIndex = 0;
  let quizScore = 0;
  let quizAnswered = false;
  let definitionFirst = false;
  try {
    definitionFirst = localStorage.getItem(directionStorageKey) === 'definition-first';
  } catch {
    // Preferencja kierunku nadal zadziała w bieżącej sesji.
  }

  function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
    }
    return result;
  }

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        known: [...known],
        difficult: [...difficult]
      }));
    } catch {
      // Zmiany pozostają aktywne do końca bieżącej sesji.
    }
  }

  function groupOptions() {
    return '<option value="all">Wszystkie działy</option>'
      + Object.entries(data.groups).map(([id, name]) =>
        '<option value="' + escape(id) + '">' + escape(name) + '</option>'
      ).join('');
  }

  function sourceLink(item) {
    const source = data.sources[item.source];
    if (!source) return '';
    return '<a href="' + escape(source[1]) + '" target="_blank" rel="noopener noreferrer">'
      + escape(source[0]) + ' ↗</a>';
  }

  function renderDefinitions() {
    const grid = $('#olympiadDefinitions');
    if (!grid) return;
    const query = normalize($('#olympiadSearch').value.trim());
    const items = data.concepts.filter(item => {
      const searchable = [item.term, item.definition, item.note, item.aliases].join(' ');
      return (definitionGroup === 'all' || item.group === definitionGroup)
        && (!query || normalize(searchable).includes(query));
    });
    $('#olympiadConceptCount').textContent = items.length === data.concepts.length
      ? data.concepts.length + ' zagadnień'
      : items.length + ' z ' + data.concepts.length + ' zagadnień';
    grid.innerHTML = items.length
      ? items.map(item => {
        const note = item.note
          ? '<p class="concept-note olympiad-note"><strong>Zapamiętaj:</strong> ' + escape(item.note) + '</p>'
          : '';
        return '<article class="concept-card olympiad-concept">'
          + '<p class="concept-page">' + escape(data.groups[item.group]) + '</p>'
          + '<h3>' + escape(item.term) + '</h3>'
          + '<p class="olympiad-definition">' + escape(item.definition) + '</p>'
          + note
          + '<div class="olympiad-source">' + sourceLink(item) + '</div>'
          + '<a class="text-button olympiad-practice-link" href="/olimpiada-fiszki/?concept=' + encodeURIComponent(item.id) + '">Powtórz na fiszce →</a>'
          + '</article>';
      }).join('')
      : '<p class="concept-empty">Brak zagadnień pasujących do wyszukiwania.</p>';
  }

  function cardPool() {
    return data.concepts.filter(item =>
      (cardGroup === 'all' || item.group === cardGroup)
      && (!showDifficultOnly || difficult.has(item.id))
    );
  }

  function cardSides(item) {
    return definitionFirst
      ? { front: item.definition, back: item.term, frontLabel: 'DEFINICJA', backLabel: 'POJĘCIE' }
      : { front: item.term, back: item.definition, frontLabel: 'POJĘCIE', backLabel: 'DEFINICJA' };
  }

  function updateCardDirectionButton() {
    const button = $('#olympiadReverse');
    button.classList.toggle('active', definitionFirst);
    button.setAttribute('aria-pressed', String(definitionFirst));
    button.setAttribute('aria-label', definitionFirst
      ? 'Najpierw pokazuj pojęcie'
      : 'Najpierw pokazuj definicję');
    button.title = definitionFirst
      ? 'Teraz najpierw widzisz definicję. Kliknij, aby zacząć od pojęcia.'
      : 'Odwróć wszystkie fiszki i zacznij od definicji.';
  }

  function renderCard(preferredId) {
    if (!$('#olympiadCard')) return;
    const cards = cardPool();
    if (preferredId) {
      const found = cards.findIndex(item => item.id === preferredId);
      if (found >= 0) cardIndex = found;
    }
    if (cardIndex >= cards.length) cardIndex = 0;
    if (cardIndex < 0) cardIndex = cards.length - 1;
    const item = cards[cardIndex];
    const navigationButtons = [$('#olympiadPrevious'), $('#olympiadNext')];
    $('#olympiadCardPool').textContent = cards.length + ' zagadnień w tej puli'
      + (showDifficultOnly ? ' · tylko trudne' : '');
    $('#olympiadStarredCount').textContent = difficult.size;
    $('#olympiadStarredFilter').classList.toggle('active', showDifficultOnly);
    $('#olympiadStarredFilter').setAttribute('aria-pressed', String(showDifficultOnly));

    if (!item) {
      $('#olympiadCard').classList.remove('is-flipped');
      $('#olympiadCardPosition').textContent = '0 / 0';
      $('#olympiadCardMeta').textContent = 'BRAK MATERIAŁU';
      $('#olympiadCardFront').textContent = 'W tym dziale nie ma przypisanych zagadnień.';
      $('#olympiadCardBack').textContent = showDifficultOnly
        ? 'Oznacz wybrane fiszki gwiazdką albo wyłącz filtr „Tylko trudne”.'
        : 'Wybierz wszystkie działy albo inny dział.';
      $('#olympiadCardLabel').textContent = 'FILTR';
      $('#olympiadDifficult').hidden = true;
      $('#olympiadReverse').hidden = true;
      $('#olympiadCardHint').hidden = true;
      $('#olympiadRecallActions').hidden = true;
      navigationButtons.forEach(button => { button.disabled = true; });
      return;
    }

    navigationButtons.forEach(button => { button.disabled = false; });
    $('#olympiadDifficult').hidden = false;
    $('#olympiadReverse').hidden = false;
    const sides = cardSides(item);
    const front = $('#olympiadCardFront');
    const back = $('#olympiadCardBack');
    $('#olympiadCard').classList.remove('is-flipped');
    front.setAttribute('aria-hidden', 'false');
    back.setAttribute('aria-hidden', 'true');
    front.textContent = sides.front;
    back.textContent = sides.back;
    front.classList.toggle('is-definition', definitionFirst);
    back.classList.toggle('is-definition', !definitionFirst);
    $('#olympiadCardPosition').textContent = (cardIndex + 1) + ' / ' + cards.length;
    $('#olympiadCardMeta').textContent = data.groups[item.group].toLocaleUpperCase('pl');
    $('#olympiadCardLabel').textContent = sides.frontLabel;
    $('#olympiadCard').setAttribute('aria-label', definitionFirst
      ? 'Odwróć fiszkę i zobacz pojęcie'
      : 'Odwróć fiszkę i zobacz definicję');
    $('#olympiadCardHint').hidden = cardIndex !== 0;
    $('#olympiadCardHint').innerHTML = definitionFirst
      ? 'Kliknij, aby zobaczyć pojęcie <b>↻</b>'
      : 'Kliknij, aby zobaczyć definicję <b>↻</b>';
    const isDifficult = difficult.has(item.id);
    $('#olympiadDifficult').classList.toggle('active', isDifficult);
    $('#olympiadDifficult').setAttribute('aria-pressed', String(isDifficult));
    $('#olympiadDifficult').setAttribute('aria-label', isDifficult
      ? 'Usuń fiszkę z trudnych'
      : 'Oznacz fiszkę jako trudną');
    $('#olympiadDifficult').textContent = isDifficult ? '★' : '☆';
    $('#olympiadRecallActions').hidden = true;
    updateCardDirectionButton();
  }

  function flipCard() {
    if (!cardPool().length) return;
    const element = $('#olympiadCard');
    const flipped = element.classList.toggle('is-flipped');
    const item = cardPool()[cardIndex];
    const sides = cardSides(item);
    $('#olympiadCardFront').setAttribute('aria-hidden', String(flipped));
    $('#olympiadCardBack').setAttribute('aria-hidden', String(!flipped));
    $('#olympiadCardLabel').textContent = flipped ? sides.backLabel : sides.frontLabel;
    $('#olympiadRecallActions').hidden = !flipped;
  }

  function moveCard(direction, preferredId) {
    const cards = cardPool();
    if ((!cards.length && !preferredId) || cardTransitioning) return;
    cardTransitioning = true;
    const element = $('#olympiadCard');
    const updateCard = () => {
      const currentPool = cardPool();
      const preferredIndex = preferredId
        ? currentPool.findIndex(item => item.id === preferredId)
        : -1;
      cardIndex = preferredIndex >= 0
        ? preferredIndex
        : currentPool.length
          ? (cardIndex + direction + currentPool.length) % currentPool.length
          : 0;
      renderCard();
    };
    if (typeof element.animate !== 'function') {
      updateCard();
      cardTransitioning = false;
      return;
    }
    const exitX = direction > 0 ? '-72px' : '72px';
    const enterX = direction > 0 ? '72px' : '-72px';
    const exitAnimation = element.animate([
      { opacity: 1, transform: 'translateX(0) scale(1)' },
      { opacity: 0, transform: 'translateX(' + exitX + ') scale(.985)' }
    ], { duration: 180, easing: 'ease-in', fill: 'forwards' });
    exitAnimation.finished.then(() => {
      updateCard();
      exitAnimation.cancel();
      const enterAnimation = element.animate([
        { opacity: 0, transform: 'translateX(' + enterX + ') scale(.985)' },
        { opacity: 1, transform: 'translateX(0) scale(1)' }
      ], { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' });
      enterAnimation.finished.finally(() => { cardTransitioning = false; });
    }).catch(() => { cardTransitioning = false; });
  }

  function assessCard(mastered) {
    const cards = cardPool();
    const item = cards[cardIndex];
    if (!item) return;
    const nextId = cards[(cardIndex + 1) % cards.length]?.id;
    if (mastered) {
      known.add(item.id);
      difficult.delete(item.id);
    } else {
      known.delete(item.id);
      difficult.add(item.id);
    }
    save();
    moveCard(1, nextId);
  }

  function toggleDifficult() {
    const item = cardPool()[cardIndex];
    if (!item) return;
    if (difficult.has(item.id)) difficult.delete(item.id);
    else difficult.add(item.id);
    save();
    renderCard(item.id);
  }

  function toggleCardDirection() {
    definitionFirst = !definitionFirst;
    try {
      localStorage.setItem(directionStorageKey, definitionFirst ? 'definition-first' : 'topic-first');
    } catch {
      // Preferencja nadal działa do końca bieżącej sesji.
    }
    renderCard();
  }

  function quizPool() {
    const group = $('#olympiadQuizGroup')?.value || 'all';
    return data.concepts.filter(item => group === 'all' || item.group === group);
  }

  function buildQuizQuestions(items, kind) {
    const ids = new Set(items.map(item => item.id));
    const recognition = kind === 'applications' ? [] : items.map(item => {
      const distractors = shuffle(
        data.concepts.filter(other => other.group === item.group && other.id !== item.id)
      ).slice(0, 3);
      return {
        id: 'definition-' + item.id,
        conceptId: item.id,
        question: item.definition,
        options: [item.term, ...distractors.map(other => other.term)],
        correctText: item.term
      };
    });
    const applications = kind === 'definitions' ? [] : data.applications
      .filter(item => ids.has(item.conceptId))
      .map(item => ({
        id: item.id,
        conceptId: item.conceptId,
        question: item.question,
        options: [...item.options],
        correctText: item.options[item.correct]
      }));
    return [...recognition, ...applications];
  }

  function availableQuizQuestions() {
    return buildQuizQuestions(quizPool(), $('#olympiadQuizKind').value);
  }

  function startQuiz() {
    if (!$('#olympiadQuizCard')) return;
    const available = availableQuizQuestions();
    const selectedCount = $('#olympiadQuizCount').value;
    const requestedLength = selectedCount === 'all' ? available.length : Number(selectedCount);
    quizSet = shuffle(available).slice(0, Math.min(requestedLength, available.length)).map(item => ({
      ...item,
      options: shuffle(item.options)
    }));
    quizIndex = 0;
    quizScore = 0;
    quizAnswered = false;
    $('#olympiadQuizPool').textContent = available.length + ' pytań · ' + quizSet.length + ' w zestawie';
    $('#olympiadQuizCard').hidden = false;
    $('#olympiadQuizResult').hidden = true;
    $('#olympiadQuizResult').classList.remove('quiz-finished');
    if (!quizSet.length) {
      $('#olympiadQuestion').textContent = 'Brak pytań dla wybranego filtra.';
      $('#olympiadOptions').innerHTML = '';
      $('#olympiadQuestionMeta').textContent = '';
      $('#olympiadQuizProgressLabel').textContent = '0 pytań';
      $('#olympiadQuizProgressBar').style.width = '0%';
      return;
    }
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const item = quizSet[quizIndex];
    const concept = byId.get(item.conceptId);
    quizAnswered = false;
    $('#olympiadQuizProgressLabel').textContent = 'Pytanie ' + (quizIndex + 1) + ' z ' + quizSet.length;
    $('#olympiadQuizProgressBar').style.width = (quizIndex / quizSet.length * 100) + '%';
    $('#olympiadQuestionMeta').textContent = data.groups[concept.group].toLocaleUpperCase('pl');
    $('#olympiadQuestion').textContent = item.question;
    $('#olympiadQuizCard').classList.remove('answer-correct', 'answer-wrong');
    $('#olympiadOptions').innerHTML = item.options.map((option, index) =>
      '<button class="answer" type="button" data-olympiad-answer="' + index + '">'
        + '<span class="letter">' + 'ABCD'[index] + '</span>'
        + '<span>' + escape(option) + '</span>'
        + '</button>'
    ).join('');
    $('#olympiadFeedback').textContent = '';
    $('#olympiadFeedback').className = 'quiz-feedback';
    $('#olympiadQuestionNext').hidden = true;
  }

  function answerQuestion(selectedIndex) {
    if (quizAnswered) return;
    const item = quizSet[quizIndex];
    const selectedText = item.options[selectedIndex];
    if (selectedText === undefined) return;
    quizAnswered = true;
    const correct = selectedText === item.correctText;
    if (correct) quizScore += 1;
    else {
      difficult.add(item.conceptId);
      known.delete(item.conceptId);
      save();
      if ($('#olympiadStarredCount')) $('#olympiadStarredCount').textContent = difficult.size;
    }

    $('#olympiadQuizCard').classList.remove('answer-correct', 'answer-wrong');
    requestAnimationFrame(() => $('#olympiadQuizCard').classList.add(correct ? 'answer-correct' : 'answer-wrong'));
    document.querySelectorAll('#olympiadOptions [data-olympiad-answer]').forEach(button => {
      button.disabled = true;
      const option = item.options[Number(button.dataset.olympiadAnswer)];
      if (option === item.correctText) button.classList.add('correct');
      if (option === selectedText && !correct) button.classList.add('wrong');
    });
    $('#olympiadFeedback').textContent = correct
      ? 'Dobrze.'
      : 'Poprawna: „' + item.correctText + '”.';
    $('#olympiadFeedback').classList.add(correct ? 'correct' : 'wrong');
    $('#olympiadQuestionNext').hidden = false;
  }

  function showQuizResult() {
    $('#olympiadQuizCard').hidden = true;
    $('#olympiadQuizResult').hidden = false;
    $('#olympiadQuizResult').classList.remove('quiz-finished');
    requestAnimationFrame(() => $('#olympiadQuizResult').classList.add('quiz-finished'));
    $('#olympiadScore').textContent = quizScore;
    $('#olympiadTotal').textContent = quizSet.length;
    const ratio = quizSet.length ? quizScore / quizSet.length : 0;
    $('#olympiadResultTitle').textContent = ratio >= 0.9
      ? 'Bardzo dobra znajomość wybranego zakresu.'
      : ratio >= 0.65
        ? 'Solidny wynik — wróć do pomylonych zagadnień.'
        : 'Powtórz fiszki z tego działu i spróbuj ponownie.';
    $('#olympiadResultCopy').textContent = quizScore + ' poprawnych odpowiedzi z ' + quizSet.length + '.';
    $('#olympiadQuizProgressBar').style.width = '100%';
  }

  function nextQuizQuestion() {
    if (!quizAnswered) return;
    quizIndex += 1;
    if (quizIndex < quizSet.length) renderQuizQuestion();
    else showQuizResult();
  }

  const definitionSelect = $('#olympiadConceptGroup');
  if (definitionSelect) {
    definitionSelect.innerHTML = groupOptions();
    definitionSelect.addEventListener('change', () => {
      definitionGroup = definitionSelect.value;
      renderDefinitions();
    });
    $('#olympiadSearch').addEventListener('input', renderDefinitions);
    renderDefinitions();
  }

  const cardSelect = $('#olympiadCardGroup');
  if (cardSelect) {
    cardSelect.innerHTML = groupOptions();
    cardSelect.addEventListener('change', () => {
      cardGroup = cardSelect.value;
      cardIndex = 0;
      renderCard();
    });
    $('#olympiadStarredFilter').addEventListener('click', () => {
      showDifficultOnly = !showDifficultOnly;
      cardIndex = 0;
      renderCard();
    });
    $('#olympiadCard').addEventListener('click', flipCard);
    $('#olympiadPrevious').addEventListener('click', () => moveCard(-1));
    $('#olympiadNext').addEventListener('click', () => moveCard(1));
    $('#olympiadAgain').addEventListener('click', () => assessCard(false));
    $('#olympiadKnown').addEventListener('click', () => assessCard(true));
    $('#olympiadDifficult').addEventListener('click', toggleDifficult);
    $('#olympiadReverse').addEventListener('click', toggleCardDirection);
    const requestedConcept = new URLSearchParams(location.search).get('concept');
    renderCard(requestedConcept);
  }

  const quizGroup = $('#olympiadQuizGroup');
  if (quizGroup) {
    quizGroup.innerHTML = groupOptions();
    quizGroup.addEventListener('change', startQuiz);
    $('#olympiadQuizKind').addEventListener('change', startQuiz);
    $('#olympiadQuizCount').addEventListener('change', startQuiz);
    $('#olympiadQuizRestart').addEventListener('click', startQuiz);
    $('#olympiadQuizAgain').addEventListener('click', startQuiz);
    $('#olympiadQuestionNext').addEventListener('click', nextQuizQuestion);
    $('#olympiadOptions').addEventListener('click', event => {
      const button = event.target.closest('[data-olympiad-answer]');
      if (button) answerQuestion(Number(button.dataset.olympiadAnswer));
    });
    startQuiz();
  }

  window.addEventListener('study-progress-reset', () => {
    known.clear();
    difficult.clear();
    save();
    renderDefinitions();
    renderCard();
    startQuiz();
  });
})();
