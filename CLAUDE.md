# Instructions for Claude

- If a task results in pushed commits and there is no open pull request for
  that branch yet, open one, even if not explicitly asked to.
- Use pnpm, never npm or yarn (`packageManager` in `package.json` pins the
  version). Dependabot proposes updates; non-major ones auto-merge once CI passes.
