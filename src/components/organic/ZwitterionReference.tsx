import { useState } from 'react'
import CompoundDisplay from '../shared/CompoundDisplay'

const acidColor = 'var(--c-acid)'
const amineColor = 'var(--c-amine)'

export default function ZwitterionReference() {
  const [derivationOpen, setDerivationOpen] = useState(false)

  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <div>
        <h3 className="font-sans font-semibold text-base text-primary mb-1">Zwitterions &amp; the Isoelectric Point</h3>
        <p className="font-sans text-xs text-secondary leading-relaxed">
          Amino acids contain both an acidic carboxyl group and a basic amino group. In aqueous solution
          they exist as dipolar ions (zwitterions). The isoelectric point (pI) is the pH at which the
          molecule carries zero net charge. Brown Ch. 27.
        </p>
      </div>

      {/* ── What is a zwitterion? ─────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">What is a Zwitterion?</h4>
        <p className="font-sans text-xs text-secondary leading-relaxed">
          A molecule bearing both a formal positive charge and a formal negative charge, with net charge
          zero. For glycine (simplest amino acid), the zwitterion has NH₃⁺ and COO⁻. This intramolecular
          proton transfer occurs spontaneously in water and is the dominant form at physiological pH.
        </p>

        {/* Three protonation states */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Cation */}
          <div className="flex flex-col items-center gap-2 rounded-sm border border-border p-3" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="text-xs font-semibold text-primary">Cation</p>
            <CompoundDisplay smiles="[NH3+]CC(=O)O" width={120} height={90} />
            <div className="text-center">
              <p className="font-mono text-xs text-secondary">pH &lt; pK<sub>a1</sub> ≈ 2.34</p>
              <p className="font-mono text-xs font-semibold" style={{ color: acidColor }}>net +1</p>
            </div>
          </div>

          {/* Zwitterion — with arrow indicators */}
          <div className="flex flex-col items-center gap-2 rounded-sm border-2 p-3" style={{ borderColor: 'var(--c-halogen)', background: 'rgb(var(--color-raised))' }}>
            <p className="text-xs font-semibold text-primary">Zwitterion</p>
            <CompoundDisplay smiles="[NH3+]CC(=O)[O-]" width={120} height={90} />
            <div className="text-center">
              <p className="font-mono text-xs text-secondary">pH = pI = 5.97</p>
              <p className="font-mono text-xs font-semibold text-primary">net 0</p>
            </div>
          </div>

          {/* Anion */}
          <div className="flex flex-col items-center gap-2 rounded-sm border border-border p-3" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="text-xs font-semibold text-primary">Anion</p>
            <CompoundDisplay smiles="NCC(=O)[O-]" width={120} height={90} />
            <div className="text-center">
              <p className="font-mono text-xs text-secondary">pH &gt; pK<sub>a2</sub> ≈ 9.60</p>
              <p className="font-mono text-xs font-semibold" style={{ color: amineColor }}>net −1</p>
            </div>
          </div>
        </div>

        {/* Transition arrows */}
        <div className="flex items-center justify-center gap-2 text-xs text-secondary font-mono print:flex">
          <span>Cation</span>
          <span className="flex flex-col items-center">
            <span style={{ color: acidColor }}>— H⁺ at pK<sub>a1</sub></span>
            <span>→</span>
          </span>
          <span className="font-semibold text-primary">Zwitterion</span>
          <span className="flex flex-col items-center">
            <span style={{ color: amineColor }}>— H⁺ at pK<sub>a2</sub></span>
            <span>→</span>
          </span>
          <span>Anion</span>
        </div>
      </section>

      {/* ── pI definition ─────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">The Isoelectric Point (pI)</h4>
        <div className="rounded-sm border border-border p-3 text-xs font-sans" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="font-semibold text-primary mb-1">Definition</p>
          <p className="text-secondary leading-relaxed">
            pI is the pH at which the amino acid carries <span className="font-semibold text-primary">zero net charge</span> — the
            pH where the zwitterion form predominates. Below pI the molecule is net positive; above pI
            it is net negative.
          </p>
          <p className="text-secondary mt-2 leading-relaxed">
            <span className="font-semibold text-primary">Applications:</span> gel electrophoresis (the protein
            stops migrating at its pI), isoelectric focusing (IEF) separations, and protein solubility
            optimization (minimum solubility occurs at pI).
          </p>
        </div>
      </section>

      {/* ── The three pI formulas ─────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">The Three pI Formulas</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Neutral */}
          <div className="flex flex-col gap-2 rounded-sm border border-border p-3" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="text-xs font-semibold text-primary">Neutral Side Chain</p>
            <p className="text-xs text-secondary">Ala, Val, Leu, Ile, Gly, Pro, Met, Ser, Thr, Asn, Gln, Phe, Trp, Tyr</p>
            <div className="rounded-sm p-2 font-mono text-xs text-center" style={{ background: 'rgb(var(--color-surface))' }}>
              pI = (pK<sub>a1</sub> + pK<sub>a2</sub>) / 2
            </div>
            <div className="text-xs text-secondary">
              <p className="font-semibold text-primary mb-0.5">Example — Alanine:</p>
              <p>pK<sub>a1</sub> = 2.34, pK<sub>a2</sub> = 9.69</p>
              <p>pI = (2.34 + 9.69) / 2 = <span className="font-semibold text-primary">6.02</span></p>
            </div>
            <p className="text-xs text-secondary italic">The zwitterion sits between the two pKa transitions — average them.</p>
          </div>

          {/* Acidic */}
          <div className="flex flex-col gap-2 rounded-sm border p-3" style={{ background: 'rgb(var(--color-raised))', borderColor: `color-mix(in srgb, ${acidColor} 40%, rgb(var(--color-border)))` }}>
            <p className="text-xs font-semibold" style={{ color: acidColor }}>Acidic Side Chain</p>
            <p className="text-xs text-secondary">Asp, Glu</p>
            <div className="rounded-sm p-2 font-mono text-xs text-center" style={{ background: 'rgb(var(--color-surface))' }}>
              pI = (pK<sub>a1</sub> + pK<sub>aR</sub>) / 2
            </div>
            <div className="text-xs text-secondary">
              <p className="font-semibold mb-0.5" style={{ color: acidColor }}>Example — Glutamate:</p>
              <p>pK<sub>a1</sub> = 2.19, pK<sub>aR</sub> = 4.25</p>
              <p>pI = (2.19 + 4.25) / 2 = <span className="font-semibold" style={{ color: acidColor }}>3.22</span></p>
            </div>
            <p className="text-xs text-secondary italic">Average the two <span style={{ color: acidColor }}>acidic</span> pKa values.</p>
          </div>

          {/* Basic */}
          <div className="flex flex-col gap-2 rounded-sm border p-3" style={{ background: 'rgb(var(--color-raised))', borderColor: `color-mix(in srgb, ${amineColor} 40%, rgb(var(--color-border)))` }}>
            <p className="text-xs font-semibold" style={{ color: amineColor }}>Basic Side Chain</p>
            <p className="text-xs text-secondary">Lys, Arg, His</p>
            <div className="rounded-sm p-2 font-mono text-xs text-center" style={{ background: 'rgb(var(--color-surface))' }}>
              pI = (pK<sub>a2</sub> + pK<sub>aR</sub>) / 2
            </div>
            <div className="text-xs text-secondary">
              <p className="font-semibold mb-0.5" style={{ color: amineColor }}>Example — Lysine:</p>
              <p>pK<sub>a2</sub> = 8.95, pK<sub>aR</sub> = 10.50</p>
              <p>pI = (8.95 + 10.50) / 2 = <span className="font-semibold" style={{ color: amineColor }}>9.73</span></p>
            </div>
            <p className="text-xs text-secondary italic">Average the two <span style={{ color: amineColor }}>basic</span> pKa values.</p>
          </div>
        </div>
      </section>

      {/* ── Derivation collapsible ─────────────────────────────────────────── */}
      <section className="flex flex-col gap-2 print:gap-3">
        <button
          onClick={() => setDerivationOpen(o => !o)}
          className="flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors w-fit print:hidden"
        >
          <span>{derivationOpen ? '▾' : '▸'}</span>
          Why These Formulas? (Derivation)
        </button>
        <h4 className="hidden print:block font-sans font-semibold text-sm text-primary">Why These Formulas?</h4>
        <div className={`flex flex-col gap-2 text-xs text-secondary leading-relaxed ${derivationOpen ? '' : 'hidden'} print:flex`}>
          <p>
            At any given pH, an amino acid exists as a mixture of protonation states. pI is the pH where
            the weighted average net charge equals exactly zero.
          </p>
          <p>
            <span className="font-semibold text-primary">Neutral side chain (e.g. Ala):</span> Two ionizable
            groups. The fully protonated cation (NH₃⁺/COOH) loses a proton at pK<sub>a1</sub> to give the
            zwitterion (NH₃⁺/COO⁻). The zwitterion then loses a proton at pK<sub>a2</sub> to give the
            anion (NH₂/COO⁻). The zwitterion is the dominant species between the two pKas — its
            concentration peaks exactly at their midpoint: pI = (pK<sub>a1</sub> + pK<sub>a2</sub>) / 2.
          </p>
          <p>
            <span className="font-semibold" style={{ color: acidColor }}>Acidic side chain (e.g. Glu):</span> Three ionizable
            groups (α-COOH, side-chain COOH, α-NH₃⁺). The zwitterion has α-NH₃⁺/α-COO⁻ but the side
            chain still protonated (COOH). This species sits between the two carboxyl pKa transitions
            (pK<sub>a1</sub> and pK<sub>aR</sub>). pI = average of the two acidic pKa values.
          </p>
          <p>
            <span className="font-semibold" style={{ color: amineColor }}>Basic side chain (e.g. Lys):</span> Three ionizable
            groups (α-COOH, α-NH₃⁺, side-chain NH₃⁺). The zwitterion has α-NH₃⁺ and the side-chain
            NH₃⁺ both protonated, with α-COO⁻. This species sits between the two amino pKa transitions
            (pK<sub>a2</sub> and pK<sub>aR</sub>). pI = average of the two basic pKa values.
          </p>
          <p className="italic">
            Common traps: using the wrong pair of pKa values (e.g. averaging all three pKas); confusing
            pI with a single pKa; forgetting that Arg's guanidinium pK<sub>aR</sub> ≈ 12 means it is
            always protonated at pH 7.4.
          </p>
        </div>
      </section>

      {/* ── Charge-vs-pH diagrams ─────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Net Charge vs. pH</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ChargeVsPHPanel
            title="Neutral — Alanine"
            color="var(--c-halogen)"
            pKa1={2.34} pKa2={9.69} pI={6.02}
            type="neutral"
          />
          <ChargeVsPHPanel
            title="Acidic — Glutamate"
            color={acidColor}
            pKa1={2.19} pKaR={4.25} pI={3.22}
            type="acidic"
          />
          <ChargeVsPHPanel
            title="Basic — Lysine"
            color={amineColor}
            pKa2={8.95} pKaR={10.50} pI={9.73}
            type="basic"
          />
        </div>
        <p className="text-xs text-secondary italic">
          Dashed lines = pKa values. Dot = pI (net zero charge). Curves shown as step functions for clarity.
        </p>
      </section>
    </div>
  )
}

// ── Charge-vs-pH SVG panel ────────────────────────────────────────────────────

interface PanelProps {
  title: string
  color: string
  pKa1?: number
  pKa2?: number
  pKaR?: number
  pI: number
  type: 'neutral' | 'acidic' | 'basic'
}

function ChargeVsPHPanel({ title, color, pKa1, pKa2, pKaR, pI, type }: PanelProps) {
  const W = 200
  const H = 140
  const padL = 30
  const padR = 12
  const padT = 12
  const padB = 26
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const toX = (pH: number) => padL + (pH / 14) * plotW
  const toY = (charge: number) => {
    const minC = type === 'basic' ? -1 : type === 'acidic' ? -2 : -1
    const maxC = type === 'basic' ? 2 : type === 'acidic' ? 1 : 1
    const range = maxC - minC
    return padT + ((maxC - charge) / range) * plotH
  }

  // Build step-function path segments
  const segments: { x1: number; x2: number; charge: number }[] = []
  if (type === 'neutral') {
    // +1 → 0 → -1
    segments.push({ x1: 0, x2: pKa1!, charge: 1 })
    segments.push({ x1: pKa1!, x2: pKa2!, charge: 0 })
    segments.push({ x1: pKa2!, x2: 14, charge: -1 })
  } else if (type === 'acidic') {
    // +1 → 0 → -1 → -2
    segments.push({ x1: 0, x2: pKa1!, charge: 1 })
    segments.push({ x1: pKa1!, x2: pKaR!, charge: 0 })
    segments.push({ x1: pKaR!, x2: pKa2 ?? 9.67, charge: -1 })
    segments.push({ x1: pKa2 ?? 9.67, x2: 14, charge: -2 })
  } else {
    // +2 → +1 → 0 → -1
    segments.push({ x1: 0, x2: pKa1 ?? 2.18, charge: 2 })
    segments.push({ x1: pKa1 ?? 2.18, x2: pKa2!, charge: 1 })
    segments.push({ x1: pKa2!, x2: pKaR!, charge: 0 })
    segments.push({ x1: pKaR!, x2: 14, charge: -1 })
  }

  let svgPath = ''
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i]
    const x1 = toX(s.x1)
    const x2 = toX(s.x2)
    const y  = toY(s.charge)
    if (i === 0) {
      svgPath += `M ${x1.toFixed(1)} ${y.toFixed(1)}`
    } else {
      const prevY = toY(segments[i - 1].charge)
      svgPath += ` L ${toX(s.x1).toFixed(1)} ${prevY.toFixed(1)}`
      svgPath += ` L ${toX(s.x1).toFixed(1)} ${y.toFixed(1)}`
    }
    svgPath += ` L ${x2.toFixed(1)} ${y.toFixed(1)}`
  }

  const yZero = toY(0)
  const pIx = toX(pI)

  // Y-axis charge labels
  const chargeLabels = type === 'basic'
    ? [{ v: 2, lbl: '+2' }, { v: 1, lbl: '+1' }, { v: 0, lbl: '0' }, { v: -1, lbl: '−1' }]
    : type === 'acidic'
    ? [{ v: 1, lbl: '+1' }, { v: 0, lbl: '0' }, { v: -1, lbl: '−1' }, { v: -2, lbl: '−2' }]
    : [{ v: 1, lbl: '+1' }, { v: 0, lbl: '0' }, { v: -1, lbl: '−1' }]

  // pKa dashed lines
  const dashes = [
    pKa1 != null ? pKa1 : null,
    pKa2 != null ? pKa2 : null,
    pKaR != null ? pKaR : null,
  ].filter(Boolean) as number[]

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold text-primary">{title}</p>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
        <g fill="none" stroke="currentColor">
          {/* Axes */}
          <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} strokeWidth={1} />
          <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} strokeWidth={1} />

          {/* pH axis labels */}
          {[0, 2, 4, 6, 7, 8, 10, 12, 14].map(pH => (
            <text key={pH} x={toX(pH)} y={padT + plotH + 10} textAnchor="middle" fontSize={7}
              fill="currentColor" stroke="none" className="text-secondary">
              {pH}
            </text>
          ))}
          <text x={padL + plotW / 2} y={H - 2} textAnchor="middle" fontSize={7} fill="currentColor" stroke="none">pH</text>

          {/* Y-axis charge labels */}
          {chargeLabels.map(cl => (
            <text key={cl.v} x={padL - 3} y={toY(cl.v) + 3} textAnchor="end" fontSize={7}
              fill="currentColor" stroke="none">{cl.lbl}</text>
          ))}

          {/* Zero charge reference line */}
          <line x1={padL} y1={yZero} x2={padL + plotW} y2={yZero} strokeWidth={0.5}
            strokeDasharray="2 2" stroke="currentColor" opacity={0.3} />

          {/* pKa dashed lines */}
          {dashes.map(pka => (
            <line key={pka} x1={toX(pka)} y1={padT} x2={toX(pka)} y2={padT + plotH}
              strokeWidth={0.8} strokeDasharray="3 2" stroke={color} opacity={0.5} />
          ))}

          {/* Charge step curve */}
          <path d={svgPath} stroke={color} strokeWidth={2} fill="none" />

          {/* pI dot */}
          <circle cx={pIx} cy={yZero} r={4} fill={color} stroke="none" />
          <text x={pIx} y={yZero - 7} textAnchor="middle" fontSize={7} fill={color} stroke="none" fontWeight="600">
            pI {pI.toFixed(2)}
          </text>
        </g>
      </svg>
    </div>
  )
}
