export type Unit = 'g' | 'mol'

export interface Amount {
  value: number
  unit: Unit
}

export function toMoles(amount: Amount, molarMass: number): number {
  if (molarMass <= 0) throw new Error('molarMass must be positive')
  return amount.unit === 'mol' ? amount.value : amount.value / molarMass
}

export function toGrams(amount: Amount, molarMass: number): number {
  if (molarMass <= 0) throw new Error('molarMass must be positive')
  return amount.unit === 'g' ? amount.value : amount.value * molarMass
}
