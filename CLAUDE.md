# chemhelper_fe — Patterns & Conventions

## Philosophy

ChemHelper is an educational chemistry tool — accuracy and pedagogical clarity come before feature breadth or visual polish.

- Prefer correctness with a textbook worked example over UI elegance.
- Prefer verbose step-by-step output over terse "the answer is X".
- Prefer pushing domain logic into `src/chem/` over inline component math.
- Prefer adding tests (especially against Chang or Atkins worked examples) over visual verification.

Chang's *Chemistry* (14e, 2022) is the primary reference. When Chang and rigorous modern values disagree, prefer Chang for student consistency; footnote the exception in the reference component.

---

## Architecture rules

### `src/chem/` purity (non-negotiable)

No module in `src/chem/` may import from React, `../utils/*`, or `../components/*`. `../data/*` imports are allowed.

For formatting/rounding inside a solver, accept a callback with a safe default:
```ts
function calcX(..., fmt: (n: number) => string = defaultFmt, rnd: (n: number) => number = defaultRnd): Result
```
`calcLimitingReagent` is the reference implementation. `calcStoich`, `calcTheoreticalYield`, `calcPercentYield`, `calcAdvancedPercentYield` still hardcode the formatter — add the pattern when touching them.

### Worked-example generators must call the solver

The "show me an example" button must call the same `chem/*` solver as the live tool — never re-implement the math. Hardcode "nice" inputs, call the solver, read steps/answer off the result.

### File layout

```
src/
  pages/           — RPP page shells, tab routing, no math
  components/
    <topic>/       — topic-specific tools, practice, reference
    shared/        — cross-topic primitives (NumberField, StepsPanel, ...)
    Layout/        — PageShell, nav
    tools/         — interactive classifiers
    calculations/  — legacy; topic components only (primitives moved to shared/)
    reference/     — static reference linked from ReferencePage
  utils/           — pure TS, no React (problem generators, formatters)
  chem/            — domain math
  data/            — pure data modules
  stores/          — Zustand stores
```

Import shared primitives as `'../shared/X'` from any component subdir.

### State management

- `useState` for everything local to one component.
- Zustand only for cross-component shared state (currently only `elementStore`).
- URL params (`useSearchParams`) for tab/mode selection — never component state alone, so deep links work.
- Never store derived data; compute it.

### Dependency discipline

The project has 9 runtime deps. Don't add new ones without approval. Check `package.json` first. Most chemistry math inlines in a few lines.

---

## Page architecture: Reference | Practice | Problems (RPP)

**Every topic page must have all three modes** unless it's a pure property reference with no calculations (solubility rules, naming, periodic table). If a page has Practice, it must have Problems.

- **Reference** — static guides, diagrams, formula sheets. Print button visible **only here**.
- **Practice** — calculator/solver tools. Student checks their own work.
- **Problems** — dynamically generated random problems. Same components as Practice with `allowCustom={false}`. **Static problem pools are not acceptable** — every "Next" must produce a meaningfully different problem.

### Mode/tab switching

A rounded-full pill toggle drives `Mode = 'reference' | 'practice' | 'problems'`. Tabs use `?tab=` URL params. When mode changes, the topic is preserved via `TAB_TO_TOPIC` + `TOPIC_MODE_TAB`; otherwise fall back to `MODE_DEFAULT[mode]`.

Tabs may be grouped via `TabGroup[]`:
```ts
{ id: string; label: string; pills: { id: Tab; label: string; formula: string }[] }
```
The `formula` field is a short monospace annotation (e.g. `g↔mol`, `%Y`).

### Page heading row

Every topic page has the same row at the top:
```tsx
<div className="flex items-center gap-3">
  <h2 className="text-xl lg:text-2xl font-bold text-bright">{title}</h2>
  <ExplanationModal ... />
  {mode === 'reference' && <PrintButton />}
</div>
```
Title + ExplanationModal + Print button (Reference only). Same order, every page.

