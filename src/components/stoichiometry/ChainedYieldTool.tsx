import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NumberField from '../shared/NumberField'
import ChainedProblem from '../shared/ChainedProblem'
import { buildChainedYieldProblem, type YieldReaction, type ChainedYieldProblem } from '../../chem/chainedYield'

// ── Reaction library ──────────────────────────────────────────────────────────

const REACTIONS: (YieldReaction & { reactantFormula: string; productFormula: string })[] = [
  {
    name:            'TiO₂ from ilmenite (Chang 3.91)',
    equation:        'FeTiO₃ + H₂SO₄ → TiO₂ + FeSO₄ + H₂O',
    reactantFormula: 'FeTiO3',
    productFormula:  'TiO2',
    reactants: [
      { formula: 'FeTiO3', display: 'FeTiO₃', coeff: 1, molarMass: 151.71 },
      { formula: 'H2SO4',  display: 'H₂SO₄',  coeff: 1, molarMass:  98.08 },
    ],
    products: [
      { formula: 'TiO2',  display: 'TiO₂',  coeff: 1, molarMass:  79.87  },
      { formula: 'FeSO4', display: 'FeSO₄', coeff: 1, molarMass: 151.91  },
      { formula: 'H2O',   display: 'H₂O',   coeff: 1, molarMass:  18.015 },
    ],
  },
  {
    name:            'Ethylene from hexane (Chang 3.92)',
    equation:        'C₆H₁₄ → 2 C₂H₄ + C₂H₆',
    reactantFormula: 'C6H14',
    productFormula:  'C2H4',
    reactants: [
      { formula: 'C6H14', display: 'C₆H₁₄', coeff: 1, molarMass: 86.178 },
    ],
    products: [
      { formula: 'C2H4', display: 'C₂H₄', coeff: 2, molarMass: 28.054 },
      { formula: 'C2H6', display: 'C₂H₆', coeff: 1, molarMass: 30.070 },
    ],
  },
  {
    name:            'Lithium nitride synthesis (Chang 3.93)',
    equation:        '6 Li + N₂ → 2 Li₃N',
    reactantFormula: 'Li',
    productFormula:  'Li3N',
    reactants: [
      { formula: 'Li', display: 'Li', coeff: 6, molarMass:  6.941 },
      { formula: 'N2', display: 'N₂', coeff: 1, molarMass: 28.014 },
    ],
    products: [
      { formula: 'Li3N', display: 'Li₃N', coeff: 2, molarMass: 34.830 },
    ],
  },
  {
    name:            'Disulfur dichloride (Chang 3.94)',
    equation:        'S₈ + 4 Cl₂ → 4 S₂Cl₂',
    reactantFormula: 'S8',
    productFormula:  'S2Cl2',
    reactants: [
      { formula: 'S8',   display: 'S₈',   coeff: 1, molarMass: 256.52 },
      { formula: 'Cl2',  display: 'Cl₂',  coeff: 4, molarMass:  70.906 },
    ],
    products: [
      { formula: 'S2Cl2', display: 'S₂Cl₂', coeff: 4, molarMass: 135.04 },
    ],
  },
  {
    name:            'Maleic anhydride (Chang 3.95)',
    equation:        '2 C₆H₆ + 9 O₂ → 2 C₄H₂O₃ + 4 CO₂ + 4 H₂O',
    reactantFormula: 'C6H6',
    productFormula:  'C4H2O3',
    reactants: [
      { formula: 'C6H6', display: 'C₆H₆', coeff: 2, molarMass:  78.114 },
      { formula: 'O2',   display: 'O₂',   coeff: 9, molarMass:  31.998 },
    ],
    products: [
      { formula: 'C4H2O3', display: 'C₄H₂O₃', coeff: 2, molarMass:  98.057 },
      { formula: 'CO2',    display: 'CO₂',     coeff: 4, molarMass:  44.009 },
      { formula: 'H2O',    display: 'H₂O',     coeff: 4, molarMass:  18.015 },
    ],
  },
]

// ── Random problem generator ──────────────────────────────────────────────────

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Returns a realistic actual mass that gives a yield of 60–95%
function generateProblem(): { rxnIdx: number; massReactant: number; massActual: number; unit: 'g' | 'kg' } {
  const rxnIdx = Math.floor(Math.random() * REACTIONS.length)
  const rxn    = REACTIONS[rxnIdx]
  const reactant = rxn.reactants.find(s => s.formula === rxn.reactantFormula)!
  const product  = rxn.products.find(s  => s.formula === rxn.productFormula)!

  const unit: 'g' | 'kg' = rxn.name.includes('ilmenite') ? 'kg' : 'g'
  const scale = unit === 'kg' ? 1000 : 1

  const niceMasses = [50, 75, 100, 150, 200, 250, 500]
  const massReactant = pick(niceMasses) / scale

  const molesReactant = (massReactant * scale) / reactant.molarMass
  const molesProduct  = molesReactant * (product.coeff / reactant.coeff)
  const theoretical   = molesProduct * product.molarMass / scale

  const pctYield = 0.60 + Math.random() * 0.35   // 60–95%
  const massActual = parseFloat((theoretical * pctYield).toPrecision(3))

  return { rxnIdx, massReactant, massActual, unit }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  allowCustom?: boolean
}

