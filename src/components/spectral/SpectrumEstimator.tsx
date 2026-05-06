import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Editor } from 'ketcher-react'
import ketcherCss from 'ketcher-react/dist/index.css?inline'
import type { Ketcher } from 'ketcher-core'
import { motion, AnimatePresence } from 'framer-motion'
import { getStructServiceProvider } from '../vsepr/structServiceProvider'
import { VSEPR_HIDDEN_BUTTONS, KETCHER_OVERRIDES_CSS_ID, KETCHER_OVERRIDES_CSS } from '../vsepr/ketcherConfig'
import SpectrumViewer from './SpectrumViewer'
import type { Peak } from './SpectrumViewer'
import SpectrumPrintSheet from './SpectrumPrintSheet'
import apiClient from '../../api/client'

const KETCHER_ESTIMATOR_CSS_ID = 'ketcher-estimator-css'

// ── Types ─────────────────────────────────────────────────────────────────────

interface EstimateResult {
  smiles: string
  molecular_formula: string
  molecular_weight: number
  degrees_unsaturation: number
  ir: Peak[]
  nmr_1h: Peak[]
  nmr_13c: Peak[]
  ms: Peak[]
  warnings?: string[]
}

type SpecTab = 'ir' | '1h' | '13c' | 'ms'

const SPEC_TABS: { id: SpecTab; label: string; formula: string }[] = [
  { id: 'ir',  label: 'IR',      formula: 'cm⁻¹' },
  { id: '1h',  label: '¹H NMR',  formula: 'δ ppm' },
  { id: '13c', label: '¹³C NMR', formula: '13C'   },
  { id: 'ms',  label: 'MS',      formula: 'm/z'   },
]

function tabPeaks(result: EstimateResult, tab: SpecTab): Peak[] {
  switch (tab) {
    case 'ir':  return result.ir
    case '1h':  return result.nmr_1h
    case '13c': return result.nmr_13c
    case 'ms':  return result.ms
  }
}

function tabViewerType(tab: SpecTab): 'ir' | '1h_nmr' | '13c_nmr' | 'mass_spec' {
  switch (tab) {
    case 'ir':  return 'ir'
    case '1h':  return '1h_nmr'
    case '13c': return '13c_nmr'
    case 'ms':  return 'mass_spec'
  }
}

// ── Ketcher canvas ────────────────────────────────────────────────────────────

interface KetcherCanvasHandle {
  getSmiles(): Promise<string | null>
  getSvgDataUrl(): Promise<string | null>
}

interface KetcherCanvasProps {
  width?: number
  height?: number
}

