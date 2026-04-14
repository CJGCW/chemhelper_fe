// ── Constants ─────────────────────────────────────────────────────────────────

export const R = 0.08206   // L·atm/(mol·K)

export const P_UNITS = ['atm', 'kPa', 'mmHg', 'torr'] as const
export type PUnit = typeof P_UNITS[number]
export type TUnit = 'K' | 'C'
export type GasVar = 'P' | 'V' | 'n' | 'T'

export const TO_ATM: Record<PUnit, number> = {
  atm: 1, kPa: 1 / 101.325, mmHg: 1 / 760, torr: 1 / 760,
}

export const R_TABLE = [
  { val: '0.08206', units: 'L·atm/(mol·K)',  use: 'atm'  },
  { val: '8.314',   units: 'L·kPa/(mol·K)',  use: 'kPa'  },
  { val: '62.36',   units: 'L·mmHg/(mol·K)', use: 'mmHg' },
  { val: '62.36',   units: 'L·torr/(mol·K)', use: 'torr' },
] as const

export const EXAMPLES = [
  { q: '2.00 mol at 300 K and 1.50 atm — find V.',
    eq: 'V = nRT / P',
    steps: ['V = (2.00 × 0.08206 × 300) / 1.50', 'V = 49.24 / 1.50'],
    ans: 'V = 32.8 L' },
  { q: '0.500 mol in 10.0 L at 298 K — find P.',
    eq: 'P = nRT / V',
    steps: ['P = (0.500 × 0.08206 × 298) / 10.0', 'P = 12.23 / 10.0'],
    ans: 'P = 1.22 atm' },
  { q: '1.50 atm, 5.00 L, 1.00 mol — find T.',
    eq: 'T = PV / nR',
    steps: ['T = (1.50 × 5.00) / (1.00 × 0.08206)', 'T = 7.50 / 0.08206'],
    ans: 'T = 91.4 K' },
  { q: '3.00 L at 1.50 atm and 350 K — find n.',
    eq: 'n = PV / RT',
    steps: ['n = (1.50 × 3.00) / (0.08206 × 350)', 'n = 4.50 / 28.72'],
    ans: 'n = 0.157 mol' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

export const sf   = (v: number, n = 4) => v.toPrecision(n)
export const sf3  = (v: number) => parseFloat(v.toPrecision(3))
export const toK  = (v: number, u: TUnit) => u === 'C' ? v + 273.15 : v
export const fromK = (v: number, u: TUnit) => u === 'C' ? v - 273.15 : v
export const toAtm  = (v: number, u: PUnit) => v * TO_ATM[u]
export const fromAtm = (v: number, u: PUnit) => v / TO_ATM[u]

// Practice types and generators are in idealGasPractice.ts
