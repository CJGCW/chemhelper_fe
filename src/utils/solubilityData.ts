// Shared solubility data used by SolubilityReference and ReactionPredictor

export type Sol = 'S' | 'I' | 'SS'

export interface CationDef { id: string; formula: string; base: string; name: string; charge: number }
export interface AnionDef  { id: string; formula: string; base: string; name: string; charge: number; poly: boolean }

export const CATIONS: CationDef[] = [
  { id:'Li',  formula:'Li⁺',   base:'Li',  name:'Lithium',     charge:1 },
  { id:'Na',  formula:'Na⁺',   base:'Na',  name:'Sodium',      charge:1 },
  { id:'K',   formula:'K⁺',    base:'K',   name:'Potassium',   charge:1 },
  { id:'NH4', formula:'NH₄⁺',  base:'NH₄', name:'Ammonium',    charge:1 },
  { id:'Mg',  formula:'Mg²⁺',  base:'Mg',  name:'Magnesium',   charge:2 },
  { id:'Ca',  formula:'Ca²⁺',  base:'Ca',  name:'Calcium',     charge:2 },
  { id:'Sr',  formula:'Sr²⁺',  base:'Sr',  name:'Strontium',   charge:2 },
  { id:'Ba',  formula:'Ba²⁺',  base:'Ba',  name:'Barium',      charge:2 },
  { id:'Ag',  formula:'Ag⁺',   base:'Ag',  name:'Silver',      charge:1 },
  { id:'Fe2', formula:'Fe²⁺',  base:'Fe',  name:'Iron(II)',    charge:2 },
  { id:'Fe3', formula:'Fe³⁺',  base:'Fe',  name:'Iron(III)',   charge:3 },
  { id:'Cu',  formula:'Cu²⁺',  base:'Cu',  name:'Copper(II)', charge:2 },
  { id:'Zn',  formula:'Zn²⁺',  base:'Zn',  name:'Zinc',       charge:2 },
  { id:'Mn',  formula:'Mn²⁺',  base:'Mn',  name:'Manganese',  charge:2 },
  { id:'Pb',  formula:'Pb²⁺',  base:'Pb',  name:'Lead(II)',   charge:2 },
  { id:'Hg2', formula:'Hg₂²⁺', base:'Hg₂', name:'Mercury(I)', charge:2 },
  { id:'Al',  formula:'Al³⁺',  base:'Al',  name:'Aluminum',   charge:3 },
]

export const ANIONS: AnionDef[] = [
  { id:'NO3',  formula:'NO₃⁻',    base:'NO₃',    name:'Nitrate',     charge:-1, poly:true  },
  { id:'OAc',  formula:'C₂H₃O₂⁻', base:'C₂H₃O₂', name:'Acetate',     charge:-1, poly:true  },
  { id:'ClO4', formula:'ClO₄⁻',   base:'ClO₄',   name:'Perchlorate', charge:-1, poly:true  },
  { id:'Cl',   formula:'Cl⁻',     base:'Cl',     name:'Chloride',    charge:-1, poly:false },
  { id:'Br',   formula:'Br⁻',     base:'Br',     name:'Bromide',     charge:-1, poly:false },
  { id:'I',    formula:'I⁻',      base:'I',      name:'Iodide',      charge:-1, poly:false },
  { id:'SO4',  formula:'SO₄²⁻',   base:'SO₄',    name:'Sulfate',     charge:-2, poly:true  },
  { id:'OH',   formula:'OH⁻',     base:'OH',     name:'Hydroxide',   charge:-1, poly:true  },
  { id:'CO3',  formula:'CO₃²⁻',   base:'CO₃',    name:'Carbonate',   charge:-2, poly:true  },
  { id:'PO4',  formula:'PO₄³⁻',   base:'PO₄',    name:'Phosphate',   charge:-3, poly:true  },
  { id:'S2',   formula:'S²⁻',     base:'S',      name:'Sulfide',     charge:-2, poly:false },
  { id:'SO3',  formula:'SO₃²⁻',   base:'SO₃',    name:'Sulfite',     charge:-2, poly:true  },
  { id:'CrO4', formula:'CrO₄²⁻',  base:'CrO₄',   name:'Chromate',    charge:-2, poly:true  },
]

const G1_NH4 = new Set(['Li','Na','K','Rb','Cs','NH4'])
const G2     = new Set(['Mg','Ca','Sr','Ba'])

export interface LookupResult { sol: Sol; rule: string }

