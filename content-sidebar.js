/* Read the existing study progress; opening a tool does not award study days. */
(function () {
  'use strict';
  const keys = [14,13,12,11,9,7,5].map(version => `mankiw-taylor-study-progress-v${version}`);
  const dayKey = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  function updateStreak() {
    const badge = document.getElementById('contentStreak');
    const label = document.getElementById('contentStreakLabel');
    if (!badge || !label) return;
    let progress = {};
    try {
      const saved = keys.map(key => localStorage.getItem(key)).find(Boolean);
      const parsed = JSON.parse(saved || '{}');
      if (parsed && typeof parsed === 'object') progress = parsed;
    } catch {}
    const today = new Date(), yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate()-1);
    const count = value => Number.isFinite(Number(value)) ? Math.max(0,Math.trunc(Number(value))) : 0;
    const streak = [dayKey(today),dayKey(yesterday)].includes(progress.lastStudyDate) ? count(progress.dailyStreak) : 0;
    const record = count(progress.bestDailyStreak);
    badge.textContent = String(streak);
    badge.title = streak ? `Seria: ${streak} · rekord ${record}` : 'Rozpocznij serię nauki';
    label.textContent = progress.lastStudyDate === dayKey(today) ? `Dziś zaliczone · rekord ${record}` : streak ? 'Wróć dziś, aby utrzymać serię' : 'Rozpocznij serię dziś';
  }
  updateStreak();
  window.addEventListener('pageshow', updateStreak);
  window.addEventListener('focus', updateStreak);
  window.addEventListener('storage', event => { if (!event.key || keys.includes(event.key)) updateStreak(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateStreak(); });
})();