The ExplanationModal content is 2–4 sentences: define the topic, say where students encounter it, point to Reference for depth.

### Print

- All nav rows are `print:hidden`.
- Print buttons appear **only in Reference mode**.
- For "Print All", set a `printingAll` flag, render the full reference outside `AnimatePresence`, then call `window.print()` in a `requestAnimationFrame`.

### Shell variants in use

- **Full 3-groups** (canonical) — `StoichiometryPage`, `IdealGasPage`. Default to this.
- **Section-based** — `ThermochemistryPage`. Each section holds its own RPP tabs.
- **Mode without groups** — `EmpiricalPage`, `ElectronConfigPage`, `StructuresPage`, `LewisPage`. Few enough tools that groups aren't needed.
- **Reference-only** — solubility, naming, periodic table. Adding a calculator promotes them to full RPP.

### Known drift to fix when touched

| Page | Issue |
|---|---|
| LewisPage, VseprPage | No ExplanationModal, no `useSearchParams` |
| StructuresPage | No ExplanationModal |
| RedoxPage | No `REFERENCE_GROUPS` (flat tabs) |
| MolarCalculationsPage | No `PROBLEMS_GROUPS` |
| ElectromagneticSpectrum | Uses raw `<input>` for numerics — should be `NumberField` |

---

## Calculator tool pattern

Every calculator must use shared primitives from `src/components/shared/`:

| Primitive | Purpose |
|---|---|
| `NumberField` | Labeled `<input type="text" inputMode="decimal">` |
| `useStepsPanelState` + `StepsTrigger` + `StepsContent` | Collapsible steps panel + Example button |
| `SigFigTrigger` + `SigFigContent` | Sig fig breakdown panel |
| `ResultDisplay` | Animated result card with sig-fig alternate and verify state |

### Never use `<input type="number">` for numeric input

`type="number"` mangles `inputMode` on iOS, eats mouse scrolls, rounds inconsistently across browsers, and rejects scientific notation. Use `NumberField` for all numerics. Plain text inputs (names, search) can use `<input type="text">` directly.

### Wiring

```tsx
const [steps, setSteps]         = useState<string[]>([])
const [breakdown, setBreakdown] = useState<SigFigBreakdown | null>(null)
const [sfOpen, setSfOpen]       = useState(false)

const stepsState = useStepsPanelState(steps, () => {
  const ex = buildWorkedExample(rxn)
  return { scenario: ex.problem, steps: ex.steps, result: ex.answer }
})

function handleTool() {
  const res = calcSomething(...)
  setSteps(res.steps)
  setBreakdown(buildSigFigBreakdown([...], res.rawAnswer, 'g'))
}

<div className="flex items-stretch gap-2">
  <button onClick={handleTool}>Calculate</button>
  <StepsTrigger {...stepsState} />
  <SigFigTrigger breakdown={breakdown} open={sfOpen} onToggle={() => setSfOpen(o => !o)} />
</div>
<StepsContent {...stepsState} />
<SigFigContent breakdown={breakdown} open={sfOpen} />

{result && <ResultDisplay label="..." value={String(result.answer)} unit="g" sigFigsValue={sfResult} />}
```

Rules:
- Reset `steps`, `breakdown`, `result` on every input change.
- `ResultDisplay value` is a string — coerce numbers with `String(n)`.
- `SigFigBreakdown` only applies for mass inputs (`'g'`); skip for moles.
- The example generator function is defined inline (closure) when it depends on component state.
- **Every tool must have a worked-example button**, including reactive tools (no Calculate button).

### Reactive tools (no Calculate button)

For live-computing tools (EmpiricalTool, ClausiusClapeyronTool, EnthalpyTool), use a `noSteps` sentinel:
```tsx
const [noSteps] = useState<string[]>([])
const stepsState = useStepsPanelState(noSteps, generateMyExample)

<div className="flex items-stretch gap-2">
  <StepsTrigger {...stepsState} />
</div>
<StepsContent {...stepsState} />
```

