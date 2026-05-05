import { Fragment } from 'react'
import type { ReactionDef } from '../../data/mechanisms/types'
import MechanismFrameInline from './MechanismFrameInline'

// ── Print row for a single reaction ───────────────────────────────────────────

function MechanismPrintRow({ reaction }: { reaction: ReactionDef }) {
  const frames = reaction.frames ?? []
  return (
    <div className="mechanism-print-row">
      {/* Reaction header */}
      <div className="flex items-baseline justify-between gap-4 mb-1">
        <span className="font-sans font-semibold text-sm text-bright">{reaction.name}</span>
        <span className="font-mono text-xs text-dim shrink-0">{reaction.brownRef}</span>
      </div>
      <p className="font-mono text-xs text-secondary mb-2">{reaction.conditions}</p>

      {/* Frame sequence */}
      {frames.length > 0 ? (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {frames.map((frame, i) => (
            <Fragment key={i}>
              <div className="flex flex-col items-center shrink-0">
                <MechanismFrameInline
                  frame={frame}
                  width={180}
                  height={120}
                  showCaption
                  showArrows
                />
                <span className="font-mono text-[9px] text-dim mt-0.5">{frame.shortLabel}</span>
              </div>
              {i < frames.length - 1 && (
                <span className="font-mono text-base text-dim shrink-0">→</span>
              )}
            </Fragment>
          ))}
        </div>
      ) : (
        /* Legacy reactions: show the summary row */
        <p className="font-mono text-xs text-secondary italic">
          {reaction.reactants} → {reaction.products}
        </p>
      )}

      {/* Summary */}
      <p className="font-sans text-xs text-secondary leading-relaxed mt-1">{reaction.summary}</p>

      {/* Regio/stereo tags */}
      <div className="flex gap-2 mt-1">
        {reaction.regiochemistry && (
          <span className="font-mono text-[9px] px-1 rounded bg-blue-950/20 border border-blue-800/30 text-blue-400">
            {reaction.regiochemistry}
          </span>
        )}
        {reaction.stereochemistry && (
          <span className="font-mono text-[9px] px-1 rounded bg-orange-950/20 border border-orange-800/30 text-orange-400">
            {reaction.stereochemistry}
          </span>
        )}
        {reaction.intermediate && (
          <span className="font-mono text-[9px] px-1 rounded bg-purple-950/20 border border-purple-800/30 text-purple-400">
            via {reaction.intermediate}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

interface Props {
  reactions: ReactionDef[]
  title?: string
}

export default function MechanismPrintSheet({ reactions, title }: Props) {
  return (
    <div className="flex flex-col gap-0 font-sans">
      {title && (
        <h1 className="text-lg font-bold text-bright mb-4 pb-2 border-b border-border">{title}</h1>
      )}
      {reactions.map(reaction => (
        <MechanismPrintRow key={reaction.id} reaction={reaction} />
      ))}
    </div>
  )
}
