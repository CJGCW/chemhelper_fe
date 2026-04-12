import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { checkSigFigAnswer } from '../../utils/sigfigPractice'
import { checkEmpiricalAnswer } from '../../utils/empiricalPractice'
import { checkConversionAnswer } from '../../utils/conversionPractice'
import { checkAtomicAnswer } from '../../utils/atomicPractice'
import { checkLewisProblem, checkVseprProblem } from '../../utils/lewisPractice'
import { checkStoichAnswer } from '../../utils/stoichiometryPractice'
import { checkRedoxAnswer } from '../../utils/redoxPractice'
import { checkPercCompAnswer } from '../../utils/percentCompositionPractice'
import { checkGasStoichAnswer } from '../../utils/gasStoichPractice'
import { checkSolStoichAnswer } from '../../utils/solutionStoichPractice'
import { checkBalanced, formatEquation } from '../../utils/balancingPractice'
import type { GeneratedTest, TestQuestion } from './testTypes'

// ── Answer checking ───────────────────────────────────────────────────────────

type Result = 'correct' | 'wrong' | 'wrong_sf' | 'blank'

function checkQuestion(q: TestQuestion, answer: string): Result {
  if (!answer || answer.trim() === '') return 'blank'

  if (q.problem.kind === 'sigfig') {
    const r = checkSigFigAnswer(answer, q.problem.data)
    if (r === 'correct') return 'correct'
    if (r === 'wrong_sf') return 'wrong_sf'
    return 'wrong'
  }
  if (q.problem.kind === 'empirical')
    return checkEmpiricalAnswer(answer, q.problem.data) ? 'correct' : 'wrong'
  if (q.problem.kind === 'conversion')
    return checkConversionAnswer(answer, q.problem.data) ? 'correct' : 'wrong'
  if (q.problem.kind === 'atomic')
    return checkAtomicAnswer(answer, q.problem.data) ? 'correct' : 'wrong'
  if (q.problem.kind === 'lewis')
    return checkLewisProblem(answer, q.problem.data) ? 'correct' : 'wrong'
  if (q.problem.kind === 'vsepr')
    return checkVseprProblem(answer, q.problem.data) ? 'correct' : 'wrong'
  if (q.problem.kind === 'stoich')
    return checkStoichAnswer(answer, q.problem.data) ? 'correct' : 'wrong'
  if (q.problem.kind === 'redox')
    return checkRedoxAnswer(answer, q.problem.data) ? 'correct' : 'wrong'
  if (q.problem.kind === 'perc_comp')
    return checkPercCompAnswer(q.problem.data, answer) ? 'correct' : 'wrong'
  if (q.problem.kind === 'gas_stoich')
    return checkGasStoichAnswer(q.problem.data, answer) ? 'correct' : 'wrong'
  if (q.problem.kind === 'sol_stoich')
    return checkSolStoichAnswer(q.problem.data, answer) ? 'correct' : 'wrong'
  if (q.problem.kind === 'balancing') {
    // answer: "2,1,2" — comma/space separated coefficients (reactants then products)
    const eq = q.problem.data
    const nums = answer.split(/[\s,]+/).map(s => parseInt(s)).filter(n => !isNaN(n))
    const nR = eq.reactants.length
    const rCoeffs = nums.slice(0, nR)
    const pCoeffs = nums.slice(nR)
    if (rCoeffs.length !== nR || pCoeffs.length !== eq.products.length) return 'wrong'
    return checkBalanced(eq, rCoeffs, pCoeffs).balanced ? 'correct' : 'wrong'
  }

  // molar
  const userVal = parseFloat(answer)
  if (isNaN(userVal)) return 'wrong'
  const correct = q.problem.data.answer
  if (correct === 0) return Math.abs(userVal) < 0.001 ? 'correct' : 'wrong'
  return Math.abs((userVal - correct) / correct) <= 0.01 ? 'correct' : 'wrong'
}

// ── Print window helpers ──────────────────────────────────────────────────────

