// ── Types ─────────────────────────────────────────────────────────────────────

export interface AufbauEntry {
  label: string
  n: number
  l: number
  orbitals: number
}

export interface SubshellFill extends AufbauEntry {
  electrons: number
  aufbauIdx: number
}

// ── Aufbau order ──────────────────────────────────────────────────────────────

export const AUFBAU: AufbauEntry[] = [
  { label: '1s', n: 1, l: 0, orbitals: 1 },
  { label: '2s', n: 2, l: 0, orbitals: 1 },
  { label: '2p', n: 2, l: 1, orbitals: 3 },
  { label: '3s', n: 3, l: 0, orbitals: 1 },
  { label: '3p', n: 3, l: 1, orbitals: 3 },
  { label: '4s', n: 4, l: 0, orbitals: 1 },
  { label: '3d', n: 3, l: 2, orbitals: 5 },
  { label: '4p', n: 4, l: 1, orbitals: 3 },
  { label: '5s', n: 5, l: 0, orbitals: 1 },
  { label: '4d', n: 4, l: 2, orbitals: 5 },
  { label: '5p', n: 5, l: 1, orbitals: 3 },
  { label: '6s', n: 6, l: 0, orbitals: 1 },
  { label: '4f', n: 4, l: 3, orbitals: 7 },
  { label: '5d', n: 5, l: 2, orbitals: 5 },
  { label: '6p', n: 6, l: 1, orbitals: 3 },
  { label: '7s', n: 7, l: 0, orbitals: 1 },
  { label: '5f', n: 5, l: 3, orbitals: 7 },
  { label: '6d', n: 6, l: 2, orbitals: 5 },
  { label: '7p', n: 7, l: 1, orbitals: 3 },
]

// ── Exceptions ────────────────────────────────────────────────────────────────

export const EXCEPTIONS: Record<number, { map: Partial<Record<number, number>>; note: string }> = {
  24: {
    map: { 0:2, 1:2, 2:6, 3:2, 4:6, 5:1, 6:5 },
    note: 'Half-filled 3d⁵ is more stable than 3d⁴. One electron moves from 4s → 3d.',
  },
  29: {
    map: { 0:2, 1:2, 2:6, 3:2, 4:6, 5:1, 6:10 },
    note: 'Fully-filled 3d¹⁰ is more stable than 3d⁹. One electron moves from 4s → 3d.',
  },
  42: {
    map: { 0:2, 1:2, 2:6, 3:2, 4:6, 5:2, 6:10, 7:6, 8:1, 9:5 },
    note: 'Half-filled 4d⁵ is more stable than 4d⁴. One electron moves from 5s → 4d.',
  },
  46: {
    map: { 0:2, 1:2, 2:6, 3:2, 4:6, 5:2, 6:10, 7:6, 8:0, 9:10 },
    note: 'Fully-filled 4d¹⁰ — both 5s electrons move into 4d. No s valence electrons.',
  },
  47: {
    map: { 0:2, 1:2, 2:6, 3:2, 4:6, 5:2, 6:10, 7:6, 8:1, 9:10 },
    note: 'Fully-filled 4d¹⁰ is more stable than 4d⁹. One electron moves from 5s → 4d.',
  },
  78: {
    map: { 0:2, 1:2, 2:6, 3:2, 4:6, 5:2, 6:10, 7:6, 8:2, 9:10, 10:6, 11:1, 12:14, 13:9 },
    note: 'Nearly-full 5d⁹ with 6s¹ — one electron promotes from 6s.',
  },
  79: {
    map: { 0:2, 1:2, 2:6, 3:2, 4:6, 5:2, 6:10, 7:6, 8:2, 9:10, 10:6, 11:1, 12:14, 13:10 },
    note: 'Fully-filled 5d¹⁰ is more stable than 5d⁹. One electron moves from 6s → 5d.',
  },
}

// ── Noble gases ───────────────────────────────────────────────────────────────

export const NOBLE_GASES = [
  { Z: 2,   symbol: 'He' },
  { Z: 10,  symbol: 'Ne' },
  { Z: 18,  symbol: 'Ar' },
  { Z: 36,  symbol: 'Kr' },
  { Z: 54,  symbol: 'Xe' },
  { Z: 86,  symbol: 'Rn' },
  { Z: 118, symbol: 'Og' },
]

// ── Element data ──────────────────────────────────────────────────────────────

