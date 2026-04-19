import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
      <div className="rounded-sm border border-border" style={{ background: '#0e1016' }}>
        <svg
          key={runId}
          viewBox={`0 0 ${scene.vw} ${scene.vh}`}
          style={{ display:'block', width:'100%' }}
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

// ── Cookie Limiting Reagent Animation ─────────────────────────────────────────
//
// Recipe per batch: 1 egg  +  2 flour  +  1 sugar  +  3 chips  →  🍪
// Available:        3 eggs,   4 flour,    5 sugar,    10 chips
//
// Flour limits at 2 batches (4÷2=2). Others have leftovers.

interface IngredientDef {
  key: string; label: string; short: string
  color: string; tc: string; sz: number
  perBatch: number
  batchOf: number[]  // index → which batch consumes it (0 = leftover)
}

const COOKIE_INGREDIENTS: IngredientDef[] = [
  { key:'egg',   label:'Eggs',  short:'E', color:'#f5deb3', tc:'#7a6030', sz:40, perBatch:1, batchOf:[1, 2, 0]              },
  { key:'flour', label:'Flour', short:'F', color:'#ece4d4', tc:'#7a6848', sz:40, perBatch:2, batchOf:[1, 1, 2, 2]           },
  { key:'sugar', label:'Sugar', short:'S', color:'#b8d8f0', tc:'#2e6488', sz:40, perBatch:1, batchOf:[1, 2, 0, 0, 0]        },
  { key:'chip',  label:'Chips', short:'',  color:'#4a2c10', tc:'#c88040', sz:24, perBatch:3, batchOf:[1,1,1,2,2,2,0,0,0,0] },
]

// Phases: 0=idle  1=batch1-active  2=batch1-done  3=batch2-active  4=batch2-done  5=result
function dotPhaseState(batchOf: number, phase: number): 'idle' | 'active' | 'consumed' | 'leftover' {
  if (batchOf === 0) return phase >= 5 ? 'leftover' : 'idle'
  const activePh  = (batchOf - 1) * 2 + 1  // batch1→1, batch2→3
  const consumePh = activePh + 1             // batch1→2, batch2→4
  if (phase >= consumePh) return 'consumed'
  if (phase >= activePh)  return 'active'
  return 'idle'
}

function IngDot({ ing, batchOf, phase }: { ing: IngredientDef; batchOf: number; phase: number }) {
  const s = dotPhaseState(batchOf, phase)
  return (
    <motion.div
      animate={
        s === 'consumed' ? { scale: 0,    opacity: 0   } :
        s === 'active'   ? { scale: 1.25, opacity: 1   } :
        s === 'leftover' ? { scale: 1,    opacity: 0.4 } :
                           { scale: 1,    opacity: 1   }
      }
      transition={{ type:'spring', stiffness:220, damping:22 }}
      className="rounded-full flex items-center justify-center shrink-0 font-mono font-bold"
      style={{
        width:  ing.sz,
        height: ing.sz,
        background: ing.color,
        border: s === 'active'
          ? '2px solid rgba(255,255,255,0.85)'
          : '1.5px solid rgba(0,0,0,0.3)',
        boxShadow: s === 'active' ? `0 0 10px 3px ${ing.color}90` : 'none',
        fontSize: ing.sz >= 24 ? 9 : 0,
        color: ing.tc,
      }}
    >
      {ing.sz >= 24 ? ing.short : null}
    </motion.div>
  )
}

