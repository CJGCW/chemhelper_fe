// ── Types ─────────────────────────────────────────────────────────────────────

export type StoichProblemType =
  | 'mole_ratio'
  | 'mass_to_mass'
  | 'limiting_reagent'
  | 'theoretical_yield'
  | 'percent_yield'

export interface StoichProblem {
  type:         StoichProblemType
  equation:     string
  question:     string
  answer:       string   // stringified number OR formula text
  answerUnit:   string
  isTextAnswer: boolean
  steps:        string[]
  choices?:     { label: string; value: string }[]  // for multiple-choice problems
}

// ── Reaction data ─────────────────────────────────────────────────────────────

export interface Species {
  coeff:     number
  formula:   string   // plain, e.g. "CH4"
  display:   string   // Unicode subscripts, e.g. "CH₄"
  name:      string
  molarMass: number   // g/mol
}

export interface Reaction {
  name:      string
  reactants: Species[]
  products:  Species[]
  equation:  string
}

function side(arr: Species[]): string {
  return arr.map(s => (s.coeff > 1 ? s.coeff + ' ' : '') + s.display).join(' + ')
}
function makeEq(r: Omit<Reaction, 'equation'>): string {
  return `${side(r.reactants)} → ${side(r.products)}`
}

const RAW_REACTIONS: Omit<Reaction, 'equation'>[] = [
  {
    name: 'Combustion of methane',
    reactants: [
      { coeff: 1, formula: 'CH4',  display: 'CH₄',  name: 'methane',          molarMass: 16.043 },
      { coeff: 2, formula: 'O2',   display: 'O₂',   name: 'oxygen',           molarMass: 31.998 },
    ],
    products: [
      { coeff: 1, formula: 'CO2',  display: 'CO₂',  name: 'carbon dioxide',   molarMass: 44.009 },
      { coeff: 2, formula: 'H2O',  display: 'H₂O',  name: 'water',            molarMass: 18.015 },
    ],
  },
  {
    name: 'Synthesis of ammonia (Haber process)',
    reactants: [
      { coeff: 1, formula: 'N2',   display: 'N₂',   name: 'nitrogen',         molarMass: 28.014 },
      { coeff: 3, formula: 'H2',   display: 'H₂',   name: 'hydrogen',         molarMass:  2.016 },
    ],
    products: [
      { coeff: 2, formula: 'NH3',  display: 'NH₃',  name: 'ammonia',          molarMass: 17.031 },
    ],
  },
  {
    name: 'Decomposition of hydrogen peroxide',
    reactants: [
      { coeff: 2, formula: 'H2O2', display: 'H₂O₂', name: 'hydrogen peroxide', molarMass: 34.014 },
    ],
    products: [
      { coeff: 2, formula: 'H2O',  display: 'H₂O',  name: 'water',            molarMass: 18.015 },
      { coeff: 1, formula: 'O2',   display: 'O₂',   name: 'oxygen',           molarMass: 31.998 },
    ],
  },
  {
    name: 'Formation of aluminum chloride',
    reactants: [
      { coeff: 2, formula: 'Al',   display: 'Al',   name: 'aluminum',         molarMass: 26.982 },
      { coeff: 3, formula: 'Cl2',  display: 'Cl₂',  name: 'chlorine',         molarMass: 70.900 },
    ],
    products: [
      { coeff: 2, formula: 'AlCl3', display: 'AlCl₃', name: 'aluminum chloride', molarMass: 133.332 },
    ],
  },
  {
    name: 'Combustion of magnesium',
    reactants: [
      { coeff: 2, formula: 'Mg',   display: 'Mg',   name: 'magnesium',        molarMass: 24.305 },
      { coeff: 1, formula: 'O2',   display: 'O₂',   name: 'oxygen',           molarMass: 31.998 },
    ],
    products: [
      { coeff: 2, formula: 'MgO',  display: 'MgO',  name: 'magnesium oxide',  molarMass: 40.304 },
    ],
  },
  {
    name: 'Iron rusting (oxidation)',
    reactants: [
      { coeff: 4, formula: 'Fe',    display: 'Fe',    name: 'iron',            molarMass:  55.845 },
      { coeff: 3, formula: 'O2',    display: 'O₂',    name: 'oxygen',          molarMass:  31.998 },
    ],
    products: [
      { coeff: 2, formula: 'Fe2O3', display: 'Fe₂O₃', name: 'iron(III) oxide', molarMass: 159.687 },
    ],
  },
  {
    name: 'Neutralisation of hydrochloric acid',
    reactants: [
      { coeff: 1, formula: 'HCl',  display: 'HCl',  name: 'hydrochloric acid', molarMass: 36.458 },
      { coeff: 1, formula: 'NaOH', display: 'NaOH', name: 'sodium hydroxide',  molarMass: 39.997 },
    ],
    products: [
      { coeff: 1, formula: 'NaCl', display: 'NaCl', name: 'sodium chloride',   molarMass: 58.440 },
      { coeff: 1, formula: 'H2O',  display: 'H₂O',  name: 'water',             molarMass: 18.015 },
    ],
  },
  {
    name: 'Synthesis of water',
    reactants: [
      { coeff: 2, formula: 'H2',  display: 'H₂',  name: 'hydrogen', molarMass:  2.016 },
      { coeff: 1, formula: 'O2',  display: 'O₂',  name: 'oxygen',   molarMass: 31.998 },
    ],
    products: [
      { coeff: 2, formula: 'H2O', display: 'H₂O', name: 'water',    molarMass: 18.015 },
    ],
  },
  {
    name: 'Zinc reacting with sulfuric acid',
    reactants: [
      { coeff: 1, formula: 'Zn',   display: 'Zn',   name: 'zinc',             molarMass:  65.38 },
      { coeff: 1, formula: 'H2SO4', display: 'H₂SO₄', name: 'sulfuric acid',  molarMass:  98.072 },
    ],
    products: [
      { coeff: 1, formula: 'ZnSO4', display: 'ZnSO₄', name: 'zinc sulfate',   molarMass: 161.436 },
      { coeff: 1, formula: 'H2',    display: 'H₂',     name: 'hydrogen gas',  molarMass:   2.016 },
    ],
  },
  {
    name: 'Decomposition of calcium carbonate',
    reactants: [
      { coeff: 1, formula: 'CaCO3', display: 'CaCO₃', name: 'calcium carbonate', molarMass: 100.086 },
    ],
    products: [
      { coeff: 1, formula: 'CaO',  display: 'CaO',  name: 'calcium oxide',    molarMass: 56.077 },
      { coeff: 1, formula: 'CO2',  display: 'CO₂',  name: 'carbon dioxide',   molarMass: 44.009 },
    ],
  },
]

