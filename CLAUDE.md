# Instructions for Claude

- Use pnpm, never npm or yarn (`packageManager` in `package.json` pins the
  version).
- Before pushing, run the checks CI runs: `pnpm install --frozen-lockfile`,
  `pnpm run format:check`, `pnpm run typecheck`, `pnpm test`, `pnpm run build`.

## Workshop

This repo is dispatched by the workshop. Before creating, labelling or
ordering an issue, or opening a PR, follow the workshop plugin's
`conventions` skill. It also covers when to open a PR and adding trace maps
to it.