function CookieLimitingAnimation() {
  const [phase, setPhase] = useState(0)
  const [runId, setRunId] = useState(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  function play() {
    timers.current.forEach(clearTimeout)
    setPhase(0)
    setRunId(n => n + 1)
    timers.current = [
      setTimeout(() => setPhase(1), 120),   // batch 1 highlight
      setTimeout(() => setPhase(2), 820),   // batch 1 consumed → cookie 1
      setTimeout(() => setPhase(3), 1900),  // batch 2 highlight
      setTimeout(() => setPhase(4), 2600),  // batch 2 consumed → cookie 2
      setTimeout(() => setPhase(5), 3700),  // result labels
    ]
  }

  useEffect(() => () => { timers.current.forEach(clearTimeout) }, [])

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-sans text-sm font-semibold text-bright">Limiting Reagent — Baking Cookies</p>
          <p className="font-mono text-[11px] text-secondary mt-0.5">
            Recipe per batch: &nbsp;
            <span style={{ color:'#f5deb3' }}>egg ×1</span>
            {' + '}
            <span style={{ color:'#ece4d4' }}>flour ×2</span>
            {' + '}
            <span style={{ color:'#b8d8f0' }}>sugar ×1</span>
            {' + '}
            <span style={{ color:'#c88040' }}>chips ×3</span>
            {' → 🍪'}
          </p>
        </div>
        <button onClick={play}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-border shrink-0
                     font-sans text-xs text-secondary hover:text-primary hover:border-muted transition-colors">
          <span className="font-mono">{phase === 0 ? '▶' : '↺'}</span>
          <span>{phase === 0 ? 'Play' : 'Replay'}</span>
        </button>
      </div>

      {/* Main content — keyed so replay remounts and resets all motion state */}
      <div key={runId} className="flex items-start gap-5">

        {/* Ingredient rows */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          {COOKIE_INGREDIENTS.map(ing => {
            const leftover = ing.batchOf.filter(b => b === 0).length
            const isLimiting = ing.key === 'flour'
            return (
              <div key={ing.key} className="flex items-center gap-2">
                <span className="font-sans text-xs text-secondary shrink-0 w-10">{ing.label}</span>
                <div className="flex flex-wrap gap-1 items-center">
                  {ing.batchOf.map((b, i) => (
                    <IngDot key={i} ing={ing} batchOf={b} phase={phase} />
                  ))}
                </div>
                {/* Result label */}
                {phase >= 5 && (
                  <motion.span
                    initial={{ opacity:0, x:-4 }}
                    animate={{ opacity:1, x:0 }}
                    transition={{ duration:0.25 }}
                    className="font-mono text-[10px] shrink-0 ml-1"
                    style={{ color: isLimiting ? 'var(--c-halogen)' : 'rgba(255,255,255,0.3)' }}
                  >
                    {isLimiting ? '← limiting!' : `(${leftover} left)`}
                  </motion.span>
                )}
              </div>
            )
          })}
        </div>

        {/* Arrow */}
        <div className="flex items-center pt-10 shrink-0">
          <span className="font-mono text-xl" style={{ color:'var(--c-halogen)' }}>→</span>
        </div>

        {/* Cookie output */}
        <div className="flex flex-col gap-2 shrink-0">
          <span className="font-sans text-xs text-secondary">Batches</span>
          <div className="flex gap-1.5 items-center">
            <motion.span
              initial={{ scale:0, opacity:0 }}
              animate={phase >= 2 ? { scale:1, opacity:1 } : { scale:0, opacity:0 }}
              transition={{ type:'spring', stiffness:280, damping:18 }}
              style={{ fontSize:48, lineHeight:1, display:'inline-block' }}
            >🍪</motion.span>
            <motion.span
              initial={{ scale:0, opacity:0 }}
              animate={phase >= 4 ? { scale:1, opacity:1 } : { scale:0, opacity:0 }}
              transition={{ type:'spring', stiffness:280, damping:18 }}
              style={{ fontSize:48, lineHeight:1, display:'inline-block' }}
            >🍪</motion.span>
          </div>
          {phase >= 5 && (
            <motion.span
              initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.3 }}
              className="font-mono text-[10px] text-secondary"
            >2 of 3 possible</motion.span>
          )}
        </div>
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {phase >= 5 && (
          <motion.p
            initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            transition={{ duration:0.3 }}
            className="font-sans text-xs text-secondary italic border-l-2 border-border pl-3"
          >
            Flour is the limiting reagent — all 4 cups are consumed after 2 batches, stopping production even though eggs, sugar, and chips remain.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Theoretical Yield Animation ───────────────────────────────────────────────
// Flour: 4 cups, 2/batch → 2 batches max = theoretical yield = 2 cookies
function TheoreticalYieldCookies() {
  const [phase, setPhase] = useState(0)
  const [runId, setRunId] = useState(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  function play() {
    timers.current.forEach(clearTimeout)
    setPhase(0)
    setRunId(n => n + 1)
    timers.current = [
      setTimeout(() => setPhase(1), 150),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 2550),
      setTimeout(() => setPhase(5), 3400),
    ]
  }

  useEffect(() => () => { timers.current.forEach(clearTimeout) }, [])

  const FC = '#ece4d4', FT = '#7a6848'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-sans text-sm font-semibold text-bright">Theoretical Yield — Maximum Possible Output</p>
          <p className="font-mono text-[11px] text-secondary mt-0.5">
            Limiting reagent (flour): 4 cups ÷ 2 per batch ={' '}
            <span style={{ color: 'var(--c-halogen)' }}>2 batches max</span>
          </p>
        </div>
        <button onClick={play}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-border shrink-0
                     font-sans text-xs text-secondary hover:text-primary hover:border-muted transition-colors">
          <span className="font-mono">{phase === 0 ? '▶' : '↺'}</span>
          <span>{phase === 0 ? 'Play' : 'Replay'}</span>
        </button>
      </div>

      <div key={runId} className="flex items-center gap-8">
        {/* Flour grouped by batch */}
        <div className="flex flex-col gap-2">
          <span className="font-sans text-xs text-secondary">Flour (4 cups)</span>
          <div className="flex gap-4">
            {([1, 2] as const).map(batch => {
              const consumed = batch === 1 ? phase >= 2 : phase >= 4
              const active   = batch === 1 ? phase >= 1 && phase < 2 : phase >= 3 && phase < 4
              return (
                <div key={batch} className="flex flex-col items-center gap-1.5">
                  <div className="flex gap-1.5">
                    {[0, 1].map(i => (
                      <motion.div
                        key={i}
                        animate={{ scale: consumed ? 0 : active ? 1.2 : 1, opacity: consumed ? 0 : 1 }}
                        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                        className="rounded-full flex items-center justify-center font-mono font-bold"
                        style={{
                          width: 40, height: 40,
                          background: FC, color: FT, fontSize: 9,
                          border: active ? '2px solid rgba(255,255,255,0.85)' : '1.5px solid rgba(0,0,0,0.3)',
                          boxShadow: active ? `0 0 10px 3px ${FC}90` : 'none',
                        }}
                      >F</motion.div>
                    ))}
                  </div>
                  <span className="font-mono text-xs text-secondary">batch {batch}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Arrow */}
        <span className="font-mono text-xl shrink-0" style={{ color: 'var(--c-halogen)' }}>→</span>

        {/* Cookie output */}
        <div className="flex flex-col gap-2">
          <span className="font-sans text-xs text-secondary">Output</span>
          <div className="flex gap-3 items-center">
            {([2, 4] as const).map((minPhase, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={phase >= minPhase ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                style={{ fontSize: 48, lineHeight: 1, display: 'inline-block' }}
              >🍪</motion.span>
            ))}
          </div>
          <AnimatePresence>
            {phase >= 5 && (
              <motion.p
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="font-mono text-xs font-semibold"
                style={{ color: 'var(--c-halogen)' }}
              >Theoretical yield = 2 🍪</motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {phase >= 5 && (
          <motion.p
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="font-sans text-xs text-secondary italic border-l-2 border-border pl-3"
          >
            Theoretical yield is the maximum product possible assuming the limiting reagent reacts completely with zero loss.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Percent Yield Animation ────────────────────────────────────────────────────
// Theoretical = 2 cookies, one burns → actual = 1, % yield = 50%
function PercentYieldCookies() {
  const [phase, setPhase] = useState(0)
  const [runId, setRunId] = useState(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  // 0=idle  1=both appear  2=fire on cookie1  3=cookie1 exits  4=results
  function play() {
    timers.current.forEach(clearTimeout)
    setPhase(0)
    setRunId(n => n + 1)
    timers.current = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1100),
      setTimeout(() => setPhase(3), 2200),
      setTimeout(() => setPhase(4), 3000),
    ]
  }

  useEffect(() => () => { timers.current.forEach(clearTimeout) }, [])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-sans text-sm font-semibold text-bright">Percent Yield — Actual vs. Theoretical</p>
          <p className="font-mono text-[11px] text-secondary mt-0.5">
            Theoretical: 2 cookies — but one burns in the oven 🔥
          </p>
        </div>
        <button onClick={play}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-border shrink-0
                     font-sans text-xs text-secondary hover:text-primary hover:border-muted transition-colors">
          <span className="font-mono">{phase === 0 ? '▶' : '↺'}</span>
          <span>{phase === 0 ? 'Play' : 'Replay'}</span>
        </button>
      </div>

      <div key={runId} className="flex flex-col gap-5">
        <div className="flex items-end gap-8">
          {/* Cookie 1 — burns and exits */}
          <div className="flex flex-col items-center gap-1">
            <div className="relative" style={{ height: 64 }}>
              {/* Fire */}
              <AnimatePresence>
                {phase === 2 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5, y: 10 }}
                    animate={{ opacity: 1, scale: 1.2, y: -4 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    style={{
                      position: 'absolute', bottom: '100%', left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: 28, lineHeight: 1,
                    }}
                  >🔥</motion.span>
                )}
              </AnimatePresence>
              {/* Cookie */}
              <motion.span
                initial={{ scale: 0, opacity: 0, y: 0, rotate: 0 }}
                animate={
                  phase >= 3 ? { scale: 0, opacity: 0, y: -50, rotate: 90 } :
                  phase >= 2 ? { scale: 1, opacity: 0.5, y: 0, rotate: 0 } :
                  phase >= 1 ? { scale: 1, opacity: 1,  y: 0, rotate: 0 } :
                               { scale: 0, opacity: 0,  y: 0, rotate: 0 }
                }
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                style={{ fontSize: 48, lineHeight: 1, display: 'inline-block' }}
              >🍪</motion.span>
            </div>
            <AnimatePresence>
              {phase >= 2 && phase < 4 && (
                <motion.span
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="font-mono text-[9px]" style={{ color: '#e05050' }}
                >burned!</motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Cookie 2 — survives */}
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={phase >= 1 ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.15 }}
            style={{ fontSize: 48, lineHeight: 1, display: 'inline-block' }}
          >🍪</motion.span>
        </div>

        {/* Result breakdown */}
        <AnimatePresence>
          {phase >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-wrap gap-6"
            >
              <div>
                <p className="font-mono text-xs text-secondary uppercase tracking-widest">Theoretical</p>
                <p className="font-mono text-sm text-primary">2 cookies</p>
              </div>
              <div>
                <p className="font-mono text-xs text-secondary uppercase tracking-widest">Actual</p>
                <p className="font-mono text-sm text-primary">1 cookie</p>
              </div>
              <div>
                <p className="font-mono text-xs text-secondary uppercase tracking-widest">% Yield</p>
                <p className="font-mono text-sm font-semibold" style={{ color: 'var(--c-halogen)' }}>
                  (1 ÷ 2) × 100 = 50%
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase >= 4 && (
            <motion.p
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="font-sans text-xs text-secondary italic border-l-2 border-border pl-3"
            >
              Percent yield measures real-world efficiency — burns, spills, and impure collection all reduce it below 100%.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
const TABS = [
  { id:'stoich',      label:'Stoichiometry'    },
  { id:'limiting',    label:'Limiting Reagent'  },
  { id:'theoretical', label:'Theoretical Yield' },
  { id:'percent',     label:'Percent Yield'     },
  { id:'balance',     label:'Balancing'         },
]

export default function StoichExamples() {
  const [active, setActive] = useState('stoich')
  const scene = SCENES.find(s => s.id === active)

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
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
        {active === 'limiting'
          ? <CookieLimitingAnimation key="limiting" />
          : active === 'theoretical'
          ? <TheoreticalYieldCookies key="theoretical" />
          : active === 'percent'
          ? <PercentYieldCookies key="percent" />
          : <ReactionViewer key={active} scene={scene!} />
        }
      </div>

    </div>
  )
}
