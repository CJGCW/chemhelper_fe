export type CouplingType = 'suzuki' | 'heck' | 'stille' | 'negishi' | 'sonogashira'

export const COUPLING_LABELS: Record<CouplingType, string> = {
  suzuki:      'Suzuki coupling',
  heck:        'Heck reaction',
  stille:      'Stille coupling',
  negishi:     'Negishi coupling',
  sonogashira: 'Sonogashira coupling',
}

export type CrossCouplingProblemType = 'identify-coupling' | 'predict-product'

export interface CrossCouplingProblem {
  type: CrossCouplingProblemType
  scenario: string
  substrateSmiles?: string
  question: string
  choices: string[]
  answer: string
  explanation: string
  steps: string[]
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

interface ArylHalide {
  formula: string
  name: string
  smiles?: string
}

const ARYL_HALIDES: ArylHalide[] = [
  { formula: 'PhBr',            name: 'bromobenzene',                        smiles: 'Brc1ccccc1'              },
  { formula: 'PhI',             name: 'iodobenzene',                         smiles: 'Ic1ccccc1'               },
  { formula: '4-MeO-C₆H₄Br',   name: '4-bromoanisole',                      smiles: 'Brc1ccc(OC)cc1'          },
  { formula: '4-NO₂-C₆H₄Br',   name: '4-bromonitrobenzene',                 smiles: 'Brc1ccc([N+](=O)[O-])cc1'},
  { formula: '3-CF₃-C₆H₄Br',   name: '3-(trifluoromethyl)bromobenzene',     smiles: 'Brc1cccc(C(F)(F)F)c1'    },
  { formula: '2-Naphthyl-Br',   name: '2-bromonaphthalene',                  smiles: 'Brc1ccc2ccccc2c1'        },
  { formula: 'Vinyl-Br',        name: 'vinyl bromide (bromoethylene)',        smiles: 'BrC=C'                   },
  { formula: '4-Ac-C₆H₄Br',    name: '4-bromoacetophenone',                  smiles: 'Brc1ccc(C(C)=O)cc1'      },
]

interface PartnerDef {
  type: CouplingType
  partner: string
  partnerName: string
  productSuffix: string
  catalyst: string
  distinguishingFeature: string
}

const PARTNER_DEFS: PartnerDef[] = [
  {
    type: 'suzuki',
    partner: 'ArB(OH)₂',
    partnerName: 'arylboronic acid',
    productSuffix: 'Ar (biaryl product)',
    catalyst: 'Pd(PPh₃)₄, K₂CO₃, EtOH/H₂O',
    distinguishingFeature: 'Organoboron (boronic acid) partner + base + Pd',
  },
  {
    type: 'heck',
    partner: 'CH₂=CHCO₂Et',
    partnerName: 'alkene (ethyl acrylate)',
    productSuffix: 'CH=CHCO₂Et (vinyl-aryl product)',
    catalyst: 'Pd(OAc)₂, PPh₃, base (NEt₃)',
    distinguishingFeature: 'Alkene (not organometallic) as coupling partner; β-hydride elimination key step',
  },
  {
    type: 'stille',
    partner: 'PhSn(Bu)₃',
    partnerName: 'aryltributylstannane (organotin)',
    productSuffix: 'Ph (biaryl or vinyl product)',
    catalyst: 'Pd(PPh₃)₄, no base required',
    distinguishingFeature: 'Organotin (stannane, –SnR₃) partner; toxic tin byproduct',
  },
  {
    type: 'negishi',
    partner: 'ArZnCl',
    partnerName: 'arylzinc chloride (organozinc)',
    productSuffix: 'Ar (biaryl product)',
    catalyst: 'Pd(PPh₃)₄ or Ni catalyst',
    distinguishingFeature: 'Organozinc (–ZnX) partner; tolerates many functional groups',
  },
  {
    type: 'sonogashira',
    partner: 'PhC≡CH',
    partnerName: 'terminal alkyne (phenylacetylene)',
    productSuffix: 'C≡CPh (aryl alkynyl product)',
    catalyst: 'Pd/Cu (CuI co-catalyst), base (NEt₃), no ligand often needed',
    distinguishingFeature: 'Terminal alkyne partner + Cu co-catalyst + Pd; forms C–C≡C– bond',
  },
]

function generateIdentifyCoupling(): CrossCouplingProblem {
  const aryl = ARYL_HALIDES[Math.floor(Math.random() * ARYL_HALIDES.length)]
  const partnerDef = PARTNER_DEFS[Math.floor(Math.random() * PARTNER_DEFS.length)]

  const scenario = [
    `Electrophile:  ${aryl.formula} (${aryl.name})`,
    `Nucleophile:   ${partnerDef.partner} (${partnerDef.partnerName})`,
    `Catalyst:      ${partnerDef.catalyst}`,
  ].join('\n')

  const answer = COUPLING_LABELS[partnerDef.type]
  const allLabels = Object.values(COUPLING_LABELS)
  const wrong = shuffle(allLabels.filter(l => l !== answer)).slice(0, 3)

  return {
    type: 'identify-coupling',
    scenario,
    substrateSmiles: aryl.smiles,
    question: 'Which Pd-catalyzed cross-coupling reaction is being described?',
    choices: shuffle([answer, ...wrong]),
    answer,
    explanation: `Key: the ${partnerDef.distinguishingFeature}. This identifies the reaction as ${answer}.`,
    steps: [
      `Step 1 (Oxidative addition): Pd⁰ inserts into the C–Br (or C–I) bond of ${aryl.formula} → Pd(II) complex.`,
      `Step 2 (Transmetalation or carbopalladation): the ${partnerDef.partnerName} transfers its carbon to Pd.`,
      `Step 3 (Reductive elimination): C–C bond forms, Pd⁰ regenerated.`,
      `Distinguishing feature: ${partnerDef.distinguishingFeature}.`,
    ],
  }
}

function generatePredictProduct(): CrossCouplingProblem {
  const aryl = ARYL_HALIDES[Math.floor(Math.random() * ARYL_HALIDES.length)]
  const partnerDef = PARTNER_DEFS[Math.floor(Math.random() * PARTNER_DEFS.length)]
  const reactionName = COUPLING_LABELS[partnerDef.type]
  const answer = `${aryl.formula.replace('Br','').replace('I','')}-${partnerDef.productSuffix}`

  // Wrong answers: mix the aryl with wrong partner outcomes, or scramble
  const otherPartners = PARTNER_DEFS.filter(p => p.type !== partnerDef.type)
  const wrong = shuffle(otherPartners).slice(0, 3).map(p =>
    `${aryl.formula.replace('Br','').replace('I','')}-${p.productSuffix}`
  )

  const scenario = [
    `Reaction: ${reactionName}`,
    `Substrate: ${aryl.formula} (${aryl.name})`,
    `Partner:   ${partnerDef.partner} (${partnerDef.partnerName})`,
    `Catalyst:  ${partnerDef.catalyst}`,
  ].join('\n')

  return {
    type: 'predict-product',
    scenario,
    substrateSmiles: aryl.smiles,
    question: 'What is the major organic product of this cross-coupling reaction?',
    choices: shuffle([answer, ...wrong]),
    answer,
    explanation: `${reactionName} couples the aryl electrophile (${aryl.formula}) with the ${partnerDef.partnerName} to form a new C–C bond: ${answer}.`,
    steps: [
      `Identify the electrophile: ${aryl.formula} (aryl halide).`,
      `Identify the nucleophilic partner: ${partnerDef.partnerName}.`,
      `The C–X bond of the aryl halide is replaced by a C–C bond to the partner carbon.`,
      `Product: ${answer}`,
    ],
  }
}

export function generateCrossCouplingProblem(forceType?: CrossCouplingProblemType): CrossCouplingProblem {
  const type = forceType ?? (Math.random() < 0.5 ? 'identify-coupling' : 'predict-product')
  return type === 'identify-coupling' ? generateIdentifyCoupling() : generatePredictProduct()
}

export function checkCrossCouplingAnswer(problem: CrossCouplingProblem, selected: string): boolean {
  return selected.trim() === problem.answer.trim()
}
