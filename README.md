# Figurio

# Chyby
- noise detekcia ako samostatný nástroj, možnosť ho znovu zapnúť
- mám obrázok, dám unsupported obrázok a zavrie to 
- nakreslím niečo, pridám shape, a dám rasterize tak to zmizne - rastererize zožuje brush 
- varovanie ked to osekne pri resize na minimum - alebo v druhom to obmedziť tak aby sa nedalo zapísať viac

## TODO od J (userTesting2 - 12.1.2026)
- FIXED - Zoom pomocou numerickej klávesnice
- FIXED - fyzický mód možno iná ikona 
- FIXED - vyznačený text v light mode by mohol byť biely 
- FIXED - pixelation mode - light mode je strašne málo rozdielny od bg color 
- SKIP - ikony v kontrast mode switcheri sú nejasné 
- FIXED - pri pdf by pixelácia mohla byť len disabled a nie hidden + tip disabled 
- FIXED - noise detection - aj ked je to uz zobrazene tak sa to prepocita 
- FIXED - neobmedzena velkost pri pdf suboroch 
- pri manipulácii s obrázkom to zobrazuje najskôr pozadie (kocky) a až potom sa to aplikuje na obrazok 
- crop 
    - FIXED - hide crop - pri pustení mimo to neprepne 
    - orezanie na rôznych citlivostiach - mohlo by to orezavat hned 
    - manualna úprava - mohol by to byť input 
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


## TODO 
- DONE - MOZNO VYMYSLIET LEPSIE (TERAZ SA NEZOBRAZUJE VOBEC) Hláška o tom že sa nedajú vykresliť tlačidlá telefónu sa vypisuje viac krát
- SKIP - (asi to je v pohode tak ako to je) zoomovanie pomocou tlacitok, ak je obrazok mimo stred tak to zoomuje mimo obrázok 
- NEPREUKÁZALO SA - pri prepnutí z color na manual select sa nezapne spravny kurzor
- NEPREUKÁZALO SA - error pri zatvorení viacerých súborov
- rámik monitoru
- Vylepšenie rámiku pre prehliadače 
- Zjednodušiť nápovedy - tipy (kratšie texty)
- Paste by to mohol klásť inde ako na ten istý objekt, aspoň pri kliknutí pravím 
- Opravit paste blur objektu 
- nakreslenie svg objektu, prepnutie na brush (vyžaduje rasterizáciu) a následné spätné prepnutie na shape (stále to chcelo rasterizovať)
- pdf zväčšiť veľkosť povoleného súboru 
- color bg removal intuitívnejší 
- klikanie na tool divne sa otvaraju subtools - vymyslieť vylepšenie
- na videá v tool tipe pridať time line
- Možno nejako vylepšiť vysvetlenie grayscale

- rámik windows pri použití milimetrov a dosiahnutí maximálnej hodnoty je možné zadať desatinné číslo 
- brush - ak dochádza k uloženiu snapshotu do histórie tak to vyriesit nejako inak - divne sa to seká 
- pri posune viacerých objektov, následnom položení a opätovnom presune to nechce ísť a sekne to 
- undo redo možno nejako zakázať pri aby sa to nedalo kliknúť viac krát do vtedy kým sa neaplikuje operácia 


## Dlhodobé TODO 
- eye dropper na safari
- achievementy
- Globálne úpravy (rasterizácia)
- BG removal - ukladanie do undo redo operácií pri výbere 
- Poskakovanie pri resize ak je to otočené 
- PDF s nepodporovanými svg objektami 
- Poloha magnify area a blur object voči ostatným objektom (možné riešenie vrstvy)
- v inpute by to čísla mohlo počítať 
- možnosť všetko exportovať naraz do zip
- využitie workerov pre aplikovanie operácie 
- prevod pdf na raster ak to obsahuje hlúposti 

## Insane ideas
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

## Browser specifics items
- Slider 
- Color picker
- Zoom 
- Pan 
- Keyboard shortcuts 
- Scroll nad number input
