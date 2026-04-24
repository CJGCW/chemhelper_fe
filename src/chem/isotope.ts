// Reverse isotope abundance solver
// Given average atomic mass and two isotope masses, finds natural abundances

export interface IsotopeReverseInput {
  averageMass:   number
  isotopeMasses: [number, number]   // exact atomic masses of each isotope
}

export interface IsotopeReverseSolution {
  abundance1: number   // fraction for isotope 1 (0 to 1)
  abundance2: number   // = 1 − abundance1
  steps:      string[]
}

function sig(n: number, sf = 4): string {
  if (n === 0) return '0'
  return parseFloat(n.toPrecision(sf)).toString()
}

export function reverseIsotopeAbundance(input: IsotopeReverseInput): IsotopeReverseSolution {
  const { averageMass, isotopeMasses } = input
  const [m1, m2] = isotopeMasses

  const mMin = Math.min(m1, m2)
  const mMax = Math.max(m1, m2)
  if (averageMass < mMin || averageMass > mMax) {
    throw new RangeError(
      `Average mass ${averageMass} is outside the isotope range [${mMin}, ${mMax}]. ` +
      'Check your inputs — the average must lie between the two isotope masses.'
    )
  }

  if (m1 === m2) throw new Error('Isotope masses must be different.')

  // m_avg = a × m1 + (1 − a) × m2  →  a = (m_avg − m2) / (m1 − m2)
  const abundance1 = (averageMass - m2) / (m1 - m2)
  const abundance2 = 1 - abundance1

  if (abundance1 < 0 || abundance1 > 1) {
    throw new RangeError('Computed abundance is outside [0, 1] — check inputs.')
  }

  const steps = [
    `Let a = abundance of isotope 1 (mass = ${sig(m1)} amu)`,
    `Then (1 − a) = abundance of isotope 2 (mass = ${sig(m2)} amu)`,
    `Average mass equation: ${sig(averageMass)} = a × ${sig(m1)} + (1 − a) × ${sig(m2)}`,
    `${sig(averageMass)} = a × ${sig(m1)} + ${sig(m2)} − a × ${sig(m2)}`,
    `${sig(averageMass)} − ${sig(m2)} = a × (${sig(m1)} − ${sig(m2)})`,
    `a = (${sig(averageMass)} − ${sig(m2)}) / (${sig(m1)} − ${sig(m2)})`,
    `a = ${sig(averageMass - m2)} / ${sig(m1 - m2)} = ${sig(abundance1)}`,
    `Abundance of isotope 1 = ${sig(abundance1 * 100, 4)}%`,
    `Abundance of isotope 2 = ${sig(abundance2 * 100, 4)}%`,
    `Check: ${sig(abundance1)} × ${sig(m1)} + ${sig(abundance2)} × ${sig(m2)} = ${sig(abundance1 * m1 + abundance2 * m2)} amu ✓`,
  ]

  return { abundance1, abundance2, steps }
}
