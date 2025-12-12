# Figurio
## TODO 
- Rámik monitoru 
- Vylepšenie rámiku pre prehliadače 
- Hláška o tom že sa nedajú vykresliť tlačidlá telefónu sa vypisuje viac krát
- Videá pre nástroje 
- Videá pre feature tour p
- Farba sa do zoznamu farieb ukladá len raz (asi nedáva zmysel - treba premyslieť)
- krok späť spôsobí zmazanie eventu artifacts warning 
- SKIP - (asi to je v pohode tak ako to je) zoomovanie pomocou tlacitok, ak je obrazok mimo stred tak to zoomuje mimo obrázok 
- Oblé zakončenie čiar (line tool)
- noise detection sa zmaže pri undo operácie 
- pri dokreslení background removal canvas sa to sekne 
- 3 úrovne pre auto background removal 
- eye dropper na safari
- zatvaranie pdf je strasne pomale
- pixelovať všetky canvasy 
- Expand header nefunguje dobre pri velkej hrubke ramiku 
- pixely od určitej úrovne pri približovaní 
- pixely by sa mohli dať prepínať manuálne 
- Zjednodušiť nápovedy - tipy (kratšie texty)
- šípky pre posúvanie (panel s nástrojmi, help, release note) by mohli fungovať aj na držanie
- command - prepnutie do odtieňov sedi 
- achievementy
- pri zmene suboru sa neprepocitaju nejake hodnoty pre spravne zoomovanie



## Admin mode 
- neobmedzena veľkosť obrázku 
- ľubovoľné orezávanie 
- nekonečné zoomovanie 

## Dlhodobé TODO 
- Globálne úpravy (rasterizácia)
- BG removal - ukladanie do undo redo operácií pri výbere 
- Poskakovanie pri resize ak je to otočené 
- PDF s nepodporovanými svg objektami 
- Poloha magnify area a blur object voči ostatným objektom (možné riešenie vrstvy)
- Centrovanie obrázku v iných kartách (otvorených obrázkoch) ak na inej karte došlo ku otvoreniu bočného panelu 
- Tutoriál nefunguje šípkami 

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