export const REACTIONS: Reaction[] = RAW_REACTIONS.map(r => ({ ...r, equation: makeEq(r) }))

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function rnd(lo: number, hi: number) { return Math.floor(Math.random() * (hi - lo + 1)) + lo }
function sig(n: number, sf = 3): string { return n.toPrecision(sf) }

const MASS_POOLS = [2, 5, 8, 10, 12, 15, 20, 25, 30, 40, 50, 75, 100]
const MOLE_POOLS = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]

function pickMass() { return pick(MASS_POOLS) }
function pickMoles() { return pick(MOLE_POOLS) }

// ── Chemical species registry ─────────────────────────────────────────────────

interface SpeciesBase { formula: string; display: string; name: string; molarMass: number }

const CHEM: Record<string, SpeciesBase> = {
  // Diatomic elements
  H2:    { formula:'H2',         display:'H₂',        name:'hydrogen',             molarMass:  2.016  },
  O2:    { formula:'O2',         display:'O₂',        name:'oxygen',               molarMass: 31.998  },
  N2:    { formula:'N2',         display:'N₂',        name:'nitrogen',             molarMass: 28.014  },
  Cl2:   { formula:'Cl2',        display:'Cl₂',       name:'chlorine',             molarMass: 70.900  },
  F2:    { formula:'F2',         display:'F₂',        name:'fluorine',             molarMass: 37.996  },
  // Metals
  Na:    { formula:'Na',         display:'Na',        name:'sodium',               molarMass: 22.990  },
  Mg:    { formula:'Mg',         display:'Mg',        name:'magnesium',            molarMass: 24.305  },
  Al:    { formula:'Al',         display:'Al',        name:'aluminum',             molarMass: 26.982  },
  Fe:    { formula:'Fe',         display:'Fe',        name:'iron',                 molarMass: 55.845  },
  Ca:    { formula:'Ca',         display:'Ca',        name:'calcium',              molarMass: 40.078  },
  Cu:    { formula:'Cu',         display:'Cu',        name:'copper',               molarMass: 63.546  },
  Zn:    { formula:'Zn',         display:'Zn',        name:'zinc',                 molarMass: 65.380  },
  K:     { formula:'K',          display:'K',         name:'potassium',            molarMass: 39.098  },
  Li:    { formula:'Li',         display:'Li',        name:'lithium',              molarMass:  6.941  },
  // Non-metals
  S:     { formula:'S',          display:'S',         name:'sulfur',               molarMass: 32.060  },
  C:     { formula:'C',          display:'C',         name:'carbon',               molarMass: 12.011  },
  // Simple molecules
  H2O:   { formula:'H2O',        display:'H₂O',       name:'water',                molarMass: 18.015  },
  CO2:   { formula:'CO2',        display:'CO₂',       name:'carbon dioxide',       molarMass: 44.009  },
  CO:    { formula:'CO',         display:'CO',        name:'carbon monoxide',      molarMass: 28.010  },
  SO2:   { formula:'SO2',        display:'SO₂',       name:'sulfur dioxide',       molarMass: 64.058  },
  SO3:   { formula:'SO3',        display:'SO₃',       name:'sulfur trioxide',      molarMass: 80.058  },
  NH3:   { formula:'NH3',        display:'NH₃',       name:'ammonia',              molarMass: 17.031  },
  HCl:   { formula:'HCl',        display:'HCl',       name:'hydrochloric acid',    molarMass: 36.458  },
  H2SO4: { formula:'H2SO4',      display:'H₂SO₄',     name:'sulfuric acid',        molarMass: 98.072  },
  HNO3:  { formula:'HNO3',       display:'HNO₃',      name:'nitric acid',          molarMass: 63.013  },
  H3PO4: { formula:'H3PO4',      display:'H₃PO₄',     name:'phosphoric acid',      molarMass: 97.994  },
  // Alkanes
  CH4:   { formula:'CH4',        display:'CH₄',       name:'methane',              molarMass: 16.043  },
  C2H6:  { formula:'C2H6',       display:'C₂H₆',      name:'ethane',               molarMass: 30.069  },
  C3H8:  { formula:'C3H8',       display:'C₃H₈',      name:'propane',              molarMass: 44.094  },
  C4H10: { formula:'C4H10',      display:'C₄H₁₀',     name:'butane',               molarMass: 58.120  },
  C5H12: { formula:'C5H12',      display:'C₅H₁₂',     name:'pentane',              molarMass: 72.146  },
  C6H14: { formula:'C6H14',      display:'C₆H₁₄',     name:'hexane',               molarMass: 86.171  },
  // Metal chlorides
  NaCl:  { formula:'NaCl',       display:'NaCl',      name:'sodium chloride',      molarMass: 58.440  },
  MgCl2: { formula:'MgCl2',      display:'MgCl₂',     name:'magnesium chloride',   molarMass: 95.211  },
  AlCl3: { formula:'AlCl3',      display:'AlCl₃',     name:'aluminum chloride',    molarMass:133.332  },
  FeCl3: { formula:'FeCl3',      display:'FeCl₃',     name:'iron(III) chloride',   molarMass:162.204  },
  CaCl2: { formula:'CaCl2',      display:'CaCl₂',     name:'calcium chloride',     molarMass:110.982  },
  KCl:   { formula:'KCl',        display:'KCl',       name:'potassium chloride',   molarMass: 74.551  },
  CuCl2: { formula:'CuCl2',      display:'CuCl₂',     name:'copper(II) chloride',  molarMass:134.451  },
  ZnCl2: { formula:'ZnCl2',      display:'ZnCl₂',     name:'zinc chloride',        molarMass:136.295  },
  LiCl:  { formula:'LiCl',       display:'LiCl',      name:'lithium chloride',     molarMass: 42.394  },
  FeCl2: { formula:'FeCl2',      display:'FeCl₂',     name:'iron(II) chloride',    molarMass:126.750  },
  // Metal fluorides
  NaF:   { formula:'NaF',        display:'NaF',       name:'sodium fluoride',      molarMass: 41.988  },
  MgF2:  { formula:'MgF2',       display:'MgF₂',      name:'magnesium fluoride',   molarMass: 62.301  },
  AlF3:  { formula:'AlF3',       display:'AlF₃',      name:'aluminum fluoride',    molarMass: 83.977  },
  CaF2:  { formula:'CaF2',       display:'CaF₂',      name:'calcium fluoride',     molarMass: 78.074  },
  KF:    { formula:'KF',         display:'KF',        name:'potassium fluoride',   molarMass: 58.097  },
  // Metal oxides
  Na2O:  { formula:'Na2O',       display:'Na₂O',      name:'sodium oxide',         molarMass: 61.979  },
  MgO:   { formula:'MgO',        display:'MgO',       name:'magnesium oxide',      molarMass: 40.304  },
  Al2O3: { formula:'Al2O3',      display:'Al₂O₃',     name:'aluminum oxide',       molarMass:101.960  },
  Fe2O3: { formula:'Fe2O3',      display:'Fe₂O₃',     name:'iron(III) oxide',      molarMass:159.687  },
  CaO:   { formula:'CaO',        display:'CaO',       name:'calcium oxide',        molarMass: 56.077  },
  K2O:   { formula:'K2O',        display:'K₂O',       name:'potassium oxide',      molarMass: 94.196  },
  CuO:   { formula:'CuO',        display:'CuO',       name:'copper(II) oxide',     molarMass: 79.545  },
  ZnO:   { formula:'ZnO',        display:'ZnO',       name:'zinc oxide',           molarMass: 81.380  },
  Li2O:  { formula:'Li2O',       display:'Li₂O',      name:'lithium oxide',        molarMass: 29.881  },
  // Bases
  NaOH:  { formula:'NaOH',       display:'NaOH',      name:'sodium hydroxide',     molarMass: 39.997  },
  KOH:   { formula:'KOH',        display:'KOH',       name:'potassium hydroxide',  molarMass: 56.105  },
  LiOH:  { formula:'LiOH',       display:'LiOH',      name:'lithium hydroxide',    molarMass: 23.948  },
  CaOH2: { formula:'Ca(OH)2',    display:'Ca(OH)₂',   name:'calcium hydroxide',    molarMass: 74.092  },
  MgOH2: { formula:'Mg(OH)2',    display:'Mg(OH)₂',   name:'magnesium hydroxide',  molarMass: 58.319  },
  AlOH3: { formula:'Al(OH)3',    display:'Al(OH)₃',   name:'aluminum hydroxide',   molarMass: 78.003  },
  // Neutralization salts
  Na2SO4:  { formula:'Na2SO4',   display:'Na₂SO₄',    name:'sodium sulfate',       molarMass:142.040  },
  K2SO4:   { formula:'K2SO4',    display:'K₂SO₄',     name:'potassium sulfate',    molarMass:174.259  },
  Li2SO4:  { formula:'Li2SO4',   display:'Li₂SO₄',    name:'lithium sulfate',      molarMass:109.940  },
  CaSO4:   { formula:'CaSO4',    display:'CaSO₄',     name:'calcium sulfate',      molarMass:136.141  },
  MgSO4:   { formula:'MgSO4',    display:'MgSO₄',     name:'magnesium sulfate',    molarMass:120.361  },
  NaNO3:   { formula:'NaNO3',    display:'NaNO₃',     name:'sodium nitrate',       molarMass: 84.993  },
  KNO3:    { formula:'KNO3',     display:'KNO₃',      name:'potassium nitrate',    molarMass:101.100  },
  LiNO3:   { formula:'LiNO3',    display:'LiNO₃',     name:'lithium nitrate',      molarMass: 68.946  },
  CaNO32:  { formula:'Ca(NO3)2', display:'Ca(NO₃)₂',  name:'calcium nitrate',      molarMass:164.086  },
  Na3PO4:  { formula:'Na3PO4',   display:'Na₃PO₄',    name:'sodium phosphate',     molarMass:163.941  },
  K3PO4:   { formula:'K3PO4',    display:'K₃PO₄',     name:'potassium phosphate',  molarMass:212.268  },
  AlPO4:   { formula:'AlPO4',    display:'AlPO₄',     name:'aluminum phosphate',   molarMass:121.952  },
  // Metal + acid salts
  ZnSO4:   { formula:'ZnSO4',    display:'ZnSO₄',     name:'zinc sulfate',         molarMass:161.436  },
  FeSO4:   { formula:'FeSO4',    display:'FeSO₄',     name:'iron(II) sulfate',     molarMass:151.901  },
  Al2SO43: { formula:'Al2(SO4)3',display:'Al₂(SO₄)₃', name:'aluminum sulfate',     molarMass:342.150  },
  // Decomposition substrates
  H2O2:    { formula:'H2O2',     display:'H₂O₂',      name:'hydrogen peroxide',    molarMass: 34.014  },
  CaCO3:   { formula:'CaCO3',    display:'CaCO₃',     name:'calcium carbonate',    molarMass:100.086  },
  MgCO3:   { formula:'MgCO3',    display:'MgCO₃',     name:'magnesium carbonate',  molarMass: 84.313  },
  KClO3:   { formula:'KClO3',    display:'KClO₃',     name:'potassium chlorate',   molarMass:122.548  },
  HgO:     { formula:'HgO',      display:'HgO',       name:'mercury(II) oxide',    molarMass:216.589  },
  Hg:      { formula:'Hg',       display:'Hg',        name:'mercury',              molarMass:200.590  },
  NH4Cl:   { formula:'NH4Cl',    display:'NH₄Cl',     name:'ammonium chloride',    molarMass: 53.491  },
  NaHCO3:  { formula:'NaHCO3',   display:'NaHCO₃',    name:'sodium bicarbonate',   molarMass: 84.007  },
  Na2CO3:  { formula:'Na2CO3',   display:'Na₂CO₃',    name:'sodium carbonate',     molarMass:105.988  },
  CuOH2:   { formula:'Cu(OH)2',  display:'Cu(OH)₂',   name:'copper(II) hydroxide', molarMass: 97.561  },
  FeOH3:   { formula:'Fe(OH)3',  display:'Fe(OH)₃',   name:'iron(III) hydroxide',  molarMass:106.867  },
}

