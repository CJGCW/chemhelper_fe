// Standard reduction potentials at 25°C, 1 atm (E° in volts vs SHE)

export interface HalfReaction {
  id: string
  cathode: string   // display equation (reduction form)
  oxidized: string  // oxidized species label, e.g. "F₂"
  reduced: string   // reduced species label, e.g. "F⁻"
  e0: number        // E° in V
  n: number         // electrons transferred
}

export const HALF_REACTIONS: HalfReaction[] = [
  // Strongest oxidizing agents (most positive E°) at top
  { id:'F2',    cathode:'F₂(g) + 2e⁻ → 2F⁻(aq)',                          oxidized:'F₂',     reduced:'F⁻',    e0: 2.87,  n:2 },
  { id:'MnO4a', cathode:'MnO₄⁻(aq) + 8H⁺ + 5e⁻ → Mn²⁺(aq) + 4H₂O',      oxidized:'MnO₄⁻',  reduced:'Mn²⁺',  e0: 1.51,  n:5 },
  { id:'PbO2',  cathode:'PbO₂(s) + 4H⁺ + 2e⁻ → Pb²⁺(aq) + 2H₂O',         oxidized:'PbO₂',   reduced:'Pb²⁺',  e0: 1.455, n:2 },
  { id:'Cl2',   cathode:'Cl₂(g) + 2e⁻ → 2Cl⁻(aq)',                         oxidized:'Cl₂',    reduced:'Cl⁻',   e0: 1.36,  n:2 },
  { id:'Cr2O7', cathode:'Cr₂O₇²⁻(aq) + 14H⁺ + 6e⁻ → 2Cr³⁺(aq) + 7H₂O',  oxidized:'Cr₂O₇²⁻',reduced:'Cr³⁺', e0: 1.33,  n:6 },
  { id:'O2a',   cathode:'O₂(g) + 4H⁺ + 4e⁻ → 2H₂O',                       oxidized:'O₂',     reduced:'H₂O',   e0: 1.229, n:4 },
  { id:'Br2',   cathode:'Br₂(l) + 2e⁻ → 2Br⁻(aq)',                         oxidized:'Br₂',    reduced:'Br⁻',   e0: 1.07,  n:2 },
  { id:'Ag',    cathode:'Ag⁺(aq) + e⁻ → Ag(s)',                             oxidized:'Ag⁺',    reduced:'Ag',    e0: 0.80,  n:1 },
  { id:'Hg2',   cathode:'Hg₂²⁺(aq) + 2e⁻ → 2Hg(l)',                        oxidized:'Hg₂²⁺',  reduced:'Hg',    e0: 0.789, n:2 },
  { id:'Fe3',   cathode:'Fe³⁺(aq) + e⁻ → Fe²⁺(aq)',                         oxidized:'Fe³⁺',   reduced:'Fe²⁺',  e0: 0.771, n:1 },
  { id:'O2b',   cathode:'O₂(g) + 2H⁺ + 2e⁻ → H₂O₂(aq)',                   oxidized:'O₂',     reduced:'H₂O₂',  e0: 0.68,  n:2 },
  { id:'I2',    cathode:'I₂(s) + 2e⁻ → 2I⁻(aq)',                           oxidized:'I₂',     reduced:'I⁻',    e0: 0.536, n:2 },
  { id:'Cu2a',  cathode:'Cu²⁺(aq) + 2e⁻ → Cu(s)',                           oxidized:'Cu²⁺',   reduced:'Cu',    e0: 0.342, n:2 },
  { id:'BiO',   cathode:'BiO⁺(aq) + 2H⁺ + 3e⁻ → Bi(s) + H₂O',            oxidized:'BiO⁺',   reduced:'Bi',    e0: 0.320, n:3 },
  { id:'Cu1',   cathode:'Cu⁺(aq) + e⁻ → Cu(s)',                             oxidized:'Cu⁺',    reduced:'Cu',    e0: 0.521, n:1 },
  { id:'SO4',   cathode:'SO₄²⁻(aq) + 4H⁺ + 2e⁻ → H₂SO₃(aq) + H₂O',       oxidized:'SO₄²⁻',  reduced:'H₂SO₃',e0: 0.17,  n:2 },
  { id:'Sn4',   cathode:'Sn⁴⁺(aq) + 2e⁻ → Sn²⁺(aq)',                       oxidized:'Sn⁴⁺',   reduced:'Sn²⁺',  e0: 0.154, n:2 },
  { id:'SHE',   cathode:'2H⁺(aq) + 2e⁻ → H₂(g)',                           oxidized:'H⁺',     reduced:'H₂',    e0: 0.000, n:2 },
  { id:'Pb',    cathode:'Pb²⁺(aq) + 2e⁻ → Pb(s)',                           oxidized:'Pb²⁺',   reduced:'Pb',    e0:-0.126, n:2 },
  { id:'Sn2',   cathode:'Sn²⁺(aq) + 2e⁻ → Sn(s)',                           oxidized:'Sn²⁺',   reduced:'Sn',    e0:-0.138, n:2 },
  { id:'Ni',    cathode:'Ni²⁺(aq) + 2e⁻ → Ni(s)',                           oxidized:'Ni²⁺',   reduced:'Ni',    e0:-0.257, n:2 },
  { id:'Co',    cathode:'Co²⁺(aq) + 2e⁻ → Co(s)',                           oxidized:'Co²⁺',   reduced:'Co',    e0:-0.280, n:2 },
  { id:'Fe2',   cathode:'Fe²⁺(aq) + 2e⁻ → Fe(s)',                           oxidized:'Fe²⁺',   reduced:'Fe',    e0:-0.440, n:2 },
  { id:'Cr3',   cathode:'Cr³⁺(aq) + 3e⁻ → Cr(s)',                           oxidized:'Cr³⁺',   reduced:'Cr',    e0:-0.744, n:3 },
  { id:'Zn',    cathode:'Zn²⁺(aq) + 2e⁻ → Zn(s)',                           oxidized:'Zn²⁺',   reduced:'Zn',    e0:-0.762, n:2 },
  { id:'Mn',    cathode:'Mn²⁺(aq) + 2e⁻ → Mn(s)',                           oxidized:'Mn²⁺',   reduced:'Mn',    e0:-1.185, n:2 },
  { id:'Al',    cathode:'Al³⁺(aq) + 3e⁻ → Al(s)',                           oxidized:'Al³⁺',   reduced:'Al',    e0:-1.662, n:3 },
  { id:'Mg',    cathode:'Mg²⁺(aq) + 2e⁻ → Mg(s)',                           oxidized:'Mg²⁺',   reduced:'Mg',    e0:-2.372, n:2 },
  { id:'Na',    cathode:'Na⁺(aq) + e⁻ → Na(s)',                              oxidized:'Na⁺',    reduced:'Na',    e0:-2.714, n:1 },
  { id:'Ca',    cathode:'Ca²⁺(aq) + 2e⁻ → Ca(s)',                            oxidized:'Ca²⁺',   reduced:'Ca',    e0:-2.868, n:2 },
  { id:'K',     cathode:'K⁺(aq) + e⁻ → K(s)',                                oxidized:'K⁺',     reduced:'K',     e0:-2.931, n:1 },
  { id:'Li',    cathode:'Li⁺(aq) + e⁻ → Li(s)',                              oxidized:'Li⁺',    reduced:'Li',    e0:-3.040, n:1 },
  // Electrolysis-relevant additions
  { id:'H2O_cath', cathode:'2H₂O(l) + 2e⁻ → H₂(g) + 2OH⁻(aq)',           oxidized:'H₂O',    reduced:'H₂',    e0:-0.828, n:2 },
  { id:'H2O_ano',  cathode:'2H₂O(l) → O₂(g) + 4H⁺(aq) + 4e⁻ (E°=−1.23 V reverse)', oxidized:'H₂O', reduced:'O₂', e0:-1.229, n:4 },
]

