# NightyTab and PinDms 1.0.1

NightyTab renders its icon at 18 × 18 inside a centered 24 × 24 slot with contain scaling, preventing image cropping. The Nighty page has no plugin title, navigation header, Reload button or Close button. Its WebView fills the available page; native back/swipe navigation and sheet dismissal remain the exit paths. Configuration and Download Script behavior are retained.

PinDms brings category creation into the DM interaction itself: hold a native DM row, choose New category, name/color it and save to pin that DM. Existing categories are offered as pin destinations; pinned DMs can be unpinned or moved, and holding a category opens its edit/order/delete controls. The known native channel sheet also gains a Pin DMs action alongside its existing actions, including when the sheet returns an inner component. Group DMs are supported.

The native list adapter now handles FlatList and FlashList, including channel IDs, channel records, channel wrappers and channelId entries. It recognizes a complete contiguous inbox block while preserving auxiliary rows before and after it. Category headers and the original native DM renderers stay in the same list. Host keys, row indices, imperative scroll targets, fixed-layout callbacks, recycling types and visibility callbacks are translated to preserve their original item meanings. Collapsed-channel scroll requests target the category header. Disable restores original data and callbacks; per-account storage remains isolated.

The previous adapter rejected lists with refs and layout/viewability callbacks, and the menu hook could miss the native sheet's inner component. The new tests exercise both cases and the hold → create category → pin flow. All 50 tests pass; all 20 packages build, and only the two changed plugin versions are bumped.

## Compatibility limits

This is an attempt to reproduce the desktop workflow on mobile, not a claim of verified pixel-for-pixel parity. A live Snow/Discord device was unavailable. Actual native component matches, gesture interaction, list scrolling and Nighty back navigation need device testing. Unknown/partial/search datasets, SectionList inboxes, horizontal/multi-column/inverted layouts and sticky-index lists are not transformed. The Pinned DMs page remains available when no supported native inbox matches.

## Reference contracts

- Rain's [permissionviewer channel-sheet patch](https://codeberg.org/raincord/rain/src/commit/4b091e1698aa983c5f4e694ae243c9a6fd8b52fb/src/plugins/permissionviewer/patches/patchChannel.ts) and platformindicators show the nested sheet and wrapped DM-row component shapes.
- Equicord's [PinDMs menus](https://github.com/Equicord/Equicord/blob/1489c0e2a4435d854d7343a5cfb0abb894772318/src/plugins/pinDms/components/contextMenu.tsx) define category creation, pinning and ordering behavior.
- [FlashList usage](https://shopify.github.io/flash-list/docs/usage/) defines its native row renderer, recycling type and layout callbacks. The adapter delegates these with original host records; this documentation does not establish Discord's private inbox data shape.
