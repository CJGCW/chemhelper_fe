import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function SugarReactionsReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <div>
        <h3 className="font-sans font-semibold text-base text-primary mb-1">Sugar Reactions &amp; Disaccharides</h3>
        <p className="font-sans text-xs text-secondary">Brown Ch. 25.</p>
      </div>

      {/* Key reactions */}
      {[
        {
          name: 'Glycoside Formation',
          reagents: 'Sugar + R–OH, H⁺ (acid catalyst)',
          product: 'Glycoside (acetal at anomeric carbon)',
          type: 'Acetal formation',
          key: 'Locks the anomer — no more mutarotation. Stable to base, hydrolyzed by acid. C–O–R at anomeric C.',
          test: 'Glycosides do NOT reduce Tollens or Benedict\'s (no free anomeric OH).',
        },
        {
          name: 'Oxidation — Bromine Water',
          reagents: 'Sugar + Br₂ / H₂O',
          product: 'Aldonic acid (CHO → COOH at C1 only)',
          type: 'Mild oxidation',
          key: 'Only aldoses react (aldehyde is oxidized). Ketoses are NOT oxidized. This distinguishes aldoses from ketoses.',
          test: 'Useful test: ketoses (like fructose) are NOT oxidized by bromine water.',
        },
        {
          name: 'Oxidation — Dilute HNO₃',
          reagents: 'Sugar + HNO₃ (dilute, warm)',
          product: 'Aldaric acid (both C1 CHO AND C6 CH₂OH → COOH)',
          type: 'Strong oxidation',
          key: 'Both ends oxidized. If the resulting aldaric acid is meso (has a plane of symmetry), the sugar has a symmetric arrangement of stereocenters.',
          test: 'Galactose → mucic acid (meso) confirms C3 and C4 are symmetric; glucose → glucaric acid (not meso).',
        },
        {
          name: 'Reduction — NaBH₄',
          reagents: 'Sugar + NaBH₄ (or H₂/catalyst)',
          product: 'Alditol (CHO → CH₂OH at C1)',
          type: 'Reduction of aldehyde',
          key: 'Reduces the carbonyl to an alcohol. Alditols have no anomeric carbon → no mutarotation, not a reducing sugar.',
          test: 'Glucose → glucitol (sorbitol). Galactose → galactitol (dulcitol, meso).',
        },
        {
          name: 'Reducing Sugars (Tollens / Benedict\'s)',
          reagents: 'Sugar + Ag⁺ (Tollens) or Cu²⁺ (Benedict\'s)',
          product: 'Silver mirror or Cu₂O precipitate (brick red)',
          type: 'Oxidation test',
          key: 'A REDUCING SUGAR has a free anomeric OH (or can open to the aldehyde form). Glycosides are NOT reducing. Sucrose is NOT reducing.',
          test: 'Reducing: glucose, fructose, galactose, maltose, lactose. Non-reducing: sucrose (both anomeric C locked in glycosidic bond).',
        },
      ].map(r => (
        <section key={r.name} className="flex flex-col gap-2">
          <h4 className="font-sans font-semibold text-sm text-primary">{r.name}</h4>
          <div className="rounded-sm border border-border p-4 flex flex-col gap-2" style={{ background: 'rgb(var(--color-raised))' }}>
            <div className="grid grid-cols-3 gap-2 text-xs font-sans">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[10px] text-dim uppercase tracking-widest">Reagents</span>
                <span className="text-secondary">{r.reagents}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[10px] text-dim uppercase tracking-widest">Product</span>
                <span className="text-secondary">{r.product}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[10px] text-dim uppercase tracking-widest">Type</span>
                <span className="text-secondary">{r.type}</span>
              </div>
            </div>
            <p className="font-sans text-xs text-secondary leading-relaxed border-t border-border/50 pt-2">{r.key}</p>
            <p className="font-sans text-xs text-dim italic">{r.test}</p>
          </div>
        </section>
      ))}

      {/* Disaccharides and polysaccharides */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Disaccharides &amp; Polysaccharides</h4>
        <div className="overflow-x-auto rounded-sm border border-border">
          <table className="text-xs font-sans border-collapse w-full">
            <thead>
              <tr className="border-b border-border bg-raised">
                <th className="px-3 py-2 text-left font-semibold text-secondary">Name</th>
                <th className="px-3 py-2 text-left font-semibold text-secondary">Components</th>
                <th className="px-3 py-2 text-left font-semibold text-secondary">Linkage</th>
                <th className="px-3 py-2 text-left font-semibold text-secondary">Reducing?</th>
                <th className="px-3 py-2 text-left font-semibold text-secondary">Notes</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Maltose', comp: 'Glucose + Glucose', link: 'α(1→4)', reducing: 'Yes', notes: 'From starch hydrolysis; malt sugar' },
                { name: 'Cellobiose', comp: 'Glucose + Glucose', link: 'β(1→4)', reducing: 'Yes', notes: 'From cellulose hydrolysis; same monomers as maltose, different linkage' },
                { name: 'Lactose', comp: 'Galactose + Glucose', link: 'β(1→4)', reducing: 'Yes', notes: 'Milk sugar; lactase cleaves it; lactose intolerance = lactase deficiency' },
                { name: 'Sucrose', comp: 'Glucose + Fructose', link: 'α(1)→β(2)', reducing: 'NO', notes: 'Table sugar; both anomeric carbons locked in bond; no free anomeric OH' },
                { name: 'Amylose', comp: 'Glucose polymer', link: 'α(1→4)', reducing: 'Yes (end only)', notes: 'Linear component of starch; forms helical structure; stains blue with I₂' },
                { name: 'Amylopectin', comp: 'Glucose polymer', link: 'α(1→4) + α(1→6) branches', reducing: 'Yes', notes: 'Branched starch; branches every ~25 residues; I₂ stain purple-red' },
                { name: 'Cellulose', comp: 'Glucose polymer', link: 'β(1→4)', reducing: 'Yes (end only)', notes: 'Plant cell walls; humans cannot digest; β linkage prevents enzyme access' },
                { name: 'Glycogen', comp: 'Glucose polymer', link: 'α(1→4) + α(1→6) branches', reducing: 'Yes', notes: 'Animal starch; highly branched (branch every ~10 residues); liver & muscle' },
              ].map(r => (
                <tr key={r.name} className="border-b border-border/50">
                  <td className="px-3 py-2 font-semibold text-primary">{r.name}</td>
                  <td className="px-3 py-2 text-secondary">{r.comp}</td>
                  <td className="px-3 py-2 font-mono text-secondary">{r.link}</td>
                  <td className="px-3 py-2">
                    <span className={`font-semibold ${r.reducing === 'NO' ? 'text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>{r.reducing}</span>
                  </td>
                  <td className="px-3 py-2 text-dim">{r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

// ── Practice ──────────────────────────────────────────────────────────────────

interface SugarRxnProblem {
  question: string
  options: string[]
  correct: string
  explanation: string
  category: string
}

const PROBLEMS: SugarRxnProblem[] = [
  {
    category: 'Reducing sugars', question: 'Which compound gives a positive Tollens test (reduces Ag⁺)?',
    options: ['Sucrose', 'Methyl α-D-glucoside (a glycoside)', 'Maltose', 'Cellulose'],
    correct: 'Maltose',
    explanation: 'Maltose is a reducing sugar — it has a free anomeric OH on the non-reducing end glucose unit, which can open to the aldehyde form and reduce Ag⁺. Sucrose is NON-reducing (both anomeric carbons locked). Methyl glucoside is a glycoside (acetal, no free anomeric OH). Cellulose has only one reducing end per polymer chain, and it is not readily accessible.',
  },
  {
    category: 'Glycoside stability', question: 'Methyl α-D-glucoside is treated with: (A) NaOH, then (B) dilute HCl. What happens?',
    options: [
      'Hydrolysis in NaOH; stable to HCl',
      'Stable to NaOH; hydrolysis in dilute HCl back to glucose + methanol',
      'Stable to both NaOH and HCl',
      'Hydrolysis in both NaOH and HCl',
    ],
    correct: 'Stable to NaOH; hydrolysis in dilute HCl back to glucose + methanol',
    explanation: 'Glycosides are acetals. Acetals are stable to base but hydrolyzed by acid. NaOH does not cleave the glycosidic C–O bond. Dilute HCl in water hydrolyzes the acetal back to glucose (hemiacetal = open-chain form) + methanol.',
  },
  {
    category: 'Oxidation', question: 'D-Galactose is treated with dilute HNO₃. The aldaric acid formed (galactaric acid / mucic acid) is:',
    options: [
      'Optically active (chiral)',
      'A meso compound (optically inactive, has internal plane of symmetry)',
      'A mixture of enantiomers',
      'Does not react with HNO₃',
    ],
    correct: 'A meso compound (optically inactive, has internal plane of symmetry)',
    explanation: 'D-Galactose oxidized at both ends (C1 CHO and C6 CH₂OH both → COOH) gives galactaric acid (mucic acid). Mucic acid is meso — the central mirror plane makes C3 and C4 symmetric. This is historically significant: Fischer used this fact to determine the structure of galactose.',
  },
  {
    category: 'Polysaccharides', question: 'Cellulose and starch (amylose) are both glucose polymers. Why can humans digest starch but not cellulose?',
    options: [
      'Starch has more glucose units',
      'Cellulose has β(1→4) linkages; human amylases only hydrolyze α(1→4) linkages',
      'Cellulose is a ketose polymer; starch is an aldose polymer',
      'Starch has more branches than cellulose',
    ],
    correct: 'Cellulose has β(1→4) linkages; human amylases only hydrolyze α(1→4) linkages',
    explanation: 'Amylose (starch) has α(1→4) glycosidic bonds. Human salivary and pancreatic amylases are designed to cleave α(1→4) bonds — they hydrolyze starch to maltose and glucose. Cellulose has β(1→4) bonds. Humans lack cellulase (the enzyme needed to cleave β(1→4) bonds). Cows and termites can digest cellulose because their gut bacteria produce cellulase.',
  },
  {
    category: 'Linkage differences', question: 'Maltose and cellobiose both contain two D-glucose units and are reducing sugars. How do they differ?',
    options: [
      'Maltose has α(1→4) linkage; cellobiose has β(1→4) linkage',
      'Maltose has β(1→4) linkage; cellobiose has α(1→4) linkage',
      'Both have α(1→4) linkages but differ at C2',
      'They have the same linkage but different ring sizes',
    ],
    correct: 'Maltose has α(1→4) linkage; cellobiose has β(1→4) linkage',
    explanation: 'Maltose (from starch) has an α(1→4) glycosidic bond. Cellobiose (from cellulose) has a β(1→4) bond. Same monosaccharides, same connectivity position (C1 to C4), different stereochemistry at the glycosidic bond. This single difference in linkage configuration explains why starch is digestible (sweet, water-soluble) while cellulose is structural (rigid, fibrous, indigestible).',
  },
  {
    category: 'Sucrose', question: 'Why is sucrose classified as a non-reducing sugar?',
    options: [
      'It does not contain glucose',
      'Both anomeric carbons (glucose C1 and fructose C2) are engaged in the glycosidic bond',
      'Sucrose is an ether, not an acetal',
      'Sucrose cannot dissolve in water',
    ],
    correct: 'Both anomeric carbons (glucose C1 and fructose C2) are engaged in the glycosidic bond',
    explanation: 'In sucrose, the glycosidic bond links glucose-C1(α) to fructose-C2(β). Both anomeric carbons are tied up in the bond — neither can undergo ring opening to the aldehyde/ketone form needed for Tollens/Benedict\'s reduction. Hydrolysis of sucrose (inversion by acid or sucrase) gives glucose + fructose — now both are reducing sugars.',
  },
]

function pickRandom(): SugarRxnProblem {
  return PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]
}

function SugarRxnPractice() {
  const [problem, setProblem] = useState<SugarRxnProblem>(pickRandom)
  const [selected, setSelected] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const correct = selected === problem.correct

  function handleCheck() {
    if (!selected || checked) return
    setChecked(true)
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  function handleNext() {
    setProblem(pickRandom())
    setSelected(null)
    setChecked(false)
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgb(var(--color-raised))' }}>
            <motion.div className="h-full rounded-full bg-emerald-500"
              animate={{ width: `${(score.correct / score.total) * 100}%` }} transition={{ duration: 0.4 }} />
          </div>
          <span className="font-mono text-xs text-secondary shrink-0">{score.correct} / {score.total}</span>
        </div>
      )}

      <div className="rounded-sm border border-border p-4 flex flex-col gap-2" style={{ background: 'rgb(var(--color-raised))' }}>
        <span className="font-mono text-[10px] text-dim uppercase tracking-widest">{problem.category}</span>
        <p className="font-sans text-sm text-primary font-medium leading-relaxed">{problem.question}</p>
      </div>

      <div className="flex flex-col gap-2">
        {problem.options.map(opt => {
          const isSelected = selected === opt
          const isCorrect = opt === problem.correct
          let borderColor = 'rgb(var(--color-border))'
          let bg = 'rgb(var(--color-raised))'
          if (checked) {
            if (isCorrect) { borderColor = 'rgb(34 197 94)'; bg = 'rgb(34 197 94 / 0.06)' }
            else if (isSelected) { borderColor = 'rgb(239 68 68)'; bg = 'rgb(239 68 68 / 0.06)' }
          } else if (isSelected) {
            borderColor = 'var(--c-halogen)'
            bg = 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-raised)))'
          }
          return (
            <button key={opt} onClick={() => !checked && setSelected(opt)} disabled={checked}
              className="px-3 py-2.5 rounded-sm border text-left font-sans text-xs leading-relaxed transition-colors"
              style={{ borderColor, background: bg, color: 'rgb(var(--overlay)/0.8)' }}>
              {opt}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2">
        {!checked ? (
          <button onClick={handleCheck} disabled={!selected}
            className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium disabled:opacity-40"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                     color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)' }}>
            Check
          </button>
        ) : (
          <button onClick={handleNext}
            className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                     color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)' }}>
            Next
          </button>
        )}
      </div>

      <AnimatePresence>
        {checked && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`rounded-sm border px-4 py-3 flex flex-col gap-1.5 ${correct ? 'border-emerald-500/30' : 'border-red-500/30'}`}
            style={{ background: correct ? 'rgb(34 197 94 / 0.06)' : 'rgb(239 68 68 / 0.06)' }}>
            <p className={`font-sans text-sm font-semibold ${correct ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-400'}`}>
              {correct ? '✓ Correct!' : '✗ Incorrect'}
            </p>
            <p className="font-sans text-xs text-secondary leading-relaxed">{problem.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface Props { allowCustom?: boolean }

export default function SugarReactions({ allowCustom = true }: Props) {
  return allowCustom
    ? <div className="flex flex-col gap-10"><SugarReactionsReference /><div className="border-t border-border" /><SugarRxnPractice /></div>
    : <SugarRxnPractice />
}
