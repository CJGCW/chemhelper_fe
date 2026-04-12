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

export type { SigFigProblem, EmpiricalProblem, ConversionProblem, AtomicProblem, LewisProblem, LewisDrawProblem, VseprProblem, VseprDrawProblem, StoichProblem, RedoxProblem, PercCompProblem, GasStoichProblem, SolStoichProblem, BalancingEquation }

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
export interface BalancingTestProblem  { kind: 'balancing';  data: BalancingEquation }

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