If the tool's internal steps are typed as `{ label: string; expr: string }[]`, map to strings before passing to `useStepsPanelState`.

### Verify state

Numeric answer-checking tools use three states:
- `'correct'` — value matches within tolerance and sig figs are right
- `'sig_fig_warning'` — value correct, sig figs off
- `'incorrect'` — value doesn't match

Non-numeric answer tools (nomenclature, classification, ranking) use only `'correct'` / `'incorrect'`.

Pending verify-state adoption: `LimitingReagentTool`, `EmpiricalTool`, `GasStoichTool`, `PercentCompositionTool`. Visualizers without an "answer" (`HeatingCurveTool`, `ReactionProfileTool`) are exempt.

---

## Adding a new topic

When a new calculator/practice topic is added, **all eight** of these must be updated. A topic missing any one is incomplete.

1. **`src/config/topicRegistry.ts`** — add `TopicId` to the union; add the `Topic` entry under the right section. This is the single source of truth for visibility, settings, presets, TestBuilder, and PrintBuilder. Nothing is wired until this exists.
2. **Practice tab** — add the tool as a tab in `*Page.tsx` under the Practice mode group.
3. **Problems tab** — wire the same tool with `allowCustom={false}` under Problems mode.
4. **Problem generator** — create `utils/*Practice.ts` with a `generate*Problem()` (see "Problem generator requirements" below).
5. **Generator tests** — `utils/*Practice.test.ts` shipped in the same PR (see "Testing" below).
6. **NavSidebar + search** — add the tab to the relevant `*_GROUPS` data array (do **not** copy-paste a new `*GroupedItems` component — `GroupedNavSection` handles tab-based sections generically). Add search keywords (e.g. "titration", "neutralization", "acid base").
7. **PrintBuilder entry** — every reference component with an on-page Print button must also have a `PrintBuilder` entry. Either-or is a bug.
8. **TestBuilder entry** — if the topic should appear on student tests. The test must render the problem **exactly as the Problems tab does** — same grid structure, same per-cell checking. Don't reduce a structured problem (ICE table, balancing) to `kind: 'numeric'`. Print fidelity matters too: `buildQuestionHtml()` in `TestSheet.tsx` must replicate the format. Extract shared logic (rendering, checking) to `utils/` on the first duplication — reference: `utils/equilibriumPractice.ts` exports used by both `ICETablePractice.tsx` and `TestSheet.tsx`.

### Tab ID conventions

- Reference tabs: `ref-` prefix (`ref-entropy`)
- Practice tabs: kebab-case, no prefix (`entropy`)
- Problems tabs: `-problems` suffix (`entropy-problems`)

Tab IDs must match across the page's `Tab` union, `TAB_TO_TOPIC`, `TOPIC_MODE_TAB`, `*_GROUPS` in NavSidebar, and `Topic.id` in the registry. A mismatch silently breaks visibility filtering or navigation.

---

## Problem generator requirements

Every Practice tool needs `utils/*Practice.ts` with a `generate*Problem()`:

```ts
export interface SomeProblem {
  scenario: string          // problem statement shown to student
  answer: number | string   // correct answer
  answerUnit?: string
  steps: string[]           // full worked solution
}

export function generateSomeProblem(): SomeProblem {
  // 1. Pick random inputs from sensible ranges
  // 2. Compute the answer using the same chem/ function as the solver — never hardcode
  // 3. Build human-readable scenario string
  // 4. Build step-by-step solution strings
}
```

**Curated pools + randomized values.** Best generators combine a curated pool (real reactions, real compounds) with random numerics. Round inputs to "nice" textbook values: multiples of 5 for mass, 0.1 for molality, 0.5 for pressure.

**Not acceptable:**
- Static array of N problems that repeats
- Same numerics with only the compound name changing
- Empty `steps` array
- A Practice component with no generator (Problems mode would be identical to Practice)

---

## File & component conventions

