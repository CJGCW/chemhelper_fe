export default function TriglyceridesReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <div>
        <h3 className="font-sans font-semibold text-base text-primary mb-1">Triglycerides (Triacylglycerols)</h3>
        <p className="font-sans text-xs text-secondary leading-relaxed">
          Triglycerides are the primary form of fat storage in animals and plants.
          One glycerol backbone + three fatty acids in ester linkages. Brown Ch. 26.
        </p>
      </div>

      {/* Structure */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Structure</h4>
        <div className="rounded-sm border border-border p-4 font-mono text-xs text-secondary" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="text-primary font-semibold mb-2">Glycerol backbone + 3 fatty acids (as esters)</p>
          <p>CH₂–O–CO–R₁   ← sn-1 position</p>
          <p>|</p>
          <p>CH –O–CO–R₂   ← sn-2 position (often unsaturated)</p>
          <p>|</p>
          <p>CH₂–O–CO–R₃   ← sn-3 position</p>
          <p className="mt-2 text-secondary">R₁, R₂, R₃ are fatty acid chains. They may be the same (simple TG) or different (mixed TG).</p>
        </div>
      </section>

      {/* Hydrolysis */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Hydrolysis Reactions</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
          <div className="rounded-sm border border-border p-4" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-semibold text-primary mb-2">Acid hydrolysis</p>
            <p className="font-mono text-secondary mb-2">Triglyceride + 3 H₂O → glycerol + 3 fatty acids</p>
            <p className="text-secondary">Conditions: H₃O⁺, heat. Reversible (Fischer esterification equilibrium). Gives the free fatty acids (as carboxylic acids).</p>
          </div>
          <div className="rounded-sm border border-border p-4" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-semibold text-primary mb-2">Saponification (base hydrolysis)</p>
            <p className="font-mono text-secondary mb-2">Triglyceride + 3 NaOH → glycerol + 3 RCOONa (soap)</p>
            <p className="text-secondary">Conditions: NaOH (hard soap) or KOH (soft/liquid soap). Irreversible — carboxylate salts don&apos;t re-esterify under basic conditions. &quot;Saponification&quot; = soap-making.</p>
          </div>
        </div>
        <div className="rounded-sm border border-border p-3 text-xs font-sans" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="font-semibold text-primary mb-1">Why soap works</p>
          <p className="text-secondary">Soap (RCOO⁻ Na⁺) is amphipathic: long hydrophobic tail (R) + polar carboxylate head (COO⁻). In water, soaps form micelles — hydrophobic tails inside, ionic heads outside — trapping grease/oil in the hydrophobic core and allowing it to be rinsed away.</p>
        </div>
      </section>

      {/* Hydrogenation */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Hydrogenation of Fats</h4>
        <div className="rounded-sm border border-border p-4 text-xs font-sans" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="font-mono text-secondary mb-2">C=C (unsaturated) + H₂ → C–C (saturated)   [Pd or Ni catalyst]</p>
          <p className="text-secondary mb-2">Converts liquid vegetable oils → solid shortening/margarine (e.g., Crisco).</p>
          <p className="text-secondary"><strong className="text-primary">Partial hydrogenation:</strong> not all double bonds are reduced. Industrial side reaction: some remaining cis C=C bonds isomerize to trans. This is the origin of <strong className="text-primary">trans fats</strong> in processed foods.</p>
          <p className="text-secondary mt-1"><strong className="text-primary">Full hydrogenation:</strong> all C=C reduced → no trans fats but product is very hard (like wax).</p>
        </div>
      </section>

      {/* Iodine number */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Iodine Number (Iodine Value)</h4>
        <div className="rounded-sm border border-border p-4 text-xs font-sans" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="text-secondary mb-1">Grams of I₂ absorbed per 100 g of fat. Measures total unsaturation.</p>
          <p className="text-secondary mb-1"><strong className="text-primary">High iodine number</strong> = more double bonds = more unsaturation = lower melting point (more liquid)</p>
          <p className="text-secondary"><strong className="text-primary">Low iodine number</strong> = fewer double bonds = more saturated = higher melting point (more solid)</p>
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <p className="font-semibold text-primary">Coconut oil</p>
              <p className="text-secondary">~10</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-primary">Olive oil</p>
              <p className="text-secondary">~80</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-primary">Linseed oil</p>
              <p className="text-secondary">~180</p>
            </div>
          </div>
        </div>
      </section>

      {/* Rancidification */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Rancidification</h4>
        <div className="rounded-sm border border-border p-3 text-xs font-sans" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="text-secondary">Oxidation of unsaturated fatty acids by O₂ via a radical chain mechanism. Products include peroxides, aldehydes, and short-chain carboxylic acids that cause off-flavors ("rancid" smell). Accelerated by heat, light, and metal ions.</p>
          <p className="text-secondary mt-1"><strong className="text-primary">Antioxidants</strong> (BHT, BHA, vitamin E/tocopherol) donate H• to chain-carrying radicals, terminating the chain. Added to processed foods to extend shelf life.</p>
        </div>
      </section>
    </div>
  )
}
