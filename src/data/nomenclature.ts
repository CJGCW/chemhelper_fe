export interface PolyatomicIon {
  formula:  string
  name:     string
  charge:   number
  aliases?: string[]
}

export interface TransitionMetalCation {
  symbol:     string
  charge:     number
  formula:    string
  iupac:      string
  classical?: string
}

export interface MainGroupCation {
  symbol:  string
  charge:  number
  formula: string
  name:    string
}

export interface MainGroupAnion {
  symbol:  string
  charge:  number
  formula: string
  name:    string
}

export const POLYATOMIC_ANIONS: PolyatomicIon[] = [
  { formula: 'OH⁻',      name: 'hydroxide',           charge: -1 },
  { formula: 'NO₃⁻',     name: 'nitrate',             charge: -1 },
  { formula: 'NO₂⁻',     name: 'nitrite',             charge: -1 },
  { formula: 'ClO₄⁻',    name: 'perchlorate',         charge: -1 },
  { formula: 'ClO₃⁻',    name: 'chlorate',            charge: -1 },
  { formula: 'ClO₂⁻',    name: 'chlorite',            charge: -1 },
  { formula: 'ClO⁻',     name: 'hypochlorite',        charge: -1 },
  { formula: 'CN⁻',      name: 'cyanide',             charge: -1 },
  { formula: 'SCN⁻',     name: 'thiocyanate',         charge: -1 },
  { formula: 'HCO₃⁻',    name: 'bicarbonate',         charge: -1, aliases: ['hydrogen carbonate'] },
  { formula: 'HSO₄⁻',    name: 'bisulfate',           charge: -1, aliases: ['hydrogen sulfate'] },
  { formula: 'MnO₄⁻',    name: 'permanganate',        charge: -1 },
  { formula: 'C₂H₃O₂⁻', name: 'acetate',             charge: -1 },
  { formula: 'H₂PO₄⁻',  name: 'dihydrogen phosphate', charge: -1 },
  { formula: 'SO₄²⁻',    name: 'sulfate',             charge: -2 },
  { formula: 'SO₃²⁻',    name: 'sulfite',             charge: -2 },
  { formula: 'CO₃²⁻',    name: 'carbonate',           charge: -2 },
  { formula: 'CrO₄²⁻',   name: 'chromate',            charge: -2 },
  { formula: 'Cr₂O₇²⁻',  name: 'dichromate',          charge: -2 },
  { formula: 'S₂O₃²⁻',   name: 'thiosulfate',         charge: -2 },
  { formula: 'HPO₄²⁻',   name: 'hydrogen phosphate',  charge: -2 },
  { formula: 'O₂²⁻',     name: 'peroxide',            charge: -2 },
  { formula: 'PO₄³⁻',    name: 'phosphate',           charge: -3 },
  { formula: 'AsO₄³⁻',   name: 'arsenate',            charge: -3 },
]

export const POLYATOMIC_CATIONS: PolyatomicIon[] = [
  { formula: 'NH₄⁺',  name: 'ammonium',    charge: 1 },
  { formula: 'Hg₂²⁺', name: 'mercury(I)',  charge: 2, aliases: ['mercurous'] },
]

