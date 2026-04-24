# chemhelper_fe — Patterns & Conventions

## Philosophy

ChemHelper is an educational chemistry tool — accuracy and pedagogical clarity come before feature breadth or visual polish. When in doubt:
- Prefer correctness with a textbook worked example over UI elegance.
- Prefer verbose step-by-step output over terse "the answer is X".
- Prefer pushing domain logic into `src/chem/` over inline component math.
- Prefer adding tests (especially against Chang or Atkins worked examples) over just visual verification.

Chang's *Chemistry* (14e, 2022) is the primary curriculum reference. When reference data and textbook values disagree, prefer matching Chang so students comparing in-app answers to homework see consistency. Exceptions (more rigorous modern values) should be footnoted, not silently adopted.

---

## Every data file deserves a practice pipeline

Strong data coverage without a practice tool means the data goes underused. Before adding a new topic, check whether relevant data already exists in `src/data/`:

- `data/periodicTrends.ts` — IE1, EA, ionic radius for all known elements
- `data/elementIsotopes.ts` — isotope masses and natural abundances
- `data/elementIons.ts` — common cations/anions
- `data/nomenclature.ts` — polyatomic ions, transition metal names, Greek prefixes
- `data/bondEnthalpies.ts` — bond dissociation energies
- `data/standardPotentials.ts` — reduction potentials

If the topic's data is already present, build the practice/problems tool on top of it rather than duplicating the data. If it isn't, add the data file first with a clear type definition, then build the practice on top.

**A useful heuristic:** if a topic has a reference page showing a data table but no practice/problems tab, that's a gap worth closing.

---

## `src/chem/` purity rule (non-negotiable)

No module in `src/chem/` may import from:
- React or any React-adjacent library
- `../utils/*` (especially `sigfigs`)
- `../components/*`

Check before adding any import to a chem/ module: `grep "^import" src/chem/*.ts` — every line should start with `from './...'`, `from '../data/...'`, or be a bare ES import. **Importing from `../data/` is allowed** — data files are pure TypeScript and don't break the layer boundary. Importing from `../utils/` or anywhere else outside `chem/` and `data/` is not.

If you need formatting or rounding inside a solver, accept it as a callback argument with a safe default:

```ts
function calcX(
  ...,
  fmt: (n: number) => string = defaultFmt,
  rnd: (n: number) => number = defaultRnd,
): Result
```

**One-and-done history:** `chem/stoich.ts` previously imported `formatSigFigs` from `utils/sigfigs`, which baked display assumptions into the domain layer. This was refactored to pass `fmt`/`rnd` as dependency-injected callbacks. **Do not re-introduce the import** — extend the callback pattern to any new solver instead. `calcLimitingReagent` is the reference implementation.

**Pending adoption:** `calcStoich`, `calcTheoreticalYield`, `calcPercentYield`, and `calcAdvancedPercentYield` in `chem/stoich.ts` still hardcode the default formatter. They're pure (no utils import) but don't accept fmt/rnd parameters. Add the pattern when touching them.

---

## Worked-example generators must call the solver

When a tool has both a "live" calculator and a "show me an example" button, the example generator must call the same `chem/*` solver — **not re-implement the math**. Hardcode "nice" input values, call the solver, read `.steps` / `.products[0].grams` / etc. off the result.

