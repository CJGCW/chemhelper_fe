import { useCallback, useEffect, useRef, useState } from 'react'
import LewisEditor from './LewisEditor'
import type { LewisStructure } from '../../pages/LewisPage'
import { fetchLewisStructure } from '../../api/calculations'
import { countSigmaPi, buildExplanation, type SigmaPiResult } from '../../utils/sigmaPiPractice'

// ── Practice problem pool ─────────────────────────────────────────────────────

const PROBLEMS = [
  { label: 'H₂O',   formula: 'H2O',  charge:  0, hint: 'bent — 2 bonding, 2 lone pairs'              },
  { label: 'CO₂',   formula: 'CO2',  charge:  0, hint: 'linear — 2 double bonds'                      },
  { label: 'NH₃',   formula: 'NH3',  charge:  0, hint: 'trigonal pyramidal — 3 bonding, 1 lone pair'  },
  { label: 'CH₄',   formula: 'CH4',  charge:  0, hint: 'tetrahedral — 4 bonding, 0 lone pairs'        },
  { label: 'BF₃',   formula: 'BF3',  charge:  0, hint: 'trigonal planar — incomplete octet on B'      },
  { label: 'SO₂',   formula: 'SO2',  charge:  0, hint: 'bent — resonance structure'                   },
  { label: 'NO₃⁻',  formula: 'NO3',  charge: -1, hint: 'trigonal planar — resonance'                  },
  { label: 'NH₄⁺',  formula: 'NH4',  charge:  1, hint: 'tetrahedral — 4 bonding, 0 lone pairs'        },
  { label: 'SO₄²⁻', formula: 'SO4',  charge: -2, hint: 'tetrahedral — expanded octet'                 },
  { label: 'PCl₅',  formula: 'PCl5', charge:  0, hint: 'trigonal bipyramidal — expanded octet'        },
  { label: 'SF₆',   formula: 'SF6',  charge:  0, hint: 'octahedral — expanded octet'                  },
  { label: 'XeF₄',  formula: 'XeF4', charge:  0, hint: 'square planar — 2 lone pairs, expanded octet' },
  { label: 'HCN',   formula: 'HCN',  charge:  0, hint: 'linear — triple bond between C and N'         },
  { label: 'OF₂',   formula: 'OF2',  charge:  0, hint: 'bent — O is the central atom'                 },
]

// ── Component ─────────────────────────────────────────────────────────────────

interface Props { allowCustom?: boolean }

