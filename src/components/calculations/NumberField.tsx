import type { ReactNode } from 'react'
import { sanitize } from '../../utils/calcHelpers'

interface Props {
  label: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  placeholder?: string
  unit?: ReactNode
  disabled?: boolean
  solveFor?: boolean
  hint?: string
}


export default function NumberField({
  label, value, onChange, onBlur, placeholder = '0',
  unit, disabled, solveFor, hint,
}: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="font-sans text-sm font-medium text-primary">{label}</label>
        {solveFor && (
          <span
            className="font-mono text-[9px] px-1.5 py-0.5 rounded-sm tracking-wider"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 12%, transparent)',
              color: 'var(--c-halogen)',
              border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
            }}
          >
            SOLVING FOR
          </span>
        )}
      </div>
      <div className="flex items-stretch gap-1.5">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={e => onChange(sanitize(e.target.value, true))}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled || solveFor}
          className="flex-1 min-w-0 font-mono text-sm bg-raised border border-border
                     rounded-sm px-3 py-2 text-primary placeholder-dim
                     focus:outline-none focus:border-accent/40 transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed"
          style={solveFor ? {
            borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, #1c1f2e)',
            background: 'color-mix(in srgb, var(--c-halogen) 6%, #141620)',
            color: 'var(--c-halogen)',
          } : undefined}
        />
        {unit && <div className="shrink-0 flex items-center">{unit}</div>}
      </div>
      {hint && (
        <p className="font-mono text-xs text-secondary">{hint}</p>
      )}
    </div>
  )
}
