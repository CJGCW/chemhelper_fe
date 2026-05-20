import SpectrumViewer from '../spectral/SpectrumViewer'
import CompoundDisplay from '../shared/CompoundDisplay'
import type { VisualPayload, NuclearSpecies, RenderableSpeciesPayload } from './testTypes'

// ── Reaction display (reactants → conditions arrow → products) ─────────────

function SpeciesGroup({ species, size = 'sm' }: { species: RenderableSpeciesPayload[]; size?: 'sm' | 'md' }) {
  const dim = size === 'md' ? { w: 140, h: 100 } : { w: 110, h: 80 }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {species.map((s, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="relative">
            <CompoundDisplay smiles={s.smiles} label={s.label} width={dim.w} height={dim.h} showLonePairs={s.showLonePairs} />
            {s.catalyst && (
              <span className="absolute top-0 right-0 font-mono text-[9px] px-1 rounded-sm"
                style={{ background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))', color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}>
                cat.
              </span>
            )}
          </div>
          {i < species.length - 1 && <span className="font-sans text-sm text-secondary font-medium">+</span>}
        </div>
      ))}
    </div>
  )
}

function ReactionArrow({ conditions }: { conditions?: RenderableSpeciesPayload[] }) {
  return (
    <div className="flex flex-col items-center gap-1 shrink-0 px-1">
      {conditions && conditions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 max-w-[120px]">
          {conditions.map((s, i) => (
            <span key={i} className="font-mono text-[10px] text-secondary leading-tight">{s.label}</span>
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

// ── Nuclear equation display ────────────────────────────────────────────────

function NuclearAtomDisplay({ species }: { species: NuclearSpecies }) {
  return (
    <span className="inline-flex items-baseline gap-0.5 font-mono text-base">
      <span className="flex flex-col items-end text-[10px] leading-none mr-0.5">
        <span>{species.massNumber}</span>
        <span>{species.atomicNumber}</span>
      </span>
      <span className="text-lg font-semibold">{species.symbol}</span>
    </span>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

export default function QuestionVisual({ visual }: { visual: VisualPayload }) {
  switch (visual.kind) {
    case 'spectrum':
      return (
        <div className="my-3 pl-2 overflow-x-auto">
          {visual.title && (
            <p className="font-mono text-xs text-secondary mb-1">{visual.title}</p>
          )}
          <SpectrumViewer
            type={visual.spectrumType}
            peaks={visual.peaks}
            width={520}
            height={180}
          />
        </div>
      )

    case 'reaction':
      return (
        <div className="my-3 pl-2 flex flex-wrap items-center gap-2 overflow-x-auto">
          <SpeciesGroup species={visual.reactantSpecies} />
          <ReactionArrow conditions={visual.conditionSpecies} />
          {visual.productSpecies && visual.productSpecies.length > 0
            ? <SpeciesGroup species={visual.productSpecies} />
            : <span className="font-mono text-xl text-dim px-2">?</span>
          }
        </div>
      )

    case 'nuclearEquation':
      return (
        <div className="my-3 pl-2 flex items-center gap-3 flex-wrap">
          <NuclearAtomDisplay species={visual.parent} />
          <span className="font-mono text-base text-secondary">→</span>
          {visual.daughter
            ? <NuclearAtomDisplay species={visual.daughter} />
            : <span className="font-mono text-xl text-dim">?</span>
          }
          <span className="font-mono text-base text-secondary">+ ?</span>
        </div>
      )

    case 'compound-display':
      return (
        <div className="my-3 pl-2">
          <CompoundDisplay
            smiles={visual.smiles}
            label={visual.label}
            width={visual.width ?? 220}
            height={visual.height ?? 160}
          />
        </div>
      )
  }
}
