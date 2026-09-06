# SEO — czynności właściciela po publikacji

Kod strony zawiera metadane, faviconę, kartę Open Graph, dane uporządkowane, linki indeksowalne, statyczne strony tematyczne, mapę witryny i stronę 404. Poniższe kroki wymagają dostępu właściciela do hostingu lub Google.

## 1. Opublikuj wszystkie zmiany

Wdróż całe repozytorium na obecny hosting. Szczególnie ważne są nowe pliki i katalogi: `favicon.ico`, `site.webmanifest`, `404.html`, `seo-content.css`, `sitemap.xml`, `assets/og-nauka-ekonomii.png`, ikony w `assets/`, `mikroekonomia/` oraz `makroekonomia/`.

Po publikacji sprawdź, czy poniższe adresy nie pokazują strony głównej, lecz właściwy plik:

- https://naukaekonomii.pl/favicon.ico
- https://naukaekonomii.pl/assets/favicon-96.png
- https://naukaekonomii.pl/assets/og-nauka-ekonomii.png
- https://naukaekonomii.pl/sitemap.xml
- https://naukaekonomii.pl/mikroekonomia/
- https://naukaekonomii.pl/makroekonomia/

Losowy nieistniejący adres powinien zwracać kod HTTP `404`, nie `200`. Jeśli hosting nadal zwraca `200`, wyłącz regułę SPA fallback/redirect-to-index dla nieznanych ścieżek albo skonfiguruj `404.html` jako stronę błędu.

## 2. Podłącz Google Search Console

1. Otwórz https://search.google.com/search-console/ i dodaj usługę typu **Domena**: `naukaekonomii.pl`.
2. Skopiuj rekord TXT podany przez Google do DNS domeny i zakończ weryfikację.
3. W sekcji **Mapy witryn** wyślij: `https://naukaekonomii.pl/sitemap.xml`.
4. W **Sprawdzaniu adresu URL** poproś o indeksację strony głównej oraz stron `/mikroekonomia/` i `/makroekonomia/`.

## 3. Kontrola po indeksacji

Google może odświelać faviconę i wyniki przez kilka dni lub tygodni. Po około 28 dniach sprawdź w raporcie **Skuteczność**, które zapytania mają dużo wyświetleń i niski CTR; wtedy warto dopracować tytuły i opisy na podstawie realnych danych.
