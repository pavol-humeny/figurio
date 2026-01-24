## Slajd 1 
Dobrý deň, volám sa Pavol Humený a v rámci svojej bakalárskej práce vytváram webovú aplikáciu na úpravu obrázkov – Figurio. Ide o editor zameraný na prípravu obrázkov do odborných textov, ktorý obsahuje základné nástroje potrebné na ich úpravu a zároveň kladie dôraz na prehľadné a intuitívne používateľské rozhranie, ktoré používateľa zbytočne nezaťažuje.

## Slajd 2
Cieľom tohto editora je poskytnúť používateľom nástroj pre rýchle a jednoduché upravovanie obrázkov, kde má používateľ všetky dôležité ovládacie prvky okamžite dostupné a bez nutnosti hľadať ich v menu.

Príkladom takejto úpravy je orezanie okrajov obrázka, vďaka čomu vo výslednom dokumente obrázok nebude obsahovať biele okraje.

## Slajd 3 
Druhým príkladom, vďaka ktorému je možné jednoducho zvýšiť úroveň výsledného textu, je pridanie rámikov ku snímkam obrazovky telefónu, prípadne zvýraznenie a popísanie častí, o ktorých sa hovorí v texte. 

## Slajd 4 
Na základe používateľského prieskumu a následnej analýzy problémových obrázkov som identifikoval nástroje, ktoré by takáto aplikácia mala podporovať. Tieto nástroje som rozdelil do 3 skupín. 

Prvá skupina obsahuje nástroje, ktoré slúžia k pridávaniu rôznych objektov pre zvýraznenie častí obrázka. 

Druhá skupina predstavuje nástroje určené na úpravu samotného obrázka a jeho transformáciu. 

A tretiu skupinu tvoria špeciálne nástroje. 

(Konkrétne nástroj Preset, ktorý umožňuje nastaviť sériu úprav a následne ju aplikovať na viaceré obrázky jedným kliknutím a nástroj Analýza obrázku, ktorý slúži na detekciu šumu v obrázku pri obrázkoch s vysokou kompresiou.)

## Slajd 5 
Z každej skupiny som vybral jeden nástroj. 

Nástroj crop umožňuje orezanie obsahu podľa potreby používateľa, ale súčasne obsahuje aj automatickú detekciu obsahu, vďaka čomu je možné nastaviť presné orezanie okrajov jedným kliknutím. Používateľ pritom vidí výsledok úpravy v reálnom čase a má k dispozícii len tie ovládacie prvky, ktoré sú pre daný nástroj relevantné.

## Slajd 6 
Nástroj frame umožňuje pridanie rámikov. Aplikácia podporuje rôzne typy rámikov, ktoré je možné si následne prispôsobiť podľa konkrétneho použitia. 

## Slajd 7 
Nástroj detekcia šumu, sa spúšťa automaticky pri nahraní obrázka a v prípade pozitívnej detekcie, zvýrazní chyby v obrázku, aby si ich používateľ všimol a nedošlo ku tomu, že použije nekvalitný obrázok vo výslednej práci. 

## Slajd 8 
Proces úpravy obrázku je možné rozdeliť na 3 základné kroky.

Prvý krokom je vloženie obrázku, ktoré je možné viacerými spôsobmi. Nahratie súboru z počítača, drag and drop, alebo len vloženie skopírovaného obrázka. 

## Slajd 9 
Druhým krokom je samotná úprava obrázka, ktorá prebieha v centrálnej pracovnej ploche.
Používateľ má prehľad o aktuálnom nástroji a jeho nastaveniach v bočnom paneli, bez zakrývania samotného obsahu.

## Slajd 10 
Posledným krokom je exportovanie obrázka, kde má používateľ jasne definované možnosti formátu a rozmerov, aby výsledok zodpovedal požiadavkám cieľového dokumentu.

## Slajd 11 
V súčastnosti je aplikácia Figurio funkčná a obsahuje všetky spomínané nástroje. 

V nasledujúcej fáze práce plánujem priebežne vykonávať používateľské testovanie s cieľom doladenia používateľského rozhrania na základe spätnej väzby používateľov. 


## Crop 
Automatická detekcia obsahu v aplikácii Figurio slúži na odstránenie prázdnych okrajov obrázka a identifikáciu oblasti, kde sa nachádza skutočný obsah. Po nahraní obrázka sa vytvorí pracovná kópia, do ktorej sa v prípade potreby zahrnú aj prekryvné vrstvy, aby detekcia pracovala s tým, čo používateľ reálne vidí. Obraz sa následne prevedie do odtieňov sivej a jemne sa vyhladí pomocou Gaussovho rozmazania, čím sa potlačí šum a drobné artefakty.

Na takto pripravený obraz sa aplikuje algoritmus Canny, ktorý deteguje miesta s výraznou zmenou jasu a vytvorí mapu hrán reprezentujúcich obrysy objektov. Z týchto hrán sa vypočíta počiatočný orezový rámik, ktorý ohraničuje oblasť s obsahom. Tento rámik sa následne ešte adaptívne spresňuje porovnávaním kontrastu na jeho okrajoch, aby sa odstránili zvyšné prázdne alebo nevýrazné oblasti. Používateľ má zároveň možnosť ovplyvniť citlivosť detekcie podľa typu obrázka. Výsledkom je presný orez obrázka jedným kliknutím, ktorý nevyžaduje manuálne nastavovanie a zachováva všetok relevantný obsah.