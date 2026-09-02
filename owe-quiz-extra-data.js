(function () {
  'use strict';

  const editions = [
    {
      edition: 'XXXV',
      year: '2021/2022',
      sourceUrl: 'https://owe.pte.pl/upload/files/zestawy-pytan/xxxv/xxxv-owe-zawody-iiiklucz-odpowiedzi.pdf',
      questions: [
        [1, 'Co sprawia, że zmiana nominalnej stopy procentowej może wpływać na wielkości realne w kanale stopy procentowej?', ['Efekt zarażania', 'Sztywność cen', 'Niedoskonała substytucyjność aktywów finansowych', 'Efekt stadny'], [1]],
        [2, 'Które stwierdzenia prawidłowo opisują efekt dochodowy i substytucyjny po zmianie ceny?', ['Dla dóbr normalnych oba efekty działają w przeciwnych kierunkach', 'Dla dóbr niższego rzędu oba efekty działają w przeciwnych kierunkach', 'Dla dóbr Giffena oba efekty działają w przeciwnych kierunkach', 'Dla dóbr Giffena efekt dochodowy nie występuje'], [1, 2]],
        [3, 'Które zdanie o monopolu jest prawdziwe?', ['Nadwyżka konsumenta zawsze wynosi zero', 'Krótkookresowa krzywa podaży monopolisty pokrywa się z jego kosztem krańcowym', 'Długookresowa krzywa podaży monopolisty jest częścią krzywej kosztu krańcowego', 'Monopolista maksymalizuje zysk, gdy koszt krańcowy równa się utargowi krańcowemu'], [3]],
        [4, 'Podaż baterii opisuje p = q + 11, a popyt p = −2q + 38. Producent płaci podatek 6 zł od sztuki. Ile wynosi łączne obciążenie podatkowe konsumentów?', ['26 zł', '28 zł', '36 zł', '81 zł'], [1]],
        [5, 'Linia budżetowa Adama zmieniła się ze 1000 = 20A + 40B na 2000 = 20A + 40B. Co mogło być przyczyną?', ['Wzrost dochodu o 1000', 'Dwukrotny wzrost cen obu dóbr', 'Spadek ceny tylko dobra A', 'Spadek ceny tylko dobra B'], [0]],
        [6, 'W gospodarce bez państwa oszczędności opisuje S = −100 + 0,3Y. Która funkcja konsumpcji jest zgodna z tym równaniem?', ['C = −100 + 0,3Y', 'C = 100 − 0,7Y', 'C = −100 − 0,3Y', 'C = 100 + 0,7Y'], [3]],
        [7, 'Która instytucja nadzoruje rynek kapitałowy w Polsce?', ['Narodowy Bank Polski', 'Komisja Nadzoru Finansowego', 'Komisja Papierów Wartościowych', 'Komitet Kontroli Obrotu Papierami Wartościowymi'], [1]],
        [8, 'Które stwierdzenia o krańcowej skłonności do konsumpcji są prawdziwe?', ['Jej wzrost zwiększa nachylenie funkcji konsumpcji', 'Jej wzrost podnosi konsumpcję autonomiczną', 'Jest odwrotnością krańcowej skłonności do oszczędzania', 'Nie może wynosić 2'], [0, 3]],
        [9, 'W gospodarce zamkniętej stopa podatkowa wynosi 0,25, a krańcowa skłonność do oszczędzania 0,20. Ile wynosi mnożnik podatkowy?', ['−0,95', '−2,00', '−2,22', '−5,00'], [1]],
        [10, 'Które cechy poprawnie opisują krzywą Engla?', ['Pokazuje zależność popytu od dochodu', 'Dla dóbr luksusowych jest nachylona ujemnie', 'Dla dóbr Giffena jest nachylona ujemnie', 'Dla dóbr luksusowych jest pionowa'], [0, 2]],
        [11, 'Na czym polega strategia inwestycyjna short strangle z wykorzystaniem opcji na akcję?', ['Wystawienie opcji call i put z identycznymi cenami wykonania', 'Kupno opcji call i put z różnymi cenami wykonania', 'Wystawienie opcji call i put z różnymi cenami wykonania', 'Kupno opcji call i put z identycznymi cenami wykonania'], [2]],
        [12, 'Które z podanych źródeł dochodów budżetu państwa w Polsce jest najbardziej wydajne?', ['Podatek CIT', 'Podatek PIT', 'Podatek od niektórych instytucji finansowych', 'Wpłata z zysku NBP'], [1]],
        [13, 'Jaki jest podstawowy obszar działalności funduszy private equity?', ['Inwestowanie w młode, perspektywiczne i bardziej ryzykowne spółki poza giełdą', 'Pośrednictwo między inwestorami na rynku kapitałowym', 'Zakup giełdowych papierów prywatnych przedsiębiorstw', 'Inwestowanie wyłącznie w blue chips'], [0]],
        [14, 'Dwaj duopoliści Bertranda mają stały koszt krańcowy 30 zł, a popyt rynkowy p = −2q + 50. Jaka cena wystąpi w równowadze Nasha?', ['10 zł', '15 zł', '30 zł', '40 zł'], [2]],
        [19, 'Kto opracował dwumianowy model wyceny opcji?', ['F. Black i M. Scholes', 'F. Black, M. Scholes i R. Merton', 'J. Cox, S. Ross i M. Rubinstein', 'F. Modigliani i M. Miller'], [2]]
      ]
    },
    {
      edition: 'XXXVI',
      year: '2022/2023',
      sourceUrl: 'https://owe.pte.pl/upload/files/zestawy-pytan/xxxvi/xxxvi-owe-zawody-iiiklucz-odpowiedzi.pdf',
      questions: [
        [1, 'Kogo uważa się za twórcę koncepcji neutralności podatkowej?', ['A. Laffera', 'M. Kaleckiego', 'D. Ricarda', 'J. Tobina'], [2]],
        [2, 'Która cecha polityki finansowej państwa najsilniej ogranicza efekt Tanziego–Olivery?', ['Wyłącznie VAT płatny miesiąc po powstaniu zobowiązania', 'Emisja obligacji wyłącznie za granicą', 'Wyłącznie PIT płatny rok po powstaniu zobowiązania', 'Emisja obligacji wyłącznie w kraju'], [0]],
        [3, 'Która kolejność prowadzi od najniższej do najwyższej inflacji?', ['Skacząca, pełzająca, galopująca, hiperinflacja', 'Pełzająca, kosztowa, płacowa, hiperinflacja', 'Pełzająca, skacząca, krocząca, galopująca', 'Pełzająca, krocząca, galopująca, hiperinflacja'], [3]],
        [4, 'Który rodzaj obligacji ma najwyższe ryzyko kredytowe?', ['Skarbowe', 'Komunalne', 'Śmieciowe', 'Korporacyjne z ratingiem AAA'], [2]],
        [5, 'Które pozycje należą do funkcji finansów publicznych według R. Musgrave’a?', ['Alokacyjna', 'Redystrybucyjna', 'Informacyjna', 'Stabilizacyjna'], [0, 1, 3]],
        [6, 'Dla jakiej kategorii dóbr krzywa Engla ma nachylenie ujemne?', ['Dóbr Veblena', 'Dóbr normalnych', 'Dóbr wyższego rzędu', 'Dóbr niższego rzędu'], [3]],
        [7, 'Ile wynosi mnożnik kreacji pieniądza przy stopie rezerwy obowiązkowej równej 100%?', ['−1', '0', '1', '1%'], [2]],
        [8, 'Które stwierdzenia o proporcji konsumpcji dóbr doskonale komplementarnych są poprawne?', ['Zawsze wynosi 1:1', 'Wpływa na położenie krzywych obojętności', 'Wyznacza położenie ograniczenia budżetowego', 'Wpływa na nachylenie ścieżki ekspansji dochodowej'], [1, 3]],
        [9, 'Popyt banków na depozyty opisuje r = −2q + 16, a podaż gospodarstw r = 2q + 2. Co może wywołać maksymalna stopa depozytowa 5%?', ['Negatywną selekcję', 'Podaż depozytów większą od popytu banków', 'Stygmatyzację', 'Silniejszą konkurencję banków instrumentami pozacenowymi'], [3]],
        [10, 'Które stwierdzenia o monopolu są prawdziwe?', ['Krzywa utargu krańcowego monopolisty jest malejąca', 'Krzywa popytu na jego produkt jest malejąca', 'Tylko krótkookresowo może osiągać zysk księgowy', 'Nigdy nie osiąga zysku ekonomicznego'], [0, 1]],
        [11, 'Krzywa zagregowanego popytu jest bardziej płaska, gdy:', ['Rośnie krańcowa skłonność do importu', 'Maleje krańcowa skłonność do konsumpcji', 'Rośnie krańcowa skłonność do oszczędzania', 'Maleje stopa opodatkowania'], [0, 1, 2]],
        [12, 'Jak nazywa się zmiana popytu wynikająca ze zmiany relacji cen dwóch dóbr?', ['Efekt bilansowy', 'Efekt dochodowy', 'Efekt substytucyjny', 'Efekt krańcowy'], [2]],
        [13, 'Popyt opisuje p = −4q + 100, a podaż p = 2q + 40. Ile wynosi nadwyżka konsumenta?', ['10', '40', '60', '200'], [3]],
        [14, 'Z jakim zjawiskiem wiąże się stale malejąca krzywa przeciętnego kosztu całkowitego?', ['Monopolem naturalnym', 'Brakiem kosztów alternatywnych', 'Oligopolem Bertranda', 'Doskonałą dyskryminacją cenową'], [0]],
        [15, 'Które stwierdzenia dotyczące Narodowego Banku Polskiego są prawdziwe?', ['Pieniądz w obiegu należy do pasywów NBP', 'Stopa lombardowa przewyższa depozytową', 'Stopa depozytowa jest niższa od referencyjnej', 'Stopa referencyjna przewyższa lombardową'], [0, 1, 2]]
      ]
    },
    {
      edition: 'XXXVII',
      year: '2023/2024',
      sourceUrl: 'https://owe.pte.pl/upload/files/zestawy-pytan/xxxvii/xxxvii-owe-zawody-iii-centralneklucz.pdf',
      questions: [
        [1, 'Kiedy wskaźnik pokrycia długu nadwyżką finansową jest wyższy?', ['Gdy firma płaci niższe odsetki', 'Gdy osiąga niższy zysk brutto', 'Gdy ma niższą amortyzację', 'Gdy płaci wyższe raty kredytowe'], [0]],
        [2, 'Kopalnia sprzedaje srebro jubilerowi za 500 tys. zł, a ten biżuterię konsumentom za 750 tys. zł. Jaka jest suma wartości dodanej obu firm?', ['450 tys. zł', '550 tys. zł', '750 tys. zł', '1 250 tys. zł'], [2]],
        [3, 'Który ekonomista zwrócił uwagę na adaptacyjny charakter oczekiwań inflacyjnych?', ['M. Friedman', 'T. Sargent', 'N. Wallace', 'F. Kydland'], [0]],
        [4, 'Które stwierdzenia poprawnie opisują krzywą dochodowości?', ['Łączy stopy procentowe z terminami zapadalności', 'Jej przebieg wyjaśnia m.in. teoria oczekiwań', 'Odzwierciedla oczekiwania dotyczące przyszłych stóp', 'Silny wzrost oznacza oczekiwanie dużych obniżek stóp'], [0, 1, 2]],
        [5, 'Zysk ekonomiczny firmy to 1 mln zł, utarg 2 mln zł, a koszty jawne 600 tys. zł. Ile wynoszą koszty ukryte?', ['400 tys. zł', '1 400 tys. zł', '1 600 tys. zł', '2 400 tys. zł'], [0]],
        [6, 'Które zdania o podstawowej operacji otwartego rynku NBP są prawdziwe?', ['NBP absorbuje nią nadwyżkę płynności banków', 'Rentowność bonów odpowiada stopie dyskontowej weksli', 'Rentowność bonów jest niższa od stopy lombardowej', 'Rentowność bonów jest wyższa od stopy depozytowej'], [0, 2, 3]],
        [7, 'Jeśli przedsiębiorstwo osiąga zysk normalny, to:', ['Przychody równają się kosztom jawnym', 'Koszty alternatywne są zerowe', 'Zysk księgowy jest nieujemny', 'Zysk księgowy jest niższy od kosztów ukrytych'], [2]],
        [8, 'Jak nazywa się instrumenty, których oprocentowanie wynika z różnicy między ceną zakupu i wartością wykupu?', ['Papiery dyskontowe', 'Certyfikaty inwestycyjne', 'TIPS-y', 'Instrumenty pochodne'], [0]],
        [9, 'Jakie skutki może mieć upowszechnienie internetowego poszukiwania pracy i lepsze dopasowanie ofert?', ['Spadek NAIRU', 'Wzrost naturalnej stopy bezrobocia', 'Przesunięcie krzywej Beveridge’a w lewo', 'Przesunięcie długookresowej krzywej Phillipsa w prawo'], [0, 2]],
        [10, 'Według teorii racjonalnych oczekiwań R. Lucasa polityka pieniężna wpływa na realną gospodarkę, gdy:', ['Bank centralny stosuje BCI', 'Obowiązuje rezerwa cząstkowa', 'Działania banku centralnego są nieoczekiwane', 'Gospodarka jest w recesji'], [2]],
        [11, 'Kiedy zgodnie z regułą Taylora stopa banku centralnego powinna być wyższa?', ['Gdy niższa jest naturalna realna stopa', 'Gdy niższa jest prognozowana inflacja', 'Gdy inflacja silniej przewyższa cel', 'Gdy większa jest dodatnia luka popytowa'], [2, 3]],
        [12, 'Podaż pieniądza wynosi 500 mld zł, a nominalny PKB 2 bln zł. Ile wynosi szybkość obiegu pieniądza?', ['1', '2', '4', '6'], [2]],
        [13, 'Które stwierdzenia o krzywej IS są prawdziwe?', ['Wydatki autonomiczne zmieniają jej nachylenie', 'Pokazuje zależność stopy procentowej i produkcji', 'Wydatki rządowe zmieniają jej nachylenie', 'Pionowa IS oznacza pułapkę inwestycji'], [1, 3]],
        [14, 'Co może spowodować złamanie linii ograniczenia budżetowego?', ['Wzrost ceny jednego dobra', 'Spadek cen obu dóbr', 'Wzrost ceny jednego i spadek drugiego dobra', 'Bony rządowe na zakup jednego z dóbr'], [3]],
        [15, 'Które zdanie opisuje pomostowy kapitał społeczny?', ['Jako pierwszy wyróżnił go P. Bourdieu', 'Jest źródłem amoralnego familizmu', 'To inne określenie kapitału wiążącego', 'Łączy osoby lub grupy, które wcześniej się nie znały'], [3]]
      ]
    },
    {
      edition: 'XXXVIII',
      year: '2024/2025',
      sourceUrl: 'https://owe.pte.pl/upload/files/zestawy-pytan/xxxviii/xxxviii-owe-zawody-iii-centralne-klucz.pdf',
      questions: [
        [1, 'Który podatek miał pierwotnie ograniczyć wolumen i zmienność transakcji walutowych?', ['Minsky’ego', 'Pigou', 'Tobina', 'Kaleckiego'], [2]],
        [2, 'Co według reguły Greenspana–Guidottiego powinny pokrywać oficjalne rezerwy walutowe?', ['Roczny import', 'Roczny eksport', 'Roczne saldo eksportu netto', 'Zagraniczne zobowiązania krótkoterminowe'], [3]],
        [3, 'Które zdanie o polityce pieniężnej NBP jest prawdziwe?', ['7-dniowe bony NBP są sprzedawane na przetargach', 'Cel operacyjny NBP wyznacza Konstytucja', 'POLONIA nie może być niższa od stopy lombardowej', 'NBP nigdy nie kupował obligacji skarbowych na rynku wtórnym'], [0]],
        [4, 'Która operacja otwartego rynku zwiększa płynność sektora bankowego?', ['Emisja obligacji', 'Przedterminowy wykup obligacji', 'Emisja bonów pieniężnych w operacji podstawowej', 'Obniżenie stopy rezerwy obowiązkowej'], [1]],
        [5, 'Jaka forma integracji usuwa bariery wewnętrzne, lecz nie wprowadza wspólnej polityki handlowej wobec państw trzecich?', ['Unia celna', 'Strefa wolnego handlu', 'Unia walutowa', 'Specjalna strefa ekonomiczna'], [1]],
        [6, 'Które państwo opuściło mechanizm kursowy ERM po atakach spekulacyjnych na początku lat 90.?', ['Austria', 'Francja', 'Polska', 'Wielka Brytania'], [3]],
        [7, 'Co jest pierwotną przyczyną kryzysu walutowego pierwszej generacji?', ['Efekty stadne', 'Pokusa nadużycia inwestorów', 'Finansowanie Ponziego w sektorze prywatnym', 'Finansowanie deficytu przez bank centralny przy sztywnym kursie'], [3]],
        [8, 'Jak H. Minsky definiował finansowanie typu hedge?', ['Dochody pokrywają kapitał i odsetki zobowiązań', 'Dochody pokrywają tylko raty kapitałowe', 'Dochody pokrywają tylko odsetki', 'Dochody nie pokrywają ani kapitału, ani odsetek'], [0]],
        [9, 'Które zdanie o procedurze nadmiernego deficytu jest prawdziwe?', ['Uruchamia ją Parlament Europejski', 'Dotyczy wyłącznie deficytu strukturalnego poniżej 3% PKB', 'Zawieszono ją w okresie pandemii COVID-19', 'Dotyczy tylko pełnych członków unii walutowej'], [2]],
        [10, 'W gospodarce zamkniętej krańcowa skłonność do konsumpcji to 0,8, a stopa podatkowa 0,15. Ile wynosi mnożnik podatkowy?', ['−2,50', '−0,24', '0,29', '3,13'], [0]],
        [11, 'Które stwierdzenie jest zgodne z teorią płacy motywującej?', ['Bezrobocie ma zawsze charakter frykcyjny', 'Bezrobocie wynika wyłącznie z niedopasowań strukturalnych', 'Na rynku pracy występuje sztywność płac', 'Bezrobocie nigdy nie jest przymusowe'], [2]],
        [12, 'Kto bezpośrednio nadzoruje banki istotne w unii bankowej?', ['Europejski Bank Centralny', 'Krajowy organ nadzoru', 'Komisja Europejska', 'Bank Rozrachunków Międzynarodowych'], [0]],
        [13, 'Które swobody należą do podstawowych swobód przepływu w Unii Europejskiej?', ['Towarów', 'Usług', 'Kapitału', 'Ludzi'], [0, 1, 2, 3]],
        [14, 'Kto należał do autorów teorii optymalnych obszarów walutowych?', ['R. McKinnon', 'D. Ricardo', 'W. Bagehot', 'S. Gesell'], [0]],
        [15, 'Konsumpcja autonomiczna wynosi 200, a krańcowa skłonność do oszczędzania 0,2. Która funkcja konsumpcji jest poprawna?', ['C = 0,2 + 200Y', 'C = 200 + 0,2Y', 'C = 199,8 + 0,8Y', 'C = 200 + 0,8Y'], [3]]
      ]
    }
  ];

  window.OWE_EXTRA_QUESTIONS = editions.flatMap(({ edition, year, sourceUrl, questions }) => (
    questions.map(([number, question, options, correct]) => ({
      id: `${edition.toLowerCase()}-central-${number}`,
      edition,
      year,
      stage: 'central',
      stageLabel: 'Etap centralny',
      number,
      question,
      options,
      correct,
      sourceUrl
    }))
  ));
}());
