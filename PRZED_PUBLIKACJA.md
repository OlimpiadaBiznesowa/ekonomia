# NaukaEkonomii.pl — lista przed publikacją

Stan przeglądu: 3 września 2026 r. To robocza lista wdrożeniowa, a nie indywidualna porada prawna.

## Nie publikuj jeszcze bez zamknięcia tych punktów

### 1. Zgoda na publikację pytań OWE

W projekcie znajduje się bank 300 pytań wraz z kluczami odpowiedzi z XXXV–XXXVIII OWE. Oficjalne archiwum PTE udostępnia pliki do pobrania, ale stopka serwisu oznacza materiały jako „Wszelkie prawa zastrzeżone” i nie wskazuje otwartej licencji. Samo podanie źródła nie jest licencją.

Najbezpieczniejszy wariant przed publicznym uruchomieniem:

- uzyskać od PTE/Komitetu Głównego OWE pisemną zgodę obejmującą ponowne publikowanie pytań i kluczy w interaktywnym quizie na `naukaekonomii.pl`,
- ustalić wymagany sposób podpisania materiałów i ewentualne ograniczenia,
- zachować wiadomość lub umowę jako dowód licencji,
- jeżeli zgody nie będzie, zastąpić pełne pytania autorskimi pytaniami inspirowanymi zakresem OWE i pozostawić jedynie link do oficjalnych arkuszy.

