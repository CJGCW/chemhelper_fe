# chemhelper_fe — Patterns & Conventions

## Philosophy

ChemHelper is an educational chemistry tool — accuracy and pedagogical clarity come before feature breadth or visual polish. When in doubt:

- Prefer correctness with a textbook worked example over UI elegance.
- Prefer verbose step-by-step output over terse "the answer is X".
- Prefer pushing domain logic into `src/chem/` over inline component math.
- Prefer adding tests (especially against Chang or Atkins worked examples) over just visual verification.

---

## `src/chem/` purity rule (non-negotiable)

No module in `src/chem/` may import from:

- React or any React-adjacent library
- `../utils/*` (especially `sigfigs`)
- `../components/*`

Check before adding any import to a chem/ module: `grep "^import" src/chem/*.ts` — every line should start with `from './...'` or be a bare ES import (none currently exist).

If you need formatting or rounding inside a solver, accept it as a callback argument with a safe default:

```ts
function calcX(
  ...,
  fmt: (n: number) => string = defaultFmt,
  rnd: (n: number) => number = defaultRnd,
): Result
```

**One-and-done history:** `chem/stoich.ts` previously imported `formatSigFigs` from `utils/sigfigs`, which baked display assumptions into the domain layer. This was refactored to pass `fmt`/`rnd` as dependency-injected callbacks. **Do not re-introduce the import** — extend the callback pattern to any new solver instead. `calcLimitingReagent` is the reference implementation; the other solvers in `stoich.ts` should eventually adopt the same pattern.

---

## Worked-example generators must call the solver

When a tool has both a "live" calculator and a "show me an example" button, the example generator must call the same `chem/*` solver — **not re-implement the math**. Hardcode "nice" input values, call the solver, read `.steps` / `.products[0].grams` / etc. off the result.

```tsx
function buildWorkedExample(rxn: Reaction) {
  const sol = calcLimitingReagent(rxn, [
    { val: 20, unit: "g" },
    { val: computeNiceB(rxn), unit: "g" },
  ]);
  return {
    problem: `...`,
    steps: sol.steps,
    answer: `Limiting reagent: ${sol.limitingSpecies?.display}`,
  };
}
```

**History:** `LimitingReagentTool.buildWorkedExample` previously re-implemented limiting-reagent math locally and reintroduced an inverted-ternary bug the main solver didn't have. One code path = one place to be wrong.

