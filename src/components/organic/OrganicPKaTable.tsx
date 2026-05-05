export default function OrganicPKaTable() {
  const entries: {
    type: string
    example: string
    pka: string
    conjugateBase: string
    notes: string
    color: 'gray' | 'blue' | 'yellow' | 'red'
  }[] = [
    { type: 'Alkane C–H',         example: 'CH₄',             pka: '~50',   conjugateBase: 'CH₃⁻ (carbanion)',        notes: 'Essentially never deprotonated',                color: 'gray'   },
    { type: 'Alkene sp² C–H',     example: 'CH₂=CH₂',        pka: '~44',   conjugateBase: 'vinyl carbanion',          notes: 'Higher s-character than sp³',                   color: 'gray'   },
    { type: 'H₂',                 example: 'H–H',             pka: '~36',   conjugateBase: 'H⁻ (hydride)',             notes: 'NaH is a strong base',                          color: 'gray'   },
    { type: 'NH₃',                example: 'NH₃',             pka: '~36',   conjugateBase: 'NH₂⁻ (amide)',             notes: 'NaNH₂ deprotonates terminal alkynes',           color: 'gray'   },
    { type: 'Terminal alkyne C–H',example: 'RC≡CH',           pka: '~25',   conjugateBase: 'RC≡C⁻ (acetylide)',        notes: 'sp carbon (50% s-character); use NaNH₂',       color: 'blue'   },
    { type: 'Ester α–H',          example: 'CH₃COOEt',        pka: '~25',   conjugateBase: 'ester enolate',            notes: 'LDA fully deprotonates at –78°C',               color: 'blue'   },
    { type: 'Ketone/Aldehyde α–H',example: 'CH₃COCH₃',       pka: '~20',   conjugateBase: 'enolate',                  notes: 'LDA fully; NaOEt gives ~5% enolate',            color: 'blue'   },
    { type: 'Alcohol O–H',        example: 'ROH',             pka: '16–18', conjugateBase: 'alkoxide (RO⁻)',           notes: 'NaH or Na metal; pKa varies with R',            color: 'blue'   },
    { type: 'Water',              example: 'H₂O',             pka: '15.7',  conjugateBase: 'OH⁻',                      notes: 'Standard reference',                            color: 'blue'   },
    { type: 'β-Keto ester α–H',   example: 'CH₃COCH₂COOEt',  pka: '~11',   conjugateBase: 'stabilized enolate',       notes: 'NaOEt fully deprotonates; resonance + inductive', color: 'yellow' },
    { type: 'Phenol O–H',         example: 'PhOH',            pka: '~10',   conjugateBase: 'phenoxide (PhO⁻)',         notes: 'NaOH fully; resonance into ring',               color: 'yellow' },
    { type: 'β-Diketone α–H',     example: 'CH₃COCH₂COCH₃',  pka: '~9',    conjugateBase: 'doubly stabilized enolate',notes: 'Two C=O groups stabilize charge',               color: 'yellow' },
    { type: 'Ammonium (NH₄⁺)',    example: 'NH₄⁺',            pka: '9.2',   conjugateBase: 'NH₃',                      notes: 'Aqueous pKa; buffering range 8–10',             color: 'yellow' },
    { type: 'HCN',                example: 'HCN',             pka: '9.2',   conjugateBase: 'CN⁻ (cyanide)',            notes: 'Common nucleophile in synthesis',               color: 'yellow' },
    { type: 'Carboxylic acid O–H',example: 'RCOOH',           pka: '4–5',   conjugateBase: 'carboxylate (RCOO⁻)',      notes: 'NaHCO₃ deprotonates; distinguishes from PhOH', color: 'red'    },
    { type: 'Protonated alcohol',  example: 'ROH₂⁺',          pka: '~−2',   conjugateBase: 'alcohol (ROH)',            notes: 'Generated under acidic catalysis',             color: 'red'    },
    { type: 'Sulfonic acid',       example: 'RSO₃H (p-TsOH)', pka: '~−2',   conjugateBase: 'sulfonate',                notes: 'Strong acid catalyst in synthesis',            color: 'red'    },
    { type: 'H₃O⁺',              example: 'H₃O⁺',            pka: '−1.7',  conjugateBase: 'H₂O',                      notes: 'Aqueous pH scale reference',                   color: 'red'    },
    { type: 'HCl',                example: 'HCl',             pka: '~−7',   conjugateBase: 'Cl⁻',                      notes: 'Strong acid; completely dissociates in water', color: 'red'    },
    { type: 'Protonated ketone',   example: 'R₂C=OH⁺',        pka: '~−7',   conjugateBase: 'ketone (R₂C=O)',           notes: 'Formed in acid-catalyzed nucleophilic addition', color: 'red'  },
  ]

  const colorClasses: Record<string, { row: string; badge: string }> = {
    gray:   { row: 'bg-transparent',                                                          badge: 'bg-secondary/10 text-secondary' },
    blue:   { row: 'bg-blue-500/5',                                                           badge: 'bg-blue-500/15 text-blue-400'   },
    yellow: { row: 'bg-yellow-500/5',                                                         badge: 'bg-yellow-500/15 text-yellow-400' },
    red:    { row: 'bg-red-500/5',                                                            badge: 'bg-red-500/15 text-red-400'     },
  }

  const legend = [
    { color: 'gray',   label: 'pKa > 30 — never deprotonated under normal conditions' },
    { color: 'blue',   label: 'pKa 15–30 — strong base required (NaH, LDA, NaNH₂)' },
    { color: 'yellow', label: 'pKa 5–15 — moderate base sufficient (NaOEt, NaOH)' },
    { color: 'red',    label: 'pKa < 5 — acidic (weak base like NaHCO₃ works)' },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-4xl print:max-w-none">
      <div>
        <h3 className="font-sans font-semibold text-base text-primary mb-1">Organic pKa Reference Table</h3>
        <p className="font-sans text-xs text-secondary">Ordered from least acidic (top) to most acidic (bottom). Brown Appendix D.</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {legend.map(l => (
          <div key={l.color} className="flex items-center gap-1.5 font-sans text-xs">
            <span className={`inline-block w-3 h-3 rounded-sm ${colorClasses[l.color].badge}`} />
            <span className="text-secondary">{l.label}</span>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-sm border border-border">
        <table className="w-full text-xs font-sans border-collapse">
          <thead>
            <tr className="border-b border-border bg-raised">
              <th className="px-3 py-2 text-left font-semibold text-secondary">Compound Type</th>
              <th className="px-3 py-2 text-left font-semibold text-secondary">Example</th>
              <th className="px-3 py-2 text-left font-semibold text-secondary">pKₐ</th>
              <th className="px-3 py-2 text-left font-semibold text-secondary">Conjugate Base</th>
              <th className="px-3 py-2 text-left font-semibold text-secondary">Notes</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => {
              const { row, badge } = colorClasses[e.color]
              return (
                <tr key={i} className={`border-b border-border/50 ${row}`}>
                  <td className="px-3 py-1.5 text-primary font-medium">{e.type}</td>
                  <td className="px-3 py-1.5 font-mono text-primary">{e.example}</td>
                  <td className="px-3 py-1.5">
                    <span className={`px-1.5 py-0.5 rounded font-mono font-semibold text-[11px] ${badge}`}>{e.pka}</span>
                  </td>
                  <td className="px-3 py-1.5 text-secondary">{e.conjugateBase}</td>
                  <td className="px-3 py-1.5 text-dim">{e.notes}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="font-sans text-[11px] text-dim">
        * pKa values are approximate and solvent-dependent. Aqueous pKa values differ from DMSO values by as much as 10 units for C–H acids.
      </p>
    </div>
  )
}
