# Figurio

15.12.
- background removal kreslenie sa sekne 
- Undo,redo optimalizacia

- pdf nacitanie 
- pdf optimalizacia

- rámik monitoru
- hláška pri tlačítkach že sa nedajú zobraziť 


## TODO 
- Ak dám rotate a potom resize tak to nefunguje, lebo resize robi s base canvas 
- Rámik monitoru 
- Vylepšenie rámiku pre prehliadače 
- DONE - MOZNO VYMYSLIET LEPSIE (TERAZ SA NEZOBRAZUJE VOBEC)Hláška o tom že sa nedajú vykresliť tlačidlá telefónu sa vypisuje viac krát
- SKIP - (asi to je v pohode tak ako to je) zoomovanie pomocou tlacitok, ak je obrazok mimo stred tak to zoomuje mimo obrázok 
- Oblé zakončenie čiar (line tool)
- pri dokreslení background removal canvas sa to sekne 
- eye dropper na safari
- zatvaranie pdf je strasne pomale
- Zjednodušiť nápovedy - tipy (kratšie texty)
- achievementy
- high noise leven in image by sa pri crop, resize... asi mal odstranit (ten warning)
- blur, ak bol blue objekt zmazany a klikne sa (ide sa kreslit novy) tak to zvyrazni ten stary

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
