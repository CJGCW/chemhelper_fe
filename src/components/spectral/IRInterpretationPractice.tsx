import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SpectrumViewer, { type Peak } from './SpectrumViewer'

interface IRProblem {
  title: string
  peaks: Peak[]
  allGroups: string[]
  presentGroups: string[]
  hints: string[]
  explanation: string
}

const PROBLEMS: IRProblem[] = [
  {
    title: 'Identify functional groups from this IR spectrum',
    peaks: [
      { x: 3400, y: 0.70, label: 'O–H (broad)', width: 400 },
      { x: 2960, y: 0.50, label: 'sp³ C–H', width: 60 },
      { x: 1715, y: 0.95, label: 'C=O (ketone)', width: 50 },
    ],
    allGroups: ['O–H alcohol', 'C=O ketone', 'C=C alkene', 'N–H amine', 'C≡C alkyne', 'C≡N nitrile'],
    presentGroups: ['O–H alcohol', 'C=O ketone'],
    hints: ['The broad peak near 3400 cm⁻¹ is diagnostic for O–H', 'The sharp strong peak near 1715 cm⁻¹ is the ketone C=O stretch'],
    explanation: 'The broad absorption at ~3400 cm⁻¹ indicates an O–H stretch (alcohol or carboxylic acid). The sharp, strong peak at 1715 cm⁻¹ is the ketone C=O stretch. No N–H peaks (3300–3500, two peaks for primary amine), no alkyne peaks (~2150 cm⁻¹), no C=C (1600–1680 cm⁻¹).',
  },
  {
    title: 'Identify functional groups from this IR spectrum',
    peaks: [
      { x: 3320, y: 0.75, label: 'O–H (carboxylic, broad)', width: 600 },
      { x: 2980, y: 0.45, label: 'sp³ C–H', width: 60 },
      { x: 1710, y: 0.95, label: 'C=O (RCOOH)', width: 60 },
    ],
    allGroups: ['O–H carboxylic acid', 'C=O ketone', 'C=C alkene', 'N–H amine', 'O–H alcohol', 'C≡C alkyne'],
    presentGroups: ['O–H carboxylic acid', 'C=O ketone'],
    hints: [
      'The very broad absorption from 2500–3300 cm⁻¹ overlapping the C–H region is characteristic of carboxylic acid O–H',
      'A C=O near 1710 cm⁻¹ combined with the broad O–H → carboxylic acid',
    ],
    explanation: 'The combination of a very broad O–H stretch (2500–3300 cm⁻¹, overlapping the C–H region) and a C=O near 1710 cm⁻¹ is diagnostic for a carboxylic acid. The C=O ketone is also technically present (same peak). No isolated alcohol O–H (which would be a clean broad peak at 3200–3550 without the 2500–3300 tail).',
  },
  {
    title: 'Identify functional groups from this IR spectrum',
    peaks: [
      { x: 3380, y: 0.55, label: 'N–H (str 1)', width: 60 },
      { x: 3290, y: 0.55, label: 'N–H (str 2)', width: 60 },
      { x: 2940, y: 0.30, label: 'sp³ C–H', width: 60 },
      { x: 1610, y: 0.70, label: 'N–H bend', width: 40 },
    ],
    allGroups: ['N–H amine', 'O–H alcohol', 'C=O carbonyl', 'C=C alkene', 'C≡N nitrile', 'C≡C alkyne'],
    presentGroups: ['N–H amine'],
    hints: ['Two peaks close together near 3300–3400 cm⁻¹ indicate a primary amine (two N–H stretches)', 'An N–H bend near 1600 cm⁻¹ confirms amine'],
    explanation: 'Two sharp absorptions near 3380 and 3290 cm⁻¹ are the symmetric and asymmetric N–H stretches of a primary amine (–NH₂). A secondary amine would show only ONE N–H peak. The N–H bending at ~1610 cm⁻¹ confirms amine. No O–H (would be broad, one peak), no C=O (1700–1800 cm⁻¹).',
  },
  {
    title: 'Identify functional groups from this IR spectrum',
    peaks: [
      { x: 3300, y: 0.85, label: '≡C–H str', width: 40 },
      { x: 2960, y: 0.40, label: 'sp³ C–H', width: 60 },
      { x: 2120, y: 0.60, label: 'C≡C str', width: 40 },
    ],
    allGroups: ['C≡C terminal alkyne', 'C≡N nitrile', 'C=O carbonyl', 'O–H alcohol', 'N–H amine', 'C=C alkene'],
    presentGroups: ['C≡C terminal alkyne'],
    hints: ['A sharp peak near 3300 cm⁻¹ (not broad) + a peak ~2100–2150 cm⁻¹ = terminal alkyne', 'The 2100–2200 region is the triple bond region'],
    explanation: 'The sharp peak at 3300 cm⁻¹ is the ≡C–H stretch (terminal alkyne). The peak at 2120 cm⁻¹ is the C≡C triple bond stretch. Together these confirm a terminal alkyne. Internal alkynes often lack the 3300 cm⁻¹ peak and have a weaker (or absent) C≡C stretch. A nitrile (C≡N) absorbs at 2200–2260 cm⁻¹ and would have no ≡C–H.',
  },
  {
    title: 'Identify functional groups from this IR spectrum',
    peaks: [
      { x: 2960, y: 0.45, label: 'sp³ C–H', width: 60 },
      { x: 1735, y: 0.97, label: 'C=O (ester)', width: 50 },
      { x: 1240, y: 0.80, label: 'C–O–C stretch', width: 80 },
    ],
    allGroups: ['C=O ester', 'O–H alcohol', 'C=O ketone', 'N–H amine', 'C=C alkene', 'C≡C alkyne'],
    presentGroups: ['C=O ester'],
    hints: ['The C=O at 1735 cm⁻¹ is higher than ketone (1715) — characteristic of ester', 'A strong C–O–C stretch near 1240 cm⁻¹ confirms ester'],
    explanation: 'Esters have a C=O stretch at 1735–1750 cm⁻¹ (higher than ketone at 1715 cm⁻¹) and a strong C–O–C stretch at 1200–1250 cm⁻¹. No O–H present. Comparison: ketone would be ~1715 cm⁻¹ with no C–O–C; aldehyde would be ~1725 cm⁻¹ with two C–H stretches at ~2720 and 2820 cm⁻¹.',
  },
]

