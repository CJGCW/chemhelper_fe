import { useState, useCallback } from 'react'

// ── Problem data ───────────────────────────────────────────────────────────────

interface Problem {
  name: string
  formula: string
  structural: string   // text structural formula shown to student
  note?: string        // extra context (e.g. resonance caveat)
  sigma: number
  pi: number
  explanation: string
}

const PROBLEMS: Problem[] = [
  {
    name: 'Water',
    formula: 'H₂O',
    structural: 'H–O–H',
    sigma: 2, pi: 0,
    explanation: '2 O–H single bonds → 2σ, 0π. Every single bond is 1σ; single bonds have no π component.',
  },
  {
    name: 'Ammonia',
    formula: 'NH₃',
    structural: 'H–N(–H)–H',
    sigma: 3, pi: 0,
    explanation: '3 N–H single bonds → 3σ, 0π.',
  },
  {
    name: 'Methane',
    formula: 'CH₄',
    structural: 'H₄C (tetrahedral)',
    sigma: 4, pi: 0,
    explanation: '4 C–H single bonds → 4σ, 0π.',
  },
  {
    name: 'Hydrogen fluoride',
    formula: 'HF',
    structural: 'H–F',
    sigma: 1, pi: 0,
    explanation: '1 H–F single bond → 1σ, 0π.',
  },
  {
    name: 'Chlorine',
    formula: 'Cl₂',
    structural: 'Cl–Cl',
    sigma: 1, pi: 0,
    explanation: '1 Cl–Cl single bond → 1σ, 0π.',
  },
  {
    name: 'Oxygen (O₂)',
    formula: 'O₂',
    structural: 'O=O',
    sigma: 1, pi: 1,
    explanation: '1 O=O double bond = 1σ + 1π. Every double bond has one σ (end-on overlap) and one π (side-on overlap).',
  },
  {
    name: 'Nitrogen (N₂)',
    formula: 'N₂',
    structural: 'N≡N',
    sigma: 1, pi: 2,
    explanation: '1 N≡N triple bond = 1σ + 2π. Every triple bond has one σ and two π bonds at 90° to each other.',
  },
  {
    name: 'Carbon dioxide',
    formula: 'CO₂',
    structural: 'O=C=O',
    sigma: 2, pi: 2,
    explanation: '2 C=O double bonds → each contributes 1σ + 1π → total 2σ + 2π.',
  },
  {
    name: 'Hydrogen cyanide',
    formula: 'HCN',
    structural: 'H–C≡N',
    sigma: 2, pi: 2,
    explanation: '1 H–C single bond (1σ) + 1 C≡N triple bond (1σ + 2π) → 2σ + 2π.',
  },
  {
    name: 'Formaldehyde',
    formula: 'CH₂O',
    structural: 'H₂C=O',
    sigma: 3, pi: 1,
    explanation: '2 C–H single bonds (2σ) + 1 C=O double bond (1σ + 1π) → 3σ + 1π.',
  },
  {
    name: 'Acetylene',
    formula: 'C₂H₂',
    structural: 'H–C≡C–H',
    sigma: 3, pi: 2,
    explanation: '2 C–H single bonds (2σ) + 1 C≡C triple bond (1σ + 2π) → 3σ + 2π.',
  },
  {
    name: 'Ethylene',
    formula: 'C₂H₄',
    structural: 'H₂C=CH₂',
    sigma: 5, pi: 1,
    explanation: '4 C–H single bonds (4σ) + 1 C=C double bond (1σ + 1π) → 5σ + 1π.',
  },
  {
    name: 'Ethane',
    formula: 'C₂H₆',
    structural: 'H₃C–CH₃',
    sigma: 7, pi: 0,
    explanation: '6 C–H single bonds (6σ) + 1 C–C single bond (1σ) → 7σ, 0π.',
  },
  {
    name: 'Propene',
    formula: 'C₃H₆',
    structural: 'CH₂=CH–CH₃',
    sigma: 8, pi: 1,
    explanation: '6 C–H bonds (6σ) + 1 C–C single bond (1σ) + 1 C=C double bond (1σ + 1π) → 8σ + 1π.',
  },
  {
    name: 'Methanol',
    formula: 'CH₃OH',
    structural: 'H₃C–O–H',
    sigma: 5, pi: 0,
    explanation: '3 C–H (3σ) + 1 C–O (1σ) + 1 O–H (1σ) → 5σ, 0π.',
  },
  {
    name: 'Formic acid',
    formula: 'HCOOH',
    structural: 'H–C(=O)–O–H',
    sigma: 4, pi: 1,
    explanation: '1 C–H (1σ) + 1 C=O double bond (1σ + 1π) + 1 C–O single bond (1σ) + 1 O–H (1σ) → 4σ + 1π.',
  },
  {
    name: 'Acetic acid',
    formula: 'CH₃COOH',
    structural: 'H₃C–C(=O)–O–H',
    sigma: 7, pi: 1,
    explanation: '3 C–H (3σ) + 1 C–C (1σ) + 1 C=O (1σ + 1π) + 1 C–O (1σ) + 1 O–H (1σ) → 7σ + 1π.',
  },
  {
    name: 'Sulfur dioxide (one resonance form)',
    formula: 'SO₂',
    structural: 'O=S–O',
    note: 'Count using this specific resonance form: one S=O double bond and one S–O single bond.',
    sigma: 2, pi: 1,
    explanation: '1 S=O double bond (1σ + 1π) + 1 S–O single bond (1σ) → 2σ + 1π.',
  },
  {
    name: 'Dinitrogen tetroxide',
    formula: 'N₂O₄',
    structural: 'O₂N–NO₂ (two –NO₂ groups joined by N–N)',
    sigma: 5, pi: 2,
    explanation: '1 N–N single bond (1σ) + 4 N=O double bonds (4σ + 4π)? Wait — each –NO₂ has resonance; count the formal Lewis: 2 N=O and 2 N–O per molecule, plus 1 N–N → 5σ + 2π.',
  },
  {
    name: 'Benzene (one Kekulé structure)',
    formula: 'C₆H₆',
    structural: 'Cyclohexadienyl: 3 C=C, 3 C–C in ring, 6 C–H',
    note: 'Use one Kekulé structure with alternating single and double bonds.',
    sigma: 12, pi: 3,
    explanation: '6 C–H single bonds (6σ) + 3 C–C single bonds (3σ) + 3 C=C double bonds (3σ + 3π) → 12σ + 3π.',
  },
]

