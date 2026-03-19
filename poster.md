# Poster texts
## 1. Úvod
### Motivácia
- nekvalitné obrázky v technických dokumentoch
- časovo náročná úprava screenshotov a diagramov
- príliš komplexné grafické editory
- chýbajú nástroje prispôsobené odborným textom

---

### Figurio
- webová aplikácia dostupná priamo v prehliadači
- bez potreby inštalácie
- jednoduché a intuitívne rozhranie
- určená na rýchle úpravy screenshotov a diagramov

---

### Kľúčové vlastnosti
- lokálne spracovanie obrázkov – ochrana súkromia
- podpora PDF a vektorových úprav
- špecializované nástroje pre technické a akademické dokumenty
---

## 2. Schéma
### Načítanie obrázka

- podporované vstupné formáty **PNG, JPG, WebP a PDF**
- po načítaní prebehne **detekcia formátu súboru**
- rastrové obrázky sú načítané na **canvas**
- PDF dokumenty sú spracované pomocou **pdf.js**

---

### Interná reprezentácia (imageStore)

- centrálny stav aplikácie implementovaný ako imageStore
- uchováva aktuálny obrázok, metadáta a zoznam operácií
- poskytuje dáta pre spracovanie aj vykreslenie obrázka

---

### Spracovanie operácií

- nástroje ukladajú definíciu operácie a jej parametre do imageStore
- operácie sú ukladané do sekvenčného zoznamu operácií
- centrálna pipeline načíta aktuálny obraz z imageStore
- podľa typu operácie vyberie modul spracovania a uloží výsledok späť do stavu aplikácie

---

### Vrstvová reprezentácia obrázka

výsledný obrázok je zostavený z viacerých vrstiev
takýto model umožňuje nezávislé úpravy jednotlivých častí obrázka

- Frame layer – prezentačný rámik zariadenia alebo aplikácie
- Vector layer – vektorové objekty, anotácie a text
- Raster layer – kreslenie štetcom a rastrové úpravy
- Base layer – pôvodný obrázok alebo obsah dokumentu


---

### Vykreslenie

- modul sleduje zmeny v aplikačnom stave
- pri zmene obrázka alebo operácie sa vykreslí aktuálny stav obrázka
- vykreslenie zahŕňa rastrové dáta, vektorové vrstvy a prezentačné prvky

---

### Export

- používateľ zvolí výstupný formát a parametre exportu
- jednotlivé vrstvy sú spojené do výsledného obrazu
- rastrové formáty využívajú export z canvas, PDF je generované pomocou jsPDF a pdf-lib

---

## 3. Ukážka vybraných funkcií

### Crop

- orezanie obrázka a odstránenie nepotrebných častí
- manuálne orezanie alebo orezanie so zachovaním pomeru strán
- **fit crop** – automatická detekcia obsahu obrázka

---

### Frame

- vloženie obrázka do prezentačného rámika
- dostupné rámiky: okno aplikácie, mobil, editor kódu
- vhodné na prezentáciu používateľského rozhrania

---

### Magnify Area + Blur Area

- zvýraznenie detailu priblížením časti obrázka
- rozmazanie vybranej časti obrázka
- zdôraznenie dôležitých prvkov a anonymizácia citlivých údajov

---

### Ďalšie dostupné nástroje

Okrem uvedených funkcií aplikácia obsahuje aj ďalšie nástroje na úpravu a anotáciu obrázkov.

---

## Poster sizes
Okraje - 20mm
Medzera medzi prvkami (väčšia) - 15mm
Medzera medzi prvkami (menšia) - 7.5mm

Logo - 80x80mm

Corner radius - 4mm

font: Inter 
- 46pt (12mm) 
- 38pt (10mm)  
- 24pt (6.2mm)

Text v blokoch
- 30pt (8mm) nadpis
- 18pt (4.7mm) - bežný text 

Text v schéme 
- 22pt (5.6mm)- nadpis v schéme
- 15pt (4mm) - text v schéme

## Checklist pred finálnou tlačou plagátu

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