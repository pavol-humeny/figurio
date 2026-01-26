# Figurio

## TODO - text 
- do textu doplniť citovanie použitých nástrojov - vue.js
- dopísať do porovnanie že som mal strašný problém nájsť export


# Chyby
- nakreslím niečo, pridám shape, a dám rasterize tak to zmizne - rastererize zožuje brush 
- varovanie ked to osekne pri resize na minimum - alebo v druhom to obmedziť tak aby sa nedalo zapísať viac
- pri kreslení rámiku telefónu a následnom kreslení tvarov pri zobrazení vidno tvary ale po exporte sa prekryjú hlavičkou rámiku 
- pri vytvorení textu a následnom deselecte by si to mohlo pamätať posledný nastavený text 
- noise detection spúšťať len nad jpg
- default frame width je 0
- copy to clipboard moze fungovať len ak je otvorený export
- copy to clipboard zobraziť aj ked to nie je png 
- resize, rotate centrovat image
- pri use milimeters to vyzaduje physical mode na to aby to fungovalo 
- pridať nástroj pre nastavenie priehľadnosti obrázka

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
- crop 
    - FIXED - hide crop - pri pustení mimo to neprepne 
    - orezanie na rôznych citlivostiach - mohlo by to orezavat hned 
    - FIXED - manualna úprava - mohol by to byť input 
    - FIXED - aplikovanie orezania - centrovať 
- bg removal 
    - neintuitívne klávesové skratky 
    - zrušit výber pri držaní shift po kliknutí na nieco co uz je vybrane 
    - mohla by sa ukladať história pri výbere 
    - color - pri výbere farby hned vybrat oblast,nie az po kliknutí na tlacidlo 
- klik + posun mysi na ikone by mohlo menit hodnotu (figma style)
- shape - rozbité 
    - divne funguje výber objektu
    - pri kliknutí to hned vytvorí nový objekt namiesto výberu 
- text - málo fontov 
- blur - čakala blur pomocou štetca/kreslenia
- mg area - pridáva sa nový objekt pri kliknutí namiesto výberu 
- resize - hneď to aplikovať nie len resetovať hodnoty 


## TODO od SA (userTesting2 - 18.1.2026)
- FIXED - pohyb pomocou L mouse + deselect nástroja 
- command + zoom pre priblíženie na macu 
- FIXED - Premenovanie súboru by nemuselo dávať toast
- FIXED - Bočný panel by mohol mať výraznejšiu šípku 
- FIXED - bočný panel by sa mohol zatvárať len šípkou a nie celým rozmerom tlacidla 
- FIXED - manuálna úprava rozmerov pri crop dá error 
- skrytie rámiku pomocou hold - použiť tlačidlo a nie toggle 
- Frame tool - vylepšiť rámiky 
- BG removal 
    - vybrať odstránené je neintuitívne 
    - text - nahradiť pozadie zmeniť na nahradiť výber 
- pridať nástroj fill (kýbel)
- zoznam objektov (svg list) by mohol zobraziť krížik pre zmazanie už pri hover, bez nutnosti selectu 
- shape 
    - kreslenie hned s obrysom alebo kreslenie len obrysu a možnosť vyplniť 
    - pri zrušení výplne automaticky prepnúť na hrúbku rámiku a nie vyžadovať od užívateľa 
- text 
    - enter to vloží na stred 
    - pri zmazaní to odstráni objekt - malo by to spraviť až pri on blur 
- FIXED - mazanie objektu pomocou backspace nie len delete (mac nemá delete)
- z index polohu zobrazovať len 2 tlačidlá ak sú len 2 objekty, žiadne ak je len jeden 
- FIXED - pri prepínaní okien to nedrží zoom 
- FIXED - tab sa nedá posunúť úplne doprava 
- MG - zoomuje len podklad a nie aj objekty 
- select - ak sa vyberie mg tak to zostane na tom nástroji a neprepne sa to späť na select 
- feature tour - prorobenie krížika 



## TODO 
- DONE - MOZNO VYMYSLIET LEPSIE (TERAZ SA NEZOBRAZUJE VOBEC) Hláška o tom že sa nedajú vykresliť tlačidlá telefónu sa vypisuje viac krát
- SKIP - (asi to je v pohode tak ako to je) zoomovanie pomocou tlacitok, ak je obrazok mimo stred tak to zoomuje mimo obrázok 
- NEPREUKÁZALO SA - pri prepnutí z color na manual select sa nezapne spravny kurzor
- NEPREUKÁZALO SA - error pri zatvorení viacerých súborov
- Vylepšenie rámiku pre prehliadače 
- Zjednodušiť nápovedy - tipy (kratšie texty)
- Zjednodušiť toasty
- Paste by to mohol klásť inde ako na ten istý objekt, aspoň pri kliknutí pravím 
- Opravit paste blur objektu 
- nakreslenie svg objektu, prepnutie na brush (vyžaduje rasterizáciu) a následné spätné prepnutie na shape (stále to chcelo rasterizovať)
- color bg removal intuitívnejší 
- na videá v tool tipe pridať time line
- Možno nejako vylepšiť vysvetlenie grayscale
- rámik windows pri použití milimetrov a dosiahnutí maximálnej hodnoty je možné zadať desatinné číslo 
- brush - ak dochádza k uloženiu snapshotu do histórie tak to vyriesit nejako inak - divne sa to seká 
- pri posune viacerých objektov, následnom položení a opätovnom presune to nechce ísť a sekne to 
- undo redo možno nejako zakázať pri aby sa to nedalo kliknúť viac krát do vtedy kým sa neaplikuje operácia 
- klávesové skratky to nepočíta do statistík
- export pdf nepočíta do statistík 
- pri rámiku telefónu je nejaký divný footer (prázdne miesto), keď je to jpg obrázok (neviem či aj pri iných)
- premyslieť kedy sa toasty nemusia zobrazovať 


## Dlhodobé TODO 
- eye dropper na safari
- Globálne úpravy (rasterizácia)
- BG removal - ukladanie do undo redo operácií pri výbere 
- Poskakovanie pri resize ak je to otočené 
- PDF s nepodporovanými svg objektami 
- Poloha magnify area a blur object voči ostatným objektom (možné riešenie vrstvy)
- v inpute by to čísla mohlo počítať 
- možnosť všetko exportovať naraz do zip
- prevod pdf na raster ak to obsahuje hlúposti 

## Insane ideas
- aplikovanie operácie na všetky obrázky 
- Premenné prostredia (pre farbu, veľkosť)
- Vrstvy 
- Možnosť si uložiť aktuálnu prácu 
- Nástroj na kreslenie (štetce)
- Split screen pre viac obrázkov 

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
