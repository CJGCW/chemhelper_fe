import { Handle, Position, useReactFlow, useEdges, type NodeProps, type Node } from '@xyflow/react'

// ── Types ─────────────────────────────────────────────────────────────────────

export type ElectronSlots = [number, number, number, number] // [top, right, bottom, left], each 0–2

export function distributeElectrons(n: number): ElectronSlots {
  const slots: ElectronSlots = [0, 0, 0, 0]
  let rem = Math.min(n, 8)
  for (let i = 0; i < 4 && rem > 0; i++) { slots[i] = Math.min(2, rem) as 0|1|2; rem -= slots[i] }
  return slots
}

export function totalElectrons(slots: ElectronSlots): number {
  return slots[0] + slots[1] + slots[2] + slots[3]
}

export type AtomNodeData = {
  element: string
  electronSlots: ElectronSlots  // lone electrons per cardinal position
  formalCharge: number          // computed externally and passed in
  [key: string]: unknown        // React Flow requirement
}

export type AtomNodeType = Node<AtomNodeData, 'atom'>

// ── Element colours — matches LewisStructureDiagram ──────────────────────────

const ELEM_COLORS: Record<string, string> = {
  H:  '#9ca3af',
  C:  '#e2e8f0',
  N:  '#6ea8fe',
  O:  '#f87171',
  F:  '#4ade80',
  Cl: '#4ade80',
  Br: '#fb923c',
  I:  '#c084fc',
  S:  '#fbbf24',
  P:  '#fb923c',
  Na: '#a78bfa',
  K:  '#818cf8',
  Li: '#c084fc',
  Ca: '#94a3b8',
  Mg: '#6ee7b7',
  Al: '#94a3b8',
  Si: '#a8a29e',
  Fe: '#c07040',
  Cu: '#c88050',
  Zn: '#7080b0',
  B:  '#fb923c',
  Xe: '#60a5fa',
  Kr: '#818cf8',
}

const CANVAS_BG = '#0b0e17'

// ── 4 connection handles ──────────────────────────────────────────────────────

const HANDLES: { id: string; position: Position; style: React.CSSProperties }[] = [
  { id: 'n', position: Position.Top,    style: { top: -5,    left: '50%', transform: 'translateX(-50%)' } },
  { id: 'e', position: Position.Right,  style: { right: -5,  top:  '50%', transform: 'translateY(-50%)' } },
  { id: 's', position: Position.Bottom, style: { bottom: -5, left: '50%', transform: 'translateX(-50%)' } },
  { id: 'w', position: Position.Left,   style: { left: -5,   top:  '50%', transform: 'translateY(-50%)' } },
]

// ── Electron dot positions (cardinal, outside the handles) ────────────────────

const HANDLE_SIDES: Record<string, number[]> = {
  n: [0], e: [1], s: [2], w: [3],
}

const DOT_POS: { style: React.CSSProperties; horizontal: boolean }[] = [
  { style: { top: 8,    left: '50%', transform: 'translateX(-50%)' }, horizontal: true  },
  { style: { right: 4,  top:  '50%', transform: 'translateY(-50%)' }, horizontal: false },
  { style: { bottom: 8, left: '50%', transform: 'translateX(-50%)' }, horizontal: true  },
  { style: { left: 4,   top:  '50%', transform: 'translateY(-50%)' }, horizontal: false },
]

const DOT_SIZE = 3
const DOT_GAP  = 2

// ── Component ─────────────────────────────────────────────────────────────────

