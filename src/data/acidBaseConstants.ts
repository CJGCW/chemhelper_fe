// Acid/base constant data. Source: Chang's Chemistry 14e, Appendix.
// Where Chang values and CRC values differ, Chang values are preferred for
// consistency with student homework.

export interface AcidData {
  formula: string
  name: string
  Ka: number
  pKa: number
  type: 'strong' | 'weak' | 'polyprotic'
  conjugateBase: string
  Ka2?: number
  Ka3?: number
  pKa2?: number
  pKa3?: number
}

export interface BaseData {
  formula: string
  name: string
  Kb: number
  pKb: number
  type: 'strong' | 'weak'
  conjugateAcid: string
}

export const Kw = 1.0e-14

// Strong acids — Ka = Infinity (complete dissociation)
export const STRONG_ACIDS: AcidData[] = [
  { formula: 'HCl',   name: 'Hydrochloric acid',   Ka: Infinity, pKa: -Infinity, type: 'strong', conjugateBase: 'Cl⁻'    },
  { formula: 'HBr',   name: 'Hydrobromic acid',    Ka: Infinity, pKa: -Infinity, type: 'strong', conjugateBase: 'Br⁻'    },
  { formula: 'HI',    name: 'Hydroiodic acid',     Ka: Infinity, pKa: -Infinity, type: 'strong', conjugateBase: 'I⁻'     },
  { formula: 'HNO₃',  name: 'Nitric acid',         Ka: Infinity, pKa: -Infinity, type: 'strong', conjugateBase: 'NO₃⁻'   },
  { formula: 'HClO₄', name: 'Perchloric acid',     Ka: Infinity, pKa: -Infinity, type: 'strong', conjugateBase: 'ClO₄⁻'  },
  { formula: 'HClO₃', name: 'Chloric acid',        Ka: Infinity, pKa: -Infinity, type: 'strong', conjugateBase: 'ClO₃⁻'  },
  { formula: 'H₂SO₄', name: 'Sulfuric acid (Ka1)', Ka: Infinity, pKa: -Infinity, type: 'strong', conjugateBase: 'HSO₄⁻', Ka2: 1.2e-2, pKa2: 1.92 },
]

// Weak monoprotic acids (Chang Appendix values)
export const WEAK_ACIDS: AcidData[] = [
  { formula: 'HF',          name: 'Hydrofluoric acid',   Ka: 6.8e-4,  pKa: 3.17,  type: 'weak', conjugateBase: 'F⁻'         },
  { formula: 'HNO₂',        name: 'Nitrous acid',        Ka: 4.5e-4,  pKa: 3.35,  type: 'weak', conjugateBase: 'NO₂⁻'       },
  { formula: 'CH₂ClCOOH',   name: 'Chloroacetic acid',   Ka: 1.4e-3,  pKa: 2.85,  type: 'weak', conjugateBase: 'CH₂ClCOO⁻'  },
  { formula: 'HCOOH',       name: 'Formic acid',         Ka: 1.7e-4,  pKa: 3.77,  type: 'weak', conjugateBase: 'HCOO⁻'      },
  { formula: 'C₆H₅COOH',   name: 'Benzoic acid',        Ka: 6.3e-5,  pKa: 4.20,  type: 'weak', conjugateBase: 'C₆H₅COO⁻'  },
  { formula: 'CH₃COOH',    name: 'Acetic acid',         Ka: 1.8e-5,  pKa: 4.74,  type: 'weak', conjugateBase: 'CH₃COO⁻'   },
  { formula: 'HSO₄⁻',      name: 'Bisulfate ion',       Ka: 1.2e-2,  pKa: 1.92,  type: 'weak', conjugateBase: 'SO₄²⁻'      },
  { formula: 'HOCl',        name: 'Hypochlorous acid',   Ka: 3.0e-8,  pKa: 7.52,  type: 'weak', conjugateBase: 'OCl⁻'       },
  { formula: 'HBrO',        name: 'Hypobromous acid',    Ka: 2.5e-9,  pKa: 8.60,  type: 'weak', conjugateBase: 'BrO⁻'       },
  { formula: 'H₃BO₃',      name: 'Boric acid',          Ka: 5.8e-10, pKa: 9.24,  type: 'weak', conjugateBase: 'H₂BO₃⁻'     },
  { formula: 'HCN',         name: 'Hydrocyanic acid',    Ka: 6.2e-10, pKa: 9.21,  type: 'weak', conjugateBase: 'CN⁻'         },
  { formula: 'CH₃NH₃⁺',    name: 'Methylammonium ion',  Ka: 2.4e-11, pKa: 10.62, type: 'weak', conjugateBase: 'CH₃NH₂'      },
]

