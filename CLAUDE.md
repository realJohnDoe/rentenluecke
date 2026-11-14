# Instructions for Claude

- If a task results in pushed commits and there is no open pull request for
  that branch yet, open one, even if not explicitly asked to.
- Use pnpm, never npm or yarn (`packageManager` in `package.json` pins the
  version). Dependabot proposes updates; non-major ones auto-merge once CI passes.
- Before pushing, run the checks CI runs: `pnpm install --frozen-lockfile`,
  `pnpm run format:check`, `pnpm run typecheck`, `pnpm test`, `pnpm run build`.

## Workshop

This repo is dispatched by the workshop. Before creating or labelling an
issue, or opening a PR, follow the `issue-conventions` skill.
