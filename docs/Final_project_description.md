# Final Project Description

## Opis problema

Zamislite turista koji upravo stigne u Sarajevo ili Mostar. Pretraži „what to do in BiH" i za par sekundi dobije isti odgovor koji je dobilo milijun posjetilaca prije njega: Baščaršija, Stari most, možda Kravice. Ostane li tri dana, dobija taj popis. Ostane li deset dana — dobija isti taj popis, samo tri puta ponovljen.

To nije slučajnost, nego direktna posljedica načina na koji digitalne platforme danas preporučuju destinacije: mjesto koje je već posjećeno postaje vidljivije u preporukama, vidljivije mjesto privlači još posjetilaca, a taj rast dodatno preporučuje upravo to mjesto na vrh slijedećih preporuka. Popularnost hrani samu sebe.

U Bosni i Hercegovini ova petlja ima konkretno ime i lice — Stari most u Mostaru. Putnički vodiči i blogovi danas gotovo jednoglasno opisuju stanje na mostu u ljetnim mjesecima terminom „overtourism": gužve od ranog prijepodneva do zalaska sunca, uz standardnu preporuku da se dolazi prije 8 ujutro ili nakon sumraka kako bi se mjesto uopće doživjelo bez stotina ljudi sa selfie štapovima u kadru. Istovremeno, petnaestak minuta vožnje od tog istog mosta nalazi se Blagaj s tekijom iz 16. stoljeća uz sami izvor Bune, pola sata dalje srednjovjekovni Počitelj, 45 minuta dalje Stolac s nekropolom stećaka pod zaštitom UNESCO-a — mjesta jednake, a nerijetko i veće autentične vrijednosti, koja većina turista nikad ne vidi, jednostavno zato što im nijedna aplikacija aktivno ne predloži u trenutku kad su fizički najbliže.

Obrazac se ne vidi samo na terenu, nego i u brojkama. Prema podacima Agencije za statistiku BiH, zemlja je u 2025. godini zabilježila skoro 2 miliona dolazaka turista i preko 4 miliona njihovih noćenja, uz kontinuiran rast udjela stranih gostiju (oko 70% ukupnih noćenja). Rast turizma se, drugim riječima, ubrzano koncentriše upravo tamo gdje je pritisak već najveći, umjesto da se raspoređuje na destinacije kojima bi taj rast najviše značio.

Problem, dakle, nije nedostatak sadržaja izvan glavnih točaka — BiH ih ima u izobilju. Problem je u kvaliteti odluka koje turist donosi nakon što putovanje već počne. Postojeće platforme rješavaju logistiku prije puta (let, hotel, prijevoz), ali nakon dolaska neovisnog turistu prepuštaju statičnim, na popularnosti zasnovanim listama koje:

- Ne razlikuju dvodnevnog od dvonedjeljnog posjetioca — oboje dobivaju identičan popis, iako kratki boravak traži gusto zbijene, lako dostupne točke, a dugi boravak ima prostora za dublje istraživanje u regiju;
- Usmjeravaju sve turiste prema istim lokacijama u isto vrijeme, umjesto da preporuku prilagođavaju trenutnoj gužvi, dobu dana i onome što je turist te sedmice već vidio;
- Tretiraju svaku destinaciju kao izolovanu tačku na karti, a ne kao dio veće cjeline kroz koju putnik prirodno prolazi.
- Cijenu ovoga plaćaju svi: turist u Mostaru usmjerava se kroz gomilu umjesto da doživi mjesto, zajednice u Blagaju, Počitelju i Stocu ostaju bez ekonomske koristi koju bi jednostavno mogle apsorbovati, a sam Stari most nosi veći fizički i socijalni pritisak nego što bi trebao.

## Puni prijedlog rješenja

DeTourist zna gdje, zna kada.

I, za razliku od svega što danas postoji, zna koliko vam je dana ostalo.

DeTourist je AI vodič za donošenje odluka tokom putovanja, namijenjen neovisnim istraživačima koji žele svakodnevno fleksibilno vodstvo umjesto krutog, unaprijed zadanog rasporeda. Gradi se oko dva AI sistema.

