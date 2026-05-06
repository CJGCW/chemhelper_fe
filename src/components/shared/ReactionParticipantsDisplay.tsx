import CompoundDisplay from './CompoundDisplay'
import type { ReactionParticipants } from '../../data/mechanisms/types'

interface Props {
  participants: ReactionParticipants
  separator?: '+' | 'or' | ', '
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_MAP: Record<NonNullable<Props['size']>, { w: number; h: number }> = {
  sm: { w: 100, h: 80 },
  md: { w: 140, h: 100 },
  lg: { w: 180, h: 140 },
}

export default function ReactionParticipantsDisplay({
  participants,
  separator = '+',
  size = 'md',
}: Props) {
  const { w, h } = SIZE_MAP[size]

  if (!participants.species || participants.species.length === 0) {
    return (
      <span className="font-mono text-sm text-secondary">{participants.text}</span>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {participants.species.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="relative">
            <CompoundDisplay
              smiles={s.smiles}
              label={s.label}
              width={w}
              height={h}
              showLonePairs={s.showLonePairs}
            />
            {s.catalyst && (
              <span
                className="absolute top-0 right-0 font-mono text-[9px] px-1 rounded-sm"
                style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                  color: 'var(--c-halogen)',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                }}
              >
                cat.
              </span>
            )}
          </div>
          {i < participants.species.length - 1 && (
            <span className="font-sans text-sm text-secondary font-medium">{separator}</span>
          )}
        </div>
      ))}
    </div>
  )
}
