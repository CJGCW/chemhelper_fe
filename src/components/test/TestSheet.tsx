import { useState, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { checkSigFigAnswer } from '../../utils/sigfigPractice'
import { checkEmpiricalAnswer } from '../../utils/empiricalPractice'
import { checkConversionAnswer } from '../../utils/conversionPractice'
import { checkAtomicAnswer } from '../../utils/atomicPractice'
import { checkLewisProblem, checkVseprProblem } from '../../utils/lewisPractice'
import LewisStructureDiagram, { lewisToSvgString } from '../lewis/LewisStructureDiagram'
const VseprDrawModal  = lazy(() => import('./VseprDrawModal'))
const LewisDrawModal  = lazy(() => import('./LewisDrawModal'))
import type { LewisSnapshot } from './LewisDrawModal'
import { checkStoichAnswer } from '../../utils/stoichiometryPractice'
import { checkRedoxAnswer } from '../../utils/redoxPractice'
import { checkPercCompAnswer } from '../../utils/percentCompositionPractice'
import { checkGasStoichAnswer } from '../../utils/gasStoichPractice'
import { checkSolStoichAnswer } from '../../utils/solutionStoichPractice'
import { checkBalanced, formatEquation } from '../../utils/balancingPractice'
import { checkCalorimetryAnswer } from '../../utils/calorimetryPractice'
import { checkEnthalpyAnswer } from '../../utils/enthalpyPractice'
import { checkHessAnswer } from '../../utils/hessLawPractice'
import { checkBondEnthalpyAnswer } from '../../utils/bondEnthalpyPractice'
import { checkHeatTransferAnswer } from '../../utils/heatTransferPractice'
import { checkVdWAnswer } from '../../utils/vanDerWaalsPractice'
import { checkGasAnswer } from '../../utils/idealGasPractice'
import { checkEcellAnswer } from '../../utils/ecellPractice'
import { checkRxnPracticeAnswer } from '../../utils/reactionPredictorPractice'
import { checkDilutionAnswer } from '../../utils/dilutionPractice'
import { checkConcAnswer } from '../../utils/concentrationPractice'
import { checkCCAnswer } from '../../utils/clausiusClapeyronPractice'
import { checkSigmaPiCombined } from '../../utils/sigmaPiPractice'
import type { HCProblem, Phase } from '../../utils/heatingCurveProblems'
import type { PDProblem } from '../../utils/phaseDiagramProblems'
import { identifyPhase } from '../../utils/phaseDiagramProblems'
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
  if (q.problem.kind === 'calorimetry')
    return checkCalorimetryAnswer(q.problem.data, answer) ? 'correct' : 'wrong'
  if (q.problem.kind === 'enthalpy')
    return checkEnthalpyAnswer(q.problem.data, answer) ? 'correct' : 'wrong'
  if (q.problem.kind === 'hess')
    return checkHessAnswer(q.problem.data, answer) ? 'correct' : 'wrong'
  if (q.problem.kind === 'bond_enthalpy')
    return checkBondEnthalpyAnswer(q.problem.data, answer) ? 'correct' : 'wrong'
  if (q.problem.kind === 'heat_transfer')
    return checkHeatTransferAnswer(q.problem.data, answer) ? 'correct' : 'wrong'
  if (q.problem.kind === 'vdw')
    return checkVdWAnswer(answer, q.problem.data) ? 'correct' : 'wrong'
  if (q.problem.kind === 'ideal_gas')
    return checkGasAnswer(q.problem.data, answer) ? 'correct' : 'wrong'
  if (q.problem.kind === 'ecell')
    return checkEcellAnswer(answer, q.problem.data) ? 'correct' : 'wrong'
  if (q.problem.kind === 'rxn_pred')
    return checkRxnPracticeAnswer(answer, q.problem.data) ? 'correct' : 'wrong'
  if (q.problem.kind === 'dilution')
    return checkDilutionAnswer(answer, q.problem.data) ? 'correct' : 'wrong'
  if (q.problem.kind === 'conc')
    return checkConcAnswer(answer, q.problem.data) ? 'correct' : 'wrong'
  if (q.problem.kind === 'clausius_clapeyron')
    return checkCCAnswer(q.problem.data, answer) ? 'correct' : 'wrong'
  if (q.problem.kind === 'sigma_pi')
    return checkSigmaPiCombined(answer, q.problem.data) ? 'correct' : 'wrong'
  if (q.problem.kind === 'vsepr-draw' || q.problem.kind === 'lewis-draw') return 'blank'  // scored externally via Ketcher
  if (q.problem.kind === 'heating_curve') {
    const p = q.problem.data
    const validPhases = new Set(p.validIdxs.map(i => p.segments[i].phase))
    return validPhases.has(answer as Phase) ? 'correct' : 'wrong'
  }
  if (q.problem.kind === 'phase_diagram')
    return answer === q.problem.data.target ? 'correct' : 'wrong'
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

  if (q.problem.kind === 'vsepr-draw' || q.problem.kind === 'lewis-draw') {
    const p = q.problem.data
    return `<div class="question">${header}
      <p class="q-text">${p.question}</p>
      <div class="draw-box"></div>
    </div>`
  }

  if (q.problem.kind === 'sigma_pi') {
    const p = q.problem.data
    return `<div class="question">${header}
      <p class="q-text">Count the σ and π bonds in <span class="mono-val">${p.structure.formula}</span>.</p>
      <div class="answer-row"><span class="solve-for">σ bonds:</span><span class="answer-line" style="width:80px"></span></div>
      <div class="answer-row" style="margin-top:6px"><span class="solve-for">π bonds:</span><span class="answer-line" style="width:80px"></span></div>
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

  if (q.problem.kind === 'hess') {
    const p = q.problem.data
    const stepsHtml = p.steps.map((s, i) =>
      `<span class="chip"><span class="label">(${i + 1})</span> ${s.equation} &nbsp; ΔH = ${s.dh > 0 ? '+' : ''}${s.dh} kJ</span>`
    ).join('')
    return `<div class="question">${header}
      <p class="q-text">Use Hess's Law to find ΔH for the target reaction.</p>
      <p class="q-text" style="font-family:monospace;font-size:10pt;color:#333;font-weight:bold;">Target: ${p.target}</p>
      <p class="q-text" style="font-size:10pt;color:#555;">Given thermochemical equations:</p>
      <div class="given" style="flex-direction:column;gap:4px;">${stepsHtml}</div>
      <div class="answer-row"><span class="solve-for">ΔHrxn =</span><span class="answer-line"></span><span class="unit-label">kJ</span></div>
    </div>`
  }

  if (q.problem.kind === 'enthalpy') {
    const p = q.problem.data
    const givenRows = [...p.reactants, ...p.products].map(s =>
      `<span class="chip"><span class="label">ΔHf°[${s.formula}(${s.state})]</span> ${s.dhf} kJ/mol</span>`
    ).join('')
    return `<div class="question">${header}
      <p class="q-text" style="font-family:monospace;font-size:10pt;color:#555;">${p.equation}</p>
      <p class="q-text">Calculate ΔHrxn using standard enthalpies of formation:</p>
      <div class="given">${givenRows}</div>
      <div class="answer-row"><span class="solve-for">ΔHrxn =</span><span class="answer-line"></span><span class="unit-label">kJ</span></div>
    </div>`
  }

  if (q.problem.kind === 'bond_enthalpy') {
    const p = q.problem.data
    const brokenHtml = p.broken.map(b =>
      `<span class="chip"><span class="label">${b.bond}</span> ${b.count} × ${b.energy} kJ/mol</span>`
    ).join('')
    const formedHtml = p.formed.map(b =>
      `<span class="chip"><span class="label">${b.bond}</span> ${b.count} × ${b.energy} kJ/mol</span>`
    ).join('')
    return `<div class="question">${header}
      <p class="q-text" style="font-family:monospace;font-size:10pt;color:#333;font-weight:bold;">${p.reaction}</p>
      <p class="q-text">Estimate ΔH using average bond enthalpies.</p>
      <p class="q-text" style="font-size:10pt;color:#555;font-weight:bold;">Bonds broken:</p>
      <div class="given">${brokenHtml}</div>
      <p class="q-text" style="font-size:10pt;color:#555;font-weight:bold;">Bonds formed:</p>
      <div class="given">${formedHtml}</div>
      <div class="answer-row"><span class="solve-for">ΔH ≈</span><span class="answer-line"></span><span class="unit-label">kJ</span></div>
    </div>`
  }

  if (q.problem.kind === 'heat_transfer') {
    const p = q.problem.data
    const givenHtml = `<div class="given">${p.given.map(g =>
      `<span class="chip"><span class="label">${g.label} =</span> ${g.value}</span>`
    ).join('')}</div>`
    return `<div class="question">${header}
      <p class="q-text">${p.question}</p>${givenHtml}
      <div class="answer-row"><span class="solve-for">${p.solveFor} =</span><span class="answer-line"></span><span class="unit-label">${p.answerUnit}</span></div>
    </div>`
  }

  if (q.problem.kind === 'vdw') {
    const p = q.problem.data
    const givenHtml = `<div class="given">
      <span class="chip"><span class="label">n =</span> ${p.givenN} mol</span>
      <span class="chip"><span class="label">V =</span> ${p.givenV} L</span>
      <span class="chip"><span class="label">T =</span> ${p.givenT} K</span>
      <span class="chip"><span class="label">a =</span> ${p.gas.a} L²·atm/mol²</span>
      <span class="chip"><span class="label">b =</span> ${p.gas.b} L/mol</span>
    </div>`
    return `<div class="question">${header}
      <p class="q-text">${p.question}</p>
      <p class="q-text" style="font-size:10pt;color:#555;font-style:italic">Gas: ${p.gas.name} (${p.gas.formula})</p>
      ${givenHtml}
      <div class="answer-row"><span class="solve-for">P =</span><span class="answer-line"></span><span class="unit-label">atm</span></div>
    </div>`
  }

  if (q.problem.kind === 'calorimetry') {
    const p = q.problem.data
    const givenHtml = p.given.length > 0
      ? `<div class="given">${p.given.map(g =>
          `<span class="chip"><span class="label">${g.label} =</span> ${g.value} <span class="unit">${g.unit}</span></span>`
        ).join('')}</div>`
      : ''
    return `<div class="question">${header}
      <p class="q-text">${p.question}</p>${givenHtml}
      <div class="answer-row"><span class="solve-for">${p.solveFor} =</span><span class="answer-line"></span><span class="unit-label">${p.answerUnit}</span></div>
    </div>`
  }

  if (q.problem.kind === 'ideal_gas') {
    const p = q.problem.data
    const sf3 = (v: number) => v.toPrecision(3)
    const givenChips = [
      p.givenP !== undefined ? `<span class="chip"><span class="label">P =</span> ${sf3(p.givenP)} ${p.pUnit}</span>` : '',
      p.givenV !== undefined ? `<span class="chip"><span class="label">V =</span> ${sf3(p.givenV)} L</span>` : '',
      p.givenN !== undefined ? `<span class="chip"><span class="label">n =</span> ${sf3(p.givenN)} mol</span>` : '',
      p.givenT !== undefined ? `<span class="chip"><span class="label">T =</span> ${sf3(p.givenT)} K</span>` : '',
    ].filter(Boolean).join('')
    return `<div class="question">${header}
      <p class="q-text">${p.question}</p>
      <div class="given">${givenChips}</div>
      <div class="answer-row"><span class="solve-for">${p.solveFor} =</span><span class="answer-line"></span><span class="unit-label">${p.answerUnit}</span></div>
    </div>`
  }

  if (q.problem.kind === 'ecell') {
    const p = q.problem.data
    const contextHtml = p.context
      ? `<p class="q-text" style="font-family:monospace;font-size:10pt;color:#555;">${p.context}</p>`
      : ''
    const hintHtml = p.hint ? `<p class="q-text" style="font-size:10pt;color:#555;font-style:italic">Hint: ${p.hint}</p>` : ''
    const unitLabel = p.answerUnit ? `<span class="unit-label">${p.answerUnit}</span>` : ''
    return `<div class="question">${header}
      ${contextHtml}
      <p class="q-text">${p.question}</p>${hintHtml}
      <div class="answer-row"><span class="solve-for">Answer:</span><span class="answer-line"></span>${unitLabel}</div>
    </div>`
  }

  if (q.problem.kind === 'rxn_pred') {
    const p = q.problem.data
    const contextHtml = p.context
      ? `<p class="q-text" style="font-family:monospace;font-size:10pt;color:#555;">${p.context}</p>`
      : ''
    const hintHtml = p.hint ? `<p class="q-text" style="font-size:10pt;color:#555;font-style:italic">Hint: ${p.hint}</p>` : ''
    return `<div class="question">${header}
      ${contextHtml}
      <p class="q-text">${p.question}</p>${hintHtml}
      <div class="answer-row"><span class="solve-for">Answer:</span><span class="answer-line"></span></div>
    </div>`
  }

  if (q.problem.kind === 'dilution') {
    const p = q.problem.data
    const givenChips = p.given.map(g =>
      `<span class="chip"><span class="label">${g.label} =</span> ${g.value} <span class="unit">${g.unit}</span></span>`
    ).join('')
    return `<div class="question">${header}
      <p class="q-text">${p.question}</p>
      <div class="given">${givenChips}</div>
      <div class="answer-row"><span class="solve-for">${p.solveFor} =</span><span class="answer-line"></span><span class="unit-label">${p.answerUnit}</span></div>
    </div>`
  }

  if (q.problem.kind === 'conc') {
    const p = q.problem.data
    const givenChips = p.given.map(g =>
      `<span class="chip"><span class="label">${g.label} =</span> ${g.value} <span class="unit">${g.unit}</span></span>`
    ).join('')
    return `<div class="question">${header}
      <p class="q-text">${p.question}</p>
      <div class="given">${givenChips}</div>
      <div class="answer-row"><span class="solve-for">${p.solveFor} =</span><span class="answer-line"></span><span class="unit-label">${p.answerUnit}</span></div>
    </div>`
  }

  if (q.problem.kind === 'clausius_clapeyron') {
    const p = q.problem.data
    const givenChips = p.given.map(g =>
      `<span class="chip">${g}</span>`
    ).join('')
    return `<div class="question">${header}
      <p class="q-text">${p.question}</p>
      <div class="given">${givenChips}</div>
      <div class="answer-row"><span class="solve-for">${p.solveLabel} =</span><span class="answer-line"></span><span class="unit-label">${p.answerUnit}</span></div>
    </div>`
  }

  if (q.problem.kind === 'heating_curve') {
    const p = q.problem.data
    return `<div class="question">${header}
      <p class="q-text">${stripBold(p.question)}</p>
      <p class="q-text" style="font-size:10pt;color:#555;font-style:italic">${p.sub.name} (${p.sub.formula}) · ${p.mass} g — circle or label the region on the curve.</p>
      ${heatingCurveSvg(p)}
    </div>`
  }

  if (q.problem.kind === 'phase_diagram') {
    const p = q.problem.data
    return `<div class="question">${header}
      <p class="q-text">${stripBold(p.question)}</p>
      <p class="q-text" style="font-size:10pt;color:#555;font-style:italic">${p.data.name} (${p.data.formula}) — mark the answer on the diagram.</p>
      ${phaseDiagramSvg(p)}
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

// ── Diagram SVG helpers (print, black-on-white) ───────────────────────────────

function stripBold(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '$1')
}

function heatingCurveSvg(p: HCProblem): string {
  const W = 440, H = 180
  const ML = 52, MR = 20, MT = 16, MB = 38
  const PW = W - ML - MR, PH = H - MT - MB

  const tLow = p.t0, tHigh = p.t1, tRange = tHigh - tLow || 1
  const tPad = tRange * 0.10
  const xS = (q: number) => ML + (q / p.maxQ) * PW
  const yS = (t: number) => MT + PH - ((t - (tLow - tPad)) / (tRange + 2 * tPad)) * PH

  const polyline = p.pts.map(pt => `${xS(pt.x).toFixed(1)},${yS(pt.t).toFixed(1)}`).join(' ')

  const dashLines = [p.sub.mp, p.sub.bp].map(t =>
    `<line x1="${ML}" y1="${yS(t).toFixed(1)}" x2="${W - MR}" y2="${yS(t).toFixed(1)}" stroke="#bbb" stroke-width="0.5" stroke-dasharray="3,2"/>`
  ).join('')

  const tTicks = [p.t0, p.sub.mp, p.sub.bp, p.t1]
  const ticksHtml = tTicks.map(t =>
    `<line x1="${ML - 3}" y1="${yS(t).toFixed(1)}" x2="${ML}" y2="${yS(t).toFixed(1)}" stroke="#444" stroke-width="0.8"/>` +
    `<text x="${ML - 5}" y="${yS(t).toFixed(1)}" text-anchor="end" dominant-baseline="middle" font-size="7.5" font-family="monospace" fill="#444">${t.toFixed(0)}°</text>`
  ).join('')

  const kj = (j: number) => (j / 1000).toPrecision(2)
  const xTicks = [0.25, 0.5, 0.75, 1.0].map(f => f * p.maxQ)
  const xTicksHtml = xTicks.map(q =>
    `<line x1="${xS(q).toFixed(1)}" y1="${MT + PH}" x2="${xS(q).toFixed(1)}" y2="${MT + PH + 3}" stroke="#444" stroke-width="0.8"/>` +
    `<text x="${xS(q).toFixed(1)}" y="${MT + PH + 13}" text-anchor="middle" font-size="7" font-family="monospace" fill="#444">${kj(q)}</text>`
  ).join('')

  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:6px 0 2px 22px;">
    <rect width="${W}" height="${H}" fill="white"/>
    ${dashLines}
    <polyline points="${polyline}" fill="none" stroke="#111" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <line x1="${ML}" y1="${MT}" x2="${ML}" y2="${MT + PH + 5}" stroke="#333" stroke-width="1"/>
    <line x1="${ML - 4}" y1="${MT + PH}" x2="${W - MR}" y2="${MT + PH}" stroke="#333" stroke-width="1"/>
    ${ticksHtml}${xTicksHtml}
    <text x="${ML + PW / 2}" y="${H - 4}" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#555">Heat Added (kJ)</text>
    <text x="12" y="${MT + PH / 2}" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#555" transform="rotate(-90,12,${MT + PH / 2})">Temp (°C)</text>
  </svg>`
}

function phaseDiagramSvg(p: PDProblem): string {
  const d = p.data
  const W = 440, H = 200
  const ML = 60, MR = 16, MT = 20, MB = 38
  const PW = W - ML - MR, PH = H - MT - MB
  const { Tmin, Tmax, logPmin, logPmax } = d

  const xS = (T: number) => ML + (T - Tmin) / (Tmax - Tmin) * PW
  const yS = (P: number) => {
    const lp = Math.log10(Math.max(P, 10 ** (logPmin - 1)))
    return MT + PH - (lp - logPmin) / (logPmax - logPmin) * PH
  }

  const curvePath = (pts: [number, number][]) =>
    pts
      .filter(([, P]) => { const lp = Math.log10(P); return lp >= logPmin - 0.2 && lp <= logPmax + 0.2 })
      .map(([T, P], i) => `${i === 0 ? 'M' : 'L'} ${xS(T).toFixed(1)} ${yS(P).toFixed(1)}`)
      .join(' ')

  // T ticks
  const tRange = Tmax - Tmin
  const tStep = tRange > 300 ? 100 : tRange > 150 ? 50 : 25
  const tTicks: number[] = []
  for (let t = Math.ceil(Tmin / tStep) * tStep; t <= Tmax; t += tStep) tTicks.push(t)
  const tTicksHtml = tTicks.map(t =>
    `<line x1="${xS(t).toFixed(1)}" y1="${MT + PH}" x2="${xS(t).toFixed(1)}" y2="${MT + PH + 3}" stroke="#444" stroke-width="0.8"/>` +
    `<text x="${xS(t).toFixed(1)}" y="${MT + PH + 13}" text-anchor="middle" font-size="7.5" font-family="monospace" fill="#444">${t}</text>`
  ).join('')

  // P ticks (log)
  const pTicks: number[] = []
  for (let lp = Math.ceil(logPmin); lp <= Math.floor(logPmax); lp++) pTicks.push(lp)
  const pTickLabel = (lp: number) => {
    const P = 10 ** lp
    if (P >= 1e6) return `${(P / 1e6).toFixed(0)}MPa`
    if (P >= 1e3) return `${(P / 1e3).toFixed(0)}kPa`
    return `${P.toFixed(0)}Pa`
  }
  const pTicksHtml = pTicks.map(lp =>
    `<line x1="${ML - 3}" y1="${yS(10 ** lp).toFixed(1)}" x2="${ML}" y2="${yS(10 ** lp).toFixed(1)}" stroke="#444" stroke-width="0.8"/>` +
    `<text x="${ML - 5}" y="${yS(10 ** lp).toFixed(1)}" text-anchor="end" dominant-baseline="middle" font-size="7" font-family="monospace" fill="#444">${pTickLabel(lp)}</text>`
  ).join('')

  // 1 atm dashed reference
  const y_atm = yS(101325)
  const atmLine = y_atm >= MT + 2 && y_atm <= MT + PH - 2
    ? `<line x1="${ML}" y1="${y_atm.toFixed(1)}" x2="${W - MR}" y2="${y_atm.toFixed(1)}" stroke="#bbb" stroke-width="0.5" stroke-dasharray="4,3"/>` +
      `<text x="${ML + 4}" y="${(y_atm - 3).toFixed(1)}" font-size="7.5" font-family="monospace" fill="#888">1 atm</text>`
    : ''

  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:6px 0 2px 22px;">
    <rect width="${W}" height="${H}" fill="white"/>
    <clipPath id="pd-print"><rect x="${ML}" y="${MT}" width="${PW}" height="${PH}"/></clipPath>
    ${atmLine}
    <g clip-path="url(#pd-print)">
      <path d="${curvePath(d.sublimation)}"  fill="none" stroke="#555" stroke-width="1.5" stroke-dasharray="5,2"/>
      <path d="${curvePath(d.vaporization)}" fill="none" stroke="#111" stroke-width="2"/>
      <path d="${curvePath(d.fusion)}"        fill="none" stroke="#333" stroke-width="1.5" stroke-dasharray="3,2"/>
    </g>
    <line x1="${ML}" y1="${MT}" x2="${ML}" y2="${MT + PH + 5}" stroke="#333" stroke-width="1"/>
    <line x1="${ML - 4}" y1="${MT + PH}" x2="${W - MR}" y2="${MT + PH}" stroke="#333" stroke-width="1"/>
    ${tTicksHtml}${pTicksHtml}
    <text x="${ML + PW / 2}" y="${H - 4}" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#555">Temperature (°C)</text>
    <text x="11" y="${MT + PH / 2}" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#555" transform="rotate(-90,11,${MT + PH / 2})">Pressure</text>
    <text x="${ML + 4}" y="${MT + 11}" font-size="7.5" font-family="monospace" fill="#555">— vaporization</text>
    <text x="${ML + 4}" y="${MT + 21}" font-size="7.5" font-family="monospace" fill="#555">– – sublimation</text>
    <text x="${ML + 4}" y="${MT + 31}" font-size="7.5" font-family="monospace" fill="#555">- - fusion</text>
  </svg>`
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
  else if (q.problem.kind === 'lewis-draw') {
    const p = q.problem.data
    const svg = lewisToSvgString(p.structure, 260, 180)
    return `<div class="key-row key-row--draw"><span class="key-num">${q.id}.</span><div style="display:flex;align-items:flex-start;gap:16px;flex:1">${svg}</div></div>`
  }
  else if (q.problem.kind === 'vsepr-draw') {
    const p = q.problem.data
    const svg = lewisToSvgString(p.structure, 260, 180)
    return `<div class="key-row key-row--draw"><span class="key-num">${q.id}.</span><div style="display:flex;align-items:flex-start;gap:16px;flex:1"><div class="key-draw"><span class="key-ans">${p.geometry}</span>${p.keyDetails.map(d => `<span class="key-detail">${d}</span>`).join('')}</div>${svg}</div></div>`
  }
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
  else if (q.problem.kind === 'calorimetry')
    answer = `${q.problem.data.answer.toPrecision(3)} ${q.problem.data.answerUnit}`
  else if (q.problem.kind === 'enthalpy')
    answer = `${q.problem.data.answer} ${q.problem.data.answerUnit}`
  else if (q.problem.kind === 'hess')
    answer = `${q.problem.data.answer > 0 ? '+' : ''}${q.problem.data.answer} ${q.problem.data.answerUnit}`
  else if (q.problem.kind === 'bond_enthalpy')
    answer = `${q.problem.data.answer > 0 ? '+' : ''}${q.problem.data.answer} ${q.problem.data.answerUnit}`
  else if (q.problem.kind === 'heat_transfer')
    answer = `${q.problem.data.answer} ${q.problem.data.answerUnit}`
  else if (q.problem.kind === 'vdw')
    answer = `${parseFloat(q.problem.data.realP.toPrecision(4))} atm`
  else if (q.problem.kind === 'ideal_gas')
    answer = `${q.problem.data.answer.toPrecision(3)} ${q.problem.data.answerUnit}`
  else if (q.problem.kind === 'ecell')
    answer = q.problem.data.answerUnit
      ? `${q.problem.data.answer} ${q.problem.data.answerUnit}`
      : q.problem.data.answer
  else if (q.problem.kind === 'rxn_pred')
    answer = q.problem.data.answer
  else if (q.problem.kind === 'dilution')
    answer = `${q.problem.data.answer.toPrecision(3)} ${q.problem.data.answerUnit}`
  else if (q.problem.kind === 'conc')
    answer = `${q.problem.data.answer.toPrecision(3)} ${q.problem.data.answerUnit}`
  else if (q.problem.kind === 'clausius_clapeyron')
    answer = q.problem.data.answer
  else if (q.problem.kind === 'sigma_pi')
    answer = `σ=${q.problem.data.sigma}, π=${q.problem.data.pi}`
  else if (q.problem.kind === 'heating_curve') {
    const p = q.problem.data
    const phaseNames = p.validIdxs.map(i => p.segments[i].phase).join(' or ')
    answer = phaseNames
  } else if (q.problem.kind === 'phase_diagram')
    answer = q.problem.data.target.replace('_', ' ')
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
  .draw-box { margin: 12px 0 4px 22px; border: 1px solid #ccc; height: 160px; width: 100%; }
  .answer-key { padding-top: 28px; }
  .answer-key h2 { font-size: 16pt; margin-bottom: 16px; border-bottom: 1px solid #ccc; padding-bottom: 6px; }
  .key-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px 24px; }
  .key-row { display: flex; gap: 8px; align-items: baseline; font-size: 11pt; }
  .key-row--draw { grid-column: 1 / -1; align-items: flex-start; }
  .key-draw { display: flex; flex-direction: column; gap: 2px; }
  .key-num { font-weight: bold; min-width: 22px; }
  .key-ans { font-family: monospace; font-size: 10pt; }
  .key-detail { font-family: monospace; font-size: 9pt; color: #555; }
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
        <div class="field"><span class="field-label">Score:</span><span class="field-line" style="width:80px">&nbsp;</span><span style="font-size:11pt">/ ${test.questions.filter(q => q.problem.kind !== 'vsepr-draw').length}</span></div>
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

// ── Interactive diagram components ───────────────────────────────────────────

// dot position stored as "x,y" in SVG coords; for HC it's computed from the phase, for PD it's the raw click
function HCInteractive({ p, answer, onAnswer, result, checked }: {
  p: HCProblem; answer: string
  onAnswer: (phase: string) => void; result?: Result; checked: boolean
}) {
  const W = 500, H = 190
  const ML = 52, MR = 20, MT = 16, MB = 44
  const PW = W - ML - MR, PH = H - MT - MB
  const tRange = (p.t1 - p.t0) || 1
  const tPad   = tRange * 0.10
  const xS = (q: number) => ML + (q / p.maxQ) * PW
  const yS = (t: number) => MT + PH - ((t - (p.t0 - tPad)) / (tRange + 2 * tPad)) * PH

  const polyline = p.pts.map(pt => `${xS(pt.x).toFixed(1)},${yS(pt.t).toFixed(1)}`).join(' ')

  // Dot position = midpoint of the selected segment ON the curve
  const dotIdx   = answer ? p.segments.findIndex(s => s.phase === answer) : -1
  const dotSvgX  = dotIdx >= 0 ? xS((p.pts[dotIdx].x + p.pts[dotIdx + 1].x) / 2) : null
  const dotSvgY  = dotIdx >= 0 ? yS((p.pts[dotIdx].t + p.pts[dotIdx + 1].t) / 2) : null
  const dotColor = result === 'correct' ? '#22c55e' : result === 'wrong' ? '#ef4444' : '#f59e0b'

  // After checking wrong: also show correct segment midpoints in green
  const correctDots = (checked && result === 'wrong')
    ? p.validIdxs.map(i => ({
        x: xS((p.pts[i].x + p.pts[i + 1].x) / 2),
        y: yS((p.pts[i].t + p.pts[i + 1].t) / 2),
      }))
    : []

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', maxWidth: W, cursor: checked ? 'default' : 'pointer' }}>
      {/* Invisible click zones per segment */}
      {p.segments.map((seg, i) => (
        <rect key={seg.phase}
          x={xS(p.pts[i].x)} y={MT}
          width={Math.max(xS(p.pts[i + 1].x) - xS(p.pts[i].x), 1)} height={PH}
          fill="transparent"
          onClick={() => !checked && onAnswer(seg.phase)}
          style={{ cursor: checked ? 'default' : 'pointer' }} />
      ))}
      {[p.sub.mp, p.sub.bp].map(t => (
        <line key={t} x1={ML} y1={yS(t)} x2={W - MR} y2={yS(t)}
          stroke="#374151" strokeWidth={0.6} strokeDasharray="3,2" />
      ))}
      <polyline points={polyline} fill="none" stroke="#94a3b8" strokeWidth={2.5}
        strokeLinejoin="round" strokeLinecap="round" />
      <line x1={ML} y1={MT} x2={ML} y2={MT + PH + 5} stroke="#4b5563" strokeWidth={1} />
      <line x1={ML - 4} y1={MT + PH} x2={W - MR} y2={MT + PH} stroke="#4b5563" strokeWidth={1} />
      {[p.t0, p.sub.mp, p.sub.bp, p.t1].map(t => (
        <g key={t}>
          <line x1={ML - 3} y1={yS(t)} x2={ML} y2={yS(t)} stroke="#6b7280" strokeWidth={0.8} />
          <text x={ML - 5} y={yS(t)} textAnchor="end" dominantBaseline="middle"
            fontSize={8} fontFamily="monospace" fill="#9ca3af">{t.toFixed(0)}°</text>
        </g>
      ))}
      {[0.25, 0.5, 0.75, 1.0].map(f => {
        const q = f * p.maxQ
        return (
          <g key={f}>
            <line x1={xS(q)} y1={MT + PH} x2={xS(q)} y2={MT + PH + 3} stroke="#6b7280" strokeWidth={0.8} />
            <text x={xS(q)} y={MT + PH + 12} textAnchor="middle" fontSize={7} fontFamily="monospace"
              fill="#9ca3af">{(q / 1000).toPrecision(2)}</text>
          </g>
        )
      })}
      <text x={ML + PW / 2} y={H - 5} textAnchor="middle" fontSize={9} fontFamily="sans-serif" fill="#6b7280">Heat Added (kJ)</text>
      <text x={11} y={MT + PH / 2} textAnchor="middle" fontSize={9} fontFamily="sans-serif" fill="#6b7280"
        transform={`rotate(-90,11,${MT + PH / 2})`}>Temp (°C)</text>
      {/* Student's dot */}
      {dotSvgX !== null && dotSvgY !== null && (
        <circle cx={dotSvgX} cy={dotSvgY} r={6}
          fill={dotColor} stroke="#0f172a" strokeWidth={1.5} />
      )}
      {/* Correct dots shown after wrong answer */}
      {correctDots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={6}
          fill="#22c55e" stroke="#0f172a" strokeWidth={1.5} fillOpacity={0.7} />
      ))}
    </svg>
  )
}

function PDInteractive({ p, qId, dotPos, onAnswer, onDotPos, result, checked }: {
  p: PDProblem; qId: number; answer?: string; dotPos: { x: number; y: number } | null
  onAnswer: (target: string) => void; onDotPos: (pos: { x: number; y: number }) => void
  result?: Result; checked: boolean
}) {
  const d = p.data
  const W = 500, H = 210
  const ML = 62, MR = 16, MT = 20, MB = 40
  const PW = W - ML - MR, PH = H - MT - MB
  const { Tmin, Tmax, logPmin, logPmax } = d
  const xS = (T: number) => ML + (T - Tmin) / (Tmax - Tmin) * PW
  const yS = (P: number) => MT + PH - (Math.log10(Math.max(P, 10 ** (logPmin - 1))) - logPmin) / (logPmax - logPmin) * PH
  const tpX = xS(d.tp.T), tpY = yS(d.tp.P)
  const cpX = xS(d.cp.T), cpY = yS(d.cp.P)
  const HIT = 22

  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    if (checked) return
    const bbox = e.currentTarget.getBoundingClientRect()
    const sx   = (e.clientX - bbox.left) * (W / bbox.width)
    const sy   = (e.clientY - bbox.top)  * (H / bbox.height)
    if (Math.hypot(sx - tpX, sy - tpY) <= HIT) {
      onAnswer('triple_point'); onDotPos({ x: tpX, y: tpY }); return
    }
    if (Math.hypot(sx - cpX, sy - cpY) <= HIT) {
      onAnswer('critical_point'); onDotPos({ x: cpX, y: cpY }); return
    }
    if (sx < ML || sx > W - MR || sy < MT || sy > MT + PH) return
    const T     = Tmin + (sx - ML) / PW * (Tmax - Tmin)
    const lp    = logPmin + (1 - (sy - MT) / PH) * (logPmax - logPmin)
    const phase = identifyPhase(d, T, 10 ** lp).toLowerCase()
    if (['solid', 'liquid', 'gas'].includes(phase)) { onAnswer(phase); onDotPos({ x: sx, y: sy }) }
  }

  const curvePath = (pts: [number, number][]) =>
    pts.filter(([, P]) => { const lp = Math.log10(P); return lp >= logPmin - 0.2 && lp <= logPmax + 0.2 })
       .map(([T, P], i) => `${i === 0 ? 'M' : 'L'} ${xS(T).toFixed(1)} ${yS(P).toFixed(1)}`).join(' ')

  const dotColor = result === 'correct' ? '#22c55e' : result === 'wrong' ? '#ef4444' : '#f59e0b'

  // After wrong: show where the correct answer is
  const correctDotPos = (checked && result === 'wrong') ? (() => {
    if (p.target === 'triple_point')   return { x: tpX, y: tpY }
    if (p.target === 'critical_point') return { x: cpX, y: cpY }
    const lbl = p.data[`label${p.target.charAt(0).toUpperCase() + p.target.slice(1)}` as keyof typeof p.data] as [number,number] | undefined
    if (lbl) return { x: xS(lbl[0]), y: yS(10 ** lbl[1]) }
    return null
  })() : null

  const clipId  = `pd-clip-${qId}`
  const tStep   = (Tmax - Tmin) > 300 ? 100 : (Tmax - Tmin) > 150 ? 50 : 25
  const tTicks: number[] = []
  for (let t = Math.ceil(Tmin / tStep) * tStep; t <= Tmax; t += tStep) tTicks.push(t)
  const pTicks: number[] = []
  for (let lp = Math.ceil(logPmin); lp <= Math.floor(logPmax); lp++) pTicks.push(lp)
  const pLabel = (lp: number) => { const P = 10**lp; return P>=1e6?`${(P/1e6).toFixed(0)}M`:P>=1e3?`${(P/1e3).toFixed(0)}k`:`${P.toFixed(0)}` }
  const y_atm   = yS(101325)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%"
      style={{ display: 'block', maxWidth: W, cursor: checked ? 'default' : 'crosshair' }}
      onClick={handleClick}>
      <clipPath id={clipId}><rect x={ML} y={MT} width={PW} height={PH} /></clipPath>
      {y_atm >= MT + 2 && y_atm <= MT + PH - 2 && <>
        <line x1={ML} y1={y_atm} x2={W - MR} y2={y_atm} stroke="#374151" strokeWidth={0.5} strokeDasharray="4,3" />
        <text x={ML + 4} y={y_atm - 3} fontSize={7.5} fontFamily="monospace" fill="#6b7280">1 atm</text>
      </>}
      <g clipPath={`url(#${clipId})`}>
        <path d={curvePath(d.sublimation)}  fill="none" stroke="#7c3aed" strokeWidth={1.5} strokeDasharray="5,2" />
        <path d={curvePath(d.vaporization)} fill="none" stroke="#2563eb" strokeWidth={2} />
        <path d={curvePath(d.fusion)}       fill="none" stroke="#059669" strokeWidth={1.5} strokeDasharray="3,2" />
      </g>
      <line x1={ML} y1={MT} x2={ML} y2={MT + PH + 5} stroke="#4b5563" strokeWidth={1} />
      <line x1={ML - 4} y1={MT + PH} x2={W - MR} y2={MT + PH} stroke="#4b5563" strokeWidth={1} />
      {tTicks.map(t => <g key={t}>
        <line x1={xS(t)} y1={MT+PH} x2={xS(t)} y2={MT+PH+3} stroke="#6b7280" strokeWidth={0.8} />
        <text x={xS(t)} y={MT+PH+12} textAnchor="middle" fontSize={7.5} fontFamily="monospace" fill="#9ca3af">{t}</text>
      </g>)}
      {pTicks.map(lp => <g key={lp}>
        <line x1={ML-3} y1={yS(10**lp)} x2={ML} y2={yS(10**lp)} stroke="#6b7280" strokeWidth={0.8} />
        <text x={ML-5} y={yS(10**lp)} textAnchor="end" dominantBaseline="middle" fontSize={7} fontFamily="monospace" fill="#9ca3af">{pLabel(lp)}</text>
      </g>)}
      <text x={ML+PW/2} y={H-4} textAnchor="middle" fontSize={9} fontFamily="sans-serif" fill="#6b7280">Temperature (°C)</text>
      <text x={11} y={MT+PH/2} textAnchor="middle" fontSize={9} fontFamily="sans-serif" fill="#6b7280"
        transform={`rotate(-90,11,${MT+PH/2})`}>Pressure</text>
      <text x={ML+4} y={MT+11} fontSize={7.5} fontFamily="monospace" fill="#6b7280">— vapor.</text>
      <text x={ML+4} y={MT+22} fontSize={7.5} fontFamily="monospace" fill="#6b7280">– – sub.</text>
      <text x={ML+4} y={MT+33} fontSize={7.5} fontFamily="monospace" fill="#6b7280">- - fusion</text>
      {/* Student's placed dot */}
      {dotPos && (
        <circle cx={dotPos.x} cy={dotPos.y} r={6}
          fill={dotColor} stroke="#0f172a" strokeWidth={1.5} />
      )}
      {/* Correct dot after wrong answer */}
      {correctDotPos && (
        <circle cx={correctDotPos.x} cy={correctDotPos.y} r={6}
          fill="#22c55e" stroke="#0f172a" strokeWidth={1.5} fillOpacity={0.7} />
      )}
    </svg>
  )
}

