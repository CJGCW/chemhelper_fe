import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Reference table ────────────────────────────────────────────────────────────

function HybridizationReference() {
  const table: { group: string; hybrid: string; angle: string; geometry: string; examples: string }[] = [
    { group: 'Alkane carbon (C–C, C–H only)',      hybrid: 'sp³', angle: '109.5°', geometry: 'Tetrahedral', examples: 'CH₄, ethane, cyclohexane, any saturated C' },
    { group: 'Alkene carbon (C=C)',                 hybrid: 'sp²', angle: '120°',   geometry: 'Trigonal planar', examples: 'CH₂=CH₂; each C in C=C' },
    { group: 'Carbonyl carbon (C=O)',               hybrid: 'sp²', angle: '120°',   geometry: 'Trigonal planar', examples: 'Aldehydes, ketones, esters, amides' },
    { group: 'Aromatic carbon (benzene ring)',      hybrid: 'sp²', angle: '120°',   geometry: 'Trigonal planar', examples: 'All C in benzene, pyridine, naphthalene' },
    { group: 'Carbocation (R₃C⁺, no lone pair)',    hybrid: 'sp²', angle: '120°',   geometry: 'Trigonal planar', examples: 'tBu⁺, allyl⁺, benzyl⁺' },
    { group: 'Alkyne carbon (C≡C)',                 hybrid: 'sp',  angle: '180°',   geometry: 'Linear', examples: 'HC≡CH; each C in C≡C' },
    { group: 'Nitrile nitrogen (C≡N)',              hybrid: 'sp',  angle: '180°',   geometry: 'Linear', examples: 'CH₃CN, HCN' },
    { group: 'Alcohol oxygen (C–O–H)',              hybrid: 'sp³', angle: '~104.5°', geometry: 'Bent', examples: 'ROH; oxygen has 2 lone pairs + 2 bonds = 4 regions' },
    { group: 'Ether oxygen (C–O–C)',               hybrid: 'sp³', angle: '~109°',  geometry: 'Bent', examples: 'Diethyl ether, THF' },
    { group: 'Carbonyl oxygen (C=O)',              hybrid: 'sp²', angle: '120°',   geometry: '—', examples: 'In C=O of ketones/esters; 2 lone pairs + 1 π bond' },
    { group: 'Amine nitrogen (C–N–C)',             hybrid: 'sp³', angle: '~107°',  geometry: 'Pyramidal', examples: 'R₃N; N has lone pair occupying 1 region' },
    { group: 'Amide nitrogen (–CO–NH₂)',           hybrid: 'sp²', angle: '~120°',  geometry: 'Planar', examples: 'Due to resonance donation into C=O; lone pair in p orbital' },
    { group: 'Imine nitrogen (C=N–R)',             hybrid: 'sp²', angle: '~120°',  geometry: 'Trigonal planar', examples: 'Imines, oximes; lone pair in sp² plane' },
  ]

  return (
    <div className="flex flex-col gap-4 max-w-3xl print:max-w-none">
      <div>
        <h3 className="font-sans font-semibold text-base text-primary mb-1">Hybridization Reference</h3>
        <p className="font-sans text-xs text-secondary leading-relaxed">
          Count electron <strong className="text-primary">regions of density</strong> at each atom (bonded atoms + lone pairs = steric number).
          4 regions = sp³ (tetrahedral), 3 = sp² (trigonal planar), 2 = sp (linear).
        </p>
      </div>
      <div className="overflow-x-auto rounded-sm border border-border">
        <table className="text-xs font-sans border-collapse w-full">
          <thead>
            <tr className="border-b border-border bg-raised">
              <th className="px-3 py-2 text-left font-semibold text-secondary">Functional Group / Atom</th>
              <th className="px-3 py-2 text-left font-semibold text-secondary">Hybridization</th>
              <th className="px-3 py-2 text-left font-semibold text-secondary">Bond Angle</th>
              <th className="px-3 py-2 text-left font-semibold text-secondary">Geometry</th>
              <th className="px-3 py-2 text-left font-semibold text-secondary">Examples</th>
            </tr>
          </thead>
          <tbody>
            {table.map((r, i) => {
              const color = r.hybrid === 'sp' ? 'text-blue-400 bg-blue-500/10' : r.hybrid === 'sp²' ? 'text-yellow-400 bg-yellow-500/10' : 'text-secondary bg-raised'
              return (
                <tr key={i} className="border-b border-border/50">
                  <td className="px-3 py-2 text-primary">{r.group}</td>
                  <td className="px-3 py-2">
                    <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${color}`}>{r.hybrid}</span>
                  </td>
                  <td className="px-3 py-2 font-mono text-secondary">{r.angle}</td>
                  <td className="px-3 py-2 text-secondary">{r.geometry}</td>
                  <td className="px-3 py-2 text-dim">{r.examples}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Practice ──────────────────────────────────────────────────────────────────

interface HybProblem {
  molecule: string; formula: string
  targetAtom: string
  options: ('sp³' | 'sp²' | 'sp')[]
  correct: 'sp³' | 'sp²' | 'sp'
  explanation: string
}

const PROBLEMS: HybProblem[] = [
  { molecule: 'Methane', formula: 'CH₄', targetAtom: 'carbon', options: ['sp³', 'sp²', 'sp'],
    correct: 'sp³', explanation: 'C in CH₄ has 4 bonds (to 4 H) and no lone pairs. 4 regions → sp³, tetrahedral, 109.5°.' },
  { molecule: 'Ethene (ethylene)', formula: 'CH₂=CH₂', targetAtom: 'each C of C=C', options: ['sp³', 'sp²', 'sp'],
    correct: 'sp²', explanation: 'Each alkene C has 3 regions: one C=C (counts as 1) + 2 C–H. 3 regions → sp², trigonal planar, 120°. The C=C has 1 σ + 1 π bond.' },
  { molecule: 'Ethyne (acetylene)', formula: 'HC≡CH', targetAtom: 'each C of C≡C', options: ['sp³', 'sp²', 'sp'],
    correct: 'sp', explanation: 'Each alkyne C has 2 regions: one C≡C (counts as 1) + one C–H. 2 regions → sp, linear, 180°. The C≡C has 1 σ + 2 π bonds.' },
  { molecule: 'Acetaldehyde', formula: 'CH₃CHO', targetAtom: 'carbonyl carbon (CHO)', options: ['sp³', 'sp²', 'sp'],
    correct: 'sp²', explanation: 'The carbonyl C has 3 regions: C=O (1 region) + C–H + C–CH₃. 3 regions → sp², trigonal planar, 120°. Same as alkene carbon.' },
  { molecule: 'Acetonitrile', formula: 'CH₃C≡N', targetAtom: 'nitrile nitrogen (C≡N)', options: ['sp³', 'sp²', 'sp'],
    correct: 'sp', explanation: 'The nitrile N has 2 regions: the C≡N triple bond (1) + 1 lone pair. 2 regions → sp, linear, 180°.' },
  { molecule: 'Dimethyl ether', formula: 'CH₃–O–CH₃', targetAtom: 'oxygen', options: ['sp³', 'sp²', 'sp'],
    correct: 'sp³', explanation: 'The ether O has 4 regions: 2 C–O bonds + 2 lone pairs. 4 regions → sp³, bent (~109°).' },
  { molecule: 'Trimethylamine', formula: '(CH₃)₃N', targetAtom: 'nitrogen', options: ['sp³', 'sp²', 'sp'],
    correct: 'sp³', explanation: 'N in a simple amine has 4 regions: 3 C–N bonds + 1 lone pair. 4 regions → sp³, pyramidal (~107°). The lone pair occupies an sp³ orbital.' },
  { molecule: 'N,N-dimethylacetamide', formula: 'CH₃CON(CH₃)₂', targetAtom: 'nitrogen', options: ['sp³', 'sp²', 'sp'],
    correct: 'sp²', explanation: 'Amide N is sp² due to resonance donation of the lone pair into the C=O. The lone pair is in a p orbital (not sp³). This makes the C–N bond have partial double bond character and forces planarity.' },
  { molecule: 'Formaldehyde', formula: 'H₂C=O', targetAtom: 'carbonyl oxygen', options: ['sp³', 'sp²', 'sp'],
    correct: 'sp²', explanation: 'The carbonyl O has 3 regions: C=O (1) + 2 lone pairs. Wait — 2 lone pairs in C=O oxygen. Actually: the bonded O in C=O has 2 lone pairs + 1 double bond = 3 electron regions → sp². The lone pairs are in sp² and p orbitals.' },
  { molecule: 'Propyne', formula: 'CH₃C≡CH', targetAtom: 'terminal C (≡CH)', options: ['sp³', 'sp²', 'sp'],
    correct: 'sp', explanation: 'The terminal alkyne C has 2 regions: C≡C (1) + C–H (1). 2 regions → sp, linear, 180°.' },
]

function pickRandom(): HybProblem {
  return PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]
}

function HybridizationPractice({ allowCustom: _allowCustom }: { allowCustom: boolean }) {
  const [problem, setProblem] = useState<HybProblem>(pickRandom)
  const [selected, setSelected] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const correct = selected === problem.correct

  function handleCheck() {
    if (!selected || checked) return
    setChecked(true)
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  function handleNext() {
    setProblem(pickRandom())
    setSelected(null)
    setChecked(false)
  }

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

      <div className="rounded-sm border border-border p-4 flex flex-col gap-2" style={{ background: 'rgb(var(--color-raised))' }}>
        <div className="flex items-center gap-2">
          <span className="font-mono text-base text-primary">{problem.formula}</span>
          <span className="font-sans text-sm text-secondary">({problem.molecule})</span>
        </div>
        <p className="font-sans text-sm text-primary font-medium">
          What is the hybridization of the <strong>{problem.targetAtom}</strong>?
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {problem.options.map(opt => {
          const isSelected = selected === opt
          const isCorrect = opt === problem.correct
          let borderColor = 'rgb(var(--color-border))'
          let bg = 'rgb(var(--color-raised))'
          if (checked) {
            if (isCorrect) { borderColor = 'rgb(34 197 94)'; bg = 'rgb(34 197 94 / 0.06)' }
            else if (isSelected) { borderColor = 'rgb(239 68 68)'; bg = 'rgb(239 68 68 / 0.06)' }
          } else if (isSelected) {
            borderColor = 'var(--c-halogen)'
            bg = 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-raised)))'
          }
          return (
            <button key={opt} onClick={() => !checked && setSelected(opt)} disabled={checked}
              className="py-4 rounded-sm border font-mono text-lg font-bold transition-colors"
              style={{ borderColor, background: bg, color: isSelected ? 'var(--c-halogen)' : 'rgb(var(--overlay)/0.6)' }}>
              {opt}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2">
        {!checked ? (
          <button onClick={handleCheck} disabled={!selected}
            className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium disabled:opacity-40"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
                     color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}>
            Check
          </button>
        ) : (
          <button onClick={handleNext}
            className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
                     color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}>
            Next
          </button>
        )}
      </div>

      <AnimatePresence>
        {checked && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`rounded-sm border px-4 py-3 flex flex-col gap-1.5 ${correct ? 'border-emerald-500/30' : 'border-red-500/30'}`}
            style={{ background: correct ? 'rgb(34 197 94 / 0.06)' : 'rgb(239 68 68 / 0.06)' }}>
            <p className={`font-sans text-sm font-semibold ${correct ? 'text-emerald-400' : 'text-red-400'}`}>
              {correct ? `✓ Correct! ${problem.targetAtom} is ${problem.correct}.` : `✗ The ${problem.targetAtom} is ${problem.correct}.`}
            </p>
            <p className="font-sans text-xs text-secondary leading-relaxed">{problem.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface Props { allowCustom?: boolean }

export default function HybridizationAssigner({ allowCustom = true }: Props) {
  return allowCustom
    ? <div className="flex flex-col gap-10"><HybridizationReference /><div className="border-t border-border" /><HybridizationPractice allowCustom={allowCustom} /></div>
    : <HybridizationPractice allowCustom={allowCustom} />
}