const KetcherCanvas = forwardRef<KetcherCanvasHandle, KetcherCanvasProps>(
  function KetcherCanvas({ width, height }, ref) {
    const ketcherRef = useRef<Ketcher | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [ready, setReady] = useState(false)

    useImperativeHandle(ref, () => ({
      async getSmiles(): Promise<string | null> {
        const k = ketcherRef.current
        if (!k) return null
        try {
          const smiles = await k.getSmiles()
          return smiles || null
        } catch {
          return null
        }
      },

      async getSvgDataUrl(): Promise<string | null> {
        const k = ketcherRef.current
        if (!k) return null
        try {
          const molfile = await k.getMolfile()
          const atomCount = parseInt((molfile.split('\n')[3] ?? '').substring(0, 3).trim(), 10) || 0
          if (atomCount === 0) return null

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const blob: Blob = await (k as any).generateImage(molfile, { outputFormat: 'image/svg+xml' })
          const arr = new Uint8Array(await blob.arrayBuffer())
          let binary = ''
          arr.forEach(b => { binary += String.fromCharCode(b) })
          return `data:${blob.type || 'image/svg+xml'};base64,${btoa(binary)}`
        } catch {
          // Fallback: grab largest SVG from DOM
          try {
            const container = containerRef.current
            if (!container) return null
            let largest: SVGSVGElement | null = null
            let maxArea = 0
            container.querySelectorAll<SVGSVGElement>('svg').forEach(s => {
              const r = s.getBoundingClientRect()
              const area = r.width * r.height
              if (area > maxArea) { maxArea = area; largest = s }
            })
            if (!largest) return null
            const el = largest as SVGSVGElement
            const clone = el.cloneNode(true) as SVGSVGElement
            const { width: w, height: h } = el.getBoundingClientRect()
            clone.setAttribute('width', String(w))
            clone.setAttribute('height', String(h))
            const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
            bg.setAttribute('width', '100%'); bg.setAttribute('height', '100%'); bg.setAttribute('fill', 'white')
            clone.insertBefore(bg, clone.firstChild)
            const svgStr = new XMLSerializer().serializeToString(clone)
            const encoded = new TextEncoder().encode(svgStr)
            let binary2 = ''
            encoded.forEach(b => { binary2 += String.fromCharCode(b) })
            return `data:image/svg+xml;base64,${btoa(binary2)}`
          } catch {
            return null
          }
        }
      },
    }))

    useEffect(() => {
      if (!document.getElementById(KETCHER_ESTIMATOR_CSS_ID)) {
        const style = document.createElement('style')
        style.id = KETCHER_ESTIMATOR_CSS_ID
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

    return (
      <div
        ref={containerRef}
        className="rounded-sm border border-border overflow-hidden"
        style={{ height: height ?? 420, width: width, position: 'relative' }}
      >
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center z-10"
            style={{ background: 'rgb(var(--color-surface))' }}>
            <span className="font-mono text-xs text-dim animate-pulse">Loading editor…</span>
          </div>
        )}
        <Editor
          staticResourcesUrl=""
          structServiceProvider={getStructServiceProvider()}
          errorHandler={(msg) => console.error('Ketcher:', msg)}
          buttons={VSEPR_HIDDEN_BUTTONS as never}
          disableMacromoleculesEditor
          onInit={(k: Ketcher) => {
            ketcherRef.current = k
            setReady(true)
          }}
        />
      </div>
    )
  }
)

// ── Main component ────────────────────────────────────────────────────────────

export default function SpectrumEstimator() {
  const canvasRef = useRef<KetcherCanvasHandle>(null)
  const outerRef = useRef<HTMLDivElement>(null)
  const [result, setResult] = useState<EstimateResult | null>(null)
  const [activeTab, setActiveTab] = useState<SpecTab>('ir')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [printing, setPrinting] = useState(false)
  const [structureSvg, setStructureSvg] = useState<string | null>(null)
  const [containerWidth, setContainerWidth] = useState(800)

  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      setContainerWidth(Math.floor(entries[0].contentRect.width))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  async function estimate() {
    if (!canvasRef.current) return
    setLoading(true)
    setError(null)
    try {
      const smiles = await canvasRef.current.getSmiles()
      if (!smiles?.trim()) {
        setError('Draw a compound first.')
        setLoading(false)
        return
      }
      const { data } = await apiClient.post<EstimateResult>('/spectral/estimate', { smiles })
      setResult(data)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Estimation failed. Try a simpler structure.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handlePrint() {
    if (!result || !canvasRef.current) return
    const svg = await canvasRef.current.getSvgDataUrl()
    setStructureSvg(svg)
    setPrinting(true)
    requestAnimationFrame(() => {
      window.print()
      setPrinting(false)
    })
  }

  const peaks = result ? tabPeaks(result, activeTab) : []

  return (
    <>
      {/* On-screen tool */}
      <div ref={outerRef} className="flex flex-col gap-4 print:hidden">

        {/* Disclaimer */}
        <p className="text-xs text-secondary">
          Draw a compound, then click <strong>Estimate</strong> to generate estimated IR, NMR, and MS spectra based on standard correlation tables.
        </p>

        {/* Top row: structure (fixed width) + metadata + actions */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="shrink-0">
            <KetcherCanvas ref={canvasRef} width={360} height={280} />
          </div>

          <div className="flex flex-col gap-3 flex-1 min-w-0">
            {/* Molecule summary */}
            {result ? (
              <div
                className="rounded-sm border border-border p-3 flex flex-wrap gap-x-5 gap-y-1 text-xs font-mono"
                style={{ background: 'rgb(var(--color-raised))' }}
              >
                <span><span className="text-dim">formula</span> {result.molecular_formula}</span>
                <span><span className="text-dim">MW</span> {result.molecular_weight.toFixed(2)}</span>
                <span><span className="text-dim">DoU</span> {result.degrees_unsaturation}</span>
              </div>
            ) : (
              <div
                className="rounded-sm border border-border p-3 text-xs font-mono text-dim"
                style={{ background: 'rgb(var(--color-raised))' }}
              >
                Draw a molecule and click Estimate to see formula, MW, and degree of unsaturation.
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-auto">
              <button
                onClick={estimate}
                disabled={loading}
                className="px-4 py-2 rounded-sm text-sm font-medium font-sans transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                  color: 'var(--c-halogen)',
                }}
              >
                {loading ? 'Estimating…' : 'Estimate spectra'}
              </button>

              {result && (
                <button
                  onClick={handlePrint}
                  className="px-3 py-2 rounded-sm text-sm font-medium font-sans transition-colors"
                  style={{
                    background: 'rgb(var(--color-raised))',
                    border: '1px solid rgba(var(--overlay),0.15)',
                    color: 'rgba(var(--overlay),0.6)',
                  }}
                >
                  ⎙ Print all spectra
                </button>
              )}
            </div>

            {error && (
              <p className="text-sm font-mono" style={{ color: 'rgb(var(--color-error))' }}>{error}</p>
            )}
          </div>
        </div>

        {/* Bottom: spectrum tabs + viewer + assignments (full width) */}
        {result && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-secondary">
              Estimated spectra based on standard correlation tables (Brown &amp; Foote). Real spectra may differ slightly.
            </p>

            {/* Spectrum tabs */}
            <div className="flex gap-1.5 flex-wrap print:hidden">
              {SPEC_TABS.map(t => {
                const active = t.id === activeTab
                return (
                  <motion.button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-medium border transition-colors"
                    style={active ? {
                      background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                      borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                      color: 'var(--c-halogen)',
                    } : {
                      background: 'transparent',
                      borderColor: 'rgba(var(--overlay),0.15)',
                      color: 'rgba(var(--overlay),0.5)',
                    }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  >
                    <span className="font-mono text-[9px]">{t.formula}</span>
                    {t.label}
                  </motion.button>
                )
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
                className="flex flex-col gap-3"
              >
                <SpectrumViewer
                  type={tabViewerType(activeTab)}
                  peaks={peaks}
                  width={containerWidth}
                  height={360}
                />

                {/* Peak assignment list */}
                {peaks.length > 0 && (
                  <div className="flex flex-col gap-0.5">
                    {peaks.map((p, i) => (
                      <div key={i} className="flex items-baseline gap-2 text-xs font-mono">
                        <span className="text-secondary w-16 shrink-0 text-right">
                          {activeTab === 'ir'
                            ? `${Math.round(p.x)} cm⁻¹`
                            : activeTab === 'ms'
                            ? `${Math.round(p.x)} m/z`
                            : `${p.x.toFixed(1)} ppm`}
                        </span>
                        {p.splitting && (
                          <span className="text-dim">
                            ({p.splitting}{p.integration ? `, ${p.integration}H` : ''})
                          </span>
                        )}
                        <span className="text-primary">{p.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {result.warnings && result.warnings.length > 0 && (
                  <p className="text-xs text-secondary italic">
                    Note: {result.warnings.join('; ')}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Print sheet — hidden on screen, shown only when printing */}
      {printing && result && (
        <SpectrumPrintSheet result={result} structureSvgUrl={structureSvg} />
      )}
    </>
  )
}