**Route Intelligence Engine** boduje svaku kandidatsku lokaciju kroz podudarnost s interesima korisnika, logističku izvodljivost, raznolikost iskustva i Indeks pritiska (Crowd Pressure Index), koji procjenjuje trenutno opterećenje po poznatim sezonskim i dnevnim obrascima. Zasićene lokacije poput Starog mosta se aktivno spuštaju u rangiranju, a jednako vrijedne, manje posjećene alternative (npr. Blagaj, 15 minuta dalje) se ističu.
Duration Intelligence Engine na osnovu broja dana ostalih u zemlji gradi „luk boravka": kratak boravak (2–3 dana) kombinira Mostar i Blagaj; srednji (4–6 dana) dodaje Počitelj i Stolac; dulji (7+ dana) dodaje destinacije isplative samo uz noćenje, poput Trebinja. Raspored se svakog dana prilagođava stvarnom kretanju korisnika (opt-in praćenje uživo).

### Hipoteza

Ako turistima ponudimo preporuke koje umanjuju vidljivost prezasićenih lokacija i ističu jednako vrijedne alternative, očekujemo mjerljivo preusmjeravanje posjeta sa Starog mosta prema Blagaju, Počitelju i Stocu, što ćemo provjeriti kroz kretanje korisnika u aplikaciji i anketu nakon boravka.

### Ključne aktivnosti

Razvoj i treniranje oba AI modela; prikupljanje i kuriranje podataka o lokacijama u pilot regiji; izrada mobilne aplikacije i offline paketa karata; pilot testiranje s turistima tokom sezone; unapređenje modela bodovanja prema prikupljenim podacima. Detaljan raspored po mjesecima i odgovornim osobama dat je u zasebnom planu aktivnosti.

### Očekivani rezultat

Mjerljiv udio pilot korisnika koji posjećuju preporučenu alternativu umjesto isključivo Starog mosta (praćeno kroz kretanje u aplikaciji), te potvrđen rast posjeta kod lokalnih pružaoca usluga u Blagaju, Počitelju i Stocu koji se uključe u pilot.

### Inovativnost

Generički AI asistenti predlože itinerar jednom i zaborave ga: ne znaju kad je Stari most stvarno pretrpan, ne pamte da ste jučer obišli tri grada pa vam treba priroda, i ne rade offline u selu bez signala. DeTourist je izgrađen oko stvarnog putovanja, ne jednokratnog upita.

### Vrijednost za destinaciju

Rasterećenje Starog mosta u vršnim satima i ekonomska korist za Blagaj, Počitelj, Stolac i Trebinje koju danas propuštaju. Live trip mapa koju korisnik dijeli po povratku postaje organska promocija manje poznatog mjesta za sljedećeg turistu — petlja popularnosti se okreće u otkriće koje hrani otkriće. Agregirani podaci o kretanju korisni su i turističkim zajednicama za planiranje.

### Dostupnost i uključivost

Praćenje lokacije je strogo opt-in, nikad podrazumijevano uključeno, čime se uklanja barijera povjerenja. Offline paket karata otklanja prepreku nestabilnog signala u selima kao Blagaj i Počitelj. Grupe se pridružuju pozivnim kodom, bez komplikacija. Aplikacija je od početka na lokalnom i engleskom jeziku, jer strani gosti čine oko 70% noćenja.

### Održivost

Opseg MVP-a je s namjerom uzak (podjela troškova čeka Fazu 2) kako bi prva verzija bila izvodljiva u kratkom roku; arhitektura koristi postojeće AI API-je umjesto treniranja modela od nule, čime infrastruktura ostaje jeftina u ranoj fazi. Nakon validacije u Mostaru i Hercegovini, sistem se širi na okolinu, a zatim na ostatak zemlje, uz regionalno prilagođene pakete karata.

## Ciljne skupine 

### Direktni korisnici aplikacije

- Neovisni turisti koji sami planiraju putovanje, bez agencije ili vodiča, i borave u zemlji određeno, unaprijed poznato vrijeme — primarna ciljna grupa cijelog proizvoda.
- Generacija Z i mlađi milenijalci — digitalno-prvi putnici naviknuti na personalizovane, aplikacijom vođene preporuke umjesto štampanih vodiča ili generičkih listi.
- Grupe prijatelja i porodice koje putuju zajedno — koriste pridruživanje pozivnim kodom, a u drugoj fazi i podjelu troškova.

### Indirektni korisnici / zajednice korisnice

