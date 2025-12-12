# Figurio
## TODO 
- Rámik monitoru 
- Vylepšenie rámiku pre prehliadače 
- Toggle button na skrytie crop boxu 
- Hláška o tom že sa nedajú vykresliť tlačidlá telefónu sa vypisuje viac krát
- Videá pre nástroje 
- Videá pre feature tour 
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
- Ak je obrazok zmenseny a meni sa side panel tak to lieta 
- Expand header nefunguje dobre pri velkej hrubke ramiku 
- prerobit resize tool, najskor sa nastavi velkost a az potom sa aplikuje
- možno odstrániť hover efekt nad logom na home page 
- pixely od určitej úrovne pri približovaní 
- pixely by sa mohli dať prepínať manuálne 
- Zjednodušiť nápovedy - tipy (kratšie texty)
- šípky pre posúvanie (panel s nástrojmi, help, release note) by mohli fungovať aj na držanie
- command - prepnutie do odtieňov sedi 
- achievementy



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
- contrastModeToggle
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
