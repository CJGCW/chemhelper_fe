import type { MolarProblem } from '../../utils/molarPractice'
import type { SigFigProblem } from '../../utils/sigfigPractice'
import type { EmpiricalProblem } from '../../utils/empiricalPractice'
import type { ConversionProblem } from '../../utils/conversionPractice'
import type { AtomicProblem } from '../../utils/atomicPractice'
import type { LewisProblem, VseprProblem } from '../../utils/lewisPractice'
import type { StoichProblem } from '../../utils/stoichiometryPractice'

export type { SigFigProblem, EmpiricalProblem, ConversionProblem, AtomicProblem, LewisProblem, VseprProblem, StoichProblem }

export interface MolarTestProblem      { kind: 'molar';      data: MolarProblem      }
export interface SigFigTestProblem     { kind: 'sigfig';     data: SigFigProblem     }
export interface EmpiricalTestProblem  { kind: 'empirical';  data: EmpiricalProblem  }
export interface ConversionTestProblem { kind: 'conversion'; data: ConversionProblem }
export interface AtomicTestProblem     { kind: 'atomic';     data: AtomicProblem     }
export interface LewisTestProblem      { kind: 'lewis';      data: LewisProblem      }
export interface VseprTestProblem      { kind: 'vsepr';      data: VseprProblem      }
export interface StoichTestProblem     { kind: 'stoich';     data: StoichProblem     }

export type TestProblem =
  | MolarTestProblem
  | SigFigTestProblem
  | EmpiricalTestProblem
  | ConversionTestProblem
  | AtomicTestProblem
  | LewisTestProblem
  | VseprTestProblem
  | StoichTestProblem

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
