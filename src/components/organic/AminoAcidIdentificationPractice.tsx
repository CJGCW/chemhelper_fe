import { useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CompoundDisplay from '../shared/CompoundDisplay'
import KetcherStructureEditor from '../vsepr/KetcherStructureEditor'
import type { KetcherEditorHandle } from '../vsepr/KetcherStructureEditor'
import { AMINO_ACIDS, CLASS_COLORS, CLASS_LABELS } from '../../data/aminoAcids'
import type { AminoAcid } from '../../data/aminoAcids'

type SubMode = 'name' | 'draw' | 'class'
type Difficulty = 'easy' | 'normal' | 'hard'
type AaClass = AminoAcid['class']

const ALL_CLASSES: AaClass[] = ['nonpolar', 'aromatic', 'polar', 'acidic', 'basic']
const ALL_MODES: SubMode[] = ['name', 'draw', 'class']

// Easy mode: 10 most common amino acids
const COMMON_AA_NAMES = new Set(['Glycine', 'Alanine', 'Valine', 'Leucine', 'Isoleucine', 'Serine', 'Threonine', 'Aspartate', 'Glutamate', 'Lysine'])

const CLASS_EXPLANATIONS: Record<AaClass, string> = {
  nonpolar: 'Nonpolar amino acids have purely hydrocarbon or thioether side chains — no polar bonds to create charge or H-bonding. They are hydrophobic and typically buried in protein cores.',
  aromatic: 'Aromatic amino acids (Phe, Tyr, Trp) have ring systems that dominate their classification. Tyrosine has an OH but its aromatic ring is the defining feature.',
  polar:    'Polar uncharged amino acids (Ser, Thr, Cys, Asn, Gln) have OH, SH, or amide side chains that can H-bond but carry no net charge at physiological pH.',
  acidic:   'Acidic amino acids (Asp, Glu) have carboxylic acid side chains (pKa ≈ 4) that are fully deprotonated and negatively charged at physiological pH.',
  basic:    'Basic amino acids (Lys, Arg, His) have amine, guanidinium, or imidazole side chains. Lys and Arg are fully protonated (+) at pH 7.4; His is partially protonated (pKa ≈ 6).',
}

interface Settings {
  modes: SubMode[]
  classes: AaClass[]
  difficulty: Difficulty
}

interface Props { allowCustom?: boolean }

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getPool(settings: Settings, excludeGlyPro = false): AminoAcid[] {
  let pool = AMINO_ACIDS.filter(aa => settings.classes.includes(aa.class))
  if (settings.difficulty === 'easy') {
    const easy = pool.filter(aa => COMMON_AA_NAMES.has(aa.name))
    if (easy.length > 0) pool = easy
  }
  if (excludeGlyPro) {
    const filtered = pool.filter(aa => aa.name !== 'Glycine' && aa.name !== 'Proline')
    if (filtered.length > 0) pool = filtered
  }
  return pool.length > 0 ? pool : AMINO_ACIDS
}

// ── Mode A: Name from structure ───────────────────────────────────────────────

function NameMode({ settings, allowHardMode, onScore }: {
  settings: Settings
  allowHardMode: boolean
  onScore: (delta: number) => void
}) {
  const [aa, setAa] = useState(() => pickRandom(getPool(settings)))
  const [input, setInput]   = useState('')
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)

  function handleSubmit() {
    if (!input.trim()) return
    const t = input.trim()
    // Hard mode: only full name accepted
    const strictCorrect = settings.difficulty === 'hard' && allowHardMode
      ? t.toLowerCase() === aa.name.toLowerCase()
      : t.toLowerCase() === aa.name.toLowerCase() || t.toLowerCase() === aa.three.toLowerCase() || t === aa.one

    setCorrect(strictCorrect)
    setChecked(true)
    onScore(strictCorrect ? 1 : 0)
  }

  function handleNext() {
    setAa(pickRandom(getPool(settings)))
    setInput('')
    setChecked(false)
    setCorrect(false)
  }

  return (
    <motion.div key={aa.name}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
      className={`rounded-sm border p-5 flex flex-col gap-4 transition-colors ${
        !checked ? 'border-border' : correct ? 'border-[rgb(var(--color-success-border))]' : 'border-[rgb(var(--color-error-border))]'
      }`}
      style={{
        background: checked
          ? (correct ? 'rgb(var(--color-success-bg) / 0.25)' : 'rgb(var(--color-error-bg) / 0.25)')
          : 'rgb(var(--color-surface))',
      }}
    >
      <p className="font-sans text-sm text-secondary">Name this amino acid. Enter the full name, 3-letter code, or 1-letter code.</p>
      <div className="flex justify-center">
        <CompoundDisplay smiles={aa.fullSmiles} label="" width={280} height={200} />
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={settings.difficulty === 'hard' && allowHardMode ? 'Full name only…' : 'Name, Ala, or A…'}
          value={input}
          onChange={e => { if (!checked) setInput(e.target.value) }}
          onKeyDown={e => { if (e.key === 'Enter' && !checked) handleSubmit() }}
          className="flex-1 px-3 py-1.5 rounded-sm border border-border bg-transparent text-sm text-primary placeholder:text-dim outline-none focus:ring-1 focus:ring-border font-sans"
          disabled={checked}
        />
        {!checked && (
          <button onClick={handleSubmit}
            className="px-4 py-1.5 rounded-sm font-sans text-sm border transition-colors"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))', borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)', color: 'var(--c-halogen)' }}
          >
            Check
          </button>
        )}
      </div>
      {checked && (
        <div className="flex flex-col gap-1">
          <p className={`font-sans text-sm font-medium ${correct ? 'text-[rgb(var(--color-success))]' : 'text-[rgb(var(--color-error))]'}`}>
            {correct ? '✓ Correct' : `✗ Incorrect — ${aa.name} (${aa.three} / ${aa.one})`}
          </p>
          {!correct && aa.notes && (
            <p className="font-sans text-xs text-secondary italic">{aa.notes}</p>
          )}
        </div>
      )}
      {checked && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={handleNext}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary hover:border-muted transition-colors">
            Next →
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}

