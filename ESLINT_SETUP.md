# ESLint setup

This repo lints against the official Obsidian rules used by the community
directory's automated review.

- Package: `eslint-plugin-obsidianmd` (pinned exactly — the config shape has
  changed between minor versions before).
- Config: `eslint.config.mjs` spreads `obsidianmd.configs.recommended`, which is
  a **flat-config array**, at the top level. Do not spread it into a `rules`
  object — that silently disables every Obsidian rule.
- Type-aware rules need `parserOptions.projectService`, which is set in the
  final block of the config.

## Commands

- `npm run lint` — report
- `npm run lint:fix` — apply auto-fixes

## Rules you cannot disable

`eslint-comments/no-restricted-disable` blocks `eslint-disable` for
`obsidianmd/*`, `no-console`, `no-restricted-globals`,
`@typescript-eslint/no-restricted-imports`, `no-alert`,
`@typescript-eslint/no-deprecated`, `@typescript-eslint/no-explicit-any`,
`@microsoft/sdl/no-document-write`, `no-eval`, `@microsoft/sdl/no-inner-html`,
and `obsidianmd/no-nodejs-modules`. Fix the code instead.

Any disable that survives must carry a description:
`// eslint-disable-next-line some-rule -- why this is necessary`

## Results depend on the installed `obsidian` version

`obsidian` is declared as `"latest"`, so `npm install` and `npm ci` can resolve
different typings. Two rules read those typings and their counts move with it:

- `@typescript-eslint/no-deprecated` — fires only on `@deprecated` tags present
  in the installed `obsidian.d.ts`.
- `obsidianmd/no-unsupported-api` — resolves API symbols through them.

At `obsidian@1.12.3` (the current lockfile pin) `setWarning` is not deprecated
and `getSettingDefinitions` does not exist; both arrive in 1.13.0 and will add
warnings when the floating spec picks it up.

**Always run `npm ci`, not `npm install`, before comparing lint counts.**