function pickRandom(): IRProblem {
  return PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]
}

export default function IRInterpretationPractice() {
  const [problem, setProblem] = useState<IRProblem>(pickRandom)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [checked, setChecked] = useState(false)
  const [hintsOpen, setHintsOpen] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  function toggle(g: string) {
    if (checked) return
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(g)) next.delete(g)
      else next.add(g)
      return next
    })
  }

  function handleCheck() {
    if (checked) return
    const presentSet = new Set(problem.presentGroups)
    const allCorrect = [...selected].every(s => presentSet.has(s)) && [...presentSet].every(s => selected.has(s))
    setChecked(true)
    setScore(s => ({ correct: s.correct + (allCorrect ? 1 : 0), total: s.total + 1 }))
  }

  function handleNext() {
    setProblem(pickRandom())
    setSelected(new Set())
    setChecked(false)
    setHintsOpen(false)
  }

  const presentSet = new Set(problem.presentGroups)

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgb(var(--color-raised))' }}>
            <motion.div className="h-full rounded-full bg-emerald-500"
              animate={{ width: `${(score.correct / score.total) * 100}%` }} transition={{ duration: 0.4 }} />
          </div>
          <span className="font-mono text-xs text-secondary shrink-0">{score.correct} / {score.total}</span>
        </div>
      )}

      {/* Key rules */}
      <div className="rounded-sm border border-border p-3 flex flex-col gap-1" style={{ background: 'rgb(var(--color-raised))' }}>
        <p className="font-mono text-[10px] text-dim uppercase tracking-widest">IR Interpretation Tip</p>
        <p className="font-sans text-xs text-secondary">Start with the C=O region (1700–1800 cm⁻¹) — it is the most diagnostic. Then check 3000+ cm⁻¹ for O–H, N–H, and triple bond stretches.</p>
      </div>

      {/* Spectrum */}
      <SpectrumViewer type="ir" peaks={problem.peaks} width={520} height={220} />

      <p className="font-sans text-sm text-primary font-medium">{problem.title} <span className="font-normal text-secondary">(select all that apply)</span></p>

      <div className="flex flex-wrap gap-2">
        {problem.allGroups.map(g => {
          const isSelected = selected.has(g)
          const isPresent = presentSet.has(g)
          let borderColor = 'rgb(var(--color-border))'
          let bg = 'rgb(var(--color-raised))'
          let textColor = 'rgb(var(--overlay)/0.6)'
          if (checked) {
            if (isPresent && isSelected) { borderColor = 'rgb(34 197 94)'; bg = 'rgb(34 197 94 / 0.08)'; textColor = 'rgb(34 197 94)' }
            else if (isPresent && !isSelected) { borderColor = 'rgb(234 179 8)'; bg = 'rgb(234 179 8 / 0.08)'; textColor = 'rgb(234 179 8)' }
            else if (!isPresent && isSelected) { borderColor = 'rgb(239 68 68)'; bg = 'rgb(239 68 68 / 0.08)'; textColor = 'rgb(239 68 68)' }
          } else if (isSelected) {
            borderColor = 'var(--c-halogen)'; bg = 'color-mix(in srgb, var(--c-halogen) 10%, rgb(var(--color-raised)))'; textColor = 'var(--c-halogen)'
          }
          return (
            <button key={g} onClick={() => toggle(g)} disabled={checked}
              className="px-3 py-1.5 rounded-full text-xs font-sans font-medium border transition-colors"
              style={{ borderColor, background: bg, color: textColor }}>
              {g}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2">
        {!checked ? (
          <>
            <button onClick={handleCheck} disabled={selected.size === 0}
              className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium disabled:opacity-40"
              style={{ background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
                       color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}>
              Check
            </button>
            <button onClick={() => setHintsOpen(o => !o)}
              className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium border border-border text-secondary hover:text-primary">
              {hintsOpen ? 'Hide Hints' : 'Hints'}
            </button>
          </>
        ) : (
          <button onClick={handleNext}
            className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
                     color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}>
            Next Problem
          </button>
        )}
      </div>

      <AnimatePresence>
        {hintsOpen && !checked && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="rounded-sm border border-border p-3 flex flex-col gap-1.5" style={{ background: 'rgb(var(--color-raised))' }}>
            {problem.hints.map((h, i) => (
              <p key={i} className="font-sans text-xs text-secondary">• {h}</p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {checked && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-sm border border-border p-4 flex flex-col gap-2" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-mono text-[10px] text-dim uppercase tracking-widest">Explanation</p>
            <p className="font-sans text-xs text-secondary leading-relaxed">{problem.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
