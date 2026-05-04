import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ReactionDef, ReactionType, Regiochemistry, Stereochemistry } from '../../data/mechanisms/types'
import MechanismPlayer from './MechanismPlayer'

interface Props {
  reaction: ReactionDef
  defaultExpanded?: boolean
}

// ── Badge color maps ───────────────────────────────────────────────────────────

const REACTION_TYPE_COLOR: Record<ReactionType, string> = {
  addition:      'var(--c-noble)',
  elimination:   'var(--c-halogen)',
  substitution:  'var(--c-alkali)',
  eas:           'var(--c-tm)',
  radical:       'var(--c-lanthanide)',
  reduction:     'var(--c-noble)',
  oxidation:     'var(--c-halogen)',
  condensation:  'var(--c-actinide)',
  pericyclic:    'var(--c-metalloid)',
  rearrangement: 'var(--c-tm)',
}

const STEREO_COLOR: Record<NonNullable<Stereochemistry>, string> = {
  syn:          'var(--c-noble)',
  retention:    'var(--c-noble)',
  anti:         'var(--c-halogen)',
  inversion:    'var(--c-halogen)',
  racemization: 'var(--c-tm)',
}

const REGIO_COLOR: Record<NonNullable<Regiochemistry>, string> = {
  'markovnikov':      'var(--c-alkali)',
  'anti-markovnikov': 'var(--c-noble)',
}

// ── Badge component ────────────────────────────────────────────────────────────

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span
      className="inline-flex px-2 py-0.5 rounded-sm font-mono text-[10px] tracking-wide uppercase"
      style={{
        background: `color-mix(in srgb, ${color} 12%, rgb(var(--color-raised)))`,
        border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
        color,
      }}
    >
      {text}
    </span>
  )
}

// ── MechanismCard ──────────────────────────────────────────────────────────────

export default function MechanismCard({ reaction, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div
      className="rounded-sm border border-border overflow-hidden"
      style={{ background: 'rgb(var(--color-raised))' }}
    >
      {/* Collapsed header — always visible */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface"
      >
        <motion.span
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          className="mt-0.5 shrink-0 font-mono text-sm text-dim"
        >
          ▶
        </motion.span>

        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          <span className="font-sans text-sm font-semibold text-bright">{reaction.name}</span>

          <div className="flex flex-wrap gap-2">
            <Badge text={reaction.reactionType} color={REACTION_TYPE_COLOR[reaction.reactionType]} />
            {reaction.regiochemistry && (
              <Badge text={reaction.regiochemistry} color={REGIO_COLOR[reaction.regiochemistry]} />
            )}
            {reaction.stereochemistry && (
              <Badge text={reaction.stereochemistry} color={STEREO_COLOR[reaction.stereochemistry]} />
            )}
            {reaction.intermediate && (
              <Badge text={`via ${reaction.intermediate}`} color="var(--c-tm)" />
            )}
          </div>

          <p className="font-sans text-sm text-secondary">{reaction.summary}</p>

          <p className="font-mono text-sm">
            <span className="text-primary">{reaction.reactants}</span>
            <span className="text-dim"> → </span>
            <span className="text-bright font-semibold">{reaction.products}</span>
          </p>
        </div>

        <span className="font-mono text-xs text-dim shrink-0 mt-0.5 whitespace-nowrap">
          {reaction.brownRef}
        </span>
      </button>

      {/* Expanded section */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            {/* Conditions */}
            <div className="px-4 py-3 border-t border-border">
              <p className="font-mono text-xs text-dim uppercase tracking-widest mb-1.5">Conditions</p>
              <p className="font-sans text-sm text-secondary">{reaction.conditions}</p>
            </div>

            {/* Key Points */}
            {reaction.importantInfo.length > 0 && (
              <div className="px-4 py-3 border-t border-border">
                <p className="font-mono text-xs text-dim uppercase tracking-widest mb-1.5">Key Points</p>
                <ul className="flex flex-col gap-1">
                  {reaction.importantInfo.map((info, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <span className="font-mono text-sm text-dim shrink-0 mt-0.5">•</span>
                      <span className="font-sans text-sm text-secondary leading-relaxed">{info}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mechanism animation player */}
            <div className="px-4 py-3 border-t border-border">
              <p className="font-mono text-xs text-dim uppercase tracking-widest mb-2">Mechanism</p>
              <MechanismPlayer reaction={reaction} />
            </div>

            {/* Metadata row */}
            {(reaction.rearrangementPossible || reaction.reversible || reaction.positionDirector || reaction.activatingEffect) && (
              <div className="px-4 py-2 border-t border-border flex flex-wrap gap-3 text-dim">
                {reaction.rearrangementPossible && (
                  <span className="font-mono text-xs">⚠ Rearrangement possible</span>
                )}
                {reaction.reversible && (
                  <span className="font-mono text-xs">↔ Reversible</span>
                )}
                {reaction.positionDirector && (
                  <span className="font-mono text-xs">
                    Director: {reaction.positionDirector === 'ortho_para' ? 'ortho/para' : 'meta'}
                  </span>
                )}
                {reaction.activatingEffect && (
                  <span className="font-mono text-xs">{reaction.activatingEffect.replace(/_/g, ' ')}</span>
                )}
              </div>
            )}

            {/* Related reactions */}
            {reaction.relatedReactions.length > 0 && (
              <div className="px-4 py-2 border-t border-border flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-dim">Related:</span>
                {reaction.relatedReactions.map(id => (
                  <span
                    key={id}
                    className="font-mono text-xs px-2 py-0.5 rounded-sm border border-border text-dim"
                  >
                    {id}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