// Polyprotic acids (all Ka values, Chang Appendix)
export const POLYPROTIC_ACIDS: AcidData[] = [
  {
    formula: 'H₃PO₄',    name: 'Phosphoric acid',
    Ka: 7.5e-3,  pKa: 2.12,
    Ka2: 6.2e-8, pKa2: 7.21,
    Ka3: 4.8e-13, pKa3: 12.32,
    type: 'polyprotic', conjugateBase: 'H₂PO₄⁻',
  },
  {
    formula: 'H₂CO₃',    name: 'Carbonic acid',
    Ka: 4.2e-7,  pKa: 6.38,
    Ka2: 4.8e-11, pKa2: 10.32,
    type: 'polyprotic', conjugateBase: 'HCO₃⁻',
  },
  {
    formula: 'H₂SO₃',    name: 'Sulfurous acid',
    Ka: 1.5e-2,  pKa: 1.82,
    Ka2: 6.3e-8, pKa2: 7.20,
    type: 'polyprotic', conjugateBase: 'HSO₃⁻',
  },
  {
    formula: 'H₂C₂O₄',   name: 'Oxalic acid',
    Ka: 5.9e-2,  pKa: 1.23,
    Ka2: 6.4e-5, pKa2: 4.19,
    type: 'polyprotic', conjugateBase: 'HC₂O₄⁻',
  },
]

// Weak bases (Kb values, Chang Appendix)
export const WEAK_BASES: BaseData[] = [
  { formula: 'NH₃',        name: 'Ammonia',         Kb: 1.8e-5,  pKb: 4.74,  type: 'weak', conjugateAcid: 'NH₄⁺'        },
  { formula: 'CH₃NH₂',     name: 'Methylamine',     Kb: 4.4e-4,  pKb: 3.36,  type: 'weak', conjugateAcid: 'CH₃NH₃⁺'     },
  { formula: '(CH₃)₂NH',   name: 'Dimethylamine',   Kb: 5.1e-4,  pKb: 3.29,  type: 'weak', conjugateAcid: '(CH₃)₂NH₂⁺'  },
  { formula: '(CH₃)₃N',    name: 'Trimethylamine',  Kb: 6.5e-5,  pKb: 4.19,  type: 'weak', conjugateAcid: '(CH₃)₃NH⁺'   },
  { formula: 'C₂H₅NH₂',   name: 'Ethylamine',      Kb: 5.6e-4,  pKb: 3.25,  type: 'weak', conjugateAcid: 'C₂H₅NH₃⁺'    },
  { formula: 'N₂H₄',       name: 'Hydrazine',       Kb: 1.7e-6,  pKb: 5.77,  type: 'weak', conjugateAcid: 'N₂H₅⁺'        },
  { formula: 'C₅H₅N',      name: 'Pyridine',        Kb: 1.7e-9,  pKb: 8.77,  type: 'weak', conjugateAcid: 'C₅H₅NH⁺'      },
  { formula: 'C₆H₅NH₂',   name: 'Aniline',         Kb: 3.9e-10, pKb: 9.41,  type: 'weak', conjugateAcid: 'C₆H₅NH₃⁺'    },
]

// Strong bases (complete dissociation)
export const STRONG_BASES: readonly string[] = [
  'LiOH', 'NaOH', 'KOH', 'RbOH', 'CsOH',
  'Ca(OH)₂', 'Sr(OH)₂', 'Ba(OH)₂',
]