export default function LewisStructurePractice({ allowCustom = true }: Props) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [correctStructure, setCorrectStructure] = useState<LewisStructure | null>(null)
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // "Other" — custom molecule
  const [showOther, setShowOther]       = useState(false)
  const [otherFormula, setOtherFormula] = useState('')
  const [otherCharge, setOtherCharge]   = useState('0')
  const [otherError, setOtherError]     = useState<string | null>(null)

  // σ/π bond counting
  const [sigmaStr, setSigmaStr] = useState('')
  const [piStr,    setPiStr]    = useState('')
  const [bondResult, setBondResult] = useState<SigmaPiResult | null>(null)
  const [bondExplanation, setBondExplanation] = useState<string | null>(null)

  function checkBonds() {
    if (!correctStructure) return
    const { sigma, pi } = countSigmaPi(correctStructure)
    const s = parseInt(sigmaStr, 10)
    const p = parseInt(piStr, 10)
    if (isNaN(s) || isNaN(p)) { setBondResult('wrong-both'); return }
    const sigmaOk = s === sigma
    const piOk    = p === pi
    const result: SigmaPiResult = sigmaOk && piOk ? 'correct'
      : !sigmaOk && !piOk ? 'wrong-both'
      : !sigmaOk ? 'wrong-sigma'
      : 'wrong-pi'
    setBondResult(result)
    if (result !== 'correct') setBondExplanation(buildExplanation(correctStructure, sigma, pi))
    else setBondExplanation(null)
  }

  function resetBonds() {
    setSigmaStr(''); setPiStr(''); setBondResult(null); setBondExplanation(null)
  }

  async function loadOther() {
    const f = otherFormula.trim(); if (!f) return
    const c = Number(otherCharge) || 0
    setFetching(true); setFetchError(null); setOtherError(null); setCorrectStructure(null)
    try {
      const d = await fetchLewisStructure(f, c)
      setCorrectStructure(d)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setOtherError(msg ?? 'Failed to connect.')
    } finally { setFetching(false) }
  }

  const problem = PROBLEMS[selectedIdx]

  // Always serve the latest cached structure when the editor requests it
  const structureRef = useRef<LewisStructure | null>(null)
  structureRef.current = correctStructure
  const requestStructure = useCallback(async () => structureRef.current, [])

  useEffect(() => {
    let cancelled = false
    setCorrectStructure(null)
    setFetchError(null)
    setFetching(true)
    resetBonds()


    fetchLewisStructure(problem.formula, problem.charge)
      .then(d => { if (!cancelled) setCorrectStructure(d) })
      .catch((err: unknown) => {
        if (cancelled) return
        const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        setFetchError(msg ?? 'Failed to connect to server.')
      })
      .finally(() => { if (!cancelled) setFetching(false) })

    return () => { cancelled = true }
  }, [selectedIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-5">

      {/* Problem picker */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className="font-mono text-xs text-secondary mr-1">Molecule:</span>
        {PROBLEMS.map((p, i) => (
          <button
            key={p.formula + p.charge}
            onClick={() => { setShowOther(false); setSelectedIdx(i) }}
            className="font-mono text-[11px] px-2 py-0.5 rounded-sm border transition-colors"
            style={{
              borderColor: i === selectedIdx && !showOther ? 'color-mix(in srgb, var(--c-halogen) 40%, transparent)' : 'rgb(var(--color-border))',
              color: i === selectedIdx && !showOther ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)',
              background: i === selectedIdx && !showOther ? 'color-mix(in srgb, var(--c-halogen) 10%, rgb(var(--color-surface)))' : 'transparent',
            }}
          >
            {p.label}
          </button>
        ))}
        {/* Other — custom molecule inline with molecule buttons */}
        {allowCustom && <button
          onClick={() => setShowOther(v => !v)}
          className="font-mono text-[11px] px-2 py-0.5 rounded-sm border transition-colors"
          style={{
            borderColor: showOther ? 'color-mix(in srgb, var(--c-halogen) 40%, transparent)' : 'rgb(var(--color-border))',
            color: showOther ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)',
            background: showOther ? 'color-mix(in srgb, var(--c-halogen) 10%, rgb(var(--color-surface)))' : 'transparent',
          }}
        >
          Other {showOther ? '▴' : '▾'}
        </button>}
        {allowCustom && showOther && (
          <>
            <input
              type="text" value={otherFormula} onChange={e => setOtherFormula(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') loadOther() }}
              placeholder="Formula"
              className="font-mono text-[11px] px-2 py-0.5 rounded-sm border border-border bg-raised text-primary placeholder-dim focus:outline-none"
              style={{ width: 100 }}
            />
            <input
              type="text" inputMode="numeric" value={otherCharge} onChange={e => setOtherCharge(e.target.value)}
              placeholder="0"
              className="font-mono text-[11px] px-2 py-0.5 rounded-sm border border-border bg-raised text-primary placeholder-dim focus:outline-none text-center"
              style={{ width: 40 }}
            />
            <button
              onClick={loadOther}
              disabled={!otherFormula.trim() || fetching}
              className="font-mono text-[11px] px-2 py-0.5 rounded-sm border transition-colors disabled:opacity-40"
              style={{ borderColor: 'rgb(var(--color-border))', color: 'rgba(var(--overlay),0.6)', background: 'rgb(var(--color-raised))' }}
            >
              Load
            </button>
            {otherError && <span className="font-mono text-[10px] text-red-400">{otherError}</span>}
          </>
        )}
        {fetching && <span className="font-mono text-xs text-secondary animate-pulse">loading…</span>}
        {fetchError && <span className="font-mono text-[10px] text-red-400">{fetchError}</span>}
      </div>

      {/* Editor — always mounted; correctStructure fed in for Check validation */}
      <LewisEditor
        correctStructure={correctStructure}
        onRequestStructure={requestStructure}
      />

      {/* σ / π bond counting */}
      <div className="flex flex-col gap-3 p-4 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
        <p className="font-mono text-xs tracking-widest text-secondary uppercase">Bond Count Validation</p>
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] text-dim">σ bonds</span>
            <input
              type="text" inputMode="numeric" value={sigmaStr}
              onChange={e => { setSigmaStr(e.target.value); setBondResult(null) }}
              onKeyDown={e => e.key === 'Enter' && checkBonds()}
              placeholder="0"
              className="w-16 font-mono text-sm bg-raised border border-border rounded-sm px-3 py-1.5 text-primary placeholder-dim focus:outline-none transition-colors"
              style={{
                border: `1px solid ${
                  bondResult === 'correct' ? 'color-mix(in srgb, #22c55e 45%, transparent)'
                  : bondResult === 'wrong-sigma' || bondResult === 'wrong-both' ? 'color-mix(in srgb, #ef4444 45%, transparent)'
                  : 'rgba(var(--overlay),0.12)'
                }`
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] text-dim">π bonds</span>
            <input
              type="text" inputMode="numeric" value={piStr}
              onChange={e => { setPiStr(e.target.value); setBondResult(null) }}
              onKeyDown={e => e.key === 'Enter' && checkBonds()}
              placeholder="0"
              className="w-16 font-mono text-sm bg-raised border border-border rounded-sm px-3 py-1.5 text-primary placeholder-dim focus:outline-none transition-colors"
              style={{
                border: `1px solid ${
                  bondResult === 'correct' ? 'color-mix(in srgb, #22c55e 45%, transparent)'
                  : bondResult === 'wrong-pi' || bondResult === 'wrong-both' ? 'color-mix(in srgb, #ef4444 45%, transparent)'
                  : 'rgba(var(--overlay),0.12)'
                }`
              }}
            />
          </div>
          <button
            onClick={checkBonds}
            disabled={!correctStructure || (!sigmaStr && !piStr)}
            className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-all disabled:opacity-40"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))',
              border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
              color: 'var(--c-halogen)',
            }}
          >
            Check
          </button>
          {bondResult === 'correct' && (
            <span className="font-mono text-sm" style={{ color: '#22c55e' }}>✓ Correct</span>
          )}
          {bondResult && bondResult !== 'correct' && (() => {
            const { sigma, pi } = correctStructure ? countSigmaPi(correctStructure) : { sigma: 0, pi: 0 }
            return (
              <span className="font-sans text-xs" style={{ color: '#ef4444' }}>
                {bondResult === 'wrong-sigma' ? `σ should be ${sigma}` :
                 bondResult === 'wrong-pi'    ? `π should be ${pi}` :
                 `σ should be ${sigma}, π should be ${pi}`}
              </span>
            )
          })()}
        </div>
        {bondExplanation && (
          <p className="font-mono text-xs text-secondary leading-relaxed">{bondExplanation}</p>
        )}
        <p className="font-mono text-[10px] text-dim">single bond = 1σ · double = 1σ+1π · triple = 1σ+2π</p>
      </div>

      <p className="font-mono text-xs text-secondary">total valence e⁻ = sum of group numbers · fill octets outward from bonds · minimize formal charge</p>
    </div>
  )
}
