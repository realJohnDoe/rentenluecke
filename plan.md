# Implementation plan

The app is being built in four pull requests. **PR 1 (scaffold, finance core,
chart) is done.** This file specifies PR 2–4 in enough detail to implement them
without further design decisions.

Read this file together with the conventions below before starting a PR. When you
finish a PR, tick its checklist here and commit that change with the work.

---

## Conventions that apply to every PR

**Language.** All code, identifiers, comments, commit messages and the JSON/YAML
plan format are **English**. Only the rendered UI is **German**. Every German
string lives in `src/i18n/de.ts` and is reached as `de.someKey`. Never inline
German text in a component; add a key instead.

**Money convention.** Every amount a user enters is a *nominal euro amount as of
today* — the figure on their Renteninformation or Depotauszug. The projection
grows it with the explicit rates on the entry; the `real` value mode deflates the
result by `inflationRate`. The single exception is `targetMonthlyIncome`, which is
always in today's purchasing power. Rates are fractions, not percents: `0.05` is
5 % p.a. The UI shows percents and converts on the edge.

**What is a Plan and what is not.** `Plan` in `src/model/types.ts` is exactly what
gets exported, imported and autosaved. `Scenario` (`'stop' | 'continue'`) and
`ValueMode` (`'real' | 'nominal'`) are **view options**: React state only, never
written to the plan, the export file or localStorage.

**Charts.** Colours come from the validated palette in `src/theme.ts` via
`seriesColor(index)` and are assigned in fixed order across pensions and assets
together (`buildSeries` in `src/model/chartRows.ts`), so an entry keeps one
identity in both panels even when others are disabled. Never introduce a new
colour; never cycle slots. Never add a second y-axis to a panel.

**Definition of done for every PR.** `npm run typecheck`, `npm test` and
`npm run build` all pass, and you have looked at the running page (`npm run dev`)
at desktop *and* ~390px width, in light and dark mode, before opening the PR.

---

## What already exists (PR 1)

| File | Contents |
|---|---|
| `src/model/types.ts` | `Plan`, `Pension`, `Asset`, `Scenario`, `ValueMode`, `ProjectionPoint`, `ProjectionSummary`, `Projection` |
| `src/model/finance.ts` | `monthlyRate`, `annuityPayment`, `resolveTimeline`, `project(plan, scenario, valueMode)` — pure, no React |
| `src/model/finance.test.ts` | 26 tests: annuity figures, accumulation, depletion to zero, pensions, inflation, the gap, degenerate timelines |
| `src/model/defaultPlan.ts` | `defaultPlan` — the illustrative starting plan |
| `src/model/chartRows.ts` | `toChartRows(projection)`, `buildSeries(plan)`, the `assetValueKey` / `withdrawalKey` / `pensionKey` helpers |
| `src/components/Charts.tsx` | Both chart panels, synced via `syncId`, shared age axis, hatched gap area, custom legend and tooltip |
| `src/components/Summary.tsx` | The four key figures |
| `src/theme.ts`, `src/format.ts`, `src/i18n/de.ts` | Palette slots, German number formatting, all German strings |
| `src/App.tsx` | Composes the above from `defaultPlan` with `SCENARIO` / `VALUE_MODE` as module constants |
| `.github/workflows/deploy.yml` | typecheck + test + build on every push and PR; deploys `main` to GitHub Pages |

Reuse these. In particular do not write a second projection routine, a second
currency formatter, or a second colour list.

---

## PR 2 — Inputs

Make the plan editable. Nothing about the maths or the charts changes.

### Tasks

