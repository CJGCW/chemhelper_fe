import React from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  POLYATOMIC_ANIONS as _ANIONS,
  POLYATOMIC_CATIONS as _CATIONS,
  TRANSITION_METAL_CATIONS,
  GREEK_PREFIXES,
} from '../../data/nomenclature'

// ── Local display adapters (reference uses string charges; data module uses numbers) ──

const POLYATOMIC_ANIONS = _ANIONS.map(ion => ({
  formula: ion.formula,
  name:    ion.aliases ? `${ion.name} (${ion.aliases.join(' / ')})` : ion.name,
  charge:  `${Math.abs(ion.charge)}−`,
}))

const POLYATOMIC_CATIONS = _CATIONS.map(ion => ({
  formula: ion.formula,
  name:    ion.charge === 2 ? 'mercury(I) / mercurous' : ion.name,
  charge:  `${ion.charge}+`,
}))

const TRANSITION_METALS = TRANSITION_METAL_CATIONS.map(m => ({
  formula:   m.formula,
  iupac:     m.iupac,
  classical: m.classical ?? '—',
})).concat([
  { formula: 'Ag⁺',  iupac: 'silver', classical: '—' },
  { formula: 'Zn²⁺', iupac: 'zinc',   classical: '—' },
])

const STANDARD_PREFIXES = Object.entries(GREEK_PREFIXES).map(([n, pfx]) => [n, pfx])

const COMPLEX_PREFIXES = [
  ['2','bis'],['3','tris'],['4','tetrakis'],['5','pentakis'],['6','hexakis'],
]

const BINARY_ACIDS = [
  { formula: 'HF(aq)',  name: 'hydrofluoric acid'  },
  { formula: 'HCl(aq)', name: 'hydrochloric acid'  },
  { formula: 'HBr(aq)', name: 'hydrobromic acid'   },
  { formula: 'HI(aq)',  name: 'hydroiodic acid'    },
  { formula: 'H₂S(aq)', name: 'hydrosulfuric acid' },
  { formula: 'HCN(aq)', name: 'hydrocyanic acid'   },
]

const OXY_ACIDS = [
  { formula: 'HClO₄', ion: 'ClO₄⁻  perchlorate',  name: 'perchloric acid'   },
  { formula: 'HClO₃', ion: 'ClO₃⁻  chlorate',     name: 'chloric acid'      },
  { formula: 'HClO₂', ion: 'ClO₂⁻  chlorite',     name: 'chlorous acid'     },
  { formula: 'HClO',  ion: 'ClO⁻   hypochlorite', name: 'hypochlorous acid' },
  { formula: 'HNO₃',  ion: 'NO₃⁻  nitrate',       name: 'nitric acid'       },
  { formula: 'HNO₂',  ion: 'NO₂⁻  nitrite',       name: 'nitrous acid'      },
  { formula: 'H₂SO₄', ion: 'SO₄²⁻ sulfate',       name: 'sulfuric acid'     },
  { formula: 'H₂SO₃', ion: 'SO₃²⁻ sulfite',       name: 'sulfurous acid'    },
  { formula: 'H₃PO₄', ion: 'PO₄³⁻ phosphate',     name: 'phosphoric acid'   },
  { formula: 'H₂CO₃', ion: 'CO₃²⁻ carbonate',     name: 'carbonic acid'     },
]

const LIGANDS = [
  { formula: 'H₂O',    name: 'aqua',                              charge: '0',  dentate: 'monodentate'  },
  { formula: 'NH₃',    name: 'ammine',                            charge: '0',  dentate: 'monodentate'  },
  { formula: 'CO',     name: 'carbonyl',                          charge: '0',  dentate: 'monodentate'  },
  { formula: 'NO',     name: 'nitrosyl',                          charge: '0',  dentate: 'monodentate'  },
  { formula: 'F⁻',     name: 'fluoro',                            charge: '1−', dentate: 'monodentate'  },
  { formula: 'Cl⁻',    name: 'chloro',                            charge: '1−', dentate: 'monodentate'  },
  { formula: 'Br⁻',    name: 'bromo',                             charge: '1−', dentate: 'monodentate'  },
  { formula: 'I⁻',     name: 'iodo',                              charge: '1−', dentate: 'monodentate'  },
  { formula: 'OH⁻',    name: 'hydroxo',                           charge: '1−', dentate: 'monodentate'  },
  { formula: 'O²⁻',    name: 'oxo',                               charge: '2−', dentate: 'monodentate'  },
  { formula: 'CN⁻',    name: 'cyano',                             charge: '1−', dentate: 'monodentate'  },
  { formula: 'SCN⁻',   name: 'thiocyanato-S / isothiocyanato-N',  charge: '1−', dentate: 'monodentate'  },
  { formula: 'NO₂⁻',   name: 'nitro (N-bound) / nitrito (O-bound)', charge: '1−', dentate: 'monodentate' },
  { formula: 'en',     name: 'ethylenediamine',                   charge: '0',  dentate: 'bidentate'    },
  { formula: 'ox²⁻',   name: 'oxalato',                           charge: '2−', dentate: 'bidentate'    },
  { formula: 'bipy',   name: "2,2′-bipyridine",                   charge: '0',  dentate: 'bidentate'    },
  { formula: 'edta⁴⁻', name: 'ethylenediaminetetraacetato',       charge: '4−', dentate: 'hexadentate'  },
]

