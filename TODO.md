2bfee4b4-44b3-451f-9f34-92934025b66d, 5ed20eea-489a-4edb-81e1-803e3d2e1411

85fca411-f46c-43ff-a264-720ac373b128

## Insane ideas
- touch event pre select, shape, text, magnify, blur, posun 
- eye dropper na safari
- Vylepšenie rámiku pre prehliadače 
- BG removal - ukladanie do undo redo operácií pri výbere 
- Pozrieť sa na spoplatnenie - maximálny počet exportov, by me coffee
- Crop orezanie v centimetroch, v pomere
- pridať nástroj fill (kbelík)
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
- P - zaistit aby pri resize objektov bolo snapovanie plynule tak ako pri drag

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
- appInstalled

## Preset operations 
- rotation
- flip
- autoCrop
- grayscale
- crop 
- resize

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