# Opcjonalne konto, synchronizacja postępu i ranking — konfiguracja

Materiały edukacyjne i lokalny zapis postępu działają bez logowania. Supabase jest potrzebny do opcjonalnych kont, synchronizacji postępu między urządzeniami oraz rankingu — ranking jest jedyną częścią strony wymagającą zalogowania.

## 1. Utwórz projekt

1. Wejdź na [supabase.com](https://supabase.com/) i utwórz bezpłatny projekt.
2. W panelu projektu otwórz **SQL Editor**.
3. Skopiuj całą zawartość pliku `supabase-setup.sql`, wklej ją do edytora i wybierz **Run**.

Skrypt tworzy profile, zapis postępu, ranking publiczny, chroniony ranking prywatny oraz zasady RLS. Każdy zalogowany użytkownik może zmieniać tylko własny rekord postępu. Ranking publiczny udostępnia zalogowanym osobom wyłącznie nazwę, liczbę punktów i identyfikator konta — bez adresów e-mail i haseł. Nazwa, członkowie i wyniki prywatnego rankingu są zwracane dopiero użytkownikowi, który do niego dołączył.

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

- **Site URL**: `https://naukaekonomii.pl`
- **Redirect URL**: `https://naukaekonomii.pl/**`
- opcjonalny dodatkowy **Redirect URL**: `https://www.naukaekonomii.pl/**` (jeżeli wersja `www` nie będzie od razu przekierowywana na domenę główną)
- opcjonalny lokalny **Redirect URL** do testów: `http://127.0.0.1:4173/`

W **Authentication → Providers → Email** pozostaw włączone logowanie e-mail/hasło. Domyślnie nowy uczeń potwierdza adres przez wiadomość e-mail; to bezpieczniejsza konfiguracja dla klasy.

Przed produkcyjnym uruchomieniem skonfiguruj własny SMTP i adres nadawcy w domenie (np. `konto@naukaekonomii.pl`). Wbudowany serwer pocztowy Supabase jest przeznaczony do testów i ma bardzo niski limit wysyłki.

## 4. Po aktualizacji funkcji konta, rankingu, serii lub questów

Po dodaniu prywatnego rankingu, dziennego boosta, serii nauki, dziennych questów, punktów za arkusze OWE lub usuwania konta ponownie uruchom **cały** plik `supabase-setup.sql` w **SQL Editor → Run**. Skrypt jest przygotowany do bezpiecznego ponownego uruchomienia: zachowuje istniejące konta, punkty i postęp, a tylko dodaje brakujące tabele, kolumny oraz funkcje.

Prywatny ranking używa kodu współdzielonego, ale w bazie znajduje się wyłącznie jego hash bcrypt. Po pięciu błędnych próbach konto otrzymuje 15-minutową blokadę kolejnych prób. Członkostwo jest zapamiętywane, więc po jednorazowym dołączeniu użytkownik nie musi wpisywać hasła ponownie.

## 5. Opublikuj

Dodaj do repozytorium wszystkie pliki strony, w tym `supabase-config.js`, `supabase-setup.sql` i `SUPABASE_SETUP.md`, a następnie opublikuj stronę. Goście mogą korzystać z całej nauki bez konta; próba wejścia do rankingu otwiera logowanie. Po zalogowaniu lokalny postęp jest łączony z kontem.

Po zalogowaniu nazwę użytkownika można zmienić w oknie **Konto ucznia**. Zmiana jest zapisywana w profilu i od razu widoczna w rankingu.

## Co jest zapisywane

- punkty i ranga,
- opanowane i oznaczone gwiazdką fiszki,
- liczba ukończonych quizów, arkuszy OWE, sesji nauki i testów,
- bieżąca i rekordowa seria nauki wraz z datą ostatniej aktywności,
- trzy wylosowane questy dnia, ich stan początkowy i odebrane skrzynki,
- naliczony aktywny czas nauki,
- datę i czas aktywacji dziennego boosta punktów,
- nazwę użytkownika widoczną w profilu i rankingu,
- członkostwo w prywatnym rankingu, bez zapisywania wpisanego hasła.

Przy pierwszym logowaniu lokalny postęp z danego urządzenia jest łączony z kontem. Kolejne logowania pobierają go na innych urządzeniach. Wylogowanie usuwa lokalną kopię postępu z bieżącej przeglądarki, aby nie pokazać jej następnej osobie.

## Ważne ograniczenie

To ranking do wspólnej nauki, a nie system odporny na oszustwa. Punkty są obliczane przez kod uruchomiony w przeglądarce, więc technicznie zaawansowana osoba może je zmodyfikować. Pełne zabezpieczenie wymagałoby sprawdzania każdej odpowiedzi i przyznawania punktów po stronie serwera.
