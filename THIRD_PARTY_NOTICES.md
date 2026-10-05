# Authors, sources and licenses

Mime | N0_.q3 (957164619061932045) maintains these Snow ports. Original author credits are retained in every manifest and runtime definition. Original contributors retain their rights; a Snow port is not an endorsement by Discord, Equicord, Vencord or upstream authors.

The repository’s root MIT license covers original Mime code. Per-plugin LICENSE files/manifests apply to the corresponding packages; GPL-derived ports remain GPL. Metadata credit on independently written ports also records the original feature author.

| Plugin | Credited authors |
| --- | --- |
| DebugConsole | Mime | N0_.q3 (957164619061932045) |
| Decor | Fiery (890228870559698955), Mime | N0_.q3 (957164619061932045) |
| GifRoulette | Mime | N0_.q3 (957164619061932045) |
| HighlightCode | mafu (519760564755365888), Mime | N0_.q3 (957164619061932045) |
| MoreCommands | Mime | N0_.q3 (957164619061932045) |
| NitroSniper | neoarz (218675193592283137), Mime | N0_.q3 (957164619061932045) |
| PreviewFile | mafu (519760564755365888), Mime | N0_.q3 (957164619061932045) |


| TestPlugin | Mime | N0_.q3 (957164619061932045) |

| BlurNSFW | Vendicated (343383572805058560), Mime | N0_.q3 (957164619061932045) |
| NSFWGateBypass | eternal (263689920210534400), Mime | N0_.q3 (957164619061932045) |
| VolumeBooster | Nuckyz (235834946571337729), sadan (521819891141967883), Mime | N0_.q3 (957164619061932045) |
| ValidUser | Vendicated (343383572805058560), Dolfies (852892297661906993), Mime | N0_.q3 (957164619061932045) |
| OpenInApp | Vendicated (343383572805058560), Chloe (1084592643784331324), Mime | N0_.q3 (957164619061932045) |
| PauseInvitesForever | Dolfies (852892297661906993), amia (142007603549962240), Mime | N0_.q3 (957164619061932045) |
| GlobalBadges | domi.btnr (354191516979429376), Mime | N0_.q3 (957164619061932045) |
| OnePingPerDM | ProffDea (609329952180928513), Mime | N0_.q3 (957164619061932045) |

## Upstream references

- [Equicord plugins](https://github.com/Equicord/Equicord/tree/3b617d4f02be78808dfbfc1b192e1fd20fe5db00/src/plugins): Decor, BlurNSFW, VolumeBooster, ValidUser, OpenInApp, PauseInvitesForever and OnePingPerDM. Copyright Vencord/Equicord contributors; GPL-3.0-or-later.
- [neoarz/NitroSniper](https://github.com/neoarz/NitroSniper/tree/4877e9e73565e0f157df96e8b6c8735e9647b226): MIT, original notice in NitroSniper/LICENSE.
- [Decor mobile reference](https://github.com/decor-discord/vendetta-plugin/tree/4aa195a5f32cecd97afcfad40a525b50e429ef1f): Fiery and contributors; preserved existing mobile rendering lineage, API and RN multipart file shape.
- [NSFWGateBypass](https://github.com/marioparaschiv/enmity-addons/tree/3ac819ba570dd70dba715b288d91bef2e0ed12d3/Plugins/NSFWGateBypass): eternal. The new Snow implementation independently checks the two local gate functions; upstream source was inspected for behavior and attribution, not copied wholesale. No upstream license file was identified in that repository snapshot.
- [HighlightCode](https://github.com/m4fn3/HighlightCode): mafu; existing Snow port lineage and GPL license.
- PreviewFile: mafu, retained from the existing repository attribution; this release independently implements the file card/viewer behavior.
- [GlobalBadges](https://github.com/domi-btnr/Enmity-Stuff/tree/main/GlobalBadges): HypedDomi / domi.btnr; Snow port fetches EquiBadges and ObaWorkshop BadgeVault.

## Bundled image libraries

Decor bundles **jpeg-js 0.4.4** (BSD-3-Clause, Eugene Ware and contributors) and **pako 1.0.11** (MIT and Zlib, nodeca/zlib contributors). Full licenses are in [licenses/jpeg-js.txt](licenses/jpeg-js.txt) and [licenses/pako.txt](licenses/pako.txt). The PNG chunk writer is original Mime code. **upng-js 2.1.0** is a development-only decoder/APNG test-fixture dependency, not the production encoder. React and React Native are obtained from Snow at runtime; development React packages are only used for tests.

## New mobile ports

- NightyTab: Mime, rico, Vendicated and contributors; GPL-3.0-or-later. Source: https://github.com/aboveproof/Equicord-Nighty-Tab. See NightyTab/LICENSE.
- PinDms: Vendicated, Aria and contributors; GPL-3.0-or-later. Source: https://github.com/Equicord/Equicord/tree/main/src/plugins/pinDms. See PinDms/LICENSE.
- src/settings-section.js and src/action-sheet.js adapt Rain core settings and viewraw integration, copyright Rain contributors, MPL-2.0. Source: https://codeberg.org/raincord/rain. MPL notice and source form retained; license in licenses/MPL-2.0.txt.
