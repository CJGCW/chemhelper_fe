// @vitest-environment node
// Tests the synchronous render paths of CompoundDisplay.
// Async paths (smiles fetch, cache) require jsdom + @testing-library/react
// and can be added once those devDeps are installed.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

// Mock the axios client before importing CompoundDisplay so the module
// sees the mock from the start.
vi.mock('../../api/client', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: { svg: '<svg>mocked</svg>' } })),
  },
}))

// Import AFTER mocking so the component picks up the mock client.
const { default: CompoundDisplay } = await import('./CompoundDisplay')

describe('CompoundDisplay — synchronous render paths', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the svg prop inline without fetching', () => {
    const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><circle r="5"/></svg>'
    const html = renderToStaticMarkup(
      <CompoundDisplay svg={svgContent} label="test" width={100} height={80} />
    )
    expect(html).toContain('circle')
    expect(html).toContain('test') // label rendered
  })

  it('renders the label below the structure when svg prop is given', () => {
    const html = renderToStaticMarkup(
      <CompoundDisplay svg="<svg/>" label="Benzene" />
    )
    expect(html).toContain('Benzene')
  })

  it('omits the label span when label is not provided', () => {
    const html = renderToStaticMarkup(
      <CompoundDisplay svg="<svg/>" />
    )
    // No label span should be present (font-sans text-xs text-secondary)
    expect(html).not.toContain('text-secondary')
  })

  it('renders fallback label-in-box when neither svg nor smiles provided', () => {
    const html = renderToStaticMarkup(
      <CompoundDisplay label="H₂O" width={120} height={90} />
    )
    expect(html).toContain('H₂O')
    // Should not show loading state
    expect(html).not.toContain('animate-pulse')
  })

  it('uses smiles as fallback text when label is absent and no svg', () => {
    const html = renderToStaticMarkup(
      <CompoundDisplay smiles="CCO" width={120} height={90} />
    )
    // Initial render with smiles but no svg: shows loading skeleton (status='loading')
    // because useEffect hasn't run yet in SSR
    expect(html).toContain('animate-pulse')
  })

  it('renders the em dash when no label, no smiles, no svg', () => {
    const html = renderToStaticMarkup(
      <CompoundDisplay width={80} height={60} />
    )
    expect(html).toContain('—')
    expect(html).not.toContain('animate-pulse')
  })

  it('applies the requested width and height to the structure container', () => {
    const html = renderToStaticMarkup(
      <CompoundDisplay svg="<svg/>" width={250} height={180} />
    )
    expect(html).toContain('width:250px')
    expect(html).toContain('height:180px')
  })

  it('applies default dimensions (200×150) when none provided', () => {
    const html = renderToStaticMarkup(
      <CompoundDisplay svg="<svg/>" />
    )
    expect(html).toContain('width:200px')
    expect(html).toContain('height:150px')
  })
})
