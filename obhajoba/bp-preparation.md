# 📚 Príprava na obhajobu – kľúčové body podľa kapitol

---

## 🟢 1. Úvod

- Prečo sú obrázky dôležité v akademických textoch  
- Problém: existujúce nástroje sú buď komplexné alebo nevhodné  
- Potreba jednoduchého a špecializovaného nástroja  
- Zameranie na LaTeX / Overleaf workflow  
- Dôraz na rýchlosť a jednoduchosť úprav  
- Dôraz na dostupnosť (webová aplikácia, bez inštalácie)  
- Dôraz na súkromie (citlivé dáta v obrázkoch)  
- Cieľ práce (navrhnúť + implementovať aplikáciu)  
- Typické operácie: crop, highlight, blur, frame  
- Výsledok: funkčná webová aplikácia  
- Štruktúra práce (teória → analýza → návrh → implementácia → testovanie)

👉 Vedieť vysvetliť:
- prečo nestačí Photoshop/Canva  
- prečo práve akademické použitie  

---

## 🟢 2. Vývoj moderných webových aplikácií

- Klient–server architektúra  
- Trojvrstvová architektúra (prezentačná / aplikačná / dátová)  
- REST architektúra (Fielding)  
- REST constraints (stateless, cache, uniform interface…)  
- REST API (GET, POST, PUT, DELETE)  
- SPA vs MPA  
- Výhody SPA (interaktivita, rýchlosť)  
- Nevýhody SPA (komplexnosť, initial load)  
- MPA charakteristika  
- Reaktivita (event-driven model)  
- Deklaratívny prístup (Vue, React)  
- UI/UX princípy (jednoduchosť, konzistentnosť, spätná väzba)  
- „Don’t make me think“ princíp  
- Interakčné vzory (menu, modály, feedback)

👉 Vedieť vysvetliť:
- prečo si zvolil SPA  
- čo znamená reaktivita v praxi  

---

## 🟢 3. Reprezentácia a spracovanie obrazu

- Raster vs vektor  
- Pixelová reprezentácia obrazu  
- Farebné modely (RGB)  
- Operácie nad obrazom (filtering, transformácie)  
- Lokálne vs globálne operácie  
- Konvolučné filtre (blur atď.)  
- Hrany a detekcia (napr. Canny – ak používaš)  
- Transformácie (scale, rotate, crop)  
- Strata kvality pri rasterizácii  
- Výhody vektorovej grafiky  
- Kombinácia raster + vector  
- PDF ako zdroj dát  
- Problém konverzie PDF → obraz  
- Zachovanie kvality pri úpravách  

👉 Vedieť vysvetliť:
- prečo je dôležité SVG  
- prečo sa snažíš nerasterizovať PDF  

---

## 🟢 4. Analýza

- Identifikácia cieľových používateľov  
- Typické scenáre použitia (LaTeX, dokumentácia)  
- Požiadavky na aplikáciu (funkčné aj nefunkčné)  
- Jednoduchosť použitia ako hlavný cieľ  
- Výkon (rýchle operácie)  
- Bezpečnosť (client-side)  
- Analýza existujúcich riešení  
- Photoshop – silný, ale komplexný  
- Canva – jednoduchá, ale nevhodná pre technické veci  
- Iné online editory  
- Nedostatky existujúcich riešení  
- Definovanie feature setu aplikácie  
- Prioritizácia funkcií  
- UX požiadavky  

👉 Vedieť vysvetliť:
- v čom sa Figurio líši  
- prečo si vybral tieto funkcie  

---

## 🟢 5. Návrh

- Návrh UI (wireframe vs finálne UI)  
- Layout aplikácie  
- Rozdelenie nástrojov  
- Workflow používateľa  
- Minimalizácia kognitívnej záťaže  
- Konzistentnosť UI  
- Návrh funkcionality nástrojov  
- Návrh dátovej reprezentácie (operácie nad obrazom)  
- Návrh architektúry aplikácie  
- Modulárny prístup (composables)  
- Oddelenie logiky a UI  
- Návrh interakcií (drag, klik, hover)  
- Návrh exportu  
- Návrh práce s PDF  
- Použitie UX princípov v návrhu  

👉 Vedieť vysvetliť:
- ako si navrhoval UI  
- prečo je UI jednoduché  

---

## 🟢 6. Implementácia

- Použité technológie (Vue, Vite, Pinia…)  
- SPA architektúra  
- Stav aplikácie (store)  
- Rendering pipeline  
- Canvas vs SVG  
- Vrstvy (image, overlay, frame)  
- Implementácia nástrojov (crop, blur, highlight…)  
- Operácie ako pipeline  
- PDF spracovanie (SVGGraphics, fallback raster)  
- Export (PNG, JPG, PDF…)  
- Práca s Web Workers (ak máš)  
- Performance optimalizácie  
- UI komponenty a composables  
- Reaktivita Vue  
- Modularita a rozšíriteľnosť  

👉 Vedieť vysvetliť:
- prečo canvas + SVG  
- ako funguje pipeline  
- ako riešiš výkon  

---

## 🟢 7. Testovanie a vyhodnotenie

- Automatické testovanie (Vitest)  
- Testovanie komponentov  
- Simulácia interakcií  
- Problémy s testovaním (napr. canvas v jsdom)  
- Používateľské testovanie  
- Iteratívny vývoj  
- Zber spätnej väzby  
- Úpravy na základe feedbacku  
- UX zlepšenia  
- Vyhodnotenie výsledkov  
- Silné stránky riešenia  
- Slabé stránky riešenia  
- Limity aplikácie  
- Praktické využitie  
- Nasadenie (GitHub Pages + PWA)  

👉 Vedieť vysvetliť:
- ako si testoval  
- čo si zmenil na základe testovania  

---

## 🟢 8. Záver

- Zhrnutie cieľov  
- Zhodnotenie výsledku  
- Hlavné prínosy práce  
- Praktická využiteľnosť  
- Technologický prínos  
- Limity riešenia  
- Možnosti rozšírenia  
- AI integrácia  
- Batch processing  
- Collaboration  
- Budúci vývoj  
- Nasadenie v praxi  

👉 Vedieť vysvetliť:
- čo je najväčší prínos  
- kam by sa to dalo posunúť  

---

# 🎯 Najdôležitejšie (ak si máš zapamätať len pár vecí)

- client-side processing (privacy + výkon)  
- špecializácia na akademické použitie  
- pipeline spracovania obrazu  
- kombinácia canvas + SVG  
- rozdiel oproti existujúcim nástrojom  