function sp(key: string, coeff: number): Species {
  return { ...CHEM[key], coeff }
}

function buildRxn(name: string, reactants: Species[], products: Species[]): Reaction {
  const r = { name, reactants, products }
  return { ...r, equation: makeEq(r) }
}

// ── Reaction template generators ──────────────────────────────────────────────

// Template 1: Combustion of alkane CₙH₂ₙ₊₂
const ALKANE_COMBUSTION = [
  { key:'CH4',   cf:1, cO:2,  cC:1,  cW:2  },
  { key:'C2H6',  cf:2, cO:7,  cC:4,  cW:6  },
  { key:'C3H8',  cf:1, cO:5,  cC:3,  cW:4  },
  { key:'C4H10', cf:2, cO:13, cC:8,  cW:10 },
  { key:'C5H12', cf:1, cO:8,  cC:5,  cW:6  },
  { key:'C6H14', cf:2, cO:19, cC:12, cW:14 },
]
function genCombustionAlkane(): Reaction {
  const a = pick(ALKANE_COMBUSTION)
  return buildRxn(
    `Combustion of ${CHEM[a.key].name}`,
    [sp(a.key, a.cf), sp('O2', a.cO)],
    [sp('CO2', a.cC),  sp('H2O', a.cW)],
  )
}

