import type { MolarProblem } from '../../utils/molarPractice'
import type { SigFigProblem } from '../../utils/sigfigPractice'
import type { EmpiricalProblem } from '../../utils/empiricalPractice'
import type { ConversionProblem } from '../../utils/conversionPractice'
import type { AtomicProblem } from '../../utils/atomicPractice'
import type { LewisProblem, VseprProblem, VseprDrawProblem, LewisDrawProblem } from '../../utils/lewisPractice'
import type { StoichProblem } from '../../utils/stoichiometryPractice'
import type { RedoxProblem } from '../../utils/redoxPractice'
import type { PercCompProblem } from '../../utils/percentCompositionPractice'
import type { GasStoichProblem } from '../../utils/gasStoichPractice'
import type { SolStoichProblem } from '../../utils/solutionStoichPractice'
import type { BalancingEquation } from '../../utils/balancingPractice'
import type { CalorimetryProblem } from '../../utils/calorimetryPractice'
import type { EnthalpyProblem } from '../../utils/enthalpyPractice'
import type { HessProblem } from '../../utils/hessLawPractice'
import type { BondEnthalpyProblem } from '../../utils/bondEnthalpyPractice'
import type { HeatTransferProblem } from '../../utils/heatTransferPractice'
import type { VdWProblem } from '../../utils/vanDerWaalsPractice'
import type { GasProblem } from '../../utils/idealGasPractice'
import type { EcellProblem } from '../../utils/ecellPractice'
import type { RxnPracticeProblem } from '../../utils/reactionPredictorPractice'
import type { DilutionProblem } from '../../utils/dilutionPractice'
import type { ConcProblem } from '../../utils/concentrationPractice'
import type { ClausiusClapeyronProblem } from '../../utils/clausiusClapeyronPractice'
import type { SigmaPiProblem } from '../../utils/sigmaPiPractice'
import type { HCProblem } from '../../utils/heatingCurveProblems'
import type { PDProblem } from '../../utils/phaseDiagramProblems'
import type { ProfileProblem } from '../../utils/reactionProfilePractice'
import type { ICESolution } from '../../chem/equilibrium'
import type { ICEPrefilled } from '../../utils/equilibriumPractice'

export type { SigFigProblem, EmpiricalProblem, ConversionProblem, AtomicProblem, LewisProblem, LewisDrawProblem, VseprProblem, VseprDrawProblem, StoichProblem, RedoxProblem, PercCompProblem, GasStoichProblem, SolStoichProblem, BalancingEquation, CalorimetryProblem, EnthalpyProblem, HessProblem, BondEnthalpyProblem, HeatTransferProblem, VdWProblem, GasProblem, EcellProblem, RxnPracticeProblem, DilutionProblem, ConcProblem, ClausiusClapeyronProblem, SigmaPiProblem, HCProblem, PDProblem, ProfileProblem }

