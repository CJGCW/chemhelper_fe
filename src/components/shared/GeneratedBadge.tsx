export default function GeneratedBadge() {
  return (
    <div className="flex items-center gap-1">
      <span
        className="font-mono text-xs px-1.5 py-0.5 rounded-sm"
        style={{
          background: 'color-mix(in srgb, var(--c-halogen) 12%, transparent)',
          color: 'var(--c-halogen)',
          border: '1px solid color-mix(in srgb, var(--c-halogen) 25%, transparent)',
        }}
      >
        generated
      </span>
      <div className="group relative">
        <span
          className="flex items-center justify-center w-4 h-4 rounded-full font-mono text-xs cursor-help select-none"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 10%, transparent)',
            color: 'var(--c-halogen)',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 25%, transparent)',
          }}
        >
          ?
        </span>
        <div className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 top-6 z-20 w-56 rounded-sm px-2.5 py-1.5 font-sans text-xs text-secondary pointer-events-none"
          style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }}>
          Generated problems are numerically correct but may not reflect realistic chemical scenarios.
        </div>
      </div>
    </div>
  )
}