// Template 2: Metal + halogen → metal halide
interface MHData { m: string; x: string; p: string; cM: number; cX: number; cP: number }
const METAL_HALIDE_DATA: MHData[] = [
  { m:'Na', x:'Cl2', p:'NaCl',  cM:2, cX:1, cP:2 },
  { m:'Mg', x:'Cl2', p:'MgCl2', cM:1, cX:1, cP:1 },
  { m:'Al', x:'Cl2', p:'AlCl3', cM:2, cX:3, cP:2 },
  { m:'Fe', x:'Cl2', p:'FeCl3', cM:2, cX:3, cP:2 },
  { m:'Ca', x:'Cl2', p:'CaCl2', cM:1, cX:1, cP:1 },
  { m:'K',  x:'Cl2', p:'KCl',   cM:2, cX:1, cP:2 },
  { m:'Cu', x:'Cl2', p:'CuCl2', cM:1, cX:1, cP:1 },
  { m:'Zn', x:'Cl2', p:'ZnCl2', cM:1, cX:1, cP:1 },
  { m:'Li', x:'Cl2', p:'LiCl',  cM:2, cX:1, cP:2 },
  { m:'Na', x:'F2',  p:'NaF',   cM:2, cX:1, cP:2 },
  { m:'Mg', x:'F2',  p:'MgF2',  cM:1, cX:1, cP:1 },
  { m:'Al', x:'F2',  p:'AlF3',  cM:2, cX:3, cP:2 },
  { m:'Ca', x:'F2',  p:'CaF2',  cM:1, cX:1, cP:1 },
  { m:'K',  x:'F2',  p:'KF',    cM:2, cX:1, cP:2 },
]
function genMetalHalide(): Reaction {
  const d = pick(METAL_HALIDE_DATA)
  const halName = CHEM[d.p].name
  return buildRxn(
    `Formation of ${halName}`,
    [sp(d.m, d.cM), sp(d.x, d.cX)],
    [sp(d.p, d.cP)],
  )
}