- Calculator/solver components: `*Tool.tsx`. Never `*Calc.tsx` or `*Solver.tsx`.
- Reference components: `*Reference.tsx`. Root container:
  ```tsx
  <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
  ```
  (Exception: `EnthalpyReference` is a genuinely different table layout.)
- Practice components: `*Practice.tsx`. Generators: `utils/*Practice.ts`.
- Data files: `src/data/*.ts` — pure TS, no React, no logic beyond types and constants.
- Every page uses `PageShell` from `Layout/`. Don't inline padding strings. Exception: `LewisPage` and `VseprPage` are embedded in `StructuresPage`.

When reference data values differ from Chang's tables (specific heats, bond enthalpies, reduction potentials), add a brief footnote. Don't silently use a different value.

---

## Styling

- `color-mix(in srgb, var(--c-halogen) N%, ...)` for tinted backgrounds and borders. Never hard-coded hex for accents.
- Active pill: bg `color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))`, border `color-mix(in srgb, var(--c-halogen) 30%, transparent)`.
- Pill spring: `{ type: 'spring', stiffness: 400, damping: 32 }`.
- `layoutId` strings unique across the page.
- `print:hidden` on every nav/pill row.

---

## Testing (Vitest)

`npm test` (single) or `npm run test:watch`.

Locations: `src/chem/__tests__/*.test.ts`, `src/utils/*Practice.test.ts`, `src/components/<topic>/*.test.ts`.

**Required tests:**

1. **Every `src/chem/` function** has tests with edge cases.
2. **Every `utils/*Practice.ts` generator** has a `*Practice.test.ts` with:
   - 20+ random iterations recomputing each answer from inputs
   - At least one Chang-verbatim case with hardcoded inputs and expected output
   - Range/validity checks (no NaN, pH 0–14, concentrations > 0, non-empty steps)
   - If a `check*Answer()` exists, test it returns `true` for correct and `false` for clearly wrong

```ts
describe('generateSomeProblem', () => {
  it('produces correct answers across 20+ runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateSomeProblem()
      // Recompute from p's inputs using the formula
      expect(recomputed).toBeCloseTo(p.answer, tolerance)
    }
  })
  it('matches Chang Example X.Y', () => { /* exact textbook values */ })
  it('all values valid', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateSomeProblem()
      expect(p.answer).not.toBeNaN()
      expect(p.steps.length).toBeGreaterThan(0)
    }
  })
})
```

**Don't test:** React rendering of simple display components, Tailwind classes, animation parameters.

---

## Framer Motion gotchas

- **No `layoutId` on many elements.** `AnimatePresence` with `layoutId` on 118 periodic table cells blocks page transitions. >20 elements with `layoutId` = perf cliff. Use simple scale/fade.
- **Don't wrap `<Outlet />` in `AnimatePresence`** — breaks React Router transitions.
- **JSX `animate` prop ≠ imperative `animate()`.** Different keyframe formats. Per-keyframe timing needs `useAnimate` + `useEffect`. Hooks can't be called inside `.map()` — extract to a standalone component.
- **`AnimatePresence` requires `key` on direct children.** No stable key, no exit animation.

---

## Chemistry-specific rules

- **Van't Hoff factor (i) never affects sig fig count.** It's an exact integer.
- **Never output `1e+1`-style scientific notation.** Format as `1.0 × 10¹`. Students don't recognize raw JS exponentials.
- **Calorimetry:** q_system = −q_surroundings. Endothermic dissolution → q_water negative, q_rxn positive, ΔH_soln positive.
- **Formal charge:** FC = valence − lone pair electrons − bond count. Count each bond as 1 regardless of order.
- **Constants don't limit sig figs.** Tabulated Kb, Kf, R, F are exact or have more sig figs than student data.
- **Reduction potentials:** E°cell = E°cathode − E°anode. The sign of E° for a half-reaction never changes when reversed (modern IUPAC).

---

## Backend coordination

The Go backend at `chemhelper/` has domain packages (`element/`, `solution/`, `thermo/`, `structure/`, `smiles/`, `units/`).

