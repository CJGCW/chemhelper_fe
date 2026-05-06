import { useState } from 'react'
import CompoundDisplay from '../shared/CompoundDisplay'

interface PolyProblem {
  monomer: string
  monomerSmiles?: string  // SMILES for single-monomer problems; omitted for two-component systems
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  type: 'addition' | 'condensation'
}

const PROBLEMS: PolyProblem[] = [
  {
    monomer: 'Ethylene (CH₂=CH₂)',
    monomerSmiles: 'C=C',
    question: 'What type of polymerization produces polyethylene from ethylene?',
    options: ['Addition (chain-growth)', 'Condensation (step-growth)', 'Ring-opening'],
    correctIndex: 0,
    explanation: 'Ethylene undergoes addition polymerization (radical, Ziegler-Natta, or other). The C=C double bond opens to form new C–C bonds. No byproduct is formed.',
    type: 'addition',
  },
  {
    monomer: 'Terephthalic acid + ethylene glycol',
    question: 'What type of polymerization forms PET (polyethylene terephthalate)?',
    options: ['Addition (chain-growth)', 'Condensation (step-growth)', 'Cationic addition'],
    correctIndex: 1,
    explanation: 'A diacid reacts with a diol in a condensation (step-growth) reaction, releasing H₂O at each step. The repeat unit is an ester linkage — PET is a polyester.',
    type: 'condensation',
  },
  {
    monomer: 'Styrene (CH₂=CHC₆H₅)',
    monomerSmiles: 'C=Cc1ccccc1',
    question: 'Polystyrene is made by radical polymerization. What is the correct repeat unit?',
    options: ['–CH₂–CH(C₆H₅)–', '–CH₂–CH₂–', '–CO–C₆H₄–CO–O–CH₂–CH₂–O–'],
    correctIndex: 0,
    explanation: 'Each styrene monomer (CH₂=CHPh) opens its C=C double bond to give the repeat unit –CH₂–CH(Ph)–. The phenyl group is the pendant substituent on every other carbon.',
    type: 'addition',
  },
  {
    monomer: 'Hexamethylenediamine + adipic acid',
    question: 'What polymer and byproduct are formed?',
    options: ['Nylon-6,6 + H₂O', 'Polyurethane (no byproduct)', 'Nylon-6 + CO₂'],
    correctIndex: 0,
    explanation: 'Hexamethylenediamine (diamine) + adipic acid (diacid) undergo condensation polymerization. Each amide bond formation releases one H₂O. Product is nylon-6,6 (named for the 6-carbon amine and 6-carbon acid).',
    type: 'condensation',
  },
  {
    monomer: 'Isobutylene (CH₂=C(CH₃)₂)',
    monomerSmiles: 'C=C(C)C',
    question: 'Isobutylene cannot be polymerized by radical initiation — why? What method works?',
    options: ['Radical works fine; cationic is just faster', 'Radical gives poor yields; cationic polymerization (BF₃, H⁺) works because the 2° carbocation is stabilized', 'Anionic polymerization is required'],
    correctIndex: 1,
    explanation: 'Isobutylene has electron-donating methyl groups that destabilize a radical but stabilize a carbocation. Cationic polymerization with Lewis acid (BF₃) works well, giving polyisobutylene (butyl rubber).',
    type: 'addition',
  },
  {
    monomer: 'Diisocyanate (R–NCO) + diol (HO–R\'–OH)',
    question: 'What small molecule (if any) is released during polyurethane formation?',
    options: ['H₂O', 'HCl', 'No byproduct — the OH adds directly to the isocyanate C=N'],
    correctIndex: 2,
    explanation: 'The –OH group of the diol adds across the C=N bond of the isocyanate (–NCO). This is an addition-condensation — no small molecule byproduct is released. This distinguishes polyurethanes from polyesters and polyamides.',
    type: 'condensation',
  },
  {
    monomer: 'Methyl methacrylate (CH₂=C(CH₃)COOCH₃)',
    monomerSmiles: 'C=C(C)C(=O)OC',
    question: 'Which initiation method gives a "living" polymer of PMMA with narrow MW distribution?',
    options: ['Radical initiation (AIBN)', 'Anionic initiation (BuLi)', 'Cationic initiation (BF₃)'],
    correctIndex: 1,
    explanation: 'Anionic polymerization is "living" — no termination step exists, so chains grow until all monomer is consumed. This gives very narrow polydispersity (Mw/Mn ≈ 1.1). Radical polymerization gives broader distribution (Mw/Mn ≈ 1.5-2).',
    type: 'addition',
  },
  {
    monomer: 'Propylene (CH₂=CHCH₃)',
    monomerSmiles: 'CC=C',
    question: 'A Ziegler-Natta catalyst is used to polymerize propylene. What is the tacticity of the product?',
    options: ['Atactic (random R-group orientation)', 'Isotactic (all CH₃ on same side)', 'Syndiotactic (alternating CH₃)'],
    correctIndex: 1,
    explanation: 'Ziegler-Natta catalysts (TiCl₄/AlR₃) produce isotactic polypropylene (iPP), where all methyl groups are on the same side of the polymer backbone. This is highly crystalline and much stronger than the atactic product from radical polymerization.',
    type: 'addition',
  },
  {
    monomer: 'Phenol + formaldehyde',
    question: 'Bakelite is a thermoset polymer. What structural feature makes it a thermoset?',
    options: ['Long linear chains with many hydrogen bonds', 'Extensive crosslinking — formaldehyde bridges connect phenol rings in a 3D network', 'High molecular weight linear chains without branching'],
    correctIndex: 1,
    explanation: 'Formaldehyde acts as a crosslinker, forming methylene bridges between the ortho and para positions of phenol rings. The highly crosslinked 3D network cannot be remelted — defining feature of a thermoset.',
    type: 'condensation',
  },
  {
    monomer: 'p-Phenylenediamine + terephthaloyl dichloride',
    question: 'What polymer is formed, and why is it exceptionally strong?',
    options: ['Nylon-6,6; strong due to high molecular weight', 'Kevlar; rigidity from aromatic rings + H-bonding between amide groups in aligned fibers', 'PET; ester bonds give rigidity'],
    correctIndex: 1,
    explanation: 'These two monomers give Kevlar (poly-p-phenylene terephthalamide). The rigid aromatic backbone and extensive inter-chain hydrogen bonding between amide groups create extraordinary tensile strength — higher than steel by weight.',
    type: 'condensation',
  },
]