---

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
{
  id: string;
  label: string;
  pills: {
    id: Tab;
    label: string;
    formula: string;
  }
  [];
}
```

The `formula` field is a short monospace annotation shown beside the label (e.g. `g↔mol`, `%Y`).

### Switching modes

When the user switches mode, the topic is preserved via `TAB_TO_TOPIC` + `TOPIC_MODE_TAB` maps. If no mapping exists for the current tab, fall back to `MODE_DEFAULT[mode]`.

### Print

- **All** navigation rows (`print:hidden`) — mode switch, tab pills, every group row.
- Print button appears only in Reference mode, beside the page heading.
- For "Print All", set a `printingAll` flag, render the full reference outside `AnimatePresence`, then call `window.print()` in a `requestAnimationFrame` after mount.

### Shell variants currently in use

- **Full 3-groups** (reference/practice/problems, all groups defined) — `StoichiometryPage`, `IdealGasPage`. This is the canonical pattern — default to this for new topic pages.
- **Section-based** — `ThermochemistryPage` only. Sections hold Reference/Practice/Problems tabs per subtopic. Pedagogically fits the subtopic-dense thermo material better; leave as-is unless there's a reason to converge.
- **Mode without groups** — `EmpiricalPage`, `ElectronConfigPage`, `StructuresPage`, `LewisPage`. Topic has few enough tools that groups aren't needed. Fine.
- **Partial groups** — `RedoxPage` (no REFERENCE_GROUPS, flat `REFERENCE_TABS`), `MolarCalculationsPage` (no PROBLEMS_GROUPS). These are drift and should converge to full 3-groups when touched for other reasons.

---

## Calculator Tool Pattern ("heavy" pattern)

Every calculator tool must use these shared primitives from `src/components/shared/`:

| Primitive                                              | Purpose                                                                                       |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `NumberField`                                          | Labeled text input with `inputMode="decimal"` — **never `<input type="number">`** (see below) |
| `useStepsPanelState` + `StepsTrigger` + `StepsContent` | Collapsible step-by-step panel; also drives the Example button                                |
| `SigFigTrigger` + `SigFigContent`                      | Sig fig breakdown panel                                                                       |
| `ResultDisplay`                                        | Animated result card with optional sig-fig alternate and verify state                         |

### ⚠ Never use `<input type="number">`

Always use `NumberField` (which uses `<input type="text" inputMode="decimal">`). `type="number"`:

- Mangles `inputMode` on mobile (especially iOS), forcing users to hunt for the decimal key
- Eats accidental mouse scrolls and silently changes values
- Rounds in browser-specific ways (Firefox vs Chrome vs Safari all differ)
- Rejects scientific notation (`1.5e-3`) in some browsers

This rule is consistent across every tool in the codebase. Don't break it.

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

## Verify state is standard for answer-checking tools

Tools that ask the student to produce a numeric answer use the three-state verify pattern:

- `'correct'` — answer matches within tolerance and sig figs are right
- `'sig_fig_warning'` — numerically correct but sig figs are off
- `'incorrect'` — value doesn't match

This applies to all `*Tool` components with an answer field. Exceptions are tools without a single "answer" to check:

- **Legitimate exceptions:** `HeatingCurveTool`, `ReactionProfileTool` (visualizers).
- **Pending adoption:** `LimitingReagentTool`, `EmpiricalTool`, `GasStoichTool`, `PercentCompositionTool` should adopt verify-state when next touched.

A student navigating between topics should get consistent feedback. If you add a new answer-checking tool without verify state, you're breaking that expectation.

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
const stringSteps = useMemo(
  () => steps.map((s) => `${s.label}: ${s.expr}`),
  [steps],
);
const stepsState = useStepsPanelState(stringSteps, generateExample);
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

The `calculations/` entry above is now empty of shared primitives (all moved to `shared/`). It still holds topic-specific components like `MolarReference`, `MolesTool`, etc. — those belong there.

---

## Domain math migration

Stoichiometry is fully migrated to `src/chem/stoich.ts`. The fmt/rnd callback pattern there is the template — follow it for any new chem/ solver.

Other domains (thermo, idealgas, empirical, molar calculations) still compute locally. Migrate opportunistically: when you touch a tool for any other reason, check whether its math is a candidate for `chem/`, and extract if so. Don't do speculative migrations — each one needs tests and costs review time.

---

## `ReferencePage.tsx` — transitional

This page declares 12 tabs but only 2 (`solubility`, `naming`) are linked from NavSidebar. The other 10 tab targets duplicate components that have moved to dedicated topic pages (Stoichiometry, MolarCalculations, ElectronConfig, Redox, IdealGas, Empirical).

Don't add new tabs to ReferencePage. When touching it, consider: (a) trimming to just the two live tabs and renaming to `StaticReferencePage` or similar, or (b) moving solubility/naming into another page and deleting ReferencePage entirely.

---

## Backend API Scaffold

`src/api/` contains `client.ts` (axios, baseURL `/api`, 15s timeout, error interceptor) and stubs `calculations.ts`, `elements.ts`. Nothing is wired through it yet. If server-side routing is added, this is the right place — keep all fetch calls in `src/api/` files, not inside components or utils.

---

## Styling Conventions

- Use `color-mix(in srgb, var(--c-halogen) N%, ...)` for tinted backgrounds and borders — never hard-coded hex for accent colors.
- Active pill background: `color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))` with border `color-mix(in srgb, var(--c-halogen) 30%, transparent)`.
- Spring animation for pill transitions: `{ type: 'spring', stiffness: 400, damping: 32 }`.
- `layoutId` strings must be unique across the whole page to avoid framer-motion conflicts.
- `print:hidden` on every nav/pill row — no exceptions.
