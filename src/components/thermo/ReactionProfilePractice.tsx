import React from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  generateProfileProblem,
  checkProfileAnswer,
  type ProfileSubtype,
  type ProfileProblem,
} from '../../utils/reactionProfilePractice'
import type { ExampleData } from '../shared/WorkedExample'

// ── Types ─────────────────────────────────────────────────────────────────────

type Selection = ProfileSubtype | 'random'

const TYPES: { id: Selection; label: string; formula: string }[] = [
  { id: 'random',     label: 'Random',          formula: '?'       },
  { id: 'identify',   label: 'Exo / Endo',      formula: 'sign ΔH' },
  { id: 'read_dh',    label: 'Read ΔH',         formula: 'ΔH'      },
  { id: 'read_ea',    label: 'Read Eₐ',         formula: 'Eₐ'      },
  { id: 'reverse_ea', label: 'Reverse Eₐ',      formula: 'Eₐ rev'  },
  { id: 'catalyst',   label: 'Catalyst Effect',  formula: 'cat.'    },
]

// Whether a subtype uses choice buttons instead of a text input
function usesButtons(p: ProfileProblem) {
  return p.subtype === 'identify' || p.subtype === 'catalyst'
}

const CHOICE_OPTIONS: Partial<Record<ProfileSubtype, string[]>> = {
  identify: ['Exothermic', 'Endothermic'],
  catalyst: ['Decreases', 'Unchanged', 'Increases'],
}

// ── Static energy diagram ─────────────────────────────────────────────────────

const W = 380, H = 185
const BASE_Y  = 148
const SCALE   = 0.28
const RX1 = 28, RX2 = 110
const PX1 = 268, PX2 = 352
const TSX = 190

function clamp(y: number) { return Math.max(14, Math.min(H - 16, y)) }

function ProfileDiagram({ problem }: { problem: ProfileProblem }) {
  const { dh, ea, reactantE, showValues } = problem
  const isExo = dh < 0
  const accent = isExo ? '#34d399' : '#f87171'

  const effEa   = Math.max(ea, dh > 0 ? dh + 10 : 0, 8)
  const rY      = BASE_Y
  const pY      = clamp(BASE_Y - dh * SCALE)
  const tsY     = clamp(BASE_Y - effEa * SCALE)
  const productE = reactantE + dh
  const tsE      = reactantE + ea

  const CP = 44
  const curve = `M ${RX2} ${rY} C ${RX2+CP} ${rY}, ${TSX-CP} ${tsY}, ${TSX} ${tsY} C ${TSX+CP} ${tsY}, ${PX1-CP} ${pY}, ${PX1} ${pY}`

  function ValLabel({ x, y, val }: { x: number; y: number; val: number }) {
    return (
      <text x={x} y={y + 4} textAnchor="end" fill="rgba(var(--overlay),0.75)"
        fontSize="11" fontFamily="monospace">
        {val} kJ/mol
      </text>
    )
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 185 }}>
      <text x={9} y={H / 2 + 4} fill="rgba(var(--overlay),0.25)" fontSize="9"
        textAnchor="middle" transform={`rotate(-90, 9, ${H / 2})`}>ENERGY</text>

      <line x1={RX1} y1={rY} x2={RX2} y2={rY}
        stroke="rgba(var(--overlay),0.7)" strokeWidth="2.5" strokeLinecap="round" />
      <text x={(RX1 + RX2) / 2} y={rY + 14}
        textAnchor="middle" fill="rgba(var(--overlay),0.5)" fontSize="11">Reactants</text>
      {showValues && <ValLabel x={RX1 - 4} y={rY} val={reactantE} />}

      <line x1={PX1} y1={pY} x2={PX2} y2={pY}
        stroke="rgba(var(--overlay),0.7)" strokeWidth="2.5" strokeLinecap="round" />
      <text x={(PX1 + PX2) / 2} y={pY + 14}
        textAnchor="middle" fill="rgba(var(--overlay),0.5)" fontSize="11">Products</text>
      {showValues && <ValLabel x={PX1 - 4} y={pY} val={productE} />}

      <line x1={TSX - 16} y1={tsY} x2={TSX + 16} y2={tsY}
        stroke="rgba(var(--overlay),0.22)" strokeWidth="1.5" strokeDasharray="4,3" />
      <text x={TSX} y={tsY - 8}
        textAnchor="middle" fill="rgba(var(--overlay),0.4)" fontSize="10">‡</text>
      {showValues && <ValLabel x={TSX - 20} y={tsY} val={tsE} />}

      <path d={curve} fill="none" stroke={accent}
        strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
    </svg>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function freshProblem(sel: Selection): ProfileProblem {
  const subtypes: ProfileSubtype[] = ['identify', 'read_dh', 'read_ea', 'reverse_ea', 'catalyst']
  const t: ProfileSubtype = sel === 'random'
    ? subtypes[Math.floor(Math.random() * subtypes.length)]
    : sel
  return generateProfileProblem(t)
}

