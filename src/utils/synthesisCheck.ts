// Reagent answer normalization for SynthesisFillInPractice.

const SUBSCRIPT_MAP: Record<string, string> = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
  '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
}

const SUPERSCRIPT_MAP: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
  '⁺': '+', '⁻': '-',
}

export function normalizeReagent(input: string): string {
  let s = input.toLowerCase()

  // Convert Unicode subscripts and superscripts to ASCII
  for (const [sub, dig] of Object.entries(SUBSCRIPT_MAP)) s = s.split(sub).join(dig)
  for (const [sup, dig] of Object.entries(SUPERSCRIPT_MAP)) s = s.split(sup).join(dig)

  // Collapse whitespace
  s = s.replace(/\s+/g, ' ')

  // Unify "/" and "," as separators (keep commas, normalize slashes)
  s = s.replace(/\s*[/]\s*/g, ', ')

  // Remove leading step numbers like "(1) " "(2) "
  s = s.replace(/^\(\d\)\s*/, '')

  // Collapse multiple commas/spaces
  s = s.replace(/,\s*/g, ', ').replace(/\s{2,}/g, ' ')

  return s.trim()
}

export function checkReagent(student: string, accepted: string[]): boolean {
  const s = normalizeReagent(student)
  return accepted.some(a => normalizeReagent(a) === s)
}
