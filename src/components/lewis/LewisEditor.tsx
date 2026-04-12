import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  ConnectionMode,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  type Connection,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { EditorAtomNode, type AtomNodeType, type AtomNodeData, type ElectronSlots } from './EditorAtomNode'
import { EditorBondEdge, type BondEdgeType, type BondEdgeData } from './EditorBondEdge'
import type { LewisStructure, LewisAtom } from '../../pages/LewisPage'

// ── Valence electron map (for formal charge) ──────────────────────────────────

const VALENCE: Record<string, number> = {
  H: 1, He: 2,
  Li: 1, Be: 2, B: 3, C: 4, N: 5, O: 6, F: 7, Ne: 8,
  Na: 1, Mg: 2, Al: 3, Si: 4, P: 5, S: 6, Cl: 7, Ar: 8,
  K: 1, Ca: 2, Ga: 3, Ge: 4, As: 5, Se: 6, Br: 7, Kr: 8,
  Rb: 1, Sr: 2, In: 3, Sn: 4, Sb: 5, Te: 6, I: 7, Xe: 8,
}

const COMMON_ELEMENTS = ['H', 'C', 'N', 'O', 'F', 'Cl', 'S', 'P', 'Br', 'I', 'Na', 'B']

// Maps each handle id to the electron slot index it occupies (matches DOT_POS order).
const HANDLE_TO_SLOT: Record<string, number> = { n: 0, e: 1, s: 2, w: 3 }

// Distribute N lone electrons across 4 cardinal slots (max 2 per slot).
export function distributeElectrons(n: number): ElectronSlots {
  const slots: ElectronSlots = [0, 0, 0, 0]
  let rem = Math.min(n, 8)
  for (let i = 0; i < 4 && rem > 0; i++) {
    slots[i] = Math.min(2, rem) as 0 | 1 | 2
    rem -= slots[i]
  }
  return slots
}

export function totalElectrons(slots: ElectronSlots): number {
  return slots[0] + slots[1] + slots[2] + slots[3]
}

// ── Node / edge type registrations (defined outside component = no re-render) ──

const NODE_TYPES = { atom: EditorAtomNode }
const EDGE_TYPES = { bond: EditorBondEdge }

// ── Formal charge recomputation ───────────────────────────────────────────────

function recomputeFormalCharges(
  nodes: Node<AtomNodeData>[],
  edges: Edge<BondEdgeData>[],
): Node<AtomNodeData>[] {
  return nodes.map(node => {
    const degreeSum = edges
      .filter(e => e.source === node.id || e.target === node.id)
      .reduce((sum, e) => sum + ((e.data?.order as number) ?? 1), 0)
    const valence = VALENCE[node.data.element] ?? 4
    const fc = valence - totalElectrons(node.data.electronSlots ?? [0, 0, 0, 0]) - degreeSum
    return fc === node.data.formalCharge
      ? node
      : { ...node, data: { ...node.data, formalCharge: fc } }
  })
}

// ── Initial atom layout (circle) ──────────────────────────────────────────────

function layoutAtoms(atoms: LewisAtom[]): Node<AtomNodeData>[] {
  const cx = 220, cy = 170
  if (atoms.length === 0) return []
  if (atoms.length === 1) {
    const a = atoms[0]
    return [{ id: 'a0', type: 'atom', dragHandle: '.atom-body', position: { x: cx - 22, y: cy - 22 }, data: { element: a.element, electronSlots: distributeElectrons(a.lone_pairs * 2), formalCharge: 0 } }]
  }
  const r = Math.max(90, atoms.length * 20)
  return atoms.map((a, i) => {
    const angle = (-Math.PI / 2) + (2 * Math.PI * i) / atoms.length
    return {
      id: `a${i}`,
      type: 'atom',
      dragHandle: '.atom-body',
      position: { x: cx + Math.cos(angle) * r - 22, y: cy + Math.sin(angle) * r - 22 },
      data: { element: a.element, electronSlots: distributeElectrons(a.lone_pairs * 2), formalCharge: 0 },
    }
  })
}

// ── Validation ────────────────────────────────────────────────────────────────

interface ValidationCheck { label: string; passed: boolean; detail: string }
interface ValidationResult { passed: boolean; checks: ValidationCheck[] }

