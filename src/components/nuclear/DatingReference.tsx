export default function DatingReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      {/* Formulas */}
      <div className="flex flex-col gap-3">
        <h3 className="font-sans font-semibold text-bright text-lg">Radiometric Dating</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Age from activity', formula: 't = (t½ / ln 2) × ln(A₀ / A)', note: 'A = current activity, A₀ = original activity' },
            { label: 'Decay constant', formula: 'k = ln 2 / t½', note: 'k ≈ 1.21 × 10⁻⁴ yr⁻¹ for ¹⁴C' },
            { label: 'Activity ratio', formula: 'A / A₀ = e^(−kt) = (1/2)^(t/t½)', note: 'Fraction of original ¹⁴C remaining' },
            { label: '¹⁴C half-life', formula: 't½ = 5730 yr', note: 'Standard value used in all dating calculations' },
          ].map(item => (
            <div key={item.label} className="flex flex-col gap-1 p-4 rounded-sm border border-border bg-surface">
              <span className="font-mono text-xs text-secondary uppercase tracking-wider">{item.label}</span>
              <span className="font-mono text-sm" style={{ color: 'var(--c-halogen)' }}>{item.formula}</span>
              <span className="font-sans text-xs text-dim">{item.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Concept explanation */}
      <div className="flex flex-col gap-2 p-4 rounded-sm border border-border bg-surface">
        <h4 className="font-sans text-sm font-semibold text-primary">How Carbon-14 Dating Works</h4>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Carbon-14 is produced continuously in the upper atmosphere when cosmic-ray neutrons strike nitrogen-14:
          <span className="font-mono text-primary ml-1">¹⁴N + n → ¹⁴C + p</span>. Living organisms
          continuously exchange carbon with the atmosphere, so they maintain the same ¹⁴C/¹²C ratio as the air
          (~1.2 × 10⁻¹²). When the organism dies, exchange stops and ¹⁴C decays (β⁻ emission, t½ = 5730 yr).
          Measuring the remaining ¹⁴C activity gives the time since death.
        </p>
      </div>

      {/* Assumptions */}
      <div className="flex flex-col gap-3">
        <h3 className="font-sans font-semibold text-bright text-lg">Key Assumptions</h3>
        <ul className="flex flex-col gap-2">
          {[
            { title: 'Constant atmospheric ratio', body: 'The ¹⁴C/¹²C ratio in the atmosphere has been approximately constant over the period of interest. In practice, calibration curves correct for small variations.' },
            { title: 'No contamination', body: 'The sample has not been contaminated by older or younger carbon. Contamination with modern carbon makes a sample appear younger; contamination with dead carbon makes it appear older.' },
            { title: 'First-order decay', body: 'Radioactive decay is strictly first order — the rate is independent of temperature, pressure, or chemical environment. This makes the math clean: ln(A₀/A) = kt.' },
            { title: 'Known original activity', body: 'We assume living organisms have the same ¹⁴C activity as today (~226 dpm per gram of carbon, or 0.226 Bq/g). For problems, A₀ is given.' },
          ].map(item => (
            <div key={item.title} className="flex flex-col gap-1 p-3 rounded-sm border border-border bg-surface">
              <span className="font-sans text-sm font-semibold text-primary">{item.title}</span>
              <p className="font-sans text-sm text-secondary leading-relaxed">{item.body}</p>
            </div>
          ))}
        </ul>
      </div>

      {/* Worked example */}
      <div className="flex flex-col gap-3">
        <h3 className="font-sans font-semibold text-bright text-lg">Worked Example</h3>
        <div className="flex flex-col gap-0 rounded-sm border border-border overflow-hidden">
          <div className="px-4 py-3" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-sans text-sm text-primary">
              <strong>Problem:</strong> A wood artifact has a ¹⁴C activity of 152 dpm. A fresh wood sample
              of the same mass gives 226 dpm. Estimate the age. (t½ = 5730 yr)
            </p>
          </div>
          {[
            { step: '1. Identify', detail: 'A = 152 dpm, A₀ = 226 dpm, t½ = 5730 yr' },
            { step: '2. Calculate k', detail: 'k = ln 2 / 5730 = 0.6931 / 5730 = 1.209 × 10⁻⁴ yr⁻¹' },
            { step: '3. Apply formula', detail: 't = (t½ / ln 2) × ln(A₀ / A) = (5730 / 0.6931) × ln(226 / 152)' },
            { step: '4. Evaluate', detail: 't = 8267 × ln(1.487) = 8267 × 0.4040' },
            { step: '5. Result', detail: 't ≈ 3340 yr' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 px-4 py-3 border-t border-border"
              style={{ background: i % 2 === 0 ? 'rgb(var(--color-surface))' : 'rgb(var(--color-base))' }}>
              <span className="font-mono text-xs text-secondary w-24 shrink-0 pt-0.5">{item.step}</span>
              <span className="font-mono text-sm text-primary">{item.detail}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dating range */}
      <div className="flex flex-col gap-2 p-4 rounded-sm border border-border bg-surface">
        <h4 className="font-sans text-sm font-semibold text-primary">Practical Dating Range</h4>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Carbon-14 dating is reliable for organic material up to about <strong>50,000 years old</strong>
          (roughly 8–9 half-lives). Beyond that, the remaining ¹⁴C is too small to measure accurately.
          For older materials, other isotope pairs are used: potassium-40/argon-40 (t½ = 1.25 × 10⁹ yr),
          uranium-238/lead-206 (t½ = 4.5 × 10⁹ yr), or rubidium-87/strontium-87 (t½ = 4.7 × 10¹⁰ yr).
        </p>
      </div>

      <p className="font-mono text-xs text-secondary">
        Formula and half-life from Chang's Chemistry, 14e, Section 19.5.
      </p>
    </div>
  )
}
