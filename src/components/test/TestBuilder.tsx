import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { MolarCalcType, ProblemStyle } from '../../utils/molarPractice'
import { generateMolarProblem } from '../../utils/molarPractice'
import { generateSigFigProblem } from '../../utils/sigfigPractice'
import { generateEmpiricalProblem } from '../../utils/empiricalPractice'
import { generateConversionProblem } from '../../utils/conversionPractice'
import { generateAtomicProblem } from '../../utils/atomicPractice'
import { generateLewisProblem, generateLewisDrawProblem, generateVseprProblem, generateVseprDrawProblem } from '../../utils/lewisPractice'
import type { StoichProblemType } from '../../utils/stoichiometryPractice'
import { generateStoichProblem } from '../../utils/stoichiometryPractice'
import type { RedoxSubtype } from '../../utils/redoxPractice'
import { generateRedoxProblem } from '../../utils/redoxPractice'
import type { PercCompType } from '../../utils/percentCompositionPractice'
import { generatePercCompProblem } from '../../utils/percentCompositionPractice'
import type { GasStandard } from '../../utils/gasStoichPractice'
import { generateGasStoichProblem } from '../../utils/gasStoichPractice'
import type { SolStoichType } from '../../utils/solutionStoichPractice'
import { generateSolStoichProblem } from '../../utils/solutionStoichPractice'
import type { Difficulty } from '../../utils/balancingPractice'
import { pickEquation } from '../../utils/balancingPractice'
import { genCalorimetryProblem } from '../../utils/calorimetryPractice'
import { genEnthalpyProblem } from '../../utils/enthalpyPractice'
import { genHessProblem } from '../../utils/hessLawPractice'
import { genBondEnthalpyProblem } from '../../utils/bondEnthalpyPractice'
import { genHeatTransferProblem } from '../../utils/heatTransferPractice'
import { generateVdWProblem } from '../../utils/vanDerWaalsPractice'
import { genGasProblem } from '../../utils/idealGasPractice'
import type { EcellSubtype } from '../../utils/ecellPractice'
import { genEcellProblem } from '../../utils/ecellPractice'
import type { RxnSubtype } from '../../utils/reactionPredictorPractice'
import { genRxnPracticeProblem } from '../../utils/reactionPredictorPractice'
import type { DilutionSubtype } from '../../utils/dilutionPractice'
import { genDilutionProblem } from '../../utils/dilutionPractice'
import type { ConcSubtype } from '../../utils/concentrationPractice'
import { genConcProblem } from '../../utils/concentrationPractice'
import { genClausiusClapeyronProblem } from '../../utils/clausiusClapeyronPractice'
import { generateSigmaPiProblem } from '../../utils/sigmaPiPractice'
import { genHCProblem } from '../../utils/heatingCurveProblems'
import { genPDProblem } from '../../utils/phaseDiagramProblems'
import type { ProfileSubtype } from '../../utils/reactionProfilePractice'
import { generateProfileProblem } from '../../utils/reactionProfilePractice'
import { generateRateLawProblem } from '../../utils/kineticsRateLawPractice'
import { generateArrheniusProblem } from '../../utils/kineticsArrheniusPractice'
import { generateIntegratedProblem } from '../../utils/kineticsIntegratedPractice'
import { generateKExpressionProblem, generateQvsKProblem, generateKpKcProblem, generateDynamicICEProblem, generateICEPrefilled } from '../../utils/equilibriumPractice'
import { generatePhProblem, generateKaKbProblem, generateWeakAcidProblem, generateWeakBaseProblem, generateSaltPhProblem, generatePolyproticProblem } from '../../utils/acidBasePractice'
import { generateBufferPhProblem } from '../../utils/bufferPractice'
import { generateKspToSolubilityProblem, generateSolubilityToKspProblem, generatePrecipitationProblem } from '../../utils/kspPractice'
import { generateEntropyProblem, generateGibbsProblem, generateSpontaneityProblem, generateGibbsKProblem, generateCrossoverTProblem } from '../../utils/thermodynamicsPractice'
import { genTriangleProblem, genFaradayProblem, genConcCellProblem } from '../../utils/electrochemPractice'
import { generateDecayProblem, generateHalfLifeProblem, generateBindingEnergyProblem, generateDatingProblem } from '../../utils/nuclearPractice'
import { genHydrocarbonProblem, hydrocarbonSolutionSteps, genIsomerProblem, genNamingProblem, genFunctionalGroupProblem, genOrganicReactionProblem } from '../../utils/organicPractice'
import { generateMechanismProblem } from '../../utils/mechanismPractice'
import { ALL_REACTIONS } from '../../data/mechanisms/index'
import { FGI_TABLE, type FunctionalGroup } from '../../data/organic/fgiTable'
import { SYNTHESIS_PROBLEMS } from '../../data/organic/synthesisProblems'
import { generatePredictProductProblem, shuffleChoices } from '../../utils/predictProductPractice'
import { generateCrossCouplingProblem } from '../../utils/crossCouplingPractice'
import { generateLipidProblem, makeDistractors, LIPID_CLASS_LABELS } from '../../utils/lipidPractice'
import { generateNucleicAcidProblem } from '../../utils/nucleicAcidPractice'
import { generateRankingProblem } from '../../utils/acidityRankingPractice'
import {
  generateChairProblem, generateNewmanProblem, generateHybridizationProblem,
  generateAromaticityProblem, generateRSProblem, generateEZProblem,
  generateStereoisomerProblem, generateConformationalProblem, generateCurvedArrowProblem,
  generatePolymerizationProblem, generateConjugatedDieneProblem, generateFormalChargeProblem,
  generateResonanceProblem, generateMostAcidicHProblem, generateRetroProblem,
  generateSynthesisOrderProblem, generateAminoAcidPIProblem,
  generateIRProblem, generateNMRProblem, generateMSProblem,
} from '../../utils/organicTestGenerators'
import { usePreferencesStore } from '../../stores/preferencesStore'
import type { GeneratedTest, TestQuestion } from './testTypes'

// ── Topic definitions ─────────────────────────────────────────────────────────

type TopicKind  = 'molar' | 'sigfig' | 'empirical' | 'conversion' | 'atomic' | 'lewis' | 'lewis_draw' | 'vsepr' | 'vsepr_draw' | 'sigma_pi' | 'stoich' | 'redox' | 'perc_comp' | 'gas_stoich' | 'sol_stoich' | 'balancing' | 'calorimetry' | 'enthalpy' | 'hess' | 'bond_enthalpy' | 'heat_transfer' | 'vdw' | 'ideal_gas' | 'ecell' | 'rxn_pred' | 'dilution' | 'conc' | 'clausius_clapeyron' | 'heating_curve' | 'phase_diagram' | 'reaction_profile'
  | 'rate_law' | 'arrhenius' | 'integrated_rate'
  | 'keq_expr' | 'q_vs_k' | 'ice_table' | 'kp_kc'
  | 'ph_calc' | 'ka_kb' | 'weak_acid' | 'weak_base' | 'salt_ph' | 'polyprotic'
  | 'buffer_ph' | 'ksp' | 'ksp_rev' | 'precipitation'
  | 'entropy' | 'spontaneity' | 'gibbs' | 'gibbs_k' | 'crossover_t'
  | 'triangle' | 'faraday' | 'conc_cell'
  | 'nuclear_decay' | 'nuclear_halflife' | 'binding_energy' | 'nuclear_dating'
  | 'hydrocarbon' | 'isomer' | 'organic_naming' | 'func_group' | 'organic_rxn' | 'mechanism_id'
  | 'mechanism_identify' | 'mechanism_product' | 'mechanism_reagent' | 'mechanism_regio'
  | 'transform_drill' | 'synthesis_fillin' | 'predict_product'
  | 'chair' | 'newman' | 'hybridization' | 'aromaticity' | 'rs_assignment' | 'ez_assignment'
  | 'stereoisomer' | 'conformational' | 'curved_arrows' | 'polymerization' | 'conjugated_diene'
  | 'formal_charge_org' | 'resonance' | 'most_acidic_h' | 'retro_disconn' | 'synthesis_order'
  | 'amino_acid_pi' | 'acidity_ranking' | 'cross_coupling' | 'lipid_id' | 'nucleic_acid'
  | 'ir_interp' | 'nmr_interp' | 'ms_interp'
