// ElectroPulse — Indian Political Party Configuration
// Colors, alliances, and metadata for 2026 Assembly Elections
// States: West Bengal, Tamil Nadu, Kerala, Assam, Puducherry

// ============================================
// ALLIANCE BLOCS
// ============================================
export type Alliance = 'NDA' | 'INDIA' | 'LDF' | 'OTHERS' | 'IND';

export const ALLIANCE_META: Record<Alliance, { name: string; fullName: string; color: string }> = {
  NDA:    { name: 'NDA',    fullName: 'National Democratic Alliance',       color: '#ff9933' },
  INDIA:  { name: 'INDIA',  fullName: 'Indian National Developmental Inclusive Alliance', color: '#19aaed' },
  LDF:    { name: 'LDF',    fullName: 'Left Democratic Front',              color: '#cc2222' },
  OTHERS: { name: 'Others', fullName: 'Other Parties / Regional',           color: '#888888' },
  IND:    { name: 'IND',    fullName: 'Independent Candidates',             color: '#aaaaaa' },
};

// ============================================
// PARTY DEFINITIONS
// ============================================
export interface PartyConfig {
  abbr: string;          // ECI abbreviation (e.g. "BJP", "INC")
  name: string;          // Full party name
  color: string;         // Hex color for map/charts
  colorRGBA: [number, number, number, number]; // RGBA for deck.gl layers
  alliance: Alliance;
  states: string[];      // States where this party is active in 2026
  symbol?: string;       // ECI symbol name
}

