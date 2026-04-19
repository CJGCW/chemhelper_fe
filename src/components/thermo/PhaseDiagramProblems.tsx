import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  type TargetKind, type PDProblem,
  identifyPhase, genPDProblem,
} from '../../utils/phaseDiagramProblems'

type Problem = PDProblem
const genProblem = genPDProblem

// ── SVG constants ─────────────────────────────────────────────────────────────

const W = 620, H = 390
const ML = 72, MR = 16, MT = 28, MB = 50
const PW = W - ML - MR
const PH = H - MT - MB

const CURVE_COLOR = {
  sublimation:  '#fb923c',
  vaporization: '#f43f5e',
  fusion:       '#60a5fa',
}

const REGION_COLOR: Record<string, string> = {
  Solid:   '#60a5fa',
  Liquid:  '#34d399',
  Gas:     '#c084fc',
}

// ── Interactive SVG ───────────────────────────────────────────────────────────

function InteractiveSVG({
  problem, answered, isCorrect, clickSvgPos,
  onClickPlot,
}: {
  problem:      Problem
  answered:     boolean
  isCorrect:    boolean
  clickSvgPos:  { x: number; y: number } | null
  onClickPlot:  (svgX: number, svgY: number, T: number, P: number) => void
}) {
  const { data, target } = problem
  const { Tmin, Tmax, logPmin, logPmax } = data

  const xS = (T: number) => ML + (T - Tmin) / (Tmax - Tmin) * PW
  const yS = (P: number) => {
    const lp = Math.log10(Math.max(P, 10 ** (logPmin - 1)))
    return MT + PH - (lp - logPmin) / (logPmax - logPmin) * PH
  }
  const xI = (sx: number) => Tmin + (sx - ML) / PW * (Tmax - Tmin)
  const yI = (sy: number) => 10 ** (logPmin + (MT + PH - sy) / PH * (logPmax - logPmin))

  const curvePath = (pts: [number, number][]) =>
    pts
      .filter(([, P]) => { const lp = Math.log10(P); return lp >= logPmin - 0.2 && lp <= logPmax + 0.2 })
      .map(([T, P], i) => `${i === 0 ? 'M' : 'L'} ${xS(T).toFixed(1)} ${yS(P).toFixed(1)}`)
      .join(' ')

  const tRange = Tmax - Tmin
  const tStep = tRange > 300 ? 100 : tRange > 150 ? 50 : 25
  const tTicks: number[] = []
  for (let t = Math.ceil(Tmin / tStep) * tStep; t <= Tmax; t += tStep) tTicks.push(t)
  const pTicks: number[] = []
  for (let lp = Math.ceil(logPmin); lp <= Math.floor(logPmax); lp++) pTicks.push(lp)
  const pTickLabel = (lp: number) => {
    const P = 10 ** lp
    if (P >= 1e6) return `${(P / 1e6).toFixed(0)} MPa`
    if (P >= 1e3) return `${(P / 1e3).toFixed(0)} kPa`
    return `${P.toFixed(0)} Pa`
  }

  const y_atm   = yS(101325)
  const showAtm = y_atm >= MT + 2 && y_atm <= MT + PH - 2

  const inPlot = (T: number, P: number) => {
    const lp = Math.log10(P)
    return T >= Tmin && T <= Tmax && lp >= logPmin && lp <= logPmax
  }

  const tpX = xS(data.tp.T), tpY = yS(data.tp.P)
  const cpX = xS(data.cp.T), cpY = yS(data.cp.P)

  // Correct answer target position (for point questions)
  const correctX = target === 'triple_point' ? tpX : target === 'critical_point' ? cpX : null
  const correctY = target === 'triple_point' ? tpY : target === 'critical_point' ? cpY : null

  // Region labels — shown after answering, or dimmed if not the correct one
  const regionLabels = [
    { key: 'Solid',  label: 'SOLID',  pos: data.labelSolid,    color: '#60a5fa' },
    { key: 'Liquid', label: 'LIQUID', pos: data.labelLiquid,   color: '#34d399' },
    { key: 'Gas',    label: 'GAS',    pos: data.labelGas,      color: '#c084fc' },
  ]

  const targetRegion = target === 'solid' ? 'Solid' : target === 'liquid' ? 'Liquid' : target === 'gas' ? 'Gas' : null

  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    if (answered) return
    const rect = e.currentTarget.getBoundingClientRect()
    const svgX = (e.clientX - rect.left) / rect.width  * W
    const svgY = (e.clientY - rect.top)  / rect.height * H
    if (svgX < ML || svgX > ML + PW || svgY < MT || svgY > MT + PH) return
    onClickPlot(svgX, svgY, xI(svgX), yI(svgY))
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`w-full select-none ${answered ? '' : 'cursor-crosshair'}`}
      onClick={handleClick}
    >
      <defs>
        <clipPath id="pd-prob-plot">
          <rect x={ML} y={MT} width={PW} height={PH} />
        </clipPath>
      </defs>

      {/* Plot background */}
      <rect x={ML} y={MT} width={PW} height={PH} fill="rgba(var(--overlay),0.015)" rx="2" />

      {/* Grid */}
      {tTicks.map(t => (
        <line key={`gt${t}`} x1={xS(t)} y1={MT} x2={xS(t)} y2={MT + PH}
          stroke="rgba(var(--overlay),0.05)" strokeWidth="1" />
      ))}
      {pTicks.map(lp => (
        <line key={`gp${lp}`} x1={ML} y1={yS(10 ** lp)} x2={ML + PW} y2={yS(10 ** lp)}
          stroke="rgba(var(--overlay),0.05)" strokeWidth="1" />
      ))}

      {/* 1 atm reference */}
      {showAtm && (
        <g clipPath="url(#pd-prob-plot)">
          <line x1={ML} y1={y_atm} x2={ML + PW} y2={y_atm}
            stroke="rgba(var(--overlay),0.22)" strokeWidth="1" strokeDasharray="5 3" />
          <text x={ML + 4} y={y_atm - 4}
            fill="rgba(var(--overlay),0.35)" fontSize="8.5" fontFamily="monospace">1 atm</text>
        </g>
      )}

      {/* Phase curves */}
      <g clipPath="url(#pd-prob-plot)">
        <path d={curvePath(data.sublimation)}  fill="none" stroke={CURVE_COLOR.sublimation}  strokeWidth="2.5" strokeLinecap="round" />
        <path d={curvePath(data.vaporization)} fill="none" stroke={CURVE_COLOR.vaporization} strokeWidth="2.5" strokeLinecap="round" />
        <path d={curvePath(data.fusion)}        fill="none" stroke={CURVE_COLOR.fusion}        strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Region labels — hidden until answered */}
      {answered && regionLabels.map(({ key, label, pos, color }) => {
        const sx = xS(pos[0]), sy = yS(10 ** pos[1])
        if (sx < ML + 4 || sx > ML + PW - 4 || sy < MT + 4 || sy > MT + PH - 4) return null
        const isTarget  = key === targetRegion
        const opacity   = targetRegion === null ? 0.45 : isTarget ? 0.85 : 0.2
        return (
          <text key={key} x={sx} y={sy}
            clipPath="url(#pd-prob-plot)"
            textAnchor="middle" dominantBaseline="middle"
            fill={color} fontSize="13" fontFamily="system-ui" fontWeight="700"
            letterSpacing="0.06em" opacity={opacity}>
            {label}
          </text>
        )
      })}

      {/* Triple point — hidden until answered */}
      {answered && inPlot(data.tp.T, data.tp.P) && (() => {
        const isTarget = target === 'triple_point'
        const labelRight = tpX < ML + PW * 0.75
        return (
          <g>
            {!isCorrect && isTarget && (
              <circle cx={tpX} cy={tpY} r="16"
                fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
            )}
            <circle cx={tpX} cy={tpY} r="5.5" fill="#fbbf24" stroke="rgb(var(--color-base))" strokeWidth="1.5" />
            <text x={labelRight ? tpX + 9 : tpX - 9} y={tpY - 6}
              textAnchor={labelRight ? 'start' : 'end'}
              fill={isTarget ? '#fbbf24' : 'rgba(251,191,36,0.35)'}
              fontSize="9" fontFamily="monospace" fontWeight="600">
              Triple Point
            </text>
            <text x={labelRight ? tpX + 9 : tpX - 9} y={tpY + 5}
              textAnchor={labelRight ? 'start' : 'end'}
              fill={isTarget ? 'rgba(251,191,36,0.65)' : 'rgba(251,191,36,0.2)'}
              fontSize="8" fontFamily="monospace">
              {data.tp.T.toFixed(2)}°C
            </text>
          </g>
        )
      })()}

      {/* Critical point — hidden until answered */}
      {answered && inPlot(data.cp.T, data.cp.P) && (() => {
        const isTarget   = target === 'critical_point'
        const nearTop    = cpY < MT + 60
        const labelRight = cpX < ML + PW * 0.75
        return (
          <g>
            {!isCorrect && isTarget && (
              <circle cx={cpX} cy={cpY} r="16"
                fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
            )}
            <circle cx={cpX} cy={cpY} r="5.5" fill="#f43f5e" stroke="rgb(var(--color-base))" strokeWidth="1.5" />
            {nearTop ? (
              <>
                <text x={cpX} y={cpY + 15} textAnchor="middle"
                  fill={isTarget ? '#f43f5e' : 'rgba(244,63,94,0.35)'}
                  fontSize="9" fontFamily="monospace" fontWeight="600">Critical Point</text>
                <text x={cpX} y={cpY + 26} textAnchor="middle"
                  fill={isTarget ? 'rgba(244,63,94,0.65)' : 'rgba(244,63,94,0.2)'}
                  fontSize="8" fontFamily="monospace">{data.cp.T.toFixed(1)}°C</text>
              </>
            ) : (
              <>
                <text x={labelRight ? cpX + 9 : cpX - 9} y={cpY - 6}
                  textAnchor={labelRight ? 'start' : 'end'}
                  fill={isTarget ? '#f43f5e' : 'rgba(244,63,94,0.35)'}
                  fontSize="9" fontFamily="monospace" fontWeight="600">Critical Point</text>
                <text x={labelRight ? cpX + 9 : cpX - 9} y={cpY + 5}
                  textAnchor={labelRight ? 'start' : 'end'}
                  fill={isTarget ? 'rgba(244,63,94,0.65)' : 'rgba(244,63,94,0.2)'}
                  fontSize="8" fontFamily="monospace">{data.cp.T.toFixed(1)}°C</text>
              </>
            )}
          </g>
        )
      })()}

      {/* User click marker */}
      {clickSvgPos && (
        <circle cx={clickSvgPos.x} cy={clickSvgPos.y} r="8"
          fill={isCorrect ? '#34d399' : '#f87171'}
          stroke="rgba(var(--overlay),0.85)" strokeWidth="2"
          clipPath="url(#pd-prob-plot)" />
      )}

      {/* Correct-point ring when wrong on a point question */}
      {answered && !isCorrect && correctX !== null && correctY !== null && (
        <circle cx={correctX} cy={correctY} r="16"
          fill="none"
          stroke={target === 'triple_point' ? '#fbbf24' : '#f43f5e'}
          strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
      )}

      {/* "click the diagram" hint */}
      {!answered && !clickSvgPos && (
        <text x={ML + PW / 2} y={MT + 15} textAnchor="middle"
          fill="rgba(var(--overlay),0.18)" fontSize="9" fontFamily="system-ui">
          click the diagram to answer
        </text>
      )}

      {/* Axes */}
      <line x1={ML} y1={MT} x2={ML} y2={MT + PH + 6}
        stroke="rgba(var(--overlay),0.3)" strokeWidth="1" />
      <line x1={ML - 4} y1={MT + PH} x2={ML + PW} y2={MT + PH}
        stroke="rgba(var(--overlay),0.3)" strokeWidth="1" />

      {/* T ticks */}
      {tTicks.map(t => (
        <g key={`tt${t}`}>
          <line x1={xS(t)} y1={MT + PH} x2={xS(t)} y2={MT + PH + 4}
            stroke="rgba(var(--overlay),0.35)" strokeWidth="1" />
          <text x={xS(t)} y={MT + PH + 14} textAnchor="middle"
            fill="rgba(var(--overlay),0.45)" fontSize="9" fontFamily="monospace">{t}</text>
        </g>
      ))}

      {/* P ticks */}
      {pTicks.map(lp => (
        <g key={`pt${lp}`}>
          <line x1={ML - 3} y1={yS(10 ** lp)} x2={ML} y2={yS(10 ** lp)}
            stroke="rgba(var(--overlay),0.35)" strokeWidth="1" />
          <text x={ML - 6} y={yS(10 ** lp)} textAnchor="end" dominantBaseline="middle"
            fill="rgba(var(--overlay),0.45)" fontSize="8" fontFamily="monospace">
            {pTickLabel(lp)}
          </text>
        </g>
      ))}

      {/* Axis labels */}
      <text x={ML + PW / 2} y={H - 6} textAnchor="middle"
        fill="rgba(var(--overlay),0.3)" fontSize="10" fontFamily="system-ui">
        Temperature (°C)
      </text>
      <text x={14} y={MT + PH / 2} textAnchor="middle"
        fill="rgba(var(--overlay),0.3)" fontSize="10" fontFamily="system-ui"
        transform={`rotate(-90, 14, ${MT + PH / 2})`}>
        Pressure
      </text>

      {/* Curve legend */}
      {[
        { color: CURVE_COLOR.sublimation,  label: 'Sublimation'  },
        { color: CURVE_COLOR.vaporization, label: 'Vaporization' },
        { color: CURVE_COLOR.fusion,       label: 'Fusion'       },
      ].map(({ color, label }, i) => (
        <g key={label} transform={`translate(${ML + 6 + i * 96}, ${MT + 10})`}>
          <line x1={0} y1={0} x2={18} y2={0} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <text x={22} y={0} dominantBaseline="middle"
            fill="rgba(var(--overlay),0.5)" fontSize="8.5" fontFamily="system-ui">{label}</text>
        </g>
      ))}
    </svg>
  )
}

