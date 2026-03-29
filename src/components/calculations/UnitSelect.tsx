export interface UnitOption {
  label: string   // display: "mg", "mL"
  prefix: string  // API prefix: "milli"
  unit: string    // API unit: "gram"
  toGrams: number // conversion factor to standard unit (grams or litres)
}

export const MASS_UNITS: UnitOption[] = [
  { label: 'µg', prefix: 'micro', unit: 'gram',  toGrams: 1e-6     },
  { label: 'mg', prefix: 'milli', unit: 'gram',  toGrams: 1e-3     },
  { label: 'g',  prefix: 'none',  unit: 'gram',  toGrams: 1        },
  { label: 'kg', prefix: 'kilo',  unit: 'gram',  toGrams: 1e3      },
  { label: 'oz', prefix: 'none',  unit: 'ounce', toGrams: 28.349   },
  { label: 'lb', prefix: 'none',  unit: 'pound', toGrams: 453.592  },
]

export const VOLUME_UNITS: UnitOption[] = [
  { label: 'µL', prefix: 'micro', unit: 'liter', toGrams: 1e-6  },
  { label: 'mL', prefix: 'milli', unit: 'liter', toGrams: 1e-3  },
  { label: 'dL', prefix: 'deci',  unit: 'liter', toGrams: 0.1   },
  { label: 'L',  prefix: 'none',  unit: 'liter', toGrams: 1     },
  { label: 'kL', prefix: 'kilo',  unit: 'liter', toGrams: 1e3   },
]

interface Props {
  options: UnitOption[]
  value: UnitOption
  onChange: (unit: UnitOption) => void
  disabled?: boolean
}

export default function UnitSelect({ options, value, onChange, disabled }: Props) {
  return (
    <select
      disabled={disabled}
      value={value.label}
      onChange={e => {
        const found = options.find(o => o.label === e.target.value)
        if (found) onChange(found)
      }}
      className="font-mono text-xs bg-raised border border-border rounded-sm px-2 py-1.5
                 text-primary focus:outline-none focus:border-accent/40 transition-colors
                 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {options.map(o => (
        <option key={o.label} value={o.label}>{o.label}</option>
      ))}
    </select>
  )
}
