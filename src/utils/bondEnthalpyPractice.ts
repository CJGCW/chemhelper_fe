// ── Types ─────────────────────────────────────────────────────────────────────

export interface BondCount {
  bond:   string   // e.g. "C-H"
  count:  number
  energy: number   // kJ/mol per bond (average)
}

export interface BondEnthalpyProblem {
  description:   string
  reaction:      string      // balanced equation
  broken:        BondCount[] // bonds in reactants that break
  formed:        BondCount[] // bonds in products that form
  answer:        number      // kJ (approximate)
  answerUnit:    'kJ'
  solutionSteps: string[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return (n >= 0 ? '+' : '') + n.toFixed(0)
}

function buildSteps(broken: BondCount[], formed: BondCount[], answer: number): string[] {
  const brokenTotal = broken.reduce((s, b) => s + b.count * b.energy, 0)
  const formedTotal = formed.reduce((s, b) => s + b.count * b.energy, 0)
  const steps: string[] = []
  steps.push('Bonds broken (energy absorbed):')
  for (const b of broken) {
    steps.push(`  ${b.count} × ${b.bond} = ${b.count} × ${b.energy} = +${(b.count * b.energy).toFixed(0)} kJ`)
  }
  steps.push(`  Σ(broken) = +${brokenTotal.toFixed(0)} kJ`)
  steps.push('Bonds formed (energy released):')
  for (const b of formed) {
    steps.push(`  ${b.count} × ${b.bond} = ${b.count} × ${b.energy} = −${(b.count * b.energy).toFixed(0)} kJ`)
  }
  steps.push(`  Σ(formed) = −${formedTotal.toFixed(0)} kJ`)
  steps.push(`ΔH ≈ Σ(broken) − Σ(formed) = ${brokenTotal.toFixed(0)} − ${formedTotal.toFixed(0)} = ${fmt(answer)} kJ`)
  return steps
}

// ── Problem database ──────────────────────────────────────────────────────────

const PROBLEMS: BondEnthalpyProblem[] = [
  // P1: H₂ + Cl₂ → 2HCl
  (() => {
    const broken: BondCount[] = [
      { bond: 'H-H',   count: 1, energy: 432 },
      { bond: 'Cl-Cl', count: 1, energy: 242 },
    ]
    const formed: BondCount[] = [
      { bond: 'H-Cl', count: 2, energy: 427 },
    ]
    const answer = -180
    return {
      description: 'formation of hydrogen chloride',
      reaction: 'H₂(g) + Cl₂(g) → 2HCl(g)',
      broken, formed, answer, answerUnit: 'kJ' as const,
      solutionSteps: buildSteps(broken, formed, answer),
    }
  })(),

  // P2: H₂ + F₂ → 2HF
  (() => {
    const broken: BondCount[] = [
      { bond: 'H-H', count: 1, energy: 432 },
      { bond: 'F-F', count: 1, energy: 155 },
    ]
    const formed: BondCount[] = [
      { bond: 'H-F', count: 2, energy: 565 },
    ]
    const answer = -543
    return {
      description: 'formation of hydrogen fluoride',
      reaction: 'H₂(g) + F₂(g) → 2HF(g)',
      broken, formed, answer, answerUnit: 'kJ' as const,
      solutionSteps: buildSteps(broken, formed, answer),
    }
  })(),

  // P3: N₂ + 3H₂ → 2NH₃
  (() => {
    const broken: BondCount[] = [
      { bond: 'N≡N', count: 1, energy: 945 },
      { bond: 'H-H', count: 3, energy: 432 },
    ]
    const formed: BondCount[] = [
      { bond: 'H-N', count: 6, energy: 391 },
    ]
    const answer = -105
    return {
      description: 'Haber process (ammonia synthesis)',
      reaction: 'N₂(g) + 3H₂(g) → 2NH₃(g)',
      broken, formed, answer, answerUnit: 'kJ' as const,
      solutionSteps: buildSteps(broken, formed, answer),
    }
  })(),

  // P4: CH₂=CH₂ + H₂ → CH₃CH₃ (hydrogenation)
  (() => {
    const broken: BondCount[] = [
      { bond: 'C=C', count: 1, energy: 614 },
      { bond: 'H-H', count: 1, energy: 432 },
    ]
    const formed: BondCount[] = [
      { bond: 'C-C', count: 1, energy: 347 },
      { bond: 'C-H', count: 2, energy: 413 },
    ]
    const answer = -127
    return {
      description: 'hydrogenation of ethylene',
      reaction: 'CH₂=CH₂(g) + H₂(g) → CH₃CH₃(g)',
      broken, formed, answer, answerUnit: 'kJ' as const,
      solutionSteps: buildSteps(broken, formed, answer),
    }
  })(),

  // P5: 2H₂ + O₂ → 2H₂O
  (() => {
    const broken: BondCount[] = [
      { bond: 'H-H', count: 2, energy: 432 },
      { bond: 'O=O', count: 1, energy: 498 },
    ]
    const formed: BondCount[] = [
      { bond: 'H-O', count: 4, energy: 463 },
    ]
    const answer = -490
    return {
      description: 'combustion of hydrogen',
      reaction: '2H₂(g) + O₂(g) → 2H₂O(g)',
      broken, formed, answer, answerUnit: 'kJ' as const,
      solutionSteps: buildSteps(broken, formed, answer),
    }
  })(),

  // P6: H₂ + Br₂ → 2HBr
  (() => {
    const broken: BondCount[] = [
      { bond: 'H-H',   count: 1, energy: 432 },
      { bond: 'Br-Br', count: 1, energy: 193 },
    ]
    const formed: BondCount[] = [
      { bond: 'H-Br', count: 2, energy: 363 },
    ]
    const answer = -101
    return {
      description: 'formation of hydrogen bromide',
      reaction: 'H₂(g) + Br₂(g) → 2HBr(g)',
      broken, formed, answer, answerUnit: 'kJ' as const,
      solutionSteps: buildSteps(broken, formed, answer),
    }
  })(),

  // P7: CH₄ + Cl₂ → CH₃Cl + HCl (chlorination)
  (() => {
    const broken: BondCount[] = [
      { bond: 'C-H',   count: 1, energy: 413 },
      { bond: 'Cl-Cl', count: 1, energy: 242 },
    ]
    const formed: BondCount[] = [
      { bond: 'C-Cl', count: 1, energy: 339 },
      { bond: 'H-Cl', count: 1, energy: 427 },
    ]
    const answer = -111
    return {
      description: 'chlorination of methane',
      reaction: 'CH₄(g) + Cl₂(g) → CH₃Cl(g) + HCl(g)',
      broken, formed, answer, answerUnit: 'kJ' as const,
      solutionSteps: buildSteps(broken, formed, answer),
    }
  })(),

  // P8: CH₄ + 2O₂ → CO₂ + 2H₂O (combustion)
  (() => {
    const broken: BondCount[] = [
      { bond: 'C-H', count: 4, energy: 413 },
      { bond: 'O=O', count: 2, energy: 498 },
    ]
    const formed: BondCount[] = [
      { bond: 'C=O', count: 2, energy: 745 },
      { bond: 'H-O', count: 4, energy: 463 },
    ]
    const answer = -694
    return {
      description: 'combustion of methane',
      reaction: 'CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(g)',
      broken, formed, answer, answerUnit: 'kJ' as const,
      solutionSteps: buildSteps(broken, formed, answer),
    }
  })(),

  // P9: HC≡CH + 2H₂ → CH₃CH₃ (hydrogenation of acetylene)
  (() => {
    const broken: BondCount[] = [
      { bond: 'C≡C', count: 1, energy: 839 },
      { bond: 'H-H', count: 2, energy: 432 },
    ]
    const formed: BondCount[] = [
      { bond: 'C-C', count: 1, energy: 347 },
      { bond: 'C-H', count: 4, energy: 413 },
    ]
    const answer = -296
    return {
      description: 'hydrogenation of acetylene',
      reaction: 'HC≡CH(g) + 2H₂(g) → CH₃CH₃(g)',
      broken, formed, answer, answerUnit: 'kJ' as const,
      solutionSteps: buildSteps(broken, formed, answer),
    }
  })(),

  // P10: H₂ + I₂ → 2HI
  (() => {
    const broken: BondCount[] = [
      { bond: 'H-H', count: 1, energy: 432 },
      { bond: 'I-I', count: 1, energy: 151 },
    ]
    const formed: BondCount[] = [
      { bond: 'H-I', count: 2, energy: 295 },
    ]
    const answer = -7
    return {
      description: 'formation of hydrogen iodide',
      reaction: 'H₂(g) + I₂(g) → 2HI(g)',
      broken, formed, answer, answerUnit: 'kJ' as const,
      solutionSteps: buildSteps(broken, formed, answer),
    }
  })(),
]

// ── Public API ────────────────────────────────────────────────────────────────

export function genBondEnthalpyProblem(): BondEnthalpyProblem {
  return PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]
}

export function checkBondEnthalpyAnswer(problem: BondEnthalpyProblem, input: string): boolean {
  const val = parseFloat(input)
  if (isNaN(val)) return false
  if (problem.answer === 0) return Math.abs(val) < 0.5
  return Math.abs((val - problem.answer) / problem.answer) <= 0.02
}

export { PROBLEMS as BOND_ENTHALPY_PROBLEMS }
