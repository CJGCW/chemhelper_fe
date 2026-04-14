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

export type { SigFigProblem, EmpiricalProblem, ConversionProblem, AtomicProblem, LewisProblem, LewisDrawProblem, VseprProblem, VseprDrawProblem, StoichProblem, RedoxProblem, PercCompProblem, GasStoichProblem, SolStoichProblem, BalancingEquation, CalorimetryProblem, EnthalpyProblem, HessProblem, BondEnthalpyProblem, HeatTransferProblem, VdWProblem }

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
