// Thermodynamic data from Chang's Chemistry, 14th edition, Appendix 2.
// ΔHf° and ΔGf° in kJ/mol; S° in J/(mol·K).
// Elements in standard state have ΔHf = ΔGf = 0 by definition.

export interface ThermoEntry {
  formula: string
  name: string
  state: 'g' | 'l' | 's' | 'aq'
  deltaHf: number   // kJ/mol
  deltaGf: number   // kJ/mol
  S: number         // J/(mol·K)
}

export const THERMO_TABLE: ThermoEntry[] = [
  // ── Elements in standard state (ΔHf = ΔGf = 0) ────────────────────────────
  { formula: 'H₂',    name: 'Hydrogen gas',      state: 'g', deltaHf: 0,       deltaGf: 0,       S: 130.7 },
  { formula: 'O₂',    name: 'Oxygen gas',         state: 'g', deltaHf: 0,       deltaGf: 0,       S: 205.0 },
  { formula: 'N₂',    name: 'Nitrogen gas',       state: 'g', deltaHf: 0,       deltaGf: 0,       S: 191.5 },
  { formula: 'C',     name: 'Carbon (graphite)',   state: 's', deltaHf: 0,       deltaGf: 0,       S: 5.74  },
  { formula: 'C',     name: 'Carbon (diamond)',    state: 's', deltaHf: 1.90,    deltaGf: 2.87,    S: 2.44  },
  { formula: 'Fe',    name: 'Iron',                state: 's', deltaHf: 0,       deltaGf: 0,       S: 27.3  },
  { formula: 'Cu',    name: 'Copper',              state: 's', deltaHf: 0,       deltaGf: 0,       S: 33.2  },
  { formula: 'Ag',    name: 'Silver',              state: 's', deltaHf: 0,       deltaGf: 0,       S: 42.6  },
  { formula: 'Hg',    name: 'Mercury',             state: 'l', deltaHf: 0,       deltaGf: 0,       S: 77.4  },
  { formula: 'S',     name: 'Sulfur (rhombic)',    state: 's', deltaHf: 0,       deltaGf: 0,       S: 31.8  },
  { formula: 'Br₂',   name: 'Bromine',             state: 'l', deltaHf: 0,       deltaGf: 0,       S: 152.2 },
  { formula: 'Cl₂',   name: 'Chlorine gas',        state: 'g', deltaHf: 0,       deltaGf: 0,       S: 223.0 },
  { formula: 'I₂',    name: 'Iodine',              state: 's', deltaHf: 0,       deltaGf: 0,       S: 116.7 },
  { formula: 'Na',    name: 'Sodium',              state: 's', deltaHf: 0,       deltaGf: 0,       S: 51.4  },
  { formula: 'K',     name: 'Potassium',           state: 's', deltaHf: 0,       deltaGf: 0,       S: 64.7  },
  { formula: 'Mg',    name: 'Magnesium',           state: 's', deltaHf: 0,       deltaGf: 0,       S: 32.5  },
  { formula: 'Al',    name: 'Aluminum',            state: 's', deltaHf: 0,       deltaGf: 0,       S: 28.3  },
  { formula: 'Zn',    name: 'Zinc',                state: 's', deltaHf: 0,       deltaGf: 0,       S: 41.6  },
  { formula: 'Ca',    name: 'Calcium',             state: 's', deltaHf: 0,       deltaGf: 0,       S: 41.4  },
  // ── Compounds ─────────────────────────────────────────────────────────────
  { formula: 'H₂O',   name: 'Water',               state: 'l', deltaHf: -285.8,  deltaGf: -237.1,  S: 69.9  },
  { formula: 'H₂O',   name: 'Water vapor',         state: 'g', deltaHf: -241.8,  deltaGf: -228.6,  S: 188.7 },
  { formula: 'CO₂',   name: 'Carbon dioxide',      state: 'g', deltaHf: -393.5,  deltaGf: -394.4,  S: 213.6 },
  { formula: 'CO',    name: 'Carbon monoxide',      state: 'g', deltaHf: -110.5,  deltaGf: -137.2,  S: 197.6 },
  { formula: 'NH₃',   name: 'Ammonia',             state: 'g', deltaHf: -46.1,   deltaGf: -16.4,   S: 192.3 },
  { formula: 'NO',    name: 'Nitric oxide',         state: 'g', deltaHf: 90.3,    deltaGf: 86.6,    S: 210.7 },
  { formula: 'NO₂',   name: 'Nitrogen dioxide',    state: 'g', deltaHf: 33.2,    deltaGf: 51.3,    S: 240.0 },
  { formula: 'N₂O',   name: 'Nitrous oxide',       state: 'g', deltaHf: 81.6,    deltaGf: 103.7,   S: 220.0 },
  { formula: 'N₂O₄',  name: 'Dinitrogen tetroxide',state: 'g', deltaHf: 9.16,    deltaGf: 97.8,    S: 304.2 },
  { formula: 'SO₂',   name: 'Sulfur dioxide',      state: 'g', deltaHf: -296.8,  deltaGf: -300.1,  S: 248.1 },
  { formula: 'SO₃',   name: 'Sulfur trioxide',     state: 'g', deltaHf: -395.7,  deltaGf: -371.1,  S: 256.6 },
  { formula: 'HCl',   name: 'Hydrogen chloride',   state: 'g', deltaHf: -92.3,   deltaGf: -95.3,   S: 186.8 },
  { formula: 'HF',    name: 'Hydrogen fluoride',   state: 'g', deltaHf: -271.6,  deltaGf: -272.8,  S: 173.5 },
  { formula: 'HBr',   name: 'Hydrogen bromide',    state: 'g', deltaHf: -36.2,   deltaGf: -53.2,   S: 198.5 },
  { formula: 'HI',    name: 'Hydrogen iodide',     state: 'g', deltaHf: 25.9,    deltaGf: 1.3,     S: 206.3 },
  { formula: 'CH₄',   name: 'Methane',             state: 'g', deltaHf: -74.8,   deltaGf: -50.7,   S: 186.2 },
  { formula: 'C₂H₄',  name: 'Ethylene',            state: 'g', deltaHf: 52.3,    deltaGf: 68.1,    S: 219.4 },
  { formula: 'C₂H₆',  name: 'Ethane',              state: 'g', deltaHf: -84.7,   deltaGf: -32.9,   S: 229.5 },
  { formula: 'C₃H₈',  name: 'Propane',             state: 'g', deltaHf: -103.8,  deltaGf: -23.5,   S: 269.9 },
  { formula: 'C₆H₆',  name: 'Benzene',             state: 'l', deltaHf: 49.0,    deltaGf: 124.5,   S: 172.8 },
  { formula: 'CH₃OH', name: 'Methanol',             state: 'l', deltaHf: -238.7,  deltaGf: -166.3,  S: 126.8 },
  { formula: 'C₂H₅OH',name: 'Ethanol',             state: 'l', deltaHf: -277.7,  deltaGf: -174.8,  S: 160.7 },
  { formula: 'Fe₂O₃', name: 'Iron(III) oxide',     state: 's', deltaHf: -824.2,  deltaGf: -742.2,  S: 87.4  },
  { formula: 'Fe₃O₄', name: 'Iron(II,III) oxide',  state: 's', deltaHf: -1118.4, deltaGf: -1015.4, S: 146.4 },
  { formula: 'CaO',   name: 'Calcium oxide',        state: 's', deltaHf: -635.1,  deltaGf: -604.0,  S: 39.8  },
  { formula: 'CaCO₃', name: 'Calcium carbonate',   state: 's', deltaHf: -1206.9, deltaGf: -1128.8, S: 92.9  },
  { formula: 'NaCl',  name: 'Sodium chloride',      state: 's', deltaHf: -411.2,  deltaGf: -384.1,  S: 72.1  },
  { formula: 'NaOH',  name: 'Sodium hydroxide',     state: 's', deltaHf: -426.7,  deltaGf: -379.5,  S: 64.4  },
  { formula: 'KCl',   name: 'Potassium chloride',   state: 's', deltaHf: -436.5,  deltaGf: -408.5,  S: 82.6  },
  { formula: 'MgO',   name: 'Magnesium oxide',      state: 's', deltaHf: -601.2,  deltaGf: -569.6,  S: 26.9  },
  { formula: 'Al₂O₃', name: 'Aluminum oxide',       state: 's', deltaHf: -1669.8, deltaGf: -1576.5, S: 51.0  },
  { formula: 'ZnO',   name: 'Zinc oxide',           state: 's', deltaHf: -350.5,  deltaGf: -320.5,  S: 43.7  },
  { formula: 'SiO₂',  name: 'Silicon dioxide',      state: 's', deltaHf: -910.9,  deltaGf: -856.5,  S: 41.8  },
  { formula: 'PbO',   name: 'Lead(II) oxide',       state: 's', deltaHf: -217.3,  deltaGf: -187.9,  S: 68.7  },
  { formula: 'HNO₃',  name: 'Nitric acid',          state: 'l', deltaHf: -174.1,  deltaGf: -80.8,   S: 155.6 },
  { formula: 'H₂SO₄', name: 'Sulfuric acid',        state: 'l', deltaHf: -814.0,  deltaGf: -690.0,  S: 156.9 },
  { formula: 'P₄O₁₀', name: 'Tetraphosphorus decoxide', state: 's', deltaHf: -3012.0, deltaGf: -2723.9, S: 228.9 },
  { formula: 'PCl₃',  name: 'Phosphorus trichloride',state: 'g', deltaHf: -306.4,  deltaGf: -286.3,  S: 311.7 },
  { formula: 'PCl₅',  name: 'Phosphorus pentachloride',state: 'g',deltaHf: -398.9, deltaGf: -324.6,  S: 352.7 },
]
