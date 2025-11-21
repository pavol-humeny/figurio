# Užívateľské testovanie 1
### Testované časti 
Testovanie bolo zamerané na základné ovládanie aplikácie a navigáciu v nej, bez úpravy obrázkov.
- Úvodná obrazovka 
- Nastavenia 
- Nápoveda 
- Štatistiky 
- Tutoriál 
- Vloženie a export obrázka 

### Zameranie testovania (cieľ)
- čo ti pri tejto operácii chýbalo?
- čo sa stalo inak oproti očakávaniu?
- čo ti pri tejto operácii vadilo?
- čo by si zmenil?
- páčil sa ti dizajn?
- páčilo sa ti rozloženie?

### Hodnotenie použiteľnosti 
| Hodnotenie | Popis |
|------------|-------|
| 0 | užívateľ to nenašiel vôbec |
| 1 | užívateľ to našiel s veľkou nápovedou |
| 2 | užívateľ to našiel s malou nápovedou |
| 3 | užívateľ sa musel zamyslieť viac |
| 4 | užívateľ sa musel zamyslieť |
| 5 | užívateľ to našiel bez váhania |

## Otázky/úlohy 
1. Okno nastavení 
- zmena jazyka aplikácie
- zmena farebného režimu 
- prepínanie ostatných nastavení 

| Používateľ | Skóre |
|------------|-------|
| Užívateľ 1 | 5     |
| Užívateľ 2 | 5     |
| Užívateľ 3 | 5     |
| Výsledok   | 5     |


Poznámky/Zistenia
- Divný efekt pri hover nad prepínačom jazykov (príde mi to neintuitívne) 
- Zmena farebného režimu by mohla byť implementovaná rovnakým typom tlačidla ako ostatné veci (využiť toggle button)
- Nápoveda pre jazyk sa zobrazuje divne v sk a cz

---

2. Okno nastavení 
- aká je aktuálna verzia aplikácie 
- zisti dátum vydania konkrétnej verzie aplikácie 

| Používateľ | Skóre |
|------------|-------|
| Užívateľ 1 |  4     |
| Užívateľ 2 |   5    |
| Užívateľ 3 |   5    |
| Výsledok   | 4.7     |

Poznámky/Zistenia
- Nezaujíma ma to ale nie je to výrazné takže to je asi fajn 
---

3. Nápoveda, tutoriál 
- Spusti tutoriál

| Používateľ | Skóre |
|------------|-------|
| Užívateľ 1 |  4    |
| Užívateľ 2 |  4    |
| Užívateľ 3 |  5    |
| Výsledok   | 4.3     |

Poznámky/Zistenia
- Kratší popis, len tak na 2 riadky a mať možnosť to rozkliknúť pre podrobnejší popis
- Možnosť otvoriť pravý panel (panel s nastavením nástrojov) počas tutoriálu
- Dĺžka popisu je vyhovujúca
- Zvýraznenie len tých častí, ktorých sa to týka 
- Zvýraznenie by mohlo mať zaoblené rohy aby to ladilo so zvyškom
- Export je zahrnutý v 2 krokoch tutoriálu 
---

4. Nápoveda, štatistiky
- Zobraz štatistiky 

| Používateľ | Skóre |
|------------|-------|
| Užívateľ 1 |  5    |
| Užívateľ 2 |  4    |
| Užívateľ 3 |  4    |
| Výsledok   | 4.3     |

Poznámky/Zistenia
- Hapruje zobrazenie správneho jazyku pri prepínaní (to isté pri dark/light režime)
---

5. Privacy and data 
- Vymaž užívateľské preferencie aplikácie 

| Používateľ | Skóre |
|------------|-------|
| Užívateľ 1 |  3    |
| Užívateľ 2 |  3    |
| Užívateľ 3 |  4    |
| Výsledok   | 3.3   |

Poznámky/Zistenia
- Skôr to spraviť ako tlačidlo, takto to vyzerá ako nejaký odkaz na neviem čo by to spravilo 
---

6. Nápoveda
- Nájdi vysvetlenie skratiek
- Nájdi zoznam nepodporovaných funkcií/obmedzení

| Používateľ | Skóre |
|------------|-------|
| Užívateľ 1 |  5    |
| Užívateľ 2 |  5    |
| Užívateľ 3 |  5    |
| Výsledok   |  5    |

Poznámky/Zistenia
- /-
---

7. Upload a export obrázku
- Otvor obrázok z počítača
- Otvor obrázok iným spôsobom ako oknom pre prehľadávanie súborov
- Exportuj obrázok 

| Používateľ | Skóre |
|------------|-------|
| Užívateľ 1 |  5    |
| Užívateľ 2 |  5    |
| Užívateľ 3 |  5    |
| Výsledok   |  5    |

Poznámky/Zistenia
- /-
---

8. Zatvorenie súborov
- Otvor viac ako jeden obrázok a zatvor všetky súčasne 

| Používateľ | Skóre |
|------------|-------|
| Užívateľ 1 |  4    |
| Užívateľ 2 |  4    |
| Užívateľ 3 |  4    |
| Výsledok   |  4    |

Poznámky/Zistenia
- Všetci to hľadali ale nakoniec to našli pri pokuse zavrieť len jeden obrázok 


### Globálne hodnotenie používateľského testovania 1

| Úloha / Otázka | Užívateľ 1 | Užívateľ 2 | Užívateľ 3 | Priemer / Výsledok |
|----------------|------------|------------|------------|------------------|
| 1. Okno nastavení – jazyk a farebný režim | 5 | 5 | 5 | 5.0 |
| 2. Okno nastavení – verzia aplikácie | 4 | 5 | 5 | 4.7 |
| 3. Nápoveda, tutoriál | 4 | 4 | 5 | 4.3 |
| 4. Nápoveda, štatistiky | 5 | 4 | 4 | 4.3 |
| 5. Privacy and data | 3 | 3 | 4 | 3.3 |
| 6. Nápoveda – skratky a obmedzenia | 5 | 5 | 5 | 5.0 |
| 7. Upload a export obrázku | 5 | 5 | 5 | 5.0 |
| 8. Zatvorenie súborov | 4 | 4 | 4 | 4.0 |

**Celkové priemerné hodnotenie všetkých úloh:** 4.5 / 5

