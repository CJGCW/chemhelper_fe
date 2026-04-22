import WorkedExample from '../calculations/WorkedExample'
import { generateGasStoichExample } from './GasStoichPractice'
import GasStoichPractice from './GasStoichPractice'

export default function GasStoichTool() {
  return (
    <div className="flex flex-col gap-6">
      <WorkedExample generate={generateGasStoichExample} />
      <GasStoichPractice />
    </div>
  )
}
