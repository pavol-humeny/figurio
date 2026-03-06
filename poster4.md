# Podklady pre plagát projektu **Figurio** (Excel@FIT 2026)

## 1) Hlavná myšlienka (čo musí byť na plagáte vidieť za 5 sekúnd)

**Figurio** je webová aplikácia na rýchlu úpravu obrázkov pre akademické a technické texty.
Kľúčový prínos: kombinácia **jednoduchého UI**, **nástrojov pre odborné screenshoty/obrázky** a **spracovania dát lokálne v prehliadači** (bez odosielania obrázkov na server).

**One-liner na plagát:**
> „Upravím obrázok do práce za minútu – priamo v prehliadači, bezpečne a bez inštalácie.“

---

## 2) Problém a motivácia

- Pri písaní odborných textov sú obrázky dôležité, ale ich úprava býva zdĺhavá.
- Bežné nástroje sú často príliš komplexné pre jednoduché akademické použitie.
- Pri online nástrojoch vzniká otázka súkromia (nahrávanie citlivých screenshotov).

**Posolstvo:** Figurio rieši praktický problém študentov a autorov technických dokumentov.

---

## 3) Kľúčové funkcionality (feature blok)

Odporúčaný výber funkcií na plagát (max 6–8 ikon):

1. **Import**: PNG, JPG/JPEG, WebP, PDF + drag&drop + vloženie zo schránky.
2. **Orezanie a základné úpravy** pre rýchlu prípravu obrázkov.
3. **Anotácie a zvýraznenie** (tvary, šípky, textové prvky podľa potreby).
4. **Rozmazanie oblasti** (anonymizácia citlivých častí).
5. **Lupa / zväčšenie oblasti** na dôraz detailu.
6. **Rámiky** s fyzicky konzistentnou hrúbkou.
7. **Šablóny (presety)** pre opakované použitie úprav jedným klikom.
8. **Export** do rastrových formátov a PDF.

---

## 4) Technická časť – ako to funguje

### Architektúra (jednoduchý diagram)

Použi 3 vrstvy:

- **UI vrstva (Vue komponenty)**
  - toolbar, canvas/workspace, panel nastavení
- **Aplikačná logika**
  - nástroje, pipeline operácií, import/export
- **Stav aplikácie (Pinia)**
  - centralizovaný reaktívny stav, história operácií

### Technologický stack (krátko)

- **Frontend:** Vue.js (+ Vite)
- **State management:** Pinia
- **Routing:** vue-router
- **i18n:** vue-i18n
- **PDF:** jsPDF, svg2pdf, pdf-lib
- **Testy:** Vitest + jsdom

### Dôležité princípy implementácie

- **Client-side processing:** obrazové dáta sa spracujú lokálne v prehliadači.
- **Kombinácia raster + vektor:** podľa typu operácie (kvalita + flexibilita).
- **Pipeline operácií:** úpravy sa aplikujú ako sekvencia krokov.
- **Asynchrónne spracovanie náročnejších operácií** kvôli plynulosti UI.
- **Undo/Redo + okamžitá spätná väzba** pre bezpečnú prácu používateľa.

---

## 5) UX a návrhové zásady (čo odkomunikovať porote)

- Konzistentné rozhranie a vizuálna hierarchia (dominantná pracovná plocha).
- Dynamický pravý panel: zobrazuje len nastavenia aktívneho nástroja.
- Minimalizácia kognitívnej záťaže: používateľ vidí iba relevantné voľby.
- Predvídateľné ovládanie podľa zaužívaných konvencií grafických editorov.

---

## 6) Výsledky a validácia

Na plagáte prezentuj 2 roviny validácie:

1. **Automatické testovanie**
   - jednotkové testy základných stavebných blokov (Vitest).
2. **Používateľské testovanie**
   - identifikované UX problémy a ich následné opravy.

Tip: ukáž „pred/po“ mini-príklad z používateľského testovania (napr. zrozumiteľnosť ovládania).

---

## 7) Návrh štruktúry plagátu (A1/A0)

### Horná tretina
- **Názov + claim + 1 hero screenshot aplikácie**
- Jednovetový problém + jednovetové riešenie

### Stredná ľavá časť
- **Architektúra a technický princíp**
  - 3-vrstvový diagram
  - pipeline: import → úpravy → export

### Stredná pravá časť
- **Funkcie a demo schopnosti**
  - ikony nástrojov + krátke popisy
  - ukážky „before/after“ pre 3 najsilnejšie funkcie

### Spodná časť
- **Overenie a dopad**
  - testovanie, spätná väzba používateľov
  - QR kód na live demo/repozitár
  - „budúci rozvoj“ (2–3 body)

---

## 8) Krátky prezentačný scenár k plagátu (60–90 sekúnd)

1. **Problém (10 s):** Študenti riešia obrázky do prác v zložitých nástrojoch.
2. **Riešenie (15 s):** Figurio = webový editor pre akademické použitie, bez inštalácie.
3. **Technika (20 s):** Vue + Pinia + client-side pipeline, import/export vrátane PDF.
4. **Demo funkcií (25 s):** blur citlivých dát, lupa detailu, rámik, šablóna.
5. **Dôkaz kvality (10 s):** testovanie + iterácie podľa spätnej väzby.
6. **Záver (5 s):** praktický nástroj pripravený na reálne použitie.

---

## 9) Čo si pripraviť na Excel@FIT porotu

- 3 konkrétne „use-case“ ukážky (napr. screenshot UI, graf, technický diagram).
- 1 technická otázka do hĺbky (prečo kombinácia raster/vektor).
- 1 produktová otázka (prečo je to lepšie ako univerzálne editory).
- 1 bezpečnostná otázka (ako je riešené súkromie dát).

---

## 10) Rýchly checklist pred tlačou plagátu

- [ ] Názov + claim čitateľný z 2 m
- [ ] Jasne viditeľný problém vs. riešenie
- [ ] Technická architektúra (1 diagram)
- [ ] 3 až 4 najsilnejšie funkcionality s vizuálnou ukážkou
- [ ] Stručné výsledky testovania / overenia
- [ ] QR kód na demo
- [ ] Konzistentná farebnosť a typografia

