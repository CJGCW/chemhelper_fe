// ── Types ─────────────────────────────────────────────────────────────────────

export interface CompoundEntry {
  formula: string            // ASCII, e.g. "H2O"
  name:    string
  state:   'g' | 'l' | 's' | 'aq'
  dhf:     number            // kJ/mol; 0 for standard-state elements
}

// ── Standard enthalpies of formation (298 K, 1 atm) ──────────────────────────

export const HF_DATA: CompoundEntry[] = [
  // ── Elements in standard state (ΔHf° = 0) ─────────────────────────────────
  { formula: 'H2',       name: 'hydrogen',             state: 'g', dhf:     0     },
  { formula: 'O2',       name: 'oxygen',               state: 'g', dhf:     0     },
  { formula: 'N2',       name: 'nitrogen',             state: 'g', dhf:     0     },
  { formula: 'C',        name: 'carbon (graphite)',     state: 's', dhf:     0     },
  { formula: 'S',        name: 'sulfur (rhombic)',      state: 's', dhf:     0     },
  { formula: 'Cl2',      name: 'chlorine',             state: 'g', dhf:     0     },
  { formula: 'Br2',      name: 'bromine',              state: 'l', dhf:     0     },
  { formula: 'I2',       name: 'iodine',               state: 's', dhf:     0     },
  { formula: 'F2',       name: 'fluorine',             state: 'g', dhf:     0     },
  { formula: 'Na',       name: 'sodium',               state: 's', dhf:     0     },
  { formula: 'K',        name: 'potassium',            state: 's', dhf:     0     },
  { formula: 'Ca',       name: 'calcium',              state: 's', dhf:     0     },
  { formula: 'Mg',       name: 'magnesium',            state: 's', dhf:     0     },
  { formula: 'Al',       name: 'aluminum',             state: 's', dhf:     0     },
  { formula: 'Fe',       name: 'iron',                 state: 's', dhf:     0     },
  { formula: 'Cu',       name: 'copper',               state: 's', dhf:     0     },
  { formula: 'Zn',       name: 'zinc',                 state: 's', dhf:     0     },
  { formula: 'Ag',       name: 'silver',               state: 's', dhf:     0     },
  { formula: 'Pb',       name: 'lead',                 state: 's', dhf:     0     },
  { formula: 'P4',       name: 'phosphorus (white)',   state: 's', dhf:     0     },

  // ── Water & hydrogen peroxide ──────────────────────────────────────────────
  { formula: 'H2O',      name: 'water',                state: 'l', dhf:  -285.8   },
  { formula: 'H2O',      name: 'water vapor',          state: 'g', dhf:  -241.8   },
  { formula: 'H2O2',     name: 'hydrogen peroxide',    state: 'l', dhf:  -187.8   },

  // ── Carbon oxides ──────────────────────────────────────────────────────────
  { formula: 'CO',       name: 'carbon monoxide',      state: 'g', dhf:  -110.5   },
  { formula: 'CO2',      name: 'carbon dioxide',       state: 'g', dhf:  -393.5   },

  // ── Nitrogen compounds ─────────────────────────────────────────────────────
  { formula: 'NH3',      name: 'ammonia',              state: 'g', dhf:   -46.1   },
  { formula: 'NO',       name: 'nitric oxide',         state: 'g', dhf:    90.3   },
  { formula: 'NO2',      name: 'nitrogen dioxide',     state: 'g', dhf:    33.2   },
  { formula: 'N2O',      name: 'nitrous oxide',        state: 'g', dhf:    82.1   },
  { formula: 'N2O4',     name: 'dinitrogen tetroxide', state: 'g', dhf:     9.2   },
  { formula: 'HNO3',     name: 'nitric acid',          state: 'l', dhf:  -174.1   },

  // ── Sulfur compounds ───────────────────────────────────────────────────────
  { formula: 'SO2',      name: 'sulfur dioxide',       state: 'g', dhf:  -296.8   },
  { formula: 'SO3',      name: 'sulfur trioxide',      state: 'g', dhf:  -395.7   },
  { formula: 'H2SO4',    name: 'sulfuric acid',        state: 'l', dhf:  -814.0   },
  { formula: 'H2S',      name: 'hydrogen sulfide',     state: 'g', dhf:   -20.6   },

  // ── Hydrogen halides ───────────────────────────────────────────────────────
  { formula: 'HF',       name: 'hydrogen fluoride',    state: 'g', dhf:  -273.3   },
  { formula: 'HCl',      name: 'hydrogen chloride',    state: 'g', dhf:   -92.3   },
  { formula: 'HBr',      name: 'hydrogen bromide',     state: 'g', dhf:   -36.4   },
  { formula: 'HI',       name: 'hydrogen iodide',      state: 'g', dhf:    26.5   },

  // ── Sodium / potassium compounds ───────────────────────────────────────────
  { formula: 'NaCl',     name: 'sodium chloride',      state: 's', dhf:  -411.2   },
  { formula: 'NaOH',     name: 'sodium hydroxide',     state: 's', dhf:  -425.9   },
  { formula: 'Na2O',     name: 'sodium oxide',         state: 's', dhf:  -414.2   },
  { formula: 'Na2CO3',   name: 'sodium carbonate',     state: 's', dhf: -1130.7   },
  { formula: 'NaHCO3',   name: 'sodium bicarbonate',   state: 's', dhf:  -950.8   },
  { formula: 'KCl',      name: 'potassium chloride',   state: 's', dhf:  -436.7   },
  { formula: 'KOH',      name: 'potassium hydroxide',  state: 's', dhf:  -424.8   },

  // ── Calcium / magnesium ────────────────────────────────────────────────────
  { formula: 'CaO',      name: 'calcium oxide',        state: 's', dhf:  -635.1   },
  { formula: 'Ca(OH)2',  name: 'calcium hydroxide',    state: 's', dhf:  -986.1   },
  { formula: 'CaCO3',    name: 'calcium carbonate',    state: 's', dhf: -1207.6   },
  { formula: 'CaCl2',    name: 'calcium chloride',     state: 's', dhf:  -795.8   },
  { formula: 'MgO',      name: 'magnesium oxide',      state: 's', dhf:  -601.6   },
  { formula: 'Mg(OH)2',  name: 'magnesium hydroxide',  state: 's', dhf:  -924.5   },

  // ── Metal oxides ───────────────────────────────────────────────────────────
  { formula: 'Al2O3',    name: 'aluminum oxide',       state: 's', dhf: -1675.7   },
  { formula: 'Fe2O3',    name: 'iron(III) oxide',      state: 's', dhf:  -824.2   },
  { formula: 'Fe3O4',    name: 'iron(II,III) oxide',   state: 's', dhf: -1118.4   },
  { formula: 'CuO',      name: 'copper(II) oxide',     state: 's', dhf:  -157.3   },
  { formula: 'ZnO',      name: 'zinc oxide',           state: 's', dhf:  -350.5   },
  { formula: 'SiO2',     name: 'silicon dioxide',      state: 's', dhf:  -910.7   },
  { formula: 'PbO',      name: 'lead(II) oxide',       state: 's', dhf:  -217.3   },

  // ── Hydrocarbons ───────────────────────────────────────────────────────────
  { formula: 'CH4',      name: 'methane',              state: 'g', dhf:   -74.8   },
  { formula: 'C2H2',     name: 'acetylene',            state: 'g', dhf:   226.7   },
  { formula: 'C2H4',     name: 'ethylene',             state: 'g', dhf:    52.5   },
  { formula: 'C2H6',     name: 'ethane',               state: 'g', dhf:   -84.7   },
  { formula: 'C3H8',     name: 'propane',              state: 'g', dhf:  -103.8   },
  { formula: 'C4H10',    name: 'butane',               state: 'g', dhf:  -125.7   },
  { formula: 'C6H6',     name: 'benzene',              state: 'l', dhf:    49.0   },
  { formula: 'C8H18',    name: 'octane',               state: 'l', dhf:  -250.1   },

  // ── Oxygenated organics ────────────────────────────────────────────────────
  { formula: 'CH3OH',    name: 'methanol',             state: 'l', dhf:  -238.7   },
  { formula: 'C2H5OH',   name: 'ethanol',              state: 'l', dhf:  -277.7   },
  { formula: 'HCHO',     name: 'formaldehyde',         state: 'g', dhf:  -108.6   },
  { formula: 'CH3CHO',   name: 'acetaldehyde',         state: 'l', dhf:  -192.2   },
  { formula: 'HCOOH',    name: 'formic acid',          state: 'l', dhf:  -424.7   },
  { formula: 'CH3COOH',  name: 'acetic acid',          state: 'l', dhf:  -484.5   },
  { formula: 'C6H12O6',  name: 'glucose',              state: 's', dhf: -1274.5   },
  { formula: 'C12H22O11',name: 'sucrose',              state: 's', dhf: -2222.1   },
]

// ── Lookup helpers ────────────────────────────────────────────────────────────

export function lookupHf(formula: string, state: string): number | undefined {
  const entry = HF_DATA.find(
    e => e.formula.toLowerCase() === formula.toLowerCase() && e.state === state
  )
  return entry?.dhf
}

export function searchCompounds(query: string, limit = 8): CompoundEntry[] {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  return HF_DATA
    .filter(e =>
      e.formula.toLowerCase().includes(q) ||
      e.name.toLowerCase().includes(q)
    )
    .slice(0, limit)
}
