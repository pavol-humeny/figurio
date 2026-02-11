# Figurio

## Parts
- Magnify area
- Blur tool 
- Select tool
- Shape tool 
- Noise correction
- brush tool 

## TODO - text 
- dorobiť wireframe a dať to do návrhu
- prerobiť snímky obrazovky kde je VUE logo na spodku 
- dopísať nástroje 
- úvod 
- záver

# TODO
- Natočiť videá

- Štetec
    - premyslieť ten štetec a pixeláciu 
    - 1px štetec by mal vyplnat 1px 
    - doriešiť export kresleného overlay
    - brush - tvar (kruh a štvorec, čiara horizontálna/vertikálna)
- resetovanie obrázku do pôvodného stavu
- Resize a crop nastaviť tak aby rešpektovali minimálne a maximálne rozmery v presete

- opraviť shape 
- opraviť magnify area 

- blur
    - opraviť blur 
    - Opravit paste blur objektu 

- Select
    - opraviť select
    - pri posune viacerých objektov, následnom položení a opätovnom presune to nechce ísť a sekne to 

- pri výbere z dropdown menu to neskryje tip 

## TODO 
- Vylepšenie rámiku pre prehliadače 
- Paste by to mohol klásť inde ako na ten istý objekt, aspoň pri kliknutí pravím 
- undo redo možno nejako zakázať pri aby sa to nedalo kliknúť viac krát do vtedy kým sa neaplikuje operácia 

## Dlhodobé TODO 
- eye dropper na safari
- Globálne úpravy (rasterizácia)
- BG removal - ukladanie do undo redo operácií pri výbere 
- Poskakovanie pri resize ak je to otočené (svg objekty)
- Poloha magnify area a blur object voči ostatným objektom (možné riešenie vrstvy)
- možnosť všetko exportovať naraz do zip
- PDF s nepodporovanými svg objektami 
- prevod pdf na raster ak to obsahuje hlúposti 
- Zjednodušiť toasty
- pridať nástroj fill (kýbel)
- pridať nástroj pre nastavenie priehľadnosti obrázka
- Možno nejako vylepšiť vysvetlenie grayscale
- Pozrieť sa na spoplatnenie - maximálny počet exportov, by me coffee

## Insane ideas
- aplikovanie operácie na všetky obrázky 
- Premenné prostredia (pre farbu, veľkosť)
- Vrstvy 
- Možnosť si uložiť aktuálnu prácu 
- Nástroj na kreslenie (štetce)
- Split screen pre viac obrázkov 
- v inpute by to čísla mohlo počítať 
- Možnosť vytvoriť si prázdny projekt a vkladať tam obrázky

## Nepreukázalo sa 
- NEPREUKÁZALO SA - pri prepnutí z color na manual select sa nezapne spravny kurzor
- NEPREUKÁZALO SA - error pri zatvorení viacerých súborov
- NEPREUKÁZALO SA - nakreslím niečo, pridám shape, a dám rasterize tak to zmizne - rastererize zožuje brush 
- NEPREUKÁZALO SA - nakreslenie svg objektu, prepnutie na brush (vyžaduje rasterizáciu) a následné spätné prepnutie na shape (stále to chcelo rasterizovať)

## Ťažko povedať čo s tým 
- SKIP - (asi to je v pohode tak ako to je) zoomovanie pomocou tlacitok, ak je obrazok mimo stred tak to zoomuje mimo obrázok 


## TODO od J (userTesting2 - 12.1.2026)
- FIXED - Zoom pomocou numerickej klávesnice
- FIXED - fyzický mód možno iná ikona 
- FIXED - vyznačený text v light mode by mohol byť biely 
- FIXED - pixelation mode - light mode je strašne málo rozdielny od bg color 
- SKIP - ikony v kontrast mode switcheri sú nejasné 
- FIXED - pri pdf by pixelácia mohla byť len disabled a nie hidden + tip disabled 
- FIXED - noise detection - aj ked je to uz zobrazene tak sa to prepocita 
- FIXED - neobmedzena velkost pri pdf suboroch 
- FIXED - pri manipulácii s obrázkom to zobrazuje najskôr pozadie (kocky) a až potom sa to aplikuje na obrazok 
- FIXED - crop 
    - FIXED - hide crop - pri pustení mimo to neprepne 
    - SKIP - orezanie na rôznych citlivostiach - mohlo by to orezavat hned 
    - FIXED - manualna úprava - mohol by to byť input 
    - FIXED - aplikovanie orezania - centrovať 
- bg removal 
    - neintuitívne klávesové skratky 
    - zrušit výber pri držaní shift po kliknutí na nieco co uz je vybrane 
    - mohla by sa ukladať história pri výbere 
    - FIXED - color - pri výbere farby hned vybrat oblast,nie az po kliknutí na tlacidlo 
- FIXED - klik + posun mysi na ikone by mohlo menit hodnotu (figma style)
- shape - rozbité 
    - divne funguje výber objektu
    - pri kliknutí to hned vytvorí nový objekt namiesto výberu 
- SKIP - text - málo fontov 
- SKIP - blur - čakala blur pomocou štetca/kreslenia
- mg area - pridáva sa nový objekt pri kliknutí namiesto výberu 
- FIXED - resize - hneď to aplikovať nie len resetovať hodnoty 


## TODO od SA (userTesting2 - 18.1.2026)
- FIXED - pohyb pomocou L mouse + deselect nástroja 
- FIXED - command + zoom pre priblíženie na macu 
- FIXED - Premenovanie súboru by nemuselo dávať toast
- FIXED - Bočný panel by mohol mať výraznejšiu šípku 
- FIXED - bočný panel by sa mohol zatvárať len šípkou a nie celým rozmerom tlacidla 
- FIXED - manuálna úprava rozmerov pri crop dá error 
- FIXED - skrytie rámiku pomocou hold - použiť tlačidlo a nie toggle 
- TODO - Frame tool - vylepšiť rámiky okien
- FIXED - BG removal 
    - SKIP - vybrať odstránené je neintuitívne 
    - FIXED - text - nahradiť pozadie zmeniť na nahradiť výber 
