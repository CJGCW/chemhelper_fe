// ── Types ─────────────────────────────────────────────────────────────────────

export interface HessStep {
  equation: string   // e.g. "CH4(g) + 2O2(g) → CO2(g) + 2H2O(l)"
  dh:       number   // kJ, as written
}

export interface HessProblem {
  description:   string
  target:        string       // target equation to find ΔH for
  steps:         HessStep[]   // given thermochemical equations
  answer:        number       // kJ
  answerUnit:    'kJ'
  solutionSteps: string[]     // human-readable explanation
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return (n >= 0 ? '+' : '') + n.toFixed(1)
}

function contribution(step: number, flipped: boolean, mult: number, dh: number): string {
  const result = parseFloat((mult * (flipped ? -dh : dh)).toFixed(1))
  const label = flipped
    ? (mult === 1 ? `Step ${step} (reversed)` : `Step ${step} ×${mult} (reversed)`)
    : (mult === 1 ? `Step ${step} (as written)` : `Step ${step} ×${mult}`)
  return `${label}:  ΔH = ${flipped ? '-' : ''}${mult === 1 ? '' : mult + '×'}(${dh}) = ${fmt(result)} kJ`
}

// ── Reaction database ─────────────────────────────────────────────────────────

const PROBLEMS: HessProblem[] = [
  // ── P1: Formation of CO from C ────────────────────────────────────────────
  {
    description: 'formation of carbon monoxide',
    target: '2C(s) + O₂(g) → 2CO(g)',
    steps: [
      { equation: 'C(s) + O₂(g) → CO₂(g)',             dh: -393.5 },
      { equation: '2CO(g) + O₂(g) → 2CO₂(g)',          dh: -566.0 },
    ],
    answer: -221.0,
    answerUnit: 'kJ',
    solutionSteps: [
      'Step 1 ×2 (as written):   2C(s) + 2O₂(g) → 2CO₂(g)       ΔH = 2×(−393.5) = −787.0 kJ',
      'Step 2 ×1 (reversed):     2CO₂(g) → 2CO(g) + O₂(g)       ΔH = −1×(−566.0) = +566.0 kJ',
      'Cancel 2CO₂ from both sides; O₂ reduces from 2O₂ to O₂',
      'Net: 2C(s) + O₂(g) → 2CO(g)',
      'ΔHrxn = −787.0 + 566.0 = −221.0 kJ',
    ],
  },

  // ── P2: Formation of methane ──────────────────────────────────────────────
  {
    description: 'formation of methane',
    target: 'C(s) + 2H₂(g) → CH₄(g)',
    steps: [
      { equation: 'CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(l)',  dh:  -890.3 },
      { equation: 'C(s) + O₂(g) → CO₂(g)',                  dh:  -393.5 },
      { equation: '2H₂(g) + O₂(g) → 2H₂O(l)',              dh:  -571.6 },
    ],
    answer: -74.8,
    answerUnit: 'kJ',
    solutionSteps: [
      'Step 1 ×1 (reversed):   CO₂(g) + 2H₂O(l) → CH₄(g) + 2O₂(g)   ΔH = +890.3 kJ',
      'Step 2 ×1 (as written): C(s) + O₂(g) → CO₂(g)                  ΔH = −393.5 kJ',
      'Step 3 ×1 (as written): 2H₂(g) + O₂(g) → 2H₂O(l)              ΔH = −571.6 kJ',
      'Cancel CO₂, 2H₂O, and 3O₂ from both sides',
      'Net: C(s) + 2H₂(g) → CH₄(g)',
      'ΔHrxn = +890.3 − 393.5 − 571.6 = −74.8 kJ',
    ],
  },

  // ── P3: Formation of NO₂ from N₂ ─────────────────────────────────────────
  {
    description: 'formation of nitrogen dioxide',
    target: 'N₂(g) + 2O₂(g) → 2NO₂(g)',
    steps: [
      { equation: 'N₂(g) + O₂(g) → 2NO(g)',           dh: +180.6 },
      { equation: '2NO(g) + O₂(g) → 2NO₂(g)',         dh: -114.2 },
    ],
    answer: +66.4,
    answerUnit: 'kJ',
    solutionSteps: [
      'Step 1 ×1 (as written): N₂(g) + O₂(g) → 2NO(g)      ΔH = +180.6 kJ',
      'Step 2 ×1 (as written): 2NO(g) + O₂(g) → 2NO₂(g)    ΔH = −114.2 kJ',
      'Cancel 2NO from both sides',
      'Net: N₂(g) + 2O₂(g) → 2NO₂(g)',
      'ΔHrxn = +180.6 + (−114.2) = +66.4 kJ',
    ],
  },

  // ── P4: Formation of SO₃ from S ──────────────────────────────────────────
  {
    description: 'formation of sulfur trioxide from sulfur',
    target: '2S(s) + 3O₂(g) → 2SO₃(g)',
    steps: [
      { equation: 'S(s) + O₂(g) → SO₂(g)',              dh: -296.8 },
      { equation: '2SO₂(g) + O₂(g) → 2SO₃(g)',          dh: -197.8 },
    ],
    answer: -791.4,
    answerUnit: 'kJ',
    solutionSteps: [
      'Step 1 ×2 (as written): 2S(s) + 2O₂(g) → 2SO₂(g)        ΔH = 2×(−296.8) = −593.6 kJ',
      'Step 2 ×1 (as written): 2SO₂(g) + O₂(g) → 2SO₃(g)       ΔH = −197.8 kJ',
      'Cancel 2SO₂ from both sides',
      'Net: 2S(s) + 3O₂(g) → 2SO₃(g)',
      'ΔHrxn = −593.6 + (−197.8) = −791.4 kJ',
    ],
  },

  // ── P5: Formation of ethane (combustion data) ─────────────────────────────
  {
    description: 'formation of ethane from elements',
    target: '2C(s) + 3H₂(g) → C₂H₆(g)',
    steps: [
      { equation: '2C₂H₆(g) + 7O₂(g) → 4CO₂(g) + 6H₂O(l)',  dh: -3119.4 },
      { equation: 'C(s) + O₂(g) → CO₂(g)',                    dh:  -393.5  },
      { equation: '2H₂(g) + O₂(g) → 2H₂O(l)',                dh:  -571.6  },
    ],
    answer: -84.7,
    answerUnit: 'kJ',
    solutionSteps: [
      'Step 1 ×½ (reversed):   C₂H₆(g) → 2C(s) ... wait — use integer approach:',
      'Step 1 ×1 (reversed):   4CO₂(g) + 6H₂O(l) → 2C₂H₆(g) + 7O₂(g)   ΔH = +3119.4 kJ',
      'Step 2 ×4 (as written): 4C(s) + 4O₂(g) → 4CO₂(g)                   ΔH = 4×(−393.5) = −1574.0 kJ',
      'Step 3 ×3 (as written): 6H₂(g) + 3O₂(g) → 6H₂O(l)                  ΔH = 3×(−571.6) = −1714.8 kJ',
      'Cancel 4CO₂, 6H₂O, and O₂ terms; divide result by 2',
      'Net ×2: 4C(s) + 6H₂(g) → 2C₂H₆(g)',
      'ΔH(×2) = +3119.4 − 1574.0 − 1714.8 = −169.4 kJ',
      'ΔHrxn = −169.4 ÷ 2 = −84.7 kJ',
    ],
  },

  // ── P6: Formation of acetylene from elements ──────────────────────────────
  {
    description: 'formation of acetylene from elements',
    target: '2C(s) + H₂(g) → C₂H₂(g)',
    steps: [
      { equation: '2C₂H₂(g) + 5O₂(g) → 4CO₂(g) + 2H₂O(l)',  dh: -2599.2 },
      { equation: 'C(s) + O₂(g) → CO₂(g)',                    dh:  -393.5  },
      { equation: '2H₂(g) + O₂(g) → 2H₂O(l)',                dh:  -571.6  },
    ],
    answer: +226.8,
    answerUnit: 'kJ',
    solutionSteps: [
      'Step 1 ×1 (reversed):   4CO₂(g) + 2H₂O(l) → 2C₂H₂(g) + 5O₂(g)  ΔH = +2599.2 kJ',
      'Step 2 ×4 (as written): 4C(s) + 4O₂(g) → 4CO₂(g)                  ΔH = 4×(−393.5) = −1574.0 kJ',
      'Step 3 ×1 (as written): 2H₂(g) + O₂(g) → 2H₂O(l)                  ΔH = −571.6 kJ',
      'Cancel 4CO₂, 2H₂O, 5O₂; divide by 2',
      'Net ×2: 4C(s) + 2H₂(g) → 2C₂H₂(g)',
      'ΔH(×2) = +2599.2 − 1574.0 − 571.6 = +453.6 kJ',
      'ΔHrxn = +453.6 ÷ 2 = +226.8 kJ',
    ],
  },

  // ── P7: Formation of water vapor ──────────────────────────────────────────
  {
    description: 'formation of water vapor from H₂ and O₂',
    target: '2H₂(g) + O₂(g) → 2H₂O(g)',
    steps: [
      { equation: '2H₂(g) + O₂(g) → 2H₂O(l)',   dh: -571.6 },
      { equation: 'H₂O(l) → H₂O(g)',              dh:  +44.0 },
    ],
    answer: -483.6,
    answerUnit: 'kJ',
    solutionSteps: [
      'Step 1 ×1 (as written): 2H₂(g) + O₂(g) → 2H₂O(l)   ΔH = −571.6 kJ',
      'Step 2 ×2 (as written): 2H₂O(l) → 2H₂O(g)           ΔH = 2×(+44.0) = +88.0 kJ',
      'Cancel 2H₂O(l) from both sides',
      'Net: 2H₂(g) + O₂(g) → 2H₂O(g)',
      'ΔHrxn = −571.6 + 88.0 = −483.6 kJ',
    ],
  },

  // ── P8: Combustion of ethane from formation data ──────────────────────────
  {
    description: 'combustion of ethane (from formation data)',
    target: '2C₂H₆(g) + 7O₂(g) → 4CO₂(g) + 6H₂O(l)',
    steps: [
      { equation: '2C(s) + 3H₂(g) → C₂H₆(g)',    dh:  -84.7  },
      { equation: 'C(s) + O₂(g) → CO₂(g)',         dh: -393.5  },
      { equation: '2H₂(g) + O₂(g) → 2H₂O(l)',     dh: -571.6  },
    ],
    answer: -3119.4,
    answerUnit: 'kJ',
    solutionSteps: [
      'Step 1 ×2 (reversed):   2C₂H₆(g) → 4C(s) + 6H₂(g)       ΔH = 2×(+84.7) = +169.4 kJ',
      'Step 2 ×4 (as written): 4C(s) + 4O₂(g) → 4CO₂(g)          ΔH = 4×(−393.5) = −1574.0 kJ',
      'Step 3 ×3 (as written): 6H₂(g) + 3O₂(g) → 6H₂O(l)         ΔH = 3×(−571.6) = −1714.8 kJ',
      'Cancel 4C and 6H₂ from both sides',
      'Net: 2C₂H₆(g) + 7O₂(g) → 4CO₂(g) + 6H₂O(l)',
      'ΔHrxn = +169.4 − 1574.0 − 1714.8 = −3119.4 kJ',
    ],
  },
]

// ── Public API ────────────────────────────────────────────────────────────────

export function genHessProblem(): HessProblem {
  return PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]
}

export function checkHessAnswer(problem: HessProblem, input: string): boolean {
  const val = parseFloat(input)
  if (isNaN(val)) return false
  if (problem.answer === 0) return Math.abs(val) < 0.5
  return Math.abs((val - problem.answer) / problem.answer) <= 0.02
}

export { PROBLEMS as HESS_PROBLEMS }
void fmt
void contribution
