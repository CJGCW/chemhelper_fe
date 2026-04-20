// ── Types ─────────────────────────────────────────────────────────────────────

export type ProfileSubtype = 'identify' | 'read_dh' | 'read_ea' | 'reverse_ea' | 'catalyst'

export interface ProfileProblem {
  subtype:         ProfileSubtype
  question:        string
  hint?:           string
  answer:          string          // canonical accepted form
  acceptedAnswers: string[]        // all normalised forms (lowercase, no units)
  steps:           string[]
  isNumeric:       boolean
  // diagram
  dh:              number          // kJ/mol, negative = exothermic
  ea:              number          // kJ/mol above reactants
  reactantE:       number          // absolute energy of reactant level (kJ/mol)
  showValues:      boolean         // show energy numbers on level lines
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function sp(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`
}

const DH_EXO  = [-300, -250, -200, -150, -120, -100, -80]
const DH_ENDO = [ 80,  100,  120,  150,  200,  250,  300]
const EA_POOL = [80, 100, 120, 150, 180, 200, 250, 300, 350]
const RE_POOL = [150, 200, 250, 300, 350, 400]

function pickParams(forceExo?: boolean, forceEndo?: boolean) {
  const dhPool = forceExo ? DH_EXO : forceEndo ? DH_ENDO : [...DH_EXO, ...DH_ENDO]
  const dh = pick(dhPool)
  const minEa = dh > 0 ? dh + 20 : 30
  const validEas = EA_POOL.filter(e => e >= minEa)
  const ea = pick(validEas.length ? validEas : [minEa + 10])
  const validREs = RE_POOL.filter(e => e + dh >= 50)
  const reactantE = pick(validREs.length ? validREs : [400])
  return { dh, ea, reactantE }
}

// ── Problem generators ────────────────────────────────────────────────────────

function genIdentify(): ProfileProblem {
  const { dh, ea, reactantE } = pickParams()
  const isExo = dh < 0
  return {
    subtype: 'identify', dh, ea, reactantE,
    showValues: false,
    isNumeric: false,
    question: 'Is this reaction exothermic or endothermic?',
    hint: 'Compare the energy levels of reactants and products.',
    answer: isExo ? 'exothermic' : 'endothermic',
    acceptedAnswers: isExo ? ['exothermic', 'exo'] : ['endothermic', 'endo'],
    steps: [
      isExo
        ? 'Products are at lower energy than reactants → ΔH < 0'
        : 'Products are at higher energy than reactants → ΔH > 0',
      isExo
        ? 'A negative ΔH means the system releases heat to the surroundings.'
        : 'A positive ΔH means the system absorbs heat from the surroundings.',
      `Answer: ${isExo ? 'exothermic' : 'endothermic'}`,
    ],
  }
}

function genReadDh(): ProfileProblem {
  const { dh, ea, reactantE } = pickParams()
  const productE = reactantE + dh
  return {
    subtype: 'read_dh', dh, ea, reactantE,
    showValues: true,
    isNumeric: true,
    question: 'Using the labelled energy levels in the diagram, calculate ΔH for this reaction.',
    hint: 'ΔH = H(products) − H(reactants)',
    answer: sp(dh),
    acceptedAnswers: [sp(dh), String(dh)],
    steps: [
      'ΔH = H(products) − H(reactants)',
      `ΔH = ${productE} − ${reactantE}`,
      `ΔH = ${sp(dh)} kJ/mol`,
    ],
  }
}

function genReadEa(): ProfileProblem {
  const { dh, ea, reactantE } = pickParams()
  const tsE = reactantE + ea
  return {
    subtype: 'read_ea', dh, ea, reactantE,
    showValues: true,
    isNumeric: true,
    question: 'Using the labelled energy levels in the diagram, calculate the activation energy (Eₐ) for the forward reaction.',
    hint: 'Eₐ = H(transition state) − H(reactants)',
    answer: String(ea),
    acceptedAnswers: [String(ea), `+${ea}`],
    steps: [
      'Eₐ = H(transition state) − H(reactants)',
      `Eₐ = ${tsE} − ${reactantE}`,
      `Eₐ = ${ea} kJ/mol`,
    ],
  }
}

function genReverseEa(): ProfileProblem {
  const { dh, ea, reactantE } = pickParams()
  const productE = reactantE + dh
  const tsE      = reactantE + ea
  const eaRev    = ea - dh   // = tsE - productE
  return {
    subtype: 'reverse_ea', dh, ea, reactantE,
    showValues: true,
    isNumeric: true,
    question: 'Using the labelled energy levels in the diagram, calculate the activation energy for the reverse reaction.',
    hint: 'Eₐ(reverse) = H(transition state) − H(products)',
    answer: String(eaRev),
    acceptedAnswers: [String(eaRev), `+${eaRev}`],
    steps: [
      'Eₐ(reverse) = H(transition state) − H(products)',
      `Eₐ(reverse) = ${tsE} − ${productE}`,
      `Eₐ(reverse) = ${eaRev} kJ/mol`,
      `Alternatively: Eₐ(rev) = Eₐ(fwd) − ΔH = ${ea} − (${sp(dh)}) = ${eaRev} kJ/mol`,
    ],
  }
}

function genCatalyst(): ProfileProblem {
  const { dh, ea, reactantE } = pickParams()
  const askEa = Math.random() < 0.6
  return {
    subtype: 'catalyst', dh, ea, reactantE,
    showValues: false,
    isNumeric: false,
    question: askEa
      ? 'A catalyst is added to this reaction. What happens to the activation energy (Eₐ)?'
      : 'A catalyst is added to this reaction. What happens to ΔH?',
    answer: askEa ? 'decreases' : 'unchanged',
    acceptedAnswers: askEa
      ? ['decreases', 'decrease', 'lowers', 'lower', 'reduced', 'reduces', 'smaller']
      : ['unchanged', 'no change', 'stays the same', 'same', 'unaffected', 'does not change'],
    steps: askEa
      ? [
          'A catalyst provides an alternative reaction pathway with a lower transition-state energy.',
          'This lowers Eₐ — the energy barrier for the reaction.',
          'Answer: Eₐ decreases.',
          'Note: the catalyst does NOT change ΔH (reactant and product energies are unchanged).',
        ]
      : [
          'ΔH is a state function — it depends only on the energy difference between reactants and products.',
          'A catalyst changes the pathway (lowers Eₐ) but does not change the energies of reactants or products.',
          'Answer: ΔH is unchanged.',
        ],
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

const GENERATORS: Record<ProfileSubtype, () => ProfileProblem> = {
  identify:   genIdentify,
  read_dh:    genReadDh,
  read_ea:    genReadEa,
  reverse_ea: genReverseEa,
  catalyst:   genCatalyst,
}

const ALL_SUBTYPES = Object.keys(GENERATORS) as ProfileSubtype[]

export function generateProfileProblem(subtype?: ProfileSubtype): ProfileProblem {
  const t = subtype ?? pick(ALL_SUBTYPES)
  return GENERATORS[t]()
}

export function checkProfileAnswer(problem: ProfileProblem, input: string): boolean {
  const norm = input.trim()
    .replace(/\s*(kj\/mol|kj\/mol|kJ\/mol|kJ)\s*$/i, '')
    .replace('−', '-')   // unicode minus → ASCII
    .replace('–', '-')   // en dash → ASCII
    .trim()
    .toLowerCase()

  if (norm === '') return false

  for (const accepted of problem.acceptedAnswers) {
    if (norm === accepted.toLowerCase()) return true
  }

  // Numeric fallback: accept if parsed value matches
  if (problem.isNumeric) {
    const n = parseFloat(norm)
    const canonical = parseFloat(problem.answer)
    if (!isNaN(n) && !isNaN(canonical) && n === canonical) return true
  }

  return false
}