- Lokalni pružaoci usluga u Blagaju, Počitelju i Stocu — direktno dobijaju veću vidljivost i posjećenost bez ulaganja u vlastiti marketing.
- Turistički radnici i vodiči u Mostaru — rasterećenje Starog mosta u vršnim satima poboljšava kvalitet iskustva i njihovih postojećih gostiju.
- Turističke zajednice i lokalne uprave u pilot regiji — dobijaju agregirane, anonimizovane podatke o kretanju turista, korisne za vlastito planiranje i infrastrukturne odluke.

### Institucioni partneri kao ciljna skupina za širenje

- Turističke zajednice drugih županija i regija u BiH (Sarajevo, Tuzla, Banja Luka i dr.) — sekundarna ciljna skupina u Fazi 2, kada se model regionalno replicira po istom principu kao u Mostaru.

### Dostupnost različitim grupama

- Dizajn je s namjerom jednostavan: offline-first pristup i pridruživanje grupi pozivnim kodom funkcionišu i uz slab signal i bez tehničkog predznanja, pa rješenje ostaje pristupačno i posjetiocima koji nisu digitalno najvičniji, ne samo primarnoj Gen Z/milenijalskoj publici.

## Potencijalni partneri

### Lokalni i kantonalni nivo (pilot regija)

- Turistička zajednica Hercegovačko-neretvanske županije (HNŽ/HNK), Mostar — prirodan prvi partner s obzirom na pilot lokaciju; već upravlja promocijom cijele regije i ima uspostavljene kontakte s pružaocima usluga u Blagaju, Počitelju i Stocu.
- Ministarstvo trgovine, turizma i zaštite okoliša HNŽ — nadležno tijelo za registraciju ugostiteljskih objekata, relevantno za buduću integraciju zvanične baze smještaja u aplikaciju.
- Grad Mostar i općine Stolac, Čapljina, Čitluk i Trebinje — lokalne uprave čiji turistički uredi predstavljaju i izvor podataka o lokacijama i direktan distribucijski kanal prema turistima.

### Državna i županijska razina

- Federalno ministarstvo razvoja poduzetništva i obrta — kroz grant sredstva iz budžeta FBiH koja između ostalog podržavaju digitalnu transformaciju preduzetnika.
- Federalno ministarstvo obrazovanja i nauke (FMON) — institucija koja je već raspisivala pozive namijenjene upravo mladim dizajnerima i inovatorima u afirmaciji kulturno-povijesnog naslijeđa BiH.

### Međunarodni donatori i razvojni partneri

- USAID Turizam (Developing Sustainable Tourism in Bosnia and Herzegovina) — već aktivno posluje u Mostaru i okolnim hercegovačkim općinama (Stolac, Trebinje, Čapljina, Čitluk) kroz projekte poput Hercegovina Wine Route, i eksplicitno podržava digitalizaciju i online vidljivost turističkih poduzeća. 
- GIZ, kroz programe EU4Business/EU4BusinessRecovery i EU4DigitalSME (sufinansirani od EU i Vlade SR Njemačke) — ima potvrđen mehanizam bespovratnih sredstava posebno za razvoj turističkih proizvoda i primjenu IKT alata (precedent: preko 1,6 miliona eura dodijeljeno sličnim partnerstvima u BiH), kao i za digitalnu transformaciju MSP-ova. 
- EU program Digitalna Evropa — BiH je nedavno pristupila ovom programu, čime domaća pravna lica mogu konkurisati za bespovratna sredstva EU u oblasti umjetne inteligencije i digitalnih vještina pod istim uslovima kao i aplikanti iz EU.

### Tehnološki i akademski partneri

- Sveučilišta — izvor studenata za razvoj i teren te mogući partner za istraživačku validaciju Route/Duration Intelligence modela.
- INTERA Tehnološki Park — potencijalni partner za tehničko mentorstvo i pristup postojećim programima podrške MSP-ovima u BiH.
- Telekom operateri — relevantni partneri za pitanja mrežne pokrivenosti u ruralnijim dijelovima pilot regije i eventualnu tehničku saradnju oko offline paketa. 
- OpenStreetMap BiH zajednica — otvoreni izvor geopodataka za izradu offline karata, bez troškova komercijalnog licenciranja.

### Nevladin i omladinski sektor

- Institut za razvoj mladih KULT — potencijalni partner za omladinsku komponentu (npr. angažman studenata u prikupljanju sadržaja za Route Intelligence Engine) i pristup mreži mladih inovatora u BiH.

## Financijski resursi

