import WorkedExample from '../calculations/WorkedExample'
import { generateRedoxExample } from './RedoxPractice'
import RedoxPractice from './RedoxPractice'

export default function RedoxTool() {
  return (
    <div className="flex flex-col gap-5">
      <WorkedExample generate={generateRedoxExample} />
      <RedoxPractice />
    </div>
  )
}