```tsx
function buildWorkedExample(rxn: Reaction) {
  const sol = calcLimitingReagent(rxn, [
    { val: 20, unit: 'g' },
    { val: computeNiceB(rxn), unit: 'g' },
  ])
  return {
    problem: `...`,
    steps: sol.steps,
    answer: `Limiting reagent: ${sol.limitingSpecies?.display}`,
  }
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
{ id: string; label: string; pills: { id: Tab; label: string; formula: string }[] }
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

| Primitive | Purpose |
|---|---|
| `NumberField` | Labeled text input with `inputMode="decimal"` — **never `<input type="number">`** (see below) |
| `useStepsPanelState` + `StepsTrigger` + `StepsContent` | Collapsible step-by-step panel; also drives the Example button |
| `SigFigTrigger` + `SigFigContent` | Sig fig breakdown panel |
| `ResultDisplay` | Animated result card with optional sig-fig alternate and verify state |

### ⚠ Never use `<input type="number">` for numeric input

Always use `NumberField` (which uses `<input type="text" inputMode="decimal">`). `type="number"`:
- Mangles `inputMode` on mobile (especially iOS), forcing users to hunt for the decimal key
- Eats accidental mouse scrolls and silently changes values
- Rounds in browser-specific ways (Firefox vs Chrome vs Safari all differ)
- Rejects scientific notation (`1.5e-3`) in some browsers

This rule is about **numeric** inputs. Plain text inputs (for naming answers, search boxes, etc.) can use `<input type="text">` directly — that's correct.

**Known violation to fix when touched:** `components/atomic/ElectromagneticSpectrum.tsx` uses raw `<input>` elements for wavelength/frequency/energy fields. These are numeric and should migrate to `NumberField`.

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

Tools where the answer is non-numeric (nomenclature, classification, ranking) use a two-state variant: `'correct'` or `'incorrect'`. Skip `'sig_fig_warning'` — it doesn't apply.

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
    reference/     — static-reference pages linked from ReferencePage (solubility, naming)
  utils/           — pure TS, no React (problem generators, formatters)
  chem/            — domain math (stoich, amounts, solutions, sig figs, nomenclature)
  data/            — pure data modules (no logic). Used by both chem/ and components/
  stores/          — Zustand stores (elementStore, etc.)
```

Import shared primitives as `'../shared/X'` from any component subdir.

The `calculations/` entry above is now empty of shared primitives (all moved to `shared/`). It still holds topic-specific components like `MolarReference`, `MolesTool`, etc. — those belong there.

---

## Domain math migration

Stoichiometry is fully migrated to `src/chem/stoich.ts`. The fmt/rnd callback pattern there is the template — follow it for any new chem/ solver.

Other domains (thermo, idealgas, empirical, molar calculations) still compute locally. Migrate opportunistically: when you touch a tool for any other reason, check whether its math is a candidate for `chem/`, and extract if so. Don't do speculative migrations — each one needs tests and costs review time.

---

## Curriculum coverage (Gen Chem 101)

Coverage against Chang 14e chapters, as of the most recent review:

| Ch | Topic | Status |
|---|---|---|
| 1 | Measurement, sig figs, conversions | ✓ Strong |
| 2 | Atoms, ions, molecules | ✓ Strong |
| 2 | **Nomenclature practice** | ⚠ Reference only; no practice tool |
| 3 | Stoichiometry | ✓ Strong |
| 3 | **Weighted atomic mass from isotopes** | ⚠ Data exists; no tool |
| 3 | **Combustion analysis mode for EmpiricalTool** | ⚠ Missing |
| 4 | Aqueous reactions | ✓ Strong |
| 4 | **Titration curves** (pH vs volume) | ⚠ Missing |
| 5 | Gases | ✓ Complete |
| 6 | Thermochemistry | ✓ Complete (phase diagrams, Clausius-Clapeyron added) |
| 7 | Quantum theory / electron config | ✓ Reference strong |
| 7 | **Bohr/photoelectric/deBroglie practice** | ⚠ Missing computational tools |
| 8 | Periodic trends | ⚠ Data + comparison exist; no dedicated reference or practice |
| 9 | Lewis structures, bonding | ✓ Complete |
| 9 | **Lattice energy / Born-Haber** | ⚠ Missing (medium priority) |
| 10 | VSEPR / molecular geometry | ✓ Complete |
| 10 | **Hybridization practice tool** | ⚠ Reference only (embedded in VSEPR data) |
| 10 | **Dipole moment / polarity tool** | ⚠ Missing |
| 10 | **Molecular orbital theory** | ⚠ Missing (syllabus-dependent) |

When adding a new topic, consult this table. If the topic is marked `⚠`, data or reference material likely already exists — build on it rather than duplicating.

When a topic is completed, flip its row to `✓` and update the review summary.

---

## `ReferencePage.tsx`

After the recent cleanup, ReferencePage has two live tabs: `solubility` and `naming`. If a nomenclature practice tool is added, it lives here as a third tab. Don't add unrelated topics here — dedicated topic pages handle everything else.

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
