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
  const [showHint, setShowHint] = useState(false)

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
    setShowHint(false)

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

      {/* Problem header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-[10px] text-dim tracking-wider uppercase">Draw the Lewis structure of</span>
          <span className="font-sans font-semibold text-bright text-lg">{problem.label}</span>
          {fetching && <span className="font-mono text-[10px] text-dim animate-pulse">loading…</span>}
          <button
            onClick={() => setShowHint(h => !h)}
            className="ml-auto font-mono text-[10px] px-2 py-0.5 rounded-sm border border-border
                       text-dim hover:text-secondary transition-colors"
          >
            {showHint ? 'hide hint' : 'hint'}
          </button>
        </div>
        {showHint && (
          <p className="font-mono text-xs text-secondary px-3 py-2 rounded-sm border border-border"
            style={{ background: '#0e1016' }}>
            {problem.hint}
          </p>
        )}
        {fetchError && <p className="font-mono text-xs text-red-400">{fetchError}</p>}
      </div>

      {/* Problem picker */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className="font-mono text-[10px] text-dim mr-1">Molecule:</span>
        {PROBLEMS.map((p, i) => (
          <button
            key={p.formula + p.charge}
            onClick={() => setSelectedIdx(i)}
            className="font-mono text-[11px] px-2 py-0.5 rounded-sm border transition-colors"
            style={{
              borderColor: i === selectedIdx ? 'color-mix(in srgb, var(--c-halogen) 40%, transparent)' : '#1c1f2e',
              color: i === selectedIdx ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)',
              background: i === selectedIdx ? 'color-mix(in srgb, var(--c-halogen) 10%, #0e1016)' : 'transparent',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Editor — always mounted; correctStructure fed in for Check validation */}
      <LewisEditor
        correctStructure={correctStructure}
        onRequestStructure={requestStructure}
      />
    </div>
  )
}
