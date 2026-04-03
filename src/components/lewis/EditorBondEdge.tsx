import { useReactFlow, type EdgeProps, type Edge } from '@xyflow/react'
import type { ElectronSlots } from './EditorAtomNode'

// ── Types ─────────────────────────────────────────────────────────────────────

export type BondEdgeData = {
  order: 1 | 2 | 3
  [key: string]: unknown
}

export type BondEdgeType = Edge<BondEdgeData, 'bond'>

// ── Constants ─────────────────────────────────────────────────────────────────

const HANDLE_TO_SLOT: Record<string, number> = { n: 0, e: 1, s: 2, w: 3 }

const VALENCE: Record<string, number> = {
  H: 1, He: 2,
  Li: 1, Be: 2, B: 3, C: 4, N: 5, O: 6, F: 7, Ne: 8,
  Na: 1, Mg: 2, Al: 3, Si: 4, P: 5, S: 6, Cl: 7, Ar: 8,
  K: 1, Ca: 2, Ga: 3, Ge: 4, As: 5, Se: 6, Br: 7, Kr: 8,
  Rb: 1, Sr: 2, In: 3, Sn: 4, Sb: 5, Te: 6, I: 7, Xe: 8,
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EditorBondEdge({
  id,
  source, target,
  sourceHandleId, targetHandleId,
  sourceX, sourceY,
  targetX, targetY,
  data,
  selected,
}: EdgeProps<BondEdgeType>) {
  const { setEdges, setNodes, getEdges } = useReactFlow()
  const order = (data?.order ?? 1) as 1 | 2 | 3

  const dx = targetX - sourceX
  const dy = targetY - sourceY
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const px = -dy / len
  const py = dx / len
  const OFF = 4.5

  const stroke = selected
    ? 'color-mix(in srgb, var(--c-halogen) 90%, white)'
    : 'rgba(255,255,255,0.82)'
  const sw = 2

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()

    if (order < 3) {
      const next = (order + 1) as 2 | 3
      setEdges(eds => eds.map(edge =>
        edge.id === id ? { ...edge, data: { ...(edge.data ?? {}), order: next } } : edge
      ))
      return
    }

    // 4th click: delete bond, restore 1 electron per atom, recompute FC — all atomically.
    const remainingEdges = getEdges().filter(edge => edge.id !== id)
    setEdges(_ => remainingEdges)

    setNodes(nds => {
      // Step 1: restore 1 electron on each bonded slot.
      const restored = nds.map(node => {
        let slotIdx = -1
        if (node.id === source && sourceHandleId)
          slotIdx = HANDLE_TO_SLOT[sourceHandleId] ?? -1
        else if (node.id === target && targetHandleId)
          slotIdx = HANDLE_TO_SLOT[targetHandleId] ?? -1
        if (slotIdx === -1) return node
        const cur = (node.data.electronSlots as ElectronSlots) ?? [0, 0, 0, 0]
        if (cur[slotIdx] >= 2) return node
        const next = [...cur] as ElectronSlots
        next[slotIdx] = (next[slotIdx] + 1) as 0 | 1 | 2
        return { ...node, data: { ...node.data, electronSlots: next } }
      })

      // Step 2: recompute FC using the restored electrons and remaining edges.
      return restored.map(node => {
        const slots = (node.data.electronSlots as ElectronSlots) ?? [0, 0, 0, 0]
        const totalE = slots[0] + slots[1] + slots[2] + slots[3]
        const degreeSum = remainingEdges
          .filter(e => e.source === node.id || e.target === node.id)
          .reduce((sum, e) => sum + ((e.data?.order as number) ?? 1), 0)
        const fc = (VALENCE[node.data.element as string] ?? 4) - totalE - degreeSum
        return fc === node.data.formalCharge
          ? node
          : { ...node, data: { ...node.data, formalCharge: fc } }
      })
    })
  }

  function renderLines() {
    if (order === 1) {
      return <line x1={sourceX} y1={sourceY} x2={targetX} y2={targetY} stroke={stroke} strokeWidth={sw} />
    }
    if (order === 2) {
      const o = OFF * 0.8
      return (
        <>
          <line x1={sourceX + px * o} y1={sourceY + py * o} x2={targetX + px * o} y2={targetY + py * o} stroke={stroke} strokeWidth={sw} />
          <line x1={sourceX - px * o} y1={sourceY - py * o} x2={targetX - px * o} y2={targetY - py * o} stroke={stroke} strokeWidth={sw} />
        </>
      )
    }
    return (
      <>
        <line x1={sourceX} y1={sourceY} x2={targetX} y2={targetY} stroke={stroke} strokeWidth={sw} />
        <line x1={sourceX + px * OFF} y1={sourceY + py * OFF} x2={targetX + px * OFF} y2={targetY + py * OFF} stroke={stroke} strokeWidth={sw} />
        <line x1={sourceX - px * OFF} y1={sourceY - py * OFF} x2={targetX - px * OFF} y2={targetY - py * OFF} stroke={stroke} strokeWidth={sw} />
      </>
    )
  }

  const mx = (sourceX + targetX) / 2
  const my = (sourceY + targetY) / 2
  const orderLabel = order > 1 ? ['', '×1', '×2', '×3'][order] : null

  return (
    <g onClick={handleClick} style={{ cursor: 'pointer' }}>
      <line x1={sourceX} y1={sourceY} x2={targetX} y2={targetY} stroke="transparent" strokeWidth={16} />
      {renderLines()}
      {orderLabel && (
        <text
          x={mx + px * (order === 2 ? 12 : 16)}
          y={my + py * (order === 2 ? 12 : 16)}
          textAnchor="middle" dominantBaseline="central"
          fontSize={9} fill="rgba(255,255,255,0.4)"
          fontFamily="system-ui, sans-serif"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {orderLabel}
        </text>
      )}
    </g>
  )
}