export const ELEMENTS: Record<number, { symbol: string; name: string }> = {
  1:{symbol:'H',name:'Hydrogen'},2:{symbol:'He',name:'Helium'},3:{symbol:'Li',name:'Lithium'},
  4:{symbol:'Be',name:'Beryllium'},5:{symbol:'B',name:'Boron'},6:{symbol:'C',name:'Carbon'},
  7:{symbol:'N',name:'Nitrogen'},8:{symbol:'O',name:'Oxygen'},9:{symbol:'F',name:'Fluorine'},
  10:{symbol:'Ne',name:'Neon'},11:{symbol:'Na',name:'Sodium'},12:{symbol:'Mg',name:'Magnesium'},
  13:{symbol:'Al',name:'Aluminum'},14:{symbol:'Si',name:'Silicon'},15:{symbol:'P',name:'Phosphorus'},
  16:{symbol:'S',name:'Sulfur'},17:{symbol:'Cl',name:'Chlorine'},18:{symbol:'Ar',name:'Argon'},
  19:{symbol:'K',name:'Potassium'},20:{symbol:'Ca',name:'Calcium'},21:{symbol:'Sc',name:'Scandium'},
  22:{symbol:'Ti',name:'Titanium'},23:{symbol:'V',name:'Vanadium'},24:{symbol:'Cr',name:'Chromium'},
  25:{symbol:'Mn',name:'Manganese'},26:{symbol:'Fe',name:'Iron'},27:{symbol:'Co',name:'Cobalt'},
  28:{symbol:'Ni',name:'Nickel'},29:{symbol:'Cu',name:'Copper'},30:{symbol:'Zn',name:'Zinc'},
  31:{symbol:'Ga',name:'Gallium'},32:{symbol:'Ge',name:'Germanium'},33:{symbol:'As',name:'Arsenic'},
  34:{symbol:'Se',name:'Selenium'},35:{symbol:'Br',name:'Bromine'},36:{symbol:'Kr',name:'Krypton'},
  37:{symbol:'Rb',name:'Rubidium'},38:{symbol:'Sr',name:'Strontium'},39:{symbol:'Y',name:'Yttrium'},
  40:{symbol:'Zr',name:'Zirconium'},41:{symbol:'Nb',name:'Niobium'},42:{symbol:'Mo',name:'Molybdenum'},
  43:{symbol:'Tc',name:'Technetium'},44:{symbol:'Ru',name:'Ruthenium'},45:{symbol:'Rh',name:'Rhodium'},
  46:{symbol:'Pd',name:'Palladium'},47:{symbol:'Ag',name:'Silver'},48:{symbol:'Cd',name:'Cadmium'},
  49:{symbol:'In',name:'Indium'},50:{symbol:'Sn',name:'Tin'},51:{symbol:'Sb',name:'Antimony'},
  52:{symbol:'Te',name:'Tellurium'},53:{symbol:'I',name:'Iodine'},54:{symbol:'Xe',name:'Xenon'},
  55:{symbol:'Cs',name:'Cesium'},56:{symbol:'Ba',name:'Barium'},57:{symbol:'La',name:'Lanthanum'},
  58:{symbol:'Ce',name:'Cerium'},59:{symbol:'Pr',name:'Praseodymium'},60:{symbol:'Nd',name:'Neodymium'},
  61:{symbol:'Pm',name:'Promethium'},62:{symbol:'Sm',name:'Samarium'},63:{symbol:'Eu',name:'Europium'},
  64:{symbol:'Gd',name:'Gadolinium'},65:{symbol:'Tb',name:'Terbium'},66:{symbol:'Dy',name:'Dysprosium'},
  67:{symbol:'Ho',name:'Holmium'},68:{symbol:'Er',name:'Erbium'},69:{symbol:'Tm',name:'Thulium'},
  70:{symbol:'Yb',name:'Ytterbium'},71:{symbol:'Lu',name:'Lutetium'},72:{symbol:'Hf',name:'Hafnium'},
  73:{symbol:'Ta',name:'Tantalum'},74:{symbol:'W',name:'Tungsten'},75:{symbol:'Re',name:'Rhenium'},
  76:{symbol:'Os',name:'Osmium'},77:{symbol:'Ir',name:'Iridium'},78:{symbol:'Pt',name:'Platinum'},
  79:{symbol:'Au',name:'Gold'},80:{symbol:'Hg',name:'Mercury'},81:{symbol:'Tl',name:'Thallium'},
  82:{symbol:'Pb',name:'Lead'},83:{symbol:'Bi',name:'Bismuth'},84:{symbol:'Po',name:'Polonium'},
  85:{symbol:'At',name:'Astatine'},86:{symbol:'Rn',name:'Radon'},87:{symbol:'Fr',name:'Francium'},
  88:{symbol:'Ra',name:'Radium'},89:{symbol:'Ac',name:'Actinium'},90:{symbol:'Th',name:'Thorium'},
  91:{symbol:'Pa',name:'Protactinium'},92:{symbol:'U',name:'Uranium'},93:{symbol:'Np',name:'Neptunium'},
  94:{symbol:'Pu',name:'Plutonium'},95:{symbol:'Am',name:'Americium'},96:{symbol:'Cm',name:'Curium'},
  97:{symbol:'Bk',name:'Berkelium'},98:{symbol:'Cf',name:'Californium'},99:{symbol:'Es',name:'Einsteinium'},
  100:{symbol:'Fm',name:'Fermium'},101:{symbol:'Md',name:'Mendelevium'},102:{symbol:'No',name:'Nobelium'},
  103:{symbol:'Lr',name:'Lawrencium'},104:{symbol:'Rf',name:'Rutherfordium'},105:{symbol:'Db',name:'Dubnium'},
  106:{symbol:'Sg',name:'Seaborgium'},107:{symbol:'Bh',name:'Bohrium'},108:{symbol:'Hs',name:'Hassium'},
  109:{symbol:'Mt',name:'Meitnerium'},110:{symbol:'Ds',name:'Darmstadtium'},111:{symbol:'Rg',name:'Roentgenium'},
  112:{symbol:'Cn',name:'Copernicium'},113:{symbol:'Nh',name:'Nihonium'},114:{symbol:'Fl',name:'Flerovium'},
  115:{symbol:'Mc',name:'Moscovium'},116:{symbol:'Lv',name:'Livermorium'},117:{symbol:'Ts',name:'Tennessine'},
  118:{symbol:'Og',name:'Oganesson'},
}