function buildQuestionHtml(q: TestQuestion): string {
  const header = `<div class="q-header"><span class="q-num">${q.id}.</span><span class="q-topic">${q.topic}</span></div>`

  if (q.problem.kind === 'sigfig') {
    const p = q.problem.data
    const questionText = p.kind === 'count'
      ? `How many significant figures does <span class="mono-val">${p.display}</span> have?`
      : `Evaluate (apply sig fig rules): <span class="mono-val">${p.display}</span>`
    return `<div class="question">${header}<p class="q-text">${questionText}</p>
      <div class="answer-row"><span class="solve-for">Answer:</span><span class="answer-line"></span></div></div>`
  }

  if (q.problem.kind === 'empirical') {
    const p = q.problem.data
    return `<div class="question">${header}
      <p class="q-text">Determine the empirical formula from the following percent composition:</p>
      <div class="given">${p.elements.map(e =>
        `<span class="chip"><span class="label">${e.symbol}</span> ${e.percent}%</span>`
      ).join('')}</div>
      ${p.hint ? `<p class="q-text" style="font-size:10pt;color:#555;font-style:italic">Hint: ${p.hint}</p>` : ''}
      <div class="answer-row"><span class="solve-for">Empirical formula:</span><span class="answer-line"></span></div>
    </div>`
  }

  if (q.problem.kind === 'conversion') {
    const p = q.problem.data
    return `<div class="question">${header}
      <p class="q-text">${p.question}</p>
      <div class="answer-row"><span class="solve-for">Answer:</span><span class="answer-line"></span><span class="unit-label">${p.toUnit}</span></div>
    </div>`
  }

  if (q.problem.kind === 'atomic') {
    const p = q.problem.data
    const unitLabel = p.answerUnit ? `<span class="unit-label">${p.answerUnit}</span>` : ''
    const hintHtml  = p.hint ? `<p class="q-text" style="font-size:10pt;color:#555;font-style:italic">Hint: ${p.hint}</p>` : ''
    return `<div class="question">${header}
      <p class="q-text">${p.question}</p>${hintHtml}
      <div class="answer-row"><span class="solve-for">Answer:</span><span class="answer-line"></span>${unitLabel}</div>
    </div>`
  }

  if (q.problem.kind === 'lewis' || q.problem.kind === 'vsepr') {
    const p = q.problem.data
    const unitLabel = p.answerUnit ? `<span class="unit-label">${p.answerUnit}</span>` : ''
    return `<div class="question">${header}
      <p class="q-text">${p.question}</p>
      <div class="answer-row"><span class="solve-for">Answer:</span><span class="answer-line"></span>${unitLabel}</div>
    </div>`
  }

  if (q.problem.kind === 'redox') {
    const p = q.problem.data
    const rxnHtml = p.reactionEq
      ? `<p class="q-text" style="font-family:monospace;font-size:10pt;color:#555;">${p.reactionEq}</p>`
      : ''
    const hintHtml = p.hint ? `<p class="q-text" style="font-size:10pt;color:#555;font-style:italic">Hint: ${p.hint}</p>` : ''
    return `<div class="question">${header}
      ${rxnHtml}
      <p class="q-text">${p.question}</p>${hintHtml}
      <div class="answer-row"><span class="solve-for">Answer:</span><span class="answer-line"></span></div>
    </div>`
  }

  if (q.problem.kind === 'stoich') {
    const p = q.problem.data
    const lines = p.question.split('\n')
    const unitLabel = p.answerUnit ? `<span class="unit-label">${p.answerUnit}</span>` : ''
    const textHtml = lines.map((l, i) =>
      `<p class="q-text" style="${i === 0 ? 'font-family:monospace;font-size:10pt;color:#555;' : ''}">${l}</p>`
    ).join('')
    return `<div class="question">${header}
      ${textHtml}
      <div class="answer-row"><span class="solve-for">Answer:</span><span class="answer-line"></span>${unitLabel}</div>
    </div>`
  }

  if (q.problem.kind === 'perc_comp') {
    const p = q.problem.data
    return `<div class="question">${header}
      <p class="q-text">${p.question}</p>
      <div class="answer-row"><span class="solve-for">Answer:</span><span class="answer-line"></span><span class="unit-label">${p.answerUnit}</span></div>
    </div>`
  }

  if (q.problem.kind === 'gas_stoich') {
    const p = q.problem.data
    return `<div class="question">${header}
      <p class="q-text" style="font-family:monospace;font-size:10pt;color:#555;">${p.equation}</p>
      <p class="q-text">${p.question}</p>
      <div class="answer-row"><span class="solve-for">Answer:</span><span class="answer-line"></span><span class="unit-label">${p.answerUnit}</span></div>
    </div>`
  }

  if (q.problem.kind === 'sol_stoich') {
    const p = q.problem.data
    return `<div class="question">${header}
      <p class="q-text" style="font-family:monospace;font-size:10pt;color:#555;">${p.equation}</p>
      <p class="q-text">${p.question}</p>
      <div class="answer-row"><span class="solve-for">Answer:</span><span class="answer-line"></span><span class="unit-label">${p.answerUnit}</span></div>
    </div>`
  }

  if (q.problem.kind === 'balancing') {
    const eq = q.problem.data
    const blankSide = (species: typeof eq.reactants) =>
      species.map(s => `<span style="border-bottom:1px solid #111;display:inline-block;min-width:18px;margin:0 2px;">&nbsp;&nbsp;</span> ${s.display}`).join(' + ')
    const blankedEq = `${blankSide(eq.reactants)} → ${blankSide(eq.products)}`
    const speciesOrder = [...eq.reactants, ...eq.products].map(s => s.display).join(', ')
    return `<div class="question">${header}
      <p class="q-text">Balance the following equation:</p>
      <p class="q-text" style="font-family:serif;font-size:13pt;margin:8px 0 4px 22px;">${blankedEq}</p>
      <p class="q-text" style="font-size:9pt;color:#777;font-family:monospace;">Enter coefficients as: ${speciesOrder}</p>
      <div class="answer-row"><span class="solve-for">Coefficients:</span><span class="answer-line" style="width:200px;"></span></div>
    </div>`
  }

  // molar
  const p = q.problem.data
  const givenHtml = p.style === 'arithmetic' && p.given.length > 0
    ? `<div class="given">${p.given.map(g =>
        `<span class="chip"><span class="label">${g.label} =</span> ${g.value} <span class="unit">${g.unit}</span></span>`
      ).join('')}</div>`
    : ''
  return `<div class="question">${header}
    <p class="q-text">${p.question}</p>${givenHtml}
    <div class="answer-row"><span class="solve-for">${p.solveFor} =</span><span class="answer-line"></span><span class="unit-label">${p.answerUnit}</span></div>
  </div>`
}

