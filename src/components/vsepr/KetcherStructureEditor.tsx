import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Editor } from 'ketcher-react'
import { ChemicalMimeType } from 'ketcher-core'
import ketcherCss from 'ketcher-react/dist/index.css?inline'
import type { Ketcher } from 'ketcher-core'
import type { LewisStructure } from '../../pages/LewisPage'

import { getStructServiceProvider } from './structServiceProvider'
import {
  VSEPR_HIDDEN_BUTTONS,
  KETCHER_OVERRIDES_CSS_ID,
  KETCHER_OVERRIDES_CSS,
} from './ketcherConfig'

// ── Geometries that need wedge/dash bonds ─────────────────────────────────────

const FLAT_GEOMETRIES = new Set([
  'linear', 'diatomic', 'trigonal_planar', 'bent',
])

// ── Build MOL V2000 from LewisStructure (for Indigo InChI conversion) ─────────

function lewisToMol(ls: LewisStructure): string {
  const atomIdx: Record<string, number> = {}
  ls.atoms.forEach((a, i) => { atomIdx[a.id] = i + 1 })

  const header = '\n  ChemHelper\n\n'
  const counts = `${String(ls.atoms.length).padStart(3)}${String(ls.bonds.length).padStart(3)}  0  0  0  0  0  0  0  0999 V2000`

  const atomBlock = ls.atoms.map(a =>
    `    0.0000    0.0000    0.0000 ${a.element.padEnd(3)} 0  0  0  0  0  0  0  0  0  0  0  0`
  ).join('\n')

  const bondBlock = ls.bonds.map(b =>
    `${String(atomIdx[b.from]).padStart(3)}${String(atomIdx[b.to]).padStart(3)}${String(b.order).padStart(3)}  0`
  ).join('\n')

  // Formal charges via M CHG property lines (max 8 entries each)
  const charged = ls.atoms.filter(a => a.formal_charge !== 0)
  let chgLines = ''
  for (let i = 0; i < charged.length; i += 8) {
    const chunk = charged.slice(i, i + 8)
    const entries = chunk.map(a =>
      `${String(atomIdx[a.id]).padStart(4)}${String(a.formal_charge).padStart(4)}`
    ).join('')
    chgLines += `M  CHG${String(chunk.length).padStart(3)}${entries}\n`
  }

  return `${header}${counts}\n${atomBlock}\n${bondBlock}\n${chgLines}M  END\n`
}

// ── MOL V2000 parser — atom positions + wedge/dash stereo ────────────────────

interface AtomPos2D { x: number; y: number }
interface Bond2D    { a1: number; a2: number }

function parseMolfile2D(molfile: string): { atoms: AtomPos2D[]; bonds: Bond2D[] } | null {
  try {
    const lines = molfile.split('\n')
    const countsLine = lines[3]
    if (!countsLine) return null
    const atomCount = parseInt(countsLine.substring(0, 3).trim(), 10)
    const bondCount = parseInt(countsLine.substring(3, 6).trim(), 10)
    if (isNaN(atomCount) || isNaN(bondCount)) return null

    const atoms: AtomPos2D[] = []
    for (let i = 0; i < atomCount; i++) {
      const line = lines[4 + i] ?? ''
      atoms.push({
        x: parseFloat(line.substring(0, 10).trim()),
        y: parseFloat(line.substring(10, 20).trim()),
      })
    }

    const bonds: Bond2D[] = []
    for (let i = 0; i < bondCount; i++) {
      const line = lines[4 + atomCount + i] ?? ''
      bonds.push({
        a1: parseInt(line.substring(0, 3).trim(), 10) - 1,
        a2: parseInt(line.substring(3, 6).trim(), 10) - 1,
      })
    }
    return { atoms, bonds }
  } catch {
    return null
  }
}