// Template 3: Metal + O₂ → metal oxide
interface MOData { m: string; p: string; cM: number; cO: number; cP: number }
const METAL_OXIDE_DATA: MOData[] = [
  { m:'Na', p:'Na2O',  cM:4, cO:1, cP:2 },
  { m:'Mg', p:'MgO',   cM:2, cO:1, cP:2 },
  { m:'Al', p:'Al2O3', cM:4, cO:3, cP:2 },
  { m:'Fe', p:'Fe2O3', cM:4, cO:3, cP:2 },
  { m:'Ca', p:'CaO',   cM:2, cO:1, cP:2 },
  { m:'K',  p:'K2O',   cM:4, cO:1, cP:2 },
  { m:'Cu', p:'CuO',   cM:2, cO:1, cP:2 },
  { m:'Zn', p:'ZnO',   cM:2, cO:1, cP:2 },
  { m:'Li', p:'Li2O',  cM:4, cO:1, cP:2 },
]
function genMetalOxide(): Reaction {
  const d = pick(METAL_OXIDE_DATA)
  return buildRxn(
    `Oxidation of ${CHEM[d.m].name}`,
    [sp(d.m, d.cM), sp('O2', d.cO)],
    [sp(d.p, d.cP)],
  )
}

// Template 4: Acid + base → salt + water (neutralization)
interface NeutData { a: string; b: string; s: string; cA: number; cB: number; cS: number; cW: number }
const NEUT_DATA: NeutData[] = [
  { a:'HCl',   b:'NaOH',  s:'NaCl',   cA:1, cB:1, cS:1, cW:1 },
  { a:'HCl',   b:'KOH',   s:'KCl',    cA:1, cB:1, cS:1, cW:1 },
  { a:'HCl',   b:'LiOH',  s:'LiCl',   cA:1, cB:1, cS:1, cW:1 },
  { a:'HCl',   b:'CaOH2', s:'CaCl2',  cA:2, cB:1, cS:1, cW:2 },
  { a:'HCl',   b:'MgOH2', s:'MgCl2',  cA:2, cB:1, cS:1, cW:2 },
  { a:'HCl',   b:'AlOH3', s:'AlCl3',  cA:3, cB:1, cS:1, cW:3 },
  { a:'H2SO4', b:'NaOH',  s:'Na2SO4', cA:1, cB:2, cS:1, cW:2 },
  { a:'H2SO4', b:'KOH',   s:'K2SO4',  cA:1, cB:2, cS:1, cW:2 },
  { a:'H2SO4', b:'LiOH',  s:'Li2SO4', cA:1, cB:2, cS:1, cW:2 },
  { a:'H2SO4', b:'CaOH2', s:'CaSO4',  cA:1, cB:1, cS:1, cW:2 },
  { a:'H2SO4', b:'MgOH2', s:'MgSO4',  cA:1, cB:1, cS:1, cW:2 },
  { a:'HNO3',  b:'NaOH',  s:'NaNO3',  cA:1, cB:1, cS:1, cW:1 },
  { a:'HNO3',  b:'KOH',   s:'KNO3',   cA:1, cB:1, cS:1, cW:1 },
  { a:'HNO3',  b:'LiOH',  s:'LiNO3',  cA:1, cB:1, cS:1, cW:1 },
  { a:'HNO3',  b:'CaOH2', s:'CaNO32', cA:2, cB:1, cS:1, cW:2 },
  { a:'H3PO4', b:'NaOH',  s:'Na3PO4', cA:1, cB:3, cS:1, cW:3 },
  { a:'H3PO4', b:'KOH',   s:'K3PO4',  cA:1, cB:3, cS:1, cW:3 },
  { a:'H3PO4', b:'AlOH3', s:'AlPO4',  cA:1, cB:1, cS:1, cW:3 },
]
function genNeutralization(): Reaction {
  const d = pick(NEUT_DATA)
  return buildRxn(
    `${CHEM[d.a].name} + ${CHEM[d.b].name}`,
    [sp(d.a, d.cA), sp(d.b, d.cB)],
    [sp(d.s, d.cS), sp('H2O', d.cW)],
  )
}