// Remove the N2O4 one since it's not clean — replace with something cleaner
const CLEAN_PROBLEMS = PROBLEMS.filter(p => p.formula !== 'N₂O₄')

function pick(exclude: number): number {
  let idx = Math.floor(Math.random() * CLEAN_PROBLEMS.length)
  if (idx === exclude && CLEAN_PROBLEMS.length > 1) {
    idx = (idx + 1) % CLEAN_PROBLEMS.length
  }
  return idx
}

// ── Component ──────────────────────────────────────────────────────────────────

type Status = 'idle' | 'correct' | 'wrong-sigma' | 'wrong-pi' | 'wrong-both'

export default function SigmaPiPractice() {
  const [idx,      setIdx]      = useState(() => Math.floor(Math.random() * CLEAN_PROBLEMS.length))
  const [sigmaStr, setSigmaStr] = useState('')
  const [piStr,    setPiStr]    = useState('')
  const [status,   setStatus]   = useState<Status>('idle')

  const problem = CLEAN_PROBLEMS[idx]

  const nextProblem = useCallback(() => {
    setIdx(i => pick(i))
    setSigmaStr('')
    setPiStr('')
    setStatus('idle')
  }, [])

  function check() {
    const s = parseInt(sigmaStr, 10)
    const p = parseInt(piStr,    10)
    if (isNaN(s) || isNaN(p)) return
    const sigmaOk = s === problem.sigma
    const piOk    = p === problem.pi
    if (sigmaOk && piOk)   setStatus('correct')
    else if (!sigmaOk && !piOk) setStatus('wrong-both')
    else if (!sigmaOk)     setStatus('wrong-sigma')
    else                   setStatus('wrong-pi')
  }

  const answered = status !== 'idle'

  return (
    <div className="flex flex-col gap-5 max-w-xl">

      {/* Progress hint */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-dim tracking-widest uppercase">
          σ / π Bond Practice
        </span>
        <button onClick={nextProblem}
          className="font-mono text-xs text-dim hover:text-secondary transition-colors">
          ↻ New problem
        </button>
      </div>

      {/* Problem card */}
      <div className="rounded-sm border border-border bg-surface overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border"
          style={{ background: 'color-mix(in srgb, var(--c-halogen) 6%, #141620)' }}>
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-base font-semibold text-primary">{problem.name}</span>
            <span className="font-mono text-sm" style={{ color: 'var(--c-halogen)' }}>
              {problem.formula}
            </span>
          </div>
        </div>

        {/* Structural formula */}
        <div className="px-4 py-3 border-b border-border flex flex-col gap-2">
          <span className="font-mono text-[9px] text-dim tracking-widest uppercase">Structure</span>
          <span className="font-mono text-sm text-primary tracking-wide">{problem.structural}</span>
          {problem.note && (
            <span className="font-sans text-[11px] text-dim italic">{problem.note}</span>
          )}
        </div>

        {/* Inputs */}
        <div className="px-4 py-3 flex flex-col gap-3">
          <span className="font-mono text-[9px] text-dim tracking-widest uppercase">
            Count the bonds
          </span>
          <div className="flex gap-4 flex-wrap">
            {/* σ input */}
            <div className="flex items-center gap-2">
              <label className="font-mono text-sm text-secondary w-16">σ bonds</label>
              <input
                type="number" min="0"
                value={sigmaStr}
                onChange={e => { setSigmaStr(e.target.value); setStatus('idle') }}
                onKeyDown={e => e.key === 'Enter' && !answered && check()}
                disabled={answered}
                className="w-20 px-3 py-1.5 rounded-sm border font-mono text-sm text-primary
                           bg-raised focus:outline-none transition-colors"
                style={{
                  borderColor: answered
                    ? (status === 'correct' || status === 'wrong-pi'
                        ? '#34d399'
                        : '#f87171')
                    : undefined,
                }}
                placeholder="?"
              />
            </div>

            {/* π input */}
            <div className="flex items-center gap-2">
              <label className="font-mono text-sm text-secondary w-16">π bonds</label>
              <input
                type="number" min="0"
                value={piStr}
                onChange={e => { setPiStr(e.target.value); setStatus('idle') }}
                onKeyDown={e => e.key === 'Enter' && !answered && check()}
                disabled={answered}
                className="w-20 px-3 py-1.5 rounded-sm border font-mono text-sm text-primary
                           bg-raised focus:outline-none transition-colors"
                style={{
                  borderColor: answered
                    ? (status === 'correct' || status === 'wrong-sigma'
                        ? '#34d399'
                        : '#f87171')
                    : undefined,
                }}
                placeholder="?"
              />
            </div>
          </div>

          {!answered ? (
            <button
              onClick={check}
              disabled={sigmaStr === '' || piStr === ''}
              className="self-start px-4 py-1.5 rounded-sm font-sans text-sm font-medium
                         transition-all disabled:opacity-40"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 18%, #0e1016)',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                color: 'var(--c-halogen)',
              }}>
              Check
            </button>
          ) : (
            <button onClick={nextProblem}
              className="self-start px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-all"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 18%, #0e1016)',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                color: 'var(--c-halogen)',
              }}>
              Next →
            </button>
          )}
        </div>
      </div>

      {/* Feedback */}
      {answered && (
        <div className="rounded-sm border overflow-hidden"
          style={{
            borderColor: status === 'correct' ? '#34d39950' : '#f8717150',
            background: status === 'correct'
              ? 'color-mix(in srgb, #34d399 6%, #0e1016)'
              : 'color-mix(in srgb, #f87171 6%, #0e1016)',
          }}>
          <div className="px-4 py-2 border-b"
            style={{ borderColor: 'inherit' }}>
            {status === 'correct' && (
              <span className="font-sans text-sm font-semibold" style={{ color: '#34d399' }}>
                Correct — {problem.sigma}σ and {problem.pi}π
              </span>
            )}
            {status === 'wrong-both' && (
              <span className="font-sans text-sm font-semibold" style={{ color: '#f87171' }}>
                Not quite — correct answer: {problem.sigma}σ and {problem.pi}π
              </span>
            )}
            {status === 'wrong-sigma' && (
              <span className="font-sans text-sm font-semibold" style={{ color: '#f87171' }}>
                σ count wrong — correct: {problem.sigma}σ (π was right: {problem.pi}π)
              </span>
            )}
            {status === 'wrong-pi' && (
              <span className="font-sans text-sm font-semibold" style={{ color: '#f87171' }}>
                π count wrong — correct: {problem.pi}π (σ was right: {problem.sigma}σ)
              </span>
            )}
          </div>
          <div className="px-4 py-3">
            <p className="font-sans text-xs text-secondary leading-relaxed">{problem.explanation}</p>
          </div>
        </div>
      )}

      {/* Reference rule */}
      <div className="rounded-sm border border-border bg-raised px-4 py-3 flex flex-col gap-2">
        <span className="font-mono text-[9px] text-dim tracking-widest uppercase">Quick rule</span>
        <div className="flex flex-col gap-1 font-mono text-xs text-secondary">
          <span>Single bond  A–B  → <span className="text-primary">1σ, 0π</span></span>
          <span>Double bond  A=B  → <span className="text-primary">1σ, 1π</span></span>
          <span>Triple bond  A≡B  → <span className="text-primary">1σ, 2π</span></span>
        </div>
        <p className="font-sans text-[10px] text-dim leading-relaxed mt-1">
          Every bond contains exactly one σ bond. π bonds are the additional bonds in double and triple bonds.
          Count the total number of bonds for σ, then add (order − 1) per bond for π.
        </p>
      </div>

    </div>
  )
}
