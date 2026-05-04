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

**The full pipeline for any topic:** data file → chem/ solver → Practice component (with `allowCustom`) → problem generator in utils/ (with dynamic randomization) → tests (20+ iterations) → Problems tab wired with `allowCustom={false}`. If any link in this chain is missing, the topic is incomplete.

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

**Every topic page must have all three modes** unless it is a pure property reference with no calculations (e.g. solubility rules, naming conventions). If a topic has a Practice tab, it **must** also have a Problems tab — practice without auto-generated problems is incomplete.

```
Reference  |  Practice  |  Problems
```

- **Reference** — static guides, formula sheets, visual diagrams. Print button visible. **Print buttons appear ONLY in Reference mode** — never in Practice or Problems.
- **Practice** — solver/calculator tools. Student uses the tool to check their own work.
- **Problems** — **dynamically generated** random problems with verify/check. Uses the same tool components as Practice with `allowCustom={false}`. **Every Practice tool must have a corresponding problem generator** in `utils/*Practice.ts` that produces randomized problems with varied inputs. A practice tool shipped without a problem generator is a bug. A problem generator that produces the same problem every time is also a bug.

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
- Print / Print All buttons appear **only in Reference mode**, beside the page heading. Never in Practice or Problems — students should not be printing generated problems or calculator interfaces.
- For "Print All", set a `printingAll` flag, render the full reference outside `AnimatePresence`, then call `window.print()` in a `requestAnimationFrame` after mount.

### "What is this?" explanation button

**Every topic page must have an ExplanationModal.** This is a small "?" or "What is this?" button in the page heading row that opens a modal explaining what the topic is, why it matters, and how to use the tools on the page. It's the first thing a confused student looks for.

The explanation content should be 2–4 sentences: one sentence defining the topic, one saying when students encounter it in coursework, and one pointing them to the Reference tab for deeper material. Don't write a textbook — write an orientation.

**Known violations to fix when touched:** `LewisPage`, `VseprPage`, `StructuresPage` are missing ExplanationModal.

### Page heading row

Every topic page has a consistent heading row at the top:

```tsx
<div className="flex items-center gap-3">
  <h2 className="text-xl lg:text-2xl font-bold text-bright">{title}</h2>
  <ExplanationModal ... />
  {mode === 'reference' && <PrintButton />}
</div>
```

Title + "What is this?" button + Print button (Reference only). Same order, same styling, every page. Don't deviate.

### URL sync

**Every page with tabs must sync tab state to the URL** via `useSearchParams`. Tab state lives in `?tab=` query params, never in component state alone. This ensures deep links work (a student can share a URL that opens directly to the right tab) and browser back/forward navigate between tabs.

**Known violations to fix when touched:** `LewisPage`, `VseprPage` have no `useSearchParams`.

### Shell variants currently in use

- **Full 3-groups** (reference/practice/problems, all groups defined) — `StoichiometryPage`, `IdealGasPage`. This is the canonical pattern — **default to this for all new topic pages.**
- **Section-based** — `ThermochemistryPage` only. Sections hold Reference/Practice/Problems tabs per subtopic. Pedagogically fits the subtopic-dense thermo material better; leave as-is unless there's a reason to converge.
- **Mode without groups** — `EmpiricalPage`, `ElectronConfigPage`, `StructuresPage`, `LewisPage`. Topic has few enough tools that groups aren't needed. Still has all three modes (Reference/Practice/Problems).
- **Partial groups** — `RedoxPage` (no REFERENCE_GROUPS, flat `REFERENCE_TABS`), `MolarCalculationsPage` (no PROBLEMS_GROUPS). These are drift and must converge to full 3-groups when touched for other reasons. **A page with Practice but no Problems is incomplete.**
- **Reference-only pages** (no Practice/Problems modes) — allowed only for pure property lookups with no calculation component: solubility rules, naming conventions, periodic table. These are the exception to the RPP rule. If you later add a calculator to one of these, it must gain Practice + Problems modes.

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
- **Every tool must have a worked-example button** via `useStepsPanelState`. Even reactive tools (no Calculate button) must have the "Show me an example" button. A tool without an example leaves students with no model of how to approach the problem.

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

## Component & File Conventions

### File naming