- **Check for existing backend implementations** before building new frontend math. Molarity, molality, BPE/FPD, Lewis structures, SMILES are server-side.
- **API errors return 422** with descriptive messages: `writeError(w, http.StatusUnprocessableEntity, "...")`. Never generic 404s.
- **All fetch calls go through `src/api/client.ts`** (axios, baseURL `/api`, 15s timeout). No `fetch` or `axios` inside components or utils.

When adding a new Go package:
- Lowercase single word matching the chemistry domain.
- Solvers return `(Result, error)` where `Result` is a named struct.
- HTTP handlers in `api/`; domain packages don't import `net/http`.

---

## Mechanism animation consistency

All mechanism reaction data lives in `src/data/mechanisms/`. Every new reaction file follows these rules — no exceptions.

### Use template functions, not raw coordinates

For atom placement, use template functions in `sceneTemplates.ts`:
- `sp3CarbonScene()` — tetrahedral with wedge/dash slots
- `alkeneScene()` — sp² C=C with 120° substituents
- `alkyneScene()` — sp linear C≡C
- `benzeneScene()` — hexagonal ring, ids `b1`–`b6`
- `carbonylScene()` — trigonal C=O

When a geometry doesn't fit a template, use `SceneBuilder` with `atomFrom()` (polar from an anchor). Never type raw x/y values for substrate atoms. Standard scene: **700×320**. Standard bond length: **`BOND_LENGTH = 100`px**.

For animations, use `ArrowBuilder` — never raw `from`/`to` in primitives:
```ts
const ab = new ArrowBuilder(scene)
ab.fromAtomToAtom('nu', 'c', { color: 'var(--c-alkali)', duration: 0.6 })  // ✓
ab.translateAtom('br', 650, 150, { duration: 0.8, delay: 0.3 })            // ✓

{ type: 'curved_arrow', from: {x:130, y:150}, to: {x:326, y:150} }         // ✗
{ type: 'atom_translate', from: {x:555, y:150}, to: {x:650, y:150} }       // ✗ missing targetId
```

Exception for hand-written primitives: when an atom has been moved by a previous step's `atom_translate`, `ArrowBuilder` doesn't know its new position (it reads from the original scene). In that case, use a hand-written primitive with a comment explaining the committed position. Keep these rare.

### Reagent placement: stay close to the reactive site

**Reagents must start close enough to their final position that the translate path doesn't cross any rendered bond.** A 200px diagonal translate across the canvas will cross the substrate. A 30-50px translate stays local to the bond it's forming.

Concrete rule for alkene reactions (alkene at y=175): place attacking reagents at **y=110-130** (just above the alkene) or **y=240-260** (just below). Do not place reagents at y=50 and then translate them through the C=C to land at y=240. The straight-line path crosses y=175 and visually flies through the double bond.

Same rule for any reaction with a substrate bond: reagents start ~50px from their landing position, on the same side of the substrate they'll attach to. If the reagent will become a wedge substituent (above the page), it starts above. If it will become a dash substituent (below the page), it starts below.

The textbook depiction of mechanisms doesn't actually show atoms flying — bonds appear formed in the next frame. We can't fully replicate that, but we can shorten translate paths until the visible motion is "settle into place" rather than "fly across the canvas."

### `atom_translate` uses `targetId`

Every `atom_translate` must include `targetId`. The legacy distance-matching path stays for backward compat but no new data should rely on it. The validator warns when `from` is more than 5px from the targetId's actual position.

For atoms that move multiple times in one step (e.g. an attacker that drops below the substrate then crosses laterally), use **two sequential `atom_translate` primitives** with explicit `from` matching the previous segment's `to`:

```ts
{ type: 'atom_translate', targetId: 'br2', from: { x: 120, y: 175 }, to: { x: 120, y: 270 }, duration: 0.3, delay: 0.1 },
{ type: 'atom_translate', targetId: 'br2', from: { x: 120, y: 270 }, to: { x: 420, y: 245 }, duration: 0.5, delay: 0.4 },
```