// Template 5: Metal + acid → salt + H₂
interface MAData { m: string; a: string; s: string; cM: number; cA: number; cS: number; cH: number }
const METAL_ACID_DATA: MAData[] = [
  { m:'Mg', a:'HCl',   s:'MgCl2',   cM:1, cA:2, cS:1, cH:1 },
  { m:'Fe', a:'HCl',   s:'FeCl2',   cM:1, cA:2, cS:1, cH:1 },
  { m:'Zn', a:'HCl',   s:'ZnCl2',   cM:1, cA:2, cS:1, cH:1 },
  { m:'Ca', a:'HCl',   s:'CaCl2',   cM:1, cA:2, cS:1, cH:1 },
  { m:'Al', a:'HCl',   s:'AlCl3',   cM:2, cA:6, cS:2, cH:3 },
  { m:'Li', a:'HCl',   s:'LiCl',    cM:2, cA:2, cS:2, cH:1 },
  { m:'Mg', a:'H2SO4', s:'MgSO4',   cM:1, cA:1, cS:1, cH:1 },
  { m:'Zn', a:'H2SO4', s:'ZnSO4',   cM:1, cA:1, cS:1, cH:1 },
  { m:'Fe', a:'H2SO4', s:'FeSO4',   cM:1, cA:1, cS:1, cH:1 },
  { m:'Ca', a:'H2SO4', s:'CaSO4',   cM:1, cA:1, cS:1, cH:1 },
  { m:'Al', a:'H2SO4', s:'Al2SO43', cM:2, cA:3, cS:1, cH:3 },
]
function genMetalAcid(): Reaction {
  const d = pick(METAL_ACID_DATA)
  return buildRxn(
    `${CHEM[d.m].name} reacts with ${CHEM[d.a].name}`,
    [sp(d.m, d.cM), sp(d.a, d.cA)],
    [sp(d.s, d.cS), sp('H2', d.cH)],
  )
}

// Template 6: Decomposition (1 reactant → 2–3 products)
const DECOMP_REACTIONS: Reaction[] = [
  buildRxn('Decomposition of hydrogen peroxide',  [sp('H2O2',2)],   [sp('H2O',2),  sp('O2',1)]),
  buildRxn('Decomposition of calcium carbonate',  [sp('CaCO3',1)],  [sp('CaO',1),  sp('CO2',1)]),
  buildRxn('Decomposition of magnesium carbonate',[sp('MgCO3',1)],  [sp('MgO',1),  sp('CO2',1)]),
  buildRxn('Decomposition of potassium chlorate', [sp('KClO3',2)],  [sp('KCl',2),  sp('O2',3)]),
  buildRxn('Decomposition of mercury(II) oxide',  [sp('HgO',2)],    [sp('Hg',2),   sp('O2',1)]),
  buildRxn('Electrolysis of water',               [sp('H2O',2)],    [sp('H2',2),   sp('O2',1)]),
  buildRxn('Decomposition of ammonium chloride',  [sp('NH4Cl',1)],  [sp('NH3',1),  sp('HCl',1)]),
  buildRxn('Decomposition of sodium bicarbonate', [sp('NaHCO3',2)], [sp('Na2CO3',1), sp('H2O',1), sp('CO2',1)]),
  buildRxn('Decomposition of copper(II) hydroxide',[sp('CuOH2',1)], [sp('CuO',1),  sp('H2O',1)]),
  buildRxn('Decomposition of iron(III) hydroxide',[sp('FeOH3',2)],  [sp('Fe2O3',1),sp('H2O',3)]),
]
function genDecomposition(): Reaction { return pick(DECOMP_REACTIONS) }

// Additional 2-reactant reactions not covered by templates above
const EXTRA_REACTIONS: Reaction[] = [
  buildRxn('Synthesis of ammonia',       [sp('N2',1), sp('H2',3)],   [sp('NH3',2)]),
  buildRxn('Synthesis of HCl',           [sp('H2',1), sp('Cl2',1)],  [sp('HCl',2)]),
  buildRxn('Synthesis of water',         [sp('H2',2), sp('O2',1)],   [sp('H2O',2)]),
  buildRxn('Carbon combustion',          [sp('C',1),  sp('O2',1)],   [sp('CO2',1)]),
  buildRxn('Incomplete carbon combustion',[sp('C',2), sp('O2',1)],   [sp('CO',2)]),
  buildRxn('Sulfur combustion',          [sp('S',1),  sp('O2',1)],   [sp('SO2',1)]),
  buildRxn('CO oxidation',               [sp('CO',2), sp('O2',1)],   [sp('CO2',2)]),
  buildRxn('SO₂ oxidation',              [sp('SO2',2),sp('O2',1)],   [sp('SO3',2)]),
]

// 2-reactant only — used by practice problem generators
function generateCombinationReaction(): Reaction {
  const factories = [
    genCombustionAlkane,
    genMetalHalide,
    genMetalOxide,
    genNeutralization,
    genMetalAcid,
    () => pick(EXTRA_REACTIONS),
  ]
  return pick(factories)()
}

// All reaction types including decomposition — used by the solver
export function generateReaction(): Reaction {
  const factories = [
    genCombustionAlkane,
    genMetalHalide,
    genMetalOxide,
    genNeutralization,
    genMetalAcid,
    () => pick(EXTRA_REACTIONS),
    genDecomposition,
  ]
  return pick(factories)()
}