Prawo cytatu pozwala przytaczać urywki w zakresie uzasadnionym m.in. wyjaśnianiem, analizą lub nauczaniem, ale nie daje automatycznie prawa do odtworzenia całego banku pytań. Źródła: [ustawa o prawie autorskim — tekst jednolity, w tym art. 29, 34 i 35](https://eli.gov.pl/eli/DU/2025/24/ogl/pol), [oficjalne archiwum pytań OWE](https://owe.pte.pl/informacje/poprzednie-edycje/zestawy-pytan-z-poprzednich-edycji.html).

### 2. Dane właściciela strony i kontakt

Przed publikacją trzeba wskazać usługodawcę/administratora danych. Przygotuj:

- imię i nazwisko albo pełną nazwę podmiotu,
- adres geograficzny/siedziby wymagany dla usługodawcy,
- działający adres e-mail w domenie, np. `kontakt@naukaekonomii.pl`,
- dane działalności (NIP/KRS/CEIDG), jeżeli strona będzie prowadzona w ramach działalności,
- osobny kontakt do spraw danych osobowych; dane IOD tylko wtedy, gdy IOD został wyznaczony.

Ustawa o świadczeniu usług drogą elektroniczną wymaga łatwego, stałego i bezpośredniego dostępu do podstawowych danych usługodawcy. Źródło: [tekst jednolity ustawy o świadczeniu usług drogą elektroniczną](https://eli.gov.pl/api/acts/DU/2024/1513/text.html).

### 3. Polityka prywatności i obowiązek informacyjny RODO

Konto przetwarza co najmniej: adres e-mail, nazwę profilu, identyfikator użytkownika, historię i postęp nauki, punkty, serię, członkostwo w rankingu oraz dane techniczne związane z logowaniem. Trzeba opublikować zrozumiałą politykę prywatności dostępną przed założeniem konta. Powinna wskazywać:

- administratora i dane kontaktowe,
- cele oraz podstawę prawną każdego celu,
- odbiorców/podmioty przetwarzające (hosting, Supabase, dostawca poczty i inne faktycznie użyte usługi),
- lokalizację danych i ewentualne transfery poza EOG,
- okres przechowywania albo kryteria jego ustalenia,
- prawa użytkownika, sposób ich realizacji i prawo skargi do Prezesa UODO,
- czy podanie danych jest wymagane oraz skutek ich niepodania,
- informacje o profilowaniu lub zautomatyzowanych decyzjach, jeżeli występują.

Komunikaty mają być krótkie, przejrzyste i napisane prostym językiem, szczególnie gdy są kierowane do dzieci. Źródła: [RODO — art. 12 i 13](https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32016R0679), [UODO — prawa użytkownika i szczególna ochrona dzieci](https://uodo.gov.pl/pl/493/2261).

W ustawieniach Supabase sprawdź region projektu. Sama nazwa regionu „Europe” nie przesądza o przechowywaniu danych w UE; dostawca zaleca wybór konkretnego regionu, jeśli ma to znaczenie dla rezydencji danych. Zawrzyj/zaakceptuj DPA i wpisz Supabase do dokumentacji dostawców. Źródła: [regiony Supabase](https://supabase.com/docs/guides/platform/regions), [bezpieczeństwo i DPA Supabase](https://supabase.com/docs/guides/security).

### 4. Regulamin bezpłatnej usługi

Dla konta, synchronizacji i rankingu przygotuj regulamin dostępny przed rejestracją i możliwy do zapisania. Powinien zawierać co najmniej:

- rodzaje i zakres usług,
- wymagania techniczne,
- zakaz dostarczania treści bezprawnych (istotny także dla nazwy widocznej w rankingu),
- zasady założenia, używania i usunięcia konta,
- zasady rankingu oraz informację, że wynik nie jest odporny na manipulacje po stronie przeglądarki,
- procedurę reklamacyjną i kontakt,
- zasady zmiany regulaminu i zakończenia usługi.

Zakres wymaganych elementów wynika wprost z art. 8 ustawy. Źródło: [ustawa o świadczeniu usług drogą elektroniczną](https://eli.gov.pl/api/acts/DU/2024/1513/text.html).

### 5. Użytkownicy niepełnoletni

Strona jest kierowana do uczniów, więc przed uruchomieniem kont trzeba świadomie ustalić minimalny wiek i podstawę przetwarzania. Jeżeli przetwarzanie danych dziecka w usłudze społeczeństwa informacyjnego ma opierać się na zgodzie, poniżej 16 lat zgodę wyraża lub aprobuje rodzic/opiekun. Nie należy dodawać przypadkowego checkboxa „zgadzam się na RODO”: najpierw trzeba ustalić właściwą podstawę prawną i zdolność małoletniego do zawarcia regulaminu bezpłatnej usługi. Warto skonsultować ten jeden punkt z prawnikiem znającym usługi dla szkół i młodzieży. Źródło: [UODO — dzieci i usługi społeczeństwa informacyjnego](https://uodo.gov.pl/pl/493/2261).

## Prywatność urządzenia i pliki cookies

Obecna aplikacja nie ma analityki ani reklam, ale zapisuje w `localStorage` m.in. postęp, motyw, ustawienia nauki, powiadomienia i — po zalogowaniu — sesję Supabase. Ponadto przeglądarka łączy się z Google Fonts, jsDelivr i Supabase.

Przed publikacją:

- opisz lokalny zapis i sesję logowania w polityce prywatności/cookies,
- rozważ samodzielne hostowanie fontów i biblioteki Supabase, aby ograniczyć zewnętrzne połączenia,
- nie dodawaj analityki, reklam ani innych niekoniecznych trackerów bez mechanizmu uprzedniej zgody,
- jeżeli pozostają wyłącznie informacje technicznie konieczne do usługi żądanej przez użytkownika, udokumentuj tę kwalifikację; nie pokazuj bannera, który sugeruje fikcyjny wybór.

Art. 399 Prawa komunikacji elektronicznej reguluje przechowywanie informacji w urządzeniu użytkownika i wyjątek dla operacji niezbędnych do dostarczenia żądanej usługi. Źródło: [Prawo komunikacji elektronicznej](https://eli.gov.pl/api/acts/DU/2024/1221/text/T/D20241221L.pdf).

## Techniczne minimum produkcyjne

- Wymuś HTTPS i jedno kanoniczne wejście (`naukaekonomii.pl` albo `www`) z przekierowaniem drugiego wariantu.
- Ustaw w Supabase właściwe `Site URL` i listę dozwolonych przekierowań.
- Skonfiguruj własny SMTP, SPF, DKIM i DMARC dla wiadomości aktywacyjnych. Testowy SMTP Supabase nie nadaje się do publicznej rejestracji. Źródło: [Supabase — własny SMTP](https://supabase.com/docs/guides/auth/auth-smtp).
- Włącz ochronę przed wyczerpaniem limitu/rejestracjami automatycznymi i sprawdź limity Auth.
- Zweryfikuj RLS po ponownym wykonaniu `supabase-setup.sql`; klucz `service_role`/secret nigdy nie może trafić do przeglądarki.
- Ustal kopie zapasowe i sposób odtworzenia bazy. Darmowy plan ma istotne ograniczenia backupu i dostępności. Źródło: [checklista produkcyjna Supabase](https://supabase.com/docs/guides/deployment/going-into-prod).
- Dodaj nagłówki bezpieczeństwa na hostingu (co najmniej CSP dopasowane do faktycznych domen, `X-Content-Type-Options`, `Referrer-Policy` i ochronę osadzania strony).
- Przetestuj rejestrację, potwierdzenie e-mail, logowanie, wylogowanie i usunięcie konta z telefonu oraz komputera.
- Przetestuj obsługę klawiaturą, widoczny fokus, kontrast, powiększenie 200% i czytnik ekranu. Nawet gdy formalna ustawa dostępności nie ma zastosowania, WCAG 2.2 AA jest rozsądnym celem jakościowym.
- Załóż `kontakt@naukaekonomii.pl` i adres do zgłoszeń prawnych/prywatności.

## Już przygotowane w projekcie

- nauka bez konta z lokalnym postępem,
- logowanie wymagane tylko przy wejściu do rankingu,
- ranking chroniony również po stronie Supabase/RLS,
- możliwość zmiany nazwy i usunięcia konta wraz z postępem,
- metadane SEO, adres kanoniczny, `robots.txt` i `sitemap.xml`,
- bibliografia, informacja o braku powiązania z autorami/wydawcami i odsyłacze do źródeł.

## Dane potrzebne do przygotowania finalnych dokumentów na stronie

1. Kto jest właścicielem i administratorem strony (osoba czy działalność)?
2. Jaki adres oraz e-mail mają być publicznym kontaktem?
3. Czy konto będzie dostępne dla osób poniżej 16 lat?
4. Czy strona pozostaje całkowicie bezpłatna i bez reklam?
5. W jakim regionie działa projekt Supabase i na jakim hostingu będzie strona?
6. Czy masz pisemną zgodę PTE na publikację pełnych pytań i kluczy OWE?

Po uzyskaniu tych odpowiedzi trzeba przygotować i podlinkować w stopce finalną politykę prywatności oraz regulamin, a w formularzu rejestracji umieścić linki do obu dokumentów przed przyciskiem utworzenia konta.