// ── Bold-text renderer ────────────────────────────────────────────────────────

function BoldText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 0
          ? <span key={i}>{part}</span>
          : <strong key={i} className="font-semibold" style={{ color: 'var(--c-halogen)' }}>{part}</strong>
      )}
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

// Click tolerance in SVG px for point targets
const POINT_HIT_RADIUS = 24

export default function PhaseDiagramProblems() {
  const [problem,     setProblem]     = useState<Problem>(() => genProblem())
  const [lastTarget,  setLastTarget]  = useState<TargetKind | undefined>(undefined)
  const [clickSvgPos, setClickSvgPos] = useState<{ x: number; y: number } | null>(null)
  const [answered,    setAnswered]    = useState(false)
  const [isCorrect,   setIsCorrect]   = useState(false)
  const [score,       setScore]       = useState({ correct: 0, total: 0 })
  const [cardKey,     setCardKey]     = useState(0)

  function handleClickPlot(svgX: number, svgY: number, T: number, P: number) {
    if (answered) return

    const { data, target } = problem
    const { Tmin, Tmax, logPmin, logPmax } = data

    const xS = (t: number) => ML + (t - Tmin) / (Tmax - Tmin) * PW
    const yS = (p: number) => {
      const lp = Math.log10(Math.max(p, 10 ** (logPmin - 1)))
      return MT + PH - (lp - logPmin) / (logPmax - logPmin) * PH
    }

    let correct = false

    if (target === 'triple_point') {
      const dx = svgX - xS(data.tp.T)
      const dy = svgY - yS(data.tp.P)
      correct = Math.sqrt(dx * dx + dy * dy) <= POINT_HIT_RADIUS
    } else if (target === 'critical_point') {
      const dx = svgX - xS(data.cp.T)
      const dy = svgY - yS(data.cp.P)
      correct = Math.sqrt(dx * dx + dy * dy) <= POINT_HIT_RADIUS
    } else {
      const phase = identifyPhase(data, T, P)
      const expected: Record<TargetKind, string> = {
        solid:          'Solid',
        liquid:         'Liquid',
        gas:            'Gas',
        triple_point:   '',
        critical_point: '',
      }
      correct = phase === expected[target]
    }

    setClickSvgPos({ x: svgX, y: svgY })
    setAnswered(true)
    setIsCorrect(correct)
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  function next() {
    const p = genProblem(lastTarget)
    setLastTarget(p.target)
    setProblem(p)
    setClickSvgPos(null)
    setAnswered(false)
    setIsCorrect(false)
    setCardKey(k => k + 1)
  }

  const { data, question, explanation } = problem

  const targetColor: Record<TargetKind, string> = {
    solid:          REGION_COLOR.Solid,
    liquid:         REGION_COLOR.Liquid,
    gas:            REGION_COLOR.Gas,
    triple_point:   '#fbbf24',
    critical_point: '#f43f5e',
  }

  return (
    <div className="flex flex-col gap-5 max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">Phase Diagrams</span>
          {score.total > 0 && (
            <span className="font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>
              {score.correct}/{score.total}
            </span>
          )}
        </div>
        <button onClick={next}
          className="font-mono text-xs text-dim hover:text-secondary transition-colors">
          ↻ New
        </button>
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div key={cardKey}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
          className="rounded-sm border border-border bg-surface overflow-hidden"
        >
          {/* Card header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-wrap gap-3"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 6%, rgb(var(--color-raised)))' }}>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-secondary tracking-widest uppercase">Identify the region / point</span>
              <span className="font-mono text-xs text-secondary">
                {data.name} ({data.formula})
              </span>
            </div>
          </div>

          {/* Question */}
          <div className="px-4 pt-4 pb-2">
            <p className="font-sans text-sm text-bright leading-relaxed">
              <BoldText text={question} />
            </p>
          </div>

          {/* Interactive diagram */}
          <div className="px-4 pb-4">
            <div className="rounded-sm border border-border overflow-hidden p-2"
              style={{ background: 'rgb(var(--color-base))' }}>
              <InteractiveSVG
                problem={problem}
                answered={answered}
                isCorrect={isCorrect}
                clickSvgPos={clickSvgPos}
                onClickPlot={handleClickPlot}
              />
            </div>
          </div>

          {/* Feedback */}
          <AnimatePresence initial={false}>
            {answered && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden border-t border-border"
              >
                <div className="px-4 py-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-sm font-semibold"
                      style={{ color: isCorrect ? '#34d399' : '#f87171' }}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                    {!isCorrect && (
                      <span className="font-sans text-xs text-dim"
                        style={{ color: targetColor[problem.target] }}>
                        — correct answer highlighted on the diagram
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-xs text-secondary leading-relaxed">
                    {explanation}
                  </p>
                  <button onClick={next}
                    className="self-start mt-1 px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-all"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                      color: 'var(--c-halogen)',
                    }}>
                    Next →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

    </div>
  )
}
