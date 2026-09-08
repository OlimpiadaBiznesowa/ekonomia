(function () {
  'use strict';

  const banks = [
    window.OWE_QUESTIONS,
    window.OWE_EXTRA_QUESTIONS,
    window.OWE_MISSING_QUESTIONS
  ].filter(Array.isArray);

  const normalize = value => String(value || '')
    .toLocaleLowerCase('pl-PL')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .replace(/\s+/g, ' ')
    .trim();

  const correctOptions = question => {
    const indices = Array.isArray(question.correct) ? question.correct : [question.correct];
    return indices.map(index => question.options[index]).filter(Boolean);
  };

  // Pytania wymagające obliczenia albo szczególnie precyzyjnego rozróżnienia
  // mają indywidualne objaśnienia zamiast dopasowania po słowie kluczowym.
  const questionExplanations = {
    'xxxviii-school-13': 'Wysoka mobilność pracowników ułatwia dostosowanie do szoków asymetrycznych, dlatego ogranicza koszt rezygnacji z własnego kursu walutowego.',
    'xxxvii-school-21': 'Minimalna skala efektywna to najmniejsza wielkość produkcji, przy której długookresowy przeciętny koszt całkowity osiąga minimum.',
    'xxxvi-district-9': 'Przy kwotowaniu EUR/USD klient sprzedający euro i kupujący dolary otrzymuje kurs bid. Korzystniejszy jest wyższy bid, czyli 1,0521 w banku A.',
    'xxxvi-district-22': 'Negatywny efekt zewnętrzny sprawia, że koszt społeczny jest wyższy od prywatnej podaży. Dlatego przykładowa krzywa kosztu społecznego leży wyżej: p = 2q + 18.',
    'xxxvi-district-2': 'Minsky wyróżniał trzy fazy podstawowego cyklu kryzysu finansowego: wzrost finansowania, narastanie niestabilności i kryzys.',
    'xxxvi-district-4': 'Cel inflacyjny w Polsce ustala Rada Polityki Pieniężnej jako organ NBP odpowiedzialny za założenia polityki pieniężnej.',
    'xxxv-district-1': 'NBP wprowadził kredyt wekslowy w reakcji na pandemię jako narzędzie refinansowania kredytów udzielanych przedsiębiorstwom.',
    'xxxv-central-1': 'Przy sztywnych cenach zmiana nominalnej stopy zmienia stopę realną w krótkim okresie, a przez nią konsumpcję i inwestycje.',
    'xxxv-central-10': 'Krzywa Engla pokazuje popyt w zależności od dochodu. Dla dobra niższego rzędu — a więc także dla dobra Giffena — po odpowiednio wysokim dochodzie może być nachylona ujemnie.',
    'xxxv-school-12': 'Dobro dostarczane przez monopol naturalny może być wykluczalne, lecz ze względu na duże moce sieci jego konsumpcja może pozostawać nierywalizacyjna.',
    'xxxviii-district-17': 'Jeżeli MC = AC dla każdej dodatniej produkcji, koszt przeciętny jest stały. Funkcja kosztu całkowitego jest wtedy liniowa i nie zawiera dodatniego kosztu stałego.',
    'xxxvii-district-7': 'W konkurencji monopolistycznej swoboda wejścia eliminuje w długim okresie zysk ekonomiczny, więc cena zrównuje się z przeciętnym kosztem całkowitym.',
    'xxxvii-district-8': 'Stałe przychody względem skali oznaczają niezmienny koszt na jednostkę przy zmianie skali, co przedstawia pozioma krzywa LRAC.',
    'xxxvii-district-16': 'W długim okresie wszystkie czynniki produkcji są zmienne, więc nie ma kosztu stałego. Dlatego AVC i ATC są sobie równe.',
    'xxxvi-central-8': 'Proporcja, w której konsumuje się dobra doskonale komplementarne, wyznacza położenie załamań krzywych obojętności oraz nachylenie ścieżki ekspansji dochodowej.',
    'xxxvi-central-14': 'Stale malejący przeciętny koszt całkowity oznacza korzyści skali w całym istotnym zakresie popytu — podstawową przyczynę monopolu naturalnego.',
    'xxxvi-district-20': 'Długookresowy koszt przeciętny pokazuje koszt jednostkowy dla różnych rozmiarów produkcji, gdy przedsiębiorstwo może zmieniać wszystkie czynniki.',
    'xxxviii-district-4': 'Najpierw Y = C + I + G, więc Y = 2200. Dochód rozporządzalny to Y − T = 1600, C = 1000, stąd oszczędności prywatne wynoszą 600, a publiczne T − G = 200.',
    'xxxvii-district-4': 'W równowadze Y = C + I + G, a C = 100 + 0,5(Y − 100). Po rozwiązaniu równania otrzymujemy Y = 1700.',
    'xxxvii-district-9': 'W modelu stałego wzrostu koszt kapitału własnego wynosi D₁/P₀ + g. Tutaj D₁ = 1 × 1,02, więc 1,02/10 + 2% = 12,20%.',
    'xxxvii-district-15': 'Krańcowa skłonność do oszczędzania jest dopełnieniem krańcowej skłonności do konsumpcji: MPS = 1 − MPC = 1 − 0,6 = 0,4.',
    'xxxvii-district-22': 'Całkowity koszt pracy to L × ACL = 2L² + 2000L. Pochodna po L daje krańcowy koszt pracy MCL = 4L + 2000.',
    'xxxvii-district-25': 'PKB nie sumuje kolejnych wartości sprzedaży, bo prowadziłoby to do podwójnego liczenia. Suma wartości dodanej jest równa wartości dobra finalnego, czyli 1 mln zł.',
    'xxxv-central-4': 'Po uwzględnieniu podatku równowaga daje q = 7. Cena płacona przez konsumenta rośnie z 20 do 24 zł, więc konsumenci ponoszą 7 × 4 zł = 28 zł.',
    'xxxv-central-6': 'Ponieważ Y = C + S, funkcja C jest równa Y − S. Dla S = −100 + 0,3Y otrzymujemy C = 100 + 0,7Y.',
    'xxxv-central-9': 'Mnożnik podatkowy przy podatku proporcjonalnym to −MPC/[1 − MPC(1 − t)]. Dla MPC = 0,8 i t = 0,25 wynosi −2,00.',
    'xxxv-central-14': 'W jednorodnym modelu Bertranda firmy konkurują ceną, dlatego równowaga występuje przy cenie równej kosztowi krańcowemu, czyli 30 zł.',
    'xxxvi-central-7': 'Przy stopie rezerwy 100% bank nie może zwielokrotniać depozytów. Prosty mnożnik pieniężny 1/rr wynosi więc 1.',
    'xxxvi-central-13': 'Cena równowagi to 60, a ilość 10. Nadwyżka konsumenta jest polem trójkąta: 1/2 × 10 × (100 − 60) = 200.',
    'xxxvii-central-2': 'Suma wartości dodanej odpowiada wartości sprzedaży dobra finalnego. Kopalnia tworzy 500 tys. zł, a jubiler kolejne 250 tys. zł, razem 750 tys. zł.',
    'xxxvii-central-5': 'Zysk ekonomiczny = utarg − koszty jawne − koszty ukryte. Stąd koszty ukryte = 2 mln − 0,6 mln − 1 mln = 0,4 mln zł.',
    'xxxvii-central-12': 'Z równania ilościowego MV = PY wynika V = nominalny PKB/M. Dwa biliony podzielone przez 500 mld dają szybkość obiegu równą 4.',
    'xxxviii-central-10': 'Mnożnik podatkowy to −MPC/[1 − MPC(1 − t)]. Po podstawieniu MPC = 0,8 i t = 0,15 otrzymujemy −2,50.',
    'xxxviii-central-15': 'Krańcowa skłonność do konsumpcji jest równa 1 − MPS = 0,8. Z konsumpcją autonomiczną 200 funkcja ma postać C = 200 + 0,8Y.',
    'xxxvii-school-1': 'Deflator PKB = nominalny PKB/realny PKB × 100. Zatem 120/100 × 100 = 120.',
    'xxxvii-school-6': 'Elastyczność podaży to procentowa zmiana ilości podzielona przez procentową zmianę ceny. Przy elastyczności 1,2 wzrost ceny o 1% zwiększa podaż o 1,2%.',
    'xxxvii-school-11': 'Koszt zmienny to 0,4q² + 50q, więc AVC = VC/q = 0,4q + 50. Dla q = 100 otrzymujemy 90.',
    'xxxvi-school-2': 'Dla liniowego popytu utarg krańcowy ma dwa razy większe nachylenie niż krzywa popytu i ten sam wyraz wolny. Z MR = −2q + 10 wynika p = −q + 10.',
    'xxxvi-school-15': 'Konsumpcja autonomiczna jest wyrazem wolnym funkcji konsumpcji, czyli częścią niezależną od dochodu. W równaniu C = 200 + 0,5Y wynosi 200.',
    'xxxvi-school-19': 'Konsumpcja spada o 2 z poziomu 10, czyli o 20%. Wartość bezwzględna elastyczności wynosi 20%/16% = 1,25.',
    'xxxvi-school-22': 'Jeden punkt bazowy to 0,01 punktu procentowego. Podwyżka o 25 punktów bazowych zwiększa stopę z 11,25% do 11,50%.',
    'xxxvi-school-26': 'Próg rentowności ilościowy to koszty stałe podzielone przez marżę jednostkową: 200 000/(150 − 100) = 4000 plecaków.',
    'xxxv-school-2': 'Do PKB trafia cała produkcja finalna: część sprzedana jako konsumpcja i niesprzedana część jako przyrost zapasów. Łącznie jest to 10 000 zł.',
    'xxxv-school-3': 'Zysk to ilość razy różnica między ceną a przeciętnym kosztem całkowitym. Ponieważ ATC = AVC + AFC, dla q = 100 mamy Z = 100(P − AVC − AFC).',
    'xxxv-school-4': 'Podaż branży jest poziomą sumą podaży 2000 firm. Z qₙ = (p − 100)/1000 wynika q = 2(p − 100), czyli p = 0,5q + 100.',
    'xxxv-school-6': 'W prostym modelu mnożnik inwestycyjny wynosi 1/(1 − MPC). Dla MPC = 0,75 jest to 1/0,25 = 4.',
    'xxxv-school-8': 'Spadek z 6,2% do 6% oznacza różnicę 0,2 punktu procentowego, a nie spadek o 0,2%.',
    'xxxv-school-9': 'Koszt stały to wyraz niezależny od produkcji, czyli 100. AFC = FC/q = 100/50 = 2.',
    'xxxv-school-10': 'W gospodarce bez państwa i zagranicy oszczędności są równe Y − C oraz inwestycjom. Zatem 1200 − 1000 = 200.',
    'xxxv-district-2': 'Ekonomiczna wielkość dostawy EOQ wynosi √(2DS/H). Po podstawieniu D = 10 000 kg, S = 500 zł i H = 10 zł otrzymujemy 1000 kg.',
    'xxxv-district-7': 'Firma w konkurencji doskonałej przyjmuje cenę rynkową. Dla q = 6 cena z popytu wynosi 36, zatem jej utarg krańcowy jest stały i równy 36.',
    'xxxv-district-11': 'Najpierw zrównujemy popyt i podaż pracy, co daje zatrudnienie 2 tys. osób i płacę 100. Przy tej płacy zasób siły roboczej wynosi 6 tys., więc bezrobocie to 4 tys.',
    'xxxv-district-14': 'Z tożsamości Y = C + I + G + NX otrzymujemy NX = 200. Odpływy kapitałowe netto są równe eksportowi netto, więc także wynoszą 200.',
    'xxxv-district-20': 'Przy niedoborze 7 różnica między popytem a podażą musi wynosić 7. Po podstawieniu obu funkcji otrzymujemy cenę maksymalną 20.',
    'xxxv-district-22': 'Linia Lorenza pod kątem 45° oznacza pełną równość dochodów. Dwa miliony zł podzielone przez 2000 gospodarstw daje 1000 zł na gospodarstwo.',
    'xxxv-district-23': 'Przy cenie 16 zł tylko kobiety zgłaszają dodatni popyt: q = 2. Popyt mężczyzn jest wtedy równy zero, więc łączny popyt wynosi 2.',
    'xxxvi-district-6': 'Z równania MV = PY szybkość obiegu to wartość transakcji podzielona przez ilość pieniądza: (10 000 × 4)/1000 = 40.',
    'xxxvi-district-7': 'Wydatki autonomiczne nie zależą od Y. Konsumpcja autonomiczna po uwzględnieniu podatku to 200 − 0,5 × 80 = 160; po dodaniu I = 400 i G = 100 otrzymujemy 660.',
    'xxxvi-district-17': 'W gospodarce bez państwa mnożnik inwestycyjny jest odwrotnością MPS. Dla MPS = 0,2 wynosi 1/0,2 = 5.',
    'xxxvi-district-18': 'Po zsumowaniu ograniczeń obu krajów otrzymujemy A + 2B = 15 000. Dla B = 4000 maksymalna łączna produkcja A wynosi 7000.',
    'xxxvi-district-30': 'MRP pracy to produkt krańcowy pracy razy utarg krańcowy produktu. Z Q = 4L mamy MPL = 4, a MR = 2000 − 4Q, stąd MRPᴸ = 8000 − 64L.'
  };

  const conceptRules = [
    [/dobr.*veblen|veblena/, 'Dobro Veblena jest dobrem prestiżowym, dla którego wysoka cena może sama zwiększać atrakcyjność i popyt.'],
    [/monopson/, 'Monopson oznacza rynek z jednym dominującym nabywcą, a nie z jednym sprzedawcą.'],
    [/dobr.*publiczn|obrona narodowa/, 'Dobro publiczne jest niewykluczalne i nierywalizacyjne: trudno wyłączyć kogokolwiek z obrony narodowej, a korzystanie jednej osoby nie ogranicza ochrony innych.'],
    [/zysk.*ekonomiczn|koszt.*alternatywn|koszt.*ukryt/, 'Zysk ekonomiczny uwzględnia zarówno koszty jawne, jak i koszt alternatywny zasobów należących do właściciela.'],
    [/analiz.*techniczn|\brsi\b/, 'Analiza techniczna bada przede wszystkim ceny i wolumen obrotu; RSI jest oscylatorem mierzącym tempo zmian cen.'],
    [/bilans.*platnicz/, 'Bilans płatniczy rejestruje transakcje rezydentów z zagranicą; saldo krajowego sektora finansów publicznych jest inną kategorią statystyczną.'],
    [/laffer/, 'Krzywa Laffera pokazuje, że po przekroczeniu pewnego poziomu dalsze podnoszenie stawek może zmniejszać podstawę opodatkowania i wpływy podatkowe.'],
    [/czynn.*zawod|bierna zawodowo|poza zasobem sily roboczej/, 'Do siły roboczej należą pracujący i bezrobotni aktywnie poszukujący pracy; osoby poza tymi grupami są bierne zawodowo.'],
    [/elastycznosc dochodow/, 'Dodatnia elastyczność dochodowa oznacza dobro normalne; dla dóbr luksusowych jest zwykle większa od jedności.'],
    [/nadwyzk.*handlow|deficyt handlow/, 'Eksport netto to różnica eksportu i importu. Dodatni eksport netto oznacza nadwyżkę handlową, a ujemny — deficyt.'],
    [/zdartych zel|zmieniania jadlospis/, 'Inflacja skłania do częstszych operacji gotówkowych i zmian cenników; stąd koszty „zdartych zelówek” i „zmieniania jadłospisów”.'],
    [/wspoln.*walut|optymaln.*obszar/, 'Mobilność pracy ułatwia dostosowanie do szoków asymetrycznych, dlatego zmniejsza koszt rezygnacji z własnego kursu walutowego.'],
    [/krzyz.*keynes/, 'W krzyżu keynesowskim równowaga występuje tam, gdzie planowane wydatki są równe produkcji, co przedstawia przecięcie z linią 45°.'],
    [/operacj.*otwartego rynku|bonow pienieznych|plynnosc sektora bankowego/, 'Operacje otwartego rynku zmieniają płynność banków: zakup lub wcześniejszy wykup papierów ją zwiększa, a emisja papierów banku centralnego może ją absorbować.'],
    [/cel.*inflacyj/, 'Cel inflacyjny NBP jest realizowany w średnim okresie, ponieważ polityka pieniężna oddziałuje na inflację z opóźnieniem.'],
    [/\bppi\b/, 'PPI mierzy zmiany cen uzyskiwanych przez producentów, dlatego jest jednym ze wskaźników dynamiki cen.'],
    [/problem.*agenc|opcje menedzerskie/, 'Opcje menedżerskie wiążą wynagrodzenie zarządzających z wartością spółki, co może zbliżać ich bodźce do interesu właścicieli.'],
    [/behawioraln|thaler/, 'Ekonomia behawioralna bada systematyczne odstępstwa decyzji od modelu pełnej racjonalności; Richard Thaler jest jednym z jej głównych przedstawicieli.'],
    [/\bcds\b/, 'Nabywca CDS kupuje ochronę przed zdarzeniem kredytowym i w zamian płaci sprzedawcy ochrony okresową premię.'],
    [/nadzor.*kapital|komisja nadzoru finansowego/, 'W Polsce nadzór nad rynkiem kapitałowym sprawuje Komisja Nadzoru Finansowego.'],
    [/deprecjac|aprecjac|eur\/usd/, 'Wzrost EUR/USD oznacza, że za euro płaci się więcej dolarów, czyli euro umacnia się, a dolar osłabia względem euro.'],
    [/biezac.*plynnosc/, 'Wskaźnik bieżącej płynności to aktywa obrotowe podzielone przez zobowiązania krótkoterminowe.'],
    [/kapital obrotowy netto/, 'Kapitał obrotowy netto jest różnicą między aktywami obrotowymi a zobowiązaniami krótkoterminowymi.'],
    [/cele.*taktycz|srednim szczeblu/, 'Cele taktyczne przekładają strategię organizacji na zadania średniego szczebla zarządzania.'],
    [/selektor.*ge/, 'Macierz GE jest techniką zarządzania portfelem działalności, oceniającą jednostki według atrakcyjności sektora i siły konkurencyjnej.'],
    [/typologi.*strategii.*porter|nisz.*rynk/, 'Strategia koncentracji Portera polega na obsłudze wybranego, wąskiego segmentu rynku.'],
    [/wielk.*piatk/, 'Wielka piątka obejmuje otwartość, sumienność, ekstrawersję, ugodowość i stabilność emocjonalną lub jej odwrotność — neurotyczność.'],
    [/komunikacj.*pionow/, 'Komunikacja pionowa przebiega w górę lub w dół hierarchii, czyli między przełożonymi a podwładnymi.'],
    [/\bpkb\b|produktu krajowego brutto|wartosc dodan/, 'PKB mierzy wartość dóbr i usług finalnych wytworzonych na terytorium kraju; można go też ująć jako sumę wartości dodanej.'],
    [/luka deflacyjn|luka popytow/, 'Ujemna luka popytowa oznacza produkcję poniżej potencjału i presję dezinflacyjną; dodatnia wiąże się z gospodarką powyżej potencjału.'],
    [/konkuren.*doskonal|doskonal.*konkuren/, 'W konkurencji doskonałej firma jest biorcą ceny, dlatego jej popyt jest poziomy, a przy optimum P = MR = MC.'],
    [/regul.*taylor|regula taylora/, 'Reguła Taylora wiąże stopę banku centralnego z odchyleniem inflacji od celu oraz luką popytową.'],
    [/bezroboci.*struktural|gornik|kwalifikacj/, 'Bezrobocie strukturalne wynika z niedopasowania kwalifikacji lub lokalizacji pracowników do dostępnych miejsc pracy.'],
    [/bezroboci.*frykcyjn|poszukiwan.*pracy|beveridge/, 'Lepsza informacja o ofertach skraca okres poszukiwania pracy, ograniczając bezrobocie frykcyjne i przesuwając krzywą Beveridge’a w lewo.'],
    [/naturaln.*bezroboc|nairu/, 'Naturalna stopa bezrobocia obejmuje głównie bezrobocie frykcyjne i strukturalne; NAIRU to stopa, przy której inflacja nie przyspiesza.'],
    [/krzywych kosztow calkowitych.*dlugiego okresu|dlugim okresie.*koszt zmienny|koszt staly.*dlugim okresie/, 'W długim okresie wszystkie nakłady są zmienne, więc nie występuje odrębny koszt stały; koszt całkowity nie ma wtedy stałego dodatniego składnika.'],
    [/ad valorem/, 'Podatek ad valorem jest procentem wartości sprzedaży, dlatego zmienia nachylenie krzywej podaży, a nie tylko jej położenie.'],
    [/obligacj.*zerokupon|papiery dyskontow/, 'Papier dyskontowy nie wypłaca kuponu; dochód inwestora wynika z różnicy między ceną zakupu a wartością wykupu.'],
    [/popyt.*pieniadz|transakcyjn.*ostroznosciow/, 'Keynes wyróżniał motyw transakcyjny, ostrożnościowy i spekulacyjny popytu na pieniądz.'],
    [/konkurencj.*monopolistyczn/, 'Konkurencja monopolistyczna łączy wielu sprzedawców i swobodę wejścia ze zróżnicowaniem produktów. W długim okresie wejście firm sprowadza zysk ekonomiczny do zera.'],
    [/minimaln.*skala efektywn/, 'Minimalna skala efektywna to najmniejsza produkcja, przy której długookresowy przeciętny koszt całkowity osiąga minimum.'],
    [/inwestycj.*brutto/, 'Inwestycje brutto obejmują zarówno odtworzenie zużytego kapitału, jak i przyrost zasobu kapitału rzeczowego.'],
    [/monopol.*naturaln/, 'Monopol naturalny powstaje przy silnych korzyściach skali i wysokich kosztach stałych, gdy jedna firma może obsłużyć rynek taniej niż kilka.'],
    [/monopolist.*maksymalizuje|utarg.*krancow|\bmr = mc\b/, 'Przedsiębiorstwo maksymalizujące zysk wybiera produkcję, dla której utarg krańcowy zrównuje się z kosztem krańcowym, o ile spełnione są warunki optimum.'],
    [/roznicowan.*cen|zbędn.*strat/, 'Doskonałe różnicowanie cen pozwala monopoliście sprzedać jednostki aż do punktu, w którym skłonność do zapłaty zrówna się z kosztem krańcowym, eliminując stratę dobrobytu.'],
    [/ilosciow.*teori|szybkosc obiegu|\bmv = py\b/, 'Równanie ilościowe ma postać MV = PY; w tradycyjnym ujęciu monetarystycznym szybkość obiegu V jest względnie stabilna.'],
    [/run na bank/, 'Run na bank to jednoczesna próba wycofania depozytów przez wielu klientów, która może wywołać problem płynności.'],
    [/giffena|efekt dochodow.*substytuc/, 'Efekt substytucyjny zawsze kieruje popyt przeciwnie do zmiany ceny. Dla dobra Giffena przeciwny efekt dochodowy jest na tyle silny, że odwraca zwykłą reakcję popytu.'],
    [/krzyw.*engla/, 'Krzywa Engla pokazuje zależność popytu na dobro od dochodu przy pozostałych warunkach niezmienionych.'],
    [/doskonale komplementarn/, 'Dobra doskonale komplementarne konsumuje się w stałej proporcji, dlatego ich krzywe obojętności mają kształt litery L.'],
    [/dobra.*substytuc|doskonale substytuc/, 'Dla doskonałych substytutów konsument wymienia dobra w stałej proporcji, więc krańcowa stopa substytucji jest stała.'],
    [/cournot|krzyw.*reakcji/, 'W modelu Cournota firmy wybierają ilości. Punkt przecięcia funkcji reakcji jest równowagą Nasha.'],
    [/coase/, 'Twierdzenie Coase’a mówi, że przy jasno określonych prawach własności i zerowych kosztach transakcyjnych strony mogą wynegocjować efektywny poziom efektu zewnętrznego.'],
    [/sekurytyzac|\babs\b/, 'Sekurytyzacja przekształca pulę aktywów generujących przepływy pieniężne w papiery wartościowe zabezpieczone tymi aktywami, czyli ABS.'],
    [/\breit\b/, 'REIT gromadzi kapitał inwestorów i lokuje go przede wszystkim w nieruchomości lub aktywa z nimi związane.'],
    [/rozpietosc kierowania/, 'Rozpiętość kierowania oznacza liczbę podwładnych podlegających bezpośrednio jednemu przełożonemu.'],
    [/blad aureoli/, 'Błąd aureoli polega na przenoszeniu oceny jednej wyrazistej cechy pracownika na ocenę innych cech.'],
    [/pieciu sil|sił konkurencji/, 'Model Portera obejmuje rywalizację, groźbę wejścia i substytutów oraz siłę przetargową dostawców i nabywców.'],
    [/is.?lm|krzyw.*\blm\b/, 'Krzywa LM przesuwa się w prawo przy łagodzeniu polityki pieniężnej, a w lewo przy jej zaostrzeniu.'],
    [/krzyw.*phillips/, 'W długim okresie krzywa Phillipsa jest pionowa przy naturalnej stopie bezrobocia; wyższe oczekiwania inflacyjne przesuwają krzywą krótkookresową w górę.'],
    [/autonomiczn/, 'Wydatki autonomiczne nie zależą od bieżącego dochodu; w funkcji są reprezentowane przez wyraz wolny.'],
    [/pnn|produkt narodowy netto/, 'Produkt narodowy netto otrzymuje się, odejmując amortyzację od produktu narodowego brutto.'],
    [/tips/, 'TIPS to obligacje skarbowe, których wartość nominalna jest indeksowana inflacją, co chroni realną wartość kapitału.'],
    [/zysk normaln/, 'Zysk normalny oznacza zerowy zysk ekonomiczny: przychód pokrywa wszystkie koszty jawne i ukryte, w tym koszt kapitału właściciela.'],
    [/krancow.*sklonnosci.*konsumpcji|krancow.*sklonnosci.*oszczedzania/, 'MPC pokazuje, jaka część dodatkowego dochodu trafia na konsumpcję, a MPS — na oszczędności; w prostym modelu MPC + MPS = 1.'],
    [/mnoznik.*inwestycyjn|mnożnik.*inwestycyjn/, 'W prostym modelu bez podatków mnożnik wydatkowy wynosi 1/(1 − MPC), czyli 1/MPS.'],
    [/podatek.*posredn/, 'Podatek pośredni jest pobierany przy zakupie dóbr lub usług; w Polsce przykładem jest VAT.'],
    [/\broa\b/, 'ROA to zysk netto podzielony przez aktywa. Gdy firma ponosi stratę netto, wskaźnik może być ujemny.'],
    [/\broe\b/, 'ROE mierzy relację zysku netto do kapitału własnego, czyli rentowność środków wniesionych przez właścicieli.'],
    [/akcj.*zwykl|waln.*zgromadzen/, 'Akcja zwykła daje prawa udziałowe, w tym co do zasady prawo głosu na walnym zgromadzeniu.'],
    [/hiperinflac/, 'W klasycznej definicji Cagana hiperinflacja zaczyna się po przekroczeniu 50% wzrostu cen miesięcznie.'],
    [/gini/, 'Wyższy współczynnik Giniego oznacza większą nierówność rozkładu dochodów lub majątku.'],
    [/szok.*podaz|ceny ropy/, 'Wzrost kosztu ważnego surowca ogranicza zagregowaną podaż i podnosi poziom cen, dlatego jest negatywnym szokiem podażowym.'],
    [/prog rentownosci/, 'W progu rentowności przychód całkowity pokrywa koszty całkowite, więc zysk jest równy zero.'],
    [/asymetri.*informac|pokus.*naduzyc/, 'Pokusa nadużycia występuje po zawarciu umowy, gdy jedna strona może podjąć niewidoczne działania kosztem drugiej.'],
    [/automatyczn.*stabilizator|progresywn.*podatek/, 'Automatyczny stabilizator łagodzi wahania bez nowej decyzji władz; progresywny podatek zmienia obciążenie wraz z dochodem.'],
    [/mieszan.*elastyczn|elastycznosc.*dobra.*innego/, 'Mieszana elastyczność cenowa mierzy procentową zmianę popytu na jedno dobro po zmianie ceny innego dobra; znak wskazuje substytuty lub komplementy.'],
    [/rynek.*pierwotn|nowo wyemitowan/, 'Na rynku pierwotnym papiery są sprzedawane po raz pierwszy przez emitenta; późniejszy obrót odbywa się na rynku wtórnym.'],
    [/kartel/, 'Kartel maksymalizujący łączny zysk zachowuje się jak monopol i wybiera łączną produkcję z warunku MR = MC.'],
    [/obligacj.*smieciow|ryzyko kredytowe/, 'Obligacje śmieciowe mają niską ocenę kredytową, dlatego oferują wyższą rentowność w zamian za wysokie ryzyko niewypłacalności.'],
    [/cena maksymaln|niedobor/, 'Wiążąca cena maksymalna leży poniżej ceny równowagi, przez co wielkość popytu przewyższa wielkość podaży i powstaje niedobór.'],
    [/credit crunch/, 'Credit crunch to ograniczenie podaży kredytu, które może wynikać ze wzrostu awersji banków do ryzyka nawet przy istniejącym popycie na finansowanie.'],
    [/pozyczkodawc.*ostatniej instancji|bagehot/, 'Zasada Bagehota zaleca pożyczanie wypłacalnym bankom pod dobre zabezpieczenie i po wysokiej stopie, aby ograniczać pokusę nadużycia.'],
    [/iluzj.*pieniez/, 'Iluzja pieniężna polega na kierowaniu się wartościami nominalnymi bez pełnego uwzględnienia zmian poziomu cen.'],
    [/realn.*podazy pieniadza/, 'Realna podaż pieniądza M/P pokazuje siłę nabywczą nominalnego zasobu pieniądza przy danym poziomie cen.'],
    [/neutraln.*pieniadz|oczekiwan.*wielkosci pienieznych/, 'Przy neutralności pieniądza przewidywalne zmiany nominalne nie zmieniają w długim okresie realnej produkcji ani zatrudnienia.'],
    [/tanzi|oliver/, 'Przy wysokiej inflacji opóźnienie między powstaniem zobowiązania a poborem podatku obniża realną wartość dochodów państwa.'],
    [/efekty zewnetrzn|koszt spoleczn/, 'Przy negatywnym efekcie zewnętrznym koszt społeczny przewyższa prywatny koszt podaży, dlatego leży wyżej.'],
    [/dlug.*publiczn|zadluzen.*panstw/, 'Nieoczekiwana inflacja obniża realną wartość długu o stałym nominalnym oprocentowaniu, przenosząc część kosztu na wierzycieli.'],
    [/regul.*taylor|inflacja.*cel/, 'Reguła Taylora zaleca wyższą stopę, gdy inflacja przekracza cel lub gdy dodatnia luka popytowa rośnie.'],
    [/krzyw.*dochodowosci/, 'Krzywa dochodowości łączy rentowność instrumentów dłużnych z terminem zapadalności i zawiera informacje o oczekiwaniach stóp procentowych.'],
    [/racjonaln.*oczekiwan|lucas/, 'W modelu racjonalnych oczekiwań przewidywana polityka zostaje uwzględniona w cenach i płacach; krótkookresowy skutek realny może wynikać z zaskoczenia.'],
    [/krzyw.*\bis\b/, 'Krzywa IS przedstawia kombinacje produkcji i stopy procentowej zapewniające równowagę na rynku dóbr.'],
    [/strefa wolnego handlu/, 'Strefa wolnego handlu usuwa bariery między członkami, ale każde państwo zachowuje własną politykę handlową wobec krajów trzecich.'],
    [/finansowanie.*hedge/, 'W finansowaniu hedge bieżące przepływy dłużnika wystarczają zarówno na odsetki, jak i spłatę kapitału.'],
    [/plac.*motywuj|sztywnosc plac/, 'Teoria płacy motywującej zakłada, że wyższa płaca może podnosić produktywność, więc firmy nie zawsze obniżają płace do poziomu równowagi.'],
    [/unie bankow|banki istotne/, 'W jednolitym mechanizmie nadzorczym EBC sprawuje bezpośredni nadzór nad bankami uznanymi za istotne.'],
    [/swobod.*przeplywu|towarow.*uslug.*kapitalu.*ludzi/, 'Jednolity rynek UE opiera się na swobodnym przepływie towarów, usług, kapitału i osób.'],
    [/cykl.*srodkow pienieznych|obrotu zapasow w dniach/, 'Cykl środków pieniężnych wydłuża się, gdy firma dłużej utrzymuje zapasy lub czeka na należności, a skraca się przy dłuższym okresie spłaty zobowiązań.'],
    [/keynesowsk.*reces|zwiekszyc poziom wydatkow publicznych|bezrobocia keynesowskiego/, 'W ujęciu keynesowskim wzrost wydatków publicznych zwiększa popyt zagregowany, ograniczając ujemną lukę popytową i bezrobocie wynikające z niedostatecznego popytu.'],
    [/friedman.*phelps|stopy bezrobocia naturalnego/, 'Friedman i Phelps wskazywali, że w długim okresie gospodarka wraca do naturalnej stopy bezrobocia, więc nie istnieje trwała wymienność inflacji na bezrobocie.'],
    [/zasad.*podatkow.*smith|rownomiernosc.*pewnosc/, 'Klasyczne zasady podatkowe Adama Smitha to równomierność, pewność, dogodność poboru i taniość poboru.'],
    [/statyczn.*oczekiwan/, 'Oczekiwania statyczne zakładają utrzymanie oczekiwanej inflacji na wcześniej przyjętym poziomie, a nie jej bieżące dostosowanie do zmian płac.'],
    [/srodki trwale w budowie/, '„Środki trwałe w budowie” są składnikiem aktywów wykazywanym w bilansie, a nie przychodem ani kosztem okresu.'],
    [/budzet panstwa.*uchwalany|\bsejm\b/, 'W Polsce budżet państwa jest uchwalany przez Sejm w formie ustawy budżetowej.'],
    [/kapital.*spoleczn.*fukuyama/, 'Francis Fukuyama upowszechnił znaczenie zaufania i norm współpracy jako kapitału społecznego wpływającego na funkcjonowanie gospodarki.'],
    [/mintzberg.*sygnalist|roli.*sygnalisty/, 'W klasyfikacji Mintzberga nie ma roli „sygnalisty”; role kierownicze dzielą się na interpersonalne, informacyjne i decyzyjne.'],
    [/cel.*operacyjn|ostatniego kwartalu/, 'Cel operacyjny dotyczy konkretnych, krótkookresowych działań wykonywanych na niższym szczeblu organizacji.'],
    [/pozorowania pracy|akordow.*system/, 'Akord wiąże wynagrodzenie z wielkością wykonanej pracy, dlatego Taylor traktował go jako sposób ograniczenia celowego spowalniania pracy.'],
    [/postaw.*obronn.*zobowiazan spolecznych/, 'Postawa obronna oznacza spełnianie wymogów prawa bez dobrowolnego rozszerzania odpowiedzialności społecznej.'],
    [/gilbreth|wykres gantta|naukowego zarzadzania|teoria x/, 'Naukowe zarządzanie koncentrowało się na analizie i standaryzacji pracy; z tym nurtem wiążą się m.in. Gilbrethowie, Taylor i wykres Gantta.'],
    [/stala stopa procentowa.*ryzyko/, 'Przy kredycie o stałej stopie bank ponosi ryzyko, że rynkowe stopy wzrosną, podczas gdy oprocentowanie udzielonego kredytu pozostanie bez zmian.'],
    [/cykl.*kitchin/, 'Cykl Kitchina jest krótkim cyklem koniunkturalnym, zwykle wiązanym z wahaniami zapasów; jest krótszy od cykli Juglara i Kondratiewa.'],
    [/sprzedaz obligacji.*rentownosci|wyprzedaz.*obligacji/, 'Cena obligacji i jej rentowność zmieniają się w przeciwnych kierunkach. Odpływ kapitału zwiększa podaż waluty krajowej, wywierając presję na jej osłabienie.'],
    [/podniesienia stopy procentowej.*dlugu|kosztow obslugi dlugu/, 'Wyższe stopy rynkowe podnoszą koszt refinansowania długu i oprocentowanie nowo emitowanych papierów skarbowych.'],
    [/friedman.*przyczyna inflacji|tempo wzrostu podazy pieniadza/, 'W ujęciu monetarystycznym trwała inflacja wynika z podaży pieniądza rosnącej szybciej niż realna produkcja.'],
    [/gilts|potrzeb pozyczkowych rzadu/, 'Zapowiedź obniżek podatków bez wskazania finansowania zwiększa oczekiwane potrzeby pożyczkowe państwa, co może obniżyć ceny obligacji i podnieść ich rentowność.'],
    [/pierwszy szok.*naftow/, 'Pierwszy kryzys naftowy rozpoczął się w 1973 r., czyli na początku lat 70. XX wieku.'],
    [/pierwotnego deficytu|nominalnego.*deficytu/, 'Deficyt pierwotny pomija koszty obsługi długu, a deficyt nominalny je obejmuje; wyższe odsetki powiększają więc różnicę między nimi.'],
    [/kola od wozu/, 'W sieci „koła od wozu” cała komunikacja przechodzi przez osobę centralną, dlatego jest to układ najsilniej scentralizowany.'],
    [/dywersyfikacji niezaleznej/, 'Dywersyfikacja niezależna polega na prowadzeniu działalności w niepowiązanych branżach lub jednostkach operacyjnych.'],
    [/regulatorzy.*otoczenia zadaniowego/, 'Regulatorzy bezpośrednio oddziałują na zasady działania organizacji, dlatego należą do jej otoczenia zadaniowego.'],
    [/krotkim okresie.*nowej linii produkcyjnej/, 'W krótkim okresie co najmniej jeden czynnik produkcji jest stały; stworzenie nowej linii produkcyjnej wymaga zmiany zasobu kapitału, więc jest decyzją długookresową.'],
    [/dochodu permanentnego/, 'Hipotezę dochodu permanentnego sformułował Milton Friedman; konsumpcja zależy w niej głównie od oczekiwanego dochodu długookresowego.'],
    [/deflacj.*dlugu/, 'Przy spadku poziomu cen nominalna kwota długu się nie zmienia, lecz rośnie jej realna wartość i ciężar spłaty.'],
    [/akcept bankowy/, 'Akcept bankowy jest wekslem zaakceptowanym przez bank, który zobowiązuje się zapłacić wskazaną kwotę w terminie.'],
    [/kanalu kursowego|otwartosci handlowej/, 'W bardziej otwartej gospodarce zmiana kursu silniej wpływa na eksport netto i ceny importu, wzmacniając kanał kursowy polityki pieniężnej.'],
    [/dobr.*normaln.*luksusowe/, 'Dobra luksusowe są podkategorią dóbr normalnych: wraz ze wzrostem dochodu popyt na nie rośnie więcej niż proporcjonalnie.'],
    [/wspolnoty wegla i stali|plan schumana/, 'Plan Schumana z 1950 r. zaproponował wspólne zarządzanie produkcją węgla i stali i stał się podstawą EWWiS.'],
    [/euro.*1999|obiegu bezgotowkowego/, 'Euro rozpoczęło funkcjonowanie bezgotówkowe w 1999 r. w 11 państwach, a banknoty i monety weszły do obiegu w 2002 r. w 12 państwach.'],
    [/kryterium konwergencji.*stop procentowych/, 'Wartość referencyjna długoterminowych stóp w kryteriach z Maastricht jest wyznaczana względem państw UE o najbardziej stabilnych cenach.'],
    [/zagregowanego popytu.*eksport/, 'Spadek eksportu netto zmniejsza zagregowany popyt przy każdym poziomie cen, dlatego przesuwa krzywą AD w dół lub w lewo.'],
    [/subsydi|subwencj/, 'Stała dopłata do jednostki obniża koszt krańcowy producenta, dlatego przesuwa krzywą podaży w prawo lub w dół.'],
    [/nowa keynesowska.*zagregowanej podazy/, 'Nowokeynesowska podaż jest rosnąca przy niewykorzystanych zasobach, ale przy produkcji pełnego zatrudnienia staje się pionowa.'],
    [/konglomerat.*wielowydzialow|grupowaniu.*wedlug wyrobu|struktura konglomeratowa.*wedlug wyrobu/, 'Struktury wielowydziałowe i konglomeratowe grupują działalność wokół produktów lub jednostek biznesowych, którym można przypisać wyniki.'],
    [/rozwiazywaniu konfliktu|przeciwdzialajacej zakloceniom/, 'Rozwiązywanie nieoczekiwanych konfliktów należy u Mintzberga do decyzyjnej roli osoby przeciwdziałającej zakłóceniom.'],
    [/kontrola biurokratyczna/, 'Kontrola biurokratyczna opiera się na formalnych regułach, procedurach, uprawnieniach i wyraźnej hierarchii.'],
    [/charyzmatycznego przywodztwa|\br\. house\b/, 'Robert House rozwinął teorię charyzmatycznego przywództwa, akcentując wpływ zachowań lidera na zaangażowanie podwładnych.'],
    [/zlota zasada bilansowa/, 'Złota zasada bilansowa zakłada finansowanie majątku trwałego kapitałem własnym, czyli źródłem pozostającym w firmie bezterminowo.'],
    [/wzrost dochodu.*linii ograniczenia budzetowego|linia budzetowa.*wzrost dochodu/, 'Wzrost dochodu przy niezmienionych cenach przesuwa linię budżetową równolegle na zewnątrz.'],
    [/pasywow banku centralnego|pieniadz w obiegu.*pasywow/, 'Gotówka w obiegu jest zobowiązaniem banku centralnego wobec jej posiadaczy, dlatego znajduje się po stronie pasywów bilansu.'],
    [/altcoin|ethereum/, 'Altcoin to kryptowaluta inna niż bitcoin; ethereum spełnia tę definicję.'],
    [/krańcowa stopa technicznej|krancowa stopa technicznej|mrts/, 'MRTS pokazuje, o ile można zmniejszyć nakład jednego czynnika po zwiększeniu drugiego, zachowując tę samą produkcję.'],
    [/aureoli/, 'Błąd aureoli polega na przenoszeniu oceny jednej wyrazistej cechy pracownika na ocenę innych cech.'],
    [/keiretsu/, 'Keiretsu to japońskie grupy przedsiębiorstw powiązanych długoterminowymi relacjami biznesowymi i często kapitałowymi.'],
    [/short strangle/, 'Short strangle polega na wystawieniu opcji call i put z różnymi cenami wykonania; strategia korzysta na niewielkiej zmienności, lecz ma wysokie ryzyko.'],
    [/podatek pit.*najbardziej wydajne|zrodel dochodow budzetu/, 'W odniesieniu do danych i kategorii przyjętych w tym arkuszu największe wpływy spośród podanych wariantów zapewniał PIT.'],
    [/private equity/, 'Fundusze private equity inwestują poza rynkiem publicznym, zwykle obejmując udziały w spółkach o potencjale wzrostu i podwyższonym ryzyku.'],
    [/dwumianowy model wyceny opcji|cox.*ross.*rubinstein/, 'Dwumianowy model wyceny opcji opracowali John Cox, Stephen Ross i Mark Rubinstein.'],
    [/neutralnosci podatkowej|d\. ricarda/, 'Z koncepcją neutralności podatkowej wiąże się David Ricardo; neutralny podatek nie powinien zniekształcać decyzji gospodarczych.'],
    [/musgrave|funkcji finansow publicznych/, 'Musgrave wyróżniał alokacyjną, redystrybucyjną i stabilizacyjną funkcję finansów publicznych.'],
    [/maksymalna stopa depozytowa|instrumentami pozacenowymi/, 'Pułap oprocentowania ogranicza konkurencję cenową banków, dlatego mogą silniej rywalizować jakością, wygodą i innymi cechami oferty.'],
    [/zmiana relacji cen dwoch dobr|efekt substytucyjny/, 'Efekt substytucyjny jest zmianą wyboru wynikającą ze zmiany relacji cen, przy oddzieleniu wpływu zmiany siły nabywczej.'],
    [/stopy lombardow.*depozytow|dotyczace narodowego banku polskiego/, 'W standardowym korytarzu stóp NBP stopa lombardowa jest powyżej referencyjnej, a depozytowa poniżej niej; gotówka w obiegu jest pasywem NBP.'],
    [/pokrycia dlugu nadwyzka finansowa/, 'Niższe odsetki zwiększają nadwyżkę finansową dostępną na obsługę i spłatę długu, podnosząc wskaźnik jego pokrycia.'],
    [/adaptacyjny charakter oczekiwan inflacyjnych/, 'Oczekiwania adaptacyjne są korygowane na podstawie wcześniejszych błędów inflacyjnych; mechanizm ten akcentował Milton Friedman.'],
    [/zlamanie linii ograniczenia budzetowego/, 'Bon przeznaczony tylko na jedno dobro zmienia możliwości zakupowe nierównomiernie, dlatego zamiast równoległej linii może powstać załamanie.'],
    [/pomostowy kapital spoleczny/, 'Pomostowy kapitał społeczny tworzy więzi między osobami lub grupami wcześniej niepowiązanymi, poszerzając dostęp do informacji i współpracy.'],
    [/podatek.*tobina|transakcji walutowych/, 'Podatek Tobina zaproponowano jako niewielką daninę od transakcji walutowych, mającą ograniczać krótkoterminową spekulację.'],
    [/greenspana.*guidottiego/, 'Reguła Greenspana–Guidottiego zaleca rezerwy walutowe wystarczające do pokrycia zagranicznego zadłużenia krótkoterminowego.'],
    [/7-dniowe bony nbp.*przetarg/, 'Bony pieniężne NBP w podstawowych operacjach są oferowane bankom na przetargach, a ich termin w badanym okresie wynosił 7 dni.'],
    [/mechanizm kursowy erm|wielka brytania/, 'Wielka Brytania opuściła ERM we wrześniu 1992 r. po presji spekulacyjnej na funta, w wydarzeniu znanym jako Czarna Środa.'],
    [/kryzysu walutowego pierwszej generacji/, 'Model pierwszej generacji wiąże kryzys ze sprzecznością między stałym kursem a finansowaniem deficytu emisją pieniądza, która wyczerpuje rezerwy.'],
    [/procedur.*nadmiernego deficytu/, 'W czasie pandemii uruchomiono ogólną klauzulę wyjścia, co czasowo zawiesiło zwykłe wymogi fiskalne i procedurę w opisywanym zakresie.'],
    [/uzytecznosci calkowitej/, 'Użyteczność całkowita to łączne zadowolenie z konsumpcji danej ilości dobra; użyteczność krańcowa opisuje przyrost po dodatkowej jednostce.'],
    [/prowadzenie polityki pienieznej w polsce|rada polityki pienieznej/, 'Rada Polityki Pieniężnej ustala założenia polityki pieniężnej i podstawowe stopy NBP, a NBP realizuje jej decyzje.'],
    [/pasywow przedsiebiorstwa|rezerwy na zobowiazania/, 'Rezerwy na zobowiązania przedstawiają prawdopodobne przyszłe obowiązki jednostki, dlatego są wykazywane po stronie pasywów.'],
    [/splitu akcji/, 'Split zwiększa liczbę akcji i proporcjonalnie obniża cenę jednej akcji bez zmiany łącznej wartości spółki; może poprawić płynność obrotu.'],
    [/bilansie.*rachunku zyskow i strat|zysk.*strata.*netto/, 'Wynik netto powstaje w rachunku zysków i strat, a po zamknięciu okresu jest również wykazywany w kapitale własnym bilansu.'],
    [/catalyst/, 'Catalyst jest rynkiem obrotu instrumentami dłużnymi, a nie indeksem giełdowym.'],
    [/markowitz|teorii portfela/, 'Harry Markowitz stworzył nowoczesną teorię portfela, pokazując znaczenie dywersyfikacji oraz relacji oczekiwanej stopy zwrotu do ryzyka.'],
    [/analiz.*swot/, 'SWOT porządkuje wewnętrzne mocne i słabe strony oraz zewnętrzne szanse i zagrożenia.'],
    [/funkcj.*zarzadzania|planowanie.*organizowanie.*kontrolowanie/, 'Do podstawowych funkcji zarządzania należą planowanie i decyzje, organizowanie, przewodzenie oraz kontrolowanie.'],
    [/czwarta rewolucj.*przemysl/, 'Czwarta rewolucja przemysłowa wiąże technologie cyfrowe, automatyzację, dane i systemy cyberfizyczne.'],
    [/maslow|potrzeby fizjologiczne/, 'W hierarchii Maslowa podstawę stanowią potrzeby fizjologiczne; wyższe potrzeby pojawiają się ponad nimi.'],
    [/kredytu wekslowego/, 'Kredyt wekslowy NBP uruchomiono w reakcji na pandemię jako narzędzie refinansowania kredytów udzielanych przedsiębiorstwom.'],
    [/bezrobocia.*keynesowskiego/, 'Bezrobocie keynesowskie wynika z niedostatecznego popytu zagregowanego, dlatego ekspansywna polityka fiskalna może je ograniczać.'],
    [/zagregowanego popytu.*bardziej plaska/, 'Większe „wycieki” z obiegu dochodu — oszczędności i import — oraz mniejsza skłonność do konsumpcji obniżają mnożnik, przez co krzywa zagregowanego popytu jest bardziej płaska.'],
    [/elastycznosci podazy.*wzrost ceny/, 'Elastyczność podaży jest ilorazem procentowej zmiany ilości oferowanej i procentowej zmiany ceny; wartość 2 oznacza reakcję ilości dwukrotnie większą od zmiany ceny.'],
    [/indeksem sektorowym|wig-nieruchomosci/, 'Indeks sektorowy śledzi spółki z jednej branży; WIG‑nieruchomości obejmuje segment nieruchomości notowany na GPW.'],
    [/postepu technicznego.*obnizenia stopy procentowej/, 'Postęp techniczny zwiększa podaż i obniża presję cenową; ekspansja pieniężna może podtrzymać popyt tak, aby poziom cen pozostał bez zmian.'],
    [/hipotezy rynkow efektywnych|\be\. fama\b/, 'Hipotezę rynków efektywnych sformułował Eugene Fama; zakłada ona szybkie odzwierciedlanie dostępnej informacji w cenach aktywów.'],
    [/strategi.*dominujac|wykorzystanie reklamy/, 'Strategia dominująca daje graczowi lepszy wynik niezależnie od decyzji rywala; z podanej macierzy wypłat taką strategią jest reklama.'],
    [/listy zastawne/, 'List zastawny jest długoterminowym papierem dłużnym zabezpieczonym określoną pulą wierzytelności, dlatego należy do instrumentów rynku kapitałowego.'],
    [/modelu capm|w\. sharpe/, 'William Sharpe należał do twórców CAPM, który wiąże oczekiwaną stopę zwrotu aktywa z jego ryzykiem systematycznym.'],
    [/rewolucji marginalistycznej|l\. walras/, 'Léon Walras był jednym z twórców rewolucji marginalistycznej i teorii równowagi ogólnej.'],
    [/czynnych rozliczen miedzyokresowych/, 'Czynne rozliczenia międzyokresowe przesuwają koszt na okres, w którym powstają odpowiadające mu przychody, realizując zasadę współmierności.'],
    [/vrooma.*yettona.*jago/, 'Model Vrooma–Yettona–Jago dobiera stopień udziału podwładnych w podejmowaniu decyzji do cech sytuacji.'],
    [/najmniej preferowanego wspolpracownika/, 'Teoria najmniej preferowanego współpracownika Fiedlera jest teorią sytuacyjną: skuteczność stylu lidera zależy od warunków sytuacji.'],
    [/klasycznego podejscia do zarzadzania/, 'Klasyczne podejście opiera się na formalizacji i stabilnych zależnościach, dlatego lepiej pasuje do otoczenia prostego i mało zmiennego.'],
    [/parker follett|behawiorystycznego podejscia/, 'Mary Parker Follett podkreślała znaczenie ludzi, współpracy i rozwiązywania konfliktów, zapowiadając podejście behawioralne.'],
    [/drenazu mozgow/, 'Drenaż mózgów oznacza odpływ wysoko wykwalifikowanych pracowników, zwykle z krajów słabiej do lepiej rozwiniętych.'],
    [/nieformalnych kontraktow|awersja do ryzyka pracownikow/, 'Teoria nieformalnych kontraktów zakłada m.in., że bardziej awersyjni do ryzyka pracownicy akceptują stabilniejszą płacę, a firma przejmuje część ryzyka wahań.'],
    [/ceny dobr.*dochód konsumenta.*tej samej proporcji|ceny dobr.*dochod konsumenta.*tej samej proporcji/, 'Jednakowy procentowy wzrost wszystkich cen i dochodu nie zmienia realnego zbioru możliwości konsumenta, więc optimum pozostaje w tym samym miejscu.'],
    [/kategoria.*podazy pieniadza.*m3|\bm3\b/, 'M3 jest szerokim agregatem pieniężnym obejmującym M2 oraz wybrane krótkoterminowe instrumenty rynkowe.'],
    [/rynku pienieznego.*bony skarbowe/, 'Bony skarbowe są krótkoterminowymi papierami dłużnymi, dlatego zalicza się je do instrumentów rynku pieniężnego.'],
    [/ciaglej skali zachowan przywodczych/, 'Ciągła skala Tannenbauma i Schmidta opisuje siedem wariantów od przywództwa zorientowanego na szefa do zorientowanego na podwładnych.'],
    [/j\.d\. thompsona|stopien zmiennosci.*jednorodnosci/, 'Thompson opisywał otoczenie przez stopień zmienności oraz jednorodności, co pozwala ocenić jego niepewność.'],
    [/j\. woodward|form techniki przeksztalcania/, 'Woodward wyróżniła trzy podstawowe technologie produkcji: jednostkową lub małoseryjną, masową lub wielkoseryjną oraz proces ciągły.'],
    [/m\. webera|model biurokratyczny/, 'Model biurokratyczny Webera opiera się na formalnych zasadach, hierarchii, specjalizacji i bezosobowym wykonywaniu ról.'],
    [/osobowosc typu a|poswieceniem sie pracy/, 'Typ A cechuje silniejsza presja czasu, rywalizacja i zaangażowanie w pracę niż typ B.']
  ];

  function fallbackExplanation(question, answers) {
    const joined = answers.join('; ');
    const text = normalize(question.question);
    if (/^(kto|kogo)|autorem|tworca|przedstawicielem|zaproponowal|sformulowana przez/.test(text)) {
      return `Poprawne przyporządkowanie autora lub twórcy do koncepcji z pytania to: ${joined}.`;
    }
    if (/oblicz|wyznacz|ile |wartosc|wynos/.test(text)) {
      return `Po zastosowaniu zależności wskazanej w treści otrzymujemy: ${joined}.`;
    }
    if (answers.length > 1) {
      return `Kompletna odpowiedź wymaga łącznego wskazania tych wariantów: ${joined}.`;
    }
    if (/\bnie\b|nie ma|nie jest|nie znajdziemy/.test(text)) {
      return `Ten wariant nie spełnia warunku lub nie należy do kategorii opisanej w pytaniu: ${joined}.`;
    }
    return `Poprawny wariant wyraża właściwą definicję lub zależność: ${joined}.`;
  }

  function explanationFor(question) {
    if (questionExplanations[question.id]) return questionExplanations[question.id];
    const answers = correctOptions(question);
    const searchable = normalize(`${question.question} ${answers.join(' ')}`);
    const rule = conceptRules.find(([pattern]) => pattern.test(searchable));
    return rule ? rule[1] : fallbackExplanation(question, answers);
  }

  let total = 0;
  let tailored = 0;
  for (const bank of banks) {
    for (const question of bank) {
      question.explanation = explanationFor(question);
      total += 1;
      const searchable = normalize(`${question.question} ${correctOptions(question).join(' ')}`);
      if (questionExplanations[question.id] || conceptRules.some(([pattern]) => pattern.test(searchable))) tailored += 1;
    }
  }

  window.OWE_EXPLANATION_AUDIT = Object.freeze({
    total,
    tailored,
    sources: Object.freeze([
      'Oficjalne klucze odpowiedzi Polskiego Towarzystwa Ekonomicznego',
      'OpenStax Principles of Economics 3e',
      'Główny Urząd Statystyczny — definicje statystyki publicznej',
      'Komisja Nadzoru Finansowego — materiały edukacyjne'
    ])
  });
})();
