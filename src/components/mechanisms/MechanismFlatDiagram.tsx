import { Fragment } from 'react'
import type { ReactionDef } from '../../data/mechanisms/types'
import MechanismFrameInline from './MechanismFrameInline'

// ── Inter-step arrow with optional reagent labels ─────────────────────────────

function InterStepArrow({ reagents }: { reagents?: { label: string }[] }) {
  return (
    <div className="flex flex-col items-center gap-1 shrink-0 px-1">
      {reagents && reagents.length > 0 && (
        <div className="flex flex-col items-center gap-0.5 max-w-[80px]">
          {reagents.map((r, i) => (
            <span key={i} className="font-mono text-[10px] text-secondary leading-tight text-center">
              {r.label}
            </span>
          ))}
        </div>
      )}
      <svg viewBox="0 0 80 12" width={80} height={12} style={{ display: 'block' }}>
        <line x1={2} y1={6} x2={68} y2={6} stroke="rgba(var(--overlay),0.5)" strokeWidth={1.5} />
        <polygon points="68,2 78,6 68,10" fill="rgba(var(--overlay),0.5)" />
      </svg>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

interface Props {
  reaction: ReactionDef
  /** Show shortLabel below each frame. Default true. */
  showLabels?: boolean
  /** Show curved electron-flow arrows on each frame. Default true. */
  showArrows?: boolean
  /** Width per frame in px. Default 220. */
  frameWidth?: number
  /** Height per frame in px. Default 150. */
  frameHeight?: number
}

export default function MechanismFlatDiagram({
  reaction,
  showLabels = true,
  showArrows = true,
  frameWidth = 220,
  frameHeight = 150,
}: Props) {
  const frames = reaction.frames ?? []

  if (frames.length === 0) {
    return (
      <p className="font-mono text-xs text-dim text-center py-2">
        {reaction.reactants} → {reaction.products}
      </p>
    )
  }

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex items-center gap-0 min-w-max">
        {frames.map((frame, i) => (
          <Fragment key={i}>
            {/* Frame */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className="rounded-sm border border-border overflow-hidden"
                style={{ background: 'rgb(var(--color-surface))' }}
              >
                <MechanismFrameInline
                  frame={frame}
                  width={frameWidth}
                  height={frameHeight}
                  showArrows={showArrows && i < frames.length - 1}
                />
              </div>
              {showLabels && (
                <span className="font-mono text-[10px] text-dim text-center max-w-[220px] leading-tight">
                  {i + 1}) {frame.shortLabel}
                </span>
              )}
            </div>

            {/* Arrow between frames */}
            {i < frames.length - 1 && (
              <InterStepArrow reagents={frame.interStepReagents} />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
