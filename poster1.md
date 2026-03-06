# Figurio – podklady na plagát (Excel@FIT 2026)

Tento dokument je pripravený ako „výťah“ najdôležitejších bodov, ktoré sa oplatí dať na súťažný plagát.
Je písaný tak, aby sa dal priamo použiť pri finálnej grafickej sadzbe.

---

## 1) Jednovetová hodnota projektu (headline)

**Figurio je webový editor pre akademické a technické obrázky, ktorý umožňuje rýchlu a presnú úpravu snímok priamo v prehliadači – bez inštalácie a bez odosielania dát na server.**

Doplňujúci podnadpis:

**Namiesto „všeobecného grafického editora“ ponúka cielené nástroje pre odborné texty (LaTeX/Overleaf, dokumentácie, záverečné práce).**

---

## 2) Čo má byť na plagáte „na prvý pohľad“

- **Problém:** bežné editory sú pre tento účel zbytočne komplexné.
- **Riešenie:** špecializovaný editor pre úpravu screenshotov, diagramov a ilustrácií do odborných textov.
- **Diferenciátory:**
  - lokálne spracovanie dát (privacy by design),
  - podpora vektorového workflow pri PDF,
  - nástroje orientované na publikovanie (crop, frame, blur, magnify, anotácie, presety),
  - konzistentný pracovný tok: import → úprava → export.

---

## 3) Sekcia „Pre koho je to“

Primárni používatelia:
- študenti (BP/DP, semestrálne projekty),
- autori technických dokumentácií,
- pedagógovia a výskumníci pripravujúci študijné materiály a publikácie.

Praktický prínos:
- rýchlejší čas prípravy obrázkov,
- jednotný vizuálny štýl naprieč dokumentom,
- menšie riziko použitia nekvalitných alebo neanonymizovaných snímok.

---

## 4) Technická časť (architektúra) – stručne a zrozumiteľne

### 4.1 Architektonické princípy

1. **Client-side processing**
   - editácia prebieha v prehliadači,
   - dáta používateľa neopúšťajú klienta.

2. **Pipeline operácií (nedestruktívny prístup)**
   - úpravy sa reprezentujú ako postupnosť operácií,
   - výsledok sa skladá z „base state + operations“,
   - pipeline používa checkpointy pre efektívnejší re-render.

3. **Modulárny návrh nástrojov**
   - nástroje sú definované konfiguračne,
   - vykonávanie operácií je mapované cez operation registry,
   - ľahšie rozšírenie o nové nástroje bez zásahu do jadra UI.

4. **Hybridný model Canvas + SVG**
   - rastrové úpravy bežia nad canvasom,
   - prezentačné/vektorové prvky (napr. objekty/rámiky) sú riešené vrstvou SVG.

### 4.2 Jednoduchá architektonická schéma na plagát

Odporúčaná vizualizácia (blokový diagram):

**Import (Image/PDF/Clipboard) → Render pipeline (operations + checkpoints) → Tool layer (crop/frame/blur/…) → Export (PNG/JPEG/PDF/clipboard)**

Doplň bočné bloky:
- **State management:** Pinia stores (editor/image/ui/history/presets),
- **i18n:** viacjazyčné UI,
- **UX:** guided tutorial + kontextové tipy.

---

## 5) Technická časť „Ako to funguje“ (3 konkrétne mini-príbehy)

Na plagáte odporúčam mať 3 malé technické boxy:

### A) Fit Crop (detekcia obsahu)
- prevod na grayscale + potlačenie šumu,
- detekcia hrán,
- výpočet bounding boxu relevantného obsahu,
- jemné doladenie citlivosti podľa typu obrázka.

**Message pre porotu:** rýchly „one-click“ crop bez manuálneho ladienia a bez straty podstatného obsahu.

### B) Image Analysis (detekcia artefaktov)
- najprv kontrola, či má obraz vhodný typ pozadia,
- následne analýza vysokofrekvenčných zmien jasu,
- odlíšenie izolovaného šumu od reálnych hrán objektov,
- vizuálna mapa problémových miest pre používateľa.

