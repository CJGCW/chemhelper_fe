// Mirrors the Go ElementResponse DTO
export interface Element {
  atomicNumber: number
  symbol: string
  name: string
  atomicWeight: string
  electronegativity: number
  vanDerWaalsRadiusPm: number
  group: number
  period: number
  groupName: string
}

// Which visual color category an element belongs to
export type ColorCategory =
  | 'hydrogen'
  | 'alkali'
  | 'alkaline'
  | 'transition'
  | 'post-transition'
  | 'metalloid'
  | 'carbon'
  | 'pnictogen'
  | 'chalcogen'
  | 'halogen'
  | 'noble'
  | 'lanthanide'
  | 'actinide'
  | 'unknown'

export interface CalcResult {
  value: string
  unit: string
  sig_figs?: number
  steps?: string[]
}

export interface CompoundInfo {
  cid: number
  molecular_formula: string
  molecular_weight: string
  iupac_name: string
}