// ── Normalise answer formula for checking ─────────────────────────────────────

function normalizeFormula(s: string): string {
  return s
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, c => '0123456789'['₀₁₂₃₄₅₆₇₈₉'.indexOf(c)])
    .replace(/\s+/g, '')
    .toLowerCase()
}

// ── Problem generators ────────────────────────────────────────────────────────

function allSpecies(r: Reaction): Species[] { return [...r.reactants, ...r.products] }

function pickTwo(arr: Species[]): [Species, Species] {
  const a = pick(arr)
  const rest = arr.filter(s => s !== a)
  return [a, pick(rest)]
}

// 1. Mole ratio ────────────────────────────────────────────────────────────────
function genMoleRatio(): StoichProblem {
  const rxn = generateReaction()
  const [from, to] = pickTwo(allSpecies(rxn))
  const givenMol = pickMoles()
  const answerMol = sig(givenMol * (to.coeff / from.coeff))
  const givenMolStr = sig(givenMol)
  const toAction   = rxn.products.includes(to)   ? 'produced' : 'consumed'
  const fromAction = rxn.products.includes(from) ? 'is produced' : 'reacts'

  return {
    type: 'mole_ratio', equation: rxn.equation,
    question: `Reaction: ${rxn.equation}\n` +
      `How many moles of ${to.display} are ${toAction} when ${givenMolStr} mol of ${from.display} ${fromAction}?`,
    answer: answerMol, answerUnit: 'mol', isTextAnswer: false,
    steps: [
      `Balanced equation: ${rxn.equation}`,
      `Mole ratio: ${from.coeff} mol ${from.display} : ${to.coeff} mol ${to.display}`,
      `mol ${to.display} = ${givenMolStr} mol ${from.display} × (${to.coeff} / ${from.coeff})`,
      `= ${answerMol} mol ${to.display}`,
    ],
  }
}

// 2. Mass-to-mass ─────────────────────────────────────────────────────────────
function genMassToMass(): StoichProblem {
  const rxn = generateReaction()
  // from = a reactant, to = a product (most educational direction)
  const from = pick(rxn.reactants)
  const to   = pick(rxn.products)
  const givenMass = pickMass()

  const molFrom  = givenMass / from.molarMass
  const molTo    = molFrom * (to.coeff / from.coeff)
  const massTo   = molTo * to.molarMass
  const answerMass = sig(massTo)
  const givenMassStr = sig(givenMass)

  return {
    type: 'mass_to_mass', equation: rxn.equation,
    question: `Reaction: ${rxn.equation}\n` +
      `Calculate the mass of ${to.display} produced when ${givenMassStr} g of ${from.display} reacts completely (excess of other reagents).`,
    answer: answerMass, answerUnit: 'g', isTextAnswer: false,
    steps: [
      `Balanced equation: ${rxn.equation}`,
      `Step 1 — g ${from.display} → mol ${from.display}:  ${givenMassStr} g ÷ ${from.molarMass} g/mol = ${sig(molFrom)} mol`,
      `Step 2 — mol ${from.display} → mol ${to.display}:  ${sig(molFrom)} mol × (${to.coeff}/${from.coeff}) = ${sig(molTo)} mol`,
      `Step 3 — mol ${to.display} → g ${to.display}:  ${sig(molTo)} mol × ${to.molarMass} g/mol = ${answerMass} g`,
    ],
  }
}

// 3. Limiting reagent ─────────────────────────────────────────────────────────
function genLimitingReagent(): StoichProblem {
  const rxn = generateCombinationReaction()
  const [rA, rB] = rxn.reactants

  // Pick mass of A, derive mass of B that makes B limiting (then scale to nice numbers)
  const massA = pickMass()
  const molA  = massA / rA.molarMass
  // Stoichiometric amount of B for this A
  const stoichMolB = molA * (rB.coeff / rA.coeff)
  // Make B slightly less than stoichiometric (50–85%) so B is limiting
  const actualMolB = stoichMolB * (rnd(50, 85) / 100)
  const massBStr = sig(actualMolB * rB.molarMass)
  const massB = parseFloat(massBStr)
  const massAStr = sig(massA)

  // Confirm limiting reagent
  const reqBForA = (massA / rA.molarMass) * (rB.coeff / rA.coeff) * rB.molarMass
  const isBlimiting = massB < reqBForA

  const limiting = isBlimiting ? rB : rA
  const excess   = isBlimiting ? rA : rB

  return {
    type: 'limiting_reagent', equation: rxn.equation,
    question: `Reaction: ${rxn.equation}\n` +
      `${massAStr} g of ${rA.display} is mixed with ${massBStr} g of ${rB.display}.\n` +
      `Which is the limiting reagent?`,
    answer: limiting.formula, answerUnit: '', isTextAnswer: true,
    choices: [
      { label: rA.display, value: rA.formula },
      { label: rB.display, value: rB.formula },
    ],
    steps: [
      `Balanced equation: ${rxn.equation}`,
      `mol ${rA.display} = ${massAStr} g ÷ ${rA.molarMass} g/mol = ${sig(massA / rA.molarMass)} mol`,
      `mol ${rB.display} = ${massBStr} g ÷ ${rB.molarMass} g/mol = ${sig(massB / rB.molarMass)} mol`,
      `${rB.coeff} mol ${rB.display} needed per ${rA.coeff} mol ${rA.display}`,
      `${rA.display} would need ${sig(molA * (rB.coeff / rA.coeff))} mol ${rB.display}; only ${sig(massB / rB.molarMass)} mol available`,
      `→ ${limiting.display} is the limiting reagent (${excess.display} is in excess)`,
    ],
  }
}

