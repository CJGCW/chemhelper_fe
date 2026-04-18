// ── Types ─────────────────────────────────────────────────────────────────────

export interface PhaseData {
  name: string; formula: string
  tp: { T: number; P: number }
  cp: { T: number; P: number }
  sublimation:   [number, number][]
  vaporization:  [number, number][]
  fusion:        [number, number][]
  Tmin: number; Tmax: number
  logPmin: number; logPmax: number
  labelSolid:    [number, number]
  labelLiquid:   [number, number]
  labelGas:      [number, number]
  labelSupercrit:[number, number]
}

export type TargetKind = 'solid' | 'liquid' | 'gas' | 'triple_point' | 'critical_point'

export interface PDProblem {
  data:        PhaseData
  target:      TargetKind
  question:    string
  explanation: string
}

// ── Data ─────────────────────────────────────────────────────────────────────

export const PD_TARGET_KINDS: TargetKind[] = [
  'solid', 'liquid', 'gas', 'triple_point', 'critical_point',
]

export const PD_SUBSTANCES: PhaseData[] = [
  {
    name: 'Water', formula: 'H₂O',
    tp: { T: 0.01, P: 611.657 }, cp: { T: 374.14, P: 22.089e6 },
    sublimation:  [[-70,0.26],[-60,1.08],[-50,3.94],[-40,12.84],[-30,37.99],[-20,103.3],[-10,259.9],[0.01,611.7]],
    vaporization: [[0.01,611.7],[10,1228],[20,2338],[40,7384],[60,19940],[80,47390],[100,101325],[120,198600],[150,476100],[200,1554700],[250,3977600],[300,8588000],[350,16529000],[374.14,22089000]],
    fusion:       [[0.01,611.7],[-0.0074,101325],[-0.073,1e6],[-0.73,1e7],[-7.3,1e8]],
    Tmin: -80, Tmax: 430, logPmin: -1, logPmax: 8,
    labelSolid: [-40, 4.0], labelLiquid: [180, 6.5], labelGas: [200, 1.5], labelSupercrit: [395, 7.5],
  },
  {
    name: 'Carbon Dioxide', formula: 'CO₂',
    tp: { T: -56.6, P: 518000 }, cp: { T: 31.1, P: 7374000 },
    sublimation:  [[-100,13000],[-95,22600],[-90,37800],[-85,61400],[-80,96700],[-75,148000],[-70,220000],[-56.6,518000]],
    vaporization: [[-56.6,518000],[-50,682000],[-40,1013000],[-30,1488000],[-20,2130000],[-10,2949000],[0,3486000],[10,4502000],[20,5720000],[31.1,7374000]],
    fusion:       [[-56.6,518000],[-56.5,1e6],[-56.2,3e6],[-55.5,8e6],[-54.5,2e7],[-52,5e7],[-49,1e8]],
    Tmin: -110, Tmax: 80, logPmin: 4, logPmax: 8,
    labelSolid: [-85, 7.0], labelLiquid: [-20, 7.0], labelGas: [-20, 4.5], labelSupercrit: [55, 7.5],
  },
]

// ── Logic ─────────────────────────────────────────────────────────────────────

export function pdInterp(pts: [number, number][], x: number): number | null {
  if (pts.length < 2) return null
  const asc = pts[pts.length - 1][0] > pts[0][0]
  if (asc ? x < pts[0][0] || x > pts[pts.length - 1][0]
           : x > pts[0][0] || x < pts[pts.length - 1][0]) return null
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]
    const inRange = asc ? x0 <= x && x <= x1 : x1 <= x && x <= x0
    if (inRange) return y0 + (x - x0) / (x1 - x0) * (y1 - y0)
  }
  return null
}

export function identifyPhase(data: PhaseData, T: number, P: number): string {
  if (T >= data.cp.T && P >= data.cp.P) return 'Supercritical'
  const fusionByP = [...data.fusion]
    .map(([t, p]) => [p, t] as [number, number])
    .sort((a, b) => a[0] - b[0])
  const T_fus = pdInterp(fusionByP, P)
  if (T <= data.tp.T) {
    const P_sub = pdInterp(data.sublimation, T)
    if (P_sub !== null && P >= P_sub) return 'Solid'
    return 'Gas'
  }
  if (T_fus !== null && T <= T_fus) return 'Solid'
  if (T <= data.cp.T) {
    const P_vap = pdInterp(data.vaporization, T)
    if (P_vap !== null && P >= P_vap) return 'Liquid'
  }
  return 'Gas'
}

export function genPDProblem(excludeTarget?: TargetKind): PDProblem {
  const data   = PD_SUBSTANCES[Math.floor(Math.random() * PD_SUBSTANCES.length)]
  const pool   = excludeTarget ? PD_TARGET_KINDS.filter(t => t !== excludeTarget) : PD_TARGET_KINDS
  const target = pool[Math.floor(Math.random() * pool.length)]

  const fmtP = (P: number) =>
    P >= 1e6 ? `${(P / 1e6).toPrecision(3)} MPa` :
    P >= 1e3 ? `${(P / 1e3).toPrecision(3)} kPa` : `${P.toPrecision(3)} Pa`

  const Q: Record<TargetKind, { question: string; explanation: string }> = {
    solid: {
      question:    'Indicate the **solid** region.',
      explanation: `The solid region is the upper-left area — high pressure and/or low temperature. ${data.name} exists as a solid below the fusion curve and below the sublimation curve.`,
    },
    liquid: {
      question:    'Indicate the **liquid** region.',
      explanation: `The liquid region sits between the fusion curve (solid boundary) and the vaporization curve (gas boundary), above the triple point pressure. ${data.name} is a liquid in that middle zone.`,
    },
    gas: {
      question:    'Indicate the **gas** region.',
      explanation: `The gas region is the lower-right area — low pressure and/or high temperature. ${data.name} exists as a gas below the vaporization and sublimation curves.`,
    },
    triple_point: {
      question:    'Indicate the **triple point**.',
      explanation: `The triple point of ${data.name} is ${data.tp.T.toFixed(2)}°C and ${fmtP(data.tp.P)}. It is the unique temperature and pressure where solid, liquid, and gas coexist in equilibrium.`,
    },
    critical_point: {
      question:    'Indicate the **critical point**.',
      explanation: `The critical point of ${data.name} is ${data.cp.T.toFixed(1)}°C and ${(data.cp.P / 1e6).toPrecision(3)} MPa. Above this point the liquid and gas phases are indistinguishable — the substance becomes a supercritical fluid.`,
    },
  }

  return { data, target, ...Q[target] }
}
