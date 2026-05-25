/**
 * English message catalog. Source of truth for the translation schema —
 * `it.ts` mirrors this structure and TypeScript will catch missing keys
 * via the MessageSchema type in `../index.ts`.
 *
 * Naming conventions:
 *  - Top-level groups follow page/feature names (sidebar, dashboard, ...).
 *  - `common` holds tiny words reused everywhere (Save, Cancel, Loading…).
 *  - Use `{var}` placeholders for interpolation, `n` for `t | tc` plurals.
 */
export default {
  common: {
    loading: 'Loading…',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    edit: 'Edit',
    delete: 'Delete',
    remove: 'Remove',
    done: 'Done',
    create: 'Create',
    add: 'Add',
    name: 'Name',
    description: 'Description',
    optional: 'Optional',
    notFound: 'Not found.',
    back: 'Back',
    seeAll: 'See all →',
    yes: 'Yes',
    no: 'No'
  },

  language: {
    label: 'Language',
    english: 'English',
    italian: 'Italiano'
  },

  sidebar: {
    workspace: 'Workspace',
    dashboard: 'Dashboard',
    binder: 'Binder',
    pokedex: 'Pokédex',
    wishlist: 'Wishlist',
    friends: 'Friends',
    trades: 'Trades',
    myBinders: 'My binders',
    newBinder: 'New binder',
    tools: 'Tools',
    importFriend: 'Import friend',
    importing: 'Importing…',
    exportProfile: 'Export profile',
    settings: 'Settings',
    importFailed: 'Import failed:\n{error}'
  },

  dashboard: {
    greetingNight: 'Good night,',
    greetingMorning: 'Good morning,',
    greetingAfternoon: 'Good afternoon,',
    greetingEvening: 'Good evening,',
    trainer: 'Trainer',
    setNameHint: 'Click the ✎ icon to set your name — it appears on exported profiles.',
    editNameTooltip: 'Edit name',
    setNameTooltip: 'Set your name',
    yourNamePlaceholder: 'Your name',
    exportProfile: 'Export profile',
    newBinder: '+ New binder',
    stats: {
      cards: 'Cards',
      binders: 'Binders',
      wishlist: 'On wishlist',
      tradables: 'Tradables'
    },
    radar: {
      title: 'Trade Radar',
      subtitle: 'Cards you could swap with your friends, ranked by fairness.',
      openMatcher: 'Open matcher →',
      computing: 'Computing matches…',
      noFriends: 'No friends imported yet.',
      noFriendsHint:
        'Ask a friend for their {file} and import it from the sidebar.',
      cardsYouWant: 'cards you want',
      cardsTheyWant: 'cards they want'
    },
    recentBinders: 'Recent binders',
    recentWishlist: 'Recent wishlist',
    noBinders: 'No binders yet. Start with your first one.',
    nothingOnHunt: 'Nothing on the hunt yet.',
    cards: 'cards'
  },

  binders: {
    title: 'My Binders',
    subtitle: 'Organize your TCG collection in custom binders.',
    newBinder: '+ New Binder',
    noBindersYet: 'No binders yet.',
    createFirst: 'Create your first one to start collecting.',
    cards: 'cards',
    page: 'page',
    pages: 'pages',
    deleteConfirm: 'Delete "{name}"? This cannot be undone.',
    deleteTooltip: 'Delete binder'
  },

  binderDetail: {
    binderLabel: 'Binder',
    backToBinders: '← All binders',
    editBinder: 'Edit binder',
    perPage: '{rows} × {cols} per page',
    slotsFilled: '{filled} / {total} slots filled',
    notFound: 'Binder not found.'
  },

  binderEdit: {
    backToBinder: '← Back to binder',
    addDescription: 'Add a description…',
    pageSize: 'Page size:',
    addPage: '+ Page',
    done: 'Done',
    cover: 'Cover',
    noCoverSet: 'No cover set',
    change: 'Change',
    choose: 'Choose',
    page: 'Page {current} / {total}',
    deletePage: 'Delete page',
    deletePageConfirm: 'Delete page {n}? Cards on it will be lost.'
  },

  binderSlot: {
    setAsCover: 'Set as cover',
    removeCard: 'Remove card',
    coverBadge: 'Cover',
    tradeBadgeForTrade: 'For trade',
    tradeBadgeDupe: 'Duplicate',
    keepTitle: 'Keep — not for trade',
    forTradeTitle: 'For trade',
    dupeTitle: 'Duplicate'
  },

  wishlist: {
    title: 'Wishlist',
    subtitle: "Cards you're hunting. Friends importing your profile see this list too.",
    addCard: '+ Add card',
    empty: 'Your wishlist is empty.',
    emptyHint: 'Add cards you want, then share your profile.',
    addNotePlaceholder: 'Add a note…',
    removeTooltip: 'Remove from wishlist'
  },

  friends: {
    title: 'Friends',
    subtitle:
      "Imported profiles. Each snapshot is a copy of someone's collection at the time they exported it.",
    importProfile: '+ Import profile',
    importing: 'Importing…',
    snapshotExportedAt: 'Snapshot exported {date}',
    empty: 'No friends imported yet.',
    emptyHint: 'Ask a friend for their {file} file and import it here.',
    removeConfirm: "Remove \"{name}\"'s snapshot? You can re-import it any time.",
    removeTooltip: 'Remove snapshot',
    stats: {
      binders: 'binders',
      cards: 'cards',
      tradables: 'tradables',
      wishlist: 'wishlist'
    }
  },

  friendBinder: {
    backToFriends: '← Back to friends',
    bindersSuffix: ' · binders',
    exportedImported: 'Snapshot exported {exported} · imported {imported}',
    matchTrades: 'Match trades',
    noBinders: 'This profile has no binders.',
    notFound: 'Friend not found.',
    page: 'Page {current} / {total}'
  },

  trades: {
    title: 'Trade Matcher',
    subtitle:
      "Compares your wishlist + tradables with a friend's snapshot. Cards must be marked {forTrade} or {dupe} to show up as available.",
    forTradeWord: 'For trade',
    dupeWord: 'Duplicate',
    noFriends: 'No friends imported yet.',
    noFriendsHint: 'Import a {file} from a friend to start matching.',
    goToFriends: 'Go to Friends',
    matchWith: 'Match with',
    theyHaveYouWant: 'They have · you want',
    youHaveTheyWant: 'You have · they want',
    fairTradeSize: 'Fair-trade size',
    nothingTheirs: "Nothing on their tradable list matches your wishlist.",
    nothingYours: 'Nothing in your tradables matches their wishlist.',
    cards: 'cards'
  },

  exportDialog: {
    title: 'Export profile',
    subtitle:
      'Writes a {file} with every binder, their cards (including trade status), and your wishlist. Hand it to a friend so they can import it.',
    yourName: 'Your name',
    namePlaceholder: 'e.g. Davide',
    shownToFriends: 'Shown to friends who import this file. Saved for next time.',
    exportedTo: 'Exported to {path} ({size}).',
    export: 'Export',
    saving: 'Saving…',
    failed: 'Export failed.'
  },

  cardPicker: {
    title: 'Pick a card',
    searchPlaceholder: 'Search by Pokémon name (e.g. Charizard)…',
    typeToSearch: 'Type to search…',
    searching: 'Searching…',
    noResults: 'No cards found.'
  },

  coverPicker: {
    title: 'Choose a cover',
    subtitle: 'Pick from cards already in this binder.',
    addCardsFirst: 'Add some cards to the binder first.',
    removeCover: 'Remove cover',
    coverBadge: 'Cover'
  },

  createBinder: {
    title: 'New Binder',
    namePlaceholder: 'e.g. Base Set 1999',
    rows: 'Rows',
    cols: 'Columns',
    pages: 'Pages',
    totals: '{perPage} slots per page · {total} total slots',
    creating: 'Creating…'
  },

  addToBinder: {
    title: 'Add to binder',
    loading: 'Loading binders…',
    none: "You don't have any binders yet.",
    createOne: 'Create one →',
    full: 'Full',
    binderFull: 'This binder is full. Add a page first.',
    notFound: 'Binder not found',
    addFailed: 'Failed to add card.',
    cardsTotal: '{count} / {total} cards',
    pageOne: '· {n} page',
    pageMany: '· {n} pages'
  },

  pokedex: {
    title: 'Pokédex',
    subtitle: 'Browse Pokémon and TCG cards. Add cards directly to your binders.',
    tabPokemon: 'Pokémon',
    tabCards: 'TCG Cards',
    searchPokemonPlaceholder: 'Search Pokémon by name…',
    searchCardsPlaceholder: 'Search TCG cards by Pokémon name…',
    clearSearch: 'Clear search',
    gen: 'Gen',
    reset: 'Reset',
    resultsOne: '{n} result',
    resultsMany: '{n} results',
    noMatch: 'No Pokémon match your filters.',
    typeAtLeast: 'Type at least 2 characters to search cards.',
    searching: 'Searching…',
    noCardsFor: 'No cards found for "{query}".',
    noCardsEmpty: 'No cards to show.',
    loadingMore: 'Loading more…'
  },

  pokemonDetail: {
    back: '← Back to Pokédex',
    couldNotLoad: 'Could not load this Pokémon.',
    description: 'Description',
    baseStats: 'Base Stats',
    total: 'Total',
    profile: 'Profile',
    height: 'Height',
    weight: 'Weight',
    captureRate: 'Capture rate',
    hatchCounter: 'Hatch counter',
    gender: 'Gender',
    generation: 'Generation',
    genderless: 'Genderless',
    tcgCards: 'TCG Cards',
    showingOf: 'showing {visible} / {total}',
    loadingCards: 'Loading cards…',
    cardsLoadError: 'Could not load TCG cards.',
    noTcgCards: 'No TCG cards found for this Pokémon.',
    loadingMore: 'Loading more cards…',
    tags: {
      legendary: 'Legendary',
      mythical: 'Mythical',
      sublegendary: 'Sub-Legendary',
      baby: 'Baby',
      paradox: 'Paradox',
      ub: 'Ultra Beast',
      gen: 'Gen {n}'
    },
    stats: {
      hp: 'HP',
      atk: 'Attack',
      def: 'Defense',
      spa: 'Sp. Atk',
      spd: 'Sp. Def',
      spe: 'Speed'
    }
  },

  fairness: {
    strong: 'Strong two-way match',
    some: 'Some overlap',
    none: 'No mutual matches yet'
  },

  badges: {
    pro: 'Pro'
  }
}