Potrebni resursi, povezani s planiranim aktivnostima.
Implementacija je planirana u dvije faze, s budžetom direktno povezanim s planom aktivnosti.

| Redni broj | Aktivnost/Trošak                                                     | Jedinica mjere | Količina | Jedinična cijena(KM) | uKUPNA VRIJEDNOST (KM) |
|------------|----------------------------------------------------------------------|----------------|----------|----------------------|------------------------|
| 1.         | Projekt menadžer (PM)                                                | mjesec         | 5        | 5,500                | 27,500                 |
| 2.         | AI/Backend inženjer                                                  | mjesec         | 5        | 9,500                | 47,500                 |
| 3.         | Mobilni developer 1                                                  | mjesec         | 5        | 6,000                | 30,000                 |
| 4.         | Mobilni developer 2                                                  | mjesec         | 4        | 6,000                | 24,000                 |
| 5.         | UX/UI dizajner                                                       | mjesec         | 4        | 5,000                | 20,000                 |
| 6.         | Radna oprema i razvojne licence za tim (laptopi, IDE, alati)         | komplet        | 1        | 15,000               | 15,000                 |
| 7.         | Eksterna QA i tehnička revizija koda                                 | paušalno       | 1        | 16,000               | 16,000                 |
|            |                                                                      |                |          | Subtotal:            | 180.000                |
| 8.         | API pozivi za AI modele (Route & Duration Intelligence Engine)       | mjesec         | 5        | 2,000                | 10,000                 |
| 9.         | Cloud hosting i baza podataka (backend infrastruktura)               | mjesec         | 5        | 1,200                | 6,000                  |
| 10.        | Geolokacijski i mapping API-ji (dodatno uz OpenStreetMap)            | mjesec         | 5        | 500                  | 2,500                  |
| 11.        | Monitoring, sigurnosne kopije i DevOps alati                         | mjesec         | 5        | 300                  | 1,500                  |
|            |                                                                      |                |          | Subtotal:            | 20.000                 |
| 12.        | Terensko istraživanje lokacija (Blagaj, Počitelj, Stolac, Trebinje)  | dan angažmana  | 40       | 250                  | 10,000                 |
| 13.        | Profesionalno fotografisanje i video snimanje lokacija               | lokacija       | 4        | 1,500                | 6,000                  |
| 14.        | Prikupljanje i unos podataka o pružaocima usluga                     | lokacija       | 4        | 1,000                | 4,000                  |
| 15.        | Angažman studenata/volontera za prikupljanje sadržaja                | mjesec         | 3        | 1,500                | 4,500                  |
| 16.        | Putni troškovi terenskog tima                                        | paušalno       | 1        | 500                  | 500                    |
|            |                                                                      |                |          | Subtotal:            | 25.000                 |
| 17.        | Izrada offline paketa karata (obrada OSM podataka po regiji)         | regija         | 4        | 1,000                | 4,000                  |
| 18.        | Terensko testiranje offline funkcionalnosti (uređaji, SIM kartice)   | paušalno       | 1        | 1,500                | 1,500                  |
| 19.        | Skladištenje i distribucija karata (CDN)                             | mjesec         | 5        | 400                  | 2,000                  |
|            |                                                                      |                |          | Subtotal:            | 7.500                  |
| 20.        | Alati za dizajn i prototipiranje (licence)                           | mjesec         | 4        | 150                  | 600                    |
| 21.        | Korisničko testiranje aplikacije s turistima (honorari ispitanicima) | runda          | 3        | 1,500                | 4,500                  |
| 22.        | Anketa nakon boravka (izrada, distribucija, obrada rezultata)        | paušalno       | 1        | 2,000                | 2,000                  |
| 23.        | Koordinacija i provedba pilot istraživanja tokom sezone              | paušalno       | 1        | 8,000                | 8,000                  |
| 24.        | Fokus grupe s lokalnim pružaocima usluga                             | grupa          | 3        | 800                  | 2,400                  |
|            |                                                                      |                |          | Subtotal:            | 17.500                 |
| 25.        | Izrada promotivnih materijala i landing stranice                     | paušalno       | 1        | 3,000                | 3,000                  |
| 26.        | Digitalna kampanja (društvene mreže, Google Ads)                     | mjesec         | 4        | 1,500                | 6,000                  |
| 27.        | Saradnja s vodičima/influencerima za promociju pilota                | paušalno       | 1        | 2,000                | 2,000                  |
| 28.        | Promotivni materijali na partnerskim lokacijama (letci, oznake)      | paušalno       | 1        | 1,500                | 1,500                  |
|            |                                                                      |                |          | Subtotal:            | 12.500                 |
| 29.        | Uslovi korištenja i politika privatnosti (zaštita ličnih podataka)   | paušalno       | 1        | 2,500                | 2,500                  |
| 30.        | Pravno savjetovanje i registracija                                   | paušalno       | 1        | 2,500                | 2,500                  |
| 31.        | Usklađenost s politikama app store-ova                               | paušalno       | 1        | 1,500                | 1,500                  |
|            |                                                                      |                |          | Subtotal:            | 6.500                  |
| 32.        | Zakup kancelarijskog/coworking prostora                              | mjesec         | 5        | 800                  | 4,000                  |
| 33.        | Softverske pretplate i komunikacijski alati                          | mjesec         | 5        | 300                  | 1,500                  |
| 34.        | Knjigovodstvene i administrativne usluge                             | mjesec         | 5        | 500                  | 2,500                  |
| 35.        | Bankarske naknade i osiguranje                                       | mjesec         | 5        | 200                  | 1,000                  |
| 36.        | Rezerva za nepredviđene troškove                                     | paušalno       | 1        | 3,500                | 3,500                  |
|            |                                                                      |                |          | Subtotal:            | 12.500                 |
|            |                                                                      |                |          | Total:               | 281.500                |

**Napomene za financijske resurse:**

- Najveća stavka je razvojni tim, što je očekivano za proizvod čija je osnovna vrijednost u dvije AI komponente, a ne u jednokratnom dizajnu aplikacije.
- Svaka stavka budžeta odgovara konkretnoj aktivnosti iz prijedloga rješenja: razvojni tim pokriva izgradnju oba AI sistema i mobilne aplikacije, prikupljanje sadržaja odgovara terenskom radu u Blagaju, Počitelju, Stocu i Trebinju, a offline karte i geopodaci pokrivaju paket karata za pilot regiju.
- Arhitektura s namjerom koristi postojeće AI API-je umjesto treniranja vlastitog modela od nule, što drži trošak infrastrukture niskim u ranoj fazi i raste tek s korisničkom bazom.
- Korištenje OpenStreetMap podataka za offline karte umjesto komercijalnog licenciranja značajno smanjuje tu stavku.
- Realan model finansiranja Faze 1 je kombinacija granta (npr. poziv za partnerstva u turizmu u okviru EU4Business/USAID Turizam) i manjeg vlastitog ili investicijskog uloga

## Plan aktivnosti

### 1. Upravljajne projektom i resursima
    
| Redni broj | Naziv aktivnosti                                                                            | Odgovorna osoba      | M1 | M2 | M3 | M4 | M5 |
|------------|---------------------------------------------------------------------------------------------|----------------------|----|----|----|----|----|
| 1.         | Pokretanje projekta, detaljno planiranje i uspostava alata za rad                           | PM                   | X  |    |    |    |    |
| 2.         | Uspostavljanje i formalizacija partnerstva (TZ HNŽ, općine, donatori)                       | PM                   | X  | X  |    |    |    |
| 3.         | Koordinacija tima i redovno praćenje                                                        | PM                   | X  | X  | X  | X  | X  |
| 4.         | Izrada pravnih dokumenata i usklađenost (uslovi korištenja, zaštita podataka, registracija) | PM, pravni savjetnik |    |    |    | X  |    |
| 5.         | Analiza rezultata pilota i završni izvještaj s preporukama za Fazu 2                        | PM                   |    |    |    |    | X  |

### 2. Prikupljanje i kuriranje podataka o lokacijama