// ── Electrolysis Reactions ────────────────────────────────────────────────────

export interface ElectrolysisReaction {
  id: string
  name: string
  cathodeReaction: string
  anodeReaction: string
  cathodeMetal: string
  molarMass: number
  n: number
  application: string
}

export const ELECTROLYSIS_REACTIONS: ElectrolysisReaction[] = [
  { id: 'cu-plating',        name: 'Copper Electroplating',    cathodeReaction: 'Cu²⁺ + 2e⁻ → Cu',       anodeReaction: 'Cu → Cu²⁺ + 2e⁻',          cathodeMetal: 'Cu', molarMass: 63.55,  n: 2, application: 'Copper plating, circuit boards'     },
  { id: 'ag-plating',        name: 'Silver Plating',           cathodeReaction: 'Ag⁺ + e⁻ → Ag',          anodeReaction: 'Ag → Ag⁺ + e⁻',             cathodeMetal: 'Ag', molarMass: 107.87, n: 1, application: 'Jewelry, silverware'               },
  { id: 'ni-plating',        name: 'Nickel Plating',           cathodeReaction: 'Ni²⁺ + 2e⁻ → Ni',        anodeReaction: '2H₂O → O₂ + 4H⁺ + 4e⁻',    cathodeMetal: 'Ni', molarMass: 58.69,  n: 2, application: 'Corrosion protection'              },
  { id: 'cr-plating',        name: 'Chrome Plating',           cathodeReaction: 'Cr³⁺ + 3e⁻ → Cr',        anodeReaction: '2H₂O → O₂ + 4H⁺ + 4e⁻',    cathodeMetal: 'Cr', molarMass: 52.00,  n: 3, application: 'Decorative, automotive'            },
  { id: 'water-electrolysis', name: 'Water Electrolysis',      cathodeReaction: '2H₂O + 2e⁻ → H₂ + 2OH⁻', anodeReaction: '2H₂O → O₂ + 4H⁺ + 4e⁻',   cathodeMetal: 'H',  molarMass: 2.016,  n: 2, application: 'Hydrogen production'              },
  { id: 'al-smelting',       name: 'Aluminum Smelting',        cathodeReaction: 'Al³⁺ + 3e⁻ → Al',        anodeReaction: '2O²⁻ → O₂ + 4e⁻',           cathodeMetal: 'Al', molarMass: 26.98,  n: 3, application: 'Hall-Héroult process'             },
  { id: 'au-plating',        name: 'Gold Plating',             cathodeReaction: 'Au³⁺ + 3e⁻ → Au',        anodeReaction: 'Au → Au³⁺ + 3e⁻',           cathodeMetal: 'Au', molarMass: 196.97, n: 3, application: 'Electronics, jewelry'             },
  { id: 'zn-plating',        name: 'Zinc Plating (Galvanizing)', cathodeReaction: 'Zn²⁺ + 2e⁻ → Zn',    anodeReaction: 'Zn → Zn²⁺ + 2e⁻',           cathodeMetal: 'Zn', molarMass: 65.38,  n: 2, application: 'Galvanizing steel, corrosion prevention' },
]