- All calculator/solver components: `*Tool.tsx`. Never `*Calc.tsx` or `*Solver.tsx`. The codebase was unified to this convention; don't drift back.
- All reference components: `*Reference.tsx`.
- All practice/problem generators: `*Practice.tsx` (component) and `*Practice.ts` (pure logic in utils/).
- All data files: `src/data/*.ts` — pure TypeScript, no React, no logic beyond type definitions and const arrays.

### PageShell

Every page must use `PageShell` from `src/components/Layout/PageShell.tsx` for its root wrapper. This provides consistent padding, max-width, and gap spacing. Don't inline the padding string (`pl-4 pr-4 md:pl-6 ...`) manually — use PageShell.

**Exceptions:** `LewisPage` and `VseprPage` are component-pages embedded in `StructuresPage` and have different layout needs. These are the only permitted exceptions.

### Reference component root container

All `*Reference.tsx` components must use the same root container:

```tsx
<div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
```

The only exception is `EnthalpyReference` which is a data table with a genuinely different layout.

### Data source attribution

When reference data values (specific heats, bond enthalpies, reduction potentials, ionization energies, etc.) differ from Chang's tables, add a brief footnote in the reference component explaining the source. Don't silently use a different value — students comparing app output to homework answers will notice and lose trust.

Example: "Values from CRC Handbook (2023). Chang Table 6.2 uses slightly different values for some metals."

---

## Adding a New Topic or Practice Tool

When a new calculator/practice topic is added, **all eight** of the following must be updated:

1. **Topic registry** — add the topic to `src/config/topicRegistry.ts`:
   - Add a `TopicId` string literal to the union type.
   - Add a `Topic` entry in `TOPICS` under the correct section.
   - This is the single source of truth for visibility, settings UI, and preset filtering. Nothing is wired up until this entry exists.
2. **Practice tab** — add the tool as a tab in the relevant `*Page.tsx` under the Practice mode group.
3. **Problems tab with dynamic generation** — add a corresponding auto-generated problem mode under the Problems group. Every Practice tool must have a Problems counterpart powered by a `generate*Problem()` function. Wire it into the Problems tab with `allowCustom={false}`. **The Problems tab must produce a fresh, randomized problem every time the student clicks "Next."** Pre-defined static problem pools are not acceptable — problems must be dynamically generated with randomized inputs.
4. **Problem generator** — create `utils/*Practice.ts` with a `generate*Problem()` function. The generator must:
   - Produce **varied, realistic inputs** each time it's called — random values within sensible ranges, random reactions/compounds from curated pools, random directions (solve for volume vs. solve for molarity, etc.)
   - Return the **correct answer** computed from the randomized inputs using the same formula the solver uses
   - Return **step-by-step solution** strings showing the full worked solution
   - Round generated inputs to "nice" values that match textbook style (multiples of 5 for mass, 0.1 for molality, 0.5 for pressure, etc.)
   - Never produce the same problem twice in a row (use sufficient randomization in inputs and pool selection)
5. **Automated tests for the generator** — create `utils/*Practice.test.ts` alongside the generator file. This is NOT optional. Every problem generator must ship with its test file in the same PR. The test file must include:
   - **20+ random iteration test:** call the generator 20+ times, verify each problem has a correct answer by recomputing from the problem's inputs using the known formula
   - **Answer correctness test:** for each generated problem, independently verify that `problem.answer` matches the result of applying the formula to `problem`'s inputs (within tolerance)
   - **Edge case tests:** verify no division by zero, no negative concentrations, no NaN results
   - **At least one hardcoded verification case** using a known textbook problem (e.g. Chang worked example) with exact input values and expected output
   - **Steps non-empty test:** verify every generated problem has a non-empty `steps` array
   - If the generator has a `check*Answer()` function, test that it returns `true` for the correct answer and `false` for a clearly wrong one
6. **Navigation + search** — add the new topic to `NavSidebar.tsx`:
   - Add the tab to the appropriate `*_GROUPS` data array (or add a new group if needed). Do not copy-paste a new `*GroupedItems` component — `GroupedNavSection` handles all tab-based sections generically.
   - Add search keywords so students can find the tool by searching natural terms (e.g. "titration", "acid base", "neutralization" should all surface a titration tool).
7. **Test Generator** — add the topic to `components/test/TestBuilder.tsx`:
   - Add a `TopicDef` entry in `ALL_TOPICS` with the correct `kind`, `group`, `label`, and `formula`.
   - Add the generator import and wire it into the `generate()` switch.
   - The topic must respect visibility: `TestBuilder` filters `ALL_TOPICS` through `usePreferencesStore` so hidden topics don't appear in the test builder UI.
8. **Print Reference** — if the topic has a Reference component, add it to `PrintPage.tsx`:
   - Add the import for the Reference component.
   - Add a `case` in the `ReferenceSection` switch.
   - Add a `PrintTopicDef` entry in `ALL_PRINT_TOPICS` in `components/print/PrintBuilder.tsx`.
   - The topic must respect visibility: `PrintBuilder` filters `ALL_PRINT_TOPICS` through `usePreferencesStore` so hidden topics don't appear in the print builder UI.

Skipping any one of these is a bug. **A problem generator shipped without a test file is a bug.** A test file that only tests the solver but not the generator is incomplete. **A topic with a Reference page that isn't in PrintPage is incomplete. A topic with a practice generator that isn't in TestBuilder is incomplete.**

### Every reference component must be printable — both on-page and in PrintBuilder

There are two independent requirements for print coverage. A reference component that meets only one of them is incomplete:

1. **On-page Print button:** The page that hosts the reference component must have a `⎙ Print` button in its heading row, visible only when `mode === 'reference'`. Call `window.print()` on click. This lets students print the current reference tab directly from the topic page.

2. **PrintBuilder entry:** The reference component must have a `PrintTopicDef` entry in `ALL_PRINT_TOPICS` in `PrintBuilder.tsx`, with a matching `case` in the `ReferenceSection` switch in `PrintPage.tsx`. This lets students include the reference in a custom multi-topic print sheet.

Both are required. A reference component with an on-page Print button but no `PrintBuilder` entry is invisible to the print sheet builder. A reference component in `PrintBuilder` but hosted on a page without a Print button gives students no single-page print path.

**When adding a new reference component:** add both the on-page button (step already covered by CLAUDE.md heading-row rule) and the `PrintBuilder` entry (step 7 in the checklist above). If you are touching an existing topic page for any other reason, check both requirements and fix any gap you find.

### Test problems must replicate the practice page presentation

When a topic is added to `TestBuilder.tsx`, the test must render the problem **exactly as the student sees it on the Problems tab** — same visual structure, same input format, same checking logic. The test is not allowed to "simplify" a structured problem into a different format.

**The rule:** if the Problems tab shows a grid, the test shows a grid. If the Problems tab has multiple input cells, the test has multiple input cells. If the Problems tab checks per-cell with tolerance, the test checks per-cell with tolerance.

**What this means in practice:**

