# Figurio
## TODO 
- Rámik monitoru 
- Vylepšenie rámiku pre prehliadače 
- Toggle button na skrytie crop boxu 
- Hláška o tom že sa nedajú vykresliť tlačidlá telefónu sa vypisuje viac krát
- Videá pre nástroje 
- Videá pre feature tour 
- Farba sa do zoznamu farieb ukladá len raz (asi nedáva zmysel - treba premyslieť)
- DONE Admin režim - režim bez obmedzení 
- DONE Blikanie šumu 
- DONE pri preklikávaní medzi feature tour sa meni velkost arei pre video ak ešte nie je načítané
- DONE escape nezatvara feature tour, ale zatvori help modal pod tym 
- krok späť spôsobí zmazanie eventu artifacts warning 
- SKIP (asi to je v pohode tak ako to je) zoomovanie pomocou tlacitok, ak je obrazok mimo stred tak to zoomuje mimo obrázok 
- DONE Prepracovať zatváranie modalov pomocou ESCAPE - vytvoriť nejakú hierarchiu a zatvárať to z jedného miesta 
- Skontrolovať či sa rámiky telefónu nejako neorezávajú 
- Oblé zakončenie čiar (line tool)
- FIXED - noise detection sa neskryje pri kliknutí na krížik ak tam je viac súborov 
- noise detection sa zmaže pri undo operácie 
- FIXED - pri aplikovaní operácie sa dá zoomovať obrazovka
- FIXED - logo sa dá drag and drop do editoru 
- pri dokreslení background removal canvas sa to sekne 
- Pri vlozeni hodnoty do formulara sa spusti funkcia na kontrolu vlozenia obrazku
- v help modal nefunguje ctrl + c, v
- 3 úrovne pre auto background removal 
- eye dropper na safari
- zatvaranie pdf je strasne pomale
- pri zatvorení súboru - resetovať zoom mode na 100%
- pixelovať všetky canvasy 
- API na zaslanie mailu 


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

## Warning list
- artifact-warning
- unsupported-pdf-objects

## Admin mode
- Obmedzená veľkosť súboru 
- Obmedzené rozmery súboru 

## Browser specifics items
- Slider 
- Color picker
- Zoom 
- Pan 
- Keyboard shortcuts 
- Scroll nad number input
