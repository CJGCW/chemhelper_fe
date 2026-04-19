import { useCallback, useEffect, useRef, useState } from 'react'
import LewisEditor from './LewisEditor'
import type { LewisStructure } from '../../pages/LewisPage'

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

export default function LewisStructurePractice() {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [correctStructure, setCorrectStructure] = useState<LewisStructure | null>(null)
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // "Other" — custom molecule
  const [showOther, setShowOther]       = useState(false)
  const [otherFormula, setOtherFormula] = useState('')
  const [otherCharge, setOtherCharge]   = useState('0')
  const [otherError, setOtherError]     = useState<string | null>(null)

  async function loadOther() {
    const f = otherFormula.trim(); if (!f) return
    const c = Number(otherCharge) || 0
    setFetching(true); setFetchError(null); setOtherError(null); setCorrectStructure(null)
    const body: Record<string, unknown> = { input: f }
    if (c !== 0) body.charge = c
    try {
      const resp = await fetch('/api/structure/lewis', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      const d = await resp.json()
      if (resp.ok) setCorrectStructure(d as LewisStructure)
      else setOtherError(d.error ?? 'Failed to load.')
    } catch { setOtherError('Failed to connect.') }
    finally { setFetching(false) }
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


    const body: Record<string, unknown> = { input: problem.formula }
    if (problem.charge !== 0) body.charge = problem.charge

    fetch('/api/structure/lewis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(r => r.json().then(d => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (cancelled) return
        if (ok) setCorrectStructure(d as LewisStructure)
        else setFetchError(d.error ?? 'Failed to load problem.')
      })
      .catch(() => { if (!cancelled) setFetchError('Failed to connect to server.') })
      .finally(() => { if (!cancelled) setFetching(false) })

    return () => { cancelled = true }
  }, [selectedIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-5">

      {/* Problem picker */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className="font-mono text-[10px] text-dim mr-1">Molecule:</span>
        {PROBLEMS.map((p, i) => (
          <button
            key={p.formula + p.charge}
            onClick={() => { setShowOther(false); setSelectedIdx(i) }}
            className="font-mono text-[11px] px-2 py-0.5 rounded-sm border transition-colors"
            style={{
              borderColor: i === selectedIdx && !showOther ? 'color-mix(in srgb, var(--c-halogen) 40%, transparent)' : '#1c1f2e',
              color: i === selectedIdx && !showOther ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)',
              background: i === selectedIdx && !showOther ? 'color-mix(in srgb, var(--c-halogen) 10%, #0e1016)' : 'transparent',
            }}
          >
            {p.label}
          </button>
        ))}
        {/* Other — custom molecule inline with molecule buttons */}
        <button
          onClick={() => setShowOther(v => !v)}
          className="font-mono text-[11px] px-2 py-0.5 rounded-sm border transition-colors"
          style={{
            borderColor: showOther ? 'color-mix(in srgb, var(--c-halogen) 40%, transparent)' : '#1c1f2e',
            color: showOther ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)',
            background: showOther ? 'color-mix(in srgb, var(--c-halogen) 10%, #0e1016)' : 'transparent',
          }}
        >
          Other {showOther ? '▴' : '▾'}
        </button>
        {showOther && (
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
              style={{ borderColor: '#1c1f2e', color: 'rgba(255,255,255,0.6)', background: '#141620' }}
            >
              Load
            </button>
            {otherError && <span className="font-mono text-[10px] text-red-400">{otherError}</span>}
          </>
        )}
        {fetching && <span className="font-mono text-[10px] text-dim animate-pulse">loading…</span>}
        {fetchError && <span className="font-mono text-[10px] text-red-400">{fetchError}</span>}
      </div>

      {/* Editor — always mounted; correctStructure fed in for Check validation */}
      <LewisEditor
        correctStructure={correctStructure}
        onRequestStructure={requestStructure}
      />
    </div>
  )
}