**Message pre porotu:** editor nielen upravuje, ale aj upozorňuje na kvalitu vstupu.

### C) Frame tool (vektorové orámovanie)
- rám je samostatná SVG vrstva,
- parametrovateľný layout (okraje, rohy, hlavičky, prvky zariadenia),
- ostrý výstup pri škálovaní.

**Message pre porotu:** konzistentný „publication-ready“ vzhľad bez degradácie kvality.

---

## 6) Prezentačná časť (čo to dokáže)

### 6.1 Funkcie, ktoré určite vizuálne ukázať

Top 6 funkcií na demo obrázkoch:
1. Auto Crop (pred/po),
2. Frame (desktop/mobile frame),
3. Magnify Area (zvýraznenie detailu),
4. Blur Area (anonymizácia),
5. Text + Shape anotácie,
6. Presets (rovnaká séria úprav na viac obrázkov).

### 6.2 Kompozícia „pred vs. po“

Použi 3 páry obrázkov:
- **Pár 1:** surový screenshot → crop + frame,
- **Pár 2:** screenshot s citlivými údajmi → blur + anotácia,
- **Pár 3:** viac obrázkov → jednotný štýl cez preset.

Takto porota vidí reálny dopad nástroja za pár sekúnd.

---

## 7) Merateľná časť (čo dodať ako dôkaz kvality)

Ak máš priestor, pridaj mini „evidence panel“:
- počet implementovaných nástrojov,
- podpora viac vstupov (súbor, drag&drop, clipboard, PDF),
- používateľské testovanie (iterácie + hlavné zistenia),
- stabilita (unit testy komponentov/composables),
- dostupná verejná verzia aplikácie.

Tip: aj 2–3 stručné metriky pôsobia veľmi profesionálne.

---

## 8) Návrh štruktúry plagátu (A1/A0)

### Horná tretina
- Názov projektu + slogan,
- problém a motivácia,
- „pre koho“ + hlavný prínos.

### Stredná tretina
- architektúra (diagram),
- 3 technické boxy (fit crop, image analysis, frame),
- tech stack (Vue 3, Pinia, Vite, Canvas/SVG, PDF nástroje).

### Dolná tretina
- ukážky pred/po,
- feature highlights,
- QR kód na live demo + repozitár,
- autor + škola + vedúci.

---

## 9) Krátky „pitch text“ priamo na plagát

**Figurio rieši praktický problém prípravy obrázkov do odborných textov: znižuje čas úprav, zvyšuje konzistenciu výstupov a chráni súkromie používateľa lokálnym spracovaním dát. Aplikácia kombinuje intuitívne používateľské rozhranie s modulárnou pipeline operácií, vďaka čomu ponúka efektívne nástroje pre crop, anotácie, anonymizáciu, prezentačné rámiky a export do publikačne vhodných formátov.**

---

## 10) Čo by porota na Excel@FIT mohla oceniť (a treba to explicitne povedať)

- jasný „problem-solution fit“ pre akademickú prax,
- technická hĺbka, ale stále praktický dopad,
- dôraz na súkromie (lokálne spracovanie),
- kvalitný UX návrh + iteratívne testovanie,
- pripravenosť projektu na reálne používanie (nasadená verzia).

---

## 11) Checklist pred tlačou plagátu

- [ ] Je z titulku do 3 sekúnd jasné, čo Figurio rieši?
- [ ] Je tam aspoň 1 architektonický diagram?
- [ ] Sú tam minimálne 3 technické „ako to funguje“ bloky?
- [ ] Sú tam jasné pred/po ukážky s čitateľnými popismi?
- [ ] Je tam QR na live demo?
- [ ] Je text stručný (max ~250–350 slov mimo popisiek)?
- [ ] Má plagát jeden vizuálny štýl (farby, typografia, ikonografia)?