export const TRANSITION_METAL_CATIONS: TransitionMetalCation[] = [
  { symbol: 'Fe', charge: 2, formula: 'Fe²⁺', iupac: 'iron(II)',      classical: 'ferrous'   },
  { symbol: 'Fe', charge: 3, formula: 'Fe³⁺', iupac: 'iron(III)',     classical: 'ferric'    },
  { symbol: 'Cu', charge: 1, formula: 'Cu⁺',  iupac: 'copper(I)',     classical: 'cuprous'   },
  { symbol: 'Cu', charge: 2, formula: 'Cu²⁺', iupac: 'copper(II)',    classical: 'cupric'    },
  { symbol: 'Sn', charge: 2, formula: 'Sn²⁺', iupac: 'tin(II)',       classical: 'stannous'  },
  { symbol: 'Sn', charge: 4, formula: 'Sn⁴⁺', iupac: 'tin(IV)',       classical: 'stannic'   },
  { symbol: 'Pb', charge: 2, formula: 'Pb²⁺', iupac: 'lead(II)',      classical: 'plumbous'  },
  { symbol: 'Pb', charge: 4, formula: 'Pb⁴⁺', iupac: 'lead(IV)',      classical: 'plumbic'   },
  { symbol: 'Hg', charge: 2, formula: 'Hg²⁺', iupac: 'mercury(II)',   classical: 'mercuric'  },
  { symbol: 'Cr', charge: 2, formula: 'Cr²⁺', iupac: 'chromium(II)'                         },
  { symbol: 'Cr', charge: 3, formula: 'Cr³⁺', iupac: 'chromium(III)'                        },
  { symbol: 'Mn', charge: 2, formula: 'Mn²⁺', iupac: 'manganese(II)', classical: 'manganous' },
  { symbol: 'Co', charge: 2, formula: 'Co²⁺', iupac: 'cobalt(II)',    classical: 'cobaltous' },
  { symbol: 'Co', charge: 3, formula: 'Co³⁺', iupac: 'cobalt(III)',   classical: 'cobaltic'  },
  { symbol: 'Ni', charge: 2, formula: 'Ni²⁺', iupac: 'nickel(II)'                           },
  { symbol: 'Au', charge: 1, formula: 'Au⁺',  iupac: 'gold(I)',       classical: 'aurous'    },
  { symbol: 'Au', charge: 3, formula: 'Au³⁺', iupac: 'gold(III)',     classical: 'auric'     },
]

export const MAIN_GROUP_CATIONS: MainGroupCation[] = [
  { symbol: 'Li', charge: 1, formula: 'Li⁺',  name: 'lithium'   },
  { symbol: 'Na', charge: 1, formula: 'Na⁺',  name: 'sodium'    },
  { symbol: 'K',  charge: 1, formula: 'K⁺',   name: 'potassium' },
  { symbol: 'Rb', charge: 1, formula: 'Rb⁺',  name: 'rubidium'  },
  { symbol: 'Cs', charge: 1, formula: 'Cs⁺',  name: 'cesium'    },
  { symbol: 'Be', charge: 2, formula: 'Be²⁺', name: 'beryllium' },
  { symbol: 'Mg', charge: 2, formula: 'Mg²⁺', name: 'magnesium' },
  { symbol: 'Ca', charge: 2, formula: 'Ca²⁺', name: 'calcium'   },
  { symbol: 'Sr', charge: 2, formula: 'Sr²⁺', name: 'strontium' },
  { symbol: 'Ba', charge: 2, formula: 'Ba²⁺', name: 'barium'    },
  { symbol: 'Al', charge: 3, formula: 'Al³⁺', name: 'aluminum'  },
]

export const MAIN_GROUP_ANIONS: MainGroupAnion[] = [
  { symbol: 'F',  charge: -1, formula: 'F⁻',   name: 'fluoride'  },
  { symbol: 'Cl', charge: -1, formula: 'Cl⁻',  name: 'chloride'  },
  { symbol: 'Br', charge: -1, formula: 'Br⁻',  name: 'bromide'   },
  { symbol: 'I',  charge: -1, formula: 'I⁻',   name: 'iodide'    },
  { symbol: 'O',  charge: -2, formula: 'O²⁻',  name: 'oxide'     },
  { symbol: 'S',  charge: -2, formula: 'S²⁻',  name: 'sulfide'   },
  { symbol: 'N',  charge: -3, formula: 'N³⁻',  name: 'nitride'   },
  { symbol: 'P',  charge: -3, formula: 'P³⁻',  name: 'phosphide' },
]

export const GREEK_PREFIXES: Record<number, string> = {
  1: 'mono', 2: 'di', 3: 'tri', 4: 'tetra', 5: 'penta',
  6: 'hexa', 7: 'hepta', 8: 'octa', 9: 'nona', 10: 'deca',
}

// Subscript/superscript conversion helpers exported so both data and chem layers can use them
export const SUBSCRIPT_DIGITS: Record<string, string> = {
  '₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9',
}
export const SUPERSCRIPT_CHARS: Record<string, string> = {
  '⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9',
  '⁺':'+','⁻':'-',
}
