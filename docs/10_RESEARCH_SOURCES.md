# Evidence & Research Sources — War Drone Sim

Baseline assessed **2026-10-08**. The owner requested prior deep research on a portrait forest drone game, templates, assets and cost. **The final external research report itself was not present in the connected GitHub repo or in the content available to this planning pass**; therefore we do not claim to have reviewed its unpublished findings or assign prices to unknown products. This source map collects direct documentation and supplier pages independently checked for the charter. Reconcile any later full research report as a documented amendment, not a silent source substitution.

## Engine / mobile delivery / performance
- Unity **mobile Web browser compatibility** (mobile iOS Safari and Android Chrome are addressed; support is not a promise of project-specific fps): https://docs.unity.com/en-us/engine/6000.0/manual/platform-specific/webgl/intro/browsercompatibility
- Unity **URP performance and profiling** (identify render scale, overdraw, GPU bandwidth, lighting): https://docs.unity.com/en-us/engine/6000.7/manual/analysis/graphics-performance-profiling/in-urp
- Unity **Cinemachine** free package reference, actual installed version TBD: https://docs.unity.cn/Packages/com.unity.cinemachine%406.6/manual/InstallationAndUpgrade.html
- Unity **Input System On-Screen Controls** (basic stick/button input, custom design required): https://docs.unity.cn/Packages/com.unity.inputsystem%401.3/manual/OnScreen.html
- Godot 4.x **web export caveats** (Compatibility/WebGL2 renderer; mobile limitations): https://docs.godotengine.org/en/4.5/tutorials/export/exporting_for_web.html
- Godot **renderers compared**: https://docs.godotengine.org/en/stable/tutorials/rendering/renderers.html
- Godot **device requirements**: https://docs.godotengine.org/en/stable/about/system_requirements.html

## Asset creators / license primary statements
- **Quaternius Ultimate Nature Pack**, 150 stylized 3D nature objects, publisher labels CC0: https://quaternius.com/packs/ultimatenature.html
- **Quaternius Ultimate Stylized Nature**, publisher labels CC0: https://quaternius.com/packs/ultimatestylizednature.html
- **Kenney Car Kit**, 40+ vehicles / formats, publisher labels CC0: https://kenney-assets.itch.io/car-kit
- **Unity Free Low Poly Nature Forest** product page: https://marketplace.unity.com/packages/3d/environments/landscapes/free-low-poly-nature-forest-205742
- **Unity Lowpoly Style Forest Environment** optional vendor pack: https://assetstore.unity.com/packages/3d/environments/landscapes/lowpoly-style-forest-environment-98307
- **Unity Asset Store EULA FAQ** (embedded redistribution, standard/non-standard restrictions, SDK restrictions): https://assetstore.unity.com/browse/eula-faq
- **Unity Asset Store legal terms**: https://unity.com/legal/as-terms
- **Creative Commons CC0 deed**: https://creativecommons.org/publicdomain/zero/1.0/

## Evidence tiers
- **Primary verified webpage:** the official vendor/tool author states feature/license. Not equal to checked zip/source or device performance.
- **Requires integration test:** engine/URP compatibility, asset price at checkout, polygon/texture/LOD counts, real FPS.
- **Requires owner/toolchain confirmation:** device identity, Xcode signing, project budget and how they want to access game.
- **Unknown:** exact availability of a complete ready-made portrait drone/forest game; a package suggestion alone cannot count as "ready".

## Source audit tasks
| Question | Decision gate | Responsible task |
|---|---|---|
| Unity Web works acceptably on actual iPhone Safari? | G0 | T-001, T-002 |
| CC0 packs import coherently and profile on phone? | G0/G2 | T-007, T-020, T-025 |
| Asset Store EULA/metadata safe for public repo and game? | G2/G4 | T-052, T-042 |
| Unity / Godot plugin pinned versions and toolchain support? | G0 | T-001, T-003 |
| Is an affordable complete template truly compatible and worthwhile? | G1/G2 | T-020 |
| Do control schemes feel fun? | G1 | T-006, T-018 |

## Research intake: if external report becomes available
Attach a summary/findings (not proprietary unlicensed files) to `docs/research/` and add for each candidate: exact URL; date checked; version; vendor; price currency/tax status; license proof; import proof; benchmark; alternative; responsible task; action decision. Changes to budget/engine must be explicit ADR/change request.