export function solLookup(cId: string, aId: string): LookupResult {
  if (G1_NH4.has(cId))
    return { sol:'S',  rule:'All Group I and ammonium salts are soluble' }
  if (aId === 'NO3')
    return { sol:'S',  rule:'All nitrates (NO₃⁻) are soluble' }
  if (aId === 'OAc')
    return { sol:'S',  rule:'All acetates (C₂H₃O₂⁻) are soluble' }
  if (aId === 'ClO4')
    return { sol:'S',  rule:'All perchlorates (ClO₄⁻) are soluble' }

  if (aId === 'Cl' || aId === 'Br' || aId === 'I') {
    if (cId === 'Ag' || cId === 'Pb' || cId === 'Hg2')
      return { sol:'I',  rule:'Cl⁻, Br⁻, and I⁻ salts are insoluble with Ag⁺, Pb²⁺, and Hg₂²⁺' }
    return { sol:'S',  rule:'Most chlorides, bromides, and iodides are soluble' }
  }

  if (aId === 'SO4') {
    if (cId === 'Ba' || cId === 'Pb' || cId === 'Hg2')
      return { sol:'I',  rule:'Sulfates of Ba²⁺, Pb²⁺, and Hg₂²⁺ are insoluble' }
    if (cId === 'Ca' || cId === 'Sr' || cId === 'Ag')
      return { sol:'SS', rule:'Sulfates of Ca²⁺, Sr²⁺, and Ag⁺ are slightly soluble' }
    return { sol:'S',  rule:'Most sulfates are soluble' }
  }

  if (aId === 'OH') {
    if (cId === 'Ba')
      return { sol:'S',  rule:'Ba(OH)₂ is soluble' }
    if (cId === 'Sr' || cId === 'Ca')
      return { sol:'SS', rule:'Ca(OH)₂ and Sr(OH)₂ are slightly soluble' }
    return { sol:'I',  rule:'Most hydroxides are insoluble — exceptions: Group I, Ba²⁺; slightly Ca²⁺/Sr²⁺' }
  }

  if (aId === 'CO3')
    return { sol:'I',  rule:'Most carbonates are insoluble — exceptions: Group I and NH₄⁺' }
  if (aId === 'PO4')
    return { sol:'I',  rule:'Most phosphates are insoluble — exceptions: Group I and NH₄⁺' }

  if (aId === 'S2') {
    if (G2.has(cId)) return { sol:'SS', rule:'Group II sulfides are slightly soluble' }
    return { sol:'I',  rule:'Most sulfides are insoluble — exceptions: Group I; Group II slightly' }
  }

  if (aId === 'SO3')
    return { sol:'I',  rule:'Most sulfites are insoluble — exceptions: Group I and NH₄⁺' }

  if (aId === 'CrO4') {
    if (cId === 'Ag' || cId === 'Ba' || cId === 'Pb' || cId === 'Hg2')
      return { sol:'I',  rule:'Chromates of Ag⁺, Ba²⁺, Pb²⁺, Hg₂²⁺ are insoluble' }
    if (cId === 'Ca')
      return { sol:'SS', rule:'CaCrO₄ is slightly soluble' }
    return { sol:'S',  rule:'Most chromates are soluble' }
  }

  return { sol:'S', rule:'No specific rule — generally assumed soluble' }
}

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b) }
const SUB: Record<number,string> = { 1:'', 2:'₂', 3:'₃', 4:'₄', 6:'₆' }
const sub = (n: number) => SUB[n] ?? String(n)

export function buildFormula(cat: CationDef, ani: AnionDef): string {
  const c = cat.charge, a = Math.abs(ani.charge)
  const d = gcd(c, a)
  const nc = a / d, na = c / d
  const cPart = `${cat.base}${sub(nc)}`
  const aPart = na === 1 ? ani.base : ani.poly ? `(${ani.base})${sub(na)}` : `${ani.base}${sub(na)}`
  return cPart + aPart
}

export const SOL_LABEL: Record<Sol,string> = { S:'Soluble', I:'Insoluble', SS:'Slightly Soluble' }
export const SOL_COLOR: Record<Sol,string> = { S:'var(--c-halogen)', I:'#e05050', SS:'#f5c518' }
export const SOL_BG:    Record<Sol,string> = {
  S:  'color-mix(in srgb, var(--c-halogen) 13%, #141620)',
  I:  'color-mix(in srgb, #e05050 13%, #141620)',
  SS: 'color-mix(in srgb, #f5c518 10%, #141620)',
}