function inputPlaceholder(p: ProfileProblem): string {
  return p.dh < 0 ? 'e.g. −200' : 'e.g. +150'
}

// ── Worked example export ─────────────────────────────────────────────────────

export function generateReactionProfileExample(): ExampleData {
  const t = (['read_dh', 'read_ea', 'reverse_ea'] as ProfileSubtype[])[
    Math.floor(Math.random() * 3)
  ]
  const p = generateProfileProblem(t)
  const productE = p.reactantE + p.dh
  const tsE      = p.reactantE + p.ea
  const scenarios: Record<string, string> = {
    read_dh:    `Energy diagram: Reactants = ${p.reactantE} kJ/mol, Products = ${productE} kJ/mol. Calculate ΔH.`,
    read_ea:    `Energy diagram: Reactants = ${p.reactantE} kJ/mol, Transition State = ${tsE} kJ/mol. Calculate Eₐ.`,
    reverse_ea: `Energy diagram: Reactants = ${p.reactantE} kJ/mol, Products = ${productE} kJ/mol, TS = ${tsE} kJ/mol. Calculate Eₐ for the reverse reaction.`,
  }
  const last = p.steps.length - 1
  return { scenario: scenarios[t], steps: p.steps.slice(0, last), result: p.steps[last] }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ReactionProfilePractice() {
  const [selected,  setSelected]  = useState<Selection>('random')
  const [problem,   setProblem]   = useState(() => freshProblem('random'))
  const [answer,    setAnswer]    = useState('')
  const [checked,   setChecked]   = useState(false)
  const [correct,   setCorrect]   = useState(false)
  const [showSteps, setShowSteps] = useState(false)
  const [score,     setScore]     = useState({ correct: 0, total: 0 })

  function nextProblem(sel: Selection = selected) {
    setProblem(freshProblem(sel))
    setAnswer('')
    setChecked(false)
    setShowSteps(false)
  }

  function handleTryAgain() {
    setAnswer('')
    setChecked(false)
    setCorrect(false)
    setShowSteps(false)
  }

  function handleTypeChange(sel: Selection) {
    setSelected(sel)
    setProblem(freshProblem(sel))
    setAnswer('')
    setChecked(false)
    setShowSteps(false)
    setScore({ correct: 0, total: 0 })
  }

  function submitAnswer(val: string) {
    if (checked) return
    const c = checkProfileAnswer(problem, val)
    setAnswer(val)
    setCorrect(c)
    setChecked(true)
    setScore(s => ({ correct: s.correct + (c ? 1 : 0), total: s.total + 1 }))
  }

  function handleCheck() {
    if (!answer.trim() || checked) return
    submitAnswer(answer)
  }

  const borderClass = checked
    ? correct
      ? 'border-emerald-800/50 bg-emerald-950/20'
      : 'border-rose-800/50 bg-rose-950/20'
    : 'border-border bg-surface'

  const choices = CHOICE_OPTIONS[problem.subtype]

  return (
    <div className="flex flex-col gap-5 max-w-2xl">

      {/* Type selector */}
      <div className="flex flex-wrap gap-1.5">
        {TYPES.map(t => {
          const isActive = selected === t.id
          return (
            <button
              key={t.id}
              onClick={() => handleTypeChange(t.id)}
              className="flex flex-col items-start px-3 py-2 rounded-sm font-sans text-sm
                         font-medium transition-colors text-left"
              style={isActive ? {
                background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                color: 'var(--c-halogen)',
              } : {
                background: 'rgb(var(--color-surface))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgba(var(--overlay),0.45)',
              }}
            >
              <span className="text-sm">{t.label}</span>
              <span className="font-mono text-[9px] mt-0.5 opacity-60">{t.formula}</span>
            </button>
          )
        })}
      </div>

      {/* Score bar */}
      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-secondary">
            Score: <span className="text-bright">{score.correct}</span>
            <span className="text-dim"> / {score.total}</span>
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden bg-raised">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'var(--c-halogen)' }}
              animate={{ width: `${(score.correct / score.total) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Problem card */}
      <motion.div
        key={problem.question + problem.dh + problem.ea}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className={`rounded-sm border p-5 flex flex-col gap-4 transition-colors ${borderClass}`}
      >
        {/* Diagram */}
        <div className="rounded-sm border border-border bg-surface overflow-hidden">
          <ProfileDiagram problem={problem} />
        </div>

        {/* Question */}
        <p className="font-sans text-base text-bright leading-relaxed">{problem.question}</p>

        {/* Hint */}
        {problem.hint && (
          <p className="font-mono text-xs" style={{ color: 'rgba(255,200,80,0.75)' }}>
            Note: {problem.hint}
          </p>
        )}

        {/* Answer area */}
        {usesButtons(problem) && choices ? (
          // ── Choice buttons ──────────────────────────────────────────────────
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 flex-wrap">
              {choices.map(choice => {
                const isSelected = checked && answer.toLowerCase() === choice.toLowerCase()
                const isCorrectAnswer = problem.acceptedAnswers.some(
                  a => a === choice.toLowerCase()
                )
                let style: React.CSSProperties
                if (!checked) {
                  style = {
                    background: 'rgb(var(--color-raised))',
                    border: '1px solid rgb(var(--color-border))',
                    color: 'rgba(var(--overlay),0.7)',
                  }
                } else if (isSelected && correct) {
                  style = {
                    background: 'color-mix(in srgb, #34d399 15%, rgb(var(--color-raised)))',
                    border: '1px solid color-mix(in srgb, #34d399 50%, transparent)',
                    color: '#34d399',
                  }
                } else if (isSelected && !correct) {
                  style = {
                    background: 'color-mix(in srgb, #f87171 15%, rgb(var(--color-raised)))',
                    border: '1px solid color-mix(in srgb, #f87171 50%, transparent)',
                    color: '#f87171',
                  }
                } else if (!isSelected && checked && isCorrectAnswer) {
                  style = {
                    background: 'color-mix(in srgb, #34d399 8%, rgb(var(--color-raised)))',
                    border: '1px solid color-mix(in srgb, #34d399 30%, transparent)',
                    color: 'color-mix(in srgb, #34d399 70%, rgba(var(--overlay),0.5))',
                  }
                } else {
                  style = {
                    background: 'rgb(var(--color-raised))',
                    border: '1px solid rgb(var(--color-border))',
                    color: 'rgba(var(--overlay),0.25)',
                  }
                }
                return (
                  <button
                    key={choice}
                    onClick={() => submitAnswer(choice)}
                    disabled={checked}
                    className="px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors
                               disabled:cursor-not-allowed"
                    style={style}
                  >
                    {choice}
                  </button>
                )
              })}
            </div>

            {checked && (
              <div className="flex items-center gap-3">
                <span className={`font-sans text-sm font-medium ${correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {correct ? '✓ Correct' : '✗ Incorrect'}
                </span>
                <button
                  onClick={() => setShowSteps(s => !s)}
                  className="font-mono text-xs text-dim hover:text-secondary transition-colors"
                >
                  {showSteps ? '▲ hide' : '▼ solution'}
                </button>
              </div>
            )}
          </div>
        ) : (
          // ── Text input ──────────────────────────────────────────────────────
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              inputMode="numeric"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => !checked && e.key === 'Enter' && handleCheck()}
              disabled={checked}
              placeholder={inputPlaceholder(problem)}
              className={`bg-raised border rounded-sm px-3 py-1.5 font-mono text-base
                          placeholder-dim focus:outline-none focus:border-muted
                          disabled:cursor-not-allowed transition-colors w-40
                          ${checked
                            ? correct
                              ? 'border-emerald-700/60 text-emerald-300'
                              : 'border-rose-700/60 text-rose-300'
                            : 'border-border text-bright'}`}
            />
            {!checked ? (
              <button
                onClick={handleCheck}
                disabled={!answer.trim()}
                className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors
                           disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                  color: 'var(--c-halogen)',
                }}
              >
                Check
              </button>
            ) : (
              <>
                <span className={`font-sans text-sm font-medium ${correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {correct ? '✓ Correct' : '✗ Incorrect'}
                </span>
                <button
                  onClick={() => setShowSteps(s => !s)}
                  className="font-mono text-xs text-dim hover:text-secondary transition-colors"
                >
                  {showSteps ? '▲ hide' : '▼ solution'}
                </button>
              </>
            )}
          </div>
        )}

        {/* Solution steps */}
        <AnimatePresence>
          {showSteps && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                {!correct && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-dim">Answer:</span>
                    <span className="font-mono text-sm text-bright">{problem.answer}</span>
                  </div>
                )}
                <div className="flex flex-col gap-1.5 pl-3 border-l border-border">
                  {problem.steps.map((step, i) => (
                    <p key={i} className="font-mono text-sm text-primary">{step}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Next / Try Again */}
      {checked && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2"
        >
          {!correct && (
            <button
              onClick={handleTryAgain}
              className="px-4 py-2 rounded-sm font-sans text-sm border border-border
                         text-dim hover:text-secondary transition-colors"
            >
              Try Again
            </button>
          )}
          <button
            onClick={() => nextProblem()}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border
                       text-secondary hover:text-primary hover:border-muted transition-colors"
          >
            Next →
          </button>
        </motion.div>
      )}
      <p className="font-mono text-xs text-secondary">Ea measured from reactants to peak · ΔH = products − reactants · catalyst lowers Ea without changing ΔH</p>
    </div>
  )
}
