import { useEffect, useState } from 'react'
import client from '../../api/client'

interface CompoundDisplayProps {
  /** Pre-rendered SVG string. When provided, renders inline without fetching. */
  svg?: string
  /** SMILES string — triggers a POST /api/structure/render call. */
  smiles?: string
  /** Display label below the structure (or as fallback when rendering fails). */
  label?: string
  /** Width in pixels. Default 200. */
  width?: number
  /** Height in pixels. Default 150. */
  height?: number
  /** When true, lone pairs are drawn on heteroatoms. Default false. */
  showLonePairs?: boolean
}

// Module-level cache so the same SMILES is never fetched twice per session.
const svgCache = new Map<string, string>()

export default function CompoundDisplay({
  svg: svgProp,
  smiles,
  label,
  width = 200,
  height = 150,
  showLonePairs = false,
}: CompoundDisplayProps) {
  const [resolvedSvg, setResolvedSvg] = useState<string | null>(svgProp ?? null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>(
    svgProp || !smiles ? 'idle' : 'loading'
  )

  useEffect(() => {
    if (!smiles || svgProp) return

    const key = `${smiles}|${width}|${height}|${showLonePairs}`
    const cached = svgCache.get(key)
    if (cached) {
      setResolvedSvg(cached)
      setStatus('idle')
      return
    }

    setStatus('loading')
    let cancelled = false

    client
      .post<{ svg: string }>('/structure/render', { smiles, width, height, showLonePairs })
      .then(res => {
        if (!cancelled && res.data.svg) {
          svgCache.set(key, res.data.svg)
          setResolvedSvg(res.data.svg)
          setStatus('idle')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => { cancelled = true }
  }, [smiles, width, height, showLonePairs, svgProp])

  if (resolvedSvg) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div
          style={{ width, height }}
          className="flex items-center justify-center text-primary"
          dangerouslySetInnerHTML={{ __html: resolvedSvg }}
        />
        {label && <span className="font-sans text-xs text-secondary text-center">{label}</span>}
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center gap-1">
        <div
          className="rounded-sm border border-border animate-pulse"
          style={{ width, height, background: 'rgb(var(--color-raised))' }}
        />
        {label && <span className="font-sans text-xs text-secondary text-center">{label}</span>}
      </div>
    )
  }

  // Fallback: no SMILES, no SVG, or fetch error
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="flex items-center justify-center rounded-sm border border-border font-mono text-sm text-primary text-center p-2"
        style={{ width, height, background: 'rgb(var(--color-surface))' }}
      >
        {label ?? smiles ?? '—'}
      </div>
    </div>
  )
}