// ── Mode B: Draw R-group (Fallback 2 — self-check) ───────────────────────────

function DrawMode({ settings, onScore }: {
  settings: Settings
  onScore: (delta: number) => void
}) {
  const [aa, setAa] = useState(() => pickRandom(getPool(settings, true)))
  const [resetKey, setResetKey]   = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [showHint, setShowHint]   = useState(false)
  const ketcherRef = useRef<KetcherEditorHandle>(null)

  function handleSubmit() {
    setSubmitted(true)
  }

  function handleSelfReport(correct: boolean) {
    onScore(correct ? 1 : 0)
    setAa(pickRandom(getPool(settings, true)))
    setResetKey(k => k + 1)
    setSubmitted(false)
    setShowHint(false)
  }

  const rSmiles = aa.rGroupSmiles ?? aa.rGroupFullStructure ?? aa.fullSmiles

  return (
    <motion.div key={`${aa.name}-${resetKey}`}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
      className="rounded-sm border border-border p-5 flex flex-col gap-4"
      style={{ background: 'rgb(var(--color-surface))' }}
    >
      <div className="flex items-baseline gap-2">
        <p className="font-sans text-sm text-secondary">Draw the R-group (side chain) of:</p>
        <span className="font-sans text-base font-semibold text-primary">{aa.name}</span>
        <span className="font-mono text-sm text-secondary">({aa.three})</span>
      </div>

      <button onClick={() => setShowHint(h => !h)}
        className="self-start font-sans text-xs text-dim hover:text-secondary transition-colors">
        {showHint ? '▲ Hide backbone reference' : '▼ Show backbone reference'}
      </button>

      <AnimatePresence>
        {showHint && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }} style={{ overflow: 'hidden' }}>
            <div className="rounded-sm border border-border p-3 flex flex-col gap-1" style={{ background: 'rgb(var(--color-raised))' }}>
              <p className="font-mono text-xs text-secondary">Amino acid backbone:</p>
              <p className="font-mono text-sm text-primary">H₂N — Cα(R) — COOH</p>
              <p className="font-sans text-xs text-dim">Draw only the R group attached to Cα. For {aa.name}, R = {aa.rGroup}.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ height: 320 }}>
        <KetcherStructureEditor
          ref={ketcherRef}
          correctStructure={null}
          showCheck={false}
          resetKey={resetKey}
        />
      </div>

      {!submitted ? (
        <button onClick={handleSubmit}
          className="self-start px-4 py-2 rounded-sm font-sans text-sm border transition-colors"
          style={{ background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))', borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)', color: 'var(--c-halogen)' }}
        >
          Submit & Compare
        </button>
      ) : (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="font-sans text-sm font-medium text-primary">Correct R-group for {aa.name}:</p>
            <div className="flex items-start gap-4 flex-wrap">
              <div className="flex flex-col gap-1 items-center">
                <CompoundDisplay smiles={rSmiles} label={aa.rGroup} width={160} height={120} />
                <span className="font-mono text-xs text-secondary">{aa.rGroup}</span>
              </div>
              <div className="flex flex-col gap-1 text-xs text-secondary font-sans max-w-xs pt-2">
                <span className="font-semibold text-primary">{aa.name} ({aa.three}/{aa.one})</span>
                <span>Class: {CLASS_LABELS[aa.class]}</span>
                {aa.notes && <span className="italic">{aa.notes}</span>}
              </div>
            </div>
          </div>
          <p className="font-sans text-sm text-secondary">Does your drawing match the R-group above?</p>
          <div className="flex gap-3">
            <button onClick={() => handleSelfReport(true)}
              className="px-4 py-2 rounded-sm font-sans text-sm border transition-colors"
              style={{ background: 'rgb(var(--color-success-bg) / 0.3)', borderColor: 'rgb(var(--color-success-border))', color: 'rgb(var(--color-success))' }}
            >
              ✓ Matches
            </button>
            <button onClick={() => handleSelfReport(false)}
              className="px-4 py-2 rounded-sm font-sans text-sm border transition-colors"
              style={{ background: 'rgb(var(--color-error-bg) / 0.3)', borderColor: 'rgb(var(--color-error-border))', color: 'rgb(var(--color-error))' }}
            >
              ✗ Didn't match
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// ── Mode C: Identify class ────────────────────────────────────────────────────

function ClassMode({ settings, allowHardMode, onScore }: {
  settings: Settings
  allowHardMode: boolean
  onScore: (delta: number) => void
}) {
  const [aa, setAa] = useState(() => pickRandom(getPool(settings)))
  const [selected, setSelected] = useState<AaClass | null>(null)
  const [checked, setChecked]   = useState(false)

  const showName = !(settings.difficulty === 'hard' && allowHardMode)

  function handleSelect(c: AaClass) {
    if (checked) return
    const isCorrect = c === aa.class
    setSelected(c)
    setChecked(true)
    onScore(isCorrect ? 1 : 0)
  }

  function handleNext() {
    setAa(pickRandom(getPool(settings)))
    setSelected(null)
    setChecked(false)
  }

  const correct = checked && selected === aa.class

  return (
    <motion.div key={aa.name}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
      className={`rounded-sm border p-5 flex flex-col gap-4 transition-colors ${
        !checked ? 'border-border' : correct ? 'border-[rgb(var(--color-success-border))]' : 'border-[rgb(var(--color-error-border))]'
      }`}
      style={{
        background: checked
          ? (correct ? 'rgb(var(--color-success-bg) / 0.25)' : 'rgb(var(--color-error-bg) / 0.25)')
          : 'rgb(var(--color-surface))',
      }}
    >
      <p className="font-sans text-sm text-secondary">What class of amino acid is this?</p>
      <div className="flex flex-col gap-2 items-start">
        {showName && (
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-base font-semibold text-primary">{aa.name}</span>
            <span className="font-mono text-sm text-secondary">({aa.three} / {aa.one})</span>
          </div>
        )}
        <CompoundDisplay smiles={aa.fullSmiles} label="" width={260} height={180} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {(settings.classes.length >= 2 ? settings.classes : ALL_CLASSES).map(c => {
          const color = CLASS_COLORS[c]
          const isSelected = selected === c
          const isCorrect  = c === aa.class
          let style: React.CSSProperties
          if (checked) {
            if (isCorrect) {
              style = {
                background: `color-mix(in srgb, ${color} 20%, transparent)`,
                borderColor: `color-mix(in srgb, ${color} 50%, transparent)`,
                color,
              }
            } else if (isSelected) {
              style = { background: 'rgb(var(--color-error-bg) / 0.35)', borderColor: 'rgb(var(--color-error-border) / 0.4)', color: 'rgb(var(--color-error))' }
            } else {
              style = { background: 'transparent', borderColor: 'rgb(var(--color-border))', color: 'rgb(var(--color-dim))' }
            }
          } else if (isSelected) {
            style = {
              background: `color-mix(in srgb, ${color} 18%, rgb(var(--color-raised)))`,
              borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
              color,
            }
          } else {
            style = { background: 'rgb(var(--color-raised))', borderColor: 'rgb(var(--color-border))', color: 'rgba(var(--overlay), 0.6)' }
          }
          return (
            <button key={c} onClick={() => handleSelect(c)} disabled={checked}
              className="px-3 py-2 rounded-sm font-sans text-sm border transition-colors disabled:cursor-not-allowed"
              style={style}
            >
              {CLASS_LABELS[c]}
            </button>
          )
        })}
      </div>

      {checked && (
        <div className="flex flex-col gap-1.5">
          <p className={`font-sans text-sm font-medium ${correct ? 'text-[rgb(var(--color-success))]' : 'text-[rgb(var(--color-error))]'}`}>
            {correct ? `✓ Correct — ${aa.name} is ${CLASS_LABELS[aa.class]}` : `✗ Incorrect — ${aa.name} is ${CLASS_LABELS[aa.class]}`}
          </p>
          <p className="font-sans text-sm text-secondary leading-relaxed">{CLASS_EXPLANATIONS[aa.class]}</p>
          {aa.notes && (
            <p className="font-sans text-xs text-secondary italic">{aa.notes}</p>
          )}
        </div>
      )}

      {checked && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={handleNext}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary hover:border-muted transition-colors">
            Next →
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const MODE_LABELS: Record<SubMode, string> = {
  name:  'Name from Structure',
  draw:  'Draw R-group',
  class: 'Identify Class',
}

export default function AminoAcidIdentificationPractice({ allowCustom = true }: Props) {
  const [searchParams, setSearchParams] = useSearchParams()

  const [settings, setSettings] = useState<Settings>({
    modes: ALL_MODES,
    classes: ALL_CLASSES,
    difficulty: 'normal',
  })
  const [showSettings, setShowSettings] = useState(false)

  const activeModes = allowCustom ? (settings.modes.length > 0 ? settings.modes : ALL_MODES) : ALL_MODES
  const rawMode = searchParams.get('mode') as SubMode | null
  const activeMode: SubMode = (rawMode && activeModes.includes(rawMode)) ? rawMode : activeModes[0]

  function setMode(m: SubMode) {
    setSearchParams(prev => { prev.set('mode', m); return prev }, { replace: true })
  }

  const [score, setScore] = useState({ correct: 0, total: 0 })
  function addScore(delta: number) {
    setScore(s => ({ correct: s.correct + delta, total: s.total + 1 }))
  }

  const toggleClass = (c: AaClass) => {
    setSettings(s => {
      const next = s.classes.includes(c) ? s.classes.filter(x => x !== c) : [...s.classes, c]
      return { ...s, classes: next.length > 0 ? next : s.classes }
    })
  }
  const toggleMode = (m: SubMode) => {
    setSettings(s => {
      const next = s.modes.includes(m) ? s.modes.filter(x => x !== m) : [...s.modes, m]
      return { ...s, modes: next.length > 0 ? next : s.modes }
    })
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      {/* Mode segmented control */}
      {activeModes.length > 1 && (
        <div className="flex gap-1 p-1 rounded-sm print:hidden" style={{ background: 'rgb(var(--color-raised))' }}>
          {activeModes.map(m => (
            <button key={m} onClick={() => setMode(m)}
              className="flex-1 px-3 py-1.5 rounded-[3px] font-sans text-sm transition-colors"
              style={activeMode === m ? {
                background: 'rgb(var(--color-surface))',
                color: 'rgb(var(--overlay))',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
              } : {
                color: 'rgb(var(--color-secondary))',
              }}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>
      )}

      {/* Score bar */}
      {score.total > 0 && (
        <div className="flex items-center gap-3 print:hidden">
          <span className="font-mono text-sm text-secondary">
            Score: <span className="text-bright">{score.correct}</span>
            <span className="text-dim"> / {score.total}</span>
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgb(var(--color-raised))' }}>
            <motion.div className="h-full rounded-full" style={{ background: 'var(--c-halogen)' }}
              animate={{ width: `${(score.correct / score.total) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>
      )}

      {/* Active mode */}
      <AnimatePresence mode="wait">
        {activeMode === 'name' && (
          <NameMode key="name" settings={settings} allowHardMode={allowCustom} onScore={addScore} />
        )}
        {activeMode === 'draw' && (
          <DrawMode key="draw" settings={settings} onScore={addScore} />
        )}
        {activeMode === 'class' && (
          <ClassMode key="class" settings={settings} allowHardMode={allowCustom} onScore={addScore} />
        )}
      </AnimatePresence>

      {/* Settings (Problems mode only) */}
      {allowCustom && (
        <div className="print:hidden">
          <button onClick={() => setShowSettings(o => !o)}
            className="font-sans text-xs text-dim hover:text-secondary transition-colors">
            {showSettings ? '▲ Hide settings' : '▼ Settings'}
          </button>
          <AnimatePresence>
            {showSettings && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }} style={{ overflow: 'hidden' }}>
                <div className="mt-3 rounded-sm border border-border p-4 flex flex-col gap-4" style={{ background: 'rgb(var(--color-raised))' }}>

                  {/* Class filter */}
                  <div className="flex flex-col gap-2">
                    <span className="font-sans text-xs font-semibold text-secondary">Classes</span>
                    <div className="flex flex-wrap gap-2">
                      {ALL_CLASSES.map(c => {
                        const color = CLASS_COLORS[c]
                        const active = settings.classes.includes(c)
                        return (
                          <button key={c} onClick={() => toggleClass(c)}
                            className="px-3 py-1 rounded-full font-sans text-xs border transition-colors"
                            style={active ? {
                              background: `color-mix(in srgb, ${color} 18%, rgb(var(--color-raised)))`,
                              borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
                              color,
                            } : {
                              background: 'transparent',
                              borderColor: 'rgb(var(--color-border))',
                              color: 'rgb(var(--color-secondary))',
                            }}
                          >
                            {CLASS_LABELS[c]}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Mode filter */}
                  <div className="flex flex-col gap-2">
                    <span className="font-sans text-xs font-semibold text-secondary">Modes</span>
                    <div className="flex flex-wrap gap-2">
                      {ALL_MODES.map(m => {
                        const active = settings.modes.includes(m)
                        return (
                          <button key={m} onClick={() => toggleMode(m)}
                            className="px-3 py-1 rounded-full font-sans text-xs border transition-colors"
                            style={active ? {
                              background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                              borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                              color: 'var(--c-halogen)',
                            } : {
                              background: 'transparent',
                              borderColor: 'rgb(var(--color-border))',
                              color: 'rgb(var(--color-secondary))',
                            }}
                          >
                            {MODE_LABELS[m]}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div className="flex flex-col gap-2">
                    <span className="font-sans text-xs font-semibold text-secondary">Difficulty</span>
                    <div className="flex gap-2">
                      {(['easy', 'normal', 'hard'] as Difficulty[]).map(d => {
                        const active = settings.difficulty === d
                        return (
                          <button key={d} onClick={() => setSettings(s => ({ ...s, difficulty: d }))}
                            className="px-3 py-1 rounded-full font-sans text-xs border capitalize transition-colors"
                            style={active ? {
                              background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                              borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                              color: 'var(--c-halogen)',
                            } : {
                              background: 'transparent',
                              borderColor: 'rgb(var(--color-border))',
                              color: 'rgb(var(--color-secondary))',
                            }}
                          >
                            {d}
                          </button>
                        )
                      })}
                    </div>
                    <p className="font-sans text-xs text-dim leading-relaxed">
                      {settings.difficulty === 'easy' && 'Easy: 10 most common amino acids. Mode C shows structure + name.'}
                      {settings.difficulty === 'normal' && 'Normal: All 20 amino acids. Mode C shows structure + name. Mode A accepts name, 3L, or 1L code.'}
                      {settings.difficulty === 'hard' && 'Hard: All 20 amino acids. Mode C hides name. Mode A requires full name only.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
