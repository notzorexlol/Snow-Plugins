# Snow Plugins

Past plugins and new ports for **Snow**, a third-party mobile Discord client. Maintained by **Mime | N0_.q3** with credit to every original author.

These releases use **Bunny spec 3**. Install from the `manifest.json` URL, then enable the plugin. If you already have an older copy installed, remove it first so commands are not duplicated.

## Plugins

| Plugin | Current release | What it does | Install |
| --- | --- | --- | --- |
| [DebugConsole](DebugConsole/) | 2.2.1 | Live logs with clear/copy/search. Ignores Discord intl locale spam. | [Install](https://raw.githubusercontent.com/xMimiez/Snow-Plugins/main/DebugConsole/manifest.json) |
| [Decor](Decor/) | 2.2.5 | Browse and equip Decor avatar decorations. | [Install](https://raw.githubusercontent.com/xMimiez/Snow-Plugins/main/Decor/manifest.json) |
| [GifRoulette](GifRoulette/) | 2.2.1 | `/gifroulette` sends one random favorite GIF. | [Install](https://raw.githubusercontent.com/xMimiez/Snow-Plugins/main/GifRoulette/manifest.json) |
| [HighlightCode](HighlightCode/) | 2.2.1 | Highlight supported native chat code blocks. | [Install](https://raw.githubusercontent.com/xMimiez/Snow-Plugins/main/HighlightCode/manifest.json) |
| [MoreCommands](MoreCommands/) | 2.2.1 | Fun and utility slash commands, including `/more-gifroulette`. | [Install](https://raw.githubusercontent.com/xMimiez/Snow-Plugins/main/MoreCommands/manifest.json) |
| [NitroSniper](NitroSniper/) | 2.2.2 | Process new gift links with a queue and visible results. | [Install](https://raw.githubusercontent.com/xMimiez/Snow-Plugins/main/NitroSniper/manifest.json) |
| [PreviewFile](PreviewFile/) | 2.2.9 | Unavailable until Snow is open source. | — |
| [TestPlugin](TestPlugin/) | 2.2.1 | Compatibility checks. | [Install](https://raw.githubusercontent.com/xMimiez/Snow-Plugins/main/TestPlugin/manifest.json) |
| [BlurNSFW](BlurNSFW/) | 1.2.1 | Spoiler/cover NSFW media on mobile. | [Install](https://raw.githubusercontent.com/xMimiez/Snow-Plugins/main/BlurNSFW/manifest.json) |
| [NSFWGateBypass](NSFWGateBypass/) | 1.2.1 | Bypass supported local guild NSFW gates. | [Install](https://raw.githubusercontent.com/xMimiez/Snow-Plugins/main/NSFWGateBypass/manifest.json) |
| [VolumeBooster](VolumeBooster/) | 1.2.2 | Optional voice output boost without patching Discord sliders. | [Install](https://raw.githubusercontent.com/xMimiez/Snow-Plugins/main/VolumeBooster/manifest.json) |
| [ValidUser](ValidUser/) | 1.2.1 | Auto-resolve unknown mentions and replace @Unknown User. | [Install](https://raw.githubusercontent.com/xMimiez/Snow-Plugins/main/ValidUser/manifest.json) |
| [OpenInApp](OpenInApp/) | 1.2.4 | Open Steam, Telegram, Instagram, TikTok and other apps. | [Install](https://raw.githubusercontent.com/xMimiez/Snow-Plugins/main/OpenInApp/manifest.json) |
| [PauseInvitesForever](PauseInvitesForever/) | 1.2.4 | `/pauseinvites` and `/resumeinvites` with separate confirmations. | [Install](https://raw.githubusercontent.com/xMimiez/Snow-Plugins/main/PauseInvitesForever/manifest.json) |
| [InstallLinks](InstallLinks/) | 1.0.7 | `snow://` install-plugin links. Copies manifest URLs with manual installation steps. | [Install](https://raw.githubusercontent.com/xMimiez/Snow-Plugins/main/InstallLinks/manifest.json) |
| [TokenUtils](TokenUtils/) | 1.0.2 | `/get-token` copy alert and `/token-info` username, display name, email, number. | [Install](https://raw.githubusercontent.com/xMimiez/Snow-Plugins/main/TokenUtils/manifest.json) |
| [GlobalBadges](GlobalBadges/) | 1.1.1 | Profile badges from EquiBadges and ObaWorkshop BadgeVault. | [Install](https://raw.githubusercontent.com/xMimiez/Snow-Plugins/main/GlobalBadges/manifest.json) |
| [NightyTab](NightyTab/) | 1.0.0 | Nighty in mobile settings, with optional Download Script replies. | [Install](https://raw.githubusercontent.com/xMimiez/Snow-Plugins/main/NightyTab/manifest.json) |
| [PinDms](PinDms/) | 1.0.0 | Per-account DM categories, colors, ordering and collapsible sections for mobile. | [Install](https://raw.githubusercontent.com/xMimiez/Snow-Plugins/main/PinDms/manifest.json) |
| [IconThemer](IconThemer/) | 1.0.2 | Icon packs and per-icon colors. | [Install](https://raw.githubusercontent.com/xMimiez/Snow-Plugins/main/IconThemer/manifest.json) |

## Snow install links

InstallLinks sends a `snow://` install-plugin URL, not a GitHub hyperlink:

```text
snow://snow?id=-1&command=install-plugin&params=https://raw.githubusercontent.com/xMimiez/Snow-Plugins/main/Decor/manifest.json
```

`/snowlink url:` posts that string. Taps on `snow://` open a sheet with the manifest URL, copy buttons, and Snow Settings → Plugins → Install from URL instructions. The documented compatibility API does not expose installation or enabling of other plugins.

## Development

Edit `src/` then run `npm ci` and `npm run build`. The build emits Bunny spec-3 `manifest.json` + `index.js`.

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for original authors, sources and licenses.

See [SDK_AUDIT.md](SDK_AUDIT.md) for the authoring-guide review.

See [PORTING_REPORT.md](PORTING_REPORT.md) for SDK checks, mobile differences and the device test checklist.
