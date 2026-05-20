// @vitest-environment node
// Tests the SSR-safe, static render paths of HoverPreview.
// Interactive paths (hover delay, touch toggle, portal overlay) require
// jsdom + @testing-library/react and can be added once those devDeps are installed.
import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('./CompoundDisplay', () => ({
  default: ({ smiles, label }: { smiles: string; label?: string }) => (
    <div data-testid="compound-display" data-smiles={smiles}>{label}</div>
  ),
}))

// createPortal stub for SSR — render inline so markup is inspectable
vi.mock('react-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-dom')>()
  return { ...actual, createPortal: (node: React.ReactNode) => node }
})

const { default: HoverPreview } = await import('./HoverPreview')

describe('HoverPreview — static render', () => {
  it('renders children', () => {
    const html = renderToStaticMarkup(
      <HoverPreview smiles="CC(N)C(=O)O">
        <span>Alanine</span>
      </HoverPreview>
    )
    expect(html).toContain('Alanine')
  })

  it('overlay is not present in initial SSR output', () => {
    const html = renderToStaticMarkup(
      <HoverPreview smiles="CC(N)C(=O)O">
        <span>Alanine</span>
      </HoverPreview>
    )
    expect(html).not.toContain('data-testid="compound-display"')
  })

  it('wraps children in a span trigger', () => {
    const html = renderToStaticMarkup(
      <HoverPreview smiles="CC">
        <span>Gly</span>
      </HoverPreview>
    )
    // Outer trigger is always a <span>
    expect(html).toMatch(/<span[^>]*>.*Gly.*<\/span>/s)
  })

  it('accepts label prop without error', () => {
    expect(() => renderToStaticMarkup(
      <HoverPreview smiles="CC(N)C(=O)O" label="Alanine (Ala)" width={220} height={160}>
        <span>Alanine</span>
      </HoverPreview>
    )).not.toThrow()
  })

  it('renders with default props without error', () => {
    expect(() => renderToStaticMarkup(
      <HoverPreview smiles="CC">
        <em>Test</em>
      </HoverPreview>
    )).not.toThrow()
  })
})
