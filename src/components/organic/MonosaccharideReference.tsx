import CompoundDisplay from '../shared/CompoundDisplay'

export default function MonosaccharideReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <div>
        <h3 className="font-sans font-semibold text-base text-primary mb-1">Monosaccharide Reference</h3>
        <p className="font-sans text-xs text-secondary leading-relaxed">
          Monosaccharides are the simplest carbohydrates. Brown Ch. 25.
        </p>
      </div>

      {/* Classification */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Classification</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-sm border border-border p-4 flex flex-col gap-2" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-sans text-sm font-semibold text-primary">By Functional Group</p>
            <div className="flex flex-col gap-1 text-xs font-sans">
              <div className="flex gap-2">
                <span className="font-semibold text-primary w-16 shrink-0">Aldose</span>
                <span className="text-secondary">Has CHO (aldehyde) at C1. Most common. Example: glucose, galactose.</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-primary w-16 shrink-0">Ketose</span>
                <span className="text-secondary">Has C=O (ketone) at C2. Example: fructose (2-ketohexose).</span>
              </div>
            </div>
          </div>
          <div className="rounded-sm border border-border p-4 flex flex-col gap-2" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-sans text-sm font-semibold text-primary">By Chain Length</p>
            <div className="flex flex-col gap-1 text-xs font-sans">
              {[
                { n: '3C', name: 'Triose', ex: 'glyceraldehyde, dihydroxyacetone' },
                { n: '4C', name: 'Tetrose', ex: 'erythrose, threose' },
                { n: '5C', name: 'Pentose', ex: 'ribose (RNA), deoxyribose (DNA)' },
                { n: '6C', name: 'Hexose', ex: 'glucose, galactose, fructose' },
              ].map(r => (
                <div key={r.n} className="flex gap-2">
                  <span className="font-mono text-primary w-6 shrink-0">{r.n}</span>
                  <span className="font-semibold text-primary w-16 shrink-0">{r.name}</span>
                  <span className="text-secondary">{r.ex}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* D vs L */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">D vs. L Configuration</h4>
        <div className="rounded-sm border border-border p-4 flex flex-col gap-2" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="font-sans text-xs text-secondary leading-relaxed">
            In a Fischer projection, look at the <strong className="text-primary">highest-numbered chiral center</strong> (the one farthest from the carbonyl):
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs font-sans mt-1">
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-primary">D-sugar</span>
              <span className="text-secondary">–OH on the RIGHT at the highest-numbered chiral center.</span>
              <span className="text-dim">Most natural sugars are D-configuration.</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-primary">L-sugar</span>
              <span className="text-secondary">–OH on the LEFT at the highest-numbered chiral center.</span>
              <span className="text-dim">L-sugars exist but are rare in nature (some amino acid metabolism).</span>
            </div>
          </div>
          <p className="font-sans text-xs text-dim mt-1">D/L designation is NOT the same as R/S priority (CIP). D and L refer to the Fischer projection convention for carbohydrates.</p>
        </div>
      </section>

      {/* Key sugars */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Key Sugars to Know</h4>
        <div className="overflow-x-auto rounded-sm border border-border">
          <table className="text-xs font-sans border-collapse w-full">
            <thead>
              <tr className="border-b border-border bg-raised">
                <th className="px-3 py-2 text-left font-semibold text-secondary">Sugar</th>
                <th className="px-3 py-2 text-left font-semibold text-secondary">Type</th>
                <th className="px-3 py-2 text-left font-semibold text-secondary">Formula</th>
                <th className="px-3 py-2 text-left font-semibold text-secondary">C2–C5 OH orientation (Fischer)</th>
                <th className="px-3 py-2 text-left font-semibold text-secondary">Biological role</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'D-Glyceraldehyde', type: 'Aldotriose', formula: 'C₃H₆O₃', orientation: 'C2: R', role: 'Reference compound for D/L; simplest chiral aldose' },
                { name: 'D-Ribose', type: 'Aldopentose', formula: 'C₅H₁₀O₅', orientation: 'C2–C4: all R (in RNA)', role: 'Backbone of RNA, NAD⁺, ATP' },
                { name: 'D-Deoxyribose', type: 'Aldopentose (deoxy)', formula: 'C₅H₁₀O₄', orientation: 'Missing OH at C2', role: 'Backbone of DNA' },
                { name: 'D-Glucose', type: 'Aldohexose', formula: 'C₆H₁₂O₆', orientation: 'C2 R, C3 S, C4 R, C5 R', role: 'Blood sugar; primary energy source; starch/cellulose monomer' },
                { name: 'D-Galactose', type: 'Aldohexose', formula: 'C₆H₁₂O₆', orientation: 'C2 R, C3 S, C4 S, C5 R (C4 epimer of glucose)', role: 'Component of lactose; brain glycolipids' },
                { name: 'D-Fructose', type: 'Ketohexose (2-keto)', formula: 'C₆H₁₂O₆', orientation: 'C3 S, C4 R, C5 R (ketone at C2)', role: 'Fruit sugar; sweetest common sugar; sucrose monomer' },
                { name: 'D-Mannose', type: 'Aldohexose', formula: 'C₆H₁₂O₆', orientation: 'C2 S, C3 S, C4 R, C5 R (C2 epimer of glucose)', role: 'Protein glycosylation; cell recognition' },
              ].map(r => (
                <tr key={r.name} className="border-b border-border/50">
                  <td className="px-3 py-2 font-semibold text-primary">{r.name}</td>
                  <td className="px-3 py-2 text-secondary">{r.type}</td>
                  <td className="px-3 py-2 font-mono text-secondary">{r.formula}</td>
                  <td className="px-3 py-2 text-dim">{r.orientation}</td>
                  <td className="px-3 py-2 text-dim">{r.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Key ring structures */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Key Ring Structures</h4>
        <div className="flex flex-wrap gap-4">
          {[
            { name: 'α-D-Glucose (pyranose)', smiles: 'OC[C@H]1O[C@@H](O)[C@H](O)[C@@H](O)[C@@H]1O' },
            { name: 'D-Galactose (pyranose)', smiles: 'OC[C@H]1O[C@@H](O)[C@@H](O)[C@H](O)[C@@H]1O' },
            { name: 'D-Fructose (furanose)',  smiles: 'OC[C@@H]1OC(O)(CO)[C@@H](O)[C@H]1O' },
            { name: 'D-Ribose (furanose)',    smiles: 'OC[C@@H]1OC(O)[C@H](O)[C@@H]1O' },
          ].map(s => (
            <CompoundDisplay key={s.name} smiles={s.smiles} label={s.name} width={160} height={130} />
          ))}
        </div>
      </section>

      {/* Epimers */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Epimers</h4>
        <p className="font-sans text-xs text-secondary leading-relaxed">
          Epimers are diastereomers that differ in configuration at only ONE carbon.
        </p>
        <div className="flex flex-wrap gap-2 text-xs font-sans">
          {[
            { pair: 'Glucose / Galactose', at: 'C4 epimers' },
            { pair: 'Glucose / Mannose',   at: 'C2 epimers' },
            { pair: 'α-D-glucose / β-D-glucose', at: 'C1 anomers (anomeric epimers)' },
          ].map(e => (
            <div key={e.pair} className="rounded-sm border border-border px-3 py-2 flex flex-col gap-0.5" style={{ background: 'rgb(var(--color-raised))' }}>
              <span className="font-semibold text-primary">{e.pair}</span>
              <span className="text-dim">{e.at}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
