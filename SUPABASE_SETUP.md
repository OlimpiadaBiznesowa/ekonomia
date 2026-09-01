# Logowanie, zapis postępu i ranking — konfiguracja

Strona wymaga zalogowania, dlatego przed udostępnieniem jej uczniom trzeba połączyć ją z Supabase. Bez poniższej konfiguracji materiały pozostają zablokowane.

## 1. Utwórz projekt

1. Wejdź na [supabase.com](https://supabase.com/) i utwórz bezpłatny projekt.
2. W panelu projektu otwórz **SQL Editor**.
3. Skopiuj całą zawartość pliku `supabase-setup.sql`, wklej ją do edytora i wybierz **Run**.

Skrypt tworzy profile, zapis postępu, ranking oraz zasady RLS. Każdy zalogowany użytkownik może zmieniać tylko własny rekord postępu. Ranking udostępnia zalogowanym osobom wyłącznie nazwę, liczbę punktów i identyfikator konta — bez adresów e-mail i haseł.

## 2. Połącz stronę z projektem

1. W Supabase otwórz **Project Settings → API**.
2. Skopiuj **Project URL**.
3. Skopiuj **Publishable key**. W starszym widoku może nazywać się `anon public`.
4. W pliku `supabase-config.js` uzupełnij:

```js
window.SUPABASE_CONFIG = {
  url: 'https://TWOJ-PROJEKT.supabase.co',
  publishableKey: 'TWÓJ_PUBLISHABLE_KEY'
};
```

Klucz publishable/anon jest przeznaczony do aplikacji przeglądarkowych i może być publiczny przy poprawnie włączonym RLS. Nigdy nie umieszczaj na stronie klucza `service_role`, secret key ani hasła do bazy.

## 3. Ustaw adres opublikowanej strony

W **Authentication → URL Configuration** ustaw:

- **Site URL**: docelowy adres Cloudflare Pages, np. `https://mikroekonomia.pages.dev/`
- **Redirect URL**: `https://mikroekonomia.pages.dev/**`
- opcjonalny lokalny **Redirect URL** do testów: `http://127.0.0.1:4173/`

W **Authentication → Providers → Email** pozostaw włączone logowanie e-mail/hasło. Domyślnie nowy uczeń potwierdza adres przez wiadomość e-mail; to bezpieczniejsza konfiguracja dla klasy.

## 4. Po aktualizacji funkcji konta lub questów

Po dodaniu dziennego boosta, questów, punktów za arkusze OWE lub usuwania konta ponownie uruchom **cały** plik `supabase-setup.sql` w **SQL Editor → Run**. Skrypt jest przygotowany do bezpiecznego ponownego uruchomienia: zachowuje istniejące konta, punkty i postęp, a tylko dodaje brakujące kolumny oraz funkcję usuwania własnego konta.

## 5. Opublikuj

Dodaj do repozytorium wszystkie pliki strony, w tym `supabase-config.js`, `supabase-setup.sql` i `SUPABASE_SETUP.md`, a następnie opublikuj GitHub Pages. Po wejściu na stronę uczniowie muszą utworzyć konto lub się zalogować, aby uzyskać dostęp do materiałów i rankingu.

Po zalogowaniu nazwę użytkownika można zmienić w oknie **Konto ucznia**. Zmiana jest zapisywana w profilu i od razu widoczna w rankingu.

## Co jest zapisywane

- punkty i ranga,
- opanowane i oznaczone gwiazdką fiszki,
- liczba ukończonych quizów, arkuszy OWE, sesji nauki i testów,
- odebrane skrzynki questów wraz z wylosowaną nagrodą,
- naliczony aktywny czas nauki,
- datę i czas aktywacji dziennego boosta punktów,
- nazwę użytkownika widoczną w profilu i rankingu.

Przy pierwszym logowaniu lokalny postęp z danego urządzenia jest łączony z kontem. Kolejne logowania pobierają go na innych urządzeniach. Wylogowanie usuwa lokalną kopię postępu z bieżącej przeglądarki, aby nie pokazać jej następnej osobie.

## Ważne ograniczenie

To ranking do wspólnej nauki, a nie system odporny na oszustwa. Punkty są obliczane przez kod uruchomiony w przeglądarce, więc technicznie zaawansowana osoba może je zmodyfikować. Pełne zabezpieczenie wymagałoby sprawdzania każdej odpowiedzi i przyznawania punktów po stronie serwera.
