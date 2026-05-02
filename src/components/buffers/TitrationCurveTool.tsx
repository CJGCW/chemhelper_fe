import { useState, useMemo, useEffect } from 'react'
import { computeTitrationCurve, type TitrationCurveSolution } from '../../chem/titrationCurve'
import NumberField from '../shared/NumberField'

type CurveType = 'SA+SB' | 'WA+SB' | 'SB+SA' | 'WB+SA'

const CURVE_OPTIONS: { value: CurveType; label: string }[] = [
  { value: 'SA+SB', label: 'Strong Acid + Strong Base' },
  { value: 'WA+SB', label: 'Weak Acid + Strong Base'   },
  { value: 'SB+SA', label: 'Strong Base + Strong Acid'  },
  { value: 'WB+SA', label: 'Weak Base + Strong Acid'    },
]

// SVG dimensions
const SVG_W = 400
const SVG_H = 250
const PAD   = { top: 15, right: 20, bottom: 40, left: 45 }
const INNER_W = SVG_W - PAD.left - PAD.right
const INNER_H = SVG_H - PAD.top  - PAD.bottom

function toSvgX(vol: number, maxVol: number): number {
  return PAD.left + (vol / maxVol) * INNER_W
}

function toSvgY(pH: number): number {
  return PAD.top + INNER_H - (pH / 14) * INNER_H
}

function formatPH(pH: number): string {
  return isFinite(pH) ? pH.toFixed(2) : '—'
}

