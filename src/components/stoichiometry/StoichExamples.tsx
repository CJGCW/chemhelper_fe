import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

// ── Colours ────────────────────────────────────────────────────────────────────
const EC: Record<string, string> = { H:'#9ca3af', C:'#4b5563', N:'#4a7ef5', O:'#e05050', Fe:'#c07040' }
const ec = (el: string) => EC[el] ?? '#60a5fa'
const ar = (el: string) => el === 'H' ? 11 : el.length > 1 ? 14 : 16

// ── Types ──────────────────────────────────────────────────────────────────────
interface AtomDef { el: string; rx: number; ry: number; px: number; py: number }
interface BondDef { a: number; b: number; o?: number }
interface Scene {
  id: string; title: string; equation: string; note?: string
  vw: number; vh: number; arrowX: number; arrowY: number
  atoms: AtomDef[]
  rBonds: BondDef[]   // bonds using reactant positions
  pBonds: BondDef[]   // bonds using product positions
}

// ── Scenes ─────────────────────────────────────────────────────────────────────
//
// Each atom has a unique identity: one entry in atoms[], with both its
// reactant position (rx,ry) and product position (px,py).
// The animation moves each atom from (rx,ry) → (px,py).

const SCENES: Scene[] = [
  // ── CH₄ + 2O₂ → CO₂ + 2H₂O ────────────────────────────────────────────────
  // 9 atoms: C×1  H×4  O×4
  {
    id: 'stoich', title: 'Stoichiometry', equation: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
    vw: 700, vh: 270, arrowX: 330, arrowY: 138,
    atoms: [
      //           Reactant pos      Product pos
      { el:'C',  rx: 95, ry:135,  px:455, py:108 },  // 0  CH₄ C    → CO₂  C
      { el:'H',  rx: 95, ry: 97,  px:412, py:220 },  // 1  CH₄ H_N  → H₂O#1 H_L
      { el:'H',  rx:133, ry:135,  px:468, py:220 },  // 2  CH₄ H_E  → H₂O#1 H_R
      { el:'H',  rx: 95, ry:173,  px:567, py:190 },  // 3  CH₄ H_S  → H₂O#2 H_L
      { el:'H',  rx: 57, ry:135,  px:623, py:190 },  // 4  CH₄ H_W  → H₂O#2 H_R
      { el:'O',  rx:195, ry:108,  px:413, py:108 },  // 5  O₂#1 L   → CO₂  O_L
      { el:'O',  rx:245, ry:108,  px:497, py:108 },  // 6  O₂#1 R   → CO₂  O_R
      { el:'O',  rx:195, ry:168,  px:440, py:195 },  // 7  O₂#2 L   → H₂O#1 O
      { el:'O',  rx:245, ry:168,  px:595, py:165 },  // 8  O₂#2 R   → H₂O#2 O
    ],
    rBonds: [
      { a:0, b:1 }, { a:0, b:2 }, { a:0, b:3 }, { a:0, b:4 },  // C–H ×4
      { a:5, b:6, o:2 },                                          // O₂ #1
      { a:7, b:8, o:2 },                                          // O₂ #2
    ],
    pBonds: [
      { a:5, b:0, o:2 }, { a:0, b:6, o:2 },   // CO₂
      { a:7, b:1 },       { a:7, b:2 },         // H₂O #1
      { a:8, b:3 },       { a:8, b:4 },         // H₂O #2
    ],
  },

  // ── N₂ + 3H₂ → 2NH₃ ────────────────────────────────────────────────────────
  // 8 atoms: N×2  H×6
  {
    id: 'limiting', title: 'Limiting Reagent', equation: 'N₂ + 3H₂ → 2NH₃',
    note: 'Here every reactant is fully consumed — the ratio is exactly stoichiometric. If only 2 H₂ were available, H₂ would be the limiting reagent.',
    vw: 680, vh: 240, arrowX: 305, arrowY: 120,
    atoms: [
      { el:'N',  rx: 45, ry:120,  px:430, py:102 },  // 0  N₂ L    → NH₃#1 N
      { el:'N',  rx: 95, ry:120,  px:575, py:102 },  // 1  N₂ R    → NH₃#2 N
      { el:'H',  rx:180, ry: 85,  px:402, py:142 },  // 2  H₂#1 L  → NH₃#1 H_L
      { el:'H',  rx:220, ry: 85,  px:547, py:142 },  // 3  H₂#1 R  → NH₃#2 H_L
      { el:'H',  rx:180, ry:120,  px:430, py:150 },  // 4  H₂#2 L  → NH₃#1 H_M
      { el:'H',  rx:220, ry:120,  px:575, py:150 },  // 5  H₂#2 R  → NH₃#2 H_M
      { el:'H',  rx:180, ry:155,  px:458, py:142 },  // 6  H₂#3 L  → NH₃#1 H_R
      { el:'H',  rx:220, ry:155,  px:603, py:142 },  // 7  H₂#3 R  → NH₃#2 H_R
    ],
    rBonds: [
      { a:0, b:1, o:3 },                              // N≡N
      { a:2, b:3 }, { a:4, b:5 }, { a:6, b:7 },      // H–H ×3
    ],
    pBonds: [
      { a:0, b:2 }, { a:0, b:4 }, { a:0, b:6 },      // NH₃ #1
      { a:1, b:3 }, { a:1, b:5 }, { a:1, b:7 },      // NH₃ #2
    ],
  },

  // ── 4Fe + 3O₂ → 2Fe₂O₃ ─────────────────────────────────────────────────────
  // 10 atoms: Fe×4  O×6
  {
    id: 'balance', title: 'Balancing', equation: '4Fe + 3O₂ → 2Fe₂O₃',
    vw: 740, vh: 270, arrowX: 305, arrowY: 130,
    atoms: [
      { el:'Fe', rx: 60, ry:100,  px:415, py:108 },  // 0  Fe₁  → Fe₂O₃#1 Fe_L
      { el:'Fe', rx:110, ry:100,  px:495, py:108 },  // 1  Fe₂  → Fe₂O₃#1 Fe_R
      { el:'Fe', rx: 60, ry:155,  px:572, py:108 },  // 2  Fe₃  → Fe₂O₃#2 Fe_L
      { el:'Fe', rx:110, ry:155,  px:652, py:108 },  // 3  Fe₄  → Fe₂O₃#2 Fe_R
      { el:'O',  rx:195, ry: 90,  px:400, py:165 },  // 4  O₂#1 L → Fe₂O₃#1 O_1
      { el:'O',  rx:245, ry: 90,  px:557, py:165 },  // 5  O₂#1 R → Fe₂O₃#2 O_1
      { el:'O',  rx:195, ry:128,  px:455, py:165 },  // 6  O₂#2 L → Fe₂O₃#1 O_2 (bridge)
      { el:'O',  rx:245, ry:128,  px:612, py:165 },  // 7  O₂#2 R → Fe₂O₃#2 O_2 (bridge)
      { el:'O',  rx:195, ry:166,  px:510, py:165 },  // 8  O₂#3 L → Fe₂O₃#1 O_3
      { el:'O',  rx:245, ry:166,  px:667, py:165 },  // 9  O₂#3 R → Fe₂O₃#2 O_3
    ],
    rBonds: [
      // Fe atoms: no bonds (isolated)
      { a:4, b:5, o:2 }, { a:6, b:7, o:2 }, { a:8, b:9, o:2 },  // O=O ×3
    ],
    pBonds: [
      { a:0, b:4 }, { a:0, b:6 }, { a:1, b:6 }, { a:1, b:8 },   // Fe₂O₃ #1
      { a:2, b:5 }, { a:2, b:7 }, { a:3, b:7 }, { a:3, b:9 },   // Fe₂O₃ #2
    ],
  },
]