type TopicGroup = 'core' | 'atomic_molecular' | 'structures' | 'molar_solutions' | 'stoichiometry' | 'gases' | 'redox' | 'thermochemistry'
  | 'kinetics' | 'equilibrium' | 'acid_base' | 'buffers_ksp' | 'thermo_dynamics' | 'nuclear' | 'organic' | 'spectroscopy'

const GROUP_LABELS: Record<TopicGroup, string> = {
  core:             'Core Skills',
  atomic_molecular: 'Atomic Structure',
  structures:       'Structures',
  molar_solutions:  'Molar & Solutions',
  stoichiometry:    'Stoichiometry',
  gases:            'Gas Laws',
  redox:            'Redox & Electrochemistry',
  thermochemistry:  'Thermochemistry',
  kinetics:         'Kinetics',
  equilibrium:      'Chemical Equilibrium',
  acid_base:        'Acid-Base Chemistry',
  buffers_ksp:      'Buffers & Ksp',
  thermo_dynamics:  'Thermodynamics',
  nuclear:          'Nuclear Chemistry',
  organic:          'Organic Chemistry',
  spectroscopy:     'Spectroscopy',
}
const GROUP_ORDER: TopicGroup[] = [
  'core', 'atomic_molecular', 'structures', 'molar_solutions', 'stoichiometry', 'gases', 'redox', 'thermochemistry',
  'kinetics', 'equilibrium', 'acid_base', 'buffers_ksp', 'thermo_dynamics', 'nuclear', 'organic', 'spectroscopy',
]

interface TopicDef {
  id:              string
  kind:            TopicKind
  group:           TopicGroup
  label:           string
  formula:         string
  registryId?:     string   // topic ID in topicRegistry.ts for visibility filtering
  molarType?:      MolarCalcType
  stoichType?:     StoichProblemType
  redoxType?:      RedoxSubtype
  percCompType?:   PercCompType
  gasStandard?:    GasStandard
  solStoichType?:  SolStoichType
  balDifficulty?:  Difficulty
  ecellType?:      EcellSubtype
  rxnSubtype?:     RxnSubtype
  dilutionSubtype?: DilutionSubtype
  concSubtype?:    ConcSubtype
  profileSubtype?: ProfileSubtype
}

