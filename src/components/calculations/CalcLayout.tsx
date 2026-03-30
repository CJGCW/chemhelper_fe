import type { ReactNode } from 'react'
import type { ExplanationContent } from './ExplanationModal'
import ExplanationModal from './ExplanationModal'
import { useState } from 'react'

interface Props {
  title: string
  subtitle: string
  explanation: ExplanationContent
  form: ReactNode
  animation: ReactNode | null
  result: ReactNode
  steps: ReactNode
  sigfigs: ReactNode
}

export default function CalcLayout({
  title, subtitle, explanation,
  form, animation, result, steps, sigfigs,
}: Props) {
  const [showExplanation, setShowExplanation] = useState(false)

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto flex flex-col gap-6">

      {/* Page header — title and "What is this" inline */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h2 className="font-sans font-semibold text-bright text-xl">{title}</h2>
          <button
            onClick={() => setShowExplanation(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm border
                       border-border font-sans text-xs text-secondary hover:text-primary
                       hover:border-muted transition-colors"
          >
            <span className="font-mono">?</span>
            <span>What is this</span>
          </button>
        </div>
        {subtitle && <p className="font-mono text-xs text-dim">{subtitle}</p>}
      </div>

      {/* Layout: single column when no animation, two-column otherwise */}
      {animation ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="flex flex-col gap-4">{form}</div>
          <div className="flex flex-col self-start">{animation}</div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 ">{form}</div>
      )}

      {/* Steps + sig figs — above result */}
      <div className="flex flex-col gap-4">
        {steps}
        {sigfigs}
      </div>

      {/* Result */}
      {result}

      <ExplanationModal
        content={explanation}
        open={showExplanation}
        onClose={() => setShowExplanation(false)}
      />
    </div>
  )
}
