import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Editor } from 'ketcher-react'
import { ChemicalMimeType } from 'ketcher-core'
import ketcherCss from 'ketcher-react/dist/index.css?inline'
import type { Ketcher } from 'ketcher-core'
import type { LewisStructure } from '../../pages/LewisPage'
import { getStructServiceProvider } from '../vsepr/structServiceProvider'
import {
  VSEPR_HIDDEN_BUTTONS,
  KETCHER_OVERRIDES_CSS_ID,
  KETCHER_OVERRIDES_CSS,
} from '../vsepr/ketcherConfig'

// ── Helpers (mirrored from KetcherStructureEditor) ────────────────────────────

const KETCHER_CSS_ID = 'ketcher-react-css'

function lewisToMol(ls: LewisStructure): string {
  const atomIdx: Record<string, number> = {}
  ls.atoms.forEach((a, i) => { atomIdx[a.id] = i + 1 })
  const header    = '\n  ChemHelper\n\n'
  const counts    = `${String(ls.atoms.length).padStart(3)}${String(ls.bonds.length).padStart(3)}  0  0  0  0  0  0  0  0999 V2000`
  const atomBlock = ls.atoms.map(a =>
    `    0.0000    0.0000    0.0000 ${a.element.padEnd(3)} 0  0  0  0  0  0  0  0  0  0  0  0`
  ).join('\n')
  const bondBlock = ls.bonds.map(b =>
    `${String(atomIdx[b.from]).padStart(3)}${String(atomIdx[b.to]).padStart(3)}${String(b.order).padStart(3)}  0`
  ).join('\n')
  const charged = ls.atoms.filter(a => a.formal_charge !== 0)
  let chgLines = ''
  for (let i = 0; i < charged.length; i += 8) {
    const chunk   = charged.slice(i, i + 8)
    const entries = chunk.map(a =>
      `${String(atomIdx[a.id]).padStart(4)}${String(a.formal_charge).padStart(4)}`
    ).join('')
    chgLines += `M  CHG${String(chunk.length).padStart(3)}${entries}\n`
  }
  return `${header}${counts}\n${atomBlock}\n${bondBlock}\n${chgLines}M  END\n`
}

function inchiConnectivity(inchi: string): string {
  return inchi.split('/').filter(part => !/^[btms]/.test(part)).join('/')
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  compound:    string
  structure:   LewisStructure   // correct answer for comparison
  reviewMol?:  string           // if set: review mode — show this mol, no submit
  onSubmit?:   (mol: string, passed: boolean) => void
  onClose:     () => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function VseprDrawModal({ compound, structure, reviewMol, onSubmit, onClose }: Props) {
  const ketcherRef              = useRef<Ketcher | null>(null)
  const [ready, setReady]       = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [emptyError, setEmptyError] = useState(false)
  const isReview = reviewMol !== undefined

  // Inject Ketcher CSS + VSEPR overrides (same as KetcherStructureEditor)
  useEffect(() => {
    if (!document.getElementById(KETCHER_CSS_ID)) {
      const style = document.createElement('style')
      style.id = KETCHER_CSS_ID
      style.textContent = `@layer ketcher { ${ketcherCss} }`
      document.head.appendChild(style)
    }
    if (!document.getElementById(KETCHER_OVERRIDES_CSS_ID)) {
      const style = document.createElement('style')
      style.id = KETCHER_OVERRIDES_CSS_ID
      style.textContent = KETCHER_OVERRIDES_CSS
      document.head.appendChild(style)
    }
  }, [])

  // Load mol once Ketcher is ready
  useEffect(() => {
    if (!ready || !ketcherRef.current) return
    const mol = reviewMol ?? ''
    ketcherRef.current.setMolecule(mol)
  }, [ready, reviewMol])

  async function handleSubmit() {
    if (!ketcherRef.current || !onSubmit || submitting) return
    setSubmitting(true)
    setEmptyError(false)
    try {
      const ketcher = ketcherRef.current
      const mol     = await ketcher.getMolfile()

      // Empty check
      const atomCount = parseInt((mol.split('\n')[3] ?? '').substring(0, 3).trim(), 10) || 0
      if (atomCount === 0) {
        setEmptyError(true)
        return
      }

      // InChI comparison — compute at submit time, display deferred to Check All
      let passed = false
      try {
        const [userInchi, correctConvert] = await Promise.all([
          ketcher.getInchi(),
          ketcher.indigo.convert(lewisToMol(structure), { outputFormat: ChemicalMimeType.InChI }),
        ])
        const userConn    = inchiConnectivity(userInchi)
        const correctConn = inchiConnectivity(correctConvert.struct)
        passed = userConn === correctConn && userConn !== ''
      } catch {
        // If comparison fails, treat as incorrect
      }

      onSubmit(mol, passed)
      onClose()
    } finally {
      setSubmitting(false)
    }
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
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xs text-dim tracking-wider uppercase">
              {isReview ? 'Your submitted drawing' : 'Draw the structure'}
            </span>
            <span className="font-sans font-semibold text-bright">{compound}</span>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-xs text-dim hover:text-primary transition-colors px-1"
          >
            ✕ close
          </button>
        </div>

        {/* Editor */}
        <div className="px-5 pt-4 pb-2">
          <div
            className="rounded-sm border border-border overflow-hidden"
            style={{ height: 480, position: 'relative' }}
          >
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center z-10"
                style={{ background: '#0e1016' }}>
                <span className="font-mono text-xs text-dim animate-pulse">Loading editor…</span>
              </div>
            )}
            <Editor
              staticResourcesUrl=""
              structServiceProvider={getStructServiceProvider()}
              errorHandler={(msg) => console.error('Ketcher:', msg)}
              buttons={VSEPR_HIDDEN_BUTTONS as never}
              disableMacromoleculesEditor
              onInit={(ketcher: Ketcher) => {
                ketcherRef.current = ketcher
                setReady(true)
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 pb-4 pt-1">
          {isReview ? (
            <p className="font-mono text-xs text-dim">
              This is your submitted drawing — edits here are not saved.
            </p>
          ) : (
            <>
              <button
                onClick={handleSubmit}
                disabled={!ready || submitting}
                className="px-5 py-2 rounded-sm font-sans text-sm font-medium
                           transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 15%, #141620)',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                  color: 'var(--c-halogen)',
                }}
              >
                {submitting ? 'Submitting…' : 'Submit Drawing'}
              </button>
              {emptyError && (
                <span className="font-mono text-xs text-rose-400">Nothing drawn yet.</span>
              )}
              <span className="font-mono text-xs text-dim ml-auto">
                Result shown after Check All
              </span>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
