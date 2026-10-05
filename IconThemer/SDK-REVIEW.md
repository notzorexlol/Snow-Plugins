# Snow SDK review — icon themer 1.0.2

Version 1.0.2 removes six generic JSX hooks and the React.createElement compatibility patch. Tests check the 331 documented named registrations and their cleanup.

Reference: the owner-supplied **Snow Plugin Authoring Guide**, API snapshot September 8, 2026, verified against Snow commit `5b5d1e12fb3bc67931934bb063a43b2d8f20cea1`. Targets Discord iOS 343.0 build 109809, React Native 0.86.0, Hermes bytecode 98. The supplied plain/TSX starters were also inspected. This is an authoring guide and starter bundle, not a complete SDK declaration package.

| Area | Contract checked | Result |
| --- | --- | --- |
| Loader/build | Sections 1, 2, 15, 16 | Bunny spec 3; executable IIFE exposing `plugin.default`; lexical `bunny`; `definePlugin`; runtime React only |
| Icon interception | Sections 8, 12.7, 21 | Scoped `B.api.react.jsx.onJsxCreate(name, callback)` and matching `deleteJsxCreate`; 331 names extracted from the supplied catalog |
| Image rendering | Sections 8.1, 8.6 | Render a fresh `RN.Image` with HTTPS source; do not wrap/patch `Image.render` or traverse its internal render tree |
| Asset lookup | Sections 8.4, 17 | `B.assets.findAsset(id)`; no initial Metro scan; asset metadata does not promise image path/dimensions |
| Persistence | Sections 4, 5 | Existing root/default migration retained; `B.plugin.useProxy(store)` subscribes; explicit successful-save messages await `B.plugin.flushStorage()` |
| Warning | Section 9.1 | Scoped `B.ui.openAlert`/`dismissAlert`; `D.AlertModal`, rendered `D.AlertActions`, `D.AlertActionButton` with `variant: destructive` |
| Native controls | Sections 6, 7, 10 | Native RN controls use RN props; no web CSS, DOM, private imports, or modern props on compatibility `C.Button` |
| Cleanup | Sections 4, 12 | Exact hook callbacks removed, pending validation timers cancelled, late save effects guarded, warning dismissed |

## Crash evidence

The reported stack is `TypeError: Object is not a function`, with a plugin frame at `:1:304672`. Its artifact hash is `3ffb6381bbc49b5753a330175edabfa98116020df3a746163e3627e822211953`, an exact match for the released 1.0.0 bundle. That frame identifies its image wrapper. The trace alone does not identify which internal React value became non-callable. Version 1.0.1 removes the entire undocumented Image render interception path rather than asserting a more specific cause without runtime evidence.

## Validation limits

Local tests exercise the published export shape, SDK-shaped JSX registration and cleanup, memo/forwardRef image components, explicit colors, fallback/retry, modal confirmation/cancellation, storage failures, and pending image validation. They are test doubles, not Snow's private loader or a physical device.

The supplied TestPlugin report establishes bundled execution, storage flush, scoped patch cleanup and four available stores. It does not establish JSX match coverage or physical rendering correctness. Those remain device checks: update/reload Snow, reopen settings and a channel, inspect the observed match count, change a pack/color, test the custom warning, and disable the plugin. No guarantee is made for legacy image assets, unrelated third-party patches, or paths that bypass Snow's JSX factory.

The repository-wide release also updates the shared runtime and rebuilds all packages. IconThemer retains existing saved settings and theme data.
