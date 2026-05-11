import { ACIDITY_RANKING_PROBLEMS, type RankingProblem } from '../data/organic/acidityRankingProblems'

export type { RankingProblem }

let recentIds: string[] = []

export function generateRankingProblem(difficulty?: 'easy' | 'medium' | 'hard'): RankingProblem {
  const eligible = ACIDITY_RANKING_PROBLEMS.filter(p =>
    !recentIds.includes(p.id) &&
    (!difficulty || p.difficulty === difficulty)
  )
  const pool = eligible.length > 0 ? eligible : ACIDITY_RANKING_PROBLEMS.filter(p =>
    !difficulty || p.difficulty === difficulty
  )
  const picked = pool[Math.floor(Math.random() * pool.length)]
  recentIds = [...recentIds.slice(-5), picked.id]
  return picked
}

export function checkRankingAnswer(problem: RankingProblem, studentOrder: string[]): boolean {
  return studentOrder.every((id, idx) => {
    const compound = problem.compounds.find(c => c.id === id)
    if (!compound) return false
    return compound.correctRank === idx
  })
}

export function getCanonicalOrder(problem: RankingProblem): string[] {
  return [...problem.compounds]
    .sort((a, b) => a.correctRank - b.correctRank)
    .map(c => c.id)
}
