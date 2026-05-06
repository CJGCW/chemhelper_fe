import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Reference content ──────────────────────────────────────────────────────────

function ResonanceReference() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl print:max-w-none">
      <div>
        <h3 className="font-sans font-semibold text-base text-primary mb-1">Resonance Structures</h3>
        <p className="font-sans text-xs text-secondary leading-relaxed">
          Resonance structures are multiple Lewis structures that differ only in the placement of electrons.
          The actual molecule is a <strong className="text-primary">hybrid</strong> — it is NOT rapidly interconverting between structures.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Rules for Drawing Valid Resonance Structures</h4>
        <div className="flex flex-col gap-2">
          {[
            { num: '1', rule: 'Only π electrons and lone pairs move — NEVER σ bonds or atoms.' },
            { num: '2', rule: 'The total number of electrons must be conserved.' },
            { num: '3', rule: 'All atoms must maintain allowed octets/valences.' },
            { num: '4', rule: 'Use curved arrows: tail at electron source, head at destination.' },
            { num: '5', rule: 'Resonance structures are HYPOTHETICAL — the hybrid is real.' },
          ].map(r => (
            <div key={r.num} className="flex items-start gap-3 p-3 rounded-sm border border-border/60"
              style={{ background: 'rgb(var(--color-raised))' }}>
              <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
                style={{ background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-surface)))', color: 'var(--c-halogen)' }}>{r.num}</span>
              <span className="font-sans text-xs text-secondary leading-relaxed">{r.rule}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Major Contributor Rules</h4>
        <p className="font-sans text-xs text-secondary">The "best" (most important) resonance structure contributes most to the hybrid:</p>
        <div className="overflow-x-auto rounded-sm border border-border">
          <table className="text-xs font-sans border-collapse w-full">
            <thead>
              <tr className="border-b border-border bg-raised">
                <th className="px-3 py-2 text-left font-semibold text-secondary">Rule</th>
                <th className="px-3 py-2 text-left font-semibold text-secondary">Prefer</th>
              </tr>
            </thead>
            <tbody>
              {[
                { rule: 'More covalent bonds', pref: 'More bonds = more stable (lower formal charge separation)' },
                { rule: 'Charge placement', pref: 'Negative charge on more electronegative atom (O, N, F)' },
                { rule: 'Positive charge', pref: 'Positive charge on less electronegative atom (C over O)' },
                { rule: 'Octet satisfaction', pref: 'All atoms satisfy octet is better than one with incomplete octet' },
                { rule: 'Like charges separated', pref: 'Structures with adjacent like charges are minor (destabilizing)' },
              ].map(r => (
                <tr key={r.rule} className="border-b border-border/50">
                  <td className="px-3 py-2 font-medium text-primary">{r.rule}</td>
                  <td className="px-3 py-2 text-secondary">{r.pref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Common Examples</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: 'Carboxylate (RCOO⁻)',   n: 2, desc: 'Two equivalent structures. C=O bond is 1.5 order in the hybrid. Both O atoms equivalent.' },
            { name: 'Enolate (⁻CH₂–C=O)',    n: 2, desc: 'Charge on C or O. O-form is major (O more electronegative); C-form is the reactive form in alkylation.' },
            { name: 'Allyl cation (C=C–C⁺)', n: 2, desc: 'Two equivalent structures. Positive charge delocalized over terminal carbons. sp²-hybridized throughout.' },
            { name: 'Amide (R–CO–NR₂)',       n: 2, desc: 'N lone pair donates into C=O. N⁺=C–O⁻ form explains: N is planar, C–N bond has partial double bond character.' },
            { name: 'Nitro group (–NO₂)',      n: 3, desc: 'Two equivalent N⁺=O forms + one minor all-single-bond. Both N–O bonds are equivalent in the hybrid.' },
            { name: 'Benzene (C₆H₆)',          n: 2, desc: 'Two Kekulé structures + three Dewar structures (minor). The hybrid has equal bond lengths of 1.40 Å.' },
          ].map(ex => (
            <div key={ex.name} className="rounded-sm border border-border p-3 flex flex-col gap-1.5" style={{ background: 'rgb(var(--color-raised))' }}>
              <div className="flex items-center gap-2">
                <span className="font-sans text-sm font-semibold text-primary">{ex.name}</span>
                <span className="font-mono text-[10px] text-dim px-1.5 py-0.5 rounded" style={{ background: 'rgb(var(--color-surface))' }}>{ex.n} forms</span>
              </div>
              <p className="font-sans text-xs text-secondary leading-relaxed">{ex.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ── Practice mode ─────────────────────────────────────────────────────────────

interface ResonanceProblem {
  question: string
  species: string
  options: { label: string; formula: string; explanation: string }[]
  correctIndex: number
  reason: string
}

const PROBLEMS: ResonanceProblem[] = [
  {
    question: 'Which is the MAJOR contributor to the resonance hybrid of the carboxylate anion (CH₃COO⁻)?',
    species: 'Acetate anion (CH₃COO⁻)',
    options: [
      { label: 'Both equivalent',  formula: 'CH₃–C(=O)–O⁻  ⇌  CH₃–C(–O⁻)=O', explanation: 'The two carboxylate structures are equivalent — neither is "major." The actual bond order is 1.5.' },
      { label: 'Charge on oxygen', formula: 'CH₃–C(=O)–O⁻', explanation: 'Both structures are equivalent for carboxylate. No single one is the major contributor.' },
      { label: 'No charge (neutral)', formula: 'CH₃–C(=O)–OH', explanation: 'This requires protonation — it is not a resonance structure of the anion. Only electrons move in resonance.' },
    ],
    correctIndex: 0,
    reason: 'For carboxylate, both resonance structures are EQUIVALENT (same energy). Neither is major. The real hybrid has C–O bond order 1.5.',
  },
  {
    question: 'For the amide group (–CO–NH₂), which resonance contributor is MAJOR?',
    species: 'Amide (R–CO–NH₂)',
    options: [
      { label: 'C=O form (neutral N)', formula: 'R–C(=O)–NH₂',     explanation: 'This form has more covalent bonds, satisfies octets, and has no formal charges. It is the MAJOR contributor.' },
      { label: 'C–O⁻ form (N⁺=C)',    formula: 'R–C(–O⁻)=N⁺H₂',  explanation: 'This form has charge separation and puts + on N, which is less favorable. It is a MINOR contributor.' },
      { label: 'N attacks O',          formula: 'R–C(–OH)=NH',       explanation: 'This would require an atom to move (the H on O). Atoms never move in resonance — this is NOT a valid resonance structure.' },
    ],
    correctIndex: 0,
    reason: 'The C=O form (no charges) is major. The C–O⁻ = N⁺H₂ form is minor — it has charge separation and is less stable. However, this minor form explains the partial double bond character of C–N and the planar geometry of amides.',
  },
  {
    question: 'For the enolate ion (⁻CH₂–C=O), which form is the MAJOR contributor?',
    species: 'Enolate (⁻CH₂–CO–R)',
    options: [
      { label: 'O⁻ form', formula: 'CH₂=C–O⁻', explanation: 'This form places the negative charge on electronegative oxygen. Since oxygen better stabilizes negative charge, this is the MAJOR contributor.' },
      { label: 'C⁻ form', formula: '⁻CH₂–C=O', explanation: 'The C⁻ form places the charge on carbon, which is less electronegative than oxygen. This is the MINOR contributor, even though it is the reactive form in alkylation.' },
      { label: 'Neither — they are equivalent', formula: '⁻CH₂–C=O ⇌ CH₂=C–O⁻', explanation: 'These two forms are NOT equivalent — oxygen is more electronegative than carbon, so the O⁻ form is major.' },
    ],
    correctIndex: 0,
    reason: 'The O⁻ form is major because oxygen (EN 3.44) better stabilizes a negative charge than carbon (EN 2.55). Despite the C⁻ form being minor, enolates react at carbon because that is where the highest electron density (HOMO) is located.',
  },
  {
    question: 'Which is NOT a valid resonance structure of the allyl cation (CH₂=CH–CH₂⁺)?',
    species: 'Allyl cation',
    options: [
      { label: '⁺CH₂–CH=CH₂',  formula: '⁺CH₂–CH=CH₂',      explanation: 'Valid — this is the second resonance form, equivalent by symmetry.' },
      { label: 'CH₂=CH–CH₂⁺',  formula: 'CH₂=CH–CH₂⁺',      explanation: 'Valid — this is the starting resonance form.' },
      { label: 'CH₂–CH=CH₂ (no charge)', formula: 'CH₂–CH=CH₂ (neutral)', explanation: 'NOT valid — removing the positive charge would change the total number of electrons. Resonance structures must have the same total electron count.' },
    ],
    correctIndex: 2,
    reason: 'Resonance structures must conserve the total number of electrons. A neutral allyl would have one more electron than the allyl cation — these are NOT resonance structures of each other.',
  },
]

function pickRandom(): ResonanceProblem {
  return PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]
}

function ResonancePractice({ allowCustom: _allowCustom }: { allowCustom: boolean }) {
  const [problem, setProblem] = useState<ResonanceProblem>(pickRandom)
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const correct = selected === problem.correctIndex

  function handleCheck() {
    if (selected === null || checked) return
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
        <span className="font-mono text-[10px] text-dim uppercase tracking-widest">{problem.species}</span>
        <p className="font-sans text-sm text-primary font-medium">{problem.question}</p>
      </div>

      <div className="flex flex-col gap-2">
        {problem.options.map((opt, i) => {
          const isSelected = selected === i
          const isCorrect = i === problem.correctIndex
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
            <button key={i} onClick={() => !checked && setSelected(i)} disabled={checked}
              className="flex flex-col gap-1.5 p-3 rounded-sm border text-left transition-colors"
              style={{ borderColor, background: bg }}>
              <span className="font-sans text-sm text-primary">{opt.label}</span>
              <span className="font-mono text-xs text-secondary">{opt.formula}</span>
              {checked && <span className="font-sans text-xs text-dim italic leading-relaxed">{opt.explanation}</span>}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2">
        {!checked ? (
          <button onClick={handleCheck} disabled={selected === null}
            className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium disabled:opacity-40"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                     color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)' }}>
            Check
          </button>
        ) : (
          <button onClick={handleNext}
            className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                     color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)' }}>
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
              {correct ? '✓ Correct!' : '✗ Incorrect'}
            </p>
            <p className="font-sans text-xs text-secondary leading-relaxed">{problem.reason}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface Props { allowCustom?: boolean }

export default function ResonanceStructures({ allowCustom = true }: Props) {
  return allowCustom
    ? <div className="flex flex-col gap-10"><ResonanceReference /><div className="border-t border-border" /><ResonancePractice allowCustom={allowCustom} /></div>
    : <ResonancePractice allowCustom={allowCustom} />
}