const ALL_TOPICS: TopicDef[] = [
  { id: 'sigfig',     kind: 'sigfig',     group: 'core',             label: 'Significant Figures',    formula: 'sf',                   registryId: 'sig-figs'           },
  { id: 'conversion', kind: 'conversion', group: 'core',             label: 'Unit Conversions',        formula: 'g↔kg, L↔mL, °C↔K',   registryId: 'unit-conversions'   },
  { id: 'empirical',  kind: 'empirical',  group: 'core',             label: 'Empirical Formula',       formula: '% → EF',              registryId: 'empirical-formula'  },
  { id: 'atomic',     kind: 'atomic',     group: 'atomic_molecular', label: 'Atomic Structure',        formula: 'e⁻ config, QN, Bohr', registryId: 'electron-configuration' },
  { id: 'lewis',      kind: 'lewis',      group: 'structures',       label: 'Lewis Structure',         formula: 'valence e⁻, geometry', registryId: 'lewis-structures'   },
  { id: 'lewis-draw', kind: 'lewis_draw', group: 'structures',       label: 'Lewis Draw',              formula: 'draw bonds & lone pairs', registryId: 'lewis-structures' },
  { id: 'vsepr',      kind: 'vsepr',      group: 'structures',       label: 'VSEPR',                   formula: 'geometry, hybrid.',    registryId: 'vsepr'              },
  { id: 'vsepr-draw', kind: 'vsepr_draw', group: 'structures',       label: 'VSEPR Draw',              formula: '3D structure drawing', registryId: 'vsepr'              },
  { id: 'sigma-pi',   kind: 'sigma_pi',   group: 'structures',       label: 'σ / π Bonds',             formula: 'σ, π count',           registryId: 'sigma-pi'           },
  { id: 'moles',      kind: 'molar',      group: 'molar_solutions',  label: 'Moles',                   formula: 'n = m/M',              molarType: 'moles',    registryId: 'moles-calc'       },
  { id: 'molarity',   kind: 'molar',      group: 'molar_solutions',  label: 'Molarity',                formula: 'C = n/V',              molarType: 'molarity', registryId: 'molarity'         },
  { id: 'molality',   kind: 'molar',      group: 'molar_solutions',  label: 'Molality',                formula: 'b = n/m',              molarType: 'molality', registryId: 'molality'         },
  { id: 'bpe',        kind: 'molar',      group: 'molar_solutions',  label: 'Boiling Pt Elevation',    formula: 'ΔTb = i·Kb·b',         molarType: 'bpe',      registryId: 'colligative-bpe'  },
  { id: 'fpd',        kind: 'molar',      group: 'molar_solutions',  label: 'Freezing Pt Depression',  formula: 'ΔTf = i·Kf·b',         molarType: 'fpd',      registryId: 'colligative-fpd'  },
  { id: 'perc-comp',  kind: 'perc_comp',  group: 'molar_solutions',  label: '% Composition',           formula: '% mass',               registryId: 'percent-comp'       },
  { id: 'stoich-mr',  kind: 'stoich',     group: 'stoichiometry',    label: 'Mole Ratios',             formula: 'n₁/n₂',                stoichType: 'mole_ratio',        registryId: 'stoich-calc'        },
  { id: 'stoich-mm',  kind: 'stoich',     group: 'stoichiometry',    label: 'Mass-to-Mass',            formula: 'g → mol → g',           stoichType: 'mass_to_mass',      registryId: 'stoich-calc'        },
  { id: 'stoich-lr',  kind: 'stoich',     group: 'stoichiometry',    label: 'Limiting Reagent',        formula: 'LR',                    stoichType: 'limiting_reagent',  registryId: 'limiting-reagent'   },
  { id: 'stoich-ty',  kind: 'stoich',     group: 'stoichiometry',    label: 'Theoretical Yield',       formula: 'TY (g)',                stoichType: 'theoretical_yield', registryId: 'theoretical-yield'  },
  { id: 'stoich-py',  kind: 'stoich',     group: 'stoichiometry',    label: 'Percent Yield',           formula: '% yield',               stoichType: 'percent_yield',     registryId: 'percent-yield'      },
  { id: 'gas-stp',    kind: 'gas_stoich', group: 'stoichiometry',    label: 'Gas Stoich (STP)',         formula: 'L → mol @ STP',         gasStandard: 'STP',              registryId: 'gas-stoich-topic'   },
  { id: 'gas-satp',   kind: 'gas_stoich', group: 'stoichiometry',    label: 'Gas Stoich (SATP)',        formula: 'L → mol @ SATP',        gasStandard: 'SATP',             registryId: 'gas-stoich-topic'   },
  { id: 'sol-stoich', kind: 'sol_stoich', group: 'stoichiometry',    label: 'Solution Stoich',          formula: 'M·V → mol → g',        registryId: 'solution-stoich'    },
  { id: 'bal-easy',   kind: 'balancing',  group: 'stoichiometry',    label: 'Balancing (Easy)',         formula: '_□ + _□ → _□',          balDifficulty: 'easy',           registryId: 'balancing'          },
  { id: 'bal-medium', kind: 'balancing',  group: 'stoichiometry',    label: 'Balancing (Medium)',       formula: '_□ + _□ → _□',          balDifficulty: 'medium',         registryId: 'balancing'          },
  { id: 'bal-hard',   kind: 'balancing',  group: 'stoichiometry',    label: 'Balancing (Hard)',         formula: '_□ + _□ → _□',          balDifficulty: 'hard',           registryId: 'balancing'          },
  { id: 'dilution-c2', kind: 'dilution', group: 'molar_solutions', label: 'Dilution (find C₂)',      formula: 'C₁V₁=C₂V₂', dilutionSubtype: 'find_c2', registryId: 'dilution' },
  { id: 'dilution-v2', kind: 'dilution', group: 'molar_solutions', label: 'Dilution (find V₂)',      formula: 'C₁V₁=C₂V₂', dilutionSubtype: 'find_v2', registryId: 'dilution' },
  { id: 'dilution-v1', kind: 'dilution', group: 'molar_solutions', label: 'Dilution (find V₁)',      formula: 'C₁V₁=C₂V₂', dilutionSubtype: 'find_v1', registryId: 'dilution' },
  { id: 'conc-pct-mol', kind: 'conc', group: 'molar_solutions', label: 'Conc: % → Molarity',       formula: '%m/v → M',  concSubtype: 'percent_to_molarity', registryId: 'conc-converter' },
  { id: 'conc-mol-pct', kind: 'conc', group: 'molar_solutions', label: 'Conc: Molarity → %',       formula: 'M → %m/v',  concSubtype: 'molarity_to_percent', registryId: 'conc-converter' },
  { id: 'conc-ppm',     kind: 'conc', group: 'molar_solutions', label: 'Conc: ppm → Molarity',     formula: 'ppm → M',   concSubtype: 'ppm_to_molarity',    registryId: 'conc-converter' },
  { id: 'conc-xf',      kind: 'conc', group: 'molar_solutions', label: 'Mole Fraction',            formula: 'χ = n/nₜ',  concSubtype: 'mole_fraction',      registryId: 'conc-converter' },
  { id: 'rxn-pred-occ',  kind: 'rxn_pred', group: 'stoichiometry', label: 'Reaction: Occurs?',          formula: 'ppt?',    rxnSubtype: 'predict_occurs',     registryId: 'rxn-predictor' },
  { id: 'rxn-pred-name', kind: 'rxn_pred', group: 'stoichiometry', label: 'Reaction: Name Precipitate', formula: 'ppt name', rxnSubtype: 'name_precipitate',  registryId: 'rxn-predictor' },
  { id: 'rxn-pred-sol',  kind: 'rxn_pred', group: 'stoichiometry', label: 'Reaction: Solubility',       formula: 'S/I/SS',  rxnSubtype: 'identify_solubility', registryId: 'rxn-predictor' },
  { id: 'ideal-gas', kind: 'ideal_gas', group: 'gases', label: 'Ideal Gas Law',  formula: 'PV=nRT',       registryId: 'ideal-gas-law'  },
  { id: 'vdw',       kind: 'vdw',       group: 'gases', label: 'Real Gas (vdW)', formula: 'van der Waals', registryId: 'van-der-waals'  },
  { id: 'redox-ox',  kind: 'redox', group: 'redox', label: 'Oxidation Numbers',          formula: 'ox. #',  redoxType: 'ox_state',      registryId: 'oxidation-states' },
  { id: 'redox-id',  kind: 'redox', group: 'redox', label: 'Identify Oxidised/Reduced',  formula: 'OA / RA', redoxType: 'identify_redox', registryId: 'oxidation-states' },
  { id: 'redox-chg', kind: 'redox', group: 'redox', label: 'Oxidation State Change',     formula: 'Δox',    redoxType: 'ox_change',     registryId: 'oxidation-states' },
  { id: 'ecell-e0',   kind: 'ecell', group: 'redox', label: 'Cell Potential (E°)',   formula: 'E°cell',       ecellType: 'calc_e0cell', registryId: 'ecell-nernst' },
  { id: 'ecell-spon', kind: 'ecell', group: 'redox', label: 'Spontaneity',           formula: 'ΔG / E°',      ecellType: 'spontaneity', registryId: 'ecell-nernst' },
  { id: 'ecell-nern', kind: 'ecell', group: 'redox', label: 'Nernst Equation',       formula: 'E=E°−RT/nF·lnQ', ecellType: 'nernst',  registryId: 'ecell-nernst' },
  { id: 'ecell-dg',   kind: 'ecell', group: 'redox', label: 'ΔG from E°',            formula: 'ΔG=−nFE',      ecellType: 'delta_g', registryId: 'ecell-nernst'  },
  { id: 'calorimetry',      kind: 'calorimetry',      group: 'thermochemistry', label: 'Calorimetry',        formula: 'q=mcΔT',    registryId: 'calorimetry'        },
  { id: 'enthalpy',         kind: 'enthalpy',         group: 'thermochemistry', label: 'Enthalpy of Reaction', formula: 'ΔHrxn',   registryId: 'enthalpy-rxn'      },
  { id: 'hess',             kind: 'hess',             group: 'thermochemistry', label: "Hess's Law",          formula: 'ΣΔH',     registryId: 'hess-law'          },
  { id: 'bond-enthalpy',    kind: 'bond_enthalpy',    group: 'thermochemistry', label: 'Bond Enthalpy',       formula: 'BE',      registryId: 'bond-enthalpy'     },
  { id: 'heat-transfer',    kind: 'heat_transfer',    group: 'thermochemistry', label: 'Heat Transfer',       formula: 'q₁=−q₂', registryId: 'heat-transfer'     },
  { id: 'clausius-clapeyron', kind: 'clausius_clapeyron', group: 'thermochemistry', label: 'Clausius-Clapeyron', formula: 'ln P₂/P₁', registryId: 'clausius-clapeyron' },
  { id: 'heating-curve',    kind: 'heating_curve',    group: 'thermochemistry', label: 'Heating Curve',       formula: 'q/T diagram', registryId: 'heating-curves' },
  { id: 'phase-diagram',    kind: 'phase_diagram',    group: 'thermochemistry', label: 'Phase Diagram',       formula: 'P-T diagram', registryId: 'phase-diagrams' },
  { id: 'rxn-profile-id',   kind: 'reaction_profile', group: 'thermochemistry', label: 'Reaction Profile: Exo/Endo', formula: 'sign ΔH', profileSubtype: 'identify',  registryId: 'reaction-profiles' },
  { id: 'rxn-profile-calc', kind: 'reaction_profile', group: 'thermochemistry', label: 'Reaction Profile: ΔH & Eₐ', formula: 'ΔH / Eₐ',                              registryId: 'reaction-profiles' },
  { id: 'rxn-profile-cat',  kind: 'reaction_profile', group: 'thermochemistry', label: 'Reaction Profile: Catalyst', formula: 'cat.',    profileSubtype: 'catalyst',   registryId: 'reaction-profiles' },

  // ── Kinetics ────────────────────────────────────────────────────────────────
  { id: 'rate-law',        kind: 'rate_law',       group: 'kinetics', label: 'Rate Law',            formula: 'rate=k[A]ⁿ',    registryId: 'rate-law'        },
  { id: 'arrhenius',       kind: 'arrhenius',      group: 'kinetics', label: 'Arrhenius Equation',  formula: 'k=Ae^(-Ea/RT)', registryId: 'arrhenius'       },
  { id: 'integrated-rate', kind: 'integrated_rate', group: 'kinetics', label: 'Integrated Rate Law', formula: '[A]t / t / t½', registryId: 'integrated-rate' },

  // ── Chemical Equilibrium ────────────────────────────────────────────────────
  { id: 'keq-expr',  kind: 'keq_expr', group: 'equilibrium', label: 'Keq Expression',  formula: 'Kc expr',     registryId: 'keq-expression' },
  { id: 'q-vs-k',   kind: 'q_vs_k',   group: 'equilibrium', label: 'Q vs K',           formula: 'Q⋛K',         registryId: 'q-vs-k'         },
  { id: 'ice-table', kind: 'ice_table', group: 'equilibrium', label: 'ICE Table',       formula: '[x]eq',       registryId: 'ice-table'      },
  { id: 'kp-kc',    kind: 'kp_kc',    group: 'equilibrium', label: 'Kp ↔ Kc',          formula: 'Kp=KcRTΔn',  registryId: 'kp-kc'          },

  // ── Acid-Base Chemistry ─────────────────────────────────────────────────────
  { id: 'ph-calc',    kind: 'ph_calc',   group: 'acid_base', label: 'pH Calculation',   formula: 'pH',          registryId: 'ph-calculator' },
  { id: 'ka-kb',      kind: 'ka_kb',     group: 'acid_base', label: 'Ka / Kb',          formula: 'Ka↔Kb',       registryId: 'ka-kb'         },
  { id: 'weak-acid',  kind: 'weak_acid', group: 'acid_base', label: 'Weak Acid pH',     formula: 'pH<7',        registryId: 'weak-acid'     },
  { id: 'weak-base',  kind: 'weak_base', group: 'acid_base', label: 'Weak Base pH',     formula: 'pH>7',        registryId: 'weak-base'     },
  { id: 'salt-ph',    kind: 'salt_ph',   group: 'acid_base', label: 'Salt pH',          formula: 'acidic/basic', registryId: 'salt-ph'      },
  { id: 'polyprotic', kind: 'polyprotic', group: 'acid_base', label: 'Polyprotic Acid', formula: 'Ka1,Ka2',     registryId: 'polyprotic'    },

  // ── Buffers & Ksp ───────────────────────────────────────────────────────────
  { id: 'buffer-ph',    kind: 'buffer_ph',    group: 'buffers_ksp', label: 'Buffer pH',         formula: 'H-H eq.',  registryId: 'buffer-ph'    },
  { id: 'ksp-sol',      kind: 'ksp',          group: 'buffers_ksp', label: 'Ksp → Solubility',  formula: 'Ksp→s',    registryId: 'ksp'          },
  { id: 'ksp-rev',      kind: 'ksp_rev',      group: 'buffers_ksp', label: 'Solubility → Ksp',  formula: 's→Ksp',    registryId: 'ksp'          },
  { id: 'precipitation', kind: 'precipitation', group: 'buffers_ksp', label: 'Precipitation',   formula: 'Q>Ksp?',   registryId: 'precipitation' },

  // ── Thermodynamics ──────────────────────────────────────────────────────────
  { id: 'entropy',     kind: 'entropy',     group: 'thermo_dynamics', label: 'Entropy (ΔS°)',    formula: 'ΔS°',       registryId: 'entropy-calc'       },
  { id: 'spontaneity', kind: 'spontaneity', group: 'thermo_dynamics', label: 'Spontaneity',      formula: 'ΔH/ΔS',     registryId: 'spontaneity'        },
  { id: 'gibbs',       kind: 'gibbs',       group: 'thermo_dynamics', label: 'Gibbs Energy',     formula: 'ΔG=ΔH-TΔS', registryId: 'gibbs-calc'         },
  { id: 'gibbs-k',     kind: 'gibbs_k',     group: 'thermo_dynamics', label: 'ΔG° ↔ K',         formula: 'ΔG=-RTlnK', registryId: 'gibbs-equilibrium'  },
  { id: 'crossover-t', kind: 'crossover_t', group: 'thermo_dynamics', label: 'Crossover T',      formula: 'T=ΔH/ΔS',   registryId: 'gibbs-temperature'  },
  { id: 'dg-ecell-k',  kind: 'triangle',    group: 'thermo_dynamics', label: 'ΔG°/E°cell/K',     formula: 'ΔG↔E↔K',    registryId: 'delta-g-ecell-k'    },
  { id: 'electrolysis', kind: 'faraday',    group: 'thermo_dynamics', label: 'Electrolysis',      formula: 'm=ItM/nF',   registryId: 'electrolysis'       },
  { id: 'conc-cell',   kind: 'conc_cell',   group: 'thermo_dynamics', label: 'Concentration Cell', formula: 'Nernst',   registryId: 'concentration-cell' },

  // ── Nuclear Chemistry ───────────────────────────────────────────────────────
  { id: 'nuclear-decay',   kind: 'nuclear_decay',   group: 'nuclear', label: 'Nuclear Decay',   formula: 'α/β/γ',   registryId: 'nuclear-decay'   },
  { id: 'nuclear-hl',      kind: 'nuclear_halflife', group: 'nuclear', label: 'Nuclear Half-Life', formula: 'N=N₀/2ⁿ', registryId: 'nuclear-half-life' },
  { id: 'binding-energy',  kind: 'binding_energy',  group: 'nuclear', label: 'Binding Energy',  formula: 'BE/A',    registryId: 'binding-energy'  },
  { id: 'nuclear-dating',  kind: 'nuclear_dating',  group: 'nuclear', label: 'Radiocarbon Dating', formula: 't age', registryId: 'nuclear-dating'  },

  // ── Organic Chemistry ───────────────────────────────────────────────────────
  { id: 'hydrocarbon',    kind: 'hydrocarbon',    group: 'organic', label: 'Hydrocarbons',        formula: 'CₙH…',    registryId: 'alkanes-alkenes'     },
  { id: 'isomer',         kind: 'isomer',         group: 'organic', label: 'Isomers',             formula: 'same formula?', registryId: 'isomers'      },
  { id: 'organic-naming', kind: 'organic_naming', group: 'organic', label: 'Organic Naming',      formula: 'IUPAC',   registryId: 'organic-naming'      },
  { id: 'func-group',     kind: 'func_group',     group: 'organic', label: 'Functional Groups',   formula: '-OH, C=O', registryId: 'functional-group-id' },
  { id: 'organic-rxn',    kind: 'organic_rxn',    group: 'organic', label: 'Organic Reactions',   formula: 'rxn type', registryId: 'organic-reactions'  },
  { id: 'mechanism-id',       kind: 'mechanism_id',       group: 'organic', label: 'Identify Mechanism',   formula: 'SN/E/Add', registryId: 'mech-sn-e'            },
  { id: 'mechanism-identify', kind: 'mechanism_identify', group: 'organic', label: 'Mechanism ID',         formula: 'SN?E?',    registryId: 'reaction-mechanisms'  },
  { id: 'mechanism-product',  kind: 'mechanism_product',  group: 'organic', label: 'Predict Product',      formula: 'A→?',      registryId: 'reaction-mechanisms'  },
  { id: 'mechanism-reagent',  kind: 'mechanism_reagent',  group: 'organic', label: 'Identify Reagent',     formula: '?→B',      registryId: 'reaction-mechanisms'  },
  { id: 'mechanism-regio',    kind: 'mechanism_regio',    group: 'organic', label: 'Regio/Stereo',         formula: 'M/AM',     registryId: 'reaction-mechanisms'  },
  { id: 'transform-drill',    kind: 'transform_drill',    group: 'organic', label: 'FGI Transform Drill',  formula: 'A→B',      registryId: 'organic-synthesis'    },
  { id: 'synthesis-fillin',   kind: 'synthesis_fillin',   group: 'organic', label: 'Synthesis Fill-In',    formula: '→?',       registryId: 'organic-synthesis'    },
  { id: 'predict-product',    kind: 'predict_product',    group: 'organic', label: 'Predict the Product',  formula: 'A+B→?',    registryId: 'predict-product'      },

  // ── Organic — additional ─────────────────────────────────────────────────────
  { id: 'chair',            kind: 'chair',            group: 'organic', label: 'Chair Conformations',       formula: 'ax/eq',        registryId: 'org-chair'            },
  { id: 'newman',           kind: 'newman',           group: 'organic', label: 'Newman Projections',        formula: 'anti/gauche',  registryId: 'org-newman'           },
  { id: 'hybridization',    kind: 'hybridization',    group: 'organic', label: 'Hybridization',             formula: 'sp/sp²/sp³',   registryId: 'organic-hybridization' },
  { id: 'aromaticity-cls',  kind: 'aromaticity',      group: 'organic', label: 'Aromaticity',               formula: '4n+2',         registryId: 'aromaticity'          },
  { id: 'rs-assignment',    kind: 'rs_assignment',    group: 'organic', label: 'R/S Assignment',            formula: 'CIP priority', registryId: 'rs-assignment'        },
  { id: 'ez-assignment',    kind: 'ez_assignment',    group: 'organic', label: 'E/Z Assignment',            formula: 'E vs Z',       registryId: 'ez-nomenclature'      },
  { id: 'stereoisomer-cls', kind: 'stereoisomer',     group: 'organic', label: 'Stereoisomer Classifier',   formula: 'enant/diast',  registryId: 'stereoisomer'         },
  { id: 'conformational',   kind: 'conformational',   group: 'organic', label: 'Conformational Analysis',   formula: 'strain/ΔE',    registryId: 'org-chair'            },
  { id: 'curved-arrows',    kind: 'curved_arrows',    group: 'organic', label: 'Curved Arrow Mechanism',    formula: 'e⁻ flow',      registryId: 'organic-curved-arrow' },
  { id: 'polymerization',   kind: 'polymerization',   group: 'organic', label: 'Polymerization Mechanisms', formula: 'add/cond',     registryId: 'polymers'             },
  { id: 'conjugated-diene', kind: 'conjugated_diene', group: 'organic', label: 'Conjugated Dienes',         formula: '1,2 vs 1,4',   registryId: 'conjugated-diene'     },
  { id: 'formal-charge-org', kind: 'formal_charge_org', group: 'organic', label: 'Formal Charge',          formula: 'FC',           registryId: 'organic-formal-charge' },
  { id: 'resonance-org',    kind: 'resonance',        group: 'organic', label: 'Resonance Structures',      formula: '↔',            registryId: 'organic-resonance'    },
  { id: 'most-acidic-h',    kind: 'most_acidic_h',    group: 'organic', label: 'Most Acidic H',             formula: 'lowest pKa',   registryId: 'org-acid-base'        },
  { id: 'retro-disconn',    kind: 'retro_disconn',    group: 'organic', label: 'Retro Disconnection',        formula: 'A ⇒ B',       registryId: 'organic-synthesis'    },
  { id: 'synthesis-order',  kind: 'synthesis_order',  group: 'organic', label: 'Synthesis Ordering',        formula: 'step order',   registryId: 'organic-synthesis'    },
  { id: 'amino-acid-pi',    kind: 'amino_acid_pi',    group: 'organic', label: 'Amino Acid pI / Zwitterion', formula: 'pI calc',    registryId: 'amino-acids'          },
  { id: 'acidity-ranking',  kind: 'acidity_ranking',  group: 'organic', label: 'Acidity Ranking',           formula: 'pKa order',    registryId: 'org-acid-base'        },
  { id: 'cross-coupling',   kind: 'cross_coupling',   group: 'organic', label: 'Cross-Coupling Reactions',  formula: 'Suzuki/Heck',  registryId: 'reaction-mechanisms'  },
  { id: 'lipid-id',         kind: 'lipid_id',         group: 'organic', label: 'Lipid Identification',      formula: 'fatty acid/trigl', registryId: 'lipids'           },
  { id: 'nucleic-acid',     kind: 'nucleic_acid',     group: 'organic', label: 'Nucleic Acids',             formula: 'A T G C U',    registryId: 'nucleic-acids'        },

  // ── Spectroscopy ─────────────────────────────────────────────────────────────
  { id: 'ir-interp',  kind: 'ir_interp',  group: 'spectroscopy', label: 'IR Interpretation',  formula: 'cm⁻¹ peaks', registryId: 'spectroscopy-tool' },
  { id: 'nmr-interp', kind: 'nmr_interp', group: 'spectroscopy', label: 'NMR Interpretation', formula: 'δ ppm',       registryId: 'spectroscopy-tool' },
  { id: 'ms-interp',  kind: 'ms_interp',  group: 'spectroscopy', label: 'MS Interpretation',  formula: 'm/z',         registryId: 'spectroscopy-tool' },
]