function bondSignaturesFromEditor(
  nodes: Node<AtomNodeData>[],
  edges: Edge<BondEdgeData>[],
): string[] {
  const elemById = Object.fromEntries(nodes.map(n => [n.id, n.data.element]))
  return edges
    .map(e => {
      const pair = [elemById[e.source] ?? '?', elemById[e.target] ?? '?'].sort().join('-')
      return `${pair}:${e.data?.order ?? 1}`
    })
    .sort()
}

function bondSignaturesFromStructure(structure: LewisStructure): string[] {
  const elemById = Object.fromEntries(structure.atoms.map(a => [a.id, a.element]))
  return structure.bonds
    .map(b => {
      const pair = [elemById[b.from] ?? '?', elemById[b.to] ?? '?'].sort().join('-')
      return `${pair}:${b.order}`
    })
    .sort()
}

function arraysEqual<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

function countBy<T>(arr: T[], key: (v: T) => string): Record<string, number> {
  const out: Record<string, number> = {}
  for (const v of arr) { const k = key(v); out[k] = (out[k] ?? 0) + 1 }
  return out
}

function validate(
  nodes: Node<AtomNodeData>[],
  edges: Edge<BondEdgeData>[],
  correct: LewisStructure,
): ValidationResult {
  const checks: ValidationCheck[] = []

  // 1. Atom counts
  const userElems = countBy(nodes, n => n.data.element)
  const correctElems = countBy(correct.atoms, a => a.element)
  const elemPass = JSON.stringify(Object.entries(userElems).sort()) === JSON.stringify(Object.entries(correctElems).sort())
  const fmtElems = (m: Record<string, number>) =>
    Object.entries(m).sort().map(([e, c]) => `${c}×${e}`).join(', ')
  checks.push({
    label: 'Atoms',
    passed: elemPass,
    detail: elemPass
      ? `Correct — ${fmtElems(correctElems)}`
      : `Expected ${fmtElems(correctElems)}, got ${fmtElems(userElems)}`,
  })

  // 2. Bond signatures (element-pair + order)
  const userSigs = bondSignaturesFromEditor(nodes, edges)
  const correctSigs = bondSignaturesFromStructure(correct)
  const bondsPass = arraysEqual(userSigs, correctSigs)
  const fmtSigs = (sigs: string[]) => sigs.map(s => s.replace(':', ' ×')).join(', ') || 'none'
  checks.push({
    label: 'Bonds',
    passed: bondsPass,
    detail: bondsPass
      ? `Correct — ${fmtSigs(correctSigs)}`
      : `Expected [${fmtSigs(correctSigs)}]\ngot [${fmtSigs(userSigs)}]`,
  })

  // 3. Lone electrons per element (compare against lone_pairs * 2 from API)
  const leByElem = (atoms: { element: string; le: number }[]) => {
    const out: Record<string, number[]> = {}
    for (const a of atoms) {
      ;(out[a.element] ??= []).push(a.le)
    }
    for (const k of Object.keys(out)) out[k].sort((a, b) => a - b)
    return out
  }
  const userLE = leByElem(nodes.map(n => ({ element: n.data.element, le: totalElectrons(n.data.electronSlots ?? [0, 0, 0, 0]) })))
  const correctLE = leByElem(correct.atoms.map(a => ({ element: a.element, le: a.lone_pairs * 2 })))
  const lpPass = JSON.stringify(userLE) === JSON.stringify(correctLE)
  checks.push({
    label: 'Lone electrons',
    passed: lpPass,
    detail: lpPass
      ? 'All lone electrons are correct'
      : Object.entries(correctLE)
          .map(([el, leArr]) => {
            const got = userLE[el] ?? []
            return arraysEqual(leArr, got) ? null : `${el}: expected [${leArr.join(',')}] e⁻, got [${got.join(',')}]`
          })
          .filter(Boolean)
          .join('; ') || 'Mismatch in lone electrons',
  })

  // 4. Formal charges
  const userFC = countBy(
    nodes.map(n => `${n.data.element}:${n.data.formalCharge}`),
    s => s,
  )
  const correctFC = countBy(
    correct.atoms.map(a => `${a.element}:${a.formal_charge}`),
    s => s,
  )
  const fcPass = JSON.stringify(Object.entries(userFC).sort()) === JSON.stringify(Object.entries(correctFC).sort())
  checks.push({
    label: 'Formal charges',
    passed: fcPass,
    detail: fcPass
      ? 'Formal charges are correct'
      : 'Formal charges don\'t match — check your lone pairs and bond orders',
  })

  return { passed: checks.every(c => c.passed), checks }
}