- SKIP - pridať nástroj fill (kýbel)
- SKIP - zoznam objektov (svg list) by mohol zobraziť krížik pre zmazanie už pri hover, bez nutnosti selectu 
- shape 
    - FIXED - kreslenie hned s obrysom alebo kreslenie len obrysu a možnosť vyplniť 
    - FIXED - pri zrušení výplne automaticky prepnúť na hrúbku rámiku a nie vyžadovať od užívateľa 
- text 
    - FIXED - enter to vloží na stred 
    - FIXED - pri zmazaní to odstráni objekt - malo by to spraviť až pri on blur 
- FIXED - mazanie objektu pomocou backspace nie len delete (mac nemá delete)
- FIXED - z index polohu zobrazovať len 2 tlačidlá ak sú len 2 objekty, žiadne ak je len jeden 
- FIXED - pri prepínaní okien to nedrží zoom 
- FIXED - tab sa nedá posunúť úplne doprava 
- TODO - MG - zoomuje len podklad a nie aj objekty 
- TODO - select - ak sa vyberie mg tak to zostane na tom nástroji a neprepne sa to späť na select 
- FIXED - feature tour - prerobenie krížika 

## User testing changes 
- Nezobrazovať toast o úspešnom nahratí súboru - predsa to je jasné že sa nahral 
- FIXED - Premenovanie súboru by nemuselo dávať toast
- FIXED - z index polohu zobrazovať len 2 tlačidlá ak sú len 2 objekty, žiadne ak je len jeden 
- FIXED - pri zrušení výplne automaticky prepnúť na hrúbku rámiku a nie vyžadovať od užívateľa 
- FIXED - Zoom pomocou numerickej klávesnice - povodne tam bola ikona pravitka, co evokovalo zapnutie pravítok v editore 

## API
### addUserEvent()
Event type:
- toggleTool
    - tool
    - tab
- uploadImage
    - fileFormat
    - fileName
    - fileSize
    - fileWidth
    - fileHeight
- exportImage
    - fileFormat
    - fileName
    - fileWidth
    - fileHeight
    - quality
- renameFile
    - newName
- settingsChange 
    - setting
    - value
- zoomModeToggle
    - zoomMode
- contrastModeChanged
    - mode
- pixelateModeChanged
    - mode
- closeFile
    - multipleFileClose
- openModal
    - modal
- applyOperation
    - tool
    - settings
- keyboardShortcuts
    - action
    - keys
- buttonClicked
    - button
- submitContactForm
    - contactForm
- adminMode
    - contactForm
- expertMode
    - contactForm
- command
    - commandIdentifier

## Commands
 - su <basic/expert/admin>
 - turn on <snowfall/christmasLights/randomEvents>
 - turn off <snowfall/christmasLights/randomEvents>

## Warning list
- artifact-warning
- unsupported-pdf-objects

## Admin mode
- Obmedzená veľkosť súboru
  - fileSize - e 
- Obmedzené rozmery súboru
  - fileDimensions - e
- unlimited zoom 
  - unlimitedZoom - e
- Neobmedzený počet súborov
  - numberOfOpenedFiles
- Vloženie viacerých súborov súčasne
  - maxNumberOfFilesToUploadSimultaneously
- Zobrazenie štatistík
    - statistics - e

## Browser specifics items
- Slider 
- Color picker
- Zoom 
- Pan 
- Keyboard shortcuts 
- Scroll nad number input

## Popis plagátu
Chcem vygenerovať plagát v modernom minimalistickom akademickom štýle, vhodný pre technickú bakalársku prácu. Použi svetlé neutrálne pozadie (svetlá béžová / teplá sivá), s jednou dominantnou akcentovou farbou v odtieňoch hnedej až bronzovej. Dizajn má byť čistý, vzdušný, bez dekorácií, s jemnými tieňmi a zaoblenými kartami.

Typografia má pôsobiť technicky a seriózne, bez výrazných fontových kontrastov.

Ikony majú byť jednoduché, lineárne alebo plné, konzistentné, v jednej farbe. Celkový dojem má byť profesionálny, akademický a moderný, podobný UI/UX prezentáciám nástrojov pre výskum a technickú dokumentáciu.


---
Vygeneruj akademický plagát v modernom minimalistickom UI/UX štýle pre technickú bakalársku prácu.

Téma: Webová aplikácia pre úpravu obrázkov pre akademické texty.

Dizajn má pôsobiť profesionálne, čisto a vzdušne, bez dekoratívnych prvkov. Použi svetlé neutrálne pozadie (svetlá béžová alebo teplá sivá) a jednu dominantnú akcentovú farbu v odtieňoch hnedej až bronzovej.

Layout je založený na kartách so zaoblenými rohmi, jemnými tieňmi a jasnou hierarchiou obsahu. Medzi sekciami je dostatok bieleho priestoru.

Typografia je technická, seriózna a jednotná, bez výrazných kontrastov medzi fontmi. Nadpisy sú čitateľné, ale nie výrazne dekoratívne.

Ikony sú jednoduché, lineárne alebo plné, konzistentné v jednom štýle a jednej farbe, bez farebných ilustrácií.

Celkový dojem má pripomínať moderné UI/UX prezentácie výskumných alebo vývojárskych nástrojov, nie marketingový plagát.

Logo aplikácie je umiestnené decentne (hore alebo v hlavičke), bez dominantného zvýraznenia.