export interface MolarTestProblem      { kind: 'molar';      data: MolarProblem      }
export interface SigFigTestProblem     { kind: 'sigfig';     data: SigFigProblem     }
export interface EmpiricalTestProblem  { kind: 'empirical';  data: EmpiricalProblem  }
export interface ConversionTestProblem { kind: 'conversion'; data: ConversionProblem }
export interface AtomicTestProblem     { kind: 'atomic';     data: AtomicProblem     }
export interface LewisTestProblem      { kind: 'lewis';      data: LewisProblem      }
export interface LewisDrawTestProblem  { kind: 'lewis-draw'; data: LewisDrawProblem  }
export interface VseprTestProblem      { kind: 'vsepr';      data: VseprProblem      }
export interface VseprDrawTestProblem  { kind: 'vsepr-draw'; data: VseprDrawProblem  }
export interface StoichTestProblem     { kind: 'stoich';     data: StoichProblem     }
export interface RedoxTestProblem      { kind: 'redox';      data: RedoxProblem      }
export interface PercCompTestProblem   { kind: 'perc_comp';  data: PercCompProblem   }
export interface GasStoichTestProblem  { kind: 'gas_stoich'; data: GasStoichProblem  }
export interface SolStoichTestProblem  { kind: 'sol_stoich'; data: SolStoichProblem  }
export interface BalancingTestProblem    { kind: 'balancing';    data: BalancingEquation  }
export interface CalorimetryTestProblem { kind: 'calorimetry'; data: CalorimetryProblem }
export interface EnthalpyTestProblem   { kind: 'enthalpy';    data: EnthalpyProblem   }
export interface HessTestProblem            { kind: 'hess';         data: HessProblem            }
export interface BondEnthalpyTestProblem    { kind: 'bond_enthalpy';   data: BondEnthalpyProblem   }
export interface HeatTransferTestProblem   { kind: 'heat_transfer';   data: HeatTransferProblem   }
export interface VdWTestProblem            { kind: 'vdw';             data: VdWProblem             }
export interface IdealGasTestProblem       { kind: 'ideal_gas';       data: GasProblem             }
export interface EcellTestProblem          { kind: 'ecell';           data: EcellProblem           }
export interface RxnPredTestProblem        { kind: 'rxn_pred';        data: RxnPracticeProblem     }
export interface DilutionTestProblem       { kind: 'dilution';        data: DilutionProblem        }
export interface ConcTestProblem                  { kind: 'conc';              data: ConcProblem                  }
export interface ClausiusClapeyronTestProblem     { kind: 'clausius_clapeyron'; data: ClausiusClapeyronProblem     }
export interface SigmaPiTestProblem               { kind: 'sigma_pi';           data: SigmaPiProblem               }
export interface HeatingCurveTestProblem          { kind: 'heating_curve';      data: HCProblem                    }
export interface PhaseDiagramTestProblem          { kind: 'phase_diagram';      data: PDProblem                    }
export interface ReactionProfileTestProblem       { kind: 'reaction_profile';   data: ProfileProblem               }

export interface ICETableTestProblem {
  kind: 'ice_table'
  data: {
    equation:  string
    K:         number
    kType:     'Kc' | 'Kp'
    species:   string[]
    initial:   Record<string, number>
    solution:  ICESolution
    prefilled: ICEPrefilled
    steps:     string[]
  }
}

export interface NumericTestProblem {
  kind: 'numeric'
  data: {
    question:  string
    answer:    number
    unit:      string
    tolerance: number   // relative (0.02 = 2%)
    steps?:    string[]
  }
}

export interface ClassificationTestProblem {
  kind: 'classification'
  data: {
    question: string
    answer:   string       // correct answer text (case-insensitive match)
    options?: string[]     // shown as hint chips in interactive + print
    steps?:   string[]
  }
}

export type TestProblem =
  | MolarTestProblem
  | SigFigTestProblem
  | EmpiricalTestProblem
  | ConversionTestProblem
  | AtomicTestProblem
  | LewisTestProblem
  | LewisDrawTestProblem
  | VseprTestProblem
  | VseprDrawTestProblem
  | StoichTestProblem
  | RedoxTestProblem
  | PercCompTestProblem
  | GasStoichTestProblem
  | SolStoichTestProblem
  | BalancingTestProblem
  | CalorimetryTestProblem
  | EnthalpyTestProblem
  | HessTestProblem
  | BondEnthalpyTestProblem
  | HeatTransferTestProblem
  | VdWTestProblem
  | IdealGasTestProblem
  | EcellTestProblem
  | RxnPredTestProblem
  | DilutionTestProblem
  | ConcTestProblem
  | ClausiusClapeyronTestProblem
  | SigmaPiTestProblem
  | HeatingCurveTestProblem
  | PhaseDiagramTestProblem
  | ReactionProfileTestProblem
  | ICETableTestProblem
  | NumericTestProblem
  | ClassificationTestProblem

export interface TestQuestion {
  id:           number
  topic:        string
  topicFormula: string
  problem:      TestProblem
}

export interface GeneratedTest {
  title:       string
  questions:   TestQuestion[]
  generatedAt: Date
}
