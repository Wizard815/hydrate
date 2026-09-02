# Exception request: Function constructor in ViewLoader

**Plugin:** Hydrate (`hydrate`)
**Rule:** `obsidianmd/rule-custom-message` → `no-new-func`
**Location:** one call site, `src/ViewLoader.ts`, in `ViewLoader.compileAndEvaluate()`

## What the code does

Hydrate lets users write their own React views as `.jsx` files inside their
vault, under `hydrate-chats/views`. A user can attach one to a note via the
`hydrate-plugin` frontmatter key, and the plugin renders that note with their
component instead of the default editor.

To do that, the plugin transforms the user's JSX with Sucrase and evaluates
the result:

```ts
const moduleFunction = new Function(
  "exports", "require", "React", result.code
) as ViewModuleFactory;
moduleFunction(exports, require, React);
```

## Why we cannot avoid it

Executing user-authored source at runtime requires an eval-equivalent. There
is no JavaScript API that runs arbitrary code without one, so this rule and
this feature are mutually exclusive. We are not able to fix it; we can only
remove the feature.

## Scope and safety

- **One call site.** The whole plugin contains exactly one `new Function`.
- **Local vault content only.** The code comes from a `.jsx` file in the
  user's own vault. Nothing is fetched from the network and nothing is
  executed that the user did not put there themselves.
- **No self-update.** This is not a mechanism for the plugin to update itself
  or its dependencies. The Developer policies' prohibition on self-updating
  is not engaged.
- **Narrow module surface.** The injected `require` resolves exactly two
  names, `react` and `obsidian`, and throws on anything else.
- **Opt-in.** A user only reaches this path by authoring a view file and
  referencing it from a note's frontmatter.

## Everything else passes

The rest of the plugin is clean under `eslint-plugin-obsidianmd@0.4.2`
`configs.recommended`: 0 errors and 0 obsidianmd warnings. We reduced this
area from 3 errors to 1 by properly typing the factory (which removed
`no-unsafe-call` legitimately) and suppressing only `no-implied-eval`, the
one rule your config permits suppressing. The remaining error is deliberate
and is the subject of this request.

## What we are asking

That this single call site be accepted, so Hydrate stays listed in the
community directory. If it cannot be, please tell us — we will remove the
custom-views feature from the shipped build before 2026-10-30 rather than
be delisted.
