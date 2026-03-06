# Návrh obsahu plagátu pre **Figurio** (excel@fit2026)

Tento návrh je postavený priamo na obsahu tvojej práce, aby plagát pôsobil odborne, ale zároveň bol vizuálne „pitch-ready“.

## 1) Hlavný message (čo má porota pochopiť za 10 sekúnd)

**Figurio = webový editor obrázkov pre akademické texty, ktorý je rýchly, intuitívny a chráni súkromie (lokálne spracovanie v prehliadači).**

Krátka verzia claimu pod názvom:

> „Rýchla úprava obrázkov a PDF pre odborné texty bez inštalácie a bez odosielania dát na server.“

---

## 2) Odporúčaná štruktúra plagátu (3 stĺpce)

## A. Ľavý stĺpec – Problém a motivácia

### Prečo to riešiť
- Obrázky sú kľúčové v odborných textoch, ale ich úprava je často zdĺhavá a komplikovaná.
- Bežné online editory sú buď preplnené, alebo nevhodné pre akademický workflow.
- Pri online nástrojoch je problém ochrana citlivých dát.

### Cieľ projektu
- Navrhnúť a implementovať **webovú aplikáciu** pre rýchlu úpravu obrázkov pre akademické použitie.
- Dôraz na: **jednoduchosť**, **efektívnosť**, **dostupnosť bez inštalácie**, **súkromie**.

### Cieľová skupina
- Študenti, autori technických správ, diplomanti, výskumníci.

---

## B. Stredný stĺpec – Technická časť (ako to funguje)

### Architektúra aplikácie (jednoduchý diagram)
Použi blokový diagram v tomto duchu:

1. **Prezentačná vrstva (Vue komponenty)**
   - editor, panel nástrojov, panel nastavení, export dialóg
2. **Aplikačná vrstva (logika nástrojov)**
   - operácie nad obrazom, workflow úprav, validácie
3. **Dátová vrstva (stav + model obrázka)**
   - Pinia store, história zmien (undo/redo), metadata

Doplň poznámku:
- **Image processing beží lokálne v prehliadači**.
- Backend je iba doplnkový na anonymné štatistiky používania.

### Technologický stack (ikony + 1 veta)
- **Vue.js + Vite** (SPA frontend)
- **Pinia** (globálny stav)
- **jsPDF, svg2pdf, pdf-lib** (PDF import/export pipeline)
- **Node.js + Express + MySQL** (telemetria používania)
- **Vitest + jsdom** (unit testy)

### Technické princípy, ktoré sa oplatí zvýrazniť
- **Privacy-first**: žiadne uploadovanie obsahu obrázkov.
- **Hybrid raster/vector prístup pre PDF**.
- **Asynchrónne spracovanie náročných operácií**.
- **Modulárnosť a rozšíriteľnosť nástrojov**.

---

## C. Pravý stĺpec – Demo a výsledky (čo to dokáže)

### Kľúčové funkcie (max 6, s mini screenshotmi)
1. Orezanie (vrátane fit crop)
2. Odstránenie pozadia
3. Rozmazanie citlivých oblastí
4. Zväčšenie detailu (magnify)
5. Rámiky/prezentačné prvky
6. Šablóny (opakované použitie úprav)

### Workflow používateľa (3 kroky)
**Import → Úprava → Export**
- Import: PNG/JPG/WebP/PDF, drag&drop, clipboard
- Úprava: interaktívne nástroje + okamžitý náhľad
- Export: voľba formátu, kvality, názvu + preview

### Overenie kvality
- Unit testy základných UI prvkov a helper funkcií
- Používateľské testovanie odhalilo UX problémy a viedlo ku konkrétnym zlepšeniam
- Telemetria používania pomohla analyzovať reálne správanie v aplikácii

### Prínos oproti existujúcim nástrojom
- Menej komplexity ako Photoshop
- Viac akademicky orientovaný workflow ako bežné online editory
- Dôraz na súkromie a prácu s PDF

---

## 3) Rýchly scenár prezentácie pri plagáte (60–90 sekúnd)

1. **Problém (15 s):**
   „Pri písaní odborných textov potrebujeme rýchlo upraviť obrázky, ale dostupné nástroje sú buď príliš zložité, alebo nechránia dáta.“

2. **Riešenie (20 s):**
   „Figurio je webová aplikácia zameraná na akademický workflow. Funguje bez inštalácie a obrazové dáta spracováva lokálne v prehliadači.“

3. **Technika (25 s):**
   „Aplikácia má 3-vrstvovú architektúru: UI vrstva vo Vue, logika nástrojov a dátová vrstva so stavom. Podporujeme rastrové obrázky aj PDF pipeline s hybridným vektor/raster prístupom.“

4. **Demo výsledku (20 s):**
   „Typický tok je import → úprava → export. Kľúčové nástroje sú crop, blur, background removal, rámiky a šablóny. Testovanie s používateľmi zlepšilo intuitívnosť ovládania.“

---

## 4) Čo určite vizuálne dať na plagát

- **1 hlavný hero screenshot editora**
- **1 architektonický diagram** (3 vrstvy)
- **1 pipeline diagram** (Import → Processing → Export)
- **6 malých screenshotov nástrojov**
- **QR kód** na repo/demo/video
- **„Key numbers“ box** (napr. počet testov, počet podporovaných formátov, jazyky UI)

---

## 5) Návrh titulku a podtitulku

### Variant A (technický)
**Figurio: Webový editor obrázkov pre akademické texty**

*Lokálne spracovanie, podpora PDF a intuitívny workflow pre rýchly export kvalitných vizuálov.*

### Variant B (pitch)
**Figurio – od surového obrázka k publikačnému výstupu za pár klikov**

*Privacy-first nástroj pre študentov a autorov odborných textov.*

---

## 6) Na čo sa porota môže pýtať (a čo odpovedať)

- **Prečo nie existujúci editor?**
  - Lebo cieľ je úzka akademická úloha: rýchle, opakovateľné úpravy bez zbytočnej komplexity.

- **Ako riešiš súkromie?**
  - Spracovanie obsahu je na klientovi, bez odosielania obrázkov na server.

- **Ako škáluje architektúra?**
  - Funkcie sú modulárne, stav je centralizovaný, nástroje sú oddelené od UI.

- **Čo sú limity?**
  - Niektoré PDF operácie vyžadujú rasterizáciu; rozdielna podpora medzi prehliadačmi (najmä Safari).

---

## 7) Finálny checklist pred tlačou

- Má plagát čitateľný príbeh: **problém → riešenie → technika → výsledky**?
- Je vidieť jasnú **novosť/prínos** oproti alternatívam?
- Vieš odprezentovať celý plagát do **90 sekúnd**?
- Je text stručný (max 20–25 % plochy), zvyšok vizuály?
- Je viditeľný kontakt + QR kód?

