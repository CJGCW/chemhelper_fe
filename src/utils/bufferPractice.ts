// Buffer pH practice problem generator.
// Pure TypeScript — no React, no component imports.

import { bufferPh, bufferAfterAddition } from '../chem/buffers'
import { WEAK_ACIDS } from '../data/acidBaseConstants'

export interface BufferProblem {
  type: 'buffer-ph' | 'buffer-after-addition'
  prompt: string
  given: {
    pKa: number
    acidName: string
    acidFormula: string
    conjugateBase: string
    concAcid: number  // M
    concBase: number  // M
    volumeL?: number
    addition?: { type: 'acid' | 'base'; moles: number }
  }
  answer: number  // pH
  tolerance: number
}

const BUFFER_ACIDS = WEAK_ACIDS.filter(a =>
  a.pKa >= 3 && a.pKa <= 11 && a.Ka !== undefined
)

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function roundTo(n: number, decimals: number): number {
  return parseFloat(n.toFixed(decimals))
}

function randomConc(): number {
  const choices = [0.050, 0.075, 0.100, 0.150, 0.200, 0.250, 0.300]
  return randomChoice(choices)
}

export function generateBufferPhProblem(): BufferProblem {
  const acid = randomChoice(BUFFER_ACIDS)
  const pKa = acid.pKa

  // Pick concentrations with a ratio between 0.25 and 4 (keeps pH within 1.5 units of pKa)
  const ratios = [0.25, 0.33, 0.50, 0.67, 1.0, 1.5, 2.0, 3.0, 4.0]
  const ratio = randomChoice(ratios)

  const concAcid = randomConc()
  const concBase = roundTo(concAcid * ratio, 4)

  const result = bufferPh(pKa, concAcid, concBase)
  const answer = roundTo(result.pH, 2)

  const prompt =
    `A buffer solution is prepared by mixing ${concAcid.toFixed(3)} M ${acid.name} (${acid.formula}) ` +
    `with ${concBase.toFixed(3)} M ${acid.conjugateBase}. ` +
    `Given pKa = ${pKa.toFixed(2)}, calculate the pH of the buffer.`

  return {
    type: 'buffer-ph',
    prompt,
    given: {
      pKa,
      acidName: acid.name,
      acidFormula: acid.formula,
      conjugateBase: acid.conjugateBase,
      concAcid,
      concBase,
    },
    answer,
    tolerance: 0.05,
  }
}

export function generateBufferAfterAdditionProblem(): BufferProblem {
  const acid = randomChoice(BUFFER_ACIDS)
  const pKa = acid.pKa

  const concAcid = randomConc()
  const concBase = randomConc()
  const volumeL = randomChoice([0.500, 1.000, 0.250])

  const addType: 'acid' | 'base' = Math.random() < 0.5 ? 'acid' : 'base'

  // Use a small addition (5-15% of the smaller component)
  const smallerMoles = Math.min(concAcid, concBase) * volumeL
  const moles = roundTo(smallerMoles * randomChoice([0.05, 0.10, 0.15]), 4)

  let answer: number
  try {
    const result = bufferAfterAddition(concAcid, concBase, volumeL, pKa, { type: addType, moles })
    answer = roundTo(result.newPh, 2)
  } catch {
    // If buffer fails, fall back to a simpler problem
    return generateBufferPhProblem() as unknown as BufferProblem
  }

  const addedLabel = addType === 'acid' ? 'strong acid (HCl)' : 'strong base (NaOH)'

  const prompt =
    `A buffer is prepared from ${concAcid.toFixed(3)} M ${acid.formula} and ` +
    `${concBase.toFixed(3)} M ${acid.conjugateBase} in ${volumeL.toFixed(3)} L. ` +
    `After adding ${moles.toFixed(4)} mol of ${addedLabel}, ` +
    `what is the new pH? (pKa = ${pKa.toFixed(2)})`

  return {
    type: 'buffer-after-addition',
    prompt,
    given: {
      pKa,
      acidName: acid.name,
      acidFormula: acid.formula,
      conjugateBase: acid.conjugateBase,
      concAcid,
      concBase,
      volumeL,
      addition: { type: addType, moles },
    },
    answer,
    tolerance: 0.05,
  }
}