export function EditorAtomNode({ id, data, selected }: NodeProps<AtomNodeType>) {
  const { updateNodeData } = useReactFlow()
  const color = ELEM_COLORS[data.element] ?? '#60a5fa'
  const slots: ElectronSlots = data.electronSlots ?? [0, 0, 0, 0]

  // Determine which cardinal sides are occupied by a bond.
  const allEdges = useEdges()
  const blockedSides = new Set<number>()
  for (const edge of allEdges) {
    const handle = edge.source === id ? edge.sourceHandle : edge.target === id ? edge.targetHandle : null
    if (handle) {
      for (const side of HANDLE_SIDES[handle] ?? []) blockedSides.add(side)
    }
  }

  const chargeLabel =
    data.formalCharge === 0 ? null
    : data.formalCharge === 1 ? '+'
    : data.formalCharge === -1 ? '−'
    : data.formalCharge > 0 ? `+${data.formalCharge}`
    : String(data.formalCharge)

  const handleBase: React.CSSProperties = {
    width: 10, height: 10,
    background: CANVAS_BG,
    border: '1.5px solid var(--c-halogen)',
    borderRadius: '50%',
    position: 'absolute',
  }

  function clickDot(posIdx: number, _sub: number, filled: boolean) {
    const newSlots: ElectronSlots = [...slots] as ElectronSlots
    if (filled) {
      newSlots[posIdx] = Math.max(0, newSlots[posIdx] - 1)
    } else {
      newSlots[posIdx] = Math.min(2, newSlots[posIdx] + 1)
    }
    updateNodeData(id, { electronSlots: newSlots })
  }

  // Atom body sizing — matches reference atomMetrics proportions
  const is2Char = data.element.length > 1
  const bodyW   = is2Char ? 30 : 24
  const bodyH   = 22
  const fontSize = is2Char ? 12 : 15

  return (
    <div style={{ position: 'relative', width: 44, height: 44 }}>

      {/* 4 connection handles */}
      {HANDLES.map(h => (
        <Handle
          key={h.id}
          id={h.id}
          type="source"
          position={h.position}
          style={{ ...handleBase, ...h.style }}
        />
      ))}

      {/* Electron dots — click filled to remove, click ghost to add */}
      {DOT_POS.map(({ style, horizontal }, posIdx) => {
        if (blockedSides.has(posIdx)) return null
        const count = slots[posIdx]
        return (
          <div
            key={posIdx}
            style={{
              position: 'absolute',
              display: 'flex',
              gap: DOT_GAP,
              flexDirection: horizontal ? 'row' : 'column',
              alignItems: 'center',
              zIndex: 2,
              ...style,
            }}
          >
            {([0, 1] as const).map(sub => {
              if (sub > count) return null
              const filled = sub < count
              const isGhost = !filled && count < 2
              if (!filled && !isGhost) return null
              return (
                <div
                  key={sub}
                  onClick={e => { e.stopPropagation(); clickDot(posIdx, sub, filled) }}
                  style={{
                    width: DOT_SIZE,
                    height: DOT_SIZE,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: filled ? 'rgba(var(--overlay),0.85)' : 'transparent',
                    border: isGhost ? '1.5px dashed rgba(var(--overlay),0.22)' : 'none',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                  }}
                />
              )
            })}
          </div>
        )
      })}

      {/* Formal charge badge */}
      {chargeLabel && (
        <div style={{
          position: 'absolute', top: -11, right: -7, zIndex: 10,
          width: 12, height: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 700,
          color: 'rgba(var(--overlay),0.9)',
          fontFamily: 'system-ui, sans-serif',
          lineHeight: 1,
          background: CANVAS_BG,
          border: '0.5px solid rgba(var(--overlay),0.25)',
          borderRadius: '50%',
          paddingBottom: '1px',
        }}>
          {chargeLabel}
        </div>
      )}

      {/* Atom body — dark rect + text, mirrors the reference clearance-rect style */}
      <div
        className="atom-body"
        style={{
          position: 'absolute',
          left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          width: bodyW,
          height: bodyH,
          background: CANVAS_BG,
          border: `1px solid ${selected
            ? 'var(--c-halogen)'
            : 'rgba(var(--overlay),0.13)'}`,
          borderRadius: 2,
          boxShadow: selected
            ? '0 0 0 2px color-mix(in srgb, var(--c-halogen) 35%, transparent)'
            : undefined,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab',
          userSelect: 'none',
        }}
      >
        <span style={{
          color,
          fontSize,
          fontWeight: 700,
          fontFamily: "ui-monospace, 'Cascadia Code', 'Fira Code', monospace",
          letterSpacing: '-0.02em',
          pointerEvents: 'none',
          userSelect: 'none',
        }}>
          {data.element}
        </span>
      </div>
    </div>
  )
}
