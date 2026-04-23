import WorkedExample from '../shared/WorkedExample'
import { generateReactionProfileExample } from './ReactionProfilePractice'
import EnergyDiagram from './EnergyDiagram'

export default function ReactionProfileTool() {
  return (
    <div className="flex flex-col gap-6">
      <WorkedExample generate={generateReactionProfileExample} />
      <EnergyDiagram />
    </div>
  )
}