interface Props { test: GeneratedTest; onBack: () => void }

export default function TestSheet({ test, onBack }: Props) {
  interface DrawSubmission { mol?: string; snapshot?: LewisSnapshot; passed: boolean }

  const [answers, setAnswers]       = useState<Record<number, string>>({})
  const [diagramDots, setDiagramDots] = useState<Record<number, { x: number; y: number }>>({})
  const [checked, setChecked]       = useState(false)
  const [revealed, setRevealed]     = useState<Set<number>>(new Set())
  const [submissions, setSubmissions] = useState<Record<number, DrawSubmission>>({})
  const [drawModal, setDrawModal]   = useState<{ q: TestQuestion; review: boolean } | null>(null)

  function setAnswer(id: number, val: string) {
    if (checked) return
    setAnswers(prev => ({ ...prev, [id]: val }))
  }

  function toggleReveal(id: number) {
    setRevealed(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  function handleDrawSubmit(id: number, mol: string | undefined, passed: boolean, snapshot?: LewisSnapshot) {
    setSubmissions(prev => ({ ...prev, [id]: { mol, snapshot, passed } }))
  }

  const answeredCount = Object.values(answers).filter(v => v?.trim() !== '').length
    + Object.keys(submissions).length

  const results: Record<number, Result> | null = checked
    ? Object.fromEntries(test.questions.map(q => {
        if (q.problem.kind === 'vsepr-draw' || q.problem.kind === 'lewis-draw') {
          const s = submissions[q.id]
          return [q.id, s === undefined ? 'blank' : s.passed ? 'correct' : 'wrong']
        }
        return [q.id, checkQuestion(q, answers[q.id] ?? '')]
      }))
    : null

  const scorableCount = test.questions.length
  const score = results ? Object.values(results).filter(r => r === 'correct').length : null

  // ── Render question ──────────────────────────────────────────────────────────

  function renderQuestion(q: TestQuestion) {
    const result: Result | undefined = results?.[q.id]

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
    const vseprDrawP  = q.problem.kind === 'vsepr-draw' ? q.problem.data : null
    const lewisDrawP  = q.problem.kind === 'lewis-draw' ? q.problem.data : null
    const sigmaPiP      = q.problem.kind === 'sigma_pi'      ? q.problem.data : null
    const heatingCurveP  = q.problem.kind === 'heating_curve'      ? q.problem.data : null
    const phaseDiagramP  = q.problem.kind === 'phase_diagram'      ? q.problem.data : null
    const calorimetryP   = q.problem.kind === 'calorimetry'        ? q.problem.data : null
    const enthalpyP      = q.problem.kind === 'enthalpy'           ? q.problem.data : null
    const hessP          = q.problem.kind === 'hess'               ? q.problem.data : null
    const bondEnthalpyP  = q.problem.kind === 'bond_enthalpy'      ? q.problem.data : null
    const heatTransferP  = q.problem.kind === 'heat_transfer'      ? q.problem.data : null
    const vdwP           = q.problem.kind === 'vdw'                ? q.problem.data : null
    const idealGasP      = q.problem.kind === 'ideal_gas'          ? q.problem.data : null
    const ecellP         = q.problem.kind === 'ecell'              ? q.problem.data : null
    const rxnPredP       = q.problem.kind === 'rxn_pred'           ? q.problem.data : null
    const dilutionP      = q.problem.kind === 'dilution'           ? q.problem.data : null
    const concP          = q.problem.kind === 'conc'               ? q.problem.data : null
    const ccP            = q.problem.kind === 'clausius_clapeyron' ? q.problem.data : null
    const drawP          = vseprDrawP ?? lewisDrawP   // either draw-type problem

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
      : sigmaPiP
      ? <div className="pl-8 flex flex-col gap-1.5">
          <p className="font-sans text-base text-bright leading-relaxed">
            Count the σ and π bonds in <span className="font-mono">{sigmaPiP.structure.formula}</span>.
          </p>
          <p className="font-sans text-xs text-dim">Enter as σ, π — e.g. <span className="font-mono">5, 1</span></p>
        </div>
      : heatingCurveP
      ? <p className="font-sans text-base text-bright leading-relaxed pl-8">
          {heatingCurveP.question.replace(/\*\*/g, '')}
          <span className="font-sans text-xs text-dim ml-2">({heatingCurveP.sub.name}, {heatingCurveP.mass} g)</span>
        </p>
      : phaseDiagramP
      ? <p className="font-sans text-base text-bright leading-relaxed pl-8">
          {phaseDiagramP.question.replace(/\*\*/g, '')}
          <span className="font-sans text-xs text-dim ml-2">({phaseDiagramP.data.name})</span>
        </p>
      : drawP
      ? <p className="font-sans text-base text-bright leading-relaxed pl-8">{drawP.question}</p>
      : <p className="font-sans text-base text-bright leading-relaxed pl-8">
          {percCompP?.question ?? atomicP?.question ?? lewisP?.question ?? vseprP?.question ?? conversionP?.question
           ?? calorimetryP?.question ?? heatTransferP?.question ?? vdwP?.question ?? idealGasP?.question
           ?? ecellP?.question ?? rxnPredP?.question ?? dilutionP?.question ?? concP?.question ?? ccP?.question
           ?? enthalpyP?.description ?? hessP?.description ?? bondEnthalpyP?.description
           ?? molarP!.question}
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
      : sigmaPiP
      ? `σ=${sigmaPiP.sigma}, π=${sigmaPiP.pi}`
      : lewisDrawP
      ? lewisDrawP.compound
      : vseprDrawP
      ? `${vseprDrawP.geometry} — ${vseprDrawP.keyDetails.join(', ')}`
      : heatingCurveP
      ? heatingCurveP.validIdxs.map(i => heatingCurveP.segments[i].phase).join(' or ')
      : phaseDiagramP
      ? phaseDiagramP.target.replace('_', ' ')
      : calorimetryP
      ? `${calorimetryP.answer.toPrecision(3)} ${calorimetryP.answerUnit}`
      : enthalpyP
      ? `${enthalpyP.answer > 0 ? '+' : ''}${enthalpyP.answer} ${enthalpyP.answerUnit}`
      : hessP
      ? `${hessP.answer > 0 ? '+' : ''}${hessP.answer} ${hessP.answerUnit}`
      : bondEnthalpyP
      ? `${bondEnthalpyP.answer > 0 ? '+' : ''}${bondEnthalpyP.answer} ${bondEnthalpyP.answerUnit}`
      : heatTransferP
      ? `${heatTransferP.answer} ${heatTransferP.answerUnit}`
      : vdwP
      ? `${parseFloat(vdwP.realP.toPrecision(4))} atm`
      : idealGasP
      ? `${idealGasP.answer} ${idealGasP.answerUnit}`
      : ecellP
      ? (ecellP.answerUnit ? `${ecellP.answer} ${ecellP.answerUnit}` : ecellP.answer)
      : rxnPredP
      ? rxnPredP.answer
      : dilutionP
      ? `${dilutionP.answer.toPrecision(3)} ${dilutionP.answerUnit}`
      : concP
      ? `${concP.answer.toPrecision(3)} ${concP.answerUnit}`
      : ccP
      ? ccP.answer
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
      : sigmaPiP
      ? [sigmaPiP.explanation]
      : lewisDrawP
      ? ['See diagram']
      : vseprDrawP
      ? [`Geometry: ${vseprDrawP.geometry}`, ...vseprDrawP.keyDetails]
      : heatingCurveP
      ? [heatingCurveP.explanation]
      : phaseDiagramP
      ? [phaseDiagramP.explanation]
      : calorimetryP
      ? calorimetryP.steps
      : enthalpyP
      ? enthalpyP.steps
      : hessP
      ? hessP.steps.map(s => `${s.equation}  ΔH = ${s.dh > 0 ? '+' : ''}${s.dh} kJ`)
      : bondEnthalpyP
      ? bondEnthalpyP.solutionSteps
      : heatTransferP
      ? []
      : vdwP
      ? vdwP.steps
      : idealGasP
      ? []
      : ecellP
      ? ecellP.steps
      : rxnPredP
      ? rxnPredP.steps
      : dilutionP
      ? dilutionP.steps
      : concP
      ? concP.steps
      : ccP
      ? ccP.steps
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

        {/* Heating curve: interactive clickable graph */}
        {heatingCurveP && (
          <div className="pl-8">
            <HCInteractive p={heatingCurveP}
              answer={answers[q.id] ?? ''} onAnswer={v => setAnswer(q.id, v)}
              result={result} checked={checked} />
            {!checked && <p className="font-sans text-xs text-dim mt-1">Click a segment to place your mark.</p>}
          </div>
        )}

        {/* Phase diagram: interactive clickable graph */}
        {phaseDiagramP && (
          <div className="pl-8">
            <PDInteractive p={phaseDiagramP} qId={q.id}
              answer={answers[q.id] ?? ''}
              dotPos={diagramDots[q.id] ?? null}
              onAnswer={v => setAnswer(q.id, v)}
              onDotPos={pos => setDiagramDots(prev => ({ ...prev, [q.id]: pos }))}
              result={result} checked={checked} />
            {!checked && <p className="font-sans text-xs text-dim mt-1">Click a region or point to place your mark.</p>}
          </div>
        )}

        {/* Draw problems: open Ketcher editor in modal */}
        {drawP && (
          <div className="flex items-center gap-3 pl-8">
            <button
              onClick={() => setDrawModal({ q, review: false })}
              className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                color: 'var(--c-halogen)',
              }}
            >
              {submissions[q.id] ? 'Redraw →' : 'Open Editor →'}
            </button>
            {submissions[q.id]
              ? <span className="font-mono text-xs text-emerald-400">drawing submitted</span>
              : <span className="font-mono text-xs text-dim">not yet submitted</span>
            }
            {checked && (
              <button
                onClick={() => toggleReveal(q.id)}
                className="ml-2 font-mono text-xs text-dim hover:text-secondary transition-colors"
              >
                {revealed.has(q.id) ? '▲ hide' : '▼ solution'}
              </button>
            )}
          </div>
        )}

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

        {/* Answer input — skipped for draw/diagram problems */}
        {!drawP && !sigmaPiP && !heatingCurveP && !phaseDiagramP && (
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
        )}

        {/* sigma_pi: two-field input */}
        {sigmaPiP && (
          <div className="flex items-center gap-4 pl-8 flex-wrap">
            <span className="font-mono text-sm text-secondary">σ =</span>
            <input
              type="number" min="0"
              value={(answers[q.id] ?? '').split(',')[0] ?? ''}
              onChange={e => {
                const pi = (answers[q.id] ?? '').split(',')[1] ?? ''
                setAnswer(q.id, `${e.target.value},${pi}`)
              }}
              disabled={checked}
              placeholder="?"
              className={`w-20 bg-raised border rounded-sm px-3 py-1.5 font-mono text-base
                          placeholder-dim focus:outline-none focus:border-muted
                          disabled:cursor-not-allowed transition-colors
                          ${result === 'correct' ? 'border-emerald-700/60 text-emerald-300'
                            : result === 'wrong' ? 'border-rose-700/60 text-rose-300'
                            : 'border-border text-bright'}`}
            />
            <span className="font-mono text-sm text-secondary">π =</span>
            <input
              type="number" min="0"
              value={(answers[q.id] ?? '').split(',')[1] ?? ''}
              onChange={e => {
                const sigma = (answers[q.id] ?? '').split(',')[0] ?? ''
                setAnswer(q.id, `${sigma},${e.target.value}`)
              }}
              disabled={checked}
              placeholder="?"
              className={`w-20 bg-raised border rounded-sm px-3 py-1.5 font-mono text-base
                          placeholder-dim focus:outline-none focus:border-muted
                          disabled:cursor-not-allowed transition-colors
                          ${result === 'correct' ? 'border-emerald-700/60 text-emerald-300'
                            : result === 'wrong' ? 'border-rose-700/60 text-rose-300'
                            : 'border-border text-bright'}`}
            />
            {checked && (
              <button
                onClick={() => toggleReveal(q.id)}
                className="ml-2 font-mono text-xs text-dim hover:text-secondary transition-colors"
              >
                {revealed.has(q.id) ? '▲ hide' : '▼ solution'}
              </button>
            )}
          </div>
        )}

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
              {drawP ? (
                <div className="pl-8 flex flex-col gap-4 pt-1">
                  {/* Student's submission */}
                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-xs text-dim tracking-wider uppercase">Your drawing</span>
                    {submissions[q.id] ? (
                      <button
                        onClick={() => setDrawModal({ q, review: true })}
                        className="self-start px-3 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                        style={{
                          background: '#141620',
                          border: '1px solid #1c1f2e',
                          color: '#7b82a0',
                        }}
                      >
                        View submitted drawing →
                      </button>
                    ) : (
                      <span className="font-mono text-xs text-dim italic">No drawing submitted.</span>
                    )}
                  </div>
                  {/* Expected answer */}
                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-xs text-dim tracking-wider uppercase">Expected</span>
                    {vseprDrawP && (
                      <div className="flex flex-col gap-1 pl-3 border-l border-border mb-1">
                        <span className="font-mono text-sm font-semibold text-bright">{vseprDrawP.geometry}</span>
                        {vseprDrawP.keyDetails.map((d, i) => (
                          <p key={i} className="font-mono text-xs text-secondary">{d}</p>
                        ))}
                      </div>
                    )}
                    <div style={{ maxWidth: 360 }}>
                      <LewisStructureDiagram structure={drawP.structure} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pl-8 flex flex-col gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-dim">Answer:</span>
                    <span className="font-mono text-sm text-bright">{correctAnswer}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 pl-3 border-l border-border">
                    {(solutionSteps as string[]).map((step: string, i: number) => (
                      <p key={i} className="font-mono text-sm text-primary">{step}</p>
                    ))}
                  </div>
                </div>
              )}
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
              Score: <span className="text-bright">{score}</span><span className="text-dim"> / {scorableCount}</span>
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
              onClick={() => { setAnswers({}); setDiagramDots({}); setChecked(false); setRevealed(new Set()); setSubmissions({}) }}
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

      {/* Draw modals */}
      {drawModal && drawModal.q.problem.kind === 'vsepr-draw' && (
        <Suspense fallback={null}>
          <VseprDrawModal
            compound={drawModal.q.problem.data.compound}
            structure={drawModal.q.problem.data.structure}
            reviewMol={drawModal.review ? submissions[drawModal.q.id]?.mol : undefined}
            onSubmit={drawModal.review ? undefined : (mol, passed) => handleDrawSubmit(drawModal.q.id, mol, passed)}
            onClose={() => setDrawModal(null)}
          />
        </Suspense>
      )}
      {drawModal && drawModal.q.problem.kind === 'lewis-draw' && (
        <Suspense fallback={null}>
          <LewisDrawModal
            compound={drawModal.q.problem.data.compound}
            structure={drawModal.q.problem.data.structure}
            reviewSnapshot={drawModal.review ? submissions[drawModal.q.id]?.snapshot : undefined}
            onSubmit={drawModal.review ? undefined : (passed, snapshot) => handleDrawSubmit(drawModal.q.id, undefined, passed, snapshot)}
            onClose={() => setDrawModal(null)}
          />
        </Suspense>
      )}
    </div>
  )
}