// ── SVG bond renderer (full center-to-center; atoms drawn on top) ──────────────
function BondLines({ x1,y1,x2,y2,order=1 }: { x1:number;y1:number;x2:number;y2:number;order?:number }) {
  const dx=x2-x1, dy=y2-y1, len=Math.sqrt(dx*dx+dy*dy)||1
  const px=-dy/len, py=dx/len
  const st='rgba(255,255,255,0.62)', sw=1.8
  if (order===2) { const d=3.5; return <g>
    <line x1={x1+px*d} y1={y1+py*d} x2={x2+px*d} y2={y2+py*d} stroke={st} strokeWidth={sw}/>
    <line x1={x1-px*d} y1={y1-py*d} x2={x2-px*d} y2={y2-py*d} stroke={st} strokeWidth={sw}/>
  </g> }
  if (order===3) { const d=4.5; return <g>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={st} strokeWidth={sw}/>
    <line x1={x1+px*d} y1={y1+py*d} x2={x2+px*d} y2={y2+py*d} stroke={st} strokeWidth={sw}/>
    <line x1={x1-px*d} y1={y1-py*d} x2={x2-px*d} y2={y2-py*d} stroke={st} strokeWidth={sw}/>
  </g> }
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={st} strokeWidth={sw}/>
}

// ── Reaction viewer ────────────────────────────────────────────────────────────
function ReactionViewer({ scene }: { scene: Scene }) {
  const [runId, setRunId] = useState(0)
  const [reacted, setReacted] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  function play() {
    timers.current.forEach(clearTimeout)
    // Increment runId to remount the SVG, resetting all Framer Motion state
    setRunId(n => n + 1)
    setReacted(false)
    timers.current = [setTimeout(() => setReacted(true), 100)]
  }

  useEffect(() => () => { timers.current.forEach(clearTimeout) }, [])

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-sm text-secondary">{scene.equation}</p>
        <button
          onClick={play}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-border shrink-0
                     font-sans text-xs text-secondary hover:text-primary hover:border-muted transition-colors"
        >
          <span className="font-mono">{reacted ? '↺' : '▶'}</span>
          <span>{reacted ? 'Replay' : 'Play'}</span>
        </button>
      </div>

      {/* Canvas — keyed on runId so every replay gets a fresh Framer Motion state */}
      <div className="overflow-x-auto rounded-sm border border-border" style={{ background: '#0e1016' }}>
        <svg
          key={runId}
          viewBox={`0 0 ${scene.vw} ${scene.vh}`}
          style={{ display:'block', minWidth: scene.vw, width:'100%', maxWidth: scene.vw }}
        >
          {/* Reaction arrow — static */}
          <text
            x={scene.arrowX} y={scene.arrowY}
            textAnchor="middle" dominantBaseline="central"
            fontSize={22} fill="var(--c-halogen)"
            fontFamily="system-ui, sans-serif"
          >→</text>

          {/* Reactant bonds — fade out when reacted */}
          <motion.g
            animate={{ opacity: reacted ? 0 : 1 }}
            transition={{ duration: 0.22 }}
          >
            {scene.rBonds.map((b, i) => {
              const a1=scene.atoms[b.a], a2=scene.atoms[b.b]
              return <BondLines key={i} x1={a1.rx} y1={a1.ry} x2={a2.rx} y2={a2.ry} order={b.o}/>
            })}
          </motion.g>

          {/* Product bonds — fade in after atoms settle */}
          <motion.g
            animate={{ opacity: reacted ? 1 : 0 }}
            transition={{ duration: 0.35, delay: reacted ? 1.85 : 0 }}
          >
            {scene.pBonds.map((b, i) => {
              const a1=scene.atoms[b.a], a2=scene.atoms[b.b]
              return <BondLines key={i} x1={a1.px} y1={a1.py} x2={a2.px} y2={a2.py} order={b.o}/>
            })}
          </motion.g>

          {/* Atoms — spring from reactant → product positions */}
          {scene.atoms.map((atom, i) => (
            <motion.g
              key={i}
              initial={{ x: atom.rx, y: atom.ry }}
              animate={{ x: reacted ? atom.px : atom.rx, y: reacted ? atom.py : atom.ry }}
              transition={reacted
                ? { type:'tween', ease:'easeInOut', duration:1.4, delay: 0.25 + i * 0.04 }
                : { type:'tween', duration:0 }
              }
            >
              <circle r={ar(atom.el)} fill={ec(atom.el)} stroke="#0e1016" strokeWidth={1.5}/>
              <text
                dy="0.35em" textAnchor="middle"
                fill="white" fontWeight="700"
                fontSize={atom.el.length > 1 ? 8 : ar(atom.el) < 13 ? 8 : 10}
                fontFamily="system-ui, sans-serif"
              >{atom.el}</text>
            </motion.g>
          ))}
        </svg>
      </div>

      {/* Optional note */}
      {scene.note && (
        <p className="font-sans text-xs text-secondary italic border-l-2 border-border pl-3">
          {scene.note}
        </p>
      )}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
const TABS = [
  { id:'stoich',   label:'Stoichiometry'   },
  { id:'limiting', label:'Limiting Reagent' },
  { id:'balance',  label:'Balancing'        },
]

export default function StoichExamples() {
  const [active, setActive] = useState('stoich')
  const scene = SCENES.find(s => s.id === active)!

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 rounded-sm self-start flex-wrap"
        style={{ background:'#0e1016', border:'1px solid #1c1f2e' }}>
        {TABS.map(t => {
          const isActive = active === t.id
          return (
            <button key={t.id} onClick={() => setActive(t.id)}
              className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
              style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}>
              {isActive && (
                <motion.div layoutId="ex-pill"
                  className="absolute inset-0 rounded-sm"
                  style={{
                    background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                  }}
                  transition={{ type:'spring', stiffness:400, damping:32 }}/>
              )}
              <span className="relative z-10">{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* Viewer — remount on tab change to reset animation state */}
      <div className="rounded-sm border border-border bg-surface p-5">
        <ReactionViewer key={active} scene={scene} />
      </div>

      <p className="font-mono text-[10px] text-dim">
        More examples coming — Theoretical Yield and Percent Yield
      </p>
    </div>
  )
}