const COORD_METAL_STEMS = [
  ['Iron','ferrate'],['Copper','cuprate'],['Gold','aurate'],['Silver','argentate'],
  ['Lead','plumbate'],['Tin','stannate'],['Cobalt','cobaltate'],
  ['Chromium','chromate'],['Platinum','platinate'],['Nickel','nickelate'],
]

const COORD_EXAMPLES = [
  { formula: '[Fe(H₂O)₆]³⁺',    name: 'hexaaquairon(III) ion' },
  { formula: '[Cu(NH₃)₄]²⁺',    name: 'tetraamminecopper(II) ion' },
  { formula: '[Co(en)₃]³⁺',     name: 'tris(ethylenediamine)cobalt(III) ion' },
  { formula: 'K₃[Fe(CN)₆]',     name: 'potassium hexacyanoferrate(III)' },
  { formula: '[Pt(NH₃)₂Cl₂]',  name: 'diamminedichloroplatinum(II)' },
  { formula: '[CrCl₂(H₂O)₄]Cl', name: 'tetraaquadichlorochromium(III) chloride' },
]

// ── Shared table primitive ─────────────────────────────────────────────────────

function T({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            {headers.map(h => (
              <th key={h} className="text-left pb-2 pr-5 last:pr-0 font-mono text-xs
                                     text-secondary tracking-widest uppercase">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/40 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="py-1.5 pr-5 last:pr-0 font-mono text-sm
                                       text-primary align-top">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Section content components ─────────────────────────────────────────────────

function Ions() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p className="font-mono text-xs text-secondary uppercase tracking-widest mb-3">Anions</p>
          <T
            headers={['Formula','Name','Charge']}
            rows={POLYATOMIC_ANIONS.map(i => [
              <span className="text-secondary">{i.formula}</span>,
              <span className="text-primary">{i.name}</span>,
              <span className="text-dim">{i.charge}</span>,
            ])}
          />
        </div>
        <div className="flex flex-col gap-6">
          <div>
            <p className="font-mono text-xs text-secondary uppercase tracking-widest mb-3">Cations</p>
            <T
              headers={['Formula','Name','Charge']}
              rows={POLYATOMIC_CATIONS.map(i => [
                <span className="text-secondary">{i.formula}</span>,
                <span className="text-primary">{i.name}</span>,
                <span className="text-dim">{i.charge}</span>,
              ])}
            />
          </div>
          <div>
            <p className="font-mono text-xs text-secondary uppercase tracking-widest mb-3">-ate / -ite pattern</p>
            <div className="flex flex-col gap-2">
              {[
                ['more O', '-ic acid  /  -ate ion',  'SO₄²⁻ sulfate, HNO₃ nitric acid'],
                ['less O', '-ous acid  /  -ite ion', 'SO₃²⁻ sulfite, HNO₂ nitrous acid'],
                ['one more O', 'per--ate',           'ClO₄⁻ perchlorate'],
                ['two fewer O', 'hypo--ite',         'ClO⁻ hypochlorite'],
              ].map(([cond, rule, ex]) => (
                <div key={cond} className="flex gap-3 items-baseline text-sm flex-wrap">
                  <span className="text-dim w-20 shrink-0 text-xs">{cond}</span>
                  <span className="text-primary">{rule}</span>
                  <span className="text-dim text-xs">({ex})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Metals() {
  const half = Math.ceil(TRANSITION_METALS.length / 2)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <T
        headers={['Ion','IUPAC name','Classical']}
        rows={TRANSITION_METALS.slice(0, half).map(m => [
          <span className="text-secondary">{m.formula}</span>,
          <span className="text-primary">{m.iupac}</span>,
          <span className="text-dim">{m.classical}</span>,
        ])}
      />
      <T
        headers={['Ion','IUPAC name','Classical']}
        rows={TRANSITION_METALS.slice(half).map(m => [
          <span className="text-secondary">{m.formula}</span>,
          <span className="text-primary">{m.iupac}</span>,
          <span className="text-dim">{m.classical}</span>,
        ])}
      />
    </div>
  )
}

function Prefixes() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <p className="font-mono text-xs text-secondary uppercase tracking-widest mb-3">
          Standard  (molecular / covalent)
        </p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
          {STANDARD_PREFIXES.map(([n, pfx]) => (
            <div key={n} className="flex gap-3 items-baseline">
              <span className="font-mono text-dim text-sm w-5 text-right shrink-0">{n}</span>
              <span className="font-mono text-primary text-sm">{pfx}-</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="font-mono text-xs text-secondary uppercase tracking-widest mb-3">
          Complex ligand prefixes  (avoids ambiguity)
        </p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
          {COMPLEX_PREFIXES.map(([n, pfx]) => (
            <div key={n} className="flex gap-3 items-baseline">
              <span className="font-mono text-dim text-sm w-5 text-right shrink-0">{n}</span>
              <span className="font-mono text-primary text-sm">{pfx}</span>
            </div>
          ))}
        </div>
        <p className="font-mono text-xs text-dim mt-4 leading-relaxed">
          Use bis/tris/tetrakis when the ligand name already<br/>
          contains a prefix — e.g. <span className="text-primary">bis(ethylenediamine)</span>,<br/>
          not di(ethylenediamine).
        </p>
      </div>
    </div>
  )
}

function Acids() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <p className="font-mono text-xs text-secondary uppercase tracking-widest mb-1">
          Binary acids  (H + nonmetal, in aq. solution)
        </p>
        <p className="font-sans text-xs text-dim mb-3">
          Pattern: <span className="font-mono text-secondary">hydro[stem]ic acid</span>
        </p>
        <T
          headers={['Formula','Name']}
          rows={BINARY_ACIDS.map(a => [
            <span className="text-secondary">{a.formula}</span>,
            <span className="text-primary">{a.name}</span>,
          ])}
        />
      </div>
      <div>
        <p className="font-mono text-xs text-secondary uppercase tracking-widest mb-1">
          Oxyacids  (H + polyatomic oxyanion)
        </p>
        <p className="font-sans text-xs text-dim mb-3">
          <span className="font-mono text-secondary">-ate</span> → <span className="font-mono text-secondary">-ic acid</span>
          &nbsp;&nbsp;|&nbsp;&nbsp;
          <span className="font-mono text-secondary">-ite</span> → <span className="font-mono text-secondary">-ous acid</span>
        </p>
        <T
          headers={['Formula','Ion','Name']}
          rows={OXY_ACIDS.map(a => [
            <span className="text-secondary">{a.formula}</span>,
            <span className="text-dim text-xs">{a.ion}</span>,
            <span className="text-primary">{a.name}</span>,
          ])}
        />
      </div>
    </div>
  )
}

function Ligands() {
  return (
    <T
      headers={['Formula / Abbrev.','Ligand name','Charge','Denticity']}
      rows={LIGANDS.map(l => [
        <span className="text-secondary">{l.formula}</span>,
        <span className="text-primary">{l.name}</span>,
        <span className="text-dim">{l.charge}</span>,
        <span className="text-dim text-xs">{l.dentate}</span>,
      ])}
    />
  )
}

function Coordination() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <div>
        <p className="font-mono text-xs text-secondary uppercase tracking-widest mb-3">Naming order</p>
        <ol className="flex flex-col gap-2 list-decimal list-inside font-sans text-sm text-secondary">
          <li>Cation before anion (same as ionic compounds).</li>
          <li>Within the complex: ligands alphabetically, then central metal.</li>
          <li>Number of each ligand given by a prefix (di-, tri- or bis-/tris- for complex names).</li>
          <li>Metal oxidation state in Roman numerals in parentheses — e.g. iron(III).</li>
          <li>If the complex is an anion, add <span className="font-mono text-primary">-ate</span> to the metal stem.</li>
        </ol>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p className="font-mono text-xs text-secondary uppercase tracking-widest mb-3">
            Metal stems for anionic complexes
          </p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
            {COORD_METAL_STEMS.map(([metal, stem]) => (
              <div key={metal} className="flex gap-3 text-sm items-baseline">
                <span className="text-secondary w-20 shrink-0">{metal}</span>
                <span className="font-mono text-dim">→ {stem}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="font-mono text-xs text-secondary uppercase tracking-widest mb-3">Examples</p>
          <div className="flex flex-col gap-2.5">
            {COORD_EXAMPLES.map(({ formula, name }) => (
              <div key={formula} className="flex gap-3 items-baseline flex-wrap">
                <span className="font-mono text-sm text-bright w-44 shrink-0">{formula}</span>
                <span className="font-sans text-sm text-secondary">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickRules() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        {
          label: 'Ionic — Type I',
          subtitle: 'Fixed-charge metals (Group I, II, Al, Zn, Ag)',
          color: 'var(--c-halogen)',
          items: [
            'Metal name + anion stem + -ide',
            'No Roman numeral needed',
            'NaCl → sodium chloride',
            'CaCO₃ → calcium carbonate',
            'Al₂O₃ → aluminum oxide',
          ],
        },
        {
          label: 'Ionic — Type II',
          subtitle: 'Variable-charge metals (most transition metals)',
          color: '#f5a623',
          items: [
            'Metal name + (oxidation state) + anion name',
            'Roman numeral required',
            'FeCl₂ → iron(II) chloride',
            'FeCl₃ → iron(III) chloride',
            'Cu₂O → copper(I) oxide',
          ],
        },
        {
          label: 'Molecular / Covalent',
          subtitle: 'Two nonmetals',
          color: '#67e8f9',
          items: [
            'Greek prefix + element name for both',
            'First element: omit "mono-"',
            'Second element: prefix + -ide',
            'CO₂ → carbon dioxide',
            'N₂O₄ → dinitrogen tetroxide',
            'SF₆ → sulfur hexafluoride',
          ],
        },
      ].map(({ label, subtitle, color, items }) => (
        <div key={label} className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest mb-0.5" style={{ color }}>{label}</p>
            <p className="font-sans text-xs text-dim">{subtitle}</p>
          </div>
          <ul className="flex flex-col gap-1.5">
            {items.map(item => (
              <li key={item} className="font-sans text-xs text-secondary">{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

// ── Pill navigation ────────────────────────────────────────────────────────────

type Section = 'ions' | 'metals' | 'prefixes' | 'acids' | 'ligands' | 'coordination' | 'rules'

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'ions',         label: 'Polyatomic Ions'   },
  { id: 'metals',       label: 'Metal Cations'     },
  { id: 'prefixes',     label: 'Prefixes'          },
  { id: 'acids',        label: 'Acids'             },
  { id: 'ligands',      label: 'Ligands'           },
  { id: 'coordination', label: 'Coordination'      },
  { id: 'rules',        label: 'Naming Rules'      },
]

// ── Main export ────────────────────────────────────────────────────────────────

export default function NamingReference() {
  const [active, setActive] = useState<Section>('ions')

  return (
    <div className="flex flex-col gap-5 max-w-4xl">

      {/* Pill bar */}
      <div className="flex items-center gap-1 p-1 rounded-sm self-start flex-wrap print:hidden"
        style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
        {SECTIONS.map(s => {
          const isActive = active === s.id
          return (
            <button key={s.id} onClick={() => setActive(s.id)}
              className="relative flex-shrink-0 px-3.5 py-1.5 rounded-sm font-sans text-sm
                         font-medium transition-colors"
              style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)' }}>
              {isActive && (
                <motion.div layoutId="naming-pill" className="absolute inset-0 rounded-sm"
                  style={{
                    background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
              )}
              <span className="relative z-10">{s.label}</span>
            </button>
          )
        })}
      </div>

      {/* Section content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {active === 'ions'         && <Ions />}
          {active === 'metals'       && <Metals />}
          {active === 'prefixes'     && <Prefixes />}
          {active === 'acids'        && <Acids />}
          {active === 'ligands'      && <Ligands />}
          {active === 'coordination' && <Coordination />}
          {active === 'rules'        && <QuickRules />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
