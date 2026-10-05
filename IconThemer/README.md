# icon themer

By **Mime | N0_.q3**. A standalone Snow/Bunny spec-3 plugin.

Install this manifest in Snow:

https://raw.githubusercontent.com/xMimiez/Snow-plugins/main/IconThemer/manifest.json

## Features

- Five mobile icon families: Plumpy, Iconsax, Solar, Solar Duotone, Solar Broken. Duplicate repository copies and image density variants are merged; missing assets are supplemented from the other repository.
- Pack previews, searchable individual icon colors, and an optional default hex color. Alpha hex colors are accepted. The current SDK defines the 331 supported named vector icons. Existing saved legacy mappings remain available.
- A **custom icons** toggle at the top opens a warning. Custom editing appears above presets only after pressing the red **i know what i'm doing** button. Disabling custom icons preserves the saved links.
- Direct HTTPS PNG/WebP/JPEG links are validated with native image decoding and dimensions before saving. SVG and GitHub file-page links are rejected.
- Per-icon colors override the default color; custom images override presets. Preset artwork overrides theme image replacements, and explicit colors override incoming theme colors on intercepted icons. Blank color with a preset retains the pack's artwork colors. Original/theme mode with blank colors leaves theme rendering alone.
- Failed image URLs fall back to the pre-existing rendered icon. Retry failed images from settings. No theme files, accounts, other plugins, or their storage are changed.

The catalog is bundled and image URLs are pinned to repository commits. Pack discovery does not depend on GitHub API availability at runtime. Images require network access on first use; subsequent caching is managed by React Native. Source hosts receive ordinary image requests.

## Compatibility

Version 1.0.2 uses only the guide's 331 named JSX hooks. It removes six generic hooks and the broad React.createElement patch, and includes shared storage, command and cleanup fixes.

This review targets the September 8, 2026 Snow Plugin Authoring Guide, Discord iOS 343.0 build 109809 / React Native 0.86.0. Current source uses `B.api.react.jsx.onJsxCreate` for 331 named vector icons. It does not patch React.createElement, React Native Image, or Image.render. Actual icon coverage and rendering still require device verification.

Pack replacement images are created through documented `RN.Image` elements. Color-only overrides clone the existing icon with its documented color/style props. Existing theme color props are overridden at the intercepted element. Missing/failed pack files retain the original icon. The stored legacy settings remain intact.

The guide does not guarantee that every Discord icon render path uses its JSX hooks. Settings show observed hook matches: zero matches after reopening screens means the actual target component names or creation path need device inspection. Legacy bitmap assets and icons outside the documented hooks are not replaced. Custom mapping edits require a name from this SDK's catalog.

The 1.0.0 crash log exactly matches its released bundle SHA256 and points to the old image-wrapper component. Version 1.0.1 removes that render-patching path. This is a code correction with local contract tests, not a claim that an on-device crash reproduction or verification succeeded. Update in Snow and reopen Discord to discard old cached components.

See [SDK-REVIEW.md](SDK-REVIEW.md) for the checked API contracts and remaining device checks.

## Development

From the repository root, install its existing locked development dependencies with `npm ci`, then run:

```sh
node IconThemer/build.mjs
node --test IconThemer/test.mjs
```

This separate build writes only `IconThemer/index.js`. It does not change the shared registry or rebuild any existing plugin. Source imports the existing runtime without modifying it. Build output remains below Snow's 1 MiB bundle limit.

`src/catalog.json` records the complete selected PNG paths, source URLs and pinned commits for each mobile pack. The Vencord desktop SVG adaptations and font directories are not native mobile icon packs and are not included.

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for upstream attribution and artwork licensing.
