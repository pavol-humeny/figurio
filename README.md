# Figurio

## TODO - text 

# Chyby
- brush nefunguje na klikanie ale len na tahanie
- vylepšiť BG removal 
- opraviť shape 
- opraviť magnify area 
- opraviť blur 
- opraviť select
- pri výbere z dropdown menu to neskryje tip 
- statistiky - v grafe návštevnosti zobrazovať lokalizáciu

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
    - color - pri výbere farby hned vybrat oblast,nie az po kliknutí na tlacidlo 
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
- Frame tool - vylepšiť rámiky 
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
- MG - zoomuje len podklad a nie aj objekty 
- select - ak sa vyberie mg tak to zostane na tom nástroji a neprepne sa to späť na select 
- FIXED - feature tour - prerobenie krížika 

## TODO 
- SKIP - (asi to je v pohode tak ako to je) zoomovanie pomocou tlacitok, ak je obrazok mimo stred tak to zoomuje mimo obrázok 
- Vylepšenie rámiku pre prehliadače 
- Paste by to mohol klásť inde ako na ten istý objekt, aspoň pri kliknutí pravím 
- Opravit paste blur objektu 
- nakreslenie svg objektu, prepnutie na brush (vyžaduje rasterizáciu) a následné spätné prepnutie na shape (stále to chcelo rasterizovať)
- color bg removal intuitívnejší 
- brush - ak dochádza k uloženiu snapshotu do histórie tak to vyriesit nejako inak - divne sa to seká 
- pri posune viacerých objektov, následnom položení a opätovnom presune to nechce ísť a sekne to 
- undo redo možno nejako zakázať pri aby sa to nedalo kliknúť viac krát do vtedy kým sa neaplikuje operácia 
- premyslieť kedy sa toasty nemusia zobrazovať 

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
- mať možnosť zobraziť informácie o obrázku - asi nič moc, lebo z obrázku sa toho veľa nedá zistiť 


## Insane ideas
- aplikovanie operácie na všetky obrázky 
- Premenné prostredia (pre farbu, veľkosť)
- Vrstvy 
- Možnosť si uložiť aktuálnu prácu 
- Nástroj na kreslenie (štetce)
- Split screen pre viac obrázkov 
- v inpute by to čísla mohlo počítať 

## Nepreukázalo sa 
- NEPREUKÁZALO SA - pri prepnutí z color na manual select sa nezapne spravny kurzor
- NEPREUKÁZALO SA - error pri zatvorení viacerých súborov
- NEPREUKÁZALO SA - nakreslím niečo, pridám shape, a dám rasterize tak to zmizne - rastererize zožuje brush 

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
