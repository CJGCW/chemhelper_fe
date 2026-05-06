import type { CSSProperties } from 'react'
import CompoundDisplay from './CompoundDisplay'
import type { RenderableChoice } from '../../data/mechanisms/types'

export type { RenderableChoice }

interface Props {
  choice: RenderableChoice
  isSelected: boolean
  isCorrect: boolean
  isChecked: boolean
  onSelect: () => void
}

export default function RenderableChoiceButton({
  choice,
  isSelected,
  isCorrect,
  isChecked,
  onSelect,
}: Props) {
  let cls = 'border-border text-secondary hover:border-muted hover:text-primary'
  let style: CSSProperties = {}

  if (isChecked && isCorrect) {
    cls = ''
    style = {
      borderColor: 'rgb(var(--color-success-border))',
      background:  'rgb(var(--color-success-bg))',
      color:       'rgb(var(--color-success))',
    }
  } else if (isChecked && isSelected && !isCorrect) {
    cls = ''
    style = {
      borderColor: 'rgb(var(--color-error-border))',
      background:  'rgb(var(--color-error-bg))',
      color:       'rgb(var(--color-error))',
    }
  }

  return (
    <button
      disabled={isChecked}
      onClick={onSelect}
      style={style}
      className={`text-left px-4 py-3 rounded-sm border transition-colors disabled:cursor-default w-full ${cls}`}
    >
      {choice.species && choice.species.length > 0 ? (
        <div className="flex items-center justify-between gap-4 min-h-[120px]">
          {/* Left: label */}
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <span className="font-sans text-sm font-medium leading-snug">
              {choice.label}
            </span>
            {choice.secondaryLabel && (
              <span className="font-sans text-xs text-secondary leading-snug">
                {choice.secondaryLabel}
              </span>
            )}
          </div>
          {/* Right: structures */}
          <div className="flex items-center gap-2 shrink-0">
            {choice.species.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <CompoundDisplay
                  smiles={s.smiles}
                  label={s.label}
                  width={180}
                  height={120}
                  showLonePairs={s.showLonePairs}
                />
                {i < choice.species!.length - 1 && (
                  <span className="font-sans text-base font-medium">+</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <span className="font-sans text-sm">{choice.label}</span>
      )}
    </button>
  )
}
