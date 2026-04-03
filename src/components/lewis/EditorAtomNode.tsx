import { Handle, Position, useReactFlow, useEdges, type NodeProps, type Node } from '@xyflow/react'

// ── Types ─────────────────────────────────────────────────────────────────────

export type ElectronSlots = [number, number, number, number] // [top, right, bottom, left], each 0–2

export type AtomNodeData = {
  element: string
  electronSlots: ElectronSlots  // lone electrons per cardinal position
  formalCharge: number          // computed externally and passed in
  [key: string]: unknown        // React Flow requirement
}

export type AtomNodeType = Node<AtomNodeData, 'atom'>

// ── Element colours ───────────────────────────────────────────────────────────

const ELEM_COLORS: Record<string, string> = {
  H: '#9ca3af', C: '#4b5563', N: '#4a7ef5', O: '#e05050',
  F: '#5dcc5d', Cl: '#40b840', Br: '#be4040', I: '#9966cc',
  S: '#d4b84a', P: '#e08030', Na: '#9966ff', K: '#8060e0',
  Ca: '#909090', Mg: '#6ab060', Al: '#a09090', Si: '#b09070',
  B: '#c87050', Se: '#d4b84a', As: '#c87050', Xe: '#6080c0',
}

// ── 8 connection handles ──────────────────────────────────────────────────────

const HANDLES: { id: string; position: Position; style: React.CSSProperties }[] = [
  { id: 'n', position: Position.Top,    style: { top: -5, left: '50%', transform: 'translateX(-50%)' } },
  { id: 'e', position: Position.Right,  style: { right: -5, top: '50%', transform: 'translateY(-50%)' } },
  { id: 's', position: Position.Bottom, style: { bottom: -5, left: '50%', transform: 'translateX(-50%)' } },
  { id: 'w', position: Position.Left,   style: { left: -5, top: '50%', transform: 'translateY(-50%)' } },
]

// ── Electron dot positions (cardinal, outside the 8 handles) ─────────────────

// Which cardinal dot position (0=top,1=right,2=bottom,3=left) each handle blocks.
const HANDLE_SIDES: Record<string, number[]> = {
  n: [0], e: [1], s: [2], w: [3],
}

const DOT_POS: { style: React.CSSProperties; horizontal: boolean }[] = [
  { style: { top: -20, left: '50%', transform: 'translateX(-50%)' }, horizontal: true  },
  { style: { right: -20, top: '50%', transform: 'translateY(-50%)' }, horizontal: false },
  { style: { bottom: -20, left: '50%', transform: 'translateX(-50%)' }, horizontal: true  },
  { style: { left: -20, top: '50%', transform: 'translateY(-50%)' }, horizontal: false },
]

const DOT_SIZE = 7
const DOT_GAP  = 4

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
    background: '#0e1016',
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

  return (
    <div style={{ position: 'relative', width: 44, height: 44 }}>

      {/* 8 connection handles */}
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
              ...style,
            }}
          >
            {([0, 1] as const).map(sub => {
              // sub > count means not yet reachable → hide
              if (sub > count) return null
              const filled = sub < count
              // ghost = the next available slot (sub === count, slot not full)
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
                    background: filled ? 'rgba(255,255,255,0.88)' : 'transparent',
                    border: isGhost ? `1.5px dashed rgba(255,255,255,0.22)` : 'none',
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
          position: 'absolute', top: -12, right: -10, zIndex: 10,
          fontSize: 11, fontWeight: 700, color: 'white',
          fontFamily: 'system-ui, sans-serif', lineHeight: 1,
        }}>
          {chargeLabel}
        </div>
      )}

      {/* Atom circle — drag handle */}
      <div
        className="atom-body"
        style={{
          width: 44, height: 44, borderRadius: '50%',
          background: color,
          border: `2px solid ${selected ? 'var(--c-halogen)' : '#1c1f2e'}`,
          boxShadow: selected
            ? '0 0 0 2px color-mix(in srgb, var(--c-halogen) 35%, transparent)'
            : undefined,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <span style={{
          color: 'white', fontWeight: 700,
          fontSize: data.element.length > 1 ? 11 : 13,
          fontFamily: 'system-ui, sans-serif',
          userSelect: 'none', pointerEvents: 'none',
        }}>
          {data.element}
        </span>
      </div>
    </div>
  )
}
