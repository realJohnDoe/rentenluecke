# Instructions for Claude

- Use pnpm, never npm or yarn (`packageManager` in `package.json` pins the
  version).
- Before pushing, run the checks CI runs: `pnpm install --frozen-lockfile`,
  `pnpm run format:check`, `pnpm run typecheck`, `pnpm test`, `pnpm run build`.

## Conventions

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

## Gotchas

These are deliberate; don't "fix" them.

**The TypeScript config is strict.** `tsconfig.app.json` sets
`noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `erasableSyntaxOnly`,
`noUnusedLocals` and `noUnusedParameters` on top of `strict`. In practice:

- `rows[i]` has type `T | undefined`. Destructure, use `?? fallback`, or a helper
  that throws — `finance.test.ts` has `at(points, index)` for exactly this.
- Types must be imported with `import type { Plan } from './types'`. A plain
  `import` of a type fails the build.
- No `enum`, no `namespace`, no constructor parameter properties. Use a union of
  string literals, as `Scenario` and `ValueMode` do.
- An unused parameter is an error; prefix it `_` if you genuinely need it.

**Do not loosen these flags to make an error go away.** Fix the code.

**Recharts tooltips.** Recharts types the `content` callback loosely, so
`Charts.tsx` casts the props (`asTooltipProps`) and looks the row up in `rows` by
age, instead of reading `payload`. It is deliberate: it avoids fighting the
library's generics and keeps the tooltip in control of its own formatting. Keep
that shape when you add series.

**Recharts `dataKey`s are strings, not functions.** The row objects are flattened
ahead of time by `toChartRows`, with keys built by `assetValueKey(id)` and
friends. Add new series the same way.

**Tailwind v4 has no config file.** It is wired through `@tailwindcss/vite` in
`vite.config.ts`, and `src/index.css` is just `@import 'tailwindcss'` plus the
CSS custom properties for the palette. Do not add `tailwind.config.js`.

**`vite.config.ts` keys `base` on `mode`, not `command`.** With `command`,
`vite preview` serves at `/` while the built HTML points at `/rentenluecke/` and
the page comes up blank. Leave it alone.

**Vitest only picks up `src/**/*.test.ts`** (see `test.include`). A `.test.tsx`
file will not run.

## Seeing the page

`pnpm run dev` serves at `http://localhost:5173/`. `pnpm run preview` serves the
production build at `http://localhost:4173/rentenluecke/` — note the subpath.

With a browser, drive it with Playwright at 1100px and ~390px width, light and dark (`colorScheme: 'dark'`); in a sandbox pass `executablePath: '/opt/pw-browsers/chromium'`. Listen for `pageerror`: a React crash renders as a blank page.

## Workshop

This repo is dispatched by the workshop. Before creating, labelling or
ordering an issue, or opening a PR, follow the workshop plugin's
`conventions` skill. It also covers when to open a PR and adding trace maps
to it.
