export default function PolymerizationMechanisms() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <div>
        <h3 className="font-sans font-semibold text-base text-primary mb-1">Polymerization Mechanisms</h3>
        <p className="font-sans text-xs text-secondary leading-relaxed">
          Polymers are large molecules (macromolecules) built from repeating monomer units.
          Two major classes: addition (chain-growth) and condensation (step-growth). Brown Ch. 29.
        </p>
      </div>

      {/* Addition polymerization */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Addition (Chain-Growth) Polymerization</h4>
        <p className="font-sans text-xs text-secondary">Monomers add to a growing chain end. No atoms are lost — no byproduct formed. Requires activation (initiator).</p>

        <div className="flex flex-col gap-3">
          {[
            {
              title: '1. Radical (Free Radical) Polymerization',
              steps: [
                { label: 'Initiation', text: 'Peroxide (ROOR) or AIBN + heat/hν → R• (radical). R• + CH₂=CHX → R–CH₂–ĊHX (chain-carrying radical).' },
                { label: 'Propagation', text: 'Chain end radical adds repeatedly to monomer. Rate-determining step. Each addition extends the chain by one monomer.' },
                { label: 'Termination', text: 'Two radicals combine (coupling) or disproportionate (H-transfer). No kinetic chain transfer — high MW polymers. Typical termination is random → atactic polymer (random R-group orientation).' },
              ],
              monomers: 'Ethylene → PE; propylene → PP; styrene → PS; vinyl chloride → PVC; methyl methacrylate → PMMA (Plexiglas); acrylonitrile → PAN',
              note: 'Most industrial thermoplastics use radical polymerization. Atactic products unless special initiators are used.',
            },
            {
              title: '2. Cationic Polymerization',
              steps: [
                { label: 'Initiation', text: 'H⁺ (from HX or Lewis acid + H₂O) or Lewis acid (BF₃) adds to alkene → carbocation.' },
                { label: 'Propagation', text: 'Carbocation adds to next alkene (nucleophile), generating a new carbocation. Requires electron-rich monomers that stabilize carbocations.' },
                { label: 'Termination', text: 'Loss of H⁺ or combination with counter-ion (no radical coupling). Sensitive to moisture and temperature.' },
              ],
              monomers: 'Best: isobutylene (CH₂=C(CH₃)₂) → polyisobutylene (butyl rubber); vinyl ethers; isoprene → polyisoprene (with Ziegler-Natta)',
              note: 'Requires electron-rich alkenes that stabilize the cationic chain end.',
            },
            {
              title: '3. Anionic Polymerization',
              steps: [
                { label: 'Initiation', text: 'Strong nucleophile/base (BuLi, NaNH₂) adds to electron-poor alkene → carbanion.' },
                { label: 'Propagation', text: 'Carbanion adds to next monomer. Requires electron-withdrawing groups to stabilize the anionic chain end.' },
                { label: 'Termination', text: 'No spontaneous termination (&quot;living polymerization&quot;) — add another monomer or proton source to terminate. Allows block copolymer synthesis.' },
              ],
              monomers: 'Styrene, acrylonitrile, methyl methacrylate, butadiene',
              note: '"Living" polymerization: no termination step → narrow molecular weight distribution, block copolymers possible (e.g., SBS block rubber).',
            },
            {
              title: '4. Ziegler-Natta Coordination Polymerization',
              steps: [
                { label: 'Catalyst', text: 'Ti/Al mixed metal catalyst (TiCl₄ / AlEt₃). Alkene coordinates to empty orbital on Ti, then inserts into Ti–C bond.' },
                { label: 'Mechanism', text: 'Insertion mechanism controls stereoregularity. The metal center acts as a template, placing each monomer in a specific orientation.' },
                { label: 'Product', text: 'Isotactic (all R same side) or syndiotactic (alternating R) polymers — NOT atactic. Gives HDPE from ethylene, isotactic PP.' },
              ],
              monomers: 'Ethylene → HDPE; propylene → isotactic PP (Ziegler-Natta won the 1963 Nobel Prize)',
              note: 'Makes stereoregular polymers impossible by radical methods. HDPE is stronger and denser than LDPE (which is made by radical at high pressure).',
            },
          ].map(item => (
            <div key={item.title} className="rounded-sm border border-border p-4" style={{ background: 'rgb(var(--color-raised))' }}>
              <p className="font-sans text-sm font-semibold text-primary mb-3">{item.title}</p>
              <div className="flex flex-col gap-2 mb-3">
                {item.steps.map(s => (
                  <div key={s.label} className="flex gap-2 text-xs font-sans">
                    <span className="font-semibold text-primary shrink-0 w-24">{s.label}:</span>
                    <span className="text-secondary">{s.text}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs font-sans text-secondary"><span className="font-semibold text-primary">Monomers: </span>{item.monomers}</p>
              <p className="text-xs font-sans text-secondary mt-1 italic">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Condensation polymerization */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Condensation (Step-Growth) Polymerization</h4>
        <p className="font-sans text-xs text-secondary">Bifunctional monomers react pairwise with loss of a small molecule (H₂O, HCl, MeOH). High MW only achieved at very high conversion. Any two oligomers can react with each other.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              name: 'Polyesters (e.g., PET)',
              eq: 'HOOC–Ar–COOH + HO–R–OH → [–CO–Ar–CO–O–R–O–]ₙ + nH₂O',
              detail: 'Terephthalic acid + ethylene glycol → PET (polyethylene terephthalate). Used in soda bottles (clear, strong) and Dacron fibers. Same chemistry as Fischer esterification, repeated.',
            },
            {
              name: 'Polyamides (Nylons)',
              eq: 'H₂N–R–COOH → [–NH–R–CO–]ₙ + nH₂O\nor: diamine + diacid → nylon + nH₂O',
              detail: 'Nylon-6,6: hexamethylenediamine + adipic acid → polyamide. Nylon-6: caprolactam (cyclic amide) ring-opening. Both are strong, elastic fibers used in textiles, rope, and engineering plastics.',
            },
            {
              name: 'Polyurethanes',
              eq: 'R–NCO (diisocyanate) + HO–R\'–OH (diol) → [–NH–CO–O–R\'–O–]ₙ',
              detail: 'No small-molecule byproduct! Addition-condensation. Flexible foams (furniture cushions, mattresses), rigid foams (insulation), elastomers, adhesives. Widely varied properties by tuning R/R\'.',
            },
            {
              name: 'Polycarbonates (Lexan)',
              eq: 'Bisphenol A + phosgene (COCl₂) → polycarbonate + HCl',
              detail: 'Very tough, transparent. Used in eyewear, CDs, bullet-resistant glass, water coolers. Higher Tg (~148°C) than PC bottles can handle (why they scratch at high temp). Bisphenol A controversy: estrogenic activity.',
            },
            {
              name: 'Kevlar (aromatic polyamide)',
              eq: 'p-Phenylenediamine + terephthaloyl chloride → Kevlar + HCl',
              detail: 'Exceptionally strong — tensile strength > steel by weight. Rigid aromatic backbone, H-bonds between chains. Body armor, fiber reinforcement. Lyotropic liquid crystal → spun into fibers.',
            },
            {
              name: 'Bakelite (phenol-formaldehyde)',
              eq: 'Phenol + formaldehyde → crosslinked network (thermoset)',
              detail: 'First fully synthetic polymer (Baekeland, 1909). Highly crosslinked → thermoset (cannot be re-melted). Hard, rigid, heat-resistant. Old electrical insulators, phone handsets, billiard balls.',
            },
          ].map(item => (
            <div key={item.name} className="rounded-sm border border-border p-3" style={{ background: 'rgb(var(--color-raised))' }}>
              <p className="font-sans text-xs font-semibold text-primary mb-1">{item.name}</p>
              <p className="font-mono text-xs text-secondary mb-2">{item.eq}</p>
              <p className="font-sans text-xs text-secondary leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Polymer Properties */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Key Polymer Properties</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
          {[
            {
              title: 'Glass Transition Temperature (Tg)',
              body: 'Temperature below which the polymer is rigid/glassy. Above Tg it is flexible/rubbery. Not a true melting point — amorphous regions go through this transition. Crystalline regions melt at Tm > Tg.',
            },
            {
              title: 'Crystallinity & Branching',
              body: 'Crystalline regions: chains pack regularly → stronger, denser. Branching disrupts packing → more amorphous, less dense. LDPE (high-pressure radical) is branched → low crystallinity. HDPE (Ziegler-Natta) is linear → high crystallinity, stronger.',
            },
            {
              title: 'Cross-linking',
              body: 'Covalent bonds between chains. Light cross-linking → elastomer (rubber). Heavy cross-linking → thermoset (Bakelite, epoxy). Vulcanization: natural rubber + S₈ + heat → sulfide crosslinks → vulcanized rubber (less sticky, more elastic).',
            },
            {
              title: 'Tacticity',
              body: 'Isotactic: all R groups same side → crystalline, stronger. Syndiotactic: alternating sides → also crystalline. Atactic: random → typically amorphous, lower strength. Ziegler-Natta gives isotactic; radical gives atactic.',
            },
            {
              title: 'Molecular Weight Distribution',
              body: 'Polymers have a distribution of chain lengths. Mn (number-average), Mw (weight-average). Polydispersity index (PDI) = Mw/Mn. Living polymerizations give PDI ≈ 1 (narrow). Radical polymerization gives broader distribution.',
            },
            {
              title: 'Thermoplastic vs Thermoset',
              body: 'Thermoplastic: softens on heating (can be recycled) — linear or lightly branched chains. Thermoset: permanent crosslinks → will not melt, only burns (cannot be recycled). Rubber, Bakelite, epoxies are thermosets.',
            },
          ].map(item => (
            <div key={item.title} className="rounded-sm border border-border p-3" style={{ background: 'rgb(var(--color-raised))' }}>
              <p className="font-semibold text-primary mb-1">{item.title}</p>
              <p className="text-secondary leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
