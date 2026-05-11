export default function CurvedArrowReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <div>
        <h3 className="font-sans font-semibold text-base text-primary mb-1">Curved Arrow Notation</h3>
        <p className="font-sans text-xs text-secondary leading-relaxed">
          Curved arrows track electron movement in mechanisms. The <strong className="text-primary">tail</strong> starts at the electron source;
          the <strong className="text-primary">head</strong> points to where the electrons go.
        </p>
      </div>

      {/* Arrow types */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Two Types of Curved Arrows</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-sm border border-border p-4 flex flex-col gap-2" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-sans text-sm font-semibold text-primary">Full-headed arrow (⟶)</p>
            <p className="font-sans text-xs text-secondary leading-relaxed">
              Represents movement of <strong className="text-primary">2 electrons</strong> (a lone pair or a bonding pair).
              Used in ionic/polar mechanisms (SN1, SN2, E2, addition, elimination, etc.).
            </p>
            <div className="font-mono text-xs text-dim p-2 rounded bg-surface">
              Nu:⟶ C + LG  →  Nu–C + :LG
            </div>
          </div>
          <div className="rounded-sm border border-border p-4 flex flex-col gap-2" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-sans text-sm font-semibold text-primary">Half-headed arrow (fishhook, ⇀)</p>
            <p className="font-sans text-xs text-secondary leading-relaxed">
              Represents movement of <strong className="text-primary">1 electron</strong>.
              Used only in radical mechanisms (homolytic cleavage, radical chain reactions).
            </p>
            <div className="font-mono text-xs text-dim p-2 rounded bg-surface">
              Cl–Cl  →  Cl• + •Cl  (two fishhooks)
            </div>
          </div>
        </div>
      </section>

      {/* Electron sources */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Where Can the Tail Start?</h4>
        <div className="overflow-x-auto rounded-sm border border-border">
          <table className="text-xs font-sans border-collapse w-full">
            <thead>
              <tr className="border-b border-border bg-raised">
                <th className="px-3 py-2 text-left font-semibold text-secondary">Electron Source</th>
                <th className="px-3 py-2 text-left font-semibold text-secondary">Symbol</th>
                <th className="px-3 py-2 text-left font-semibold text-secondary">Example</th>
              </tr>
            </thead>
            <tbody>
              {[
                { src: 'Lone pair on atom',    sym: ':X  →',  ex: 'H₂O: attacks H⁺; :OH⁻ attacks electrophile' },
                { src: 'σ Bond (C–X or C–H)', sym: 'C—X →', ex: 'C–H bond in E2; C–Br in SN2 (the bond to the leaving group)' },
                { src: 'π Bond (C=C or C=O)', sym: 'C=C →', ex: 'Alkene π electrons attack electrophile in electrophilic addition' },
                { src: 'Carbanion / anion',    sym: 'C⁻  →', ex: 'Enolate carbon attacks aldehyde in aldol reaction' },
              ].map(r => (
                <tr key={r.src} className="border-b border-border/50">
                  <td className="px-3 py-2 text-primary font-medium">{r.src}</td>
                  <td className="px-3 py-2 font-mono text-secondary">{r.sym}</td>
                  <td className="px-3 py-2 text-dim">{r.ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Common patterns */}
      <section className="flex flex-col gap-4">
        <h4 className="font-sans font-semibold text-sm text-primary">Common Mechanism Patterns</h4>

        {[
          {
            name: 'Bond Breaking (Heterolytic)',
            rule: 'Arrow from bond to atom receiving both electrons.',
            example: 'C–Br bond breaks: arrow from C–Br to Br. Br gets both electrons → Br⁻, C becomes carbocation C⁺.',
            pattern: 'C—Br  →⟶  C⁺  +  :Br⁻',
          },
          {
            name: 'Bond Forming from Lone Pair',
            rule: 'Arrow from lone pair on nucleophile to the electrophilic atom.',
            example: 'Hydroxide attacks carbonyl C: arrow from :OH⁻ lone pair to C=O carbon.',
            pattern: ':OH⁻  ⟶  C=O  →  HO–C–O⁻',
          },
          {
            name: 'Proton Transfer',
            rule: 'Two arrows: (1) base lone pair → H; (2) H–X bond → X.',
            example: 'Base removes proton from OH: arrow 1 from :B to H; arrow 2 from H–O bond to O.',
            pattern: ':B ⟶ H–O  →  B–H  +  :O⁻',
          },
          {
            name: 'Resonance (Electron Redistribution)',
            rule: 'Arrows show movement of electrons between resonance forms — atoms do NOT move.',
            example: 'Carboxylate: arrow from C=O π bond to O; second arrow from O⁻ lone pair to C.',
            pattern: 'RCOO⁻  ⇌  ⁻OOCR  (both valid forms)',
          },
          {
            name: 'Electrophilic Addition to Alkene',
            rule: 'Arrow from π bond to H⁺ (electrophile); second arrow from C–H bond to C (forms carbocation).',
            example: 'HBr adds to alkene: arrow 1 from C=C to H; arrow 2 from H–Br to Br.',
            pattern: 'C=C + H–Br  →  C⁺–C–H  +  :Br⁻',
          },
        ].map(p => (
          <div key={p.name} className="rounded-sm border border-border p-4 flex flex-col gap-2" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-sans text-sm font-semibold text-primary">{p.name}</p>
            <p className="font-sans text-xs text-secondary leading-relaxed"><strong>Rule:</strong> {p.rule}</p>
            <p className="font-sans text-xs text-secondary leading-relaxed"><strong>Example:</strong> {p.example}</p>
            <div className="font-mono text-xs p-2 rounded" style={{ background: 'rgb(var(--color-surface))' }}>{p.pattern}</div>
          </div>
        ))}
      </section>

      {/* Rules */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Fundamental Rules</h4>
        <div className="flex flex-col gap-2">
          {[
            'Arrows move electrons, NEVER atoms.',
            'Atoms do not change position within a single step — only electron density moves.',
            'Each arrow represents exactly 2 electrons (or 1 for fishhook).',
            'After moving electrons, check that no atom exceeds its valence (octet rule).',
            'The number of arrows drawn = the number of bonds broken or formed in that step.',
            'In resonance, electrons move but formal charges change — atoms stay fixed.',
          ].map((rule, i) => (
            <div key={i} className="flex items-start gap-2 font-sans text-xs text-secondary">
              <span className="shrink-0 font-mono text-dim mt-0.5">{i + 1}.</span>
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
