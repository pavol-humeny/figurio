# Figurio – návrh obsahu plagátu pre Excel@FIT 2026

## 1) Hlavná myšlienka plagátu (jedna veta)
**Figurio je webový editor obrázkov pre akademické a technické dokumenty, ktorý beží priamo v prehliadači, spracúva dáta lokálne a zrýchľuje prípravu kvalitných ilustrácií bez zbytočne komplexných nástrojov.**

---

## 2) Čo musí byť na plagáte (priority)

### A. Problém a motivácia (ľavý horný blok)
- Bežné editory sú pre potreby technických textov často príliš komplexné.
- Pri písaní BP/DP/článkov je potrebná rýchla a konzistentná úprava screenshotov, diagramov a ilustrácií.
- Dôležitá je ochrana dát (napr. interné screenshoty, citlivé UI informácie).

**Krátky claim:**
> „Menej času v editore, viac času na obsah práce.“

### B. Riešenie (stred plagátu)
- Webová aplikácia bez inštalácie.
- Lokálne spracovanie obrázkov na strane klienta.
- Nástroje orientované na akademické použitie: Crop, Frame, Blur Area, Magnify Area, anotácie, text, shape, presets, export.

### C. Technická časť (pravý horný blok)
- **Frontend stack:** Vue 3 + Pinia + Vite.
- **Render vrstva:** HTML Canvas + SVG.
- **Pipeline prístup:** operácie sú registrované v `operationRegistry` a aplikované cez `useImagePipeline`.
- **Optimalizácia výkonu:** checkpointy pre drahšie operácie (`cost: high`) a postupný re-render.
- **Rozšíriteľnosť:** nové operácie sa dajú doplniť cez registry mapovanie typu operácie na executor.
- **PDF workflow:** podpora vektorového spracovania PDF (s rasterizáciou iba keď je nutná).
- **Voliteľný backend pre štatistiky:** Node.js/Express/MySQL oddelený od core editora.

### D. Výsledok a prínos (pravý stred)
- Rýchla príprava obrázkov do LaTeX/Overleaf dokumentov.
- Jednotný vizuálny štýl v práci (frame/presets).
- Anonymizácia citlivých častí (blur).
- Zvýraznenie detailov bez straty kontextu (magnify area).

### E. Demo a funkcie (spodný pás)
- Sekcia „Čo to dokáže“: 4–6 screenshotov pred/po (crop, blur, frame, magnify, text/shape, export).
- Stručný scenár reálneho použitia: „screenshot z aplikácie → anonymizácia → zvýraznenie detailu → export do práce“.

---

## 3) Návrh technického bloku (text pripravený na plagát)

### Architektúra aplikácie
Figurio používa modulárnu architektúru. Prezentačná vrstva je oddelená od aplikačnej logiky (`composables`), stavovej vrstvy (`stores`) a služieb import/export. Operácie úprav sa vykonávajú cez pipeline, ktorá aplikuje transformácie nad obrazom, priebežne ukladá checkpointy a podľa potreby vykonáva čiastočný alebo plný re-render.

### Spracovanie obrazu
- Operácie ako rotate/flip/crop/resize/grayscale/remove-noise/background-removal sú centralizované cez registry.
- Pipeline pracuje so stavom `canvas + overlay (+ PDF bytes)`.
- Pri náročných operáciách sa využívajú checkpointy, ktoré zrýchľujú undo/redo a opakované renderovanie.

### Dizajnové princípy riešenia
1. **Privacy-first:** lokálne spracovanie dát ako default.
2. **Task-oriented UX:** nástroje navrhnuté pre pracovný tok akademického používateľa.
3. **Modularita a rozšíriteľnosť:** jasné rozhrania pre dopĺňanie operácií.
4. **Deterministický výstup:** reprodukovateľné úpravy vhodné pre odborné dokumenty.

---

## 4) Návrh prezentačnej časti (čo ukazovať naživo)

### Demo flow na 90 sekúnd
1. Načítať screenshot/PDF.
2. Urobiť **fit crop** na odstránenie prázdnych okrajov.
3. Pridať **blur area** na anonymizáciu citlivých údajov.
4. Pridať **magnify area** na kľúčový detail.
5. Aplikovať **frame** pre profesionálny vzhľad.
6. Exportovať a vložiť do dokumentu.

### Jednovetové komentáre počas dema
- „Všetko ide lokálne v prehliadači.“
- „Používam workflow, ktorý cieli priamo na obrázky do technickej dokumentácie.“
- „Výstup je konzistentný a reprodukovateľný naprieč celou prácou.“

---

## 5) Odporúčané rozloženie plagátu (A1 na výšku)

### Horná tretina
- Názov projektu + tagline + QR na živú verziu.
- Krátky problém a motivácia.

### Stredná tretina
- Architektúra (diagram):
  - UI (Vue komponenty)
  - Stores (Pinia)
  - Composables (tool logic)
  - Image pipeline + operation registry
  - Canvas/SVG render
  - Import/Export + PDF vrstva
- Kľúčové technológie a princípy.

### Spodná tretina
- „Pred vs. Po“ ukážky funkcií.
- Mini use-case pipeline (6 krokov).
- Zhrnutie prínosu + budúci rozvoj.

---

## 6) Texty, ktoré sa dajú prebrať priamo na plagát

### Tagline možnosti
- „Akademický image editor pre technické dokumenty.“
- „From screenshot to publication-ready figure.“
- „Lokálne, rýchlo, reprodukovateľne.“

### Sekcia „Prínos“
- Skrátenie času potrebného na prípravu obrázkov.
- Zníženie bariéry oproti profesionálnym grafickým editorom.
- Vyššia konzistencia vizuálov v odborných textoch.

### Sekcia „Ďalší rozvoj“
- Pokročilejšie preset pipeline.
- Rozšírené exportné profily pre publikácie.
- Lepšia automatická detekcia oblastí pre crop/blur.

---

## 7) Checklist pred tlačou
- [ ] Je z 1 metra jasné **čo projekt rieši**?
- [ ] Je viditeľné **prečo je to technicky zaujímavé** (pipeline/registry/checkpointy)?
- [ ] Sú tam minimálne 3 silné „pred/po“ ukážky?
- [ ] Je tam QR kód na živú verziu + GitHub?
- [ ] Je text stručný (max ~700–900 slov) a vizuálne čitateľný?

---

## 8) Tip pre Excel@FIT porotu
Na plagáte zdôrazni kombináciu:
- **praktický dopad** (reálne použitie pri písaní technických textov),
- **inžinierska kvalita riešenia** (modulárna architektúra, pipeline, rozšíriteľnosť),
- **kvalita UX** (rýchly workflow a konzistentné výsledky).

Táto kombinácia pôsobí vyvážene: nielen „pekný UI nástroj“, ale plnohodnotný technický projekt s jasným use-case.
