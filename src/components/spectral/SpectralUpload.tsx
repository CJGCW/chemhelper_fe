import { useState, useRef, useCallback } from 'react'
import SpectrumViewer from './SpectrumViewer'
import type { Peak } from './SpectrumViewer'

type SpecType = 'ir' | '1h_nmr' | '13c_nmr' | 'mass_spec'
type UploadMode = 'data' | 'image'

interface Candidate {
  name: string
  formula: string
  confidence: number
  matched_groups: string[]
}

interface AnalysisResult {
  functional_groups: string[]
  candidates: Candidate[]
}

const TYPE_LABELS: Record<SpecType, string> = {
  ir: 'IR',
  '1h_nmr': '¹H NMR',
  '13c_nmr': '¹³C NMR',
  mass_spec: 'Mass Spec',
}

const ACCEPTED_DATA_EXT = ['.dx', '.jcamp', '.csv']
const ACCEPTED_IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp']

function validateFile(f: File): { mode: UploadMode; error: string | null } {
  const name = f.name.toLowerCase()
  if (ACCEPTED_DATA_EXT.some(ext => name.endsWith(ext))) {
    if (f.size > 5 * 1024 * 1024) return { mode: 'data', error: 'File too large. Maximum size is 5 MB.' }
    return { mode: 'data', error: null }
  }
  if (ACCEPTED_IMAGE_EXT.some(ext => name.endsWith(ext))) {
    if (f.size > 10 * 1024 * 1024) return { mode: 'image', error: 'Image too large. Maximum size is 10 MB.' }
    return { mode: 'image', error: null }
  }
  return { mode: 'data', error: 'Unsupported format. Upload a .dx, .jcamp, or .csv data file, or a .jpg/.png/.webp image.' }
}

// ── Peak entry form for manual entry from image ───────────────────────────────

interface PeakEntryFormProps {
  specType: SpecType
  peaks: Peak[]
  onChange: (peaks: Peak[]) => void
}

