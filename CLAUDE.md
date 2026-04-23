# chemhelper_fe — Patterns & Conventions

## Page Architecture: Reference | Practice | Problems (RPP)

Topic pages (`src/pages/*Page.tsx`) follow the RPP three-mode layout:

```
Reference  |  Practice  |  Problems
```

- **Reference** — static guides, formula sheets, visual diagrams. Print button visible.
- **Practice** — solver/calculator tools. Student uses the tool to check work.
- **Problems** — generated problems with verify/check (same tool components, `allowCustom={false}`).

### Mode switch
A rounded-full pill toggle drives `Mode = 'reference' | 'practice' | 'problems'`. Tab changes via `?tab=` URL param — never component state — so deep links always work.

### Tab groups
Tabs within each mode are grouped (Basic / Stoichiometry / Advanced, etc.) using `TabGroup[]`:
```ts
{ id: string; label: string; pills: { id: Tab; label: string; formula: string }[] }
```
The `formula` field is a short monospace annotation shown beside the label (e.g. `g↔mol`, `%Y`).

### Switching modes
When the user switches mode, the topic is preserved via `TAB_TO_TOPIC` + `TOPIC_MODE_TAB` maps. If no mapping exists for the current tab, fall back to `MODE_DEFAULT[mode]`.

### Print
- **All** navigation rows (`print:hidden`) — mode switch, tab pills, every group row.
- Print button appears only in Reference mode, beside the page heading.
- For "Print All", set a `printingAll` flag, render the full reference outside `AnimatePresence`, then call `window.print()` in a `requestAnimationFrame` after mount.

---

## Calculator Tool Pattern ("heavy" pattern)

Every calculator tool must use these shared primitives from `src/components/shared/`:

| Primitive | Purpose |
|---|---|
| `NumberField` | Labeled text input with `inputMode="decimal"` — **never `<input type="number">`** |
| `useStepsPanelState` + `StepsTrigger` + `StepsContent` | Collapsible step-by-step panel; also drives the Example button |
| `SigFigTrigger` + `SigFigContent` | Sig fig breakdown panel |
| `ResultDisplay` | Animated result card with optional sig-fig alternate and verify state |

### Wiring pattern
```tsx
// State
const [steps, setSteps]               = useState<string[]>([])
const [breakdown, setBreakdown]       = useState<SigFigBreakdown | null>(null)
const [sfOpen, setSfOpen]             = useState(false)

// Steps panel — inline generator closes over current `rxn` or similar state
const stepsState = useStepsPanelState(steps, () => {
  const ex = buildWorkedExample(rxn)
  return { scenario: ex.problem, steps: ex.steps, result: ex.answer }
})

// Calculate handler
function handleTool() {
  const res = calcSomething(...)
  setSteps(res.steps)
  setBreakdown(buildSigFigBreakdown([...], res.rawAnswer, 'g'))
}

// Button row — StepsTrigger and SigFigTrigger sit beside the Calculate button
<div className="flex items-stretch gap-2">
  <button onClick={handleTool} ...>Calculate</button>
  <StepsTrigger {...stepsState} />
  <SigFigTrigger breakdown={breakdown} open={sfOpen} onToggle={() => setSfOpen(o => !o)} />
</div>
<StepsContent {...stepsState} />
<SigFigContent breakdown={breakdown} open={sfOpen} />

{result && (
  <ResultDisplay label="..." value={String(result.answer)} unit="g" sigFigsValue={sfResult} />
)}
```

### Rules
- Reset `steps`, `breakdown`, and `result` to null/empty on every input change.
- `ResultDisplay value` must be `string` — coerce with `String(n)` if the solver returns a number.
- `SigFigBreakdown` only applies when the input unit is `'g'` (mass); skip it for mol inputs.
- The example generator function is always defined inline (closure) when it depends on component state such as the current reaction.

---

## Reactive Tool Pattern (no Calculate button)

Tools that compute live from inputs (EmpiricalTool, ClausiusClapeyronTool, EnthalpyTool) still need the Example button. Use a `noSteps` sentinel:

```tsx
const [noSteps] = useState<string[]>([])
const stepsState = useStepsPanelState(noSteps, generateMyExample)

// Trigger sits alone in a flex row at the top of the tool
<div className="flex items-stretch gap-2">
  <StepsTrigger {...stepsState} />
</div>
<StepsContent {...stepsState} />
```

`useStepsPanelState` with an empty `steps` array and a `generate` function renders only the "Show me an example" button — it never shows calculation steps. Keep `AnimatePresence` for the reactive result display below.

If the tool's internal steps are typed as `{ label: string; expr: string }[]` rather than `string[]`, map them before passing:
```tsx
const stringSteps = useMemo(() => steps.map(s => `${s.label}: ${s.expr}`), [steps])
const stepsState = useStepsPanelState(stringSteps, generateExample)
```

---

## Adding a New Practice Topic

When a new calculator/practice topic is added, all three of the following must be updated:

1. **Practice tab** — add the tool as a tab in the relevant `*Page.tsx` under the Practice mode group.
2. **Test generation** — add the problem type to `utils/*Practice.ts` or `chem/*` so the problems panel can generate it.
3. **Automated tests** — add test cases in `src/tests/` covering the new solver and generated problems.

Skipping any one of these is a bug.

---

## File Layout

```
src/
  pages/           — RPP page shells, tab routing, no math
  components/
    <topic>/       — topic-specific tools, practice, reference components
    shared/        — cross-topic UI primitives (NumberField, StepsPanel, etc.)
    Layout/        — PageShell, nav
    tools/         — interactive classifiers (ReactionClassifier, NetIonicTool, etc.)
    calculations/  — legacy location; being migrated to shared/
  utils/           — pure TS, no React (problem generators, formatters)
  chem/            — domain math (stoich, amounts, solutions, sig figs)
  stores/          — Zustand stores (elementStore, etc.)
```

Import shared primitives as `'../shared/X'` from any component subdir.

---

## Styling Conventions

- Use `color-mix(in srgb, var(--c-halogen) N%, ...)` for tinted backgrounds and borders — never hard-coded hex for accent colors.
- Active pill background: `color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))` with border `color-mix(in srgb, var(--c-halogen) 30%, transparent)`.
- Spring animation for pill transitions: `{ type: 'spring', stiffness: 400, damping: 32 }`.
- `layoutId` strings must be unique across the whole page to avoid framer-motion conflicts.
- `print:hidden` on every nav/pill row — no exceptions.