// 4. Theoretical yield ────────────────────────────────────────────────────────
function genTheoreticalYield(): StoichProblem {
  const rxn = generateCombinationReaction()
  const [rA, rB] = rxn.reactants
  const product = pick(rxn.products)

  const massA = pickMass()
  const massBStr = sig(
    (massA / rA.molarMass) * (rB.coeff / rA.coeff) * rB.molarMass * (rnd(50, 85) / 100)
  )
  const massB = parseFloat(massBStr)
  const massAStr = sig(massA)

  const molA  = massA / rA.molarMass
  const molB  = massB / rB.molarMass
  // Find limiting reagent
  const limitedByA = molA * (product.coeff / rA.coeff) * product.molarMass
  const limitedByB = molB * (product.coeff / rB.coeff) * product.molarMass
  const isAlimiting = limitedByA <= limitedByB
  const limiting = isAlimiting ? rA : rB
  const limitingMass = isAlimiting ? massA : massB
  const limitingMol = limitingMass / limiting.molarMass
  const yieldMol  = limitingMol * (product.coeff / limiting.coeff)
  const yieldMass = sig(yieldMol * product.molarMass)

  return {
    type: 'theoretical_yield', equation: rxn.equation,
    question: `Reaction: ${rxn.equation}\n` +
      `${massAStr} g of ${rA.display} reacts with ${massBStr} g of ${rB.display}.\n` +
      `What is the theoretical yield of ${product.display} in grams?`,
    answer: yieldMass, answerUnit: 'g', isTextAnswer: false,
    steps: [
      `Balanced equation: ${rxn.equation}`,
      `mol ${rA.display} = ${massAStr} g ÷ ${rA.molarMass} g/mol = ${sig(molA)} mol`,
      `mol ${rB.display} = ${massBStr} g ÷ ${rB.molarMass} g/mol = ${sig(molB)} mol`,
      `Limiting reagent: ${limiting.display}`,
      `mol ${product.display} = ${sig(limitingMol)} mol ${limiting.display} × (${product.coeff}/${limiting.coeff}) = ${sig(yieldMol)} mol`,
      `Theoretical yield = ${sig(yieldMol)} mol × ${product.molarMass} g/mol = ${yieldMass} g`,
    ],
  }
}

// 5. Percent yield ─────────────────────────────────────────────────────────────
function genPercentYield(): StoichProblem {
  const rxn = generateReaction()
  const from = pick(rxn.reactants)
  const to   = pick(rxn.products)
  const givenMass = pickMass()

  const theoreticalStr = sig(
    (givenMass / from.molarMass) * (to.coeff / from.coeff) * to.molarMass
  )
  const theoretical = parseFloat(theoreticalStr)
  const pct = rnd(58, 95)
  const actualStr = sig(theoretical * pct / 100)
  const actual = parseFloat(actualStr)
  const givenMassStr = sig(givenMass)

  return {
    type: 'percent_yield', equation: rxn.equation,
    question: `Reaction: ${rxn.equation}\n` +
      `Starting from ${givenMassStr} g of ${from.display}, the theoretical yield of ${to.display} is ${theoreticalStr} g.\n` +
      `If ${actualStr} g of ${to.display} was actually collected, what is the percent yield?`,
    answer: sig(pct, 3), answerUnit: '%', isTextAnswer: false,
    steps: [
      `Percent yield = (actual yield / theoretical yield) × 100`,
      `= (${actualStr} g / ${theoreticalStr} g) × 100`,
      `= ${sig(actual / theoretical * 100, 3)} %`,
    ],
  }
}

// ── Public entry ──────────────────────────────────────────────────────────────

const TYPE_POOL: StoichProblemType[] = [
  'mole_ratio', 'mole_ratio',
  'mass_to_mass', 'mass_to_mass',
  'limiting_reagent',
  'theoretical_yield',
  'percent_yield',
]

export function generateStoichProblem(type?: StoichProblemType): StoichProblem {
  const t = type ?? pick(TYPE_POOL)
  if (t === 'mole_ratio')       return genMoleRatio()
  if (t === 'mass_to_mass')     return genMassToMass()
  if (t === 'limiting_reagent') return genLimitingReagent()
  if (t === 'theoretical_yield') return genTheoreticalYield()
  return genPercentYield()
}

export function checkStoichAnswer(input: string, problem: StoichProblem): boolean {
  if (!input.trim()) return false
  if (problem.isTextAnswer) {
    return normalizeFormula(input.trim()) === normalizeFormula(problem.answer)
  }
  const val = parseFloat(input)
  const ans = parseFloat(problem.answer)
  if (isNaN(val) || isNaN(ans)) return false
  if (ans === 0) return Math.abs(val) < 0.001
  return Math.abs((val - ans) / ans) <= 0.01
}