// ── Inner editor (needs ReactFlowProvider context) ───────────────────────────

export interface LewisEditorHandle {
  submitSilently: () => Promise<{ passed: boolean; nodes: AtomNodeType[]; edges: BondEdgeType[] } | null>
}

const EditorInner = forwardRef<LewisEditorHandle, {
  correctStructure: LewisStructure | null
  onRequestStructure: () => Promise<LewisStructure | null>
  onValidated?: (passed: boolean) => void
  initialNodes?: AtomNodeType[]
  initialEdges?: BondEdgeType[]
  hideCheck?: boolean
  canvasHeight?: number
}>(function EditorInner({
  correctStructure,
  onRequestStructure,
  onValidated,
  initialNodes,
  initialEdges,
  hideCheck,
  canvasHeight = 480,
}, ref) {
  const [nodes, setNodes, onNodesChange] = useNodesState<AtomNodeType>(initialNodes ?? [])
  const [edges, setEdges, onEdgesChange] = useEdgesState<BondEdgeType>(initialEdges ?? [])
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [validating, setValidating] = useState(false)
  const [loadedMol, setLoadedMol] = useState('')
  const [localStructure, setLocalStructure] = useState<LewisStructure | null>(null)
  const [formula, setFormula] = useState('')
  const [charge, setCharge] = useState('0')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [customElement, setCustomElement] = useState('')
  const nodeIdRef = useRef(0)

  useImperativeHandle(ref, () => ({
    async submitSilently() {
      if (nodes.length === 0) return null
      const correct = localStructure ?? correctStructure ?? await onRequestStructure()
      if (!correct) return null
      const result = validate(nodes as Node<AtomNodeData>[], edges as Edge<BondEdgeData>[], correct)
      return { passed: result.passed, nodes: nodes as AtomNodeType[], edges: edges as BondEdgeType[] }
    },
  }), [nodes, edges, localStructure, correctStructure, onRequestStructure])

  function addAtom(element: string) {
    const el = element.trim()
    if (!el) return
    const id = `a${++nodeIdRef.current}`
    const spread = (nodeIdRef.current % 6) * 15
    setNodes(nds => [...nds, {
      id, type: 'atom',
      dragHandle: '.atom-body',
      position: { x: 180 + spread, y: 150 + Math.floor(nodeIdRef.current / 6) * 15 },
      data: { element: el, electronSlots: distributeElectrons(VALENCE[el] ?? 0), formalCharge: 0 },
    } as AtomNodeType])
  }

  // Recompute formal charges whenever edges or lone pairs change
  useEffect(() => {
    setNodes(nds => recomputeFormalCharges(nds as Node<AtomNodeData>[], edges as Edge<BondEdgeData>[]) as AtomNodeType[])
  }, [edges]) // eslint-disable-line react-hooks/exhaustive-deps

  // Also recompute when nodes change (e.g., LP updated)
  const onNodesChangeWrapped: typeof onNodesChange = useCallback((changes) => {
    onNodesChange(changes)
    // Trigger fc recompute on next tick after state settles
    setTimeout(() => {
      setNodes(nds => recomputeFormalCharges(nds as Node<AtomNodeData>[], edges as Edge<BondEdgeData>[]) as AtomNodeType[])
    }, 0)
  }, [onNodesChange, edges]) // eslint-disable-line react-hooks/exhaustive-deps

  const onConnect = useCallback((connection: Connection) => {
    if (connection.source === connection.target) return

    // Zero out the electron slot on each end of the new bond.
    setNodes(nds => nds.map(node => {
      let slotIdx = -1
      if (node.id === connection.source && connection.sourceHandle)
        slotIdx = HANDLE_TO_SLOT[connection.sourceHandle] ?? -1
      else if (node.id === connection.target && connection.targetHandle)
        slotIdx = HANDLE_TO_SLOT[connection.targetHandle] ?? -1
      if (slotIdx === -1) return node
      const cur = node.data.electronSlots ?? ([0, 0, 0, 0] as ElectronSlots)
      if (cur[slotIdx] === 0) return node
      const next = [...cur] as ElectronSlots
      next[slotIdx] = 0
      return { ...node, data: { ...node.data, electronSlots: next } }
    }))

    setEdges(eds => {
      // Reject if this pair is already bonded, or if either handle is already in use.
      const handleUsed = (nodeId: string, handleId: string | null | undefined) =>
        !!handleId && eds.some(e =>
          (e.source === nodeId && e.sourceHandle === handleId) ||
          (e.target === nodeId && e.targetHandle === handleId)
        )
      if (
        handleUsed(connection.source, connection.sourceHandle) ||
        handleUsed(connection.target, connection.targetHandle)
      ) return eds
      return addEdge({ ...connection, type: 'bond', data: { order: 1 } }, eds)
    })
  }, [setEdges, setNodes])

  async function handleLoad() {
    const f = formula.trim()
    if (!f) return
    setLoadError(null)
    setValidationResult(null)
    const c = Number(charge) || 0
    const body: Record<string, unknown> = { input: f }
    if (c !== 0) body.charge = c
    try {
      const resp = await fetch('/api/structure/lewis', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await resp.json()
      if (!resp.ok) { setLoadError(data.error ?? 'Error'); return }
      const structure = data as LewisStructure
      setLocalStructure(structure)
      const initial = layoutAtoms(structure.atoms)
      setNodes(initial as AtomNodeType[])
      setEdges([])
      setLoadedMol(`${f}${c !== 0 ? ` (charge ${c > 0 ? '+' : ''}${c})` : ''}`)
      nodeIdRef.current = initial.length
    } catch {
      setLoadError('Failed to connect to server.')
    }
  }

  async function handleCheck() {
    if (nodes.length === 0) return
    setValidating(true)
    setValidationResult(null)
    try {
      // Priority: structure loaded in this editor > Generate tab cache > fetch by formula.
      let correct = localStructure ?? correctStructure ?? await onRequestStructure()

      if (!correct) {
        // Last resort: fetch using whatever is in the formula field.
        const f = formula.trim()
        if (!f) {
          setValidationResult({ passed: false, checks: [{ label: 'No target', passed: false, detail: 'Enter a formula in the field above so Check knows what to compare against.' }] })
          return
        }
        const c = Number(charge) || 0
        const body: Record<string, unknown> = { input: f }
        if (c !== 0) body.charge = c
        const resp = await fetch('/api/structure/lewis', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!resp.ok) {
          const err = await resp.json()
          setValidationResult({ passed: false, checks: [{ label: 'Error', passed: false, detail: err.error ?? 'Failed to fetch target structure.' }] })
          return
        }
        correct = await resp.json() as LewisStructure
        setLocalStructure(correct)
      }

      const result = validate(nodes as Node<AtomNodeData>[], edges as Edge<BondEdgeData>[], correct)

      setValidationResult(result)
      onValidated?.(result.passed)
    } finally {
      setValidating(false)
    }
  }

  function handleClear() {
    setNodes([])
    setEdges([])
    setValidationResult(null)
    setLoadedMol('')
    setLocalStructure(null)
    nodeIdRef.current = 0
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Load molecule row */}
      <div className="flex items-stretch gap-2 flex-wrap">
        <input
          type="text"
          value={formula}
          onChange={e => setFormula(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLoad()}
          placeholder="Formula (e.g. NO3, SO4)"
          className="flex-1 min-w-[120px] font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2
                     text-primary placeholder-dim focus:outline-none transition-colors"
        />
        <input
          type="text"
          inputMode="numeric"
          value={charge}
          onChange={e => setCharge(e.target.value)}
          placeholder="Charge"
          className="w-20 font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2
                     text-primary placeholder-dim focus:outline-none transition-colors text-right"
        />
        <button
          onClick={handleLoad}
          className="px-4 py-2 rounded-sm font-sans text-sm font-medium transition-all"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 14%, #0e1016)',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
            color: 'var(--c-halogen)',
          }}
        >
          Load atoms
        </button>
      </div>
      {loadError && <p className="font-mono text-xs text-red-400">{loadError}</p>}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-sm border border-border"
        style={{ background: '#0a0b0f' }}>

        {/* Element buttons */}
        <div className="flex items-center gap-1 flex-wrap">
          {COMMON_ELEMENTS.map(el => (
            <button
              key={el}
              onClick={() => addAtom(el)}
              className="w-8 h-8 rounded-sm font-sans font-bold text-xs transition-all"
              style={{
                background: '#141620',
                border: '1px solid #1c1f2e',
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              {el}
            </button>
          ))}
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={customElement}
              onChange={e => setCustomElement(e.target.value.slice(0, 2))}
              onKeyDown={e => e.key === 'Enter' && addAtom(customElement)}
              placeholder="…"
              className="w-10 h-8 font-mono text-xs bg-raised border border-border rounded-sm px-2
                         text-primary placeholder-dim focus:outline-none text-center transition-colors"
            />
            <button
              onClick={() => addAtom(customElement)}
              disabled={!customElement.trim()}
              className="h-8 px-2 rounded-sm font-sans text-xs font-medium transition-all disabled:opacity-30"
              style={{ background: '#141620', border: '1px solid #1c1f2e', color: 'rgba(255,255,255,0.5)' }}
            >
              +
            </button>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleClear}
            className="px-3 h-8 rounded-sm font-sans text-xs font-medium transition-all"
            style={{ background: '#141620', border: '1px solid #1c1f2e', color: 'rgba(255,255,255,0.5)' }}
          >
            Clear
          </button>
          {!hideCheck && (
            <button
              onClick={handleCheck}
              disabled={nodes.length === 0 || validating}
              className="px-4 h-8 rounded-sm font-sans text-sm font-medium transition-all disabled:opacity-40"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 18%, #0e1016)',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                color: 'var(--c-halogen)',
              }}
            >
              {validating ? '…' : 'Check'}
            </button>
          )}
        </div>
      </div>

      {/* Hint bar */}
      <p className="font-mono text-[10px] text-dim">
        Click an element to add it. Drag from a handle (●) to connect. Click a bond to cycle 1→2→3. Select + Delete to remove. Click a dot to remove an electron; click a ghost dot to add one.
        {loadedMol && (
          <span className="ml-2 text-secondary">Loaded: <span style={{ color: 'var(--c-halogen)' }}>{loadedMol}</span></span>
        )}
      </p>

      {/* Canvas */}
      <div
        style={{
          height: canvasHeight,
          border: '1px solid #1c1f2e',
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChangeWrapped}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES}
          connectionMode={ConnectionMode.Loose}
          colorMode="dark"
          fitView
          fitViewOptions={{ padding: 0.5 }}
          deleteKeyCode={['Backspace', 'Delete']}
          style={{ background: '#0e1016' }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1c1f2e" />
          <Controls />
        </ReactFlow>
      </div>

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
            <span className="font-sans font-semibold text-sm" style={{ color: validationResult.passed ? '#4ade80' : '#f87171' }}>
              {validationResult.passed ? 'Correct! Great work.' : 'Not quite — see details below.'}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {validationResult.checks.map((check, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="font-mono text-xs shrink-0 w-3" style={{ color: check.passed ? '#4ade80' : '#f87171', marginTop: 1 }}>
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
})

// ── Public component (wraps with provider) ────────────────────────────────────

interface LewisEditorProps {
  correctStructure: LewisStructure | null
  onRequestStructure: () => Promise<LewisStructure | null>
  onValidated?: (passed: boolean) => void
  initialNodes?: AtomNodeType[]
  initialEdges?: BondEdgeType[]
  hideCheck?: boolean
  canvasHeight?: number
}

const LewisEditor = forwardRef<LewisEditorHandle, LewisEditorProps>(
  function LewisEditor({ correctStructure, onRequestStructure, onValidated, initialNodes, initialEdges, hideCheck, canvasHeight }, ref) {
    return (
      <ReactFlowProvider>
        <EditorInner
          ref={ref}
          correctStructure={correctStructure}
          onRequestStructure={onRequestStructure}
          onValidated={onValidated}
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          hideCheck={hideCheck}
          canvasHeight={canvasHeight}
        />
      </ReactFlowProvider>
    )
  }
)

export default LewisEditor
