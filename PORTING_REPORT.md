# Snow mobile plugin changes

## Status

Implementation starts from the existing xMimiez/Snow-Plugins repository, not a replacement project. All 20 packages were reviewed against the supplied Snow Plugin Authoring Guide (September 8, 2026 snapshot) and plain/TSX starters, then rebuilt as Bunny spec 3. See SDK_AUDIT.md for the contract checks. Tests use mocked host APIs, not a running Snow client. Full on-device feature parity remains unverified, particularly WebView and primary DM-list behavior.

Source and generated bundles are prepared on branch `mime/snow-mobile-ports` for review. Publication status is recorded in the associated pull request and delivery report. A complete ZIP and a patch against the original base are also supplied. The user-supplied repository token is used only for GitHub access, held in process memory, and excluded from repository files and deliverables. Stored Git credentials, browser cookies, personal account data, and local machine identity are not used.

## Changes

### NightyTab 1.0.1

- Adds a Nighty settings section. Adapts Rain's section/row contract and its `SETTING_RENDERER_CONFIG` + `createList` integration, with a registered native navigation route and owned-sheet fallback. The documented Snow settings namespaces are empty; no public registration method is invented. It does not import Rain's private core module from an external plugin.
- Replaces desktop sidebar/server-list tab buttons with the settings entry and a mobile WebView. Preserves configurable HTTP/HTTPS URL, loading indicator, error handling and blue/grayscale/custom icon choices. The 1.0.1 page removes its title, navigation header, Reload and Close buttons; use native back/swipe navigation or sheet dismissal. Icons fit an 18-point image inside a 24-point slot.
- Adapts View Raw's `MessageLongPressActionSheet` opening to add Download Script. Visibility requires Script Utils enabled, a nonblank one-character Nighty prefix, and an attachment on the selected message.
- Clicking the action sends `<prefix>dls` as a reply to that exact message through Discord's existing HTTP client. Mention parsing and reply pings are disabled. No direct attachment download is performed: the original feature delegates that work to Nighty through the reply command.
- Prevents overlapping sends for the same message. Menu wrappers retain each opening's message, recheck current settings and become inactive after disable.
- Does not port Electron CSP/header/cookie rewriting or the desktop login-token capture bridge. A top-level native WebView replaces the iframe; login persistence depends on Snow's bundled WebView. Shared cookies are disabled and no token bridge is injected. This is a deliberate platform difference, not verified equivalent login behavior.
- Desktop hover popovers and tab-placement controls are replaced by the mobile long-press menu and settings entry.

### PinDms 1.0.1

- Per-account categories with names, colors (20 preset swatches plus custom hex), create/edit/delete, category ordering and collapse state.
- Pin/unpin DMs and group DMs, move channels between categories, custom up/down ordering, and most-recent-message ordering.
- Optional collapsing of uncategorized DMs. A selected pinned DM stays visible in a collapsed category. Empty category headers remain available; missing channels are hidden without deleting saved IDs.
- A Pinned DMs settings page provides the full category manager and navigable list, with unread/mention indicators. Hold categories or rows for touch actions.
- Adds Pin DMs to compatible lazy channel sheets and adds a long-press wrapper to Rain's known `MessagesItemChannelContent` component.
- Adapts compatible FlatList/FlashList datasets containing private-channel IDs, records, channel wrappers or channelId entries into category headers and original native rows. Keeps auxiliary rows before/after the DM block, translates imperative scroll targets, layout callbacks and viewability events, and preserves host data and rendering.
- Unknown dataset shapes, partial/search lists, horizontal/multi-column/inverted lists and sticky-index contracts are left untouched. Therefore categories at the top of Snow's primary DM list are **not guaranteed on every build**. The settings-page list remains available if native list matching fails. Settings show whether a list has matched.
- Desktop CSS, pixel scroll-offset patches, right-click menus and Alt/Alt+Shift keyboard navigation are not ported. They rely on Equicord's desktop list implementation; the mobile equivalent uses touch controls and native scrolling. External-keyboard parity is not implemented.

### Shared runtime and existing plugins

- Keeps lexical `bunny`, host React/React Native, `definePlugin`, scoped plugin storage, SettingsComponent and spec-3 manifest packaging from the supplied starter contract.
- Clones nested defaults, fills missing keys without overwriting saved values, subscribes to owned storage with useProxy, and waits for explicit saves before reporting success.
- Lets Snow handle content returned by command callbacks as the starters specify, removing the runtime's extra direct-send attempt. The command registrar owns generated IDs and insertion; custom command-list patching is removed. MoreCommands uses `/more-gifroulette` so it can coexist with the standalone `/gifroulette`.
- Tracks alerts opened through the shared API and dismisses them on shutdown, fixing the observed TokenUtils cleanup failure and covering TestPlugin/InstallLinks alerts.
- Removes duplicate empty-favorites feedback in GifRoulette (also bundled by MoreCommands).
- Preserves PreviewFile's pre-existing disabled state and updates its stale test accordingly.
- Includes the separately built IconThemer in root build/test commands. Removes six generic icon hooks and its broad React.createElement patch, retaining the 331 guide-listed named icon hooks.
- Uses the existing Discord HTTP client for shared requests and Decor authorization without extracting the Discord token; preserves rate-limit status and retry delays. TokenUtils retains its explicitly requested copy-token feature from the existing repository; it was tested with doubles only.
- Cancels owned waits/timers, aborts pending work on stop, guards late effects, uses modern Button/TextInput contracts, and uses RN.Pressable for long-press actions.
- InstallLinks copies manifest URLs and provides manual installation instructions; unsupported cross-plugin installer/enabler calls are removed.
- Bumps every existing package because each bundles the changed runtime. Regenerates all bundles and manifests; adds upstream licensing and source attribution.

