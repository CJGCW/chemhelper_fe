interface Props<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}

export default function SolveForPills<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-xs text-secondary tracking-wider">SOLVE FOR</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => {
          const active = opt.value === value
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className="px-3 py-1.5 rounded-sm border font-sans text-sm transition-all duration-150"
              style={{
                borderColor: active
                  ? 'color-mix(in srgb, var(--c-halogen) 60%, transparent)'
                  : 'rgba(255,255,255,0.1)',
                background: active
                  ? 'color-mix(in srgb, var(--c-halogen) 14%, #0e1016)'
                  : '#0e1016',
                color: active ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
