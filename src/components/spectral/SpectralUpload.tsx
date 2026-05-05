import { useState, useRef, useCallback } from 'react'
import SpectrumViewer from './SpectrumViewer'
import type { Peak } from './SpectrumViewer'

type SpecType = 'ir' | '1h_nmr' | '13c_nmr' | 'mass_spec'

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

const ACCEPTED_EXT = ['.dx', '.jcamp', '.csv']

export default function SpectralUpload() {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [specType, setSpecType] = useState<SpecType>('ir')
  const [peaks, setPeaks] = useState<Peak[]>([])
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function validateFile(f: File): string | null {
    const name = f.name.toLowerCase()
    if (!ACCEPTED_EXT.some(ext => name.endsWith(ext))) {
      return `Unsupported format. Please upload a .dx, .jcamp, or .csv file.`
    }
    if (f.size > 5 * 1024 * 1024) {
      return 'File too large. Maximum size is 5 MB.'
    }
    return null
  }

  const handleFile = useCallback((f: File) => {
    const err = validateFile(f)
    if (err) { setError(err); return }
    setError(null)
    setFile(f)
    setPeaks([])
    setResult(null)
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
    if (!file || analyzing) return
    setAnalyzing(true)
    setError(null)
    try {
      const body = JSON.stringify({
        type: specType,
        peaks,
      })
      const res = await fetch('/api/spectral/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `Server error ${res.status}`)
      }
      const data: AnalysisResult = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

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
          background: dragging ? 'color-mix(in srgb, var(--c-halogen) 6%, rgb(var(--color-surface)))' : 'rgb(var(--color-surface))',
        }}>
        <span className="font-mono text-2xl text-dim">⬆</span>
        <span className="font-sans text-sm text-secondary">
          Drop a spectral file here or <span style={{ color: 'var(--c-halogen)' }}>browse</span>
        </span>
        <span className="font-mono text-xs text-dim">.dx  .jcamp  .csv</span>
        <input ref={inputRef} type="file" accept=".dx,.jcamp,.csv" className="hidden" onChange={onInputChange} />
      </div>

      {error && (
        <p className="font-mono text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-sm px-3 py-2">{error}</p>
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

          {/* Preview (empty until parsed) */}
          {peaks.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="font-mono text-xs text-secondary">Parsed spectrum preview:</p>
              <SpectrumViewer type={specType} peaks={peaks} width={520} height={200} />
            </div>
          )}

          {peaks.length === 0 && (
            <div className="rounded-sm border border-border bg-raised flex items-center justify-center h-24 text-xs font-mono text-dim">
              Spectrum preview will appear after parsing (JCAMP-DX/CSV parsing not yet implemented)
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="self-start px-4 py-1.5 rounded-sm border text-sm font-sans font-medium transition-colors disabled:opacity-40"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
              borderColor: 'color-mix(in srgb, var(--c-halogen) 28%, transparent)',
              color: 'var(--c-halogen)',
            }}>
            {analyzing ? 'Analyzing…' : 'Analyze'}
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
                      background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                      borderColor: 'color-mix(in srgb, var(--c-halogen) 25%, transparent)',
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
                  {/* Confidence bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
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
