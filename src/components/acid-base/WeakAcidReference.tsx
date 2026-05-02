import { weakAcidPh } from '../../chem/acidBase'
import ICETable from '../shared/ICETable'
import { solveICETable } from '../../chem/equilibrium'

export default function WeakAcidReference() {
  // Chang Ex 15.8: 0.10 M acetic acid, Ka = 1.8e-5
  const exampleResult = solveICETable({
    reactants: [{ formula: 'CH₃COOH', coefficient: 1, state: 'aq' }],
    products:  [{ formula: 'H⁺', coefficient: 1, state: 'aq' }, { formula: 'CH₃COO⁻', coefficient: 1, state: 'aq' }],
    initial:   { 'CH₃COOH': 0.10, 'H⁺': 0, 'CH₃COO⁻': 0 },
    K: 1.8e-5, kType: 'Kc',
  })
  const phResult = weakAcidPh(0.10, 1.8e-5)

  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      {/* Equilibrium setup */}
      <section>
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary mb-3">Weak Acid Equilibrium</h3>
        <div className="p-4 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
          <p className="font-mono text-sm text-primary mb-3">HA ⇌ H⁺ + A⁻</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-sm border border-border" style={{ background: 'rgb(var(--color-raised))' }}>
              <p className="font-mono text-sm font-semibold text-primary">Ka = [H⁺][A⁻] / [HA]</p>
              <p className="font-sans text-xs text-secondary mt-1">Acid dissociation constant</p>
            </div>
            <div className="p-3 rounded-sm border border-border" style={{ background: 'rgb(var(--color-raised))' }}>
              <p className="font-mono text-sm font-semibold text-primary">Ka ≈ x² / (C − x)</p>
              <p className="font-sans text-xs text-secondary mt-1">ICE table expression; x = [H⁺]</p>
            </div>
          </div>
        </div>
      </section>

      {/* ICE table explanation */}
      <section>
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary mb-3">ICE Table Method</h3>
        <div className="flex flex-col gap-3 p-4 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
          <div className="grid grid-cols-4 gap-2 font-mono text-xs text-center">
            <div className="text-secondary font-bold text-left"></div>
            <div className="text-secondary font-bold">HA</div>
            <div className="text-secondary font-bold">H⁺</div>
            <div className="text-secondary font-bold">A⁻</div>
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
          <p className="font-mono text-xs text-secondary">C = initial concentration; x = amount dissociated</p>
        </div>
      </section>

      {/* 5% rule */}
      <section>
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary mb-3">5% Approximation Rule</h3>
        <div className="p-4 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
          <p className="font-sans text-sm text-primary mb-2">
            If x/C &lt; 5%, the approximation C − x ≈ C is valid, simplifying Ka ≈ x²/C.
          </p>
          <p className="font-sans text-sm text-primary mb-2">
            Solve: x ≈ √(Ka × C)
          </p>
          <p className="font-sans text-sm text-secondary">
            If the 5% rule fails, solve the full quadratic: x² + Ka·x − Ka·C = 0, or use the ICE table solver.
          </p>
        </div>
      </section>

      {/* Percent dissociation */}
      <section>
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary mb-3">Percent Dissociation</h3>
        <div className="p-3 rounded-sm border border-border" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="font-mono text-sm font-semibold text-primary">% dissociation = ([H⁺] / C) × 100%</p>
          <p className="font-sans text-xs text-secondary mt-1">
            Increases as concentration decreases (dilution effect). A stronger acid dissociates more.
          </p>
        </div>
      </section>

      {/* Worked example */}
      <section>
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary mb-3">
          Worked Example (Chang Ex. 15.8)
        </h3>
        <div className="p-4 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
          <p className="font-sans text-sm text-primary mb-3">
            Find the pH of 0.10 M acetic acid (Ka = 1.8 × 10⁻⁵).
          </p>
          <ICETable rows={exampleResult.rows} />
          <div className="mt-3 flex flex-col gap-1">
            <p className="font-mono text-xs text-secondary">Ka = x² / (0.10 − x) ≈ x² / 0.10 = 1.8 × 10⁻⁵</p>
            <p className="font-mono text-xs text-secondary">x = √(1.8 × 10⁻⁵ × 0.10) = 1.34 × 10⁻³ M = [H⁺]</p>
            <p className="font-mono text-xs text-secondary">% dissociation = 1.34% (5% rule valid)</p>
            <p className="font-mono text-sm font-semibold text-primary mt-2">
              pH = −log(1.34 × 10⁻³) = {phResult.pH.toFixed(2)}
            </p>
          </div>
        </div>
      </section>

    </div>
  )
}