function buildAnswerKeyHtml(q: TestQuestion): string {
  let answer: string
  if (q.problem.kind === 'sigfig')
    answer = q.problem.data.correctAnswer
  else if (q.problem.kind === 'empirical')
    answer = q.problem.data.empiricalDisplay
  else if (q.problem.kind === 'conversion')
    answer = `${q.problem.data.answer} ${q.problem.data.answerUnit}`
  else if (q.problem.kind === 'atomic')
    answer = q.problem.data.answerUnit
      ? `${q.problem.data.answer} ${q.problem.data.answerUnit}`
      : q.problem.data.answer
  else if (q.problem.kind === 'lewis' || q.problem.kind === 'vsepr')
    answer = q.problem.data.answerUnit
      ? `${q.problem.data.answer} ${q.problem.data.answerUnit}`
      : q.problem.data.answer
  else if (q.problem.kind === 'stoich')
    answer = q.problem.data.answerUnit
      ? `${q.problem.data.answer} ${q.problem.data.answerUnit}`
      : q.problem.data.answer
  else if (q.problem.kind === 'redox')
    answer = q.problem.data.answer
  else if (q.problem.kind === 'perc_comp')
    answer = `${q.problem.data.answer.toPrecision(4)} ${q.problem.data.answerUnit}`
  else if (q.problem.kind === 'gas_stoich')
    answer = `${q.problem.data.answer.toPrecision(4)} ${q.problem.data.answerUnit}`
  else if (q.problem.kind === 'sol_stoich')
    answer = `${q.problem.data.answer.toPrecision(4)} ${q.problem.data.answerUnit}`
  else if (q.problem.kind === 'balancing')
    answer = formatEquation(q.problem.data)
  else
    answer = `${q.problem.data.answer} ${q.problem.data.answerUnit}`
  return `<div class="key-row"><span class="key-num">${q.id}.</span><span class="key-ans">${answer}</span></div>`
}

