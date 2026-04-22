/**
 * Checks if the string looks like a molecular formula rather than a common name.
 * Formulas start with uppercase and contain only letters, digits, and grouping chars.
 */
export function looksLikeFormula(s: string): boolean {
  return /^[A-Z][A-Za-z0-9()[\]{}]*$/.test(s.trim())
}

export interface ResolveResult {
  formula: string
  resolvedFrom: string   // original name the user typed
  iupacName: string      // IUPAC name returned by PubChem (may differ from input)
}

/**
 * If input already looks like a formula, returns immediately.
 * Otherwise calls /api/compound/lookup and extracts molecular_formula.
 * Throws a human-readable string on failure.
 */
export async function resolveToFormula(raw: string): Promise<ResolveResult> {
  const trimmed = raw.trim()
  if (looksLikeFormula(trimmed)) {
    return { formula: trimmed, resolvedFrom: '', iupacName: '' }
  }
  const resp = await fetch('/api/compound/lookup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: trimmed }),
  })
  const data = await resp.json()
  if (!resp.ok || !data.molecular_formula) {
    throw data.error ?? `Could not identify "${trimmed}" — try entering the formula directly (e.g. H₂O).`
  }
  return {
    formula: data.molecular_formula as string,
    resolvedFrom: trimmed,
    iupacName: (data.iupac_name as string) || trimmed,
  }
}
