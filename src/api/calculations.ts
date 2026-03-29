import client from './client'

export interface CalcResult {
  value: string
  unit: string
  sig_figs?: number
  steps?: string[]
}

export interface ColligativeResult {
  delta: string
  new_point: string
  unit: string
  steps?: string[]
}

export interface CompoundInfo {
  cid: number
  molecular_formula: string
  molecular_weight: string
  iupac_name: string
}

export interface CompoundElement {
  symbol: string
  name: string
  moles: string
}

// ---------- Compound resolution ----------

export async function resolveSmiles(smiles: string): Promise<CompoundInfo> {
  const { data } = await client.post<CompoundInfo>('/compound/resolve', { smiles })
  return data
}

export async function resolveFormula(formula: string): Promise<CompoundElement[]> {
  const { data } = await client.post<CompoundElement[]>('/elements/compound', { formula })
  return data
}

// ---------- Solution ----------

export async function findMolarity(
  moles: string,
  volume: { value: string; prefix: string },
): Promise<CalcResult> {
  const { data } = await client.post<CalcResult>('/solution/molarity', {
    moles,
    volume,
  })
  return data
}

export async function findMolarityFromMass(
  mass: { value: string; unit: string; prefix: string },
  compound: { smiles?: string; molar_mass?: string },
  volume: { value: string; prefix: string },
): Promise<CalcResult> {
  const { data } = await client.post<CalcResult>('/solution/molarity-from-mass', {
    mass,
    compound,
    volume,
  })
  return data
}

export async function findMolesFromMolarity(
  molarity: string,
  volume: { value: string; prefix: string },
): Promise<CalcResult> {
  const { data } = await client.post<CalcResult>('/solution/moles-from-molarity', {
    molarity,
    volume,
  })
  return data
}

export async function findMolality(
  moles: string,
  solventMass: { value: string; unit: string; prefix: string },
): Promise<CalcResult> {
  const { data } = await client.post<CalcResult>('/solution/molality', {
    moles,
    solvent_mass: solventMass,
  })
  return data
}

// ---------- Thermo ----------

export async function findBPE(
  solvent: string,
  molality: string,
  vantHoffFactor?: string,
): Promise<ColligativeResult> {
  const { data } = await client.post<ColligativeResult>('/thermo/bpe', {
    solvent,
    molality,
    vant_hoff_factor: vantHoffFactor,
  })
  return data
}

export async function findFPD(
  solvent: string,
  molality: string,
  vantHoffFactor?: string,
): Promise<ColligativeResult> {
  const { data } = await client.post<ColligativeResult>('/thermo/fpd', {
    solvent,
    molality,
    vant_hoff_factor: vantHoffFactor,
  })
  return data
}
