# Figurio – webový nástroj na prípravu obrázkov pre technické dokumenty

## 1. Motivácia a cieľ nástroja

Pri príprave technických dokumentov (bakalárske práce, články, dokumentácia) je často potrebné upravovať screenshoty, diagramy alebo ilustrácie. Bežné grafické editory sú však pre tento účel často zbytočne komplexné a neponúkajú nástroje orientované na publikovanie v technických textoch.

Ďalším problémom môže byť ochrana dát. Mnohé nástroje vyžadujú upload obrázkov na server, čo môže byť nevhodné napríklad pri práci s internými alebo citlivými informáciami.

Aplikácia **Figurio** rieši tento problém ako jednoduchý webový editor zameraný na prípravu obrázkov pre technické a akademické dokumenty.

### Pre koho je nástroj určený

Primárni používatelia:

- študenti pripravujúci bakalárske a diplomové práce
- autori technickej dokumentácie
- pedagógovia a výskumníci pripravujúci študijné materiály alebo publikácie

### Hlavné výhody

- webová aplikácia bez potreby inštalácie
- spracovanie obrázkov lokálne v prehliadači (privacy-first prístup)
- nástroje orientované na publikovanie obrázkov v dokumentoch
- rýchly pracovný postup: **import → úprava → export**

---

## 2. Architektúra a technické riešenie

Aplikácia je implementovaná ako **Single-Page Application (SPA)**, kde väčšina spracovania prebieha priamo v prehliadači používateľa.

### Hlavné vrstvy architektúry

**1. Prezentačná vrstva**

Používateľské rozhranie je implementované pomocou komponentov frameworku **Vue.js**. Obsahuje pracovnú plochu editoru, panel nástrojov a dynamický panel nastavení.

**2. Aplikačná logika**

Logika nástrojov je implementovaná ako sada operácií nad obrazom. Úpravy sú reprezentované ako **pipeline operácií**, ktoré sa aplikujú na pôvodný obrázok.

Tento prístup umožňuje:

- nedestruktívne úpravy
- jednoduché undo/redo
- efektívne prepočítavanie výsledného obrazu

**3. Stav aplikácie**

Globálny stav aplikácie je spravovaný pomocou **Pinia stores**, ktoré uchovávajú napríklad:

- aktuálny obrázok
- zoznam aplikovaných operácií
- históriu úprav
- nastavenia nástrojov

### Použité technológie

Frontend:

- Vue.js
- Vite
- Pinia
- vue-router
- vue-i18n

Práca s obrázkami a PDF:

- Canvas API
- SVG
- pdf.js
- jsPDF
- svg2pdf
- pdf-lib

Backend (doplnkový):

- Node.js + Express
- MySQL

Backend slúži iba na anonymnú telemetriu používania. Samotné obrazové dáta zostávajú vždy na strane klienta.

### Technické princípy

- client-side image processing
- kombinácia rastrových a vektorových operácií
- pipeline model úprav
- modulárny návrh nástrojov umožňujúci jednoduché rozširovanie aplikácie

---

## 3. Ukážka vybraných funkcií

Aplikácia obsahuje viacero nástrojov na úpravu obrázkov. Na plagáte sú prezentované tri reprezentatívne funkcie.

### Crop

Nástroj **Crop** slúži na orezanie obrázka. Používateľ môže manuálne definovať oblasť orezania alebo použiť automatický režim, ktorý sa snaží identifikovať relevantnú časť obrázka.

Tento nástroj umožňuje rýchlo odstrániť nepotrebné okraje a pripraviť obrázok pre vloženie do dokumentu.

### Frame

Nástroj **Frame** umožňuje vložiť obrázok do prezentačného rámu zariadenia, napríklad:

- webový prehliadač
- mobilné zariadenie
- editor kódu

Týmto spôsobom je možné vizuálne prezentovať používateľské rozhranie aplikácie alebo screenshoty v realistickom kontexte.

### Magnify Area + Blur Area