export const PARTIES: Record<string, PartyConfig> = {
  // ============================================
  // NATIONAL PARTIES
  // ============================================
  BJP: {
    abbr: 'BJP',
    name: 'Bharatiya Janata Party',
    color: '#FF9933',
    colorRGBA: [255, 153, 51, 200],
    alliance: 'NDA',
    states: ['WEST BENGAL', 'TAMIL NADU', 'KERALA', 'ASSAM', 'PUDUCHERRY'],
    symbol: 'Lotus',
  },
  INC: {
    abbr: 'INC',
    name: 'Indian National Congress',
    color: '#19AAED',
    colorRGBA: [25, 170, 237, 200],
    alliance: 'INDIA',
    states: ['WEST BENGAL', 'TAMIL NADU', 'KERALA', 'ASSAM', 'PUDUCHERRY'],
    symbol: 'Hand',
  },
  'CPI(M)': {
    abbr: 'CPI(M)',
    name: 'Communist Party of India (Marxist)',
    color: '#CC2222',
    colorRGBA: [204, 34, 34, 200],
    alliance: 'LDF',
    states: ['WEST BENGAL', 'KERALA', 'TAMIL NADU'],
    symbol: 'Hammer Sickle Star',
  },
  CPI: {
    abbr: 'CPI',
    name: 'Communist Party of India',
    color: '#E03030',
    colorRGBA: [224, 48, 48, 200],
    alliance: 'LDF',
    states: ['KERALA', 'WEST BENGAL', 'TAMIL NADU'],
    symbol: 'Ears of Corn and Sickle',
  },
  BSP: {
    abbr: 'BSP',
    name: 'Bahujan Samaj Party',
    color: '#22409A',
    colorRGBA: [34, 64, 154, 200],
    alliance: 'OTHERS',
    states: ['WEST BENGAL', 'ASSAM'],
    symbol: 'Elephant',
  },
  NCP: {
    abbr: 'NCP',
    name: 'Nationalist Congress Party',
    color: '#00B2FF',
    colorRGBA: [0, 178, 255, 200],
    alliance: 'INDIA',
    states: ['KERALA'],
    symbol: 'Clock',
  },
  AAP: {
    abbr: 'AAP',
    name: 'Aam Aadmi Party',
    color: '#0066B3',
    colorRGBA: [0, 102, 179, 200],
    alliance: 'INDIA',
    states: ['PUDUCHERRY', 'ASSAM'],
    symbol: 'Broom',
  },

  // ============================================
  // WEST BENGAL — Key Parties
  // ============================================
  AITC: {
    abbr: 'AITC',
    name: 'All India Trinamool Congress',
    color: '#20C646',
    colorRGBA: [32, 198, 70, 200],
    alliance: 'INDIA',
    states: ['WEST BENGAL'],
    symbol: 'Flowers and Grass',
  },
  RSP: {
    abbr: 'RSP',
    name: 'Revolutionary Socialist Party',
    color: '#D43D3D',
    colorRGBA: [212, 61, 61, 200],
    alliance: 'LDF',
    states: ['WEST BENGAL', 'KERALA'],
    symbol: 'Spade & Stoker',
  },
  AIFB: {
    abbr: 'AIFB',
    name: 'All India Forward Bloc',
    color: '#C44545',
    colorRGBA: [196, 69, 69, 200],
    alliance: 'LDF',
    states: ['WEST BENGAL'],
    symbol: 'Lion',
  },
  ISF: {
    abbr: 'ISF',
    name: 'Indian Secular Front',
    color: '#2E8B57',
    colorRGBA: [46, 139, 87, 200],
    alliance: 'OTHERS',
    states: ['WEST BENGAL'],
  },

  // ============================================
  // TAMIL NADU — Key Parties
  // ============================================
  DMK: {
    abbr: 'DMK',
    name: 'Dravida Munnetra Kazhagam',
    color: '#E5202E',
    colorRGBA: [229, 32, 46, 200],
    alliance: 'INDIA',
    states: ['TAMIL NADU', 'PUDUCHERRY'],
    symbol: 'Rising Sun',
  },
  AIADMK: {
    abbr: 'AIADMK',
    name: 'All India Anna Dravida Munnetra Kazhagam',
    color: '#1B8D1B',
    colorRGBA: [27, 141, 27, 200],
    alliance: 'OTHERS',
    states: ['TAMIL NADU', 'PUDUCHERRY'],
    symbol: 'Two Leaves',
  },
  PMK: {
    abbr: 'PMK',
    name: 'Pattali Makkal Katchi',
    color: '#FFCC00',
    colorRGBA: [255, 204, 0, 200],
    alliance: 'NDA',
    states: ['TAMIL NADU', 'PUDUCHERRY'],
    symbol: 'Mango',
  },
  MDMK: {
    abbr: 'MDMK',
    name: 'Marumalarchi Dravida Munnetra Kazhagam',
    color: '#F44E1C',
    colorRGBA: [244, 78, 28, 200],
    alliance: 'INDIA',
    states: ['TAMIL NADU'],
    symbol: 'Top',
  },
  VCK: {
    abbr: 'VCK',
    name: 'Viduthalai Chiruthaigal Katchi',
    color: '#0033CC',
    colorRGBA: [0, 51, 204, 200],
    alliance: 'INDIA',
    states: ['TAMIL NADU'],
    symbol: 'Pot',
  },
  DMDK: {
    abbr: 'DMDK',
    name: 'Desiya Murpokku Dravida Kazhagam',
    color: '#FFD700',
    colorRGBA: [255, 215, 0, 200],
    alliance: 'OTHERS',
    states: ['TAMIL NADU'],
    symbol: 'Nagara',
  },
  TVK: {
    abbr: 'TVK',
    name: 'Tamilaga Vettri Kazhagam',
    color: '#8B0000',
    colorRGBA: [139, 0, 0, 200],
    alliance: 'OTHERS',
    states: ['TAMIL NADU'],
  },
  NTK: {
    abbr: 'NTK',
    name: 'Naam Tamilar Katchi',
    color: '#B22222',
    colorRGBA: [178, 34, 34, 200],
    alliance: 'OTHERS',
    states: ['TAMIL NADU'],
    symbol: 'Hearth',
  },

  // ============================================
  // KERALA — Key Parties (LDF vs UDF)
  // ============================================
  IUML: {
    abbr: 'IUML',
    name: 'Indian Union Muslim League',
    color: '#006400',
    colorRGBA: [0, 100, 0, 200],
    alliance: 'INDIA',
    states: ['KERALA'],
    symbol: 'Ladder',
  },
  KC: {
    abbr: 'KC(M)',
    name: 'Kerala Congress (Mani)',
    color: '#004D99',
    colorRGBA: [0, 77, 153, 200],
    alliance: 'INDIA',
    states: ['KERALA'],
    symbol: 'Two Leaves',
  },
  JD_S: {
    abbr: 'JD(S)',
    name: 'Janata Dal (Secular)',
    color: '#138808',
    colorRGBA: [19, 136, 8, 200],
    alliance: 'LDF',
    states: ['KERALA'],
    symbol: 'Lady Farmer',
  },
  KCJB: {
    abbr: 'KC(J)',
    name: 'Kerala Congress (Joseph)',
    color: '#336699',
    colorRGBA: [51, 102, 153, 200],
    alliance: 'LDF',
    states: ['KERALA'],
  },
  NDP: {
    abbr: 'NDP',
    name: 'Nationalist Democratic Party',
    color: '#7B3F00',
    colorRGBA: [123, 63, 0, 200],
    alliance: 'NDA',
    states: ['KERALA'],
  },

  // ============================================
  // ASSAM — Key Parties
  // ============================================
  AGP: {
    abbr: 'AGP',
    name: 'Asom Gana Parishad',
    color: '#FF6600',
    colorRGBA: [255, 102, 0, 200],
    alliance: 'NDA',
    states: ['ASSAM'],
    symbol: 'Elephant',
  },
  UPPL: {
    abbr: 'UPPL',
    name: 'United Peoples Party Liberal',
    color: '#FF8C00',
    colorRGBA: [255, 140, 0, 200],
    alliance: 'NDA',
    states: ['ASSAM'],
  },
  AIUDF: {
    abbr: 'AIUDF',
    name: 'All India United Democratic Front',
    color: '#228B22',
    colorRGBA: [34, 139, 34, 200],
    alliance: 'INDIA',
    states: ['ASSAM'],
    symbol: 'Lock and Key',
  },
  BPF: {
    abbr: 'BPF',
    name: 'Bodoland Peoples Front',
    color: '#4CAF50',
    colorRGBA: [76, 175, 80, 200],
    alliance: 'OTHERS',
    states: ['ASSAM'],
  },
  AJP: {
    abbr: 'AJP',
    name: 'Assam Jatiya Parishad',
    color: '#9C27B0',
    colorRGBA: [156, 39, 176, 200],
    alliance: 'OTHERS',
    states: ['ASSAM'],
  },
  RD: {
    abbr: 'RD',
    name: 'Raijor Dal',
    color: '#880088',
    colorRGBA: [136, 0, 136, 200],
    alliance: 'OTHERS',
    states: ['ASSAM'],
  },

  // ============================================
  // PUDUCHERRY — Key Parties
  // ============================================
  AINRC: {
    abbr: 'AINRC',
    name: 'All India NR Congress',
    color: '#FF4500',
    colorRGBA: [255, 69, 0, 200],
    alliance: 'NDA',
    states: ['PUDUCHERRY'],
    symbol: 'Jug',
  },

  // ============================================
  // INDEPENDENT / NOTA
  // ============================================
  IND: {
    abbr: 'IND',
    name: 'Independent',
    color: '#AAAAAA',
    colorRGBA: [170, 170, 170, 160],
    alliance: 'IND',
    states: ['WEST BENGAL', 'TAMIL NADU', 'KERALA', 'ASSAM', 'PUDUCHERRY'],
  },
  NOTA: {
    abbr: 'NOTA',
    name: 'None of the Above',
    color: '#555555',
    colorRGBA: [85, 85, 85, 160],
    alliance: 'OTHERS',
    states: [],
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/** Get party config by ECI abbreviation (case-insensitive) */
export function getParty(abbr: string): PartyConfig | undefined {
  const upper = abbr.toUpperCase().trim();
  return PARTIES[upper] ?? Object.values(PARTIES).find(p => p.abbr.toUpperCase() === upper);
}

/** Get party color hex by abbreviation, with fallback */
export function getPartyColor(abbr: string): string {
  return getParty(abbr)?.color ?? '#888888';
}

/** Get party RGBA for deck.gl, with fallback */
export function getPartyRGBA(abbr: string): [number, number, number, number] {
  return getParty(abbr)?.colorRGBA ?? [136, 136, 136, 160];
}

/** Get alliance color for a party */
export function getAllianceColor(abbr: string): string {
  const party = getParty(abbr);
  if (!party) return ALLIANCE_META.OTHERS.color;
  return ALLIANCE_META[party.alliance]?.color ?? ALLIANCE_META.OTHERS.color;
}

/** Get all parties active in a specific state */
export function getPartiesForState(stateName: string): PartyConfig[] {
  return Object.values(PARTIES).filter(p => p.states.includes(stateName));
}

/** Get parties grouped by alliance for a state */
export function getPartiesByAlliance(stateName: string): Record<Alliance, PartyConfig[]> {
  const result: Record<Alliance, PartyConfig[]> = { NDA: [], INDIA: [], LDF: [], OTHERS: [], IND: [] };
  for (const party of getPartiesForState(stateName)) {
    result[party.alliance].push(party);
  }
  return result;
}

// ============================================
// STATE-LEVEL ALLIANCE CONTEXT (2021 incumbents)
// ============================================
export const STATE_INCUMBENT_2021: Record<string, { party: string; cm: string; alliance: Alliance }> = {
  'WEST BENGAL': { party: 'AITC', cm: 'Mamata Banerjee', alliance: 'INDIA' },
  'TAMIL NADU':  { party: 'DMK',  cm: 'M.K. Stalin',     alliance: 'INDIA' },
  'KERALA':      { party: 'CPI(M)', cm: 'Pinarayi Vijayan', alliance: 'LDF' },
  'ASSAM':       { party: 'BJP',  cm: 'Himanta Biswa Sarma', alliance: 'NDA' },
  'PUDUCHERRY':  { party: 'AINRC', cm: 'N. Rangasamy',    alliance: 'NDA' },
};
