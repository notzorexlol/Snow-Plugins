# Tests

`npm test` runs `native.test.cjs` and `IconThemer/test.mjs`, covering Bunny spec-3 packaging, lifecycle, authoring-guide command/storage/control contracts and credential-free request-client dispatch, Rain-style settings and lazy message sheets, Nighty reply gating, WebView isolation and Pin DMs account/category/list behavior. All network operations in these suites are mocks; no real messages, gifts, uploads or server updates occur.

These tests use SDK-shaped doubles. They cannot establish compatibility with Snow's private loader or every mobile Discord list layout. See `PORTING_REPORT.md` for device checks.

The other `.test.cjs` files and `helpers.cjs` are retained as historical tests for the frozen Bunny 1.x `index.ts` artifacts. They are not the current native release checks.
