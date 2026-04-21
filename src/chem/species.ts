/**
 * Parentheses-aware formula parser and molar mass calculator.
 * All functions throw on invalid input — callers catch and handle UI feedback.
 */

export function parseFormula(raw: string): Record<string, number> {
  // Normalise Unicode subscripts to ASCII digits
  const s = raw.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, c => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(c)))
  let pos = 0

  function group(): Record<string, number> {
    const counts: Record<string, number> = {}
    while (pos < s.length && s[pos] !== ')') {
      if (s[pos] === '(') {
        pos++
        const sub = group()
        if (s[pos] !== ')') throw new Error('unmatched (')
        pos++
        let n = ''
        while (pos < s.length && /\d/.test(s[pos])) n += s[pos++]
        const mult = n ? parseInt(n) : 1
        for (const [e, c] of Object.entries(sub)) counts[e] = (counts[e] ?? 0) + c * mult
      } else if (/[A-Z]/.test(s[pos])) {
        let elem = s[pos++]
        while (pos < s.length && /[a-z]/.test(s[pos])) elem += s[pos++]
        let n = ''
        while (pos < s.length && /\d/.test(s[pos])) n += s[pos++]
        counts[elem] = (counts[elem] ?? 0) + (n ? parseInt(n) : 1)
      } else {
        throw new Error(`unexpected character: ${s[pos]}`)
      }
    }
    return counts
  }

  const counts = group()
  if (pos !== s.length) throw new Error(`unexpected ) at position ${pos}`)
  if (Object.keys(counts).length === 0) throw new Error('empty formula')
  return counts
}

export function calcMolarMass(
  atoms: Record<string, number>,
  masses: Record<string, number>,
): number {
  let total = 0
  for (const [elem, count] of Object.entries(atoms)) {
    const m = masses[elem]
    if (m === undefined) throw new Error(`unknown element: ${elem}`)
    total += m * count
  }
  return total
}
