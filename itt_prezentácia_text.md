## ITT prezentácia 
- Všeobecné 
    - V powerpointe sa nezobrazoval správne font písmena F

- Motivácia 
    - obrázky spraviť viac abstraktné, aby tam nebol text alebo nejaká schéma, na ktorú by sa mohli zameriavať
    - zdôrazniť že to je príklad ukážky úpravy
    - ukázať tam celú pdf stranu
    - nemať tam čierne okraje na zvislej časti - nevedeli čo to je 

- Pre koho to je - pridať informáciu o tom komu je aplikácia učená 

- Dôvod prečo je aplikácia prínosná
    - že to obsahuje nástroje prispôsobené k tomuto účelu 
    - vektorové spracovanie pdf
    - ochrana súkromia

- Vedieť vysvetliť 
    - ako sa spracováva pdf a ako raster 
    - ako funguje web worker
    - ako funguje načítanie a export 

## Slajd 1 
Dobrý deň, volám sa Pavol Humený a v rámci bakalárskej práce vytváram webovú aplikácie pre úpravu obrázkov s názvom Figurio. Je to editor primárne zameraný na prípravu obrázkov do odborných textov. 

Cieľom tejto práce je poskytnú užívateľom nástroj, pomocou ktorého budú môcť jednoducho a rýchlo upravovať svoje obrázky, vďaka ktorým budú ich výsledné texty vyzerať lepšie a zároveň sa nemusia učiť pracovať s pokročilými nástrojmi 

Kladie dôraz na 2 základné veci, a to jednoduché a intuitívne rozhranie a bezpečnosť dát používateľov, preto sa všetky operácie vykonávajú v prehliadači a žiadne obrázky používateľov sa neposielajú niekde na server

---

Príkladom takejto úpravy môže byť odstránenie okrajov obrázka, a tak výsledný dokument nebude obsahovať obrázky s bielymi okrajmi

Ďalším príkladom môže byť pridanie rámikov k snímkam obrazovky vďaka čomu bude hneď jasnejšie o čo sa jedná

Alebo pridanie rôznych objektov alebo textu a šípok pre zvýraznenie dôležitých častí na obrázku

---





Dobrý deň, volám sa Pavol Humený a v rámci svojej bakalárskej práce vytváram webovú aplikáciu pre úpravu obrázkov – Figurio. Je to editor zameraný na prípravu obrázkov do odborných textov. Ide o editor, ktorý obsahuje nástroje určené na tieto úpravy. A zároveň kladie dôraz na jednoduché a intuitívne rozhranie. 


Cieľom tohto editora je poskytnúť užívateľom nástroje, vďaka ktorým budú ich výsledné texty vyzerať lepšie a hlavne bez nutnosti učenia sa ovládania zložitých nástrojov.

## Slajd 2
Príkladom takejto úpravy je orezanie okrajov obrázka, vďaka čomu vo výslednom dokumente obrázok nebude obsahovať biele okraje.

## Slajd 3 
Druhým príkladom je možnosť pridania rámikov ku snímkam obrazovky telefónu, prípadne zvýraznenie a popísanie častí, o ktorých sa hovorí v texte. 

## Slajd 4 
Na základe používateľského prieskumu a následnej analýzy problémových obrázkov som identifikoval nástroje, ktoré by takáto aplikácia mala podporovať. Tieto nástroje som rozdelil do 3 skupín. 

Prvá skupina obsahuje nástroje, ktoré slúžia na kreslenie, prípadne pridávanie objektov, ktoré slúžia na zvýraznenie obsahu

Druhá skupina obsahuje nástroje, ktoré menia geometriu obrázku
Druhá skupina predstavuje nástroje určené na úpravu samotného obrázka a jeho transformáciu. 

A tretiu skupinu tvoria špeciálne nástroje. 

(Konkrétne nástroj Preset, ktorý umožňuje nastaviť sériu úprav a následne ju aplikovať na viaceré obrázky jedným kliknutím a nástroj Analýza obrázku, ktorý slúži na detekciu šumu v obrázku pri obrázkoch s vysokou kompresiou.)

## Slajd 5 
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

## ITT obhajoba otázky 
- ako funguje výpočet fit crop ✅
- ako funguje noise detection ✅
- ako funguje frame tool ✅

- prečo nie typescript ✅

## Crop 
Automatická detekcia obsahu v aplikácii Figurio slúži na odstránenie prázdnych okrajov obrázka a identifikáciu oblasti, kde sa nachádza skutočný obsah. Po nahraní obrázka sa vytvorí pracovná kópia, do ktorej sa v prípade potreby zahrnú aj prekryvné vrstvy, aby detekcia pracovala s tým, čo používateľ reálne vidí. Obraz sa následne prevedie do odtieňov sivej a jemne sa vyhladí pomocou Gaussovho rozmazania, čím sa potlačí šum a drobné artefakty.

Na takto pripravený obraz sa aplikuje algoritmus Canny, ktorý deteguje miesta s výraznou zmenou jasu a vytvorí mapu hrán reprezentujúcich obrysy objektov. Z týchto hrán sa vypočíta počiatočný orezový rámik, ktorý ohraničuje oblasť s obsahom. Tento rámik sa následne ešte adaptívne spresňuje porovnávaním kontrastu na jeho okrajoch, aby sa odstránili zvyšné prázdne alebo nevýrazné oblasti. Používateľ má zároveň možnosť ovplyvniť citlivosť detekcie podľa typu obrázka. Výsledkom je presný orez obrázka jedným kliknutím, ktorý nevyžaduje manuálne nastavovanie a zachováva všetok relevantný obsah.

## Image analysis – detekcia obrazových artefaktov
Analýza obrazu v aplikácii Figurio slúži na automatickú identifikáciu nežiaducich obrazových artefaktov, ako sú kompresný šum, jemné halo okolo objektov alebo izolované nekvalitné pixely. Pred samotnou detekciou sa najskôr overí, či obrázok obsahuje dostatočne jednotné pozadie. Táto kontrola je realizovaná analýzou farieb na okrajoch obrazu a výpočtom podielu farebne podobných pixelov. Ak obrázok nemá dominantné pozadie, analýza sa vynechá, čím sa predchádza falošným detekciám na fotografiách alebo komplexných ilustráciách.

Samotná detekcia je založená na analýze lokálnych vysokofrekvenčných zmien jasu pomocou Laplaceovho operátora. Obraz je najskôr prevedený do odtieňov sivej a pre každý pixel sa vypočíta hodnota Laplaceovho operátora, ktorá vyjadruje mieru lokálnej zmeny jasu vzhľadom na jeho bezprostredné okolie. Izolované pixely alebo malé zhluky s vysokou hodnotou tejto veličiny sú považované za obrazový šum, zatiaľ čo súvislé skupiny takýchto pixelov reprezentujú reálne hrany objektov a sú z ďalšej analýzy vylúčené. Výsledkom analýzy je vizuálna mapa potenciálnych artefaktov, ktorá používateľovi poskytuje rýchlu spätnú väzbu o kvalite nahraného obrázka bez potreby manuálnej kontroly.

 0  -1   0
-1   4  -1
 0  -1   0

Pri aplikácii tohto jadra sa pre každý pixel vypočíta výsledná hodnota ako vážený súčet jeho jasu a jasov jeho bezprostredných susedov (hore, dole, vľavo a vpravo). Ak je pixel podobný svojmu okoliu, výsledná hodnota je nízka. Naopak, ak sa jeho jas výrazne líši od okolia, hodnota Laplaceovho operátora je vysoká, čo indikuje hranu alebo vysokofrekvenčný artefakt.


## Frame tool – vizuálne orámovanie obrázka
Nástroj Frame v aplikácii Figurio slúži na vizuálne orámovanie obrázka bez zásahu do jeho samotného obsahu. Jeho cieľom je umožniť používateľovi prezentovať obrázok v kontexte konkrétneho zariadenia alebo prostredia, napríklad vo forme okna aplikácie, prehliadača alebo mobilného telefónu. Rámik je realizovaný ako samostatná vektorová vrstva nad obrázkom, konkrétne pomocou SVG objektov, ktoré sú dynamicky generované a vkladané do dokumentu. Vďaka vektorovej reprezentácii je možné rámiky presne škálovať, exportovať vo vysokej kvalite a zachovať ostré hrany bez ohľadu na rozlíšenie výsledného výstupu.

Pri aplikovaní rámika sa najskôr vypočíta výsledné rozloženie, ktoré určuje rozmery rámu, vnútorné odsadenia a pozíciu samotného obrázka. Na základe zvoleného typu rámu sa následne programovo vytvárajú jednotlivé SVG prvky, ako sú obrysy, zaoblené rohy, hlavičky, päty alebo ovládacie prvky typické pre dané zariadenie (napríklad tlačidlá mobilného telefónu alebo panel úloh operačného systému). Tieto prvky sú skladané z jednoduchých geometrických tvarov a SVG ciest, čo umožňuje jednotný a konzistentný vzhľad všetkých rámov. Výsledkom je flexibilný a nedestruktívny spôsob vizuálneho orámovania, ktorý je plne integrovaný do renderovacej pipeline aplikácie a umožňuje rýchlu úpravu či zmenu typu rámu bez opätovnej manipulácie s obrazovým obsahom.

## Typescript 
Aplikácia pracuje prevažne s dynamickými dátami, ako sú canvas a SVG objekty, kde by prínos statického typovania bol obmedzený. Vstupy môžu mať rôznu podobu, napríklad rastrové obrázky alebo PDF dokumenty, pričom ich reprezentácia sa v priebehu spracovania mení. Použitie pevných typov by si v takomto prípade vyžadovalo časté úpravy typových definícií. Čitateľnosť a správne používanie rozhraní sú zabezpečené pomocou JSDoc anotácií.