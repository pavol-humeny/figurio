# 🎤 5-min pitch (obhajoba BP)

---

## 🟢 1. Úvod (cca 30–40 s)

Dobrý deň,  
mojou bakalárskou prácou je návrh a implementácia webovej aplikácie **Figurio**, ktorá slúži na rýchlu úpravu obrázkov určených pre odborné a akademické texty.

Motiváciou práce bol fakt, že existujúce nástroje, ako napríklad Photoshop alebo Canva, sú buď príliš komplexné, alebo nie sú prispôsobené potrebám technických dokumentov, napríklad pri práci s LaTeXom. Úprava obrázkov je tak často zdĺhavá a neefektívna.

Cieľom práce preto bolo navrhnúť nástroj, ktorý umožní vykonávať najčastejšie úpravy jednoducho, rýchlo a priamo v prehliadači.

---

## 🟢 2. Riešenie (cca 1 min)

Výsledkom je webová aplikácia implementovaná ako **Single Page Application** pomocou frameworku Vue.js.

Aplikácia poskytuje sadu nástrojov, medzi ktoré patrí:
- orezanie obrázka,
- zvýraznenie detailov,
- rozmazanie citlivých oblastí,
- pridávanie prezentačných rámikov,
- a export do rôznych formátov.

Kľúčovým aspektom riešenia je, že **celé spracovanie prebieha na strane klienta**, teda priamo v prehliadači. To znamená, že žiadne dáta nie sú odosielané na server, čo zabezpečuje ochranu súkromia používateľa.

Aplikácia je zároveň dostupná online bez potreby inštalácie.

---

## 🟢 3. Architektúra a implementácia (cca 1.5 min)

Z architektonického hľadiska ide o **client-heavy SPA aplikáciu** s modulárnym návrhom.

Aplikácia je rozdelená do viacerých logických vrstiev:
- prezentačná vrstva (UI komponenty),
- aplikačná logika (composables a spracovanie operácií),
- a dátová vrstva reprezentovaná stavom aplikácie.

Pri spracovaní obrazových dát je využitá kombinácia:
- **canvasu** pre rastrové operácie,
- a **SVG** pre vektorové prvky, ako sú rámiky alebo anotácie.

Dôležitou súčasťou je aj spracovanie PDF súborov, kde sa aplikácia pokúša zachovať vektorovú reprezentáciu pomocou konverzie do SVG, a iba v prípade potreby používa rasterizáciu.

Celý systém je navrhnutý ako pipeline operácií, ktoré sa aplikujú na obraz postupne, čo umožňuje flexibilné kombinovanie úprav.

---

## 🟢 4. Testovanie (cca 40 s)

Funkcionalita aplikácie bola overená kombináciou:
- automatických testov,
- a používateľského testovania.

Používateľské testovanie prebiehalo iteratívne počas vývoja a slúžilo najmä na zlepšenie použiteľnosti a používateľského rozhrania.

Na základe spätnej väzby boli upravené napríklad interakcie nástrojov, rozloženie prvkov a celkový workflow práce s aplikáciou.

---

## 🟢 5. Prínos práce (cca 40 s)

Hlavným prínosom práce je návrh a implementácia **špecializovaného nástroja pre akademické použitie**, ktorý zjednodušuje prípravu vizuálnych materiálov pre technické dokumenty.

Dôležitým aspektom je tiež využitie **moderných webových technológií na spracovanie obrazových dát priamo na strane klienta**, čo eliminuje potrebu backendového spracovania a zvyšuje bezpečnosť.

Aplikácia zároveň demonštruje, že aj komplexnejšie operácie nad obrazom je možné efektívne realizovať v prostredí webového prehliadača.

---

## 🟢 6. Záver (cca 20–30 s)

V budúcnosti je možné aplikáciu rozšíriť napríklad o:
- pokročilé nástroje založené na umelej inteligencii,
- dávkové spracovanie obrázkov,
- alebo kolaboratívne funkcie.

Ďakujem za pozornosť.

---

## 🧠 Tipy

- hovoriť pomalšie než si myslíš  
- zdôrazniť: **client-side processing + akademické použitie**  
- nevnímať to ako čítanie, ale vysvetľovanie  