export const SYMBOL_TO_Z: Record<string, number> = Object.fromEntries(
  Object.entries(ELEMENTS).map(([z, e]) => [e.symbol.toUpperCase(), Number(z)])
)

// ── Config helpers ────────────────────────────────────────────────────────────

export function computeConfig(Z: number, forceAufbau = false): SubshellFill[] {
  const exc = !forceAufbau ? EXCEPTIONS[Z] : undefined
  if (exc) {
    return AUFBAU
      .map((s, i) => ({ ...s, aufbauIdx: i, electrons: exc.map[i] ?? 0 }))
      .filter(s => s.electrons > 0)
  }
  const result: SubshellFill[] = []
  let rem = Z
  for (let i = 0; i < AUFBAU.length && rem > 0; i++) {
    const s = AUFBAU[i]
    const e = Math.min(rem, 2 * s.orbitals)
    rem -= e
    if (e > 0) result.push({ ...s, aufbauIdx: i, electrons: e })
  }
  return result
}

export function getNobleGasCore(Z: number): { symbol: string; coreZ: number } | null {
  let best: { symbol: string; coreZ: number } | null = null
  for (const ng of NOBLE_GASES) {
    if (ng.Z < Z) best = { symbol: ng.symbol, coreZ: ng.Z }
  }
  return best
}

export function getAbbrConfig(Z: number): { coreLabel: string | null; subshells: SubshellFill[] } {
  const full = computeConfig(Z)
  const core = getNobleGasCore(Z)
  if (!core) return { coreLabel: null, subshells: full }
  const coreLabels = new Set(computeConfig(core.coreZ, true).map(s => s.label))
  return { coreLabel: `[${core.symbol}]`, subshells: full.filter(s => !coreLabels.has(s.label)) }
}

// Per-orbital electron states applying Hund's rule
export function orbitalStates(electrons: number, orbitals: number): { up: boolean; down: boolean }[] {
  return Array.from({ length: orbitals }, (_, i) => ({
    up: i < Math.min(electrons, orbitals),
    down: electrons > orbitals && i < electrons - orbitals,
  }))
}

