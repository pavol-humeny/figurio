# Figurio

# Chyby
- noise detekcia ako samostatný nástroj, možnosť ho znovu zapnúť
- mám obrázok, dám unsupported obrázok a zavrie to 
- nakreslím niečo, pridám shape, a dám rasterize tak to zmizne - rastererize zožuje brush 
- varovanie ked to osekne pri resize na minimum - alebo v druhom to obmedziť tak aby sa nedalo zapísať viac



## TODO 
- DONE - MOZNO VYMYSLIET LEPSIE (TERAZ SA NEZOBRAZUJE VOBEC) Hláška o tom že sa nedajú vykresliť tlačidlá telefónu sa vypisuje viac krát
- SKIP - (asi to je v pohode tak ako to je) zoomovanie pomocou tlacitok, ak je obrazok mimo stred tak to zoomuje mimo obrázok 
- NEPREUKÁZALO SA - pri prepnutí z color na manual select sa nezapne spravny kurzor
- rámik monitoru
- Vylepšenie rámiku pre prehliadače 
- Oblé zakončenie čiar (line tool)
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
- aplikovanie resize pomocou enteru 
- informovat nejako ak vznikne error používatela
- error pri zatvorení viacerých súborov


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
