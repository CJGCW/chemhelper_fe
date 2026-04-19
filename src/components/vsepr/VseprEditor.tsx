import { useState } from 'react'
import type { LewisStructure } from '../../pages/LewisPage'
import VsepDiagram from './VsepDiagram'

// ── VSEPR tables ──────────────────────────────────────────────────────────────

const MOLECULAR_GEOMETRY: Record<string, string> = {
  '1-0': 'diatomic',
  '2-0': 'linear',
  '2-1': 'bent',
  '2-2': 'bent',
  '3-0': 'trigonal_planar',
  '3-1': 'trigonal_pyramidal',
  '3-2': 't_shaped',
  '4-0': 'tetrahedral',
  '4-1': 'see_saw',
  '4-2': 'square_planar',
  '5-0': 'trigonal_bipyramidal',
  '5-1': 'square_pyramidal',
  '6-0': 'octahedral',
}

const ELECTRON_GEOMETRY: Record<number, string> = {
  1: 'Linear', 2: 'Linear', 3: 'Trigonal Planar',
  4: 'Tetrahedral', 5: 'Trigonal Bipyramidal', 6: 'Octahedral',
}
const HYBRIDIZATION: Record<number, string> = {
  1: 's', 2: 'sp', 3: 'sp²', 4: 'sp³', 5: 'sp³d', 6: 'sp³d²',
}
const GEOMETRY_LABEL: Record<string, string> = {
  diatomic: 'Linear', linear: 'Linear', bent: 'Bent',
  trigonal_planar: 'Trigonal Planar', trigonal_pyramidal: 'Trigonal Pyramidal',
  tetrahedral: 'Tetrahedral', t_shaped: 'T-Shaped', see_saw: 'See-Saw',
  square_planar: 'Square Planar', square_pyramidal: 'Square Pyramidal',
  trigonal_bipyramidal: 'Trigonal Bipyramidal', octahedral: 'Octahedral',
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface VseprEditorState {
  centralElement:   string
  bondingPairs:     number
  lonePairs:        number
  terminalElements: string[]   // length === bondingPairs
}

interface ValidationCheck { label: string; passed: boolean; detail: string }
interface ValidationResult { passed: boolean; checks: ValidationCheck[] }

// ── Build a minimal LewisStructure for VsepDiagram rendering ─────────────────

function buildStructure(s: VseprEditorState): LewisStructure {
  const geoKey = MOLECULAR_GEOMETRY[`${s.bondingPairs}-${s.lonePairs}`] ?? 'linear'
  const center = { id: 'C0', element: s.centralElement || 'C', lone_pairs: s.lonePairs, formal_charge: 0 }
  const terms   = Array.from({ length: s.bondingPairs }, (_, i) => ({
    id: `T${i}`, element: s.terminalElements[i] || 'H', lone_pairs: 0, formal_charge: 0,
  }))
  const bonds = terms.map(t => ({ from: 'C0', to: t.id, order: 1 as const }))
  return {
    name: s.centralElement, formula: s.centralElement, charge: 0,
    total_valence_electrons: 0, geometry: geoKey,
    atoms: [center, ...terms], bonds, steps: [], notes: '',
  }
}

// ── Validation against a fetched correct structure ────────────────────────────

function validateAgainst(state: VseprEditorState, correct: LewisStructure): ValidationResult {
  const adj: Record<string, string[]> = {}
  correct.atoms.forEach(a => { adj[a.id] = [] })
  correct.bonds.forEach(b => { adj[b.from].push(b.to); adj[b.to].push(b.from) })
  const center = correct.atoms.reduce((best, a) => {
    const bc = adj[a.id].length, bb = adj[best.id].length
    if (bc > bb) return a
    if (bc === bb && best.element === 'H' && a.element !== 'H') return a
    return best
  })
  const correctBP = adj[center.id].length
  const correctLP = center.lone_pairs
  const correctTerminals = adj[center.id]
    .map(id => correct.atoms.find(a => a.id === id)!.element)
    .sort()
    .join(', ')
  const userTerminals = [...state.terminalElements]
    .slice(0, state.bondingPairs)
    .map(e => e || 'H')
    .sort()
    .join(', ')

  const centralOk  = (state.centralElement || 'C') === center.element
  const bpOk       = state.bondingPairs === correctBP
  const lpOk       = state.lonePairs    === correctLP
  const termOk     = userTerminals      === correctTerminals

  const checks: ValidationCheck[] = [
    {
      label:  'Central atom',
      passed: centralOk,
      detail: centralOk
        ? center.element
        : `Expected ${center.element}, got ${state.centralElement || '(none)'}`,
    },
    {
      label:  'Bonding pairs',
      passed: bpOk,
      detail: bpOk
        ? `${correctBP}`
        : `Expected ${correctBP}, got ${state.bondingPairs}`,
    },
    {
      label:  'Lone pairs on center',
      passed: lpOk,
      detail: lpOk
        ? `${correctLP}`
        : `Expected ${correctLP}, got ${state.lonePairs}`,
    },
    {
      label:  'Terminal atoms',
      passed: termOk,
      detail: termOk
        ? correctTerminals
        : `Expected ${correctTerminals}, got ${userTerminals || '(none)'}`,
    },
  ]

  return { passed: checks.every(c => c.passed), checks }
}

// ── Stepper ───────────────────────────────────────────────────────────────────

function Stepper({
  label, value, min, max, onChange,
}: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-xs text-secondary tracking-widest uppercase">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-7 h-7 rounded-sm border border-border font-mono text-sm text-dim
                     hover:text-primary hover:border-muted transition-colors
                     disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
        >−</button>
        <span className="font-mono text-base text-bright w-4 text-center">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-7 h-7 rounded-sm border border-border font-mono text-sm text-dim
                     hover:text-primary hover:border-muted transition-colors
                     disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
        >+</button>
      </div>
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface VseprEditorProps {
  correctStructure?: LewisStructure | null
  onValidated?:      (passed: boolean) => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function VseprEditor({ correctStructure, onValidated }: VseprEditorProps) {
  const [state, setState] = useState<VseprEditorState>({
    centralElement:   '',
    bondingPairs:     2,
    lonePairs:        0,
    terminalElements: ['', ''],
  })
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

  function update(patch: Partial<VseprEditorState>) {
    setState(prev => {
      const next = { ...prev, ...patch }
      // Keep terminalElements length in sync with bondingPairs
      const te = [...next.terminalElements]
      while (te.length < next.bondingPairs) te.push('')
      next.terminalElements = te.slice(0, next.bondingPairs)
      return next
    })
    setValidationResult(null)
  }

  function setBondingPairs(n: number) {
    // Also clamp lone pairs so total ≤ 6
    update({ bondingPairs: n, lonePairs: Math.min(state.lonePairs, 6 - n) })
  }

  function setLonePairs(n: number) {
    update({ lonePairs: n })
  }

  function setTerminal(i: number, el: string) {
    const te = [...state.terminalElements]
    te[i] = el
    update({ terminalElements: te })
  }

  function handleCheck() {
    if (!correctStructure) return
    const result = validateAgainst(state, correctStructure)
    setValidationResult(result)
    onValidated?.(result.passed)
  }

  const totalGroups  = state.bondingPairs + state.lonePairs
  const geoKey       = MOLECULAR_GEOMETRY[`${state.bondingPairs}-${state.lonePairs}`] ?? 'linear'
  const molGeo       = GEOMETRY_LABEL[geoKey]   ?? '—'
  const elecGeo      = ELECTRON_GEOMETRY[totalGroups] ?? '—'
  const hybrid       = HYBRIDIZATION[totalGroups]     ?? '—'
  const previewStruct = buildStructure(state)

  return (
    <div className="flex flex-col gap-5">

      {/* Controls */}
      <div className="flex flex-wrap gap-5 items-start">

        {/* Central atom */}
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">Central atom</span>
          <input
            type="text"
            value={state.centralElement}
            onChange={e => update({ centralElement: e.target.value.trim() })}
            placeholder="e.g. O"
            maxLength={3}
            className="w-20 bg-raised border border-border rounded-sm px-2 py-1.5 font-mono text-base
                       text-bright placeholder-dim focus:outline-none focus:border-muted transition-colors"
          />
        </div>

        {/* Bonding pairs */}
        <Stepper
          label="Bonding pairs"
          value={state.bondingPairs}
          min={1}
          max={6}
          onChange={setBondingPairs}
        />

        {/* Lone pairs */}
        <Stepper
          label="Lone pairs on center"
          value={state.lonePairs}
          min={0}
          max={Math.max(0, 6 - state.bondingPairs)}
          onChange={setLonePairs}
        />
      </div>

      {/* Terminal atom labels */}
      {state.bondingPairs > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">Terminal atoms</span>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: state.bondingPairs }, (_, i) => (
              <div key={i} className="flex flex-col gap-0.5 items-center">
                <span className="font-mono text-xs text-secondary">{i + 1}</span>
                <input
                  type="text"
                  value={state.terminalElements[i] ?? ''}
                  onChange={e => setTerminal(i, e.target.value.trim())}
                  placeholder="H"
                  maxLength={3}
                  className="w-14 bg-raised border border-border rounded-sm px-2 py-1 font-mono text-sm
                             text-bright placeholder-dim text-center
                             focus:outline-none focus:border-muted transition-colors"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live diagram */}
      <VsepDiagram structure={previewStruct} />

      {/* Derived geometry info */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Molecular Geometry', value: molGeo   },
          { label: 'Electron Geometry',  value: elecGeo  },
          { label: 'Hybridization',      value: hybrid   },
          { label: 'Total Groups',       value: String(totalGroups) },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-0.5 px-3 py-1.5 rounded-sm border border-border bg-raised">
            <span className="font-mono text-xs text-secondary tracking-widest uppercase">{label}</span>
            <span className="font-sans text-sm text-bright">{value}</span>
          </div>
        ))}
      </div>

      {/* Check button */}
      {correctStructure !== undefined && (
        <button
          onClick={handleCheck}
          disabled={!correctStructure || !state.centralElement.trim()}
          className="self-start px-5 py-2 rounded-sm font-sans text-sm font-medium
                     transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 15%, #141620)',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
            color: 'var(--c-halogen)',
          }}
        >
          Check
        </button>
      )}

      {/* Validation result */}
      {validationResult && (
        <div
          className="rounded-sm border p-4 flex flex-col gap-3"
          style={{
            borderColor: validationResult.passed
              ? 'color-mix(in srgb, #4ade80 30%, #1c1f2e)'
              : 'color-mix(in srgb, #f87171 30%, #1c1f2e)',
            background: validationResult.passed
              ? 'color-mix(in srgb, #4ade80 5%, #0e1016)'
              : 'color-mix(in srgb, #f87171 5%, #0e1016)',
          }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 18 }}>{validationResult.passed ? '✓' : '✗'}</span>
            <span className="font-sans font-semibold text-sm"
              style={{ color: validationResult.passed ? '#4ade80' : '#f87171' }}>
              {validationResult.passed ? 'Correct! Great work.' : 'Not quite — see details below.'}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {validationResult.checks.map((check, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="font-mono text-xs shrink-0 w-3"
                  style={{ color: check.passed ? '#4ade80' : '#f87171', marginTop: 1 }}>
                  {check.passed ? '✓' : '✗'}
                </span>
                <div>
                  <span className="font-sans text-xs font-medium text-primary">{check.label}: </span>
                  <span className="font-mono text-xs text-secondary">{check.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
