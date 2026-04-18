import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  type Phase, type HCProblem,
  genHCProblem,
} from '../../utils/heatingCurveProblems'

type Problem = HCProblem
const genProblem = genHCProblem

const PHASE_INFO: Record<Phase, { color: string; label: string }> = {
  solid:        { color: '#60a5fa', label: 'Solid'        },
  melting:      { color: '#fb923c', label: 'Melting'      },
  liquid:       { color: '#34d399', label: 'Liquid'       },
  vaporization: { color: '#f43f5e', label: 'Vaporization' },
  gas:          { color: '#c084fc', label: 'Gas'          },
}

// ── SVG constants ─────────────────────────────────────────────────────────────

const W = 580, H = 300
const ML = 60, MR = 24, MT = 28, MB = 48
const PW = W - ML - MR
const PH = H - MT - MB

// ── Interactive SVG ───────────────────────────────────────────────────────────

function InteractiveCurve({
  problem,
  onClickSeg,
  clickSvgPos,
  answered,
  isCorrect,
}: {
  problem:      Problem
  onClickSeg:   (svgX: number, svgY: number, segIdx: number) => void
  clickSvgPos:  { x: number; y: number } | null
  answered:     boolean
  isCorrect:    boolean
}) {
  const { segments, pts, maxQ, t0, t1, sub, validIdxs } = problem

  const tLow   = Math.min(t0, t1)
  const tHigh  = Math.max(t0, t1)
  const tRange = tHigh - tLow || 1
  const tPad   = tRange * 0.10

  const xS = (q: number) => ML + (q / maxQ) * PW
  const yS = (t: number) => MT + PH - ((t - (tLow - tPad)) / (tRange + 2 * tPad)) * PH

  const inTRange = (t: number) => t > tLow - tPad && t < tHigh + tPad
  const transitionLines: { t: number; label: string }[] = []
  if (inTRange(sub.mp)) transitionLines.push({ t: sub.mp, label: `${sub.mp}°C` })
  if (inTRange(sub.bp)) transitionLines.push({ t: sub.bp, label: `${sub.bp}°C` })

  const transTemps = new Set(transitionLines.map(l => l.t))
  const yTicks = [t0, t1].filter(t => !transTemps.has(t)).sort((a, b) => a - b)
  const xTicks = [0.25, 0.5, 0.75, 1.0].map(f => f * maxQ)
  const kj     = (j: number) => (j / 1000).toPrecision(3)

  // Highlight rects for all valid segments
  const highlights = validIdxs.map(idx => ({
    x:     xS(pts[idx].x),
    width: Math.max(xS(pts[idx + 1].x) - xS(pts[idx].x), 10),
    color: PHASE_INFO[segments[idx].phase].color,
  }))

  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    if (answered) return
    const rect  = e.currentTarget.getBoundingClientRect()
    const svgX  = ((e.clientX - rect.left) / rect.width) * W
    const svgY  = ((e.clientY - rect.top) / rect.height) * H
    if (svgX < ML || svgX > ML + PW || svgY < MT || svgY > MT + PH) return

    const xData = ((svgX - ML) / PW) * maxQ
    let   segIdx = -1
    for (let i = 0; i < segments.length; i++) {
      if (xData >= pts[i].x && xData <= pts[i + 1].x) { segIdx = i; break }
    }
    onClickSeg(svgX, svgY, segIdx)
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`w-full select-none ${answered ? '' : 'cursor-crosshair'}`}
      onClick={handleClick}
      aria-label="Heating curve — click to answer"
    >
      {/* Plot background */}
      <rect x={ML} y={MT} width={PW} height={PH} fill="rgba(255,255,255,0.015)" rx="2" />

      {/* Vertical grid */}
      {xTicks.map((q, i) => (
        <line key={i} x1={xS(q)} y1={MT} x2={xS(q)} y2={MT + PH}
          stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}

      {/* Dashed transition lines + y labels */}
      {transitionLines.map(({ t, label }) => (
        <g key={label}>
          <line x1={ML} y1={yS(t)} x2={ML + PW} y2={yS(t)}
            stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4 3" />
          <text x={ML - 4} y={yS(t)} textAnchor="end" dominantBaseline="middle"
            fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="monospace">{label}</text>
        </g>
      ))}

      {/* Answer highlights — shown after click */}
      {answered && highlights.map((h, i) => (
        <rect key={i} x={h.x} y={MT} width={h.width} height={PH}
          fill={`${h.color}18`}
          stroke={`${h.color}60`}
          strokeWidth="1.5" rx="2" />
      ))}

      {/* Curve segments */}
      {segments.map((seg, i) => (
        <line key={i}
          x1={xS(pts[i].x)}     y1={yS(pts[i].t)}
          x2={xS(pts[i + 1].x)} y2={yS(pts[i + 1].t)}
          stroke={PHASE_INFO[seg.phase].color}
          strokeWidth="2.5" strokeLinecap="round" />
      ))}

      {/* Start / end dots */}
      <circle cx={xS(0)}     cy={yS(t0)} r="3.5" fill={PHASE_INFO[segments[0].phase].color} />
      <circle cx={xS(maxQ)}  cy={yS(t1)} r="3.5" fill={PHASE_INFO[segments[segments.length - 1].phase].color} />

      {/* Axes */}
      <line x1={ML} y1={MT} x2={ML} y2={MT + PH + 6}
        stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <line x1={ML - 4} y1={MT + PH} x2={ML + PW} y2={MT + PH}
        stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

      {/* Y ticks */}
      {yTicks.map(t => (
        <g key={t}>
          <line x1={ML - 3} y1={yS(t)} x2={ML} y2={yS(t)}
            stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <text x={ML - 6} y={yS(t)} textAnchor="end" dominantBaseline="middle"
            fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="monospace">
            {t.toFixed(t % 1 === 0 ? 0 : 1)}°
          </text>
        </g>
      ))}

      {/* X ticks */}
      {xTicks.map(q => (
        <g key={q}>
          <line x1={xS(q)} y1={MT + PH} x2={xS(q)} y2={MT + PH + 3}
            stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <text x={xS(q)} y={MT + PH + 14} textAnchor="middle"
            fill="rgba(255,255,255,0.4)" fontSize="8.5" fontFamily="monospace">
            {kj(q)}
          </text>
        </g>
      ))}

      {/* Axis labels */}
      <text x={ML - 40} y={MT + PH / 2} textAnchor="middle"
        fill="rgba(255,255,255,0.3)" fontSize="9.5" fontFamily="system-ui"
        transform={`rotate(-90, ${ML - 40}, ${MT + PH / 2})`}>
        Temperature (°C)
      </text>
      <text x={ML + PW / 2} y={H - 4} textAnchor="middle"
        fill="rgba(255,255,255,0.3)" fontSize="9.5" fontFamily="system-ui">
        Heat Added (kJ)
      </text>

      {/* "Click the curve" hint */}
      {!answered && !clickSvgPos && (
        <text x={ML + PW / 2} y={MT + 15} textAnchor="middle"
          fill="rgba(255,255,255,0.18)" fontSize="9" fontFamily="system-ui">
          click the curve to answer
        </text>
      )}

      {/* User click marker */}
      {clickSvgPos && (
        <circle cx={clickSvgPos.x} cy={clickSvgPos.y} r="8"
          fill={isCorrect ? '#34d399' : '#f87171'}
          stroke="rgba(255,255,255,0.85)" strokeWidth="2" />
      )}
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

export default function HeatingCurveProblems() {
  const [problem,      setProblem]      = useState<Problem>(() => genProblem())
  const [clickSvgPos,  setClickSvgPos]  = useState<{ x: number; y: number } | null>(null)
  const [answered,     setAnswered]     = useState(false)
  const [isCorrect,    setIsCorrect]    = useState(false)
  const [score,        setScore]        = useState({ correct: 0, total: 0 })

  // Unique key for AnimatePresence — changes on each new problem
  const [cardKey, setCardKey] = useState(0)

  function handleClickSeg(svgX: number, svgY: number, segIdx: number) {
    if (answered) return
    const correct = problem.validIdxs.includes(segIdx)
    setClickSvgPos({ x: svgX, y: svgY })
    setAnswered(true)
    setIsCorrect(correct)
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  function next() {
    setProblem(genProblem())
    setClickSvgPos(null)
    setAnswered(false)
    setIsCorrect(false)
    setCardKey(k => k + 1)
  }

  const { sub, mass, segments, question, explanation } = problem

  return (
    <div className="flex flex-col gap-5 max-w-2xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-dim tracking-widest uppercase">Heating Curves</span>
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
          {/* Card header: substance info + legend */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-wrap gap-3"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 6%, #141620)' }}>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] text-dim tracking-widest uppercase">Identify the region</span>
              <span className="font-mono text-xs text-secondary">
                {sub.name} ({sub.formula}) · {mass} g
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {(Object.keys(PHASE_INFO) as Phase[])
                .filter(p => segments.some(s => s.phase === p))
                .map(p => (
                  <div key={p} className="flex items-center gap-1">
                    <div className="w-3 h-0.5 rounded" style={{ background: PHASE_INFO[p].color }} />
                    <span className="font-mono text-[9px]" style={{ color: PHASE_INFO[p].color }}>
                      {PHASE_INFO[p].label}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Question */}
          <div className="px-4 pt-4 pb-2">
            <p className="font-sans text-sm text-bright leading-relaxed">
              <BoldText text={question} />
            </p>
          </div>

          {/* Interactive curve */}
          <div className="px-4 pb-4">
            <div className="rounded-sm border border-border overflow-hidden"
              style={{ background: '#0a0c10' }}>
              <InteractiveCurve
                problem={problem}
                onClickSeg={handleClickSeg}
                clickSvgPos={clickSvgPos}
                answered={answered}
                isCorrect={isCorrect}
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
                      <span className="font-sans text-xs text-dim">
                        — correct region highlighted on the curve
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-xs text-secondary leading-relaxed">
                    {explanation}
                  </p>
                  <button onClick={next}
                    className="self-start mt-1 px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-all"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 18%, #0e1016)',
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
