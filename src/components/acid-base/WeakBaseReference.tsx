import { weakBasePh } from '../../chem/acidBase'
import ICETable from '../shared/ICETable'
import { solveICETable } from '../../chem/equilibrium'

export default function WeakBaseReference() {
  // Example: 0.10 M NH₃, Kb = 1.8e-5
  const exampleResult = solveICETable({
    reactants: [{ formula: 'NH₃', coefficient: 1, state: 'aq' }],
    products:  [{ formula: 'NH₄⁺', coefficient: 1, state: 'aq' }, { formula: 'OH⁻', coefficient: 1, state: 'aq' }],
    initial:   { 'NH₃': 0.10, 'NH₄⁺': 0, 'OH⁻': 0 },
    K: 1.8e-5, kType: 'Kc',
  })
  const phResult = weakBasePh(0.10, 1.8e-5)

  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      {/* Equilibrium setup */}
      <section>
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary mb-3">Weak Base Equilibrium</h3>
        <div className="p-4 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
          <p className="font-mono text-sm text-primary mb-3">B + H₂O ⇌ BH⁺ + OH⁻</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-sm border border-border" style={{ background: 'rgb(var(--color-raised))' }}>
              <p className="font-mono text-sm font-semibold text-primary">Kb = [BH⁺][OH⁻] / [B]</p>
              <p className="font-sans text-xs text-secondary mt-1">Base ionization constant</p>
            </div>
            <div className="p-3 rounded-sm border border-border" style={{ background: 'rgb(var(--color-raised))' }}>
              <p className="font-mono text-sm font-semibold text-primary">Kb ≈ x² / (C − x)</p>
              <p className="font-sans text-xs text-secondary mt-1">ICE table expression; x = [OH⁻]</p>
            </div>
          </div>
        </div>
      </section>

      {/* ICE table */}
      <section>
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary mb-3">ICE Table Method</h3>
        <div className="flex flex-col gap-3 p-4 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
          <div className="grid grid-cols-4 gap-2 font-mono text-xs text-center">
            <div className="text-secondary font-bold text-left"></div>
            <div className="text-secondary font-bold">B</div>
            <div className="text-secondary font-bold">BH⁺</div>
            <div className="text-secondary font-bold">OH⁻</div>
            <div className="text-secondary font-bold text-left">I</div>
            <div className="text-primary">C</div>
            <div className="text-primary">0</div>
            <div className="text-primary">0</div>
            <div className="text-secondary font-bold text-left">C</div>
            <div className="text-red-400">−x</div>
            <div className="text-green-400">+x</div>
            <div className="text-green-400">+x</div>
            <div className="text-secondary font-bold text-left">E</div>
            <div className="text-primary">C−x</div>
            <div className="text-primary">x</div>
            <div className="text-primary">x</div>
          </div>
          <p className="font-mono text-xs text-secondary">C = initial concentration; x = [OH⁻] formed</p>
        </div>
      </section>

      {/* pH from pOH */}
      <section>
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary mb-3">Getting pH from pOH</h3>
        <div className="flex flex-col gap-2 p-4 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
          <p className="font-mono text-sm text-primary">pOH = −log[OH⁻]</p>
          <p className="font-mono text-sm text-primary">pH = 14 − pOH</p>
          <p className="font-sans text-xs text-secondary mt-1">
            Weak bases produce basic solutions (pH &gt; 7). Always find [OH⁻] first, then convert to pH.
          </p>
        </div>
      </section>

      {/* Worked example */}
      <section>
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary mb-3">
          Worked Example: 0.10 M NH₃ (Kb = 1.8 × 10⁻⁵)
        </h3>
        <div className="p-4 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
          <ICETable rows={exampleResult.rows} />
          <div className="mt-3 flex flex-col gap-1">
            <p className="font-mono text-xs text-secondary">Kb = x² / (0.10 − x) ≈ x² / 0.10 = 1.8 × 10⁻⁵</p>
            <p className="font-mono text-xs text-secondary">x = [OH⁻] = 1.34 × 10⁻³ M</p>
            <p className="font-mono text-xs text-secondary">pOH = −log(1.34 × 10⁻³) = 2.87</p>
            <p className="font-mono text-sm font-semibold text-primary mt-2">
              pH = 14 − 2.87 = {phResult.pH.toFixed(2)}
            </p>
          </div>
        </div>
      </section>

    </div>
  )
}