const STYLES: ProblemStyle[] = ['word', 'arithmetic']
function randomStyle(): ProblemStyle { return STYLES[Math.floor(Math.random() * 2)] }

// ── Checkbox button ───────────────────────────────────────────────────────────

function CheckBtn({
  checked, indeterminate, onClick, size = 'sm',
}: {
  checked: boolean; indeterminate?: boolean; onClick: () => void; size?: 'sm' | 'xs'
}) {
  const dim = size === 'xs' ? 'w-3.5 h-3.5' : 'w-4 h-4'
  const style = checked || indeterminate
    ? { background: 'color-mix(in srgb, var(--c-halogen) 20%, rgb(var(--color-raised)))', border: '1px solid color-mix(in srgb, var(--c-halogen) 50%, transparent)' }
    : { border: '1px solid rgba(var(--overlay),0.15)', background: 'transparent' }
  return (
    <button onClick={onClick} className={`${dim} rounded-sm border flex items-center justify-center transition-colors shrink-0`} style={style}>
      {checked     && <span className="font-mono text-[8px] leading-none" style={{ color: 'var(--c-halogen)' }}>✓</span>}
      {indeterminate && !checked && <span className="font-mono text-[9px] leading-none" style={{ color: 'var(--c-halogen)' }}>−</span>}
    </button>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

interface TopicRow { def: TopicDef; enabled: boolean; count: number }

interface Props {
  onGenerate: (test: GeneratedTest) => void
}

export default function TestBuilder({ onGenerate }: Props) {
  const { isTopicVisible } = usePreferencesStore()
  const [title, setTitle]           = useState('Chemistry Practice Test')
  const [generating, setGenerating] = useState(false)
  const [rows, setRows]             = useState<TopicRow[]>(
    ALL_TOPICS.map(def => ({ def, enabled: true, count: 5 }))
  )

  // Filter rows to only those whose registry topic is visible (or has no registry ID)
  const visibleRows = rows.filter(r => !r.def.registryId || isTopicVisible(r.def.registryId))

  // ── Selection helpers ──────────────────────────────────────────────────────

  function toggleRow(id: string) {
    setRows(prev => prev.map(r => r.def.id === id ? { ...r, enabled: !r.enabled } : r))
  }

  function toggleAll() {
    const allOn = visibleRows.every(r => r.enabled)
    const visibleIds = new Set(visibleRows.map(r => r.def.id))
    setRows(prev => prev.map(r => visibleIds.has(r.def.id) ? { ...r, enabled: !allOn } : r))
  }

  function toggleGroup(group: TopicGroup) {
    const groupRows = visibleRows.filter(r => r.def.group === group)
    const allOn = groupRows.every(r => r.enabled)
    const groupIds = new Set(groupRows.map(r => r.def.id))
    setRows(prev => prev.map(r => groupIds.has(r.def.id) ? { ...r, enabled: !allOn } : r))
  }

  function setCount(id: string, val: number) {
    setRows(prev => prev.map(r =>
      r.def.id === id ? { ...r, count: Math.max(1, Math.min(20, val)) } : r
    ))
  }

  const enabledRows    = visibleRows.filter(r => r.enabled)
  const totalQuestions = enabledRows.reduce((s, r) => s + r.count, 0)
  const allChecked     = visibleRows.every(r => r.enabled)
  const someChecked    = visibleRows.some(r => r.enabled)

  // ── Generation ────────────────────────────────────────────────────────────

  async function handleGenerate() {
    if (enabledRows.length === 0 || generating) return
    setGenerating(true)

    async function makeQuestion(row: TopicRow): Promise<Omit<TestQuestion, 'id'> | null> {
      const t = row.def
      if (t.kind === 'sigfig')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'sigfig',     data: generateSigFigProblem()     } }
      if (t.kind === 'empirical')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'empirical',  data: generateEmpiricalProblem()  } }
      if (t.kind === 'conversion')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'conversion', data: generateConversionProblem() } }
      if (t.kind === 'atomic')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'atomic',     data: generateAtomicProblem()     } }
      if (t.kind === 'lewis') {
        const data = await generateLewisProblem()
        return data ? { topic: t.label, topicFormula: t.formula, problem: { kind: 'lewis', data } } : null
      }
      if (t.kind === 'vsepr') {
        const data = await generateVseprProblem()
        return data ? { topic: t.label, topicFormula: t.formula, problem: { kind: 'vsepr', data } } : null
      }
      if (t.kind === 'lewis_draw') {
        const data = await generateLewisDrawProblem()
        return data ? { topic: t.label, topicFormula: t.formula, problem: { kind: 'lewis-draw', data } } : null
      }
      if (t.kind === 'vsepr_draw') {
        const data = await generateVseprDrawProblem()
        return data ? { topic: t.label, topicFormula: t.formula, problem: { kind: 'vsepr-draw', data } } : null
      }
      if (t.kind === 'stoich')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'stoich', data: generateStoichProblem(t.stoichType!) } }
      if (t.kind === 'redox')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'redox', data: generateRedoxProblem(t.redoxType!) } }
      if (t.kind === 'perc_comp')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'perc_comp', data: generatePercCompProblem(t.percCompType) } }
      if (t.kind === 'gas_stoich')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'gas_stoich', data: generateGasStoichProblem(t.gasStandard) } }
      if (t.kind === 'sol_stoich')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'sol_stoich', data: generateSolStoichProblem(t.solStoichType) } }
      if (t.kind === 'balancing')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'balancing', data: pickEquation(t.balDifficulty) } }
      if (t.kind === 'calorimetry')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'calorimetry', data: genCalorimetryProblem() } }
      if (t.kind === 'enthalpy')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'enthalpy', data: genEnthalpyProblem() } }
      if (t.kind === 'hess')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'hess', data: genHessProblem() } }
      if (t.kind === 'bond_enthalpy')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'bond_enthalpy', data: genBondEnthalpyProblem() } }
      if (t.kind === 'heat_transfer')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'heat_transfer', data: genHeatTransferProblem() } }
      if (t.kind === 'vdw')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'vdw', data: generateVdWProblem() } }
      if (t.kind === 'ideal_gas')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'ideal_gas', data: genGasProblem() } }
      if (t.kind === 'ecell')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'ecell', data: genEcellProblem(t.ecellType!) } }
      if (t.kind === 'rxn_pred')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'rxn_pred', data: genRxnPracticeProblem(t.rxnSubtype!) } }
      if (t.kind === 'dilution')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'dilution', data: genDilutionProblem(t.dilutionSubtype!) } }
      if (t.kind === 'conc')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'conc', data: genConcProblem(t.concSubtype!) } }
      if (t.kind === 'clausius_clapeyron')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'clausius_clapeyron', data: genClausiusClapeyronProblem() } }
      if (t.kind === 'sigma_pi') {
        const sigPi = await generateSigmaPiProblem()
        if (!sigPi) return null
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'sigma_pi', data: sigPi } }
      }
      if (t.kind === 'heating_curve')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'heating_curve', data: genHCProblem() } }
      if (t.kind === 'phase_diagram')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'phase_diagram', data: genPDProblem() } }
      if (t.kind === 'reaction_profile') {
        const sub: ProfileSubtype = t.profileSubtype
          ?? (['read_dh', 'read_ea', 'reverse_ea'] as ProfileSubtype[])[Math.floor(Math.random() * 3)]
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'reaction_profile', data: generateProfileProblem(sub) } }
      }

      // ── Generic numeric / classification kinds ─────────────────────────────
      function num(question: string, answer: number, unit: string, tolerance: number, steps?: string[]) {
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'numeric' as const, data: { question, answer, unit, tolerance, steps } } }
      }
      function cls(question: string, answer: string, options?: string[], steps?: string[]) {
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'classification' as const, data: { question, answer, options, steps } } }
      }

      if (t.kind === 'rate_law') {
        const p = generateRateLawProblem()
        return num(p.question, p.answer, 'reaction order', 0.1, p.steps)
      }
      if (t.kind === 'arrhenius') {
        const p = generateArrheniusProblem()
        return num(p.question, p.answer, p.answerUnit, 0.02, p.steps)
      }
      if (t.kind === 'integrated_rate') {
        const p = generateIntegratedProblem()
        return num(p.question, p.answer, p.answerUnit, 0.02, p.steps)
      }
      if (t.kind === 'keq_expr') {
        const p = generateKExpressionProblem()
        return cls(
          `Write the equilibrium constant expression (Kc) for:\n${p.reaction.equation}`,
          p.answer, undefined, p.steps
        )
      }
      if (t.kind === 'q_vs_k') {
        const p = generateQvsKProblem()
        const concStr = Object.entries(p.concentrations)
          .map(([sp, c]) => `[${sp}] = ${c.toFixed(2)} M`).join(', ')
        const dirLabel = p.direction === 'forward' ? 'shift right' : p.direction === 'reverse' ? 'shift left' : 'at equilibrium'
        return cls(
          `For the reaction:\n${p.reaction.equation}\nK = ${p.reaction.K.toPrecision(3)}\nConcentrations: ${concStr}\nIn which direction does the reaction shift to reach equilibrium?`,
          dirLabel, ['shift right', 'shift left', 'at equilibrium'], p.steps
        )
      }
      if (t.kind === 'ice_table') {
        const p = generateDynamicICEProblem(3)
        const species = [...p.reactants.map(s => s.formula), ...p.products.map(s => s.formula)]
        const prefilled = generateICEPrefilled(species, 3)
        return {
          topic: t.label, topicFormula: t.formula,
          problem: {
            kind: 'ice_table' as const,
            data: {
              equation:  p.equation,
              K:         p.K,
              kType:     p.kType,
              species,
              initial:   p.initial,
              solution:  p.solution,
              prefilled,
              steps:     p.solution.steps,
            },
          },
        }
      }
      if (t.kind === 'kp_kc') {
        const p = generateKpKcProblem()
        const from = p.mode === 'Kp' ? 'Kp' : 'Kc'
        const to = p.mode === 'Kp' ? 'Kc' : 'Kp'
        return num(
          `For the reaction:\n${p.reaction.equation}\nT = ${p.T} K, ${from} = ${p.reaction.K.toPrecision(3)}\nCalculate ${to}.`,
          p.answer, '', 0.02, p.steps
        )
      }
      if (t.kind === 'ph_calc') {
        const p = generatePhProblem()
        return num(p.question, p.correctPh, '', 0.02, p.steps)
      }
      if (t.kind === 'ka_kb') {
        const p = generateKaKbProblem()
        return num(p.question, p.correctValue, p.answerLabel, 0.02)
      }
      if (t.kind === 'weak_acid') {
        const p = generateWeakAcidProblem()
        return num(p.question, p.correctPh, '', 0.02, p.steps)
      }
      if (t.kind === 'weak_base') {
        const p = generateWeakBaseProblem()
        return num(p.question, p.correctPh, '', 0.02, p.steps)
      }
      if (t.kind === 'salt_ph') {
        const p = generateSaltPhProblem()
        return num(p.question, p.correctPh, '', 0.02, p.steps)
      }
      if (t.kind === 'polyprotic') {
        const p = generatePolyproticProblem()
        return num(p.question, p.correctPh, '', 0.02, p.steps)
      }
      if (t.kind === 'buffer_ph') {
        const p = generateBufferPhProblem()
        return num(p.prompt, p.answer, '', 0.02)
      }
      if (t.kind === 'ksp') {
        const p = generateKspToSolubilityProblem()
        return num(p.prompt, p.answer, 'M', 0.02)
      }
      if (t.kind === 'ksp_rev') {
        const p = generateSolubilityToKspProblem()
        return num(p.prompt, p.answer, '', 0.02)
      }
      if (t.kind === 'precipitation') {
        const p = generatePrecipitationProblem()
        return num(p.prompt, p.answer, '', 0.02)
      }
      if (t.kind === 'entropy') {
        const p = generateEntropyProblem()
        return num(`Calculate ΔS° for:\n${p.label}`, p.answer, 'J/(mol·K)', 0.02, p.steps)
      }
      if (t.kind === 'spontaneity') {
        const p = generateSpontaneityProblem()
        return cls(
          `ΔH° = ${p.deltaH_kJ > 0 ? '+' : ''}${p.deltaH_kJ} kJ/mol, ΔS° = ${p.deltaS_JperK > 0 ? '+' : ''}${p.deltaS_JperK} J/(mol·K)\nClassify the spontaneity of this reaction.`,
          p.answer, ['always', 'never', 'low-T', 'high-T'], [p.explanation]
        )
      }
      if (t.kind === 'gibbs') {
        const p = generateGibbsProblem()
        const question = p.method === 2 && p.deltaH_kJ !== undefined
          ? `ΔH° = ${p.deltaH_kJ > 0 ? '+' : ''}${p.deltaH_kJ} kJ/mol, ΔS° = ${p.deltaS_JperK} J/(mol·K), T = ${p.T} K\nCalculate ΔG° (in kJ/mol).`
          : `Calculate ΔG° for:\n${p.label}`
        return num(question, p.answer, 'kJ/mol', 0.02, p.steps)
      }
      if (t.kind === 'gibbs_k') {
        const p = generateGibbsKProblem()
        const question = p.direction === 'deltaG-to-K' && p.deltaG_kJ !== undefined
          ? `ΔG° = ${p.deltaG_kJ > 0 ? '+' : ''}${p.deltaG_kJ} kJ/mol at T = ${p.T} K\nCalculate the equilibrium constant K.`
          : `K = ${p.K?.toPrecision(3)} at T = ${p.T} K\nCalculate ΔG° (in kJ/mol).`
        return num(question, p.answer, p.direction === 'deltaG-to-K' ? '' : 'kJ/mol', 0.02, p.steps)
      }
      if (t.kind === 'crossover_t') {
        const p = generateCrossoverTProblem()
        return num(
          `ΔH° = ${p.deltaH_kJ > 0 ? '+' : ''}${p.deltaH_kJ} kJ/mol, ΔS° = ${p.deltaS_JperK > 0 ? '+' : ''}${p.deltaS_JperK} J/(mol·K)\nAt what temperature (in K) does spontaneity change?`,
          p.answer, 'K', 0.02, p.steps
        )
      }
      if (t.kind === 'triangle') {
        const p = genTriangleProblem('random')
        return num(p.question, p.answer, p.unit, 0.02, p.steps)
      }
      if (t.kind === 'faraday') {
        const p = genFaradayProblem('random')
        return num(p.question, p.answer, p.unit, 0.02, p.steps)
      }
      if (t.kind === 'conc_cell') {
        const p = genConcCellProblem()
        return num(p.question, p.answer, 'V', 0.02, p.steps)
      }
      if (t.kind === 'nuclear_decay') {
        const p = generateDecayProblem()
        const q = `${p.parentSymbol} (Z=${p.parentZ}, A=${p.parentA}) undergoes ${p.decayType} decay.\nWhat is the mass number A of the daughter nuclide?`
        return num(q, p.answerA, '', 0.1, p.steps)
      }
      if (t.kind === 'nuclear_halflife') {
        const p = generateHalfLifeProblem()
        return num(p.question, p.answer, p.unit, 0.02, p.steps)
      }
      if (t.kind === 'binding_energy') {
        const p = generateBindingEnergyProblem()
        return num(p.question, p.answer, p.unit, 0.02, p.steps)
      }
      if (t.kind === 'nuclear_dating') {
        const p = generateDatingProblem()
        return num(p.question, p.answer, 'years', 0.02, p.steps)
      }
      if (t.kind === 'hydrocarbon') {
        const p = genHydrocarbonProblem()
        const steps = hydrocarbonSolutionSteps(p)
        return cls(
          `A compound has the formula C${p.C}H${p.H}.\nIs it an alkane, alkene, or alkyne?`,
          p.correctFamily, ['alkane', 'alkene', 'alkyne'], steps
        )
      }
      if (t.kind === 'isomer') {
        const p = genIsomerProblem()
        return cls(
          `Are ${p.formula1} and ${p.formula2} structural isomers?`,
          p.areIsomers ? 'yes' : 'no', ['yes', 'no'], [p.explanation]
        )
      }
      if (t.kind === 'organic_naming') {
        const p = genNamingProblem()
        return cls(`What is the IUPAC name of ${p.formula} (${p.family}, n=${p.n})?`, p.name)
      }
      if (t.kind === 'func_group') {
        const p = genFunctionalGroupProblem()
        return cls(
          `${p.description}\nIdentify the functional group.`,
          p.correctId, p.options
        )
      }
      if (t.kind === 'organic_rxn') {
        const p = genOrganicReactionProblem()
        return cls(
          `${p.scenario}\nWhat type of organic reaction is this?`,
          p.correctType, p.options, [p.explanation]
        )
      }
      if (t.kind === 'mechanism_id') {
        const p = generateMechanismProblem()
        return cls(
          `${p.scenario}\n\n${p.question}`,
          p.answer, p.choices, p.steps
        )
      }

      if (t.kind === 'mechanism_identify') {
        const candidates = ALL_REACTIONS.filter(r => r.reactionType)
        if (candidates.length === 0) return null
        const r = candidates[Math.floor(Math.random() * candidates.length)]
        const allTypes = [...new Set(ALL_REACTIONS.map(x => x.reactionType))]
        const wrongTypes = allTypes.filter(x => x !== r.reactionType)
        const options = [r.reactionType, ...wrongTypes.sort(() => Math.random() - 0.5).slice(0, 3)]
          .sort(() => Math.random() - 0.5)
        return cls(
          `Reactants: ${r.reactants}\nConditions: ${r.conditions}\nProduct: ${r.products}\n\nClassify the mechanism type.`,
          r.reactionType, options, [r.name + ': ' + r.summary]
        )
      }

      if (t.kind === 'mechanism_product') {
        const r = ALL_REACTIONS[Math.floor(Math.random() * ALL_REACTIONS.length)]
        return cls(
          `What is the major product when ${r.reactants} reacts under the following conditions?\nConditions: ${r.conditions}`,
          r.products, undefined,
          [r.name + ': ' + r.summary, ...(r.importantInfo ?? []).slice(0, 2)]
        )
      }

      if (t.kind === 'mechanism_reagent') {
        const r = ALL_REACTIONS[Math.floor(Math.random() * ALL_REACTIONS.length)]
        return cls(
          `What reagents/conditions convert ${r.reactants} to ${r.products}?`,
          r.conditions, undefined, [r.name + ': ' + r.summary]
        )
      }

      if (t.kind === 'mechanism_regio') {
        const regioRxns = ALL_REACTIONS.filter(r => r.regiochemistry || r.stereochemistry)
        if (regioRxns.length === 0) return null
        const r = regioRxns[Math.floor(Math.random() * regioRxns.length)]
        const aspect = r.regiochemistry ? 'regiochemistry' : 'stereochemistry'
        const correctAnswer = (r.regiochemistry ?? r.stereochemistry) as string
        const pool = aspect === 'regiochemistry'
          ? ['markovnikov', 'anti-markovnikov', 'regiospecific', 'no preference']
          : ['syn', 'anti', 'inversion', 'retention', 'racemization']
        const options = [correctAnswer, ...pool.filter(x => x !== correctAnswer).slice(0, 3)]
          .sort(() => Math.random() - 0.5)
        return cls(
          `For the reaction: ${r.reactants} → ${r.products}\nConditions: ${r.conditions}\n\nWhat is the ${aspect} of this reaction?`,
          correctAnswer, options, [r.name + ': ' + r.summary]
        )
      }

      if (t.kind === 'transform_drill') {
        const correct = FGI_TABLE[Math.floor(Math.random() * FGI_TABLE.length)]
        const FG_SHORT: Record<FunctionalGroup, string> = {
          alkane: 'Alkane', alkene: 'Alkene', alkyne: 'Alkyne', alkyl_halide: 'Alkyl Halide',
          alcohol: 'Alcohol', ether: 'Ether', epoxide: 'Epoxide', aldehyde: 'Aldehyde',
          ketone: 'Ketone', carboxylic_acid: 'Carboxylic Acid', ester: 'Ester', amide: 'Amide',
          amine: 'Amine', nitrile: 'Nitrile', aromatic: 'Aromatic',
        }
        const distractors = FGI_TABLE
          .filter(e => e.from === correct.from && e.reagents !== correct.reagents)
          .sort(() => Math.random() - 0.5).slice(0, 3)
        const options = [correct.reagents, ...distractors.map(d => d.reagents)].sort(() => Math.random() - 0.5)
        return cls(
          `What reagents convert a ${FG_SHORT[correct.from]} to a ${FG_SHORT[correct.to]} in one step?`,
          correct.reagents, options, correct.notes ? [correct.notes] : []
        )
      }

      if (t.kind === 'synthesis_fillin') {
        const prob = SYNTHESIS_PROBLEMS[Math.floor(Math.random() * SYNTHESIS_PROBLEMS.length)]
        const stepIdx = Math.floor(Math.random() * prob.steps.length)
        const step = prob.steps[stepIdx]
        const q = `Synthesis: ${prob.startingMaterial.label} → ${prob.target.label}\n(${prob.difficulty}${prob.steps.length > 1 ? `, Step ${stepIdx + 1} of ${prob.steps.length}` : ''})\n\nWhat reagent(s) are used?`
        return cls(q, step.reagents, undefined, undefined)
      }

      if (t.kind === 'predict_product') {
        const prob = generatePredictProductProblem()
        const choices = shuffleChoices(prob).map(c => c.label)
        const q = `Substrate: ${prob.substrate}\nReagent/Conditions: ${prob.reagent}${prob.conditions ? `\n${prob.conditions}` : ''}\n\nWhat is the major product?`
        return cls(q, prob.correctProduct.label, choices, [prob.hint, prob.explanation])
      }

      // ── New organic generators via organicTestGenerators.ts ──────────────────
      function orgText(p: { question: string; answer: string; options: string[]; explanation: string }) {
        return cls(p.question, p.answer, p.options, [p.explanation])
      }

      if (t.kind === 'chair')             return orgText(generateChairProblem())
      if (t.kind === 'newman')            return orgText(generateNewmanProblem())
      if (t.kind === 'hybridization')     return orgText(generateHybridizationProblem())
      if (t.kind === 'aromaticity')       return orgText(generateAromaticityProblem())
      if (t.kind === 'rs_assignment')     return orgText(generateRSProblem())
      if (t.kind === 'ez_assignment')     return orgText(generateEZProblem())
      if (t.kind === 'stereoisomer')      return orgText(generateStereoisomerProblem())
      if (t.kind === 'conformational')    return orgText(generateConformationalProblem())
      if (t.kind === 'curved_arrows')     return orgText(generateCurvedArrowProblem())
      if (t.kind === 'polymerization')    return orgText(generatePolymerizationProblem())
      if (t.kind === 'conjugated_diene')  return orgText(generateConjugatedDieneProblem())
      if (t.kind === 'formal_charge_org') return orgText(generateFormalChargeProblem())
      if (t.kind === 'resonance')         return orgText(generateResonanceProblem())
      if (t.kind === 'most_acidic_h')     return orgText(generateMostAcidicHProblem())
      if (t.kind === 'retro_disconn')     return orgText(generateRetroProblem())
      if (t.kind === 'synthesis_order')   return orgText(generateSynthesisOrderProblem())
      if (t.kind === 'amino_acid_pi')     return orgText(generateAminoAcidPIProblem())
      if (t.kind === 'ir_interp')         return orgText(generateIRProblem())
      if (t.kind === 'nmr_interp')        return orgText(generateNMRProblem())
      if (t.kind === 'ms_interp')         return orgText(generateMSProblem())

      if (t.kind === 'acidity_ranking') {
        const p = generateRankingProblem()
        const mostAcidic = p.compounds.find(c => c.correctRank === 0)?.label ?? p.compounds[0].label
        const options = [...p.compounds.map(c => c.label)].sort(() => Math.random() - 0.5)
        return cls(
          `${p.prompt}\nWhich compound is the MOST acidic?`,
          mostAcidic, options, [p.explanation]
        )
      }

      if (t.kind === 'cross_coupling') {
        const p = generateCrossCouplingProblem()
        return cls(
          `${p.scenario}\n\n${p.question}`,
          p.answer, p.choices, [p.explanation]
        )
      }

      if (t.kind === 'lipid_id') {
        const p = generateLipidProblem()
        const distractors = makeDistractors(p.lipidClass, 3)
        const options = [LIPID_CLASS_LABELS[p.lipidClass], ...distractors.map(d => LIPID_CLASS_LABELS[d])]
          .sort(() => Math.random() - 0.5)
        return cls(
          p.scenario,
          LIPID_CLASS_LABELS[p.lipidClass], options, [p.explanation]
        )
      }

      if (t.kind === 'nucleic_acid') {
        const p = generateNucleicAcidProblem()
        return cls(
          `${p.scenario}\n\n${p.question}`,
          p.answer, p.choices, [p.explanation]
        )
      }

      return { topic: t.label, topicFormula: t.formula, problem: { kind: 'molar', data: generateMolarProblem(t.molarType!, randomStyle()) } }
    }

    try {
      const drafts = await Promise.all(
        enabledRows.flatMap(row => Array.from({ length: row.count }, () => makeQuestion(row)))
      )
      const questions = drafts
        .filter((q): q is NonNullable<typeof q> => q !== null)
        .map((q, i) => ({ ...q, id: i + 1 }))
      if (questions.length > 0) {
        onGenerate({ title: title.trim() || 'Chemistry Practice Test', questions, generatedAt: new Date() })
      }
    } finally {
      setGenerating(false)
    }
  }

  const hasApiTopics = enabledRows.some(r => r.def.kind === 'lewis' || r.def.kind === 'vsepr')

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8 max-w-2xl">

      {/* Title */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-secondary tracking-widest uppercase">Test Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="bg-raised border border-border rounded-sm px-3 py-2
                     font-sans text-base text-bright placeholder-dim
                     focus:outline-none focus:border-muted"
          placeholder="e.g. Chemistry Unit 3 Test"
        />
      </div>

      {/* Topics */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="font-mono text-xs text-secondary tracking-widest uppercase">Topics</label>
          <span className="font-mono text-xs text-dim">
            {totalQuestions} question{totalQuestions !== 1 ? 's' : ''} total
          </span>
        </div>

        <div className="rounded-sm border border-border overflow-hidden">

          {/* Table header with select-all */}
          <div className="grid grid-cols-[auto_1fr_auto] gap-x-4 items-center
                          px-4 py-2 bg-raised border-b border-border">
            <CheckBtn
              checked={allChecked}
              indeterminate={!allChecked && someChecked}
              onClick={toggleAll}
            />
            <span className="font-mono text-xs text-secondary tracking-widest uppercase">Topic</span>
            <span className="font-mono text-xs text-secondary tracking-widest uppercase w-20 text-right">Questions</span>
          </div>

          {/* Grouped rows */}
          {GROUP_ORDER.map(group => {
            const groupRows = visibleRows.filter(r => r.def.group === group)
            if (groupRows.length === 0) return null
            const allOn  = groupRows.every(r => r.enabled)
            const someOn = groupRows.some(r => r.enabled)
            return (
              <div key={group}>
                {/* Group header */}
                <div
                  className="grid grid-cols-[auto_1fr_auto] gap-x-4 items-center
                             px-4 py-1.5 border-b border-border"
                  style={{ background: 'color-mix(in srgb, rgb(var(--color-border)) 60%, rgb(var(--color-surface)))' }}
                >
                  <CheckBtn
                    checked={allOn}
                    indeterminate={!allOn && someOn}
                    onClick={() => toggleGroup(group)}
                    size="xs"
                  />
                  <span className="font-mono text-xs tracking-widest uppercase"
                    style={{ color: 'color-mix(in srgb, var(--c-halogen) 70%, rgba(var(--overlay),0.4))' }}>
                    {GROUP_LABELS[group]}
                  </span>
                  <span className="font-mono text-xs text-secondary w-20 text-right">
                    {groupRows.filter(r => r.enabled).reduce((s, r) => s + r.count, 0)} / {groupRows.reduce((s, r) => s + r.count, 0)}
                  </span>
                </div>

                {/* Topic rows — collapse when group is fully unchecked */}
                <AnimatePresence initial={false}>
                  {someOn && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      {groupRows.map((row) => (
                        <div
                          key={row.def.id}
                          className={`grid grid-cols-[auto_1fr_auto] gap-x-4 items-center
                                      px-4 py-3 border-b border-border transition-opacity bg-surface
                                      ${row.enabled ? '' : 'opacity-40'}`}
                        >
                          {/* Checkbox */}
                          <CheckBtn checked={row.enabled} onClick={() => toggleRow(row.def.id)} />

                          {/* Label */}
                          <div className="flex flex-col gap-0.5 min-w-0 pl-1">
                            <span className="font-sans text-sm text-primary">{row.def.label}</span>
                            <span className="font-mono text-xs text-secondary">{row.def.formula}</span>
                          </div>

                          {/* Count stepper */}
                          <div className={`flex items-center gap-1 w-20 justify-end shrink-0 ${!row.enabled ? 'pointer-events-none' : ''}`}>
                            <button
                              onClick={() => setCount(row.def.id, row.count - 1)}
                              disabled={!row.enabled || row.count <= 1}
                              className="w-6 h-6 rounded-sm border border-border font-mono text-sm text-dim
                                         hover:text-primary hover:border-muted transition-colors
                                         disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                            >−</button>
                            <span className="font-mono text-sm text-primary w-5 text-center">{row.count}</span>
                            <button
                              onClick={() => setCount(row.def.id, row.count + 1)}
                              disabled={!row.enabled || row.count >= 20}
                              className="w-6 h-6 rounded-sm border border-border font-mono text-sm text-dim
                                         hover:text-primary hover:border-muted transition-colors
                                         disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                            >+</button>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        <p className="font-mono text-xs text-secondary">
          Word problems and arithmetic are mixed automatically.
          {hasApiTopics && ' Lewis / VSEPR questions are fetched from the server.'}
        </p>
      </div>

      {/* Generate */}
      <motion.button
        onClick={handleGenerate}
        disabled={enabledRows.length === 0 || generating}
        whileTap={{ scale: 0.98 }}
        className="self-start px-6 py-2.5 rounded-sm font-sans text-sm font-semibold
                   transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
          border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
          color: 'var(--c-halogen)',
        }}
      >
        {generating ? 'Generating…' : `Generate Test (${totalQuestions} questions)`}
      </motion.button>
    </div>
  )
}