// Group subshells by principal quantum number n, sorted by l within each shell
export function groupByShell(subshells: SubshellFill[]): [number, SubshellFill[]][] {
  const map = new Map<number, SubshellFill[]>()
  for (const s of subshells) {
    const arr = map.get(s.n) ?? []
    arr.push(s)
    map.set(s.n, arr)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([n, subs]) => [n, subs.sort((a, b) => a.l - b.l)])
}

export function activeSubshellAt(k: number): string | null {
  const cfg = computeConfig(k, true)
  return cfg.length > 0 ? cfg[cfg.length - 1].label : null
}

export function valenceElectrons(subshells: SubshellFill[]): number {
  if (subshells.length === 0) return 0
  const maxN = Math.max(...subshells.map(s => s.n))
  return subshells.filter(s => s.n === maxN).reduce((sum, s) => sum + s.electrons, 0)
}

// ── Written config parser ─────────────────────────────────────────────────────

// Parses "1s2 2s2 2p6" or "[Ar] 4s2 3d6" into a label→electrons map
export function parseWrittenConfig(input: string): Map<string, number> | null {
  const result = new Map<string, number>()
  const text = input.trim()
  if (!text) return null

  let rest = text
  // Noble gas shorthand
  const ngMatch = rest.match(/^\[([A-Za-z]+)\]/)
  if (ngMatch) {
    const sym = ngMatch[1]
    const ng = NOBLE_GASES.find(n => n.symbol.toLowerCase() === sym.toLowerCase())
    if (!ng) return null
    for (const s of computeConfig(ng.Z, true)) result.set(s.label, s.electrons)
    rest = rest.slice(ngMatch[0].length)
  }

  // Match orbital tokens: e.g. "1s2", "3d10", "4f14"
  const tokens = [...rest.matchAll(/([1-7][spdf])(\d+)/gi)]
  if (tokens.length === 0 && result.size === 0) return null
  for (const m of tokens) {
    result.set(m[1].toLowerCase(), parseInt(m[2], 10))
  }
  return result
}

// Compare a parsed user config to the correct config
export interface ConfigCheckResult {
  correct: boolean
  wrongSubshells: { label: string; expected: number; got: number }[]
  missingSubshells: string[]
  extraSubshells: string[]
}

export function checkWrittenConfig(userMap: Map<string, number>, correct: SubshellFill[]): ConfigCheckResult {
  const correctMap = new Map(correct.map(s => [s.label, s.electrons]))
  const wrong: ConfigCheckResult['wrongSubshells'] = []
  const missing: string[] = []
  const extra: string[] = []

  for (const [label, expected] of correctMap) {
    const got = userMap.get(label) ?? 0
    if (got !== expected) {
      if (got === 0) missing.push(label)
      else wrong.push({ label, expected, got })
    }
  }
  for (const [label, got] of userMap) {
    if (!correctMap.has(label) && got > 0) extra.push(label)
  }

  return {
    correct: wrong.length === 0 && missing.length === 0 && extra.length === 0,
    wrongSubshells: wrong,
    missingSubshells: missing,
    extraSubshells: extra,
  }
}

// Check box diagram: box values are 0=empty, 1=↑, 2=↑↓
export interface BoxCheckResult {
  label: string
  electronCountCorrect: boolean
  hundCorrect: boolean
  expectedElectrons: number
  gotElectrons: number
}

export function checkBoxDiagram(
  boxes: Record<string, number[]>,   // label → per-orbital state (0|1|2)
  correct: SubshellFill[]
): BoxCheckResult[] {
  return correct.map(sub => {
    const userBoxes = boxes[sub.label] ?? Array(sub.orbitals).fill(0)
    const gotElectrons = userBoxes.reduce((s, v) => s + v, 0)
    const electronCountCorrect = gotElectrons === sub.electrons

    // Expected Hund distribution: multiset of 0/1/2 values
    const orbs = sub.orbitals
    const expected = Array.from({ length: orbs }, (_, i) => {
      if (sub.electrons <= orbs) return i < sub.electrons ? 1 : 0
      return i < sub.electrons - orbs ? 2 : 1
    })
    const userCounts  = [0, 0, 0] as [number, number, number]
    const expectCounts = [0, 0, 0] as [number, number, number]
    for (const v of userBoxes) userCounts[v as 0|1|2]++
    for (const v of expected)  expectCounts[v as 0|1|2]++
    const hundCorrect = userCounts.every((c, i) => c === expectCounts[i])

    return { label: sub.label, electronCountCorrect, hundCorrect, expectedElectrons: sub.electrons, gotElectrons }
  })
}