function PeakEntryForm({ specType, peaks, onChange }: PeakEntryFormProps) {
  const [draftX, setDraftX] = useState('')
  const [draftLabel, setDraftLabel] = useState('')
  const [draftIntegration, setDraftIntegration] = useState('')
  const [draftSplitting, setDraftSplitting] = useState<'s' | 'd' | 't' | 'q' | 'm' | ''>('')

  const xLabel = specType === 'ir' ? 'cm⁻¹' : specType === 'mass_spec' ? 'm/z' : 'ppm'
  const xPlaceholder = specType === 'ir' ? '1715' : specType === 'mass_spec' ? '58' : '2.1'

  function addPeak() {
    const x = parseFloat(draftX)
    if (isNaN(x)) return
    const newPeak: Peak = {
      x,
      y: 100,
      label: draftLabel || '',
      width: specType === 'ir' ? 40 : specType === 'mass_spec' ? 2 : 0.08,
      ...(specType === '1h_nmr' && {
        integration: parseInt(draftIntegration, 10) || undefined,
        splitting: draftSplitting || undefined,
      }),
    }
    onChange([...peaks, newPeak])
    setDraftX(''); setDraftLabel(''); setDraftIntegration(''); setDraftSplitting('')
  }

  function removePeak(idx: number) {
    onChange(peaks.filter((_, i) => i !== idx))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') addPeak()
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 items-end p-3 rounded-sm border border-border"
        style={{ background: 'rgb(var(--color-surface))' }}>
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] text-dim uppercase tracking-widest">{xLabel}</label>
          <input value={draftX} onChange={e => setDraftX(e.target.value)} onKeyDown={handleKeyDown}
            inputMode="decimal" placeholder={xPlaceholder}
            className="px-2 py-1 w-20 rounded-sm border border-border font-mono text-sm text-primary"
            style={{ background: 'rgb(var(--color-raised))' }} />
        </div>

        {specType === '1h_nmr' && (
          <>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] text-dim uppercase tracking-widest">Integration</label>
              <input value={draftIntegration} onChange={e => setDraftIntegration(e.target.value)} onKeyDown={handleKeyDown}
                inputMode="numeric" placeholder="3"
                className="px-2 py-1 w-16 rounded-sm border border-border font-mono text-sm text-primary"
                style={{ background: 'rgb(var(--color-raised))' }} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] text-dim uppercase tracking-widest">Splitting</label>
              <select value={draftSplitting} onChange={e => setDraftSplitting(e.target.value as typeof draftSplitting)}
                className="px-2 py-1 rounded-sm border border-border font-mono text-sm text-primary"
                style={{ background: 'rgb(var(--color-raised))' }}>
                <option value="">—</option>
                <option value="s">s</option>
                <option value="d">d</option>
                <option value="t">t</option>
                <option value="q">q</option>
                <option value="m">m</option>
              </select>
            </div>
          </>
        )}

        <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
          <label className="font-mono text-[10px] text-dim uppercase tracking-widest">Label (optional)</label>
          <input value={draftLabel} onChange={e => setDraftLabel(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={specType === 'ir' ? 'C=O stretch' : specType === 'mass_spec' ? 'M⁺' : 'CH₃'}
            className="px-2 py-1 rounded-sm border border-border text-sm text-primary"
            style={{ background: 'rgb(var(--color-raised))' }} />
        </div>

        <button onClick={addPeak} disabled={!draftX}
          className="px-4 py-2 rounded-sm font-sans text-sm font-medium transition-colors disabled:opacity-40"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            color: 'var(--c-halogen)',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
          }}>
          + Add peak
        </button>
      </div>

      {peaks.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="font-mono text-[10px] text-dim uppercase tracking-widest">
            Entered peaks ({peaks.length})
          </p>
          <ul className="flex flex-col gap-1">
            {peaks.map((p, i) => (
              <li key={i} className="flex items-center gap-2 px-2 py-1 rounded-sm border border-border text-xs font-mono"
                style={{ background: 'rgb(var(--color-surface))' }}>
                <span className="text-primary">{p.x}</span>
                <span className="text-dim">{xLabel}</span>
                {p.splitting && (
                  <span className="text-secondary">
                    ({p.splitting}{p.integration ? `, ${p.integration}H` : ''})
                  </span>
                )}
                {p.label && <span className="text-secondary">: {p.label}</span>}
                <button onClick={() => removePeak(i)}
                  className="ml-auto transition-colors"
                  style={{ color: 'rgb(var(--color-error))' }}
                  aria-label="Remove peak">×</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SpectralUpload() {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<UploadMode>('data')
  const [specType, setSpecType] = useState<SpecType>('ir')
  const [peaks, setPeaks] = useState<Peak[]>([])
  const [manualPeaks, setManualPeaks] = useState<Peak[]>([])
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File) => {
    const { mode: detectedMode, error: err } = validateFile(f)
    if (err) { setError(err); return }
    setError(null)
    setFile(f)
    setMode(detectedMode)
    setPeaks([])
    setManualPeaks([])
    setResult(null)

    if (detectedMode === 'image') {
      const reader = new FileReader()
      reader.onload = e => setImageDataUrl(e.target?.result as string)
      reader.readAsDataURL(f)
    } else {
      setImageDataUrl(null)
    }
  }, [])

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  async function handleAnalyze() {
    if (analyzing) return
    const peaksToSend = mode === 'image' ? manualPeaks : peaks
    if (peaksToSend.length === 0) {
      setError('Add at least one peak before analyzing.')
      return
    }
    setAnalyzing(true)
    setError(null)
    try {
      const res = await fetch('/api/spectral/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: specType, peaks: peaksToSend }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as Record<string, string>).error ?? `Server error ${res.status}`)
      }
      const data: AnalysisResult = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const peaksForAnalysis = mode === 'image' ? manualPeaks : peaks

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className="rounded-sm border-2 border-dashed cursor-pointer flex flex-col items-center gap-2 py-8 px-4 transition-colors"
        style={{
          borderColor: dragging ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.2)',
          background: dragging
            ? 'color-mix(in srgb, var(--c-halogen) 6%, rgb(var(--color-surface)))'
            : 'rgb(var(--color-surface))',
        }}>
        <span className="font-mono text-2xl text-dim">⬆</span>
        <p className="font-sans text-sm text-secondary">
          Drag and drop a spectrum file or click to browse
        </p>
        <p className="font-mono text-xs text-dim">
          Data files: .dx  .jcamp  .csv  •  Images: .jpg  .png  .webp
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.dx,.jcamp,.csv"
          capture="environment"
          className="hidden"
          onChange={onInputChange}
        />
      </div>

      {error && (
        <p className="font-mono text-xs rounded-sm px-3 py-2 border"
          style={{ color: 'rgb(var(--color-error))', background: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.2)' }}>
          {error}
        </p>
      )}

      {/* File info + type selector */}
      {file && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-primary font-medium">{file.name}</span>
            <span className="text-dim">{(file.size / 1024).toFixed(1)} KB</span>
            <span className="text-secondary">{file.name.split('.').pop()?.toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-secondary">Spectrum type:</span>
            <select
              value={specType}
              onChange={e => setSpecType(e.target.value as SpecType)}
              className="border border-border rounded-sm px-2 py-1 bg-surface text-primary font-mono text-xs">
              {(Object.keys(TYPE_LABELS) as SpecType[]).map(t => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {/* Data file: spectrum preview */}
          {mode === 'data' && (
            <>
              {peaks.length > 0 ? (
                <div className="flex flex-col gap-1">
                  <p className="font-mono text-xs text-secondary">Parsed spectrum preview:</p>
                  <SpectrumViewer type={specType} peaks={peaks} width={520} height={200} />
                </div>
              ) : (
                <div className="rounded-sm border border-border flex items-center justify-center h-24 text-xs font-mono text-dim"
                  style={{ background: 'rgb(var(--color-raised))' }}>
                  Spectrum preview will appear after parsing (JCAMP-DX/CSV parsing not yet implemented)
                </div>
              )}
            </>
          )}

          {/* Image file: show image + manual peak entry */}
          {mode === 'image' && imageDataUrl && (
            <div className="flex flex-col gap-3">
              <div className="border border-border rounded-sm overflow-hidden">
                <img
                  src={imageDataUrl}
                  alt="Uploaded spectrum"
                  className="w-full h-auto max-h-[480px] object-contain"
                  style={{ background: 'white' }}
                />
              </div>
              <p className="text-xs text-secondary">
                Read the peaks from the image and enter them below. The analysis tool will identify
                functional groups from the peaks you provide.
              </p>
              <PeakEntryForm specType={specType} peaks={manualPeaks} onChange={setManualPeaks} />
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={analyzing || peaksForAnalysis.length === 0}
            className="self-start px-4 py-1.5 rounded-sm border text-sm font-sans font-medium transition-colors disabled:opacity-40"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
              borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)',
              color: 'var(--c-halogen)',
            }}>
            {analyzing
              ? 'Analyzing…'
              : peaksForAnalysis.length > 0
              ? `Analyze ${peaksForAnalysis.length} peak${peaksForAnalysis.length !== 1 ? 's' : ''}`
              : 'Analyze'}
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="flex flex-col gap-4">
          {result.functional_groups.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="font-mono text-xs text-secondary uppercase tracking-widest">Detected Functional Groups</p>
              <div className="flex flex-wrap gap-2">
                {result.functional_groups.map(g => (
                  <span key={g}
                    className="font-mono text-xs px-2 py-0.5 rounded-sm border"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                      borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                      color: 'var(--c-halogen)',
                    }}>
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.candidates.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="font-mono text-xs text-secondary uppercase tracking-widest">Candidate Compounds</p>
              {result.candidates.map((c, i) => (
                <div key={i}
                  className="rounded-sm border border-border p-3 flex flex-col gap-2"
                  style={{ background: 'rgb(var(--color-raised))' }}>
                  <div className="flex items-baseline gap-2">
                    <span className="font-sans font-semibold text-sm text-primary">{c.name}</span>
                    <span className="font-mono text-xs text-secondary">{c.formula}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgb(var(--color-border))' }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${c.confidence}%`, background: 'var(--c-halogen)' }} />
                    </div>
                    <span className="font-mono text-xs text-secondary w-8 text-right">
                      {c.confidence.toFixed(0)}%
                    </span>
                  </div>
                  {c.matched_groups.length > 0 && (
                    <p className="font-mono text-xs text-dim">Matched: {c.matched_groups.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {result.functional_groups.length === 0 && result.candidates.length === 0 && (
            <p className="font-mono text-xs text-dim">No identifications returned (backend analysis not yet implemented).</p>
          )}
        </div>
      )}
    </div>
  )
}
