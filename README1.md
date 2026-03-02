# Figurio

> **Webová aplikácia na úpravu obrázkov vytvorená v rámci bakalárskej práce (FIT VUT, 2025/2026).**

Figurio je moderný editor obrázkov postavený na **Vue 3 + Vite**, zameraný na jednoduchú, rýchlu a praktickú úpravu rastrových aj vybraných PDF vstupov. Projekt obsahuje aj podporu pre zber anonymizovaných usage štatistík a samostatnú štatistickú sekciu pre vyhodnocovanie používania.

---

## Obsah

- [1. Ciele projektu](#1-ciele-projektu)
- [2. Hlavné funkcionality](#2-hlavné-funkcionality)
- [3. Použité technológie](#3-použité-technológie)
- [4. Architektúra aplikácie](#4-architektúra-aplikácie)
- [5. Požiadavky na prostredie](#5-požiadavky-na-prostredie)
- [6. Spustenie projektu lokálne](#6-spustenie-projektu-lokálne)
- [7. Dostupné npm skripty](#7-dostupné-npm-skripty)
- [8. Konfigurácia](#8-konfigurácia)
- [9. Testovanie](#10-testovanie)
- [10. Nasadenie](#11-nasadenie)
- [11. Lokalizácia](#12-lokalizácia)
- [12. Štruktúra repozitára](#13-štruktúra-repozitára)
- [13. Známé limity a odporúčania](#14-známe-limity-a-odporúčania)
- [14. Autor a kontakt](#15-autor-a-kontakt)
- [15. Licencia](#16-licencia)

---

## 1. Ciele projektu

Hlavným cieľom projektu je vytvoriť používateľsky prívetivý webový editor obrázkov, ktorý:

- pokrýva bežné úpravy obrázkov vyžadované pri príprave obrázkov do odborných textov,
- funguje priamo v prehliadači bez nutnosti inštalácie desktopového softvéru,
- podporuje viacjazyčné prostredie,
- umožňuje sledovať anonymizované používanie aplikácie pre účely vyhodnotenia bakalárskej práce.

---

## 2. Hlavné funkcionality

Aplikácia obsahuje nástroje pre:

- **Crop (orez)**
- **Frame (rámik)**
- **Grayscale (odtiene šedej)**
- **Background Removal (odstránenie pozadia)**
  - auto
  - manual
  - color
- **Brush / Pencil (kreslenie)**
- **Select (výber objektov)**
- **Shape (tvary: rectangle, ellipse, line)**
- **Text**
- **Blur**
- **Magnify Area (lokálne zväčšenie)**
- **Transformácie**
  - rotate
  - flip
  - resize
- **Presety operácií**
- **Export**

Ďalšie vlastnosti:

- podpora viacerých jazykov (**EN, SK, CZ**),
- svetlý/tmavý režim,
- tutorial/feature-tour režim,
- klávesové skratky,
- štatistická sekcia návštev a udalostí.

---

## 3. Použité technológie

### Frontend
- **Vue 3** (Composition API)
- **Vite**
- **Pinia** (state management)
- **Vue Router**
- **Vue I18n**

### Práca s obrázkami/PDF a vizualizácia
- **pdf-lib**, **pdfjs-dist**
- **jspdf**, **svg2pdf.js**
- **three**
- **chart.js** + **vue-chartjs**

### Vývoj a kvalita
- **ESLint**
- **Prettier**
- **Vitest** + **@testing-library/vue**

---

## 4. Architektúra aplikácie

Projekt je postavený modulárne:

- `src/views` – hlavné stránky (`Home`, `Editor`, `Statistics`, `Maintenance`),
- `src/components` – znovupoužiteľné UI komponenty,
- `src/composables` – business logika rozdelená podľa domén (editor, tools, modals, common...),
- `src/config` – centrálne konfiguračné súbory,
- `src/locales` – preklady,
- `src/services` – API a pomocné služby,
- `tests/unit` – unit testy komponentov/composables.

Routing používa hash históriu a obsahuje guard pre maintenance režim.

---

## 5. Požiadavky na prostredie

Odporúčané verzie:

- **Node.js 20+**
- **npm 10+**

> Poznámka: Staršie verzie Node.js môžu spôsobovať problémy pri build/test krokoch.

---

## 6. Spustenie projektu lokálne

```bash
# 1) Inštalácia závislostí
npm install

# 2) Spustenie development servera
npm run dev
```

Aplikácia bude dostupná štandardne na adrese vypísanej vo Vite výstupe (zvyčajne `http://localhost:5173`).

---

## 7. Dostupné npm skripty

```bash
npm run dev          # vývojový server
npm run build        # produkčný build
npm run preview      # lokálny náhľad produkčného buildu
npm run lint         # eslint --fix
npm run format       # prettier pre src/
npm run test         # vitest
npm run test:ui      # vitest UI
npm run deploy       # deployment script
npm run deploy:push  # deployment push script
npm run i18n:export  # export prekladov do xlsx
npm run i18n:import  # import prekladov z xlsx
npm run generate:api # generovanie klienta z openapi.yaml
```

---

## 8. Konfigurácia

Hlavná runtime konfigurácia je v súbore:

- `src/config/globalConfig.js`

Tu je možné meniť napríklad:

- default jazyk a tému,
- zapnutie/vypnutie feature flags pre nástroje,
- API base URL,
- správanie usage štatistík,
- limity (počet otvorených/nahrávaných súborov),
- maintenance mód.

Pri zmene konfigurácie odporúčam skontrolovať kompatibilitu s prekladmi a UI.

---

## 9. Testovanie

Základné spustenie testov:

```bash
npm run test -- --run
```

Odporúčaný minimálny workflow pred odovzdaním:

```bash
npm run lint
npm run test -- --run
npm run build
```

---

## 10. Nasadenie

Repozitár obsahuje helper skripty:

- `deploy.sh`
- `deployPush.sh`

Presný spôsob nasadenia závisí od cieľovej infraštruktúry. Pred nasadením odporúčam:

1. upraviť URL/API konfiguráciu,
2. overiť produkčný build,
3. skontrolovať CORS a dostupnosť backend endpointov,
4. overiť fungovanie štatistík iba v želanom režime.

---

## 11. Lokalizácia

Preklady sú v priečinku:

- `src/locales/{en,sk,cz}`

Na import/export prekladov je pripravený workflow cez XLSX:

```bash
npm run i18n:export
npm run i18n:import
```

Súvisiaci súbor:

- `translations.xlsx`

---

## 12. Štruktúra repozitára

```text
figurio/
├─ src/
│  ├─ components/
│  ├─ composables/
│  ├─ config/
│  ├─ locales/
│  ├─ router/
│  ├─ services/
│  └─ views/
├─ tests/
├─ scripts/
├─ public/
├─ openapi.yaml
└─ README.md
```

---

## 13. Známé limity a odporúčania

- Výkon pri veľkých súboroch závisí od zariadenia a prehliadača.
- Niektoré PDF/SVG kombinácie môžu vyžadovať rasterizáciu.
- Pri cross-browser testovaní venuj pozornosť hlavne Safari špecifikám.

---

## 14. Autor a kontakt

**Autor:** Pavol Humený  
**Škola:** Fakulta informačných technológií, VUT v Brne  
**Akademický rok:** 2025/2026  
**E-mail:** pavol.humeny@gmail.com

---

## 15. Licencia

Licencia zatiaľ nie je explicitne uvedená.

Ak chceš projekt zverejniť ako open source, doplň prosím `LICENSE` súbor (napr. MIT/Apache-2.0) a aktualizuj túto sekciu.