export default function ChainedYieldTool({ allowCustom = true }: Props) {
  const [rxnIdx,    setRxnIdx]    = useState(0)
  const [massR,     setMassR]     = useState('')
  const [massA,     setMassA]     = useState('')
  const [unit,      setUnit]      = useState<'g' | 'kg'>('g')
  const [problem,   setProblem]   = useState<ChainedYieldProblem | null>(null)
  const [error,     setError]     = useState('')
  const [key,       setKey]       = useState(0)   // force remount of ChainedProblem on new problem

  function start() {
    setError('')
    if (allowCustom) {
      const mr = parseFloat(massR)
      const ma = parseFloat(massA)
      if (isNaN(mr) || isNaN(ma) || mr <= 0 || ma <= 0) {
        setError('Enter positive values for both masses.')
        return
      }
      if (ma > mr * 10) {
        setError('Actual yield seems too large relative to reactant mass — check your inputs.')
        return
      }
      const rxn = REACTIONS[rxnIdx]
      try {
        const p = buildChainedYieldProblem({
          reaction:          rxn,
          reactantFormula:   rxn.reactantFormula,
          productFormula:    rxn.productFormula,
          massReactant:      mr,
          massProductActual: ma,
          unit,
        })
        setProblem(p)
        setKey(k => k + 1)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error building problem.')
      }
    } else {
      const { rxnIdx: ri, massReactant, massActual, unit: u } = generateProblem()
      const rxn = REACTIONS[ri]
      const p = buildChainedYieldProblem({
        reaction:          rxn,
        reactantFormula:   rxn.reactantFormula,
        productFormula:    rxn.productFormula,
        massReactant,
        massProductActual: massActual,
        unit:              u,
      })
      setProblem(p)
      setKey(k => k + 1)
    }
  }

  function reset() {
    setProblem(null)
    setError('')
    if (!allowCustom) {
      setMassR(''); setMassA('')
    }
  }

  const rxn     = REACTIONS[rxnIdx]
  const canStart = allowCustom
    ? massR.trim() !== '' && massA.trim() !== ''
    : true

  return (
    <div className="flex flex-col gap-5 max-w-2xl">

      <p className="font-sans text-sm text-secondary leading-relaxed">
        Work through a mass-to-percent-yield problem one step at a time.
        Each sub-step is verified independently before unlocking the next.
      </p>

      {/* Inputs — only in practice mode or when no problem is active */}
      {(allowCustom && !problem) && (
        <div className="flex flex-col gap-4">

          {/* Reaction picker */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-sm font-medium text-primary">Reaction</label>
            <select
              value={rxnIdx}
              onChange={e => { setRxnIdx(Number(e.target.value)); setError('') }}
              className="bg-raised border border-border rounded-sm px-3 py-2 font-mono text-sm text-primary
                         focus:outline-none focus:border-muted transition-colors"
            >
              {REACTIONS.map((r, i) => (
                <option key={r.name} value={i}>{r.equation}</option>
              ))}
            </select>
            <p className="font-mono text-xs text-secondary">{rxn.name}</p>
          </div>

          {/* Mass inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NumberField
              label={`Mass of ${rxn.reactants.find(s => s.formula === rxn.reactantFormula)?.display ?? 'reactant'}`}
              value={massR}
              onChange={v => { setMassR(v); setError('') }}
              placeholder="e.g. 8000"
              unit={
                <div className="flex items-center gap-0.5">
                  {(['g', 'kg'] as const).map(u => (
                    <button key={u} onClick={() => setUnit(u)}
                      className="px-2 py-1 rounded-sm font-mono text-xs font-medium transition-colors"
                      style={unit === u ? {
                        background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
                        border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                        color: 'var(--c-halogen)',
                      } : {
                        background: 'rgb(var(--color-raised))',
                        border: '1px solid rgb(var(--color-border))',
                        color: 'rgba(var(--overlay),0.45)',
                      }}>
                      {u}
                    </button>
                  ))}
                </div>
              }
            />
            <NumberField
              label={`Actual yield of ${rxn.products.find(s => s.formula === rxn.productFormula)?.display ?? 'product'}`}
              value={massA}
              onChange={v => { setMassA(v); setError('') }}
              placeholder="e.g. 3670"
              unit={<span className="font-mono text-sm text-secondary px-2">{unit}</span>}
            />
          </div>
        </div>
      )}

      {error && <p className="font-mono text-xs" style={{ color: '#f87171' }}>{error}</p>}

      {/* Start / New problem button */}
      {!problem && (
        <div className="flex gap-2">
          <button
            onClick={start}
            disabled={!canStart}
            className="shrink-0 px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors
                       disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
              border:     '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
              color:      'var(--c-halogen)',
            }}>
            {allowCustom ? 'Start chain' : 'New problem'}
          </button>
        </div>
      )}

      {/* Problem + reset */}
      <AnimatePresence mode="wait">
        {problem && (
          <motion.div key={key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4">
            <ChainedProblem
              scenario={
                <span style={{ whiteSpace: 'pre-line' }}>{problem.scenario}</span>
              }
              steps={problem.steps}
            />
            <button
              onClick={reset}
              className="self-start px-4 py-1.5 rounded-sm font-sans text-sm border border-border
                         text-secondary hover:text-primary hover:border-muted transition-colors">
              {allowCustom ? '← Change inputs' : 'New problem'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="font-mono text-xs text-secondary">
        m(reactant) → mol → mol ratio → m(theoretical) → %Y = actual/theoretical × 100
      </p>
    </div>
  )
}