This routes the atom around the substrate instead of through it.

### `bond_break` vs `bond_order_change`

`bond_break` removes a bond from the scene entirely (it goes into `brokenBondIds` and is filtered out of rendering). It does NOT downgrade order.

For a double bond becoming a single bond (every alkene addition reaction), use `bond_order_change`:
```ts
// Wrong — removes the C-C bond entirely, leaving floating atoms:
{ type: 'bond_break', targetId: 'c1-c2', delay: 0.3 },

// Right — keeps the C-C single bond:
{ type: 'bond_order_change', targetId: 'c1-c2', text: '1', delay: 0.3 },
```

Use `bond_break` only for bonds that fully disappear: the H–X bond when HX adds, the X–X bond in halogenation, the H–H bond in hydrogenation, the bond from a leaving group to its parent.

### Cyclic intermediates: break the ring when it opens

When a cyclic intermediate (halonium, mercurinium, epoxide-like) opens in the next step, you must explicitly `bond_break` the bond that no longer exists in the product. Otherwise the final structure has both the ring-opening attacker AND the original ring bond — three bonds where there should be two.

Halogenation example:
- Step 1 forms `c1-br1` and `c2-br1` (the bromonium ring)
- Step 2 forms `c2-br2` (the attacking Br⁻)
- Step 2 must also `bond_break` `c2-br1` — the ring opens on the c2 side

Without that break, the product has br1 bonded to both c1 AND c2, which is not a 1,2-dihalide.

### Stereo bonds (wedge/dash) must be applied during the step that creates the stereo product

The reaction's `stereochemistry: 'syn'` / `'anti'` / `'inversion'` is a chemistry tag — it doesn't render anything. To make stereochemistry visible, emit `bond_style_change` primitives during the appropriate step:

- **Syn additions** (hydroboration, epoxidation, hydrogenation, OsO₄): both new bonds set to `'wedge'` in the same step. Same-face delivery is shown by both bonds pointing toward the viewer.
- **Anti additions** (halogenation, anti epoxide opening): one new bond `'wedge'`, the other `'dash-wedge'`. Opposite-face is shown by one toward, one away.
- **SN2 / Williamson / inversion**: use `invert_stereocenter` to flip all wedge↔dash on the central C. Never translate H atoms to fake inversion.
- **E2**: β-H on wedge, leaving group on dash-wedge of adjacent C — visualizes anti-periplanar.
- **SN1**: carbocation is sp² planar — no wedge/dash on bonds to the cationic C. Show racemization with the description; one curved arrow from solvent is the standard textbook depiction.

### Final-frame integrity

After the last step's animations complete, every atom must be at a position the product's structural drawing would put it. **Atoms that occupied intermediate positions (carbocation, halonium bridge, mercurinium bridge) must be translated to their final substrate position before the step ends.**

Halogenation example: br1 starts at (350, 110) as the bromonium-bridge atom. After step 2's ring-opening, br1 should be a normal substituent on c1, not still floating above the C=C midpoint. Add an `atom_translate` at delay 0.5 to move it from (350, 110) to (230, 105) — c1's upper-left wedge slot.

The committed final scene is what the student studies. Make it look like the product's structural drawing.

### Atom IDs and roles

Standard IDs:
- `c`, `c1`, `c2` — reactive carbons; `c_alpha`, `c_beta` — Greek-named positions
- `nu` — nucleophile; `lg`/`br`/`cl`/`x` — leaving group
- `base`, `b1`–`b6` (benzene), `me1`–`me3` (methyls), `r1`–`r3` (R groups)
- `h_proton` — added H from acid; `h_added` — H from a reagent like BH₃ or H₂

Apply `role` on key atoms:
- `'nucleophile'`, `'leaving_group'`, `'base'`, `'acid'`
- `'alpha_carbon'`, `'beta_carbon'`, `'carbonyl_carbon'`, `'carbonyl_oxygen'`
- `'more_substituted'`, `'less_substituted'`
- `'r_group'`, `'h_substituent'`