function checkMolGeometry(
  molfile: string,
  geometry: string,
): { passed: boolean; detail: string } | null {
  // Only check geometries that are purely 2D (no wedge/dash expected)
  if (!FLAT_GEOMETRIES.has(geometry)) return null

  const parsed = parseMolfile2D(molfile)
  if (!parsed) return null
  const { atoms, bonds } = parsed
  if (atoms.length < 3) return null  // diatomic: nothing to check

  // Find centre = atom with most connections
  const deg = new Array(atoms.length).fill(0)
  for (const b of bonds) { deg[b.a1]++; deg[b.a2]++ }
  const maxDeg  = Math.max(...deg)
  const centerIdx = deg.indexOf(maxDeg)
  const center  = atoms[centerIdx]

  // Terminal indices
  const termIdxs = bonds
    .filter(b => b.a1 === centerIdx || b.a2 === centerIdx)
    .map(b => b.a1 === centerIdx ? b.a2 : b.a1)

  if (termIdxs.length < 2) return null

  function angleBetween(i: number, j: number): number {
    const ax = atoms[i].x - center.x, ay = atoms[i].y - center.y
    const bx = atoms[j].x - center.x, by = atoms[j].y - center.y
    const magA = Math.sqrt(ax*ax + ay*ay)
    const magB = Math.sqrt(bx*bx + by*by)
    if (magA < 1e-6 || magB < 1e-6) return 0
    const cosθ = Math.max(-1, Math.min(1, (ax*bx + ay*by) / (magA * magB)))
    return Math.acos(cosθ) * 180 / Math.PI
  }

  const angles: number[] = []
  for (let i = 0; i < termIdxs.length; i++)
    for (let j = i + 1; j < termIdxs.length; j++)
      angles.push(angleBetween(termIdxs[i], termIdxs[j]))

  const maxAngle = Math.max(...angles)
  const minAngle = Math.min(...angles)

  if (geometry === 'linear' || geometry === 'diatomic') {
    if (maxAngle >= 150) return { passed: true,  detail: 'Linear geometry confirmed' }
    return { passed: false, detail: `Should be linear — drawn angle is ~${Math.round(maxAngle)}° (expected ~180°)` }
  }

  if (geometry === 'bent') {
    if (maxAngle < 160) return { passed: true,  detail: 'Bent geometry confirmed' }
    return { passed: false, detail: `Should be bent — drawn angle is ~${Math.round(maxAngle)}° (expected <160°)` }
  }

  if (geometry === 'trigonal_planar') {
    if (maxAngle < 165 && minAngle >= 55)
      return { passed: true, detail: 'Trigonal planar geometry confirmed' }
    if (maxAngle >= 165)
      return { passed: false, detail: `Should be trigonal planar — one pair of bonds is nearly collinear (~${Math.round(maxAngle)}°); all angles should be ~120°` }
    return { passed: false, detail: `Should be trigonal planar — check bond angles (expected ~120°)` }
  }

  return null
}

function molHas3DBonds(molfile: string): boolean {
  try {
    const lines = molfile.split('\n')
    const countsLine = lines[3]
    if (!countsLine) return false
    const atomCount = parseInt(countsLine.substring(0, 3).trim(), 10)
    const bondCount = parseInt(countsLine.substring(3, 6).trim(), 10)
    if (isNaN(atomCount) || isNaN(bondCount)) return false
    for (let i = 0; i < bondCount; i++) {
      const line = lines[4 + atomCount + i] ?? ''
      const stereo = parseInt(line.substring(9, 12).trim(), 10) || 0
      if (stereo === 1 || stereo === 6) return true  // 1=wedge, 6=dash
    }
    return false
  } catch {
    return false
  }
}

// ── InChI helpers ─────────────────────────────────────────────────────────────

// Strip stereo layers (/b /t /m /s) for connectivity-only comparison
function inchiConnectivity(inchi: string): string {
  return inchi.split('/').filter(part => !/^[btms]/.test(part)).join('/')
}

// ── Validation types ──────────────────────────────────────────────────────────

interface ValidationCheck  { label: string; passed: boolean; detail: string }
export interface ValidationResult { passed: boolean; checks: ValidationCheck[] }

// ── Handle (imperative API for CombinedSection) ───────────────────────────────

export interface KetcherEditorHandle {
  getSvg(): Promise<string | null>
  triggerCheck(): Promise<ValidationResult | null>
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  correctStructure: LewisStructure | null
  onValidated?: (passed: boolean) => void
  resetKey?: number
  showCheck?: boolean  // default true; pass false to hide the button+result panel
}

