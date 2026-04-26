import { limitingReagent } from '../chem/stoich'

export interface DiagramReactionType {
  equation: string
  coeffA: number
  coeffB: number
  coeffProduct: number
  productLabel: string
}

export const REACTION_TYPES: DiagramReactionType[] = [
  { equation: '2 A + B → A₂B',  coeffA: 2, coeffB: 1, coeffProduct: 1, productLabel: 'A₂B' },
  { equation: 'A + 2 B → AB₂',  coeffA: 1, coeffB: 2, coeffProduct: 1, productLabel: 'AB₂' },
  { equation: 'A + B → AB',     coeffA: 1, coeffB: 1, coeffProduct: 1, productLabel: 'AB'  },
  { equation: '3 A + B → A₃B',  coeffA: 3, coeffB: 1, coeffProduct: 1, productLabel: 'A₃B' },
  { equation: 'A + 3 B → AB₃',  coeffA: 1, coeffB: 3, coeffProduct: 1, productLabel: 'AB₃' },
]

export interface MolecularDiagramProblem {
  equation: string
  reactantA: { label: string; count: number }
  reactantB: { label: string; count: number }
  coeffs: { A: number; B: number; product: number }
  productLabel: string
  limiting: 'A' | 'B'
  productCount: number
  excessA: number
  excessB: number
  /** Seed passed to ParticleBox for stable layout across re-renders */
  layoutSeed: number
}

export function generateMolecularDiagramProblem(): MolecularDiagramProblem {
  const layoutSeed = Math.floor(Math.random() * 0xFFFFFF) + 1

  for (let attempt = 0; attempt < 200; attempt++) {
    const rxnType = REACTION_TYPES[Math.floor(Math.random() * REACTION_TYPES.length)]

    // timesRxn: how many complete reactions run (2..4 keeps particle counts manageable)
    const timesRxn  = 2 + Math.floor(Math.random() * 3)
    // excessOther: extra molecules of the non-limiting reactant (1..3)
    const excessOther = 1 + Math.floor(Math.random() * 3)
    // which reactant is limiting
    const whichLimiting: 'A' | 'B' = Math.random() < 0.5 ? 'A' : 'B'

    // Build "nice" counts: the limiting reactant is exactly consumed (no leftover)
    const countA = whichLimiting === 'A'
      ? timesRxn * rxnType.coeffA
      : timesRxn * rxnType.coeffA + excessOther
    const countB = whichLimiting === 'B'
      ? timesRxn * rxnType.coeffB
      : timesRxn * rxnType.coeffB + excessOther

    // Enforce spec cap of 12 per reactant
    if (countA > 12 || countB > 12 || countA < 2 || countB < 2) continue

    // Use the chem/ primitive for limiting-reagent determination (source of truth)
    const nums = limitingReagent(
      [
        { coeff: rxnType.coeffA,      molarMass: 1, amount: { value: countA, unit: 'mol' } },
        { coeff: rxnType.coeffB,      molarMass: 1, amount: { value: countB, unit: 'mol' } },
      ],
      [{ coeff: rxnType.coeffProduct, molarMass: 1 }],
    )

    return {
      equation: rxnType.equation,
      reactantA: { label: 'A', count: countA },
      reactantB: { label: 'B', count: countB },
      coeffs: { A: rxnType.coeffA, B: rxnType.coeffB, product: rxnType.coeffProduct },
      productLabel: rxnType.productLabel,
      limiting:     nums.limitingIdx === 0 ? 'A' : 'B',
      productCount: timesRxn * rxnType.coeffProduct,
      excessA:      whichLimiting === 'A' ? 0 : excessOther,
      excessB:      whichLimiting === 'B' ? 0 : excessOther,
      layoutSeed,
    }
  }

  // Guaranteed fallback: 2A+B→A₂B, A=6, B=4 (3 reactions, 1 excess B)
  return {
    equation: '2 A + B → A₂B',
    reactantA: { label: 'A', count: 6 },
    reactantB: { label: 'B', count: 4 },
    coeffs: { A: 2, B: 1, product: 1 },
    productLabel: 'A₂B',
    limiting: 'A',
    productCount: 3,
    excessA: 0,
    excessB: 1,
    layoutSeed,
  }
}
