// ── Tool reference cards ───────────────────────────────────────────────────────

interface ToolEntry {
  icon: string
  name: string
  shortcut?: string
  description: string
}

const TOOLS: ToolEntry[] = [
  {
    icon: '↖',
    name: 'Select / Lasso',
    shortcut: 'Esc',
    description: 'Click or drag to select atoms and bonds. Use the arrow (rectangle) for box select or the lasso for freehand select.',
  },
  {
    icon: '—',
    name: 'Single Bond',
    shortcut: '1',
    description: 'Click an empty area to place a carbon, then click another atom to bond them. Clicking an existing bond cycles it to double then triple.',
  },
  {
    icon: '═',
    name: 'Double / Triple Bond',
    shortcut: '2 / 3',
    description: 'Directly draw a double or triple bond between atoms.',
  },
  {
    icon: '▶',
    name: 'Wedge Bond (bold)',
    shortcut: '',
    description: 'Solid filled wedge — bond points toward the viewer (out of the plane). Essential for showing 3D geometry in the VSEPR Problems checker.',
  },
  {
    icon: '⋯',
    name: 'Dash Bond (hashed wedge)',
    shortcut: '',
    description: 'Dashed wedge — bond points away from the viewer (into the plane). Use with wedge bonds to fully describe 3D geometry.',
  },
  {
    icon: 'A',
    name: 'Atom Label',
    shortcut: 'A',
    description: 'Click any atom to type a new element symbol. You can also click an empty canvas area and type a symbol to place that element.',
  },
  {
    icon: '⌫',
    name: 'Eraser',
    shortcut: 'Del',
    description: 'Click an atom or bond to delete it. Deleting an atom removes all its bonds too.',
  },
  {
    icon: '⟲',
    name: 'Undo / Redo',
    shortcut: 'Ctrl+Z / Ctrl+Y',
    description: 'Step backward or forward through your drawing history.',
  },
]

// ── FAQ entries ────────────────────────────────────────────────────────────────

interface FaqEntry { q: string; a: string }

const FAQS: FaqEntry[] = [
  {
    q: 'How do I change an atom to a different element?',
    a: 'Click the Atom Label tool (or press A), then click the atom you want to change and type the element symbol.',
  },
  {
    q: 'How do I add a wedge or dash bond for 3D geometry?',
    a: 'In the bond toolbar, expand the bond type dropdown and choose the solid wedge (▶) for bonds coming toward you, or the dashed wedge (⋯) for bonds going away. The VSEPR Problems checker requires at least one wedge or dash bond to pass.',
  },
  {
    q: 'How do I draw a ring or cyclic structure?',
    a: 'Use the ring templates in the right-side Template panel, or manually draw the atoms and bonds. For small rings (3–6 members), the template buttons are fastest.',
  },
  {
    q: 'How do I clear the canvas and start over?',
    a: 'Press Ctrl+A to select all, then Delete. Or use Edit → Clear Canvas from the top menu.',
  },
  {
    q: 'What do the colored outlines on atoms mean?',
    a: 'They indicate the element group (C = grey, O = red, N = blue, etc.). The colors help you quickly identify elements at a glance.',
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function KetcherGuide() {
  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Editor Reference</span>
        <h3 className="font-sans font-semibold text-bright text-lg">Ketcher Structure Editor</h3>
        <p className="font-sans text-sm text-secondary mt-0.5">
          Ketcher is an open-source 2D molecular structure editor. The toolbar runs along the left side of the canvas.
        </p>
      </div>

      {/* Tool reference */}
      <div className="flex flex-col gap-3">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Key Tools</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {TOOLS.map(tool => (
            <div
              key={tool.name}
              className="flex items-start gap-3 px-4 py-3 rounded-sm border border-border"
              style={{ background: 'rgb(var(--color-surface))' }}
            >
              <span
                className="font-mono text-base shrink-0 w-6 text-center"
                style={{ color: 'var(--c-halogen)', marginTop: 1 }}
              >
                {tool.icon}
              </span>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-sans text-xs font-medium text-primary">{tool.name}</span>
                  {tool.shortcut && (
                    <span
                      className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        background: 'rgb(var(--color-border))',
                        color: 'var(--c-secondary, rgb(var(--color-secondary)))',
                        border: '1px solid rgb(var(--color-muted))',
                      }}
                    >
                      {tool.shortcut}
                    </span>
                  )}
                </div>
                <span className="font-sans text-xs text-secondary">{tool.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="flex flex-col gap-3">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">FAQ</span>
        <div className="flex flex-col gap-2">
          {FAQS.map(faq => (
            <div
              key={faq.q}
              className="flex flex-col gap-1 px-4 py-3 rounded-sm border border-border"
              style={{ background: 'rgb(var(--color-surface))' }}
            >
              <span className="font-sans text-xs font-medium text-primary">{faq.q}</span>
              <span className="font-sans text-xs text-secondary">{faq.a}</span>
            </div>
          ))}
        </div>
      </div>

      {/* External links */}
      <div className="flex flex-col gap-3">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Official Resources</span>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Ketcher Homepage', url: 'http://lifescience.opensource.epam.com/ketcher' },
            { label: 'GitHub Repository', url: 'https://github.com/epam/ketcher' },
            { label: 'Issue Tracker', url: 'https://github.com/epam/ketcher/issues' },
          ].map(link => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-sans text-xs font-medium transition-colors"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 10%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 25%, transparent)',
                color: 'var(--c-halogen)',
              }}
            >
              {link.label}
              <span className="opacity-60 text-[10px]">↗</span>
            </a>
          ))}
        </div>
      </div>

    </div>
  )
}
