## ŠT
- MTIa
- kniha 
- testovanie figurio 
    - feature tour okno 
    - userTesting - blur, magnify
- Unit testy
- refaktorizácia

## TODO - text 
- P - záver
- prerobiť snímky obrazovky kde je VUE logo na spodku 
- zmenit obrazok pri ukazovani pixelation mode, dat tam nieco viac abstraktne
- obrázok s fyzickými rozmermi - dat tam nekvalitný obrázok a zmeniť X na znak 

- scenár pre video

# TODO
- P - zaistit aby pri resize objektov bolo snapovanie plynule tak ako pri drag

- skontrolovať warning hlášky (malé rozmery, safari...)


- veľkosť položiek na základe veľkosti obrazovky a nie v pixeloch 
- vyťahanie konštánt do css premenných (čo sa týka rozmerov)
- touch eventy 
    - crop posun 
    - steeper - drzanie 
    - brush 
    - select
    - shape, blur, text, magnify
    - move objects

- pri dropdowne fyzický režim by tam mohli byť popisy, ktorý papier to je (A4, A3...)
- fyzický režim šírka by mohla byť pre každý súbor

- vyriešiť pohyb objektov s axis lock
- stepper input nepropagovat enter klik
- navigacia vo viewporte pomocou sipok
- kopírovať a vložiť by sa mali dať objekty aj v select toole
- kopírovanie nefunguje pomocou ctrl c, v
- ak sa vyhodí okno na rastrovanie tak klávesové skratky by mali byť zakázané (pri crope to ide)
- blur objekt aj ked sa blur radius nastavi na 0 a potom sa opat vyberie tak je nastavený na 10


- skontrolovať texty
├── DONE - calibration.json
├── DONE - contextMenu.json
├── DONE - dragAndDropArea.json
├── DONE - featureTour.json
├── DONE - general.json
├── DONE - help.json
├── DONE - home.json
├── DONE - imageStore.json
├── DONE - maintenance.json
├── DONE - privacy.json
├── release.json
├── DONE - statistics.json
├── tools.json
├── DONE - topPanel.json
└── tutorialSteps.json

## Dlhodobé TODO 
- eye dropper na safari
- BG removal - ukladanie do undo redo operácií pri výbere 
- pridať nástroj fill (kýbel)
- Crop orezanie v centimetroch, v pomere
- Pozrieť sa na spoplatnenie - maximálny počet exportov, by me coffee
- Vylepšenie rámiku pre prehliadače 

## Insane ideas
- možnosť všetko exportovať naraz do zip
- aplikovanie operácie na všetky obrázky 
- Premenné prostredia (pre farbu, veľkosť)
- Vrstvy 
- Možnosť si uložiť aktuálnu prácu 
- Nástroj na kreslenie (štetce)
- Split screen pre viac obrázkov 
- v inpute by to čísla mohlo počítať 
- Možnosť vytvoriť si prázdny projekt a vkladať tam obrázky
- Premapovanie klávesových skratiek užívateľom
- resetovanie obrázku do pôvodného stavu
- pridať nástroj pre nastavenie priehľadnosti obrázka
- fit crop len z jednej strany 

## Nepreukázalo sa 
- pri prepnutí z color na manual select sa nezapne spravny kurzor
- error pri zatvorení viacerých súborov
- nakreslím niečo, pridám shape, a dám rasterize tak to zmizne - rastererize zožuje brush 
- nakreslenie svg objektu, prepnutie na brush (vyžaduje rasterizáciu) a následné spätné prepnutie na shape (stále to chcelo rasterizovať)
- občas to tam nezobrazuje farbu v color inpute pri fill v nástroji shape
- občas sa nezobrazí nástroj v tool settings 

## Ťažko povedať čo s tým 
- SKIP - (asi to je v pohode tak ako to je) zoomovanie pomocou tlacitok, ak je obrazok mimo stred tak to zoomuje mimo obrázok 
- podpora pre touch event 
- zaistenie aby resizery mali vzdy rovnaku velkost
- Gonzales nefunguje nacitanie a orezanie
- Poskakovanie pri resize ak je to otočené (svg objekty)

## FIXED -  od J (userTesting2 - 12.1.2026)
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
- FIXED - bg removal 
    - SKIP - neintuitívne klávesové skratky 
    - FIXED - zrušit výber pri držaní shift po kliknutí na nieco co uz je vybrane 
    - SKIP - mohla by sa ukladať história pri výbere 
    - FIXED - color - pri výbere farby hned vybrat oblast,nie az po kliknutí na tlacidlo 
- FIXED - klik + posun mysi na ikone by mohlo menit hodnotu (figma style)
- FIXED - shape - rozbité 
    - FIXED - divne funguje výber objektu
    - FIXED - pri kliknutí to hned vytvorí nový objekt namiesto výberu 
- SKIP - text - málo fontov 
- SKIP - blur - čakala blur pomocou štetca/kreslenia
- FIXED - mg area - pridáva sa nový objekt pri kliknutí namiesto výberu 
- FIXED - resize - hneď to aplikovať nie len resetovať hodnoty 

## FIXED - TODO od SA (userTesting2 - 18.1.2026)
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
- FIXED - MG - zoomuje len podklad a nie aj objekty 
- FIXED - select - ak sa vyberie mg tak to zostane na tom nástroji a neprepne sa to späť na select 
- FIXED - feature tour - prerobenie krížika 

## User testing changes 
- FIXED - Nezobrazovať toast o úspešnom nahratí súboru - predsa to je jasné že sa nahral 
- FIXED - Premenovanie súboru by nemuselo dávať toast
- FIXED - z index polohu zobrazovať len 2 tlačidlá ak sú len 2 objekty, žiadne ak je len jeden 
- FIXED - pri zrušení výplne automaticky prepnúť na hrúbku rámiku a nie vyžadovať od užívateľa 
- FIXED - Zoom pomocou numerickej klávesnice - povodne tam bola ikona pravitka, co evokovalo zapnutie pravítok v editore 

## Text checking 
- privacy
- help

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


## Popis obrázka
Create a clean technical exploded view diagram of a layered image editing architecture.
The composition should show a smartphone screenshot in perspective view (slightly rotated in 3D space), with its layers separated vertically along the Z-axis.
The layers should be visually stacked above each other with small gaps between them.

Bottom layer: a simple raster image placeholder (abstract photo or blurred gradient).
Above it: a semi-transparent raster drawing layer with visible brush strokes (freehand lines).
Above that: a vector annotation layer containing simple geometric shapes (rectangle, ellipse) and a short text label.
Top layer: a smartphone frame mockup surrounding the image.

The style should be minimalistic, clean, technical, with white or light background.
No excessive realism, no shadows that obscure structure.
Slight depth perspective, subtle drop shadows to emphasize separation of layers.
Diagram-style visualization suitable for academic thesis.
Flat design, simple colors, high clarity.


\todo{Jednou vetou zhrnúť cieľ práce a to, čo bolo jej hlavným zámerom.}

\todo{Konštatovať, že stanovený cieľ práce bol splnený.}

\todo{Stručne zhrnúť, čo sa podarilo navrhnúť a implementovať v rámci riešenia.}

\todo{Zvýrazniť vlastný prínos práce a jej praktický význam.}

\todo{Zhrnúť skúsenosti získané počas riešenia práce a prínos pre autora.}

\todo{Uviesť možnosti ďalšieho rozšírenia alebo pokračovania projektu v budúcnosti.}