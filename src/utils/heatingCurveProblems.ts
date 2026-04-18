// ── Types ─────────────────────────────────────────────────────────────────────

export interface SubData {
  name: string; formula: string
  M: number; mp: number; bp: number
  cs: number; cl: number; cg: number
  dHfus: number; dHvap: number
}

export type Phase = 'solid' | 'melting' | 'liquid' | 'vaporization' | 'gas'
export type QKind = Phase | 'no_temp_change'

export interface Seg {
  phase: Phase
  tStart: number; tEnd: number
  q: number   // J
}

export interface HCProblem {
  sub:         SubData
  mass:        number
  t0:          number
  t1:          number
  segments:    Seg[]
  pts:         Array<{ x: number; t: number }>
  maxQ:        number
  validIdxs:   number[]
  kind:        QKind
  question:    string
  explanation: string
}

// ── Data ─────────────────────────────────────────────────────────────────────

export const HC_SUBSTANCES: SubData[] = [
  { name: 'Water',   formula: 'H₂O',    M: 18.015, mp: 0,      bp: 100,  cs: 2.090, cl: 4.184, cg: 2.010, dHfus: 6.02,  dHvap: 40.7  },
  { name: 'Ethanol', formula: 'C₂H₅OH', M: 46.07,  mp: -114.1, bp: 78.4, cs: 2.42,  cl: 2.44,  cg: 1.42,  dHfus: 4.93,  dHvap: 38.6  },
  { name: 'Ammonia', formula: 'NH₃',    M: 17.03,  mp: -77.7,  bp: -33.4,cs: 1.995, cl: 4.700, cg: 2.175, dHfus: 5.65,  dHvap: 23.35 },
  { name: 'Benzene', formula: 'C₆H₆',   M: 78.11,  mp: 5.5,    bp: 80.1, cs: 1.74,  cl: 1.74,  cg: 1.06,  dHfus: 9.87,  dHvap: 30.7  },
]

export const HC_QUESTION_KINDS: QKind[] = [
  'solid', 'melting', 'liquid', 'vaporization', 'gas', 'no_temp_change',
]

// ── Logic ─────────────────────────────────────────────────────────────────────

export function computeSegments(sub: SubData, mass: number, t0: number, t1: number): Seg[] {
  const n = mass / sub.M
  return [
    { phase: 'solid',        tStart: t0,     tEnd: sub.mp, q: mass * sub.cs * (sub.mp - t0)    },
    { phase: 'melting',      tStart: sub.mp, tEnd: sub.mp, q: n * sub.dHfus * 1000              },
    { phase: 'liquid',       tStart: sub.mp, tEnd: sub.bp, q: mass * sub.cl * (sub.bp - sub.mp) },
    { phase: 'vaporization', tStart: sub.bp, tEnd: sub.bp, q: n * sub.dHvap * 1000              },
    { phase: 'gas',          tStart: sub.bp, tEnd: t1,     q: mass * sub.cg * (t1 - sub.bp)     },
  ]
}

export function genHCProblem(): HCProblem {
  const sub  = HC_SUBSTANCES[Math.floor(Math.random() * HC_SUBSTANCES.length)]
  const mass = (5 + Math.floor(Math.random() * 16)) * 10

  const span = sub.bp - sub.mp
  const pad  = Math.max(span * 0.3, 20)
  const t0   = Math.round(sub.mp - pad)
  const t1   = Math.round(sub.bp + pad)

  const segments = computeSegments(sub, mass, t0, t1)

  const pts: Array<{ x: number; t: number }> = [{ x: 0, t: t0 }]
  let cumQ = 0
  for (const seg of segments) { cumQ += seg.q; pts.push({ x: cumQ, t: seg.tEnd }) }
  const maxQ = cumQ

  const idx      = (p: Phase) => segments.findIndex(s => s.phase === p)
  const solidIdx = idx('solid'), meltIdx  = idx('melting'), liqIdx = idx('liquid')
  const vapIdx   = idx('vaporization'),   gasIdx  = idx('gas')

  const kind = HC_QUESTION_KINDS[Math.floor(Math.random() * HC_QUESTION_KINDS.length)]

  let validIdxs: number[]
  let question:    string
  let explanation: string

  switch (kind) {
    case 'solid':
      validIdxs   = [solidIdx]
      question    = 'Indicate the **solid** region.'
      explanation = `The first segment (blue) shows ${sub.name} heating from ${t0}°C up to its melting point (${sub.mp}°C). Temperature rises steadily: q = mc_s∆T, with c_s = ${sub.cs} J/(g·°C).`
      break
    case 'melting':
      validIdxs   = [meltIdx]
      question    = 'Indicate the **melting** plateau.'
      explanation = `At ${sub.mp}°C, ${sub.name} melts (solid → liquid). The flat plateau means temperature is constant — all energy breaks intermolecular forces, not raising temperature. q = n∆H_fus = ${sub.dHfus} kJ/mol.`
      break
    case 'liquid':
      validIdxs   = [liqIdx]
      question    = 'Indicate the **liquid** region.'
      explanation = `Between ${sub.mp}°C and ${sub.bp}°C, ${sub.name} is a liquid. The slope here reflects c_l = ${sub.cl} J/(g·°C). A shallower slope means more heat required per °C.`
      break
    case 'vaporization':
      validIdxs   = [vapIdx]
      question    = 'Indicate the **vaporization** plateau.'
      explanation = `At ${sub.bp}°C, ${sub.name} vaporizes (liquid → gas). q = n∆H_vap = ${sub.dHvap} kJ/mol. This plateau is much longer than melting because ∆H_vap >> ∆H_fus.`
      break
    case 'gas':
      validIdxs   = [gasIdx]
      question    = 'Indicate the **gas** region.'
      explanation = `Above ${sub.bp}°C, ${sub.name} exists as a gas. Temperature rises again: q = mc_g∆T with c_g = ${sub.cg} J/(g·°C). This is the last segment of the curve.`
      break
    case 'no_temp_change':
    default:
      validIdxs   = [meltIdx, vapIdx]
      question    = 'Indicate a region where **temperature does not change** as heat is added.'
      explanation = `Both plateaus are correct — melting (${sub.mp}°C) and vaporization (${sub.bp}°C). During phase transitions, added energy breaks intermolecular forces rather than raising temperature, so the curve is flat.`
      break
  }

  return { sub, mass, t0, t1, segments, pts, maxQ, validIdxs, kind, question, explanation }
}