Nástroj **Magnify Area** umožňuje zvýrazniť detail obrázka pomocou zväčšenej oblasti. Používa sa najmä na upozornenie na dôležitú časť diagramu alebo používateľského rozhrania.

Nástroj **Blur Area** slúži na rozmazanie vybranej oblasti obrázka. Typicky sa používa na anonymizáciu citlivých údajov alebo skrytie nepodstatných informácií.

### Odporúčané vizuálne ukážky na plagáte

Crop  
`[ obrázok pred ] → [ obrázok po ]`

Frame  
`[ screenshot ] → [ screenshot v browser frame ]`

Magnify + Blur  
`[ pôvodný obrázok ] → [ zvýraznený detail + rozmazaná časť ]`

# Checklist pred finálnou tlačou plagátu

### Obsah

- [ ] Je z názvu okamžite jasné, čo aplikácia rieši
- [ ] Je vysvetlený problém a motivácia projektu
- [ ] Je stručne popísaná architektúra aplikácie
- [ ] Je uvedený technologický stack
- [ ] Sú prezentované aspoň 3 hlavné funkcie aplikácie
- [ ] Sú použité vizuálne ukážky „pred / po“

### Vizuál plagátu

- [ ] Text tvorí maximálne približne 20–30 % plochy plagátu
- [ ] Najdôležitejšie informácie sú čitateľné zo vzdialenosti približne 1–2 m
- [ ] Použitá typografia je konzistentná
- [ ] Farby a vizuálny štýl sú jednotné
- [ ] Architektonický diagram je jednoduchý a zrozumiteľný

### Prezentácia projektu

- [ ] Na plagáte je QR kód na demo aplikácie
- [ ] Na plagáte je odkaz na GitHub repozitár
- [ ] Projekt je možné vysvetliť približne za 60–90 sekúnd
- [ ] Z plagátu je jasné, aký je hlavný prínos aplikácie




## Poster texts
## 1. Úvod
### Problém
- kvalita obrázkov ovplyvňuje kvalitu technických dokumentov
- príprava screenshotov a diagramov je často časovo náročná
- bežné grafické editory sú pre tieto úlohy zbytočne komplexné

--

### O aplikácii
- **webový editor dostupný priamo v prehliadači** bez potreby inštalácie
- **jednoduché a intuitívne** rozhranie 
- navrhnutá pre **rýchle úpravy screenshotov a diagramov**

---

### Hlavné výhody
- **lokálne spracovanie obrázkov** – ochrana súkromia používateľa  
- **podpora PDF a vektorových úprav**  
- **špecializované nástroje pre odborné texty**

---

## 3. Ukážka vybraných funkcií

### Crop

- orezanie obrázka a odstránenie nepotrebných častí
- manuálne nastavenie oblasti orezania alebo orezanie so zachovaním pomeru strán
- **fit crop** – automatická detekcia obsahu obrázka

---

### Frame

- vloženie obrázka do prezentačného rámiku
- dostupné rámiky: okno aplikácie, mobilné zariadenie, editor kódu
- vhodné na prezentáciu používateľského rozhrania alebo aplikácií

---

### Magnify Area + Blur Area

- **Magnify Area** – zvýraznenie detailu pomocou zväčšenej oblasti
- **Blur Area** – rozmazanie vybranej časti obrázka
- zvýraznenie dôležitých prvkov alebo anonymizácia citlivých údajov

---

### Ďalšie dostupné nástroje

Okrem uvedených funkcií aplikácia obsahuje aj ďalšie nástroje na úpravu a anotáciu obrázkov.

---

## Poster sizes
Okraje - 20mm
Medzera medzi položkami (väčšia) - 15mm
Medzera medzi položkami (menšia) - 7.5mm

Logo - 80x80mm

font: Inter
- --- 46pt (12mm) veľký nadpis 
- 38pt (10mm) nadpis 
- --- 24pt (6.2mm) - väčší text 
- 18pt (4.7mm) - bežný text 