| Redni broj | Naziv aktivnosti                                                  | Odgovorna osoba           | M1 | M2 | M3 | M4 | M5 |
|------------|-------------------------------------------------------------------|---------------------------|----|----|----|----|----|
| 6.         | Terensko istraživanje i prikupljanje podataka - Blagaj i Počitelj | Teren tim                 | X  | X  |    |    |    |
| 7.         | Terensko istraživanje i prikupljanje podataka - Stolac i Trebinje | Teren tim                 |    | X  | X  |    |    |
| 8.         | Fotografisanje, video sadržaj i unos podataka o pružaocima usluga | Teren tim, UX(UI dizajner |    | X  | X  |    |    |
| 9.         | Angažman studenata/volontera na kontiuniranom ažuriranju sadržaja | Teren tim (Studenti)      |    | X  | X  | X  |    |

### 3. Razvoj i treniranje AI modela

| Redni broj | Naziv aktivnosti                                                                | Odgovorna osoba          | M1 | M2 | M3 | M4 | M5 |
|------------|---------------------------------------------------------------------------------|--------------------------|----|----|----|----|----|
| 10.        | Definisanje tehničke arhitekture (Route & Duration Intelligence Engine)         | AI/backend injžener, MD1 | X  |    |    |    |    |
| 11.        | Razvoj i treniranje Route Intelligence Engine (bodovanje, Crowd Pressure Index) | AI/backend injžener      |    | X  | X  |    |    |
| 12.        | Razvoj Duration Intelligence Engine (luk boravka prema broju dana)              | AI/backend injžener      |    |    | X  | X  |    |
| 13.        | Integracija AI modela s backend sistemom i mobilnom aplikacijom                 | AI/backend injžener      |    |    |    | X  |    |

### 4. Izrada mobilne aplikacije i offline paketa karata

| Redni broj | Naziv aktivnosti                                                                                        | Odgovorna osoba                 | M1 | M2 | M3 | M4 | M5 |
|------------|---------------------------------------------------------------------------------------------------------|---------------------------------|----|----|----|----|----|
| 14.        | UX istraživanje i wireframing aplikacije                                                                | UX/UI dizajner                  | X  |    |    |    |    |
| 15.        | Dizajn korisničkog interfejsa (UI)                                                                      | UX/UI dizajner                  |    | X  |    |    |    |
| 16.        | Razvoj mobilne aplikacije - osnovne funkcionalnosti (baza, autentikacija, pridruživanje pozivnim kodom) | MD1, MD2                        |    | X  | X  |    |    |
| 17.        | Podrška dizajna tokom razvoja i iteracije prema testiranju                                              | UX/UI dizajner                  |    |    | X  |    |    |
| 18.        | Izrada offline paketa karata (obrada OpenStreetMap podata za pilot regiju)                              | MD2                             |    |    | X  |    |    |
| 19.        | Integracija funkcionalnosti i interno testiranje (QA)                                                   | MD1, MD2, AI/backend injženjner |    |    |    | X  |    |
| 20.        | Finalizacija i poliranje aplikacije (preformanse, otklanjanje grešaka)                                  | MD1                             |    |    |    | X  |    |

### 5. Priprema i provedba pilot testiranja

| Redni broj | Naziv aktivnosti                                                         | Odgovorna osoba    | M1 | M2 | M3 | M4 | M5 |
|------------|--------------------------------------------------------------------------|--------------------|----|----|----|----|----|
| 21.        | Regrutacija pilot korisnika i koordinacija s lokalnim partnerima         | PM                 |    |    |    | X  |    |
| 22.        | Priprema promotivnih i marketinških materijala za lansiranje pilota      | PM, UX/UI dizajner |    |    |    | X  |    |
| 23.        | Provedba pilot testiranja s turistima (Mostar, Blagaj, Počitelj, Stolac) | Cijeli tim         |    |    |    |    | X  |
| 24.        | Praćenje korisničkoh kretanja uživo i provedba ankete nakon boravka      | PM, MD1            |    |    |    |    | X  |

### 6. Analiza rezultata i unaprijeđenje modela

| Redni broj | Naziv aktivnosti                                                      | Odgovorna osoba          | M1 | M2 | M3 | M4 | M5 |
|------------|-----------------------------------------------------------------------|--------------------------|----|----|----|----|----|
| 25.        | Analiza prikupljenih podataka o kretanju korisnika i rezultate ankete | AI/backend injžener, PM1 |    |    |    |    | X  |
| 26.        | Unaprijeđenje modela bodovanja prema prikupljenim podacima            | AI/backend injžener      |    |    |    |    | X  |

**Napomena**

Angažman po ulozi 5 mjeseci( za provjeru usklađenosti s budžetom, sekcija 1. Razvojni tim):
- PM - 5 mjeseci
- AI/Backend injžener - 5 mjeseci
- MD1 - 5 mjeseci
- MD2 - 4 mjeseca (M2-M5)
- UX/UI dizajner - 4 mjeseca (M1-M4)

Raspored predstavlja paralelan rad na više aktivnosti unutar istog mjeseca, uobičajeno za tim ove veličine