- **ICE tables** render as a full I/C/E × species grid with given/blank cells — not as a single "Find [X] at equilibrium" numeric question. This was fixed; `ice_table` now has kind `'ice_table'` in `testTypes.ts` with a proper `ICETableTestProblem` type.
- **Balancing equations** render as coefficient inputs per species (the comma-separated format matches the practice page's instruction style).
- **Heating curve / phase diagram / reaction profile** problems include the SVG diagram — they already do this and set the standard.
- **Lewis draw / VSEPR draw** open the same draw modal — already correct.
- **Any future interactive problem type** must carry its interactive format into the test.

**Anti-pattern to avoid:** reducing a structured problem to `kind: 'numeric'` or `kind: 'classification'` in `TestBuilder.tsx` when the practice page has custom UI. The `numeric` and `classification` fallback kinds exist only for problems that genuinely have a single typed answer.

**Shared utilities:** when the practice component and the test component both need the same rendering or checking logic (e.g. `generateICEPrefilled`, `checkConcentrationAnswer`, `fmtICECell`), extract that logic to the shared `utils/` file — not duplicated in both places. The ICE table implementation follows this pattern: all three utilities are exported from `utils/equilibriumPractice.ts` and imported by both `ICETablePractice.tsx` and `TestSheet.tsx`.

**Print fidelity:** `buildQuestionHtml()` in `TestSheet.tsx` must also replicate the problem format for print. ICE tables print as an HTML `<table>` with given values filled and blank cells as empty bordered boxes. The printed test should look like a worksheet a professor would hand out — not a wall of text questions.

**Known violations fixed:**

| Topic | Was | Now |
|---|---|---|
| ICE Table (`ice_table`) | `numeric` — single answer box | Full I/C/E grid, per-cell ±2% checking |

### NavSidebar must reflect page layout

The sidebar navigation structure should mirror what the student sees when they arrive at a page. If a page has tabs for "Limiting Reagent", "Theoretical Yield", and "Percent Yield" under Practice, the sidebar should show those as sub-entries under the topic — not just a single "Stoichiometry" link. When a new tab is added to a page, add a corresponding sidebar entry.

Search entries should include common synonyms and related terms. A student searching "moles to grams" should find the moles tool; a student searching "neutralization" should find titration practice.

**NavSidebar is data-driven — do not copy-paste `*GroupedItems` components.** All tab-based topic sections use the generic `GroupedNavSection` component. To add a new tab: add it to the relevant `*_GROUPS` data array. To add a new topic section: add a `SectionConfig` entry to `SECTION_CONFIGS`. The three special-case renderers (`TableGroupedItems`, the inline base-calc block, and the inline structures block) exist because they use `?topic=` params or flat path lists — do not add a fourth.

### `topicRegistry.ts` is the single source of truth for topic visibility

`src/config/topicRegistry.ts` defines every topic the app knows about. The Settings page, the Gen Chem 1/2 presets, the `usePreferencesStore` visibility checks, the `TestBuilder` topic list, and the `PrintBuilder` topic list all derive from it. **When you add a topic, you must add it to the registry first.** A tab that exists on a page but has no registry entry will never appear in settings, will not be hidden when the user hides its section, and cannot be shown or hidden by the Gen Chem presets.

### Extract shared utilities before the second caller

When a practice component and a test component (or two pages) both need the same rendering or checking logic, extract it to `utils/` on the first duplication. Do not let the same logic live in two places "temporarily." The ICE table case — `generateICEPrefilled`, `checkConcentrationAnswer`, `fmtICECell` all exported from `utils/equilibriumPractice.ts` and imported by both `ICETablePractice.tsx` and `TestSheet.tsx` — is the reference pattern.

### Backend package creation conventions

When adding a new Go backend package under `chemhelper/` (e.g. `organic/`, `nuclear/`):
- Package directory name = lowercase single word matching the chemistry domain.
- Exported solver functions return `(Result, error)` where `Result` is a named struct.
- HTTP handler lives in `api/` and calls the domain package — domain packages must not import `net/http`.
- Errors are `422 Unprocessable Entity` with a `{"error": "descriptive message"}` body — use the existing `writeError` helper.
- Check `chemhelper/` before building frontend-only: molarity, Lewis structures, SMILES, BPE/FPD are already server-side.

### Tab value naming conventions

Tab IDs in `*Page.tsx` and the registry follow these conventions:
- **Reference tabs:** prefix `ref-` (e.g. `ref-entropy`, `ref-rate-law`).
- **Practice/tool tabs:** no prefix, kebab-case (e.g. `entropy`, `rate-law`).
- **Problems tabs:** suffix `-problems` (e.g. `entropy-problems`, `gibbs-k-problems`).
- Tab IDs must match between the page's `Tab` union type, the `TAB_TO_TOPIC` map, the `TOPIC_MODE_TAB` map, the `*_GROUPS` data arrays in `NavSidebar.tsx`, and the `Topic.id` in `topicRegistry.ts`. A mismatch in any one place will break visibility filtering or navigation.

### Problem generator requirements (non-negotiable)

Every Practice tool must have a corresponding `utils/*Practice.ts` file containing a `generate*Problem()` function. This function is the source of all Problems-mode content. It must meet these requirements:

**Dynamic generation:** Problems are created algorithmically at runtime, not pulled from a static list. The generator picks random values, random reactions, random compounds, and random solve-directions each time it's called. A student who clicks "Next" 20 times must see 20 meaningfully different problems.

**Generator structure:**
```ts
export interface SomeProblem {
  scenario: string          // the problem statement shown to the student
  answer: number | string   // the correct answer
  answerUnit?: string       // unit of the answer
  steps: string[]           // full worked solution
}

export function generateSomeProblem(): SomeProblem {
  // 1. Pick random inputs from sensible ranges
  // 2. Compute the correct answer using the same formula as the solver
  // 3. Build a human-readable scenario string
  // 4. Build step-by-step solution strings
  // 5. Return the complete problem
}
```

**Curated pools + randomized values:** The best generators combine a curated pool of realistic context (real reactions, real compounds, real elements) with randomized numeric values. Example: pick a random acid-base pair from `acidBasePairs.ts`, then generate random concentrations in [0.05, 0.50] M and random volumes in [10, 50] mL.

**Answer correctness:** The generator MUST compute the answer using the same chem/ function that the solver uses. Never hardcode answers. If the formula changes, both the solver and the generator update automatically.

**Testing:** Every generator must have a test that runs 20+ iterations and verifies each generated problem has a correct answer. If the generator can produce edge cases that break the formula (division by zero, negative concentrations, etc.), the test must catch them.

**What is NOT acceptable:**
- A static array of 10 problems that repeats
- A generator that always uses the same numeric values with only the compound name changing
- A generator with no `steps` array (students need to see the worked solution after checking)
- A Practice component with no corresponding generator (meaning Problems mode is identical to Practice mode)

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
| 2 | Nomenclature practice | ✓ Complete (NomenclatureTool on ElectronConfigPage) |
| 3 | Stoichiometry | ✓ Strong (chained yield, molecular diagrams added) |
| 3 | Weighted atomic mass from isotopes | ✓ Complete (isotopePractice + ReverseIsotopeTool) |
| 3 | **Combustion analysis mode for EmpiricalTool** | ⚠ Missing |
| 4 | Aqueous reactions | ✓ Strong (titration arithmetic added) |
| 4 | **Titration curves** (pH vs volume) | ⚠ Missing |
| 5 | Gases | ✓ Complete (custom T/P, reverse density, gas-over-water added) |
| 6 | Thermochemistry | ✓ Complete (expansion work, heat of soln/neut, ΔU↔ΔH, energy balance added) |
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

ReferencePage is now a single-purpose page showing only Solubility Rules (21 lines, renders `SolubilityReference`). Naming reference and nomenclature practice were moved to `ElectronConfigPage` as a topic.

Don't add new topics to ReferencePage — dedicated topic pages handle everything else. If the solubility rules eventually gain a practice component, ReferencePage should gain Practice/Problems modes at that point.

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

---

## Testing Conventions

**Framework:** Vitest. Run with `npm test` (single run) or `npm run test:watch` (watch mode).

**Test file locations:**
- Domain logic tests: `src/chem/__tests__/*.test.ts` — co-located under the chem/ folder
- Practice generator tests: alongside the generator, e.g. `src/utils/daltonsPractice.test.ts`
- Component tests: alongside the component, e.g. `src/components/lewis/LewisEditor.test.ts`

**Mandatory test coverage — no exceptions:**

1. **Every `src/chem/` function** must have tests with edge cases. These protect chemistry correctness — the most valuable tests in the project.

2. **Every `utils/*Practice.ts` generator must have a corresponding `utils/*Practice.test.ts`.** A generator shipped without tests is a bug. The test file must include:

```ts
describe('generateSomeProblem', () => {
  // REQUIRED: 20+ iteration correctness check
  it('produces correct answers across 20+ runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateSomeProblem()
      // Recompute answer from p's inputs using the known formula
      expect(recomputed).toBeCloseTo(p.answer, tolerance)
    }
  })

  // REQUIRED: hardcoded verification case
  it('matches Chang Example X.Y', () => {
    // Use exact textbook values
  })

  // REQUIRED: range/validity checks
  it('all values in valid ranges', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateSomeProblem()
      expect(p.answer).not.toBeNaN()
      expect(p.steps.length).toBeGreaterThan(0)
      // Topic-specific: pH 0-14, concentrations > 0, etc.
    }
  })

  // RECOMMENDED: if generator has check*Answer(), test it
  it('checkAnswer returns true for correct, false for wrong', () => {
    const p = generateSomeProblem()
    expect(checkAnswer(p.answer.toString(), p)).toBe(true)
    expect(checkAnswer('999999', p)).toBe(false)
  })
})
```

3. At least one **Chang-verbatim verification case** per solver. Pick a worked example from the textbook, hardcode its inputs, and verify the output matches Chang's published answer.

**What NOT to test:**
- Don't test React rendering behavior unless it's a complex interactive component (like ChainedProblem or LewisEditor). Simple display components don't need tests.
- Don't test Tailwind classes or animation parameters.

---

## Framer Motion Gotchas

These are bugs discovered in this project:

- **Never use `layoutId` on many elements.** `AnimatePresence` with `layoutId` on 118 periodic table cells blocks page transitions. Use simple scale/fade instead. If you have more than ~20 elements with `layoutId`, performance will degrade.
- **Don't wrap `<Outlet />` in `AnimatePresence`.** This breaks React Router's route transitions.
- **JSX `animate` prop vs imperative `animate()` are different APIs** with different keyframe formats. Per-keyframe timing requires `useAnimate` + `useEffect`, not the JSX prop. Hooks can't be called inside `.map()` — extract to a standalone component if you need per-item animation.
- **`AnimatePresence` requires `key` on direct children.** If children don't have stable unique keys, exit animations won't fire.

---

## Chemistry-Specific Rules

Learned from bugs found during code review:

- **Van't Hoff factor (i) must never affect sig fig count.** The factor i is an exact integer (or treated as one) — it doesn't limit the significant figures of the result.
- **Never output scientific notation as `1e+1`.** Always format as `1.0 × 10¹` or similar. Students don't recognize JS exponential notation as a valid answer. Use `toFixed` or a custom formatter, never raw `.toString()` on large/small numbers.
- **Sign conventions in calorimetry:** q_system = −q_surroundings. The existing tools handle this correctly; don't invert it when adding new modes. When the temperature drops (endothermic dissolution), q_water is negative, q_rxn is positive, ΔH_soln is positive.
- **Formal charge formula:** FC = (valence electrons) − (lone pair electrons) − (number of bonds). Not bond *order* — count each bond (single, double, triple) as 1 for the bond count in the FC formula, regardless of bond order. (The existing LewisEditor uses bond degree sum, which is equivalent for FC because the formula actually uses shared electrons / 2.)
- **Sig figs on constants:** Tabulated constants (Kb, Kf, R, F, etc.) are exact or have more sig figs than student data. They should never limit the sig fig count of a result.
- **Reduction potentials:** E°cell = E°cathode − E°anode (not the other way around). The sign of E° for a half-reaction never changes when you reverse it — that's the modern IUPAC convention. Only the cell potential uses the subtraction.

---

## Dependency Discipline

The project has 9 runtime dependencies. Keep it lean.

- **Do not add new npm dependencies without explicit approval.** If a task seems to need a library, first check whether the functionality exists in the current deps or can be implemented in a few lines. Most chemistry math is simple enough to inline.
- **Current runtime deps:** React, React-DOM, React-Router, Framer Motion, Zustand, Axios, and a few others. Check `package.json` before assuming a library is available.
- **Allowed dev deps:** Vitest, TypeScript, Tailwind, Vite, ESLint. Don't add testing libraries beyond Vitest (no Jest, no Testing Library unless it's already present).

