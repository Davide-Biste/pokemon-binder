/** Italian catalog. Mirrors the structure of en.ts — keys must match exactly. */
import type { MessageSchema } from '..'

const it: MessageSchema = {
  common: {
    loading: 'Caricamento…',
    save: 'Salva',
    cancel: 'Annulla',
    close: 'Chiudi',
    edit: 'Modifica',
    delete: 'Elimina',
    remove: 'Rimuovi',
    done: 'Fatto',
    create: 'Crea',
    add: 'Aggiungi',
    name: 'Nome',
    description: 'Descrizione',
    optional: 'Opzionale',
    notFound: 'Non trovato.',
    back: 'Indietro',
    seeAll: 'Vedi tutto →',
    yes: 'Sì',
    no: 'No'
  },

  language: {
    label: 'Lingua',
    english: 'English',
    italian: 'Italiano'
  },

  sidebar: {
    workspace: 'Workspace',
    dashboard: 'Dashboard',
    binder: 'Binder',
    pokedex: 'Pokédex',
    wishlist: 'Wishlist',
    friends: 'Amici',
    trades: 'Scambi',
    myBinders: 'I miei binder',
    newBinder: 'Nuovo binder',
    tools: 'Strumenti',
    importFriend: 'Importa amico',
    importing: 'Importazione…',
    exportProfile: 'Esporta profilo',
    settings: 'Impostazioni',
    importFailed: 'Import fallito:\n{error}'
  },

  dashboard: {
    greetingNight: 'Buonanotte,',
    greetingMorning: 'Buongiorno,',
    greetingAfternoon: 'Buon pomeriggio,',
    greetingEvening: 'Buonasera,',
    trainer: 'Allenatore',
    setNameHint:
      "Clicca l'icona ✎ per impostare il tuo nome — appare nei profili esportati.",
    editNameTooltip: 'Modifica nome',
    setNameTooltip: 'Imposta il tuo nome',
    yourNamePlaceholder: 'Il tuo nome',
    exportProfile: 'Esporta profilo',
    newBinder: '+ Nuovo binder',
    stats: {
      cards: 'Carte',
      binders: 'Binder',
      wishlist: 'In wishlist',
      tradables: 'Scambiabili'
    },
    radar: {
      title: 'Trade Radar',
      subtitle: 'Carte che potresti scambiare con i tuoi amici, ordinate per equità.',
      openMatcher: 'Apri matcher →',
      computing: 'Calcolo match…',
      noFriends: 'Nessun amico importato.',
      noFriendsHint:
        'Chiedi a un amico il suo file {file} e importalo dalla sidebar.',
      cardsYouWant: 'carte che vuoi',
      cardsTheyWant: 'carte che vogliono'
    },
    recentBinders: 'Binder recenti',
    recentWishlist: 'Wishlist recente',
    noBinders: 'Nessun binder. Crea il primo per iniziare.',
    nothingOnHunt: 'Niente da cacciare per ora.',
    cards: 'carte'
  },

  binders: {
    title: 'I miei binder',
    subtitle: 'Organizza la tua collezione TCG in binder personalizzati.',
    newBinder: '+ Nuovo binder',
    noBindersYet: 'Nessun binder ancora.',
    createFirst: 'Crea il primo per iniziare a collezionare.',
    cards: 'carte',
    page: 'pagina',
    pages: 'pagine',
    deleteConfirm: 'Eliminare "{name}"? Non si può annullare.',
    deleteTooltip: 'Elimina binder'
  },

  binderDetail: {
    binderLabel: 'Binder',
    backToBinders: '← Tutti i binder',
    editBinder: 'Modifica binder',
    perPage: '{rows} × {cols} per pagina',
    slotsFilled: '{filled} / {total} slot occupati',
    notFound: 'Binder non trovato.'
  },

  binderEdit: {
    backToBinder: '← Torna al binder',
    addDescription: 'Aggiungi una descrizione…',
    pageSize: 'Pagina:',
    addPage: '+ Pagina',
    done: 'Fatto',
    cover: 'Copertina',
    noCoverSet: 'Nessuna copertina',
    change: 'Cambia',
    choose: 'Scegli',
    page: 'Pagina {current} / {total}',
    deletePage: 'Elimina pagina',
    deletePageConfirm: 'Eliminare pagina {n}? Le carte verranno perse.'
  },

  binderSlot: {
    setAsCover: 'Imposta come copertina',
    removeCard: 'Rimuovi carta',
    coverBadge: 'Copertina',
    tradeBadgeForTrade: 'Scambio',
    tradeBadgeDupe: 'Doppione',
    keepTitle: 'Tienila — non in scambio',
    forTradeTitle: 'In scambio',
    dupeTitle: 'Doppione'
  },

  wishlist: {
    title: 'Wishlist',
    subtitle:
      'Carte che stai cercando. Gli amici che importano il tuo profilo vedono anche questa lista.',
    addCard: '+ Aggiungi carta',
    empty: 'La tua wishlist è vuota.',
    emptyHint: 'Aggiungi le carte che vuoi, poi condividi il profilo.',
    addNotePlaceholder: 'Aggiungi una nota…',
    removeTooltip: 'Rimuovi dalla wishlist'
  },

  friends: {
    title: 'Amici',
    subtitle:
      'Profili importati. Ogni snapshot è una copia della collezione di qualcuno al momento dell\'export.',
    importProfile: '+ Importa profilo',
    importing: 'Importazione…',
    snapshotExportedAt: 'Snapshot esportato il {date}',
    empty: 'Nessun amico importato.',
    emptyHint: 'Chiedi a un amico il file {file} e importalo qui.',
    removeConfirm: 'Rimuovere lo snapshot di "{name}"? Puoi reimportarlo quando vuoi.',
    removeTooltip: 'Rimuovi snapshot',
    stats: {
      binders: 'binder',
      cards: 'carte',
      tradables: 'scambiabili',
      wishlist: 'wishlist'
    }
  },

  friendBinder: {
    backToFriends: '← Torna agli amici',
    bindersSuffix: ' · binder',
    exportedImported: 'Snapshot esportato {exported} · importato {imported}',
    matchTrades: 'Trova scambi',
    noBinders: 'Questo profilo non ha binder.',
    notFound: 'Amico non trovato.',
    page: 'Pagina {current} / {total}'
  },

  trades: {
    title: 'Trade Matcher',
    subtitle:
      'Confronta la tua wishlist + scambiabili con lo snapshot di un amico. Le carte devono essere marcate {forTrade} o {dupe} per essere disponibili.',
    forTradeWord: 'Scambio',
    dupeWord: 'Doppione',
    noFriends: 'Nessun amico importato.',
    noFriendsHint: 'Importa un file {file} da un amico per iniziare a fare match.',
    goToFriends: 'Vai agli Amici',
    matchWith: 'Match con',
    theyHaveYouWant: 'Loro hanno · tu vuoi',
    youHaveTheyWant: 'Tu hai · loro vogliono',
    fairTradeSize: 'Dimensione scambio equo',
    nothingTheirs: 'Niente tra le loro carte scambiabili che combaci con la tua wishlist.',
    nothingYours: 'Niente tra le tue carte scambiabili che combaci con la loro wishlist.',
    cards: 'carte'
  },

  exportDialog: {
    title: 'Esporta profilo',
    subtitle:
      'Scrive un file {file} con tutti i binder, le carte (incluso lo stato scambio) e la wishlist. Dallo a un amico per fargli fare import.',
    yourName: 'Il tuo nome',
    namePlaceholder: 'es. Davide',
    shownToFriends:
      'Mostrato agli amici che importano questo file. Salvato per la prossima volta.',
    exportedTo: 'Esportato in {path} ({size}).',
    export: 'Esporta',
    saving: 'Salvataggio…',
    failed: 'Export fallito.'
  },

  cardPicker: {
    title: 'Scegli una carta',
    searchPlaceholder: 'Cerca per nome Pokémon (es. Charizard)…',
    typeToSearch: 'Scrivi per cercare…',
    searching: 'Ricerca…',
    noResults: 'Nessuna carta trovata.'
  },

  coverPicker: {
    title: 'Scegli una copertina',
    subtitle: 'Scegli tra le carte già nel binder.',
    addCardsFirst: 'Aggiungi prima qualche carta al binder.',
    removeCover: 'Rimuovi copertina',
    coverBadge: 'Copertina'
  },

  createBinder: {
    title: 'Nuovo binder',
    namePlaceholder: 'es. Base Set 1999',
    rows: 'Righe',
    cols: 'Colonne',
    pages: 'Pagine',
    totals: '{perPage} slot per pagina · {total} slot totali',
    creating: 'Creazione…'
  },

  addToBinder: {
    title: 'Aggiungi al binder',
    loading: 'Caricamento binder…',
    none: 'Non hai ancora nessun binder.',
    createOne: 'Creane uno →',
    full: 'Pieno',
    binderFull: 'Questo binder è pieno. Aggiungi prima una pagina.',
    notFound: 'Binder non trovato',
    addFailed: 'Aggiunta carta fallita.',
    cardsTotal: '{count} / {total} carte',
    pageOne: '· {n} pagina',
    pageMany: '· {n} pagine'
  },

  pokedex: {
    title: 'Pokédex',
    subtitle: 'Sfoglia Pokémon e carte TCG. Aggiungile direttamente ai tuoi binder.',
    tabPokemon: 'Pokémon',
    tabCards: 'Carte TCG',
    searchPokemonPlaceholder: 'Cerca Pokémon per nome…',
    searchCardsPlaceholder: 'Cerca carte TCG per nome Pokémon…',
    clearSearch: 'Cancella ricerca',
    gen: 'Gen',
    reset: 'Reset',
    resultsOne: '{n} risultato',
    resultsMany: '{n} risultati',
    noMatch: 'Nessun Pokémon corrisponde ai filtri.',
    typeAtLeast: 'Scrivi almeno 2 caratteri per cercare le carte.',
    searching: 'Ricerca…',
    noCardsFor: 'Nessuna carta trovata per "{query}".',
    noCardsEmpty: 'Nessuna carta da mostrare.',
    loadingMore: 'Carico altri…'
  },

  pokemonDetail: {
    back: '← Torna al Pokédex',
    couldNotLoad: 'Impossibile caricare questo Pokémon.',
    description: 'Descrizione',
    baseStats: 'Statistiche base',
    total: 'Totale',
    profile: 'Profilo',
    height: 'Altezza',
    weight: 'Peso',
    captureRate: 'Tasso cattura',
    hatchCounter: 'Hatch counter',
    gender: 'Genere',
    generation: 'Generazione',
    genderless: 'Asessuato',
    tcgCards: 'Carte TCG',
    showingOf: 'mostro {visible} / {total}',
    loadingCards: 'Caricamento carte…',
    cardsLoadError: 'Impossibile caricare le carte TCG.',
    noTcgCards: 'Nessuna carta TCG trovata per questo Pokémon.',
    loadingMore: 'Caricamento altre carte…',
    tags: {
      legendary: 'Leggendario',
      mythical: 'Misterioso',
      sublegendary: 'Sub-leggendario',
      baby: 'Baby',
      paradox: 'Paradosso',
      ub: 'Ultracreatura',
      gen: 'Gen {n}'
    },
    stats: {
      hp: 'PS',
      atk: 'Attacco',
      def: 'Difesa',
      spa: 'Att. Sp.',
      spd: 'Dif. Sp.',
      spe: 'Velocità'
    }
  },

  fairness: {
    strong: 'Match forte in entrambe le direzioni',
    some: 'Qualche overlap',
    none: 'Nessun match reciproco'
  },

  badges: {
    pro: 'Pro'
  }
}

export default it
