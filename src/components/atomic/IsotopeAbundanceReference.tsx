import { ISOTOPES } from '../../data/elementIsotopes'

// Elements to feature — Gen Chem 101 coverage (Z 1–36) + selected heavier ones
const FEATURED: { Z: number; symbol: string; name: string }[] = [
  { Z: 1,  symbol: 'H',  name: 'Hydrogen'   },
  { Z: 2,  symbol: 'He', name: 'Helium'      },
  { Z: 3,  symbol: 'Li', name: 'Lithium'     },
  { Z: 4,  symbol: 'Be', name: 'Beryllium'   },
  { Z: 5,  symbol: 'B',  name: 'Boron'       },
  { Z: 6,  symbol: 'C',  name: 'Carbon'      },
  { Z: 7,  symbol: 'N',  name: 'Nitrogen'    },
  { Z: 8,  symbol: 'O',  name: 'Oxygen'      },
  { Z: 9,  symbol: 'F',  name: 'Fluorine'    },
  { Z: 10, symbol: 'Ne', name: 'Neon'        },
  { Z: 11, symbol: 'Na', name: 'Sodium'      },
  { Z: 12, symbol: 'Mg', name: 'Magnesium'   },
  { Z: 13, symbol: 'Al', name: 'Aluminum'    },
  { Z: 14, symbol: 'Si', name: 'Silicon'     },
  { Z: 15, symbol: 'P',  name: 'Phosphorus'  },
  { Z: 16, symbol: 'S',  name: 'Sulfur'      },
  { Z: 17, symbol: 'Cl', name: 'Chlorine'    },
  { Z: 18, symbol: 'Ar', name: 'Argon'       },
  { Z: 19, symbol: 'K',  name: 'Potassium'   },
  { Z: 20, symbol: 'Ca', name: 'Calcium'     },
  { Z: 22, symbol: 'Ti', name: 'Titanium'    },
  { Z: 24, symbol: 'Cr', name: 'Chromium'    },
  { Z: 26, symbol: 'Fe', name: 'Iron'        },
  { Z: 28, symbol: 'Ni', name: 'Nickel'      },
  { Z: 29, symbol: 'Cu', name: 'Copper'      },
  { Z: 30, symbol: 'Zn', name: 'Zinc'        },
  { Z: 35, symbol: 'Br', name: 'Bromine'     },
  { Z: 36, symbol: 'Kr', name: 'Krypton'     },
  { Z: 47, symbol: 'Ag', name: 'Silver'      },
  { Z: 50, symbol: 'Sn', name: 'Tin'         },
]

function toSuperscript(n: number): string {
  return String(n).replace(/\d/g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d])
}

export default function IsotopeAbundanceReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      {/* Formula box */}
      <div className="p-4 rounded-sm max-w-lg"
        style={{ background: 'rgb(var(--color-base))', border: '1px solid rgb(var(--color-border))' }}>
        <p className="font-mono text-sm font-semibold text-bright mb-2">
          Weighted Average Atomic Mass
        </p>
        <p className="font-mono text-base" style={{ color: 'var(--c-halogen)' }}>
          Ā = Σ (mᵢ × fᵢ)
        </p>
        <div className="mt-3 flex flex-col gap-1">
          {[
            { sym: 'Ā',  def: 'Average atomic mass (reported on periodic table)',  unit: 'amu' },
            { sym: 'mᵢ', def: 'Exact isotopic mass of isotope i',                   unit: 'amu' },
            { sym: 'fᵢ', def: 'Fractional abundance of isotope i (% ÷ 100)',        unit: '0 – 1' },
          ].map(r => (
            <div key={r.sym} className="flex items-baseline gap-2">
              <span className="font-mono text-sm w-6 shrink-0" style={{ color: 'var(--c-halogen)' }}>{r.sym}</span>
              <span className="font-mono text-xs text-secondary">{r.def}</span>
              <span className="font-mono text-xs text-dim ml-auto shrink-0">{r.unit}</span>
            </div>
          ))}
        </div>
        <p className="font-mono text-xs text-dim mt-3">
          Example: Cl = 35Cl × 0.7577 + 37Cl × 0.2423 = 35.45 amu
        </p>
      </div>

      {/* Isotope table */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {FEATURED.map(({ Z, symbol, name }) => {
          const isotopes = ISOTOPES[Z]
          if (!isotopes) return null
          const natural = isotopes.filter(i => i.abundance !== undefined)
          if (natural.length === 0) return null

          return (
            <div key={Z} className="flex flex-col rounded-sm overflow-hidden"
              style={{ border: '1px solid rgb(var(--color-border))' }}>

              {/* Element header */}
              <div className="flex items-baseline gap-1.5 px-2.5 py-1.5"
                style={{ background: 'color-mix(in srgb, var(--c-halogen) 10%, rgb(var(--color-base)))' }}>
                <span className="font-mono text-sm font-semibold" style={{ color: 'var(--c-halogen)' }}>
                  {symbol}
                </span>
                <span className="font-sans text-xs text-secondary">{name}</span>
                <span className="font-mono text-[10px] text-dim ml-auto">Z={Z}</span>
              </div>

              {/* Isotope rows */}
              <div className="flex flex-col divide-y" style={{ borderColor: 'rgb(var(--color-border))' }}>
                {natural.map(iso => (
                  <div key={iso.A} className="flex items-center justify-between px-2.5 py-1 gap-2"
                    style={{ background: 'rgb(var(--color-surface))' }}>
                    <span className="font-mono text-xs text-primary whitespace-nowrap">
                      {toSuperscript(iso.A)}{symbol}
                      {iso.name ? <span className="text-dim ml-1 text-[10px]">({iso.name})</span> : null}
                    </span>
                    <span className="font-mono text-xs shrink-0"
                      style={{ color: iso.radioactive ? 'rgba(var(--overlay),0.4)' : 'rgba(var(--overlay),0.7)' }}>
                      {iso.abundance! < 0.01
                        ? iso.abundance!.toFixed(4)
                        : iso.abundance! < 1
                        ? iso.abundance!.toFixed(3)
                        : iso.abundance!.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <p className="font-mono text-xs text-dim max-w-2xl">
        Abundances are natural terrestrial percentages (IUPAC 2021). Exact isotopic masses differ
        slightly from mass numbers due to nuclear binding energy. Use exact masses for precise
        calculations; mass numbers give ±0.1 amu accuracy.
      </p>
    </div>
  )
}