function TitrationSVG({ solution, maxVol }: { solution: TitrationCurveSolution; maxVol: number }) {
  const { points, equivalenceVolume, equivalencePH, halfEquivalenceVolume } = solution

  const pathD = points.length > 0
    ? points.map((pt, i) => `${i === 0 ? 'M' : 'L'}${toSvgX(pt.volumeAdded, maxVol).toFixed(1)},${toSvgY(pt.pH).toFixed(1)}`).join(' ')
    : ''

  // Y-axis pH labels
  const yLabels = [0, 2, 4, 6, 7, 8, 10, 12, 14]
  // X-axis volume labels
  const xLabelCount = 5
  const xLabels = Array.from({ length: xLabelCount + 1 }, (_, i) => (i / xLabelCount) * maxVol)

  const equivX = toSvgX(equivalenceVolume, maxVol)
  const halfX  = toSvgX(halfEquivalenceVolume, maxVol)

  return (
    <svg width={SVG_W} height={SVG_H} className="w-full" viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
      {/* Grid lines */}
      {yLabels.map(pH => (
        <line
          key={`yg-${pH}`}
          x1={PAD.left} y1={toSvgY(pH)}
          x2={PAD.left + INNER_W} y2={toSvgY(pH)}
          stroke="rgb(var(--color-border))" strokeWidth="0.5"
        />
      ))}

      {/* Y-axis labels */}
      {yLabels.map(pH => (
        <text
          key={`yl-${pH}`}
          x={PAD.left - 5} y={toSvgY(pH) + 4}
          textAnchor="end"
          fontSize="9"
          fill="rgb(var(--color-secondary))"
        >{pH}</text>
      ))}

      {/* X-axis labels */}
      {xLabels.map((v, i) => (
        <text
          key={`xl-${i}`}
          x={toSvgX(v, maxVol)} y={PAD.top + INNER_H + 14}
          textAnchor="middle"
          fontSize="9"
          fill="rgb(var(--color-secondary))"
        >{v.toFixed(0)}</text>
      ))}

      {/* Axes */}
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + INNER_H}
        stroke="rgb(var(--color-border))" strokeWidth="1" />
      <line x1={PAD.left} y1={PAD.top + INNER_H} x2={PAD.left + INNER_W} y2={PAD.top + INNER_H}
        stroke="rgb(var(--color-border))" strokeWidth="1" />

      {/* Axis labels */}
      <text x={PAD.left + INNER_W / 2} y={SVG_H - 2} textAnchor="middle" fontSize="9" fill="rgb(var(--color-secondary))">
        Volume added (mL)
      </text>
      <text
        x={10} y={PAD.top + INNER_H / 2}
        textAnchor="middle" fontSize="9" fill="rgb(var(--color-secondary))"
        transform={`rotate(-90, 10, ${PAD.top + INNER_H / 2})`}
      >
        pH
      </text>

      {/* pH=7 reference line */}
      <line
        x1={PAD.left} y1={toSvgY(7)}
        x2={PAD.left + INNER_W} y2={toSvgY(7)}
        stroke="rgb(var(--color-secondary))" strokeWidth="0.5" strokeDasharray="3,3"
      />

      {/* Half-equivalence dashed line */}
      {halfEquivalenceVolume > 0 && halfEquivalenceVolume < maxVol && (
        <line
          x1={halfX} y1={PAD.top}
          x2={halfX} y2={PAD.top + INNER_H}
          stroke="#facc15" strokeWidth="1" strokeDasharray="4,3" opacity="0.6"
        />
      )}

      {/* Titration curve */}
      {pathD && (
        <path d={pathD} fill="none" stroke="var(--c-halogen)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}

      {/* Equivalence point dot */}
      {equivalenceVolume > 0 && equivalenceVolume < maxVol && (
        <>
          <circle
            cx={equivX} cy={toSvgY(equivalencePH)}
            r="5"
            fill="var(--c-halogen)"
            stroke="rgb(var(--color-surface))"
            strokeWidth="2"
          />
          <text
            x={equivX + 7} y={toSvgY(equivalencePH) - 5}
            fontSize="8"
            fill="var(--c-halogen)"
          >
            EP
          </text>
        </>
      )}
    </svg>
  )
}

export default function TitrationCurveTool() {
  const [curveType,  setCurveType]  = useState<CurveType>('WA+SB')
  const [concA,      setConcA]      = useState('0.100')
  const [volA,       setVolA]       = useState('25.0')
  const [concB,      setConcB]      = useState('0.100')
  const [kaStr,      setKaStr]      = useState('1.8e-5')
  const [kbStr,      setKbStr]      = useState('1.8e-5')
  const [error,      setError]      = useState<string | null>(null)

  const { solution, computeError } = useMemo<{ solution: TitrationCurveSolution | null; computeError: string | null }>(() => {
    const ca = parseFloat(concA)
    const va = parseFloat(volA)
    const cb = parseFloat(concB)

    if (!isFinite(ca) || ca <= 0 || !isFinite(va) || va <= 0 || !isFinite(cb) || cb <= 0) {
      return { solution: null, computeError: 'Enter positive values for concentrations and volume.' }
    }

    try {
      if (curveType === 'SA+SB') {
        return { solution: computeTitrationCurve({
          analyte: { type: 'strong-acid', concentration: ca, volume: va },
          titrant: { type: 'strong-base', concentration: cb },
        }), computeError: null }
      }
      if (curveType === 'SB+SA') {
        return { solution: computeTitrationCurve({
          analyte: { type: 'strong-base', concentration: ca, volume: va },
          titrant: { type: 'strong-acid', concentration: cb },
        }), computeError: null }
      }
      if (curveType === 'WA+SB') {
        const Ka = parseFloat(kaStr)
        if (!isFinite(Ka) || Ka <= 0) return { solution: null, computeError: 'Enter a valid Ka value.' }
        return { solution: computeTitrationCurve({
          analyte: { type: 'weak-acid', concentration: ca, volume: va, Ka },
          titrant: { type: 'strong-base', concentration: cb },
        }), computeError: null }
      }
      if (curveType === 'WB+SA') {
        const Kb = parseFloat(kbStr)
        if (!isFinite(Kb) || Kb <= 0) return { solution: null, computeError: 'Enter a valid Kb value.' }
        return { solution: computeTitrationCurve({
          analyte: { type: 'weak-base', concentration: ca, volume: va, Kb },
          titrant: { type: 'strong-acid', concentration: cb },
        }), computeError: null }
      }
    } catch (e) {
      return { solution: null, computeError: e instanceof Error ? e.message : 'Computation error' }
    }
    return { solution: null, computeError: null }
  }, [curveType, concA, volA, concB, kaStr, kbStr])

  useEffect(() => { setError(computeError) }, [computeError])

  const maxVol = solution
    ? solution.equivalenceVolume * 2.2
    : 60

  const needsKa = curveType === 'WA+SB'
  const needsKb = curveType === 'WB+SA'

  return (
    <div className="flex flex-col gap-5 max-w-xl">
      {/* Curve type */}
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-primary">Titration Type</label>
        <select
          value={curveType}
          onChange={e => setCurveType(e.target.value as CurveType)}
          className="font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2 text-primary focus:outline-none focus:border-accent/40"
        >
          {CURVE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-3 gap-3">
        <NumberField
          label="Analyte conc."
          value={concA}
          onChange={setConcA}
          unit={<span className="font-mono text-xs text-secondary px-2">M</span>}
          placeholder="0.100"
        />
        <NumberField
          label="Analyte volume"
          value={volA}
          onChange={setVolA}
          unit={<span className="font-mono text-xs text-secondary px-2">mL</span>}
          placeholder="25.0"
        />
        <NumberField
          label="Titrant conc."
          value={concB}
          onChange={setConcB}
          unit={<span className="font-mono text-xs text-secondary px-2">M</span>}
          placeholder="0.100"
        />
      </div>

      {needsKa && (
        <NumberField
          label="Ka of weak acid"
          value={kaStr}
          onChange={setKaStr}
          placeholder="1.8e-5"
          hint="For acetic acid: 1.8×10⁻⁵. Can use scientific notation (1.8e-5)."
        />
      )}
      {needsKb && (
        <NumberField
          label="Kb of weak base"
          value={kbStr}
          onChange={setKbStr}
          placeholder="1.8e-5"
          hint="For ammonia: 1.8×10⁻⁵."
        />
      )}

      {error && <p className="font-sans text-sm text-red-400">{error}</p>}

      {/* Chart */}
      <div className="p-3 rounded-sm border border-border bg-raised">
        {solution ? (
          <TitrationSVG solution={solution} maxVol={maxVol} />
        ) : (
          <div className="h-[250px] flex items-center justify-center">
            <p className="font-mono text-sm text-dim">Enter values above to see the curve.</p>
          </div>
        )}
      </div>

      {/* Key values */}
      {solution && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Initial pH',          value: formatPH(solution.initialPH)         },
            { label: 'Equivalence volume',  value: `${solution.equivalenceVolume.toFixed(2)} mL` },
            { label: 'Equivalence pH',      value: formatPH(solution.equivalencePH)     },
            { label: 'Half-equiv. pH (pKa)', value: formatPH(solution.halfEquivalencePH) },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-sm border border-border bg-raised flex flex-col gap-1">
              <p className="font-sans text-xs text-secondary">{label}</p>
              <p className="font-mono text-base font-semibold" style={{ color: 'var(--c-halogen)' }}>{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
