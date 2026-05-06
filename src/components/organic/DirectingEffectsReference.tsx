import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DIRECTING_DATA = [
  { sub: '-NH₂, -NHR, -NR₂',     type: 'EDG', director: 'ortho/para', strength: 'Strong activator',      example: 'Aniline',              mechanism: 'Lone pair on N donates into ring via resonance → + charge ortho/para' },
  { sub: '-OH, -OR',               type: 'EDG', director: 'ortho/para', strength: 'Strong activator',      example: 'Phenol, Anisole',      mechanism: 'O lone pair donates into ring → + charge ortho/para' },
  { sub: '-NHCOR (amide)',          type: 'EDG', director: 'ortho/para', strength: 'Moderate activator',   example: 'Acetanilide',          mechanism: 'N lone pair reduced by carbonyl, still activating' },
  { sub: '-R (alkyl)',              type: 'EDG', director: 'ortho/para', strength: 'Weak activator',        example: 'Toluene',              mechanism: 'Hyperconjugation / inductive electron donation' },
  { sub: '-F, -Cl, -Br, -I',       type: 'EWG', director: 'ortho/para', strength: 'Weak deactivator',     example: 'Chlorobenzene',        mechanism: 'Halogens: EWG by induction (σ framework) but lone pair donation to ring (π)→ o/p director. Net deactivating.' },
  { sub: '-CHO, -COR',             type: 'EWG', director: 'meta',        strength: 'Moderate deactivator', example: 'Benzaldehyde, Acetophenone', mechanism: 'Carbonyl withdraws electrons from ring; + charge at ortho/para (unfavorable) → electrophile attacks meta' },
  { sub: '-COOR, -COOH',           type: 'EWG', director: 'meta',        strength: 'Moderate deactivator', example: 'Methyl benzoate',      mechanism: 'Same as carbonyl — ester/acid withdraws electron density from o/p positions' },
  { sub: '-SO₃H',                  type: 'EWG', director: 'meta',        strength: 'Strong deactivator',   example: 'Benzenesulfonic acid', mechanism: 'Strong EWG; strongly destabilizes o/p arenium ion' },
  { sub: '-CN',                     type: 'EWG', director: 'meta',        strength: 'Strong deactivator',   example: 'Benzonitrile',         mechanism: 'Triple bond to N withdraws electrons strongly' },
  { sub: '-NO₂',                   type: 'EWG', director: 'meta',        strength: 'Strong deactivator',   example: 'Nitrobenzene',         mechanism: 'Strongest common EWG — 3 resonance structures with + on ring carbons; meta is least destabilized' },
  { sub: '-NR₃⁺ (quaternary N)',   type: 'EWG', director: 'meta',        strength: 'Strong deactivator',   example: 'Trimethylanilinium',   mechanism: 'Full positive charge inductive withdrawal; no lone pair to donate' },
]

interface PracticeProblem {
  ringName: string
  substituent: string
  electrophile: string
  majorPosition: string
  explanation: string
}

const PRACTICE_PROBLEMS: PracticeProblem[] = [
  {
    ringName: 'Toluene',
    substituent: '-CH₃',
    electrophile: 'Br₂/FeBr₃ (EAS bromination)',
    majorPosition: 'ortho and para (mixture)',
    explanation: 'CH₃ is a weak ortho/para director. Bromination gives a mixture of ortho-bromotoluene and para-bromotoluene, with para predominating due to steric effects.',
  },
  {
    ringName: 'Nitrobenzene',
    substituent: '-NO₂',
    electrophile: 'HNO₃/H₂SO₄ (nitration)',
    majorPosition: 'meta',
    explanation: 'NO₂ is a strong meta director. Nitration gives predominantly m-dinitrobenzene.',
  },
  {
    ringName: 'Chlorobenzene',
    substituent: '-Cl',
    electrophile: 'Br₂/FeBr₃ (bromination)',
    majorPosition: 'ortho and para (mixture)',
    explanation: 'Cl is an ortho/para director (despite being a net deactivator). The Cl lone pair donates to ortho/para positions by resonance. Product is 2-chlorobromobenzene and 4-chlorobromobenzene.',
  },
  {
    ringName: 'Aniline',
    substituent: '-NH₂',
    electrophile: 'Br₂/H₂O (bromination)',
    majorPosition: 'ortho and para (mixture) — mostly para',
    explanation: 'NH₂ is a strong activator and ortho/para director. Aniline undergoes trisubstitution under mild conditions; with controlled Br₂ in water, para is the main product.',
  },
  {
    ringName: 'Benzoic acid',
    substituent: '-COOH',
    electrophile: 'HNO₃/H₂SO₄ (nitration)',
    majorPosition: 'meta',
    explanation: 'COOH is an EWG meta director. Nitration of benzoic acid gives predominantly 3-nitrobenzoic acid (meta).',
  },
  {
    ringName: 'Acetophenone (methyl phenyl ketone)',
    substituent: '-C(=O)CH₃',
    electrophile: 'Cl₂/AlCl₃ (Friedel-Crafts chlorination)',
    majorPosition: 'meta',
    explanation: 'The ketone carbonyl is a meta director (EWG via resonance). Chlorination gives 3-chloroacetophenone.',
  },
]

