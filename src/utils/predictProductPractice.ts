import { PREDICT_PRODUCT_PROBLEMS } from '../data/organic/predictProductProblems'
import type { PredictProductProblem, ProductChoice } from '../data/organic/predictProductProblems'
import type { RenderableChoice } from '../data/mechanisms/types'

export type { PredictProductProblem, ProductChoice }

let recentIds: string[] = []

export function generatePredictProductProblem(
  difficulty?: 'easy' | 'medium' | 'hard',
): PredictProductProblem {
  const eligible = PREDICT_PRODUCT_PROBLEMS.filter(
    p => !recentIds.includes(p.id) && (!difficulty || p.difficulty === difficulty),
  )
  const pool =
    eligible.length > 0
      ? eligible
      : PREDICT_PRODUCT_PROBLEMS.filter(p => !difficulty || p.difficulty === difficulty)

  const picked = pool[Math.floor(Math.random() * pool.length)]
  recentIds = [...recentIds.slice(-5), picked.id]
  return picked
}

export function checkPredictProductAnswer(problem: PredictProductProblem, choice: string): boolean {
  return choice === problem.correctProduct.label
}

function toRenderable(c: ProductChoice): RenderableChoice {
  return c.smiles ? { label: c.label, species: [{ smiles: c.smiles, label: c.label }] } : { label: c.label }
}

export function shuffleChoices(problem: PredictProductProblem): RenderableChoice[] {
  const all = [problem.correctProduct, ...problem.distractors].map(toRenderable)
  return all.sort(() => Math.random() - 0.5)
}