- [ ] **`src/state/planReducer.ts`** — a `useReducer` reducer over `Plan` with
  immutable updates. Actions: `setField` (the scalar plan fields), `addPension`,
  `updatePension`, `removePension`, `addAsset`, `updateAsset`, `removeAsset`,
  `replacePlan` (needed by PR 4's import). Generate ids with
  `crypto.randomUUID()`. Keep the reducer pure and unit-test it.
- [ ] **`src/components/NumberField.tsx`** — one reusable labelled control used by
  everything else: `label`, `value`, `onChange`, and optional `min`, `max`,
  `step`, `suffix` (`€`, `%`, `Jahre`), `hint`, and `slider` (renders a range
  input bound to the same value beneath the number input). Two rules that matter:
  keep the raw string in local state while the field has focus so a half-typed
  value like `"1,"` does not get clobbered, and accept both `.` and `,` as the
  decimal separator.
- [ ] **`src/components/PlanForm.tsx`** — `currentAge`, `retirementAge`, `endAge`
  (sliders, whole years), `targetMonthlyIncome` (€), `inflationRate` (%). Percent
  fields show `2` and store `0.02`.
- [ ] **`src/components/PensionList.tsx`** and **`src/components/AssetList.tsx`** —
  a card per entry with its fields, an enable checkbox, a name input, a remove
  button, and an "add" button below the list. Show the entry's colour swatch
  (`seriesColor` through `buildSeries`) on the card so the link to the chart is
  obvious. Empty state: one line of text plus the add button.
- [ ] **`src/App.tsx`** — hold the plan in the reducer, pass `state` and `dispatch`
  down, keep the projection in a `useMemo` keyed on the plan. Two-column layout on
  `lg:` (inputs left, charts right), stacked below.

### Notes

- `resolveTimeline` already clamps ages that are out of order, so the inputs do
  not need to police each other — but do set sensible `min`/`max` (age 0–100,
  inflation −5 % to 15 %, returns −10 % to 15 %).
- Add German strings for every new label to `src/i18n/de.ts`.
- `buildSeries` hands out colour slots by position in `plan.pensions` /
  `plan.assets`; removing an entry therefore recolours the ones after it. That is
  acceptable. Do **not** try to fix it by sorting or by hashing ids.
- More than eight entries reuse colour slots (`SERIES_SLOT_COUNT`). If you want to
  handle that, fold the overflow into a single "Weitere" band rather than
  inventing hues — but it is fine to leave it.

---

## PR 3 — Scenarios, views, comparison

Make the two view options switchable and show the other scenario as a ghost.

### Tasks

- [ ] **`src/components/Toolbar.tsx`** — two segmented controls: scenario
  (`de.scenarioStop` / `de.scenarioContinue`) and value mode (`de.valueModeReal` /
  `de.valueModeNominal`). Plain buttons with an `aria-pressed` state. Both live in
  `App.tsx` as `useState`, **not** in the plan.
- [ ] **Ghost series.** `App.tsx` computes a second projection for the *inactive*
  scenario and passes its totals into `Charts`. In `toChartRows`, accept an
  optional second projection and write `ghostAssetValue` and `ghostIncome` onto
  each row. In each panel render one extra `<Line>` — `strokeDasharray="5 4"`,
  `strokeWidth={1.5}`, `stroke={chartInk.secondary}`, `dot={false}` — for the
  inactive scenario's total. Add it to the legend, labelled with the inactive
  scenario's name. No fills, no stacking: it is an outline of the total only.
- [ ] **Target line in nominal mode.** No code change is needed — `project`
  already grows the target with inflation in nominal mode. Add the German label
  `Kaufkrafterhalt` to the legend when `valueMode === 'nominal'` so the rising
  line is explained.
- [ ] **Extend `Summary.tsx`** to show, next to each key figure, the same figure
  for the inactive scenario as a smaller muted line (e.g. "beitragsfrei: 1.240 €"),
  so the cost of stopping is visible without toggling.
- [ ] Tests: assert that `project(plan, 'stop', …)` and `project(plan, 'continue', …)`
  differ exactly by the contributions, and that the two value modes coincide when
  `inflationRate` is 0. (`finance.test.ts` already covers most of this — extend,
  don't duplicate.)

### Notes

- Memoise both projections separately; do not recompute either on a toggle that
  does not affect it.
- Two projections mean two passes over ~600 points. That is nothing; do not add
  caching machinery.

---

## PR 4 — Persistence and polish

### Tasks

- [ ] `npm install zod yaml` (runtime dependencies).
- [ ] **`src/model/schema.ts`** — a zod schema mirroring `Plan`, with `version`
  literal `1`. Export `parsePlan(input: unknown): { ok: true; plan: Plan } | { ok:
  false; error: string }` where `error` is a **German** message assembled from the
  zod issues (path + what was expected). Leave a clearly marked spot for future
  version migrations: switch on `version` before validating.
- [ ] **`src/model/io.ts`** —
  `serialisePlan(plan, format: 'json' | 'yaml'): string`,
  `deserialisePlan(text: string): ReturnType<typeof parsePlan>` (try JSON first,
  fall back to YAML; a YAML parse error becomes a German message too),
  `downloadPlan(plan, format)` (Blob + object URL + synthetic `<a>` click,
  filename `rentenplan-<ISO date>.json|yaml`), and `readPlanFile(file: File)`.
  Keep DOM access in `downloadPlan`/`readPlanFile` only, so the rest is testable.
- [ ] **Export/import UI** in `Toolbar.tsx`: two export buttons (JSON, YAML), one
  import button opening a hidden `<input type="file" accept=".json,.yaml,.yml">`,
  and an inline error region (`role="alert"`) for a failed import. On success,
  `dispatch({ type: 'replacePlan', plan })`.
- [ ] **localStorage autosave.** Key `rentenluecke:plan:v1`. Load once on mount
  through `parsePlan` (a corrupt or outdated value is silently ignored and
  `defaultPlan` is used); save on every plan change, debounced ~300 ms. Wrap both
  reads and writes in try/catch — storage can throw in private windows. Persist
  the plan only, never the view options.
- [ ] **Tests** in `src/model/io.test.ts`: a JSON round trip and a YAML round trip
  both return a plan deep-equal to the original; a plan with an unknown extra key
  still parses; a missing required field yields `ok: false` with a German message;
  malformed YAML yields `ok: false` rather than throwing; the serialised output
  contains no `scenario` or `valueMode` key.
- [ ] **Polish.** A short `hint` under each input explaining what to enter and in
  which euros (see the money convention). The no-taxes note from `de.disclaimer`
  stays in the footer. Check the ~390px layout: inputs full width, charts still
  legible, no horizontal scroll. Update `README.md` with a screenshot, the live
  URL and a one-paragraph description of the model.

### Notes

- YAML is the nicer format for hand-editing a saved plan; make it the first export
  button.
- Do not add a schema-versioning framework. One `version` field and one `switch`
  is the whole design.

---

## Ideas deliberately left out

Not in scope for PR 2–4. Do not add them without being asked.

- Taxes, Kranken-/Pflegeversicherung, Rentenbesteuerung.
- Couples / two people in one plan.
- Monte-Carlo or sequence-of-returns risk; the model is deterministic on purpose.
- A backend, accounts, or sharing by URL.
- Charting anything per calendar year instead of per age.
