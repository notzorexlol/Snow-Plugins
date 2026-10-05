# Snow authoring-guide audit

Target: supplied Snow Plugin Authoring Guide, September 8, 2026 snapshot, Snow commit `5b5d1e12fb3bc67931934bb063a43b2d8f20cea1`. Compatibility profile `bunny-spec3-kettu-2026-08-27`; Discord iOS 343.0 build 109809, React Native 0.86.0, Hermes 98. The plain and TSX starters were also inspected. This is a source/contract review with test doubles; a running Snow client was unavailable.

## Shared contracts

- All 20 packages expose the spec-3 manifest and bundled `plugin.default` definition, use lexical `bunny`, and obtain React/React Native from the host. All bundles fit the 1 MiB limit.
- `registerCommand` receives a fresh definition and owns IDs, defaults, insertion and automatic sending of returned `{ content }`. No manual built-in command-list patches or second send helper remain.
- Storage defaults are cloned, missing root keys are migrated without replacing saved values, and settings subscribe through `B.plugin.useProxy`. Explicit successful-save UI waits for flush completion.
- Modern native Button and TextInput props remain separate from compatibility controls. RN.Pressable owns long-press actions. Embedded scrolling views use non-scrollable outer sheets.
- Scoped commands, patches and JSX hooks have teardown; owned sheets, alerts, timers, listeners and requests also have explicit cleanup or late-result guards.
- Discord requests use the discovered client HTTP module. They do not extract the session token to construct an Authorization header. Status and rate-limit information are preserved. Already-dispatched native HTTP calls cannot be cancelled through the documented facade; their late results are ignored after stop.
- Empty `B.api.settings`/`B.ui.settings` namespaces are not treated as registration APIs. Cross-plugin installation/enabling is not exposed, so InstallLinks provides copyable URLs and supported manual steps.

## Package review

Every existing package is patch-bumped because it embeds the changed runtime. Versions are listed in PORTING_REPORT.md.

| Package | Review/change | Remaining live dependency |
| --- | --- | --- |
| DebugConsole | Runtime lifecycle, redaction, formatting and package smoke checks | Native log sources |
| Decor | Storage subscription, native inputs/buttons, abortable UI timers/upload deadlines, existing HTTP client for OAuth | Decor service, native file picker and avatar rendering |
| GifRoulette | Exactly one loader-sent result; empty favorites feedback once | Favorite GIF store |
| HighlightCode | Owned settings subscription and lifecycle | Native code block component matches |
| MoreCommands | Loader-managed results, cancelled countdown waits, distinct `/more-gifroulette` name | Native command UI |
| NitroSniper | Request client preserves rate limits; webhook save awaits flush; mocked queue/stop checks | Live gift service and optional user-configured webhook |
| PreviewFile | Existing disabled state retained and stale test corrected | Remains unavailable, not re-enabled |
| TestPlugin | Spec-3 lifecycle, commands, alert teardown | Diagnostic checks must be run in Snow |
| BlurNSFW | Shared contracts and startup/settings/stop checks | Native media component discovery |
| NSFWGateBypass | Shared contracts and startup/settings/stop checks | Private local gate functions |
| VolumeBooster | Shared contracts and startup/settings/stop checks | Native voice implementation |
| ValidUser | Existing HTTP client; cancellable queued waits | Native mention rendering and user store |
| OpenInApp | Shared contracts, URL host validation and lifecycle | Device-installed apps and URL handlers |
| PauseInvitesForever | Registrar behavior, request client, explicit action confirmation tests | Server permissions and current incident API |
| InstallLinks | Removes guessed installer/enabler APIs; copyable URLs/manual install; URL regex restoration | Native link rendering/tap hooks |
| TokenUtils | Existing feature retained, scoped alert cleanup tested | Its explicit token-copy action is user-triggered; no real account used in tests |
| GlobalBadges | Shared contracts and startup/settings/stop checks | Upstream badge feeds and native profile rows |
| IconThemer | Only 331 catalog JSX hooks; removes generic hooks and React.createElement patch | Actual hook coverage and image rendering |
| NightyTab | Rain settings route, isolated WebView, toggle/prefix/attachment-gated reply action, native message accessors | WebView availability/login, native back gestures and message sheet shape |
| PinDms | Per-account category data, saved editor retry, touch UI, Rain settings, guarded native list adapter | Actual Discord inbox layout and scrolling behavior |

## Source-backed private integrations

Rain's settings core demonstrates `SETTING_RENDERER_CONFIG`, `createList`, navigation screen registration and native settings rows. Each plugin owns its scoped list patch; shared route/config state persists until the last participating plugin stops. Rain's View Raw demonstrates the lazy `MessageLongPressActionSheet` flow. Each opening retains its own message, and class/memo component forms that cannot be safely wrapped are left alone.

Rain's server drawer and row patches provide evidence for channel navigation, private-channel stores and `MessagesItemChannelContent`. They do not establish every current Discord inbox list shape. PinDms adapts complete, recognized FlatList/FlashList DM blocks, translating refs/layout/viewability callbacks while preserving native row renderers and surrounding auxiliary rows. Partial/search, horizontal, inverted, multi-column and sticky-index layouts are declined. Its own Pinned DMs page remains available. This is not a claim of universal primary-list placement.

The guide cannot validate all private Metro modules used by the pre-existing plugins. No unsupported public namespace was added to compensate. Device checks and explicit mobile differences are recorded in PORTING_REPORT.md. Desktop keyboard navigation, Electron cookie/header interception and a token-capture bridge are not implemented as mobile features.

## Verification

`npm run build` and `npm test`: 50 tests pass. Coverage includes all production bundle start/settings/stop paths, manifest limits, registrar mutation, storage isolation/migration, subscriptions, request-client credential isolation, rate limits, timer cancellation, settings coexistence/unload order, Nighty menu identity and gating, per-account PinDms operations and compatible native list rendering. Network operations are mocked. No real messages, gift redemptions, uploads, server changes, account reads or clipboard token actions were performed.

The 1.0.1 follow-up is documented in MOBILE_UI_UPDATE.md.
