import { useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import LewisEditor, { type LewisEditorHandle, type CanvasAtom, type CanvasBond } from '../lewis/LewisEditor'
import type { LewisStructure } from '../../pages/LewisPage'

export interface LewisSnapshot {
  atoms: CanvasAtom[]
  bonds: CanvasBond[]
}

interface Props {
  compound:        string
  structure:       LewisStructure
  reviewSnapshot?: LewisSnapshot
  onSubmit?:       (passed: boolean, snapshot: LewisSnapshot) => void
  onClose:         () => void
}

export default function LewisDrawModal({ compound, structure, reviewSnapshot, onSubmit, onClose }: Props) {
  const editorRef                   = useRef<LewisEditorHandle>(null)
  const structureRef                = useRef<LewisStructure>(structure)
  const [submitting, setSubmitting] = useState(false)
  const [emptyError, setEmptyError] = useState(false)
  const isReview = reviewSnapshot !== undefined

  structureRef.current = structure

  const requestStructure = useCallback(() => Promise.resolve(structureRef.current), [])

  async function handleSubmit() {
    if (!onSubmit || submitting) return
    setSubmitting(true)
    setEmptyError(false)
    try {
      const result = await editorRef.current?.submitSilently()
      if (!result) { setEmptyError(true); return }
      onSubmit(result.passed, { atoms: result.atoms, bonds: result.bonds })
      onClose()
    } finally { setSubmitting(false) }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-6 px-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-3xl rounded-sm border border-border flex flex-col"
        style={{ background: '#0e1016' }}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xs text-secondary tracking-widest uppercase">
              {isReview ? 'Your submitted drawing' : 'Draw the Lewis structure'}
            </span>
            <span className="font-sans font-semibold text-bright">{compound}</span>
          </div>
          <button onClick={onClose} className="font-mono text-xs text-dim hover:text-primary transition-colors px-1">
            ✕ close
          </button>
        </div>

        {/* Editor */}
        <div className="px-5 pt-4 pb-2">
          <LewisEditor
            ref={isReview ? undefined : editorRef}
            correctStructure={structure}
            onRequestStructure={requestStructure}
            initialAtoms={reviewSnapshot?.atoms}
            initialBonds={reviewSnapshot?.bonds}
            hideCheck={!isReview}
            canvasHeight={360}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 pb-4 pt-1">
          {isReview ? (
            <p className="font-mono text-xs text-dim">This is your submitted drawing — edits here are not saved.</p>
          ) : (
            <>
              <button onClick={handleSubmit} disabled={submitting}
                className="px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 15%, #141620)',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                  color: 'var(--c-halogen)',
                }}>
                {submitting ? 'Submitting…' : 'Submit Drawing'}
              </button>
              {emptyError && <span className="font-mono text-xs text-rose-400">Nothing drawn yet.</span>}
              <span className="font-mono text-xs text-dim ml-auto">Result shown after Check All</span>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