Use `findByRole(scene, role)`, `getNucleophile(scene)`, `getLeavingGroup(scene)` in animations rather than hardcoded IDs.

### Step animation timing convention

Within a step, `delay` orders the animations. Standard pattern:
```
delay 0.0  bond_break / bond_order_change (committed state changes can fire first)
delay 0.0  curved_arrow (electron movement starts visualizing)
delay 0.2  atom_translate (atom moves into position)
delay 0.3  bond_form (new bond appears)
delay 0.4  charge_appear / charge_disappear (charges update)
delay 0.4  bond_style_change (wedge/dash/solid update)
delay 0.5  intermediate_glow (highlight the intermediate)
delay 0.5  atom_translate for "settle into product position" moves
delay 0.7  step_label (text caption at bottom)
```
Don't deviate without a reason. Fiddling with delays to make something "look right" usually means the chemistry is being misrepresented.

### Font sizes — match the rest of the app

The mechanism player and cards should match the typography elsewhere in the app. The rest of ChemHelper uses `text-sm` (14px) for body and `text-xs` (12px) for labels. Reference components rarely go below 12px.

For mechanism cards (`MechanismCard.tsx`):
- `text-sm` for reaction name, summary, reactants→products, conditions value, key-points text, chevron
- `text-xs` for section labels (Conditions / Key Points / Mechanism / Related), Brown ref, metadata flags, related-reaction tags
- `text-[10px]` only for the badges (intentionally compact pills for the dense badge row)

For the SVG canvas (`MechanismPlayer.tsx`):
- `fontSize={14}` for atom symbols (was 12)
- `fontSize={11}` for charge superscripts (was 9)
- `fontSize={10}` for atom labels and energy axis labels (was 8)
- `fontSize={13}` for in-scene step labels (was 11)
- `fontSize={9}` for energy diagram point labels (was 7)
- Atom circle radius `r={16}` to fit the larger text

### Validation

`validateAllReactions(ALL_REACTIONS)` runs at module load in dev. It warns on:
- Coordinate drift in `atom_translate` (>5px from targetId's actual position)
- `atom_translate` without `targetId` and no atom within 50px
- Orphan `targetId` (atom/bond doesn't exist)
- Off-canvas atoms
- Overlapping atoms (<25px apart)
- Stereocenter in inversion reaction missing wedge/dash

A clean console is the acceptance criterion. **Don't ship a reaction with warnings.** If a warning is wrong, fix the validator, don't suppress.

### Common bugs and their fixes

A reference for the bug patterns we've seen during the alkene rollout. If a new reaction's animation looks wrong, check whether one of these applies before debugging the engine.

| Symptom | Cause | Fix |
|---|---|---|
| C=C disappears at end of step 1 | `bond_break` on `c1-c2` instead of order change | Use `bond_order_change` to text `'1'` |
| Atom flies through the C=C bond | Reagent placed too far from substrate | Move reagent start to y=110-130 (above) or y=240-260 (below) |
| Atom enters the alkene zone laterally | Long horizontal translate at substrate's y | Split into two `atom_translate` primitives: drop below first, then cross |
| Final product has the bridge atom floating above C=C | Intermediate-stage atom not translated to product position | Add `atom_translate` at end of last step to move to substituent slot |
| Cyclic ring still in product | Ring-opening bond not broken | Add `bond_break` for the bond that opens (e.g. `c2-br1` in halogenation) |
| Stereo product looks flat | Missing `bond_style_change` to wedge/dash | Add wedge for syn, wedge+dash for anti, in step that forms the new bonds |
| Atom symbols look small | SVG fontSize at default | Use the size table above (atom symbols at 14, not 12) |
| Card text is hard to read | Mix of text-[9px] and text-[10px] | Use text-sm/text-xs/text-[10px] only — match the rest of the app |