interface Props { allowCustom?: boolean }

export default function DirectingEffectsReference({ allowCustom = true }: Props) {
  void allowCustom
  const [tab, setTab] = useState<'reference' | 'practice'>('reference')
  const [probIdx, setProbIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)

  const problem = PRACTICE_PROBLEMS[probIdx]
  const options = ['ortho and para (mixture)', 'meta', 'ortho only', 'para only']

  function nextProblem() {
    setProbIdx(i => (i + 1) % PRACTICE_PROBLEMS.length)
    setSelected(null)
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex gap-1 p-1 rounded-full self-start"
        style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
        {(['reference', 'practice'] as const).map(t => {
          const isActive = tab === t
          return (
            <button key={t} onClick={() => setTab(t)}
              className="relative px-4 py-1 rounded-full font-sans text-sm capitalize transition-colors"
              style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.35)' }}>
              {isActive && (
                <motion.div layoutId="dir-tab" className="absolute inset-0 rounded-full"
                  style={{
                    background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
              )}
              <span className="relative z-10">{t}</span>
            </button>
          )
        })}
      </div>

      {tab === 'reference' && (
        <div className="flex flex-col gap-4">
          <div className="p-3 rounded-sm border border-border bg-surface flex flex-col gap-2">
            <p className="font-mono text-xs text-dim uppercase tracking-wider mb-1">Key Rules</p>
            <ul className="font-sans text-sm text-secondary flex flex-col gap-1 list-disc list-inside">
              <li>All <span className="text-success">activators</span> are ortho/para directors</li>
              <li>All <span className="text-error">deactivators</span> are meta directors — <strong className="text-primary">except halogens</strong> (deactivating but o/p directing)</li>
              <li>Lone pair donors (N, O, X on atom attached to ring) → o/p via resonance</li>
              <li>Carbonyl/cyano/nitro groups → meta (+ charge at o/p is destabilized)</li>
            </ul>
          </div>

          <div className="overflow-x-auto">
            <table className="font-mono text-xs border-collapse w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-border">
                  {['Substituent', 'Type', 'Director', 'Strength', 'Example'].map(h => (
                    <th key={h} className="text-left py-2 pr-3 text-dim font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-secondary text-sm">
                {DIRECTING_DATA.map(row => (
                  <tr key={row.sub} className="border-b border-border/50 group">
                    <td className="py-2 pr-3 text-primary font-medium">{row.sub}</td>
                    <td className="py-2 pr-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${row.type === 'EDG' ? 'bg-emerald-950/40 text-success' : 'bg-rose-950/40 text-error'}`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="py-2 pr-3" style={{ color: row.director === 'meta' ? '#f87171' : 'var(--c-halogen)' }}>
                      {row.director}
                    </td>
                    <td className="py-2 pr-3 text-dim text-xs">{row.strength}</td>
                    <td className="py-2 pr-3 text-dim text-xs">{row.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'practice' && (
        <div className="flex flex-col gap-5 max-w-2xl">
          <p className="font-sans text-sm text-secondary">
            Given the substituent on the benzene ring and the electrophile, predict the major product position.
          </p>

          <AnimatePresence mode="wait">
            <motion.div key={probIdx}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
              className="flex flex-col gap-4">
              <div className="p-4 rounded-sm border border-border bg-surface flex flex-col gap-2">
                <p className="font-mono text-xs text-dim">{problem.ringName}</p>
                <p className="font-sans text-sm text-primary">
                  <strong>Substituent:</strong> {problem.substituent}
                </p>
                <p className="font-sans text-sm text-primary">
                  <strong>Reagent:</strong> {problem.electrophile}
                </p>
                <p className="font-sans text-sm text-secondary">Where does the incoming electrophile attack?</p>
              </div>

              <div className="flex flex-col gap-2">
                {options.map(opt => {
                  const isSelected = selected === opt
                  const isCorrect = opt === problem.majorPosition
                  let style = 'border-border text-secondary hover:border-muted hover:text-primary'
                  if (selected !== null && isCorrect) style = 'border-emerald-700/70 bg-emerald-950/25 text-success'
                  if (selected !== null && isSelected && !isCorrect) style = 'border-rose-700/70 bg-rose-950/25 text-error'
                  return (
                    <button key={opt} disabled={selected !== null} onClick={() => setSelected(opt)}
                      className={`text-left px-4 py-2.5 rounded-sm border font-sans text-sm transition-colors ${style}`}>
                      {opt}
                    </button>
                  )
                })}
              </div>

              {selected !== null && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-sm border text-sm font-sans ${selected === problem.majorPosition ? 'feedback-success text-success-strong' : 'feedback-error text-error-strong'}`}>
                  <span className="font-semibold">{selected === problem.majorPosition ? 'Correct. ' : `Incorrect — ${problem.majorPosition}. `}</span>
                  {problem.explanation}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {selected !== null && (
            <button onClick={nextProblem}
              className="self-start px-4 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                color: 'var(--c-halogen)',
              }}>
              Next Problem →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