// ── Component ─────────────────────────────────────────────────────────────────

const KETCHER_CSS_ID = 'ketcher-react-css'

const KetcherStructureEditor = forwardRef<KetcherEditorHandle, Props>(
function KetcherStructureEditor({ correctStructure, onValidated, resetKey, showCheck = true }, ref) {
  const ketcherRef              = useRef<Ketcher | null>(null)
  const containerRef            = useRef<HTMLDivElement>(null)
  const checkingRef             = useRef(false)
  const [checking, setChecking] = useState(false)
  const [result, setResult]     = useState<ValidationResult | null>(null)
  const [ready, setReady]       = useState(false)

  useImperativeHandle(ref, () => ({
    async getSvg(): Promise<string | null> {
      const ketcher = ketcherRef.current
      if (!ketcher) return null

      // Check canvas isn't empty
      try {
        const molfile = await ketcher.getMolfile()
        const atomCount = parseInt((molfile.split('\n')[3] ?? '').substring(0, 3).trim(), 10) || 0
        if (atomCount === 0) return null
      } catch {
        return null
      }

      // Primary: generateImage API → proper base64 data URL regardless of returned format
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blob: Blob = await (ketcher as any).generateImage(
          await ketcher.getMolfile(),
          { outputFormat: 'image/svg+xml' },
        )
        const arr = new Uint8Array(await blob.arrayBuffer())
        let binary = ''
        arr.forEach(b => { binary += String.fromCharCode(b) })
        return `data:${blob.type || 'image/svg+xml'};base64,${btoa(binary)}`
      } catch { /* fall through */ }

      // Fallback: grab the largest SVG element from Ketcher's DOM
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
        const { width, height } = el.getBoundingClientRect()
        clone.setAttribute('width', String(width))
        clone.setAttribute('height', String(height))
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        bg.setAttribute('width', '100%'); bg.setAttribute('height', '100%'); bg.setAttribute('fill', 'white')
        clone.insertBefore(bg, clone.firstChild)
        const svgStr = new XMLSerializer().serializeToString(clone)
        const encoded = new TextEncoder().encode(svgStr)
        let binary = ''
        encoded.forEach(b => { binary += String.fromCharCode(b) })
        return `data:image/svg+xml;base64,${btoa(binary)}`
      } catch {
        return null
      }
    },
    triggerCheck: () => runValidation(),
  }))

  // Inject Ketcher CSS in a cascade layer so unlayered app styles always win
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

  // Clear canvas when resetKey changes (new problem)
  useEffect(() => {
    if (ketcherRef.current) {
      ketcherRef.current.setMolecule('')
      setResult(null)
    }
  }, [resetKey])

  async function runValidation(): Promise<ValidationResult | null> {
    if (!ketcherRef.current || !correctStructure || checkingRef.current) return null
    checkingRef.current = true
    setChecking(true)

    try {
      const ketcher = ketcherRef.current
      const molfile = await ketcher.getMolfile()
      const isFlat  = FLAT_GEOMETRIES.has(correctStructure.geometry ?? '')

      // ── 1. Empty check ───────────────────────────────────────────────────────
      const drawnAtomCount = parseInt((molfile.split('\n')[3] ?? '').substring(0, 3).trim(), 10) || 0
      if (drawnAtomCount === 0) {
        const v: ValidationResult = { passed: false, checks: [{ label: 'Structure', passed: false, detail: 'No structure drawn yet.' }] }
        setResult(v)
        onValidated?.(false)
        return v
      }

      // ── 2. Chemical validity ─────────────────────────────────────────────────
      let validityPassed = true
      let validityDetail = 'No issues'
      try {
        const checkResult = await ketcher.indigo.check(molfile, { types: ['valence', 'overlapping_atoms', 'overlapping_bonds'] })
        const issues = Object.entries(checkResult).filter(([, msg]) => msg !== '').map(([type, msg]) => `${type}: ${msg}`)
        if (issues.length > 0) { validityPassed = false; validityDetail = issues.join('; ') }
      } catch { /* skip */ }

      // ── 3. Structure match via InChI ─────────────────────────────────────────
      let structurePassed = false
      let structureDetail = 'Could not compare structures'
      try {
        const correctMol = lewisToMol(correctStructure)
        const [userInchi, correctConvert] = await Promise.all([
          ketcher.getInchi(),
          ketcher.indigo.convert(correctMol, { outputFormat: ChemicalMimeType.InChI }),
        ])
        const userConn    = inchiConnectivity(userInchi)
        const correctConn = inchiConnectivity(correctConvert.struct)
        structurePassed = userConn === correctConn && userConn !== ''
        structureDetail = structurePassed ? 'Correct' : 'Structure does not match — check atoms and bond orders'
      } catch {
        structureDetail = 'InChI comparison failed — check your structure and try again'
      }

      // ── 4. Wedge/dash (3D geometries) ───────────────────────────────────────
      const checks: ValidationCheck[] = [
        { label: 'Chemical validity', passed: validityPassed, detail: validityDetail },
        { label: 'Structure',         passed: structurePassed, detail: structureDetail },
      ]
      if (!isFlat) {
        const has3D = molHas3DBonds(molfile)
        checks.push({ label: 'Wedge/dash bonds (3D geometry)', passed: has3D, detail: has3D ? 'Present' : 'Use wedge (▶) or dash (– –) bonds to show 3D geometry' })
      }

      // ── 5. Geometry (flat geometries) ───────────────────────────────────────
      if (structurePassed && isFlat) {
        const geoResult = checkMolGeometry(molfile, correctStructure.geometry ?? '')
        if (geoResult) checks.push({ label: 'Geometry', passed: geoResult.passed, detail: geoResult.detail })
      }

      const validation: ValidationResult = { passed: checks.every(c => c.passed), checks }
      setResult(validation)
      onValidated?.(validation.passed)
      return validation
    } finally {
      checkingRef.current = false
      setChecking(false)
    }
  }

  const handleCheck = () => { runValidation() }

  return (
    <div className="flex flex-col gap-4">

      {/* Editor container — fixed height so Ketcher has space to render */}
      <div
        ref={containerRef}
        className="rounded-sm border border-border overflow-hidden"
        style={{ height: 480, position: 'relative' }}
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
          onInit={(ketcher: Ketcher) => {
            ketcherRef.current = ketcher
            setReady(true)
          }}
        />
      </div>

      {/* Check button */}
      {showCheck && (
        <button
          onClick={handleCheck}
          disabled={!ready || !correctStructure || checking}
          className="self-start px-5 py-2 rounded-sm font-sans text-sm font-medium
                     transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
            color: 'var(--c-halogen)',
          }}
        >
          {checking ? 'Checking…' : 'Check'}
        </button>
      )}

      {/* Validation result */}
      {showCheck && result && (
        <div
          className="rounded-sm border p-4 flex flex-col gap-3"
          style={{
            borderColor: result.passed
              ? 'color-mix(in srgb, #4ade80 30%, rgb(var(--color-border)))'
              : 'color-mix(in srgb, #f87171 30%, rgb(var(--color-border)))',
            background: result.passed
              ? 'color-mix(in srgb, #4ade80 5%, rgb(var(--color-surface)))'
              : 'color-mix(in srgb, #f87171 5%, rgb(var(--color-surface)))',
          }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 18 }}>{result.passed ? '✓' : '✗'}</span>
            <span className="font-sans font-semibold text-sm"
              style={{ color: result.passed ? '#4ade80' : '#f87171' }}>
              {result.passed ? 'Correct! Great work.' : 'Not quite — see details below.'}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {result.checks.map((check, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="font-mono text-xs shrink-0 w-3"
                  style={{ color: check.passed ? '#4ade80' : '#f87171', marginTop: 1 }}>
                  {check.passed ? '✓' : '✗'}
                </span>
                <div>
                  <span className="font-sans text-xs font-medium text-primary">{check.label}: </span>
                  <span className="font-mono text-xs text-secondary">{check.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
})

export default KetcherStructureEditor