const PRINT_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Georgia', serif; font-size: 13pt; color: #111; background: #fff; padding: 40px 52px; line-height: 1.5; }
  .test-header { border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 28px; }
  .test-header h1 { font-size: 20pt; font-weight: bold; }
  .test-header .meta { font-size: 11pt; color: #444; margin-top: 6px; }
  .name-date { display: flex; gap: 40px; margin-top: 14px; font-size: 12pt; }
  .name-date .field { display: flex; align-items: flex-end; gap: 8px; }
  .field-label { white-space: nowrap; font-size: 11pt; }
  .field-line { border-bottom: 1px solid #111; }
  .question { margin-bottom: 28px; page-break-inside: avoid; }
  .q-header { display: flex; align-items: baseline; gap: 8px; margin-bottom: 5px; }
  .q-num { font-weight: bold; font-size: 13pt; min-width: 22px; }
  .q-topic { font-family: monospace; font-size: 9pt; color: #555; border: 1px solid #ccc; padding: 1px 6px; border-radius: 2px; }
  .q-text { font-size: 12pt; margin-bottom: 8px; padding-left: 22px; line-height: 1.6; }
  .mono-val { font-family: monospace; font-size: 13pt; font-weight: bold; }
  .given { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 8px; padding-left: 22px; }
  .chip { font-family: monospace; font-size: 10pt; border: 1px solid #ccc; padding: 2px 8px; border-radius: 2px; background: #f7f7f7; }
  .chip .label { color: #555; }
  .chip .unit { color: #555; font-size: 9pt; }
  .answer-row { display: flex; align-items: flex-end; gap: 10px; padding-left: 22px; margin-top: 4px; }
  .solve-for { font-family: monospace; font-size: 12pt; white-space: nowrap; }
  .answer-line { border-bottom: 1px solid #111; width: 160px; height: 22px; }
  .unit-label { font-family: monospace; font-size: 11pt; color: #444; }
  .answer-key { padding-top: 28px; }
  .answer-key h2 { font-size: 16pt; margin-bottom: 16px; border-bottom: 1px solid #ccc; padding-bottom: 6px; }
  .key-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px 24px; }
  .key-row { display: flex; gap: 8px; align-items: baseline; font-size: 11pt; }
  .key-num { font-weight: bold; min-width: 22px; }
  .key-ans { font-family: monospace; font-size: 10pt; }
  .toolbar { position: fixed; top: 16px; right: 16px; display: flex; gap: 8px; }
  .toolbar button { padding: 6px 14px; font-family: sans-serif; font-size: 12pt; cursor: pointer; border: none; border-radius: 3px; }
  .btn-print { background: #2563eb; color: #fff; }
  .btn-close  { background: #111; color: #fff; }
  @media print { .toolbar { display: none; } }
`

function openWindow(title: string, bodyHtml: string) {
  const w = window.open('', '_blank', 'width=900,height=700')
  if (!w) return
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title><style>${PRINT_CSS}</style></head><body>
    <div class="toolbar">
      <button class="btn-print" onclick="window.print()">Print / Save PDF</button>
      <button class="btn-close" onclick="window.close()">Close</button>
    </div>
    ${bodyHtml}
  </body></html>`)
  w.document.close()
}

function openTestPrint(test: GeneratedTest) {
  const dateStr = test.generatedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const header = `
    <div class="test-header">
      <h1>${test.title}</h1>
      <div class="meta">Generated ${dateStr} · ${test.questions.length} questions</div>
      <div class="name-date">
        <div class="field"><span class="field-label">Name:</span><span class="field-line" style="width:220px">&nbsp;</span></div>
        <div class="field"><span class="field-label">Date:</span><span class="field-line" style="width:140px">&nbsp;</span></div>
        <div class="field"><span class="field-label">Score:</span><span class="field-line" style="width:80px">&nbsp;</span><span style="font-size:11pt">/ ${test.questions.length}</span></div>
      </div>
    </div>`
  openWindow(test.title, header + test.questions.map(buildQuestionHtml).join(''))
}

function openAnswerKeyPrint(test: GeneratedTest) {
  const dateStr = test.generatedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const header = `
    <div class="test-header">
      <h1>${test.title} — Answer Key</h1>
      <div class="meta">Generated ${dateStr} · ${test.questions.length} questions</div>
    </div>`
  const key = `<div class="answer-key"><div class="key-grid">${test.questions.map(buildAnswerKeyHtml).join('')}</div></div>`
  openWindow(`${test.title} — Answer Key`, header + key)
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props { test: GeneratedTest; onBack: () => void }

export default function TestSheet({ test, onBack }: Props) {
  const [answers, setAnswers]   = useState<Record<number, string>>({})
  const [checked, setChecked]   = useState(false)
  const [revealed, setRevealed] = useState<Set<number>>(new Set())

  function setAnswer(id: number, val: string) {
    if (checked) return
    setAnswers(prev => ({ ...prev, [id]: val }))
  }

  function toggleReveal(id: number) {
    setRevealed(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  const answeredCount = Object.values(answers).filter(v => v?.trim() !== '').length

  const results: Record<number, Result> | null = checked
    ? Object.fromEntries(test.questions.map(q => [q.id, checkQuestion(q, answers[q.id] ?? '')]))
    : null

  const score = results ? Object.values(results).filter(r => r === 'correct').length : null

  // ── Render question ──────────────────────────────────────────────────────────

  function renderQuestion(q: TestQuestion) {
    const result = results?.[q.id]
    const bgClass = result === 'correct' ? 'border-emerald-800/50 bg-emerald-950/20'
      : (result === 'wrong' || result === 'wrong_sf') ? 'border-rose-800/50 bg-rose-950/20'
      : result === 'blank' ? 'border-amber-800/40 bg-amber-950/10'
      : 'border-border bg-surface'

    const sfProblem   = q.problem.kind === 'sigfig'     ? q.problem.data : null
    const molarP      = q.problem.kind === 'molar'      ? q.problem.data : null
    const empiricalP  = q.problem.kind === 'empirical'  ? q.problem.data : null
    const conversionP = q.problem.kind === 'conversion' ? q.problem.data : null
    const atomicP     = q.problem.kind === 'atomic'     ? q.problem.data : null
    const lewisP      = q.problem.kind === 'lewis'      ? q.problem.data : null
    const vseprP      = q.problem.kind === 'vsepr'      ? q.problem.data : null
    const stoichP     = q.problem.kind === 'stoich'     ? q.problem.data : null
    const redoxP      = q.problem.kind === 'redox'      ? q.problem.data : null
    const percCompP   = q.problem.kind === 'perc_comp'  ? q.problem.data : null
    const gasStoichP  = q.problem.kind === 'gas_stoich' ? q.problem.data : null
    const solStoichP  = q.problem.kind === 'sol_stoich' ? q.problem.data : null
    const balancingP  = q.problem.kind === 'balancing'  ? q.problem.data : null

    const questionText = sfProblem
      ? (sfProblem.kind === 'count'
          ? <p className="font-sans text-base text-bright leading-relaxed pl-8">
              How many significant figures does{' '}
              <span className="font-mono text-xl tracking-wide">{sfProblem.display}</span> have?
            </p>
          : <p className="font-sans text-base text-bright leading-relaxed pl-8">
              Evaluate (apply sig fig rules):{' '}
              <span className="font-mono text-xl tracking-wide">{sfProblem.display}</span>
            </p>)
      : empiricalP
      ? <p className="font-sans text-base text-bright leading-relaxed pl-8">
          Determine the empirical formula from the percent composition:
        </p>
      : stoichP
      ? <div className="pl-8 flex flex-col gap-1">
          {stoichP.question.split('\n').map((line, i) =>
            i === 0
              ? <p key={i} className="font-mono text-xs text-secondary">{line}</p>
              : <p key={i} className="font-sans text-base text-bright leading-relaxed">{line}</p>
          )}
        </div>
      : redoxP
      ? <div className="pl-8 flex flex-col gap-1.5">
          {redoxP.reactionEq && (
            <p className="font-mono text-xs text-secondary">{redoxP.reactionEq}</p>
          )}
          <p className="font-sans text-base text-bright leading-relaxed">{redoxP.question}</p>
        </div>
      : gasStoichP
      ? <div className="pl-8 flex flex-col gap-1">
          <p className="font-mono text-xs text-secondary">{gasStoichP.equation}</p>
          <p className="font-sans text-base text-bright leading-relaxed">{gasStoichP.question}</p>
        </div>
      : solStoichP
      ? <div className="pl-8 flex flex-col gap-1">
          <p className="font-mono text-xs text-secondary">{solStoichP.equation}</p>
          <p className="font-sans text-base text-bright leading-relaxed">{solStoichP.question}</p>
        </div>
      : balancingP
      ? <div className="pl-8 flex flex-col gap-1.5">
          <p className="font-sans text-base text-bright leading-relaxed">Balance the following equation:</p>
          <p className="font-mono text-sm text-secondary">
            {[...balancingP.reactants, ...balancingP.products].map(s => s.display).join(' · ')}
          </p>
          <p className="font-sans text-xs text-dim">
            Enter coefficients in order (reactants then products), comma-separated, e.g.{' '}
            <span className="font-mono">{[...balancingP.reactants, ...balancingP.products].map(s => s.coeff).join(', ')}</span>
          </p>
        </div>
      : <p className="font-sans text-base text-bright leading-relaxed pl-8">
          {percCompP?.question ?? atomicP?.question ?? lewisP?.question ?? vseprP?.question ?? conversionP?.question ?? molarP!.question}
        </p>

    const correctAnswer = sfProblem
      ? sfProblem.correctAnswer
      : empiricalP
      ? empiricalP.empiricalDisplay
      : conversionP
      ? `${conversionP.answer} ${conversionP.toUnit}`
      : atomicP
      ? (atomicP.answerUnit ? `${atomicP.answer} ${atomicP.answerUnit}` : atomicP.answer)
      : lewisP
      ? (lewisP.answerUnit ? `${lewisP.answer} ${lewisP.answerUnit}` : lewisP.answer)
      : vseprP
      ? (vseprP.answerUnit ? `${vseprP.answer} ${vseprP.answerUnit}` : vseprP.answer)
      : stoichP
      ? (stoichP.answerUnit ? `${stoichP.answer} ${stoichP.answerUnit}` : stoichP.answer)
      : redoxP
      ? redoxP.answer
      : percCompP
      ? `${percCompP.answer.toPrecision(4)} ${percCompP.answerUnit}`
      : gasStoichP
      ? `${gasStoichP.answer.toPrecision(4)} ${gasStoichP.answerUnit}`
      : solStoichP
      ? `${solStoichP.answer.toPrecision(4)} ${solStoichP.answerUnit}`
      : balancingP
      ? formatEquation(balancingP)
      : `${molarP!.answer} ${molarP!.answerUnit}`

    const solutionSteps = sfProblem
      ? [sfProblem.explanation]
      : empiricalP
      ? empiricalP.steps
      : conversionP
      ? conversionP.steps
      : atomicP
      ? atomicP.steps
      : lewisP
      ? lewisP.steps
      : vseprP
      ? vseprP.steps
      : stoichP
      ? stoichP.steps
      : redoxP
      ? redoxP.steps
      : percCompP
      ? percCompP.steps
      : gasStoichP
      ? gasStoichP.steps
      : solStoichP
      ? solStoichP.steps
      : balancingP
      ? [`Balanced: ${formatEquation(balancingP)}`]
      : molarP!.steps

    return (
      <motion.div
        key={q.id}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(q.id * 0.015, 0.3), duration: 0.15 }}
        className={`rounded-sm border p-4 lg:p-5 flex flex-col gap-3 transition-colors ${bgClass}`}
      >
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-bright w-6 shrink-0">{q.id}.</span>
          <span className="font-mono text-[10px] text-dim border border-border px-2 py-0.5 rounded-sm">
            {q.topic}
          </span>
          {result === 'correct'  && <span className="ml-auto font-mono text-sm text-emerald-400">✓</span>}
          {result === 'wrong'    && <span className="ml-auto font-mono text-sm text-rose-400">✗</span>}
          {result === 'wrong_sf' && <span className="ml-auto font-sans text-xs text-orange-400">right value, check sig figs</span>}
          {result === 'blank'    && <span className="ml-auto font-mono text-xs text-amber-500">no answer</span>}
        </div>

        {questionText}

        {/* Empirical: element percentages */}
        {empiricalP && (
          <div className="flex flex-wrap gap-2 pl-8">
            {empiricalP.elements.map((e, i) => (
              <div key={i} className="px-3 py-1 rounded-sm border border-border bg-raised font-mono text-sm">
                <span className="text-bright">{e.symbol}</span>
                <span className="text-secondary ml-1">{e.percent}%</span>
              </div>
            ))}
            {empiricalP.hint && (
              <p className="w-full font-sans text-xs text-dim italic mt-0.5 pl-0.5">Hint: {empiricalP.hint}</p>
            )}
          </div>
        )}

        {/* Atomic: hint */}
        {atomicP?.hint && (
          <p className="font-sans text-xs text-dim italic pl-8">Hint: {atomicP.hint}</p>
        )}

        {/* Redox: hint */}
        {redoxP?.hint && (
          <p className="font-sans text-xs text-dim italic pl-8">Note: {redoxP.hint}</p>
        )}

        {/* Given chips (molar arithmetic only) */}
        {molarP && molarP.style === 'arithmetic' && molarP.given.length > 0 && (
          <div className="flex flex-wrap gap-2 pl-8">
            {molarP.given.map((g, i) => (
              <div key={i} className="px-3 py-1 rounded-sm border border-border bg-raised font-mono text-sm">
                <span className="text-secondary">{g.label} = </span>
                <span className="text-bright">{g.value}</span>
                <span className="text-secondary ml-1">{g.unit}</span>
              </div>
            ))}
          </div>
        )}

        {/* Answer input */}
        <div className="flex items-center gap-3 pl-8">
          {molarP && (
            <span className="font-mono text-base text-secondary whitespace-nowrap">{molarP.solveFor} =</span>
          )}
          {empiricalP && (
            <span className="font-mono text-base text-secondary whitespace-nowrap">EF =</span>
          )}
          <input
            type={(sfProblem || empiricalP || atomicP?.isTextAnswer || lewisP?.isTextAnswer || vseprP?.isTextAnswer || stoichP?.isTextAnswer || redoxP?.isTextAnswer || balancingP) ? 'text' : 'number'}
            inputMode={sfProblem?.kind === 'count' ? 'numeric' : 'decimal'}
            value={answers[q.id] ?? ''}
            onChange={e => setAnswer(q.id, e.target.value)}
            disabled={checked}
            placeholder={
              sfProblem?.kind === 'count' ? '# sig figs'
              : empiricalP ? 'e.g. CH2O'
              : atomicP?.isTextAnswer ? 'e.g. 1s²2s²2p⁶'
              : lewisP?.isTextAnswer ? 'e.g. Tetrahedral'
              : vseprP?.isTextAnswer ? 'e.g. sp³'
              : stoichP?.isTextAnswer ? 'formula, e.g. H₂'
              : redoxP?.isTextAnswer  ? 'formula, e.g. Zn'
              : redoxP               ? 'e.g. +6 or −2'
              : balancingP           ? 'e.g. 2, 1, 2'
              : 'answer'
            }
            className={`bg-raised border rounded-sm px-3 py-1.5 font-mono text-base
                        placeholder-dim focus:outline-none focus:border-muted
                        disabled:cursor-not-allowed transition-colors
                        ${(empiricalP || atomicP?.isTextAnswer || lewisP?.isTextAnswer || vseprP?.isTextAnswer || stoichP?.isTextAnswer || redoxP?.isTextAnswer || balancingP) ? 'w-44' : 'w-36'}
                        ${result === 'correct' ? 'border-emerald-700/60 text-emerald-300'
                          : (result === 'wrong' || result === 'wrong_sf') ? 'border-rose-700/60 text-rose-300'
                          : 'border-border text-bright'}`}
          />
          {molarP && (
            <span className="font-mono text-sm text-secondary">{molarP.answerUnit}</span>
          )}
          {conversionP && (
            <span className="font-mono text-sm text-secondary">{conversionP.toUnit}</span>
          )}
          {atomicP?.answerUnit && (
            <span className="font-mono text-sm text-secondary">{atomicP.answerUnit}</span>
          )}
          {lewisP?.answerUnit && (
            <span className="font-mono text-sm text-secondary">{lewisP.answerUnit}</span>
          )}
          {vseprP?.answerUnit && (
            <span className="font-mono text-sm text-secondary">{vseprP.answerUnit}</span>
          )}
          {stoichP?.answerUnit && (
            <span className="font-mono text-sm text-secondary">{stoichP.answerUnit}</span>
          )}
          {percCompP && (
            <span className="font-mono text-sm text-secondary">{percCompP.answerUnit}</span>
          )}
          {gasStoichP && (
            <span className="font-mono text-sm text-secondary">{gasStoichP.answerUnit}</span>
          )}
          {solStoichP && (
            <span className="font-mono text-sm text-secondary">{solStoichP.answerUnit}</span>
          )}

          {checked && (
            <button
              onClick={() => toggleReveal(q.id)}
              className="ml-2 font-mono text-xs text-dim hover:text-secondary transition-colors"
            >
              {revealed.has(q.id) ? '▲ hide' : '▼ solution'}
            </button>
          )}
        </div>

        {/* Revealed solution */}
        <AnimatePresence>
          {revealed.has(q.id) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="pl-8 flex flex-col gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-dim">Answer:</span>
                  <span className="font-mono text-sm text-bright">{correctAnswer}</span>
                </div>
                <div className="flex flex-col gap-1.5 pl-3 border-l border-border">
                  {solutionSteps.map((step, i) => (
                    <p key={i} className="font-mono text-sm text-primary">{step}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-border
                     font-sans text-sm text-secondary hover:text-primary hover:border-muted transition-colors"
        >
          ← Back to setup
        </button>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {checked && score !== null && (
            <span className="font-mono text-sm text-secondary">
              Score: <span className="text-bright">{score}</span><span className="text-dim"> / {test.questions.length}</span>
            </span>
          )}

          {!checked ? (
            <>
              <span className="font-mono text-xs text-dim">{answeredCount} / {test.questions.length} answered</span>
              <button
                onClick={() => setChecked(true)}
                disabled={answeredCount === 0}
                className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors
                           disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 15%, #141620)',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                  color: 'var(--c-halogen)',
                }}
              >
                Check All
              </button>
            </>
          ) : (
            <button
              onClick={() => { setAnswers({}); setChecked(false); setRevealed(new Set()) }}
              className="px-4 py-1.5 rounded-sm font-sans text-sm border border-border
                         text-secondary hover:text-primary hover:border-muted transition-colors"
            >
              Reset
            </button>
          )}

          <button
            onClick={() => openTestPrint(test)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-sans text-sm
                       border border-border text-secondary hover:text-primary hover:border-muted transition-colors"
          >
            <span className="font-mono text-xs">⎙</span> Print Test
          </button>
          <button
            onClick={() => openAnswerKeyPrint(test)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-sans text-sm
                       border border-border text-secondary hover:text-primary hover:border-muted transition-colors"
          >
            <span className="font-mono text-xs">⎙</span> Answer Key
          </button>
        </div>
      </div>

      {/* Test title */}
      <div>
        <h3 className="font-sans font-semibold text-bright text-lg">{test.title}</h3>
        <p className="font-mono text-xs text-dim mt-0.5">
          {test.questions.length} questions ·{' '}
          {test.generatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Questions */}
      <div className="flex flex-col gap-4">
        {test.questions.map(q => renderQuestion(q))}
      </div>

      {/* Bottom bar */}
      {!checked && (
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => setChecked(true)}
            disabled={answeredCount === 0}
            className="px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors
                       disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 15%, #141620)',
              border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
              color: 'var(--c-halogen)',
            }}
          >
            Check All ({answeredCount} / {test.questions.length} answered)
          </button>
          <button onClick={() => openTestPrint(test)}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border
                       text-secondary hover:text-primary hover:border-muted transition-colors">
            ⎙ Print Test
          </button>
          <button onClick={() => openAnswerKeyPrint(test)}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border
                       text-secondary hover:text-primary hover:border-muted transition-colors">
            ⎙ Answer Key
          </button>
        </div>
      )}
    </div>
  )
}
