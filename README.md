# Figurio

## TODO 
- rámik monitoru
- background removal kreslenie sa sekne 
- Vylepšenie rámiku pre prehliadače 
- DONE - MOZNO VYMYSLIET LEPSIE (TERAZ SA NEZOBRAZUJE VOBEC) Hláška o tom že sa nedajú vykresliť tlačidlá telefónu sa vypisuje viac krát
- SKIP - (asi to je v pohode tak ako to je) zoomovanie pomocou tlacitok, ak je obrazok mimo stred tak to zoomuje mimo obrázok 
- Oblé zakončenie čiar (line tool)
- eye dropper na safari
- Zjednodušiť nápovedy - tipy (kratšie texty)
- high noise leven in image by sa pri crop, resize... asi mal odstranit (ten warning)
- bg removal skratky pridať do help, brush manipulation skratky (ALT = resize)
- pri prepnutí z color na manual select sa nezapne spravny kurzor
- Paste by to mohol klásť inde ako na ten istý objekt, aspoň pri kliknutí pravím 
- výber pdf strany, nie drop down menu ale iba number input so šípočkami
- nakreslenie svg objektu, prepnutie na brush (vyžaduje rasterizáciu) a následné spätné prepnutie na shape (stále to chcelo rasterizovať)

## TODO
- spracovanie pdf súborov 
- pdf sa niekedy nenačíta 
- optimalizovanie undo, redo operácie 
- využitie workerov pre aplikovanie operácie 
- prevod na raster ak to obsahuje hlúposti 
- pomalé zatváranie pdf 
- pomalé prepínanie medzi tabmi 
- zmen na light mode 

## Admin mode 
- neobmedzena veľkosť obrázku 
- nekonečné zoomovanie 

## Dlhodobé TODO 
- achievementy
- Globálne úpravy (rasterizácia)
- BG removal - ukladanie do undo redo operácií pri výbere 
- Poskakovanie pri resize ak je to otočené 
- PDF s nepodporovanými svg objektami 
- Poloha magnify area a blur object voči ostatným objektom (možné riešenie vrstvy)

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