## Versions

| Plugin | Previous | Updated |
| --- | --- | --- |
| DebugConsole | 2.2.0 | 2.2.1 |
| Decor | 2.2.4 | 2.2.5 |
| GifRoulette | 2.2.0 | 2.2.1 |
| HighlightCode | 2.2.0 | 2.2.1 |
| MoreCommands | 2.2.0 | 2.2.1 |
| NitroSniper | 2.2.1 | 2.2.2 |
| PreviewFile | 2.2.8 | 2.2.9 |
| TestPlugin | 2.2.0 | 2.2.1 |
| BlurNSFW | 1.2.0 | 1.2.1 |
| NSFWGateBypass | 1.2.0 | 1.2.1 |
| VolumeBooster | 1.2.1 | 1.2.2 |
| ValidUser | 1.2.0 | 1.2.1 |
| OpenInApp | 1.2.3 | 1.2.4 |
| PauseInvitesForever | 1.2.3 | 1.2.4 |
| InstallLinks | 1.0.6 | 1.0.7 |
| TokenUtils | 1.0.1 | 1.0.2 |
| GlobalBadges | 1.1.0 | 1.1.1 |
| IconThemer | 1.0.1 | 1.0.2 |
| NightyTab | New | 1.0.1 |
| PinDms | New | 1.0.1 |

## Verification

`npm run build` builds the 19 registry plugins plus IconThemer. Every generated package is below the 1 MiB bundle limit. `npm test` runs 50 passing tests, covering manifests, lifecycle, guide command registration/returns, storage migration, subscriptions, request-client credential isolation, cancelled waits, alerts, settings section coexistence/unload order, per-opening message identity, download gating/non-pinging replies, WebView isolation, per-account category operations and supported native list transforms, plus the existing plugin and IconThemer suites. Network calls in tests are mocked.

Initial tests had three failures: duplicate GIF feedback, an obsolete PreviewFile command expectation and TokenUtils alert cleanup. The expanded repository-wide run also found a missing interval API in the test sandbox and IconThemer's outdated hook count; both test fixtures are corrected.

Before publishing and treating these as device-validated releases, checks still needed:

1. Install the rebuilt packages in Snow. Open settings; confirm both new sections appear and existing sections remain intact. Disable/re-enable each new plugin in both orders and check for duplicate entries.
2. Configure Nighty. Verify page loading, login persistence, error handling, native back navigation and custom icons on the target iOS/Android build.
3. Hold two different attachment messages. Confirm each download action replies to the correct message once without pinging. Disable Script Utils, clear the prefix, enter a multi-character prefix and hold messages without attachments; the action should be absent in every case.
4. Create, rename, recolor, reorder, collapse and delete categories; pin/unpin/reorder DMs and group DMs. Switch accounts, restart Snow, and verify isolation/persistence.
5. Check native list matching, touch menus, unread badges, selection, scroll position and large-list performance on the target Discord build. If the native list does not match, the Pinned DMs page works as the fallback; full primary-list parity remains outstanding.
6. Disable each plugin with a page/menu/request open and confirm hooks, owned sheets and alerts are cleaned up. Run the existing TestPlugin diagnostics locally on the intended test account.

## Source snapshots

- Snow Plugins base: `ae8a9e9f7d1ca336d885ac2abe13e4a0248ba8bb`.
- [Rain core settings and View Raw](https://codeberg.org/raincord/rain): `4b091e1698aa983c5f4e694ae243c9a6fd8b52fb` (MPL-2.0).
- [Nighty Tab reference](https://github.com/aboveproof/Equicord-Nighty-Tab): `71c2e8aa4814598c4d2d0739b3d80209ec8dfb1b` (GPL-3.0-or-later).
- [Equicord PinDMs](https://github.com/Equicord/Equicord/tree/main/src/plugins/pinDms): `1489c0e2a4435d854d7343a5cfb0abb894772318` (GPL-3.0-or-later).

The supplied guide targets Snow commit `5b5d1e12fb3bc67931934bb063a43b2d8f20cea1`, Discord iOS 343.0 build 109809, React Native 0.86.0, Hermes 98, and profile `bunny-spec3-kettu-2026-08-27`. Private Metro discovery remains compatibility-dependent across existing plugins and the new ports. Passing contract tests does not certify live private components or Android parity.

See MOBILE_UI_UPDATE.md for the 1.0.1 native-menu and list adapter details.
