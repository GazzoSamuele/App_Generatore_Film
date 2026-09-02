# 🎬 MovieMatch

Motore di raccomandazione **content-based** per film e serie TV: costruisce un profilo di
gusti a partire da quello che l'utente dichiara e da quello che guarda, e usa quel profilo
per consigliare titoli nuovi, spiegando ogni volta **perché** li sta consigliando.

Progetto full-stack in TypeScript: API REST con Express + MongoDB, interfaccia React + Vite,
catalogo importabile da [TMDB](https://www.themoviedb.org/).

---

## Indice

- [Funzionalità](#funzionalità)
- [Stack tecnologico](#stack-tecnologico)
- [Requisiti](#requisiti)
- [Installazione](#installazione)
- [Configurazione (.env)](#configurazione-env)
- [Popolare il database](#popolare-il-database)
- [Avviare l'applicazione](#avviare-lapplicazione)
- [API](#api)
- [Come funziona il motore di raccomandazione](#come-funziona-il-motore-di-raccomandazione)
- [Struttura del progetto](#struttura-del-progetto)
- [Roadmap](#roadmap)
- [Limitazioni note](#limitazioni-note)

---

## Funzionalità

Legenda: ✅ disponibile · 🚧 in lavorazione · 📋 pianificato

### Profilo e utenti

| Stato | Funzionalità |
|:---:|---|
| ✅ | Profilo utente con generi preferiti, piattaforme attive e storico delle visioni |
| 🚧 | **Selezione utente all'avvio**: scelta del profilo tra quelli esistenti, memorizzata nel browser |
| 🚧 | **Creazione di un nuovo profilo** direttamente dall'interfaccia (nome + email) |
| 📋 | Selezione delle piattaforme attive (Netflix, Prime Video, Disney+, …) dall'interfaccia |
| 📋 | Pagina profilo con storico dei titoli visti e voti assegnati |

### Raccomandazioni

| Stato | Funzionalità |
|:---:|---|
| ✅ | Motore content-based con punteggio pesato su generi, tag, qualità e persone (regista/cast) |
| ✅ | **Spiegazione dei consigli**: ogni titolo mostra i motivi per cui è stato scelto |
| ✅ | Percentuale di **compatibilità** con il profilo dell'utente |
| ✅ | **Decadimento temporale**: i gusti recenti pesano più di quelli vecchi (emivita 1 anno) |
| ✅ | **Varietà nella lista**: massimo 4 titoli per genere, per evitare consigli tutti uguali |
| ✅ | Penalità per i titoli non disponibili sulle piattaforme attive dell'utente |
| ✅ | Esclusione automatica dei titoli già visti |
| 📋 | Filtri sulla lista consigliata (genere, tipo, anno, piattaforma) |
| 📋 | Modalità "sorprendimi": un singolo titolo estratto tra i migliori |

### Feedback

| Stato | Funzionalità |
|:---:|---|
| ✅ | Segnare un titolo come "Mi è piaciuto" / "Non mi è piaciuto" (voto 1–5) |
| ✅ | Ricalcolo immediato dei consigli dopo ogni feedback |
| 📋 | **Modifica di un voto** già dato |
| 📋 | **Rimozione di un titolo** dallo storico |
| 📋 | Voto a stelle 1–5 al posto dei due soli pulsanti |

### Catalogo

| Stato | Funzionalità |
|:---:|---|
| ✅ | Catalogo di esempio incluso (seed locale) |
| ✅ | **Import da TMDB**: film popolari per 18 generi, con cast, regista, keyword, poster e piattaforme italiane |
| ✅ | Elenco dei generi disponibili con conteggio dei titoli |
| 📋 | **Esplora tutti i film**: catalogo sfogliabile con ricerca, filtri e paginazione |
| 📋 | Pagina di dettaglio del singolo titolo (trama, durata, cast completo) |
| 📋 | Import delle **serie TV** da TMDB (il modello dati le supporta già) |

### Interfaccia

| Stato | Funzionalità |
|:---:|---|
| ✅ | Schermata iniziale, selezione generi preferiti, griglia dei consigli |
| ✅ | Layout responsive, animazioni con supporto a `prefers-reduced-motion` |
| 🚧 | Messaggi di errore visibili all'utente (non solo in console) |
| 📋 | Stato "lista vuota" quando non ci sono più titoli da consigliare |
| 📋 | Trama e durata nella card del film |
| 📋 | Tema chiaro / scuro |

### Infrastruttura

| Stato | Funzionalità |
|:---:|---|
| ✅ | API REST tipizzata end-to-end in TypeScript |
| 📋 | Test unitari del motore di raccomandazione (Vitest) |
| 📋 | Backend che serve la build del client in produzione (single origin) |
| 📋 | Middleware 404 e gestore errori centralizzato |

---

## Stack tecnologico

**Backend**
- Node.js + TypeScript (ESM)
- Express 5
- Mongoose 9 / MongoDB
- `tsx` per il dev server con watch

**Frontend**
- React 19
- Vite 8
- TypeScript
- SCSS (Sass) con architettura BEM

**Dati esterni**
- [The Movie Database (TMDB)](https://www.themoviedb.org/) — catalogo, poster e disponibilità sulle piattaforme

---

## Requisiti

- **Node.js 20+**
- **MongoDB** in esecuzione (locale su `mongodb://localhost:27017` oppure un cluster MongoDB Atlas)
- Una **API key TMDB** gratuita, se vuoi importare il catalogo reale
  (si ottiene da [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api))

---

## Installazione

```bash
git clone <url-del-repository>
cd App_Generatore_Film
```

Installa le dipendenze del backend:

```bash
npm install
```

Installa le dipendenze del client:

```bash
cd client
npm install
cd ..
```

---

## Configurazione (.env)

Crea un file `.env` nella cartella principale del progetto, partendo da `.env.example`:

```bash
cp .env.example .env
```

Variabili disponibili:

| Variabile | Obbligatoria | Default | Descrizione |
|---|:---:|---|---|
| `PORT` | no | `3000` | Porta su cui ascolta il server Express |
| `MONGODB_URI` | **sì** | — | Stringa di connessione MongoDB (es. `mongodb://localhost:27017/moviematch`) |
| `TMDB_API_KEY` | solo per l'import | — | Chiave API di TMDB, usata da `npm run importa` |

> ⚠️ Il file `.env` è già in `.gitignore`: non va **mai** committato, contiene la tua chiave TMDB.

---

## Popolare il database

Hai due possibilità.

### Catalogo di esempio (veloce, offline)

Inserisce una ventina di titoli scritti a mano e crea un utente di prova con uno storico
già popolato. Non serve la chiave TMDB.

```bash
npm run seed
```

> ⚠️ Il seed **svuota** le collezioni `films` e `utenti` prima di inserire i dati.

### Import da TMDB (catalogo reale)

Scarica i film più votati per ciascuno dei 18 generi TMDB, con cast, regista, keyword,
poster e disponibilità sulle piattaforme italiane.

```bash
npm run importa
```

> ⚠️ L'import **svuota** la collezione `films` e **azzera lo storico** di tutti gli utenti
> (i vecchi ID dei film non esisterebbero più). I profili e i generi preferiti restano.

Parametri modificabili in `src/seed/importaTMDB.ts`:

| Costante | Default | Cosa fa |
|---|:---:|---|
| `PAGINE_PER_GENERE` | `1` | Pagine TMDB scaricate per genere (20 film a pagina) |
| `VOTI_MINIMI` | `300` | Esclude i titoli con pochi voti |
| `LINGUA` | `it-IT` | Lingua di titoli e trame |
| `PAUSA_MS` | `100` | Pausa tra le chiamate, per non saturare l'API |

---

## Avviare l'applicazione

Servono **due terminali**.

Terminale 1 — backend (`http://localhost:3000`):

```bash
npm run dev
```

Terminale 2 — client (`http://localhost:5173`):

```bash
cd client
npm run dev
```

Apri **http://localhost:5173**. Il dev server di Vite inoltra automaticamente tutte le
chiamate `/api/*` al backend sulla porta 3000 (vedi `client/vite.config.ts`), quindi non
servono configurazioni CORS in sviluppo.

### Altri comandi

| Comando | Dove | Cosa fa |
|---|---|---|
| `npm run dev` | radice | Backend in watch mode |
| `npm run build` | radice | Compila il backend in `dist/` |
| `npm start` | radice | Avvia il backend compilato |
| `npm run seed` | radice | Popola il DB col catalogo di esempio |
| `npm run importa` | radice | Popola il DB da TMDB |
| `npm run dev` | `client/` | Dev server Vite |
| `npm run build` | `client/` | Build di produzione del client |
| `npm run lint` | `client/` | ESLint sul client |

---

## API

Tutti gli endpoint sono sotto il prefisso `/api`. Le risposte sono in JSON e i messaggi
d'errore hanno sempre la forma `{ "errore": "descrizione" }`.

| Stato | Metodo | Endpoint | Descrizione |
|:---:|---|---|---|
| ✅ | `GET` | `/api/utenti` | Elenco dei profili disponibili |
| 🚧 | `POST` | `/api/utenti` | Crea un nuovo profilo |
| ✅ | `GET` | `/api/raccomandazioni/:utenteId` | Consigli personalizzati |
| ✅ | `POST` | `/api/utenti/:utenteId/visioni` | Registra una visione con voto |
| ✅ | `PUT` | `/api/utenti/:utenteId/preferenze` | Aggiorna i generi preferiti |
| ✅ | `GET` | `/api/generi` | Generi presenti a catalogo, con conteggio |
| 📋 | `GET` | `/api/film` | Catalogo sfogliabile (ricerca, filtri, paginazione) |
| 📋 | `GET` | `/api/film/:id` | Dettaglio di un singolo titolo |
| 📋 | `PUT` | `/api/utenti/:utenteId/visioni/:filmId` | Modifica il voto di una visione |
| 📋 | `DELETE` | `/api/utenti/:utenteId/visioni/:filmId` | Rimuove un titolo dallo storico |

### `GET /api/utenti`

```json
[
  {
    "_id": "6a7f4ec1c05324d5adec8077",
    "nome": "Samuele",
    "email": "samuele@example.com",
    "generiPreferiti": ["Fantascienza", "Thriller"]
  }
]
```

### `POST /api/utenti`

```json
{ "nome": "Giulia", "email": "giulia@example.com" }
```

Risposta `201`:

```json
{
  "_id": "6a7f4ec1c05324d5adec8099",
  "nome": "Giulia",
  "email": "giulia@example.com",
  "generiPreferiti": []
}
```

Errori: `400` dati non validi · `409` email già registrata.

### `GET /api/raccomandazioni/:utenteId`

Query string opzionale: `?limite=8` (valori ammessi da 6 a 8).

```json
{
  "totale": 8,
  "raccomandazioni": [
    {
      "id": "6a7f4ec1c05324d5adec8080",
      "titolo": "Blade Runner 2049",
      "tipo": "film",
      "anno": 2017,
      "generi": ["Fantascienza", "Dramma"],
      "piattaforme": ["Netflix"],
      "posterUrl": "https://image.tmdb.org/t/p/w500/...",
      "votoMedio": 8.1,
      "compatibilita": 87,
      "motivi": [
        "Ami il genere Fantascienza",
        "Simile a Interstellar, che ti è piaciuto"
      ],
      "punteggio": 0.804
    }
  ]
}
```

Errori: `404` utente non trovato.

### `POST /api/utenti/:utenteId/visioni`

```json
{ "filmId": "6a7f4ec1c05324d5adec8080", "valutazione": 4 }
```

Risposta `201`:

```json
{
  "messaggio": "Visione registrata",
  "titolo": "Blade Runner 2049",
  "valutazione": 4,
  "totaleVisioni": 6
}
```

Errori: `400` ID o voto non validi · `404` utente o film inesistente ·
`409` titolo già presente nello storico.

### `PUT /api/utenti/:utenteId/preferenze`

```json
{ "generiPreferiti": ["Fantascienza", "Thriller", "Crime"] }
```

### `GET /api/generi`

```json
[
  { "genere": "Dramma", "quanti": 142 },
  { "genere": "Thriller", "quanti": 98 }
]
```

---

## Come funziona il motore di raccomandazione

Il motore è **content-based**: non confronta l'utente con altri utenti, ma confronta i
titoli tra loro in base alle loro caratteristiche. Funziona quindi anche con un solo utente
registrato, senza problemi di *cold start* collaborativo.

### 1. Costruzione del profilo (`src/services/profiloUtente.ts`)

Il profilo è fatto di tre mappe: **generi**, **tag** e **nomi** (registi e attori), ognuna
con un punteggio di affinità.

- I **generi dichiarati** dall'utente partono con un peso di `1.5`.
- Ogni **visione** contribuisce con un peso pari a `voto − 3`, quindi:
  - voto 5 → `+2` (piaciuto molto)
  - voto 4 → `+1`
  - voto 3 → `0` (neutro, ignorato)
  - voto 2 → `−1`
  - voto 1 → `−2` (non piaciuto per niente)
- Il peso viene moltiplicato per un **fattore di decadimento temporale** con emivita di
  **365 giorni**: una visione di un anno fa conta la metà di una di oggi.
- Il contributo si distribuisce così: pieno sui generi, `×0.5` sui tag, pieno sul regista,
  `×0.3` su ciascun attore del cast.
- Alla fine ogni mappa viene **normalizzata** sul valore massimo, così i punteggi stanno in
  un intervallo confrontabile.

I titoli votati **4 o 5** finiscono nella lista dei "titoli amati", usata per generare la
motivazione *"Simile a X, che ti è piaciuto"*.

### 2. Calcolo del punteggio (`src/services/raccomandazioni.ts`)

Per ogni film non ancora visto:

```
punteggio = affinitàGeneri  × 0.40
          + affinitàTag     × 0.25
          + qualità         × 0.20   (votoMedio / 10)
          + affinitàPersone × 0.15   (regista + cast)
          − 0.15 se non è su nessuna delle piattaforme attive
```

### 3. Compatibilità

Il punteggio grezzo viene normalizzato nell'intervallo `−0.5 … 1.0` e trasformato nella
percentuale mostrata in interfaccia.

### 4. Varietà

La classifica non viene presa così com'è: `applicaVarieta` scorre i titoli in ordine di
punteggio e ne accetta al massimo **4 per genere**. Se dopo questo filtro non si raggiunge
il numero richiesto, la lista viene completata con i migliori rimasti.

### 5. Motivazioni

Ogni consiglio riporta fino a quattro motivi, generati da `generaMotivi`:
il genere preferito, il titolo simile già apprezzato, il voto medio alto (≥ 8.5),
il regista e l'attore graditi.

### Costanti da tarare

| Costante | File | Default |
|---|---|:---:|
| `PESO_GENERI` | `raccomandazioni.ts` | `0.40` |
| `PESO_TAG` | `raccomandazioni.ts` | `0.25` |
| `PESO_QUALITA` | `raccomandazioni.ts` | `0.20` |
| `PESO_PERSONE` | `raccomandazioni.ts` | `0.15` |
| `PENALITA_PIATTAFORMA` | `raccomandazioni.ts` | `0.15` |
| `MAX_PER_GENERE` | `raccomandazioni.ts` | `4` |
| `PESO_GENERE_DICHIARATO` | `profiloUtente.ts` | `1.5` |
| `PESO_TAG_RELATIVO` | `profiloUtente.ts` | `0.5` |
| `PESO_ATTORE_RELATIVO` | `profiloUtente.ts` | `0.3` |
| `EMIVITA_GIORNI` | `profiloUtente.ts` | `365` |
| `SOGLIA_AMATO` | `profiloUtente.ts` | `4` |

---

## Struttura del progetto

```
App_Generatore_Film/
├── src/                        # Backend
│   ├── config/
│   │   └── db.ts               # Connessione a MongoDB
│   ├── controllers/
│   │   ├── filmController.ts   # Generi (e in futuro catalogo)
│   │   ├── raccomandazioniController.ts
│   │   └── utentiController.ts # Profili, visioni, preferenze
│   ├── models/
│   │   ├── Film.ts             # Schema Mongoose del titolo
│   │   └── Utente.ts           # Schema Mongoose del profilo
│   ├── routes/
│   │   └── api.routes.ts       # Mappa degli endpoint
│   ├── seed/
│   │   ├── catalogo.ts         # Catalogo di esempio
│   │   ├── seedCatalogo.ts     # npm run seed
│   │   ├── importaTMDB.ts      # npm run importa
│   │   ├── mappaTMDB.ts        # Conversione TMDB → modello Film
│   │   ├── generiFilm.ts       # Normalizzazione dei nomi dei generi
│   │   └── tipiTMDB.ts         # Tipi delle risposte TMDB
│   ├── services/
│   │   ├── profiloUtente.ts    # Costruzione del profilo di gusti
│   │   └── raccomandazioni.ts  # Punteggio, varietà, motivazioni
│   └── index.ts                # Avvio del server
│
├── client/                     # Frontend
│   └── src/
│       ├── components/
│       │   ├── SelezionaUtente.tsx  # Scelta / creazione del profilo
│       │   ├── Splash.tsx           # Schermata iniziale
│       │   ├── Preferenze.tsx       # Scelta dei generi preferiti
│       │   ├── ListaConsigli.tsx
│       │   └── Card.tsx             # Card del singolo consiglio
│       ├── styles/             # Variabili e mixin SCSS
│       ├── App.tsx             # Router a stati tra le schermate
│       ├── tipi.ts             # Tipi condivisi col backend
│       ├── utenteCorrente.ts   # Profilo attivo salvato nel browser
│       └── main.tsx
│
├── .env                        # Non committato
├── .env.example
└── package.json
```

---

## Roadmap

**In lavorazione**
- [ ] Selezione e creazione del profilo utente dall'interfaccia
- [ ] Messaggi di errore visibili all'utente

**Prossimi passi**
- [ ] Schermata "Esplora tutti i film" con ricerca e filtri
- [ ] Modifica e rimozione delle visioni già registrate
- [ ] Selezione delle piattaforme attive dall'interfaccia
- [ ] Voto a stelle 1–5
- [ ] Trama e durata nella card

**Più avanti**
- [ ] Test unitari del motore con Vitest
- [ ] Backend che serve la build del client (deploy su singolo host)
- [ ] Import delle serie TV da TMDB
- [ ] Pagina profilo con lo storico completo
- [ ] Tema chiaro / scuro

---

## Limitazioni note

- **Nessuna autenticazione.** I profili si scelgono da un elenco: va bene per una demo, non
  per un'applicazione pubblica.
- Il parametro `limite` delle raccomandazioni è vincolato tra **6 e 8**: valori fuori da
  questo intervallo vengono riportati dentro senza segnalarlo.
- Le raccomandazioni caricano **l'intero catalogo in memoria** a ogni richiesta. Con qualche
  centinaio di titoli non è un problema, ma non scala oltre.
- L'import TMDB scarica solo **film**, non serie TV, anche se il modello dati le prevede.
- Un titolo già presente nello storico **non può essere rivotato** (l'API risponde `409`).

---

## Crediti

Dati e immagini dei film forniti da [TMDB](https://www.themoviedb.org/).
Questo prodotto usa le API di TMDB ma non è approvato o certificato da TMDB.
