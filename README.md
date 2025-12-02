# Figurio
## TODO 
- Rámik monitoru 
- Vylepšenie rámiku pre prehliadače 
- Toggle button na skrytie crop boxu 
- Hláška o tom že sa nedajú vykresliť tlačidlá telefónu sa vypisuje viac krát
- Videá pre nástroje 
- Videá pre feature tour 
- Farba sa do zoznamu farieb ukladá len raz (asi nedáva zmysel - treba premyslieť)
- Admin režim - režim bez obmedzení 
- DONE Blikanie šumu 
- DONE pri preklikávaní medzi feature tour sa meni velkost arei pre video ak ešte nie je načítané
- escape nezatvara feature tour, ale zatvori help modal pod tym 
- krok späť spôsobí zmazanie eventu artifacts warning 
- zoomovanie pomocou tlacitok, ak je obrazok mimo stred tak to zoomuje mimo obrázok 
- 

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

## Warning list
- artifact-warning
- unsupported-pdf-objects
