import { useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ExplanationModal, { type ExplanationContent } from '../components/calculations/ExplanationModal'
import QuantumNumbersReference from '../components/atomic/QuantumNumbersReference'
import EnergyLevelsReference from '../components/atomic/EnergyLevelsReference'
import AtomicPractice from '../components/atomic/AtomicPractice'
import IsoelectronicSeries from '../components/atomic/IsoelectronicSeries'
import OrbitalBoxDiagram from '../components/atomic/OrbitalBoxDiagram'
import ElectronConfig from '../components/atomic/ElectronConfig'
import ElectronConfigPractice from '../components/atomic/ElectronConfigPractice'
import ElectromagneticSpectrum from '../components/atomic/ElectromagneticSpectrum'
import ParaDiaMagnetic from '../components/atomic/ParaDiaMagnetic'
import MultiElectronAtoms from '../components/atomic/MultiElectronAtoms'
import PeriodicTrendsReference from '../components/atomic/PeriodicTrendsReference'
import PeriodicTrendsPractice from '../components/atomic/PeriodicTrendsPractice'
import ReverseIsotopeTool from '../components/atomic/ReverseIsotopeTool'
import IsotopeAbundanceReference from '../components/atomic/IsotopeAbundanceReference'
import IsotopeAbundancePractice from '../components/atomic/IsotopeAbundancePractice'
import NamingReference from '../components/reference/NamingReference'
import NomenclatureTool from '../components/reference/NomenclatureTool'
import PageShell from '../components/Layout/PageShell'

type Topic = 'electron_config' | 'quantum_numbers' | 'energy_levels' | 'isoelectronic'
           | 'em_spectrum' | 'multi_electron' | 'periodic_trends' | 'isotopes'
           | 'naming'
type Mode  = 'reference' | 'practice' | 'problems'

// Modes available per topic — topics not listed here show no toggle
const TOPIC_MODES: Partial<Record<Topic, Mode[]>> = {
  electron_config:  ['reference', 'practice', 'problems'],
  quantum_numbers:  ['reference', 'problems'],
  energy_levels:    ['reference', 'problems'],
  periodic_trends:  ['reference', 'practice'],
  isotopes:         ['reference', 'practice', 'problems'],
  naming:           ['reference', 'problems'],
}

const TOPIC_GROUPS: { label: string; topics: { id: Topic; label: string; subtitle: string }[] }[] = [
  {
    label: 'Electron Configuration',
    topics: [
      { id: 'electron_config', label: 'Electron Config', subtitle: 'Notation, orbital boxes, Hund\'s rule' },
      { id: 'quantum_numbers', label: 'Quantum Numbers', subtitle: 'n, l, mₗ, ms rules'                    },
      { id: 'energy_levels',   label: 'Energy Levels',   subtitle: 'Bohr model, transitions'               },
      { id: 'multi_electron',  label: 'Multi-Electron',  subtitle: 'Shielding, Zeff, Slater rules'         },
    ],
  },
  {
    label: 'Properties & Spectra',
    topics: [
      { id: 'periodic_trends', label: 'Periodic Trends',  subtitle: 'Radius, IE, EN heatmap & ranking' },
      { id: 'isoelectronic',   label: 'Isoelectronic',    subtitle: 'Ion size comparison'              },
      { id: 'em_spectrum',     label: 'EM Spectrum',      subtitle: 'λ ↔ f ↔ E interconverter'        },
      { id: 'isotopes',        label: 'Isotope Abundance', subtitle: 'Weighted average & find abundances' },
    ],
  },
  {
    label: 'Nomenclature',
    topics: [
      { id: 'naming', label: 'Naming Rules', subtitle: 'Ionic, covalent, polyatomic ions' },
    ],
  },
]

const EXPLANATIONS: Partial<Record<Topic, ExplanationContent>> = {
  electron_config: {
    title: 'Electron Configuration',
    formula: '1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d¹⁰ ...',
    formulaVars: [
      { symbol: 'n',       meaning: 'Principal quantum number (energy level)', unit: '1, 2, 3 ...' },
      { symbol: 'subshell',meaning: 'Orbital type: s(2), p(6), d(10), f(14)', unit: 's, p, d, f'  },
      { symbol: 'e⁻',      meaning: 'Electrons in that subshell',              unit: 'superscript' },
    ],
    description:
      'Electron configuration describes how electrons are distributed among orbitals. ' +
      'Aufbau principle: fill from lowest energy up (use 1s→2s→2p→3s→... order). ' +
      'Pauli exclusion: max 2 electrons per orbital, opposite spins. ' +
      'Hund\'s rule: half-fill a subshell before pairing.',
    example: {
      scenario: 'Write the electron configuration of Fe (Z = 26).',
      steps: ['Fill in Aufbau order: 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶', 'Total electrons: 2+2+6+2+6+2+6 = 26 ✓', 'Noble-gas shorthand: [Ar] 3d⁶ 4s²'],
      result: '[Ar] 3d⁶ 4s²',
    },
  },
  quantum_numbers: {
    title: 'Quantum Numbers',
    formula: 'n, ℓ, mℓ, ms — uniquely identify each electron',
    formulaVars: [
      { symbol: 'n',  meaning: 'Principal — energy level',                  unit: '1, 2, 3 ...'      },
      { symbol: 'ℓ',  meaning: 'Angular momentum — subshell shape',         unit: '0(s) 1(p) 2(d) 3(f)' },
      { symbol: 'mℓ', meaning: 'Magnetic — orbital orientation',            unit: '−ℓ to +ℓ'         },
      { symbol: 'ms', meaning: 'Spin — direction of electron spin',         unit: '+½ or −½'          },
    ],
    description:
      'Four quantum numbers completely specify an electron\'s state. ' +
      'ℓ ranges from 0 to n−1; mℓ gives 2ℓ+1 orbitals per subshell (e.g. p has 3 orbitals). ' +
      'No two electrons in the same atom can share all four quantum numbers (Pauli exclusion).',
    example: {
      scenario: 'Give valid quantum numbers for the last electron added to fluorine (1s² 2s² 2p⁵).',
      steps: ['Valence electron is in 2p: n = 2, ℓ = 1', 'By Hund\'s rule the paired orbital could be mℓ = +1, 0, or −1', 'Paired electron: ms = −½'],
      result: 'n=2, ℓ=1, mℓ=+1 (or 0 or −1), ms=−½',
    },
  },
  energy_levels: {
    title: 'Energy Levels and Transitions (Bohr Model)',
    formula: 'En = −2.18×10⁻¹⁸ / n² J    ΔE = hf = hc/λ',
    formulaVars: [
      { symbol: 'En',  meaning: 'Energy of level n',           unit: 'J'  },
      { symbol: 'ΔE',  meaning: 'Energy of emitted/absorbed photon', unit: 'J' },
      { symbol: 'h',   meaning: 'Planck\'s constant',          unit: '6.626×10⁻³⁴ J·s' },
      { symbol: 'λ',   meaning: 'Wavelength',                  unit: 'm'  },
    ],
    description:
      'In the Bohr model, electrons occupy fixed energy levels. A transition from higher to lower n releases a photon; lower to higher n absorbs one. ' +
      'ΔE = −2.18×10⁻¹⁸(1/nf² − 1/ni²) J. Emission series: Lyman (UV, to n=1), Balmer (visible, to n=2), Paschen (IR, to n=3).',
    example: {
      scenario: 'Calculate the wavelength of the n=3→n=1 transition in hydrogen.',
      steps: [
        'ΔE = −2.18×10⁻¹⁸(1/1² − 1/3²) = −2.18×10⁻¹⁸(1 − 1/9) = −1.94×10⁻¹⁸ J',
        '|ΔE| = 1.94×10⁻¹⁸ J',
        'λ = hc/|ΔE| = (6.626×10⁻³⁴ × 3.00×10⁸) / 1.94×10⁻¹⁸',
      ],
      result: 'λ = 1.02×10⁻⁷ m = 102 nm (UV, Lyman series)',
    },
  },
  isoelectronic: {
    title: 'Isoelectronic Series',
    formula: 'same e⁻ count, different Z → radius ∝ 1/Z',
    formulaVars: [
      { symbol: 'Z',   meaning: 'Nuclear charge (atomic number)', unit: 'protons'     },
      { symbol: 'e⁻',  meaning: 'Electron count (same for all)',  unit: 'electrons'   },
      { symbol: 'r',   meaning: 'Ionic radius',                   unit: 'pm'          },
    ],
    description:
      'Isoelectronic species contain the same number of electrons. ' +
      'With the same electron–electron repulsion, a higher nuclear charge pulls the electrons closer → smaller radius. ' +
      'Anions are larger; cations are smaller. Order by Z to rank size.',
    example: {
      scenario: 'Rank O²⁻, F⁻, Na⁺, Mg²⁺ by size (all have 10 electrons).',
      steps: ['Z values: O(8), F(9), Na(11), Mg(12)', 'Higher Z = stronger pull on same electrons = smaller radius'],
      result: 'O²⁻ > F⁻ > Na⁺ > Mg²⁺',
    },
  },
  em_spectrum: {
    title: 'Electromagnetic Spectrum',
    formula: 'c = λf    E = hf = hc/λ',
    formulaVars: [
      { symbol: 'c',  meaning: 'Speed of light',      unit: '3.00×10⁸ m/s'     },
      { symbol: 'λ',  meaning: 'Wavelength',           unit: 'm (nm for light)'  },
      { symbol: 'f',  meaning: 'Frequency',            unit: 'Hz (s⁻¹)'          },
      { symbol: 'h',  meaning: 'Planck\'s constant',   unit: '6.626×10⁻³⁴ J·s'  },
      { symbol: 'E',  meaning: 'Photon energy',        unit: 'J'                 },
    ],
    description:
      'Interconvert wavelength, frequency, and photon energy for any electromagnetic radiation. ' +
      'Higher frequency → shorter wavelength → higher energy per photon. ' +
      'Visible light spans 400 nm (violet) to 700 nm (red). UV, X-rays, and γ-rays are higher energy; IR, microwaves, radio are lower energy.',
    example: {
      scenario: 'Green light: λ = 500 nm. Find its frequency and photon energy.',
      steps: [
        'f = c/λ = (3.00×10⁸ m/s) / (500×10⁻⁹ m) = 6.00×10¹⁴ Hz',
        'E = hf = (6.626×10⁻³⁴)(6.00×10¹⁴)',
      ],
      result: 'f = 6.00×10¹⁴ Hz,  E = 3.98×10⁻¹⁹ J',
    },
  },
  multi_electron: {
    title: 'Multi-Electron Atoms — Shielding and Zeff',
    formula: 'Zeff = Z − σ',
    formulaVars: [
      { symbol: 'Zeff', meaning: 'Effective nuclear charge felt by outer electrons', unit: 'protons' },
      { symbol: 'Z',    meaning: 'Actual nuclear charge',                            unit: 'protons' },
      { symbol: 'σ',    meaning: 'Shielding constant (Slater rules)',                unit: '—'       },
    ],
    description:
      'Inner electrons partially shield outer electrons from the full nuclear charge. ' +
      'Higher Zeff → stronger attraction → smaller atomic radius, higher ionisation energy. ' +
      'Slater rules: same-shell electrons shield 0.35 each; n−1 shell electrons shield 0.85 each; deeper shells shield 1.00 each.',
    example: {
      scenario: 'Estimate Zeff for the 3s valence electron of Na (Z = 11).',
      steps: [
        'Electron configuration: [Ne] 3s¹ = 1s² 2s² 2p⁶ 3s¹',
        'Shielding: 8 electrons in n=2 shell × 0.85 = 6.80; 2 electrons in n=1 × 1.00 = 2.00',
        'σ = 6.80 + 2.00 = 8.80; Zeff = 11 − 8.80',
      ],
      result: 'Zeff = 2.20',
    },
  },
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ElectronConfigPage() {
  const [params, setParams] = useSearchParams()
  const [showExplanation, setShowExplanation] = useState(false)
  const topic = (params.get('topic') ?? 'electron_config') as Topic
  const mode  = (params.get('mode')  ?? 'reference') as Mode

  const topicModes = TOPIC_MODES[topic]

  function setTopic(t: Topic) {
    setParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('topic', t)
      next.delete('mode')
      return next
    }, { replace: true })
  }

  function setMode(m: Mode) {
    setParams(prev => {
      const next = new URLSearchParams(prev)
      if (m === 'reference') next.delete('mode')
      else next.set('mode', m)
      return next
    }, { replace: true })
  }

  return (
    <PageShell>

      <div className="flex flex-col gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Atomic Structure</h2>
          {(!topicModes || mode === 'reference') && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-1 rounded-sm font-sans text-sm border border-border
                         text-secondary hover:text-primary hover:border-muted transition-colors"
            >
              <span>⎙</span>
              <span>Print</span>
            </button>
          )}
          {EXPLANATIONS[topic] && (
            <button
              onClick={() => setShowExplanation(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-border
                         font-sans text-xs text-secondary hover:text-primary hover:border-muted transition-colors"
            >
              <span className="font-mono">?</span>
              <span>What is this</span>
            </button>
          )}
        </div>

        {/* Per-topic mode toggle — only shown for topics with multiple modes */}
        {topicModes && topicModes.length > 1 && (
          <div className="flex items-center gap-1 p-1 rounded-full self-start"
            style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
            {topicModes.map(m => (
              <button key={m} onClick={() => setMode(m)}
                className="relative px-5 py-1.5 rounded-full font-sans text-sm font-medium transition-colors capitalize"
                style={{ color: mode === m ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.35)' }}>
                {mode === m && (
                  <motion.div layoutId="atomic-mode-switch" className="absolute inset-0 rounded-full"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                )}
                <span className="relative z-10">{m}</span>
              </button>
            ))}
          </div>
        )}

        {/* Grouped topic pills */}
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-x-6 md:gap-y-4">
          {TOPIC_GROUPS.map(group => (
            <div key={group.label} className="flex flex-col gap-2 px-3 py-2 rounded-sm"
              style={{ background: 'rgb(var(--color-base))', border: '1px solid rgb(var(--color-border))' }}>
              <p className="font-mono text-xs text-secondary tracking-widest uppercase">{group.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {group.topics.map(t => {
                  const isActive = topic === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTopic(t.id)}
                      className="relative flex flex-col items-start px-4 py-2 rounded-sm font-sans text-sm
                                 font-medium transition-all text-left"
                      style={isActive ? {
                        background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                        border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                        color: 'var(--c-halogen)',
                      } : {
                        background: 'rgb(var(--color-surface))',
                        border: '1px solid rgb(var(--color-border))',
                        color: 'rgba(var(--overlay),0.45)',
                      }}
                    >
                      <span>{t.label}</span>
                      <span className="font-mono text-[9px] mt-0.5 opacity-60">{t.subtitle}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Topic content */}
      <AnimatePresence mode="wait">
        <motion.div key={`${topic}-${mode}`}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
          {topic === 'electron_config' && mode === 'reference' && (
            <div className="flex flex-col gap-12">
              <OrbitalBoxDiagram />
              <div className="flex flex-col gap-4">
                <div className="border-t border-border pt-8">
                  <p className="font-mono text-xs text-secondary tracking-widest uppercase mb-6">Para- and Diamagnetism</p>
                  <ParaDiaMagnetic />
                </div>
              </div>
            </div>
          )}
          {topic === 'electron_config' && mode === 'practice'  && <ElectronConfig />}
          {topic === 'electron_config' && mode === 'problems'  && <ElectronConfigPractice />}
          {topic === 'quantum_numbers' && mode === 'reference' && <QuantumNumbersReference />}
          {topic === 'quantum_numbers' && mode === 'problems'  && <AtomicPractice subtopic="quantum_numbers" />}
          {topic === 'energy_levels'   && mode === 'reference' && <EnergyLevelsReference />}
          {topic === 'energy_levels'   && mode === 'problems'  && <AtomicPractice subtopic="energy_levels" />}
          {topic === 'isoelectronic'   && <IsoelectronicSeries />}
          {topic === 'em_spectrum'     && <ElectromagneticSpectrum />}
          {topic === 'multi_electron'   && <MultiElectronAtoms />}
          {topic === 'periodic_trends' && mode === 'reference' && <PeriodicTrendsReference />}
          {topic === 'periodic_trends' && mode === 'practice'  && <PeriodicTrendsPractice />}
          {topic === 'isotopes' && mode === 'reference' && <IsotopeAbundanceReference />}
          {topic === 'isotopes' && mode === 'practice'  && <ReverseIsotopeTool />}
          {topic === 'isotopes' && mode === 'problems'  && <IsotopeAbundancePractice />}
          {topic === 'naming'   && mode === 'reference' && <NamingReference />}
          {topic === 'naming'   && mode === 'problems'  && <NomenclatureTool />}
        </motion.div>
      </AnimatePresence>

      {EXPLANATIONS[topic] && (
        <ExplanationModal
          content={EXPLANATIONS[topic]!}
          open={showExplanation}
          onClose={() => setShowExplanation(false)}
        />
      )}
    </PageShell>
  )
}