---

## State Management

- **`useState` for everything local to one component.** Calculator inputs, verify state, steps panel state, toggle booleans — all local.
- **Zustand only for cross-component shared state.** Currently only `elementStore.ts` (periodic table data). The planned scratchpad (for sharing reactions between tools) will be a second Zustand store when it's built. Don't create new Zustand stores for tool-specific state.
- **URL params for navigation state.** Tab selection, mode selection — these go in `useSearchParams`, not in component state or Zustand. This is how deep links work.
- **Never store derived data.** If you can compute it from other state, compute it. Don't store both `moles` and `grams` when one is derived from the other via molar mass.

---

## Backend Coordination

The Go backend at `chemhelper/` has its own domain packages (`element/`, `solution/`, `thermo/`, `structure/`, `smiles/`, `units/`) that overlap with some frontend logic. When building new features:

- **Check whether the backend already has the calculation.** Molarity, molality, BPE/FPD, Lewis structures, and SMILES resolution are already server-side. Don't build a second implementation on the frontend if the backend can serve it.
- **API errors should return 422 with descriptive messages**, not generic 404s. Follow the existing `writeError(w, http.StatusUnprocessableEntity, "descriptive message")` pattern in the Go handlers.
- **Frontend `src/api/` is the only place that calls the backend.** Don't put `fetch` or `axios` calls inside components or utils. All API calls go through the `src/api/client.ts` axios instance.