export default function PolymerizationPractice({ allowCustom = true }: { allowCustom?: boolean }) {
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const problem = PROBLEMS[idx]
  const isCorrect = selected === problem.correctIndex

  function next() {
    const nextIdx = allowCustom
      ? Math.floor(Math.random() * PROBLEMS.length)
      : (idx + 1) % PROBLEMS.length
    setIdx(nextIdx)
    setSelected(null)
  }

  function handleSelect(i: number) {
    if (selected !== null) return
    setSelected(i)
    setScore(s => ({ correct: s.correct + (i === problem.correctIndex ? 1 : 0), total: s.total + 1 }))
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div>
        <h3 className="font-sans font-semibold text-base text-primary mb-1">Polymerization Practice</h3>
        <p className="font-sans text-xs text-secondary">Identify polymer type, mechanism, and properties from the monomer.</p>
      </div>

      {score.total > 0 && (
        <p className="text-xs font-sans text-secondary">
          Score: {score.correct}/{score.total} ({Math.round(100 * score.correct / score.total)}%)
        </p>
      )}

      <div className="rounded-sm border border-border p-5 flex flex-col gap-4" style={{ background: 'rgb(var(--color-raised))' }}>
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {problem.monomerSmiles && (
            <CompoundDisplay smiles={problem.monomerSmiles} label={problem.monomer} width={160} height={130} />
          )}
          <div className="flex flex-col gap-2 flex-1">
            <p className="text-xs font-sans text-secondary">Monomer(s):</p>
            <p className="font-mono text-sm text-primary font-semibold">{problem.monomer}</p>
            <p className="font-sans text-sm text-primary">{problem.question}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {problem.options.map((opt, i) => {
            let bg = 'rgb(var(--color-surface))'
            let border = 'rgb(var(--color-border))'
            let textCl = 'text-primary'
            if (selected !== null) {
              if (i === problem.correctIndex) { bg = '#16a34a20'; border = '#16a34a'; textCl = 'text-green-700 dark:text-green-400' }
              else if (i === selected) { bg = '#dc262620'; border = '#dc2626'; textCl = 'text-red-700 dark:text-red-400' }
            }
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={selected !== null}
                className="px-4 py-3 rounded-sm border text-left text-sm font-sans transition-colors"
                style={{ background: bg, borderColor: border, color: textCl }}
              >
                {opt}
              </button>
            )
          })}
        </div>

        {selected !== null && (
          <div className={`rounded-sm p-3 text-xs font-sans ${isCorrect ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-500/10 text-red-700 dark:text-red-400'}`}>
            <p className="font-semibold mb-1">{isCorrect ? 'Correct!' : 'Incorrect'}</p>
            <p>{problem.explanation}</p>
          </div>
        )}
      </div>

      <button
        onClick={next}
        className="self-start px-4 py-2 rounded-sm text-sm font-sans border transition-colors"
        style={{
          background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
          borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)',
          color: 'var(--c-halogen)',
        }}
      >
        Next Problem
      </button>
    </div>
  )
}
