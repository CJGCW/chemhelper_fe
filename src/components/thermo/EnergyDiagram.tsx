import { useState } from 'react'

// ── Layout constants ──────────────────────────────────────────────────────────
const W = 560, H = 310

const rX1 = 58,  rX2 = 172   // reactant level line
const pX1 = 368, pX2 = 462   // product level line
const tsX = 265               // transition state centre
const dhArrX = 492            // ΔH double-arrow x

const baseY = 175             // reactant y (reference)
const scale = 0.24            // px per kJ/mol

// ── Helpers ───────────────────────────────────────────────────────────────────
function clampY(y: number) { return Math.max(30, Math.min(H - 48, y)) }

/** Generate N fire positions as a staggered grid around a centre point. */
function makeFirePositions(n: number, cx: number, cy: number) {
  const perRow = 3
  return Array.from({ length: n }, (_, i) => {
    const row = Math.floor(i / perRow)
    const col = i % perRow
    const rowLen = Math.min(n - row * perRow, perRow)
    const x = cx + (col - (rowLen - 1) / 2) * 24
    const y = cy + row * 22
    return { x, y, delay: `${((i * 0.28) % 1.68).toFixed(2)}s` }
  })
}

// ── Beaker illustration ───────────────────────────────────────────────────────
function BeakerViz({ isExo, accent, n }: { isExo: boolean; accent: string; n: number }) {
  const cx = 80
  const rimY = 95, botY = 158
  const lX = 53, rX = 107
  const midY = (rimY + botY) / 2

  const bodyPath = `M ${lX} ${rimY} L ${lX - 1} ${botY} Q ${cx} ${botY + 14} ${rX + 1} ${botY} L ${rX} ${rimY}`
  const liqY = rimY + (botY - rimY) * 0.48
  const liqPath = `M ${lX} ${liqY} L ${lX - 1} ${botY} Q ${cx} ${botY + 14} ${rX + 1} ${botY} L ${rX} ${liqY} Z`
  const ticks = [rimY + 20, rimY + 36, rimY + 52].filter(ty => ty < botY - 8)

  const count = Math.min(n, 12)

  // Exo: round-robin across 4 sides, each side floats outward
  // Endo: below beaker only, floating upward
  const fires = Array.from({ length: count }, (_, i) => {
    const delay = `${((i * 0.28) % 1.68).toFixed(2)}s`

    if (!isExo) {
      const row = Math.floor(i / 3)
      const col = i % 3
      const rowLen = Math.min(count - row * 3, 3)
      return {
        x: cx + (col - (rowLen - 1) / 2) * 22,
        y: botY + 28 + row * 22,
        cls: 'bf-top',
        delay,
      }
    }

    // Round-robin: side 0=top 1=right 2=bottom 3=left
    const side = i % 4
    const rank = Math.floor(i / 4)
    const off  = [0, 18, -18][rank] ?? 0

    switch (side) {
      case 0: return { x: cx + off,    y: rimY - 24,  cls: 'bf-top',    delay }
      case 1: return { x: rX  + 26,    y: midY + off, cls: 'bf-right',  delay }
      case 2: return { x: cx + off,    y: botY + 24,  cls: 'bf-bottom', delay }
      case 3: return { x: lX  - 26,    y: midY + off, cls: 'bf-left',   delay }
      default: return { x: cx, y: rimY - 24, cls: 'bf-top', delay }
    }
  })

  return (
    <svg viewBox="0 0 160 260" style={{ overflow: 'visible', width: '100%' }}>
      <style>{`
        .bf-top    { animation: bfTop    2.4s ease-in-out infinite; }
        .bf-right  { animation: bfRight  2.4s ease-in-out infinite; }
        .bf-bottom { animation: bfBottom 2.4s ease-in-out infinite; }
        .bf-left   { animation: bfLeft   2.4s ease-in-out infinite; }
        @keyframes bfTop    { 0%{transform:translate(0,0);opacity:0;}      20%{opacity:1;} 80%{opacity:0.9;} 100%{transform:translate(0,-18px);opacity:0;}     }
        @keyframes bfRight  { 0%{transform:translate(0,0);opacity:0;}      20%{opacity:1;} 80%{opacity:0.9;} 100%{transform:translate(16px,-9px);opacity:0;}   }
        @keyframes bfBottom { 0%{transform:translate(0,0);opacity:0;}      20%{opacity:1;} 80%{opacity:0.9;} 100%{transform:translate(0,18px);opacity:0;}      }
        @keyframes bfLeft   { 0%{transform:translate(0,0);opacity:0;}      20%{opacity:1;} 80%{opacity:0.9;} 100%{transform:translate(-16px,-9px);opacity:0;}  }
      `}</style>

      {/* Liquid fill */}
      <path d={liqPath} fill={accent} opacity="0.2" />
      <line x1={lX} y1={liqY} x2={rX} y2={liqY}
        stroke={accent} strokeWidth="1.5" opacity="0.55" strokeLinecap="round" />

      {/* Beaker body */}
      <path d={bodyPath} fill="none" stroke="rgba(255,255,255,0.65)"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Rim */}
      <line x1={lX - 9} y1={rimY} x2={rX + 9} y2={rimY}
        stroke="rgba(255,255,255,0.65)" strokeWidth="3" strokeLinecap="round" />

      {/* Spout */}
      <line x1={rX} y1={rimY} x2={rX + 10} y2={rimY - 11}
        stroke="rgba(255,255,255,0.65)" strokeWidth="2.5" strokeLinecap="round" />

      {/* Measurement ticks */}
      {ticks.map((ty, i) => (
        <line key={i} x1={rX - 2} y1={ty} x2={rX + 7} y2={ty}
          stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
      ))}

      {/* Fires */}
      {fires.map((f, i) => (
        <g key={i} className={f.cls} style={{ animationDelay: f.delay }}>
          <text x={f.x} y={f.y} fontSize="17" textAnchor="middle">🔥</text>
        </g>
      ))}

      {isExo ? (
        <text x={cx} y={12} textAnchor="middle" fontSize="13" fontWeight="bold" fill="rgba(255,255,255,0.85)">
          heat out
        </text>
      ) : (
        <text x={cx} y={254} textAnchor="middle" fontSize="13" fontWeight="bold" fill="rgba(255,255,255,0.85)">
          heat in ↑
        </text>
      )}
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function EnergyDiagram() {
  const [dh, setDh] = useState(-200)   // kJ/mol  (negative = exothermic)
  const [ea, setEa] = useState(100)    // kJ/mol above reactants

  const isExo  = dh < 0
  const accent = isExo ? '#34d399' : '#f87171'

  // TS must clear both reactants and products
  const effEa = Math.max(ea, dh > 0 ? dh + 12 : 0, 10)

  const rY  = baseY
  const pY  = clampY(baseY - dh * scale)
  const tsY = clampY(baseY - effEa * scale)

  // Smooth reaction-profile curve (two cubic beziers through TS)
  const cp = 52
  const curve = `M ${rX2} ${rY} C ${rX2+cp} ${rY}, ${tsX-cp} ${tsY}, ${tsX} ${tsY} C ${tsX+cp} ${tsY}, ${pX1-cp} ${pY}, ${pX1} ${pY}`

  // ΔH arrow metrics
  const dhTopY  = Math.min(rY, pY)
  const dhBotY  = Math.max(rY, pY)
  const dhMidY  = (dhTopY + dhBotY) / 2
  const dhShown = dhBotY - dhTopY > 12

  // Ea arrow x (just left of TS, so it doesn't overlap curve)
  const eaX = tsX - 34

  // Fire count scales with Ea: 1 fire per 50 kJ/mol, capped at 10
  const fireCount = Math.max(1, Math.min(10, Math.round(effEa / 50)))

  // Exo: fires in the ΔH gap on the right  |  Endo: fires below reactants on the left
  const fires = isExo
    ? makeFirePositions(fireCount, dhArrX, dhMidY - 10)
    : makeFirePositions(fireCount, rX1 + 26, rY + 40)

  // Heat label below last row of fires
  const fireRows  = Math.ceil(fireCount / 3)
  const heatLabelX = isExo ? dhArrX     : rX1 + 26
  const heatLabelY = isExo
    ? Math.min(dhMidY - 10 + fireRows * 22 + 20, H - 12)
    : Math.min(rY + 40 + fireRows * 22 + 20, H - 12)

  const labelCls = 'font-mono text-[10px] text-dim tracking-widest uppercase'

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Type badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-mono text-sm font-semibold px-3 py-1 rounded-sm border"
          style={{
            color: accent,
            borderColor: `color-mix(in srgb, ${accent} 40%, transparent)`,
            background: `color-mix(in srgb, ${accent} 12%, transparent)`,
          }}>
          {isExo ? '🔥 Exothermic' : '🔥 Endothermic'}
        </span>
        <span className="font-mono text-xs text-secondary">
          ΔH = {dh >= 0 ? '+' : ''}{dh} kJ/mol &nbsp;·&nbsp; Ea = {ea} kJ/mol
        </span>
      </div>

      {/* ── Diagram row: energy profile + beaker ─────────────────────────────── */}
      <div className="flex items-stretch gap-3">

        {/* Energy profile SVG */}
        <div className="flex-1 min-w-0 rounded-sm border border-border bg-surface pb-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ overflow: 'visible' }}>

            <style>{`
              .fire-anim { animation: fireRise 2.4s ease-in-out infinite; }
              @keyframes fireRise {
                0%   { transform: translateY(0px);   opacity: 0;    }
                20%  { transform: translateY(-4px);  opacity: 1;    }
                80%  { transform: translateY(-10px); opacity: 0.85; }
                100% { transform: translateY(-18px); opacity: 0;    }
              }
            `}</style>

            {/* Energy axis label */}
            <text x={14} y={H / 2} fill="rgba(255,255,255,0.3)" fontSize="11"
              textAnchor="middle" transform={`rotate(-90, 14, ${H / 2})`}>
              ENERGY (kJ/mol)
            </text>

            {/* Reactant level */}
            <line x1={rX1} y1={rY} x2={rX2} y2={rY}
              stroke="rgba(255,255,255,0.75)" strokeWidth="2.5" strokeLinecap="round" />
            <text x={(rX1 + rX2) / 2} y={rY + 17}
              textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="13">
              Reactants
            </text>

            {/* Product level */}
            <line x1={pX1} y1={pY} x2={pX2} y2={pY}
              stroke="rgba(255,255,255,0.75)" strokeWidth="2.5" strokeLinecap="round" />
            <text x={(pX1 + pX2) / 2} y={pY + 17}
              textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="13">
              Products
            </text>

            {/* Transition state */}
            <line x1={tsX - 20} y1={tsY} x2={tsX + 20} y2={tsY}
              stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="4,3" />
            <text x={tsX} y={tsY - 10}
              textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="12">
              Transition State
            </text>

            {/* Reaction profile curve */}
            <path d={curve} fill="none" stroke={accent}
              strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />

            {/* Ea arrow (reactant → TS) */}
            {tsY < rY - 10 && (
              <>
                <line x1={eaX} y1={rY - 2} x2={eaX} y2={tsY + 8}
                  stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
                <polygon
                  points={`${eaX - 4},${tsY + 9} ${eaX + 4},${tsY + 9} ${eaX},${tsY}`}
                  fill="rgba(255,255,255,0.22)"
                />
                <text x={eaX + 10} y={(rY + tsY) / 2 + 3}
                  textAnchor="start" fill="rgba(255,255,255,0.5)" fontSize="12">
                  Ea = {ea} kJ
                </text>
              </>
            )}

            {/* ΔH double-headed arrow */}
            {dhShown && (
              <>
                <line x1={pX2 + 2} y1={rY} x2={dhArrX} y2={rY}
                  stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3,3" />
                <line x1={pX2 + 2} y1={pY} x2={dhArrX} y2={pY}
                  stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3,3" />
                <line x1={dhArrX} y1={dhTopY + 9} x2={dhArrX} y2={dhBotY - 9}
                  stroke={accent} strokeWidth="2" />
                <polygon
                  points={`${dhArrX - 5},${dhTopY + 9} ${dhArrX + 5},${dhTopY + 9} ${dhArrX},${dhTopY}`}
                  fill={accent}
                />
                <polygon
                  points={`${dhArrX - 5},${dhBotY - 9} ${dhArrX + 5},${dhBotY - 9} ${dhArrX},${dhBotY}`}
                  fill={accent}
                />
                <text x={dhArrX + 10} y={dhMidY + 4}
                  fill={accent} fontSize="13" fontWeight="bold">
                  ΔH = {dh >= 0 ? '+' : ''}{dh}
                </text>
              </>
            )}

            {/* Fire emojis */}
            {fires.map((f, i) => (
              <g key={i} className="fire-anim" style={{ animationDelay: f.delay }}>
                <text x={f.x} y={f.y} fontSize="20" textAnchor="middle">🔥</text>
              </g>
            ))}

            {/* Heat direction hint */}
            <text x={heatLabelX} y={heatLabelY}
              textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="12">
              {isExo ? 'heat released →' : '← heat absorbed'}
            </text>

          </svg>
        </div>

        {/* Beaker illustration */}
        <div className="flex-none w-28 rounded-sm border border-border bg-surface flex items-center justify-center p-2">
          <BeakerViz isExo={isExo} accent={accent} n={fireCount} />
        </div>

      </div>

      {/* ── Sliders ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5">

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className={labelCls}>ΔH (kJ/mol)</span>
            <span className="font-mono text-sm font-semibold" style={{ color: accent }}>
              {dh >= 0 ? '+' : ''}{dh}
            </span>
          </div>
          <input
            type="range" min="-400" max="400" step="10" value={dh}
            onChange={e => setDh(Number(e.target.value))}
            className="w-full h-1.5 appearance-none rounded-full cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${accent} ${(dh + 400) / 8}%, rgba(255,255,255,0.1) ${(dh + 400) / 8}%)`,
              accentColor: accent,
            }}
          />
          <div className="flex justify-between font-mono text-[9px]">
            <span style={{ color: '#34d399' }}>−400 exothermic</span>
            <span className="text-dim">0</span>
            <span style={{ color: '#f87171' }}>endothermic +400</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className={labelCls}>Activation Energy Ea (kJ/mol)</span>
            <span className="font-mono text-sm text-secondary">{ea}</span>
          </div>
          <input
            type="range" min="0" max="400" step="10" value={ea}
            onChange={e => setEa(Number(e.target.value))}
            className="w-full h-1.5 appearance-none rounded-full cursor-pointer"
            style={{
              background: `linear-gradient(to right, rgba(255,255,255,0.4) ${ea / 4}%, rgba(255,255,255,0.1) ${ea / 4}%)`,
            }}
          />
          <div className="flex justify-between font-mono text-[9px] text-dim">
            <span>0 — no barrier</span>
            <span>400 kJ/mol</span>
          </div>
        </div>
      </div>

      {/* ── Info panel ───────────────────────────────────────────────────────── */}
      <div className="rounded-sm border p-4"
        style={{
          borderColor: `color-mix(in srgb, ${accent} 22%, transparent)`,
          background: `color-mix(in srgb, ${accent} 6%, #0e1016)`,
        }}>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          {isExo ? (
            <>
              <span style={{ color: '#34d399' }} className="font-semibold">Exothermic</span> — products are at
              lower energy than reactants. The system <strong>releases heat</strong> to the surroundings (ΔH &lt; 0).
              The 🔥 above the beaker show heat energy escaping as the reaction descends to a lower energy state.
            </>
          ) : (
            <>
              <span style={{ color: '#f87171' }} className="font-semibold">Endothermic</span> — products are at
              higher energy than reactants. The system <strong>absorbs heat</strong> from the surroundings (ΔH &gt; 0).
              The 🔥 below the beaker show external heat being applied to drive the reaction uphill.
            </>
          )}
        </p>
      </div>

    </div>
  )
}
