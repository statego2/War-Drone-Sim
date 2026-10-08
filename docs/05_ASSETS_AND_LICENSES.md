# Asset Procurement & Integration Plan — War Drone Sim

**Rule:** no purchases or import of unknown-license assets before G1. The registry below separates **primary-source verified** items from options requiring actual compatibility/performance evaluation. The engine/editor/project aren't installed in this repository yet.

## Buy vs build: decision matrix
| Layer | Default decision | Why | Validation required |
|---|---|---|---|
| Arcade drone motor | **Build** small custom controller | Unique game feel; full FPV controller overcomplicates | Phone input feel / physics |
| Input UI | Unity Input System primitives + **custom layout** | OnScreenStick/Button are supported foundations | Gesture latency & safe area |
| Camera | Unity Cinemachine **plus custom occlusion rules** | Good blend system; game-specific portrait framing | No clipping or nausea |
| Forest props | **Reuse CC0** stylized environment models | Expedites attractive world, editable | Material/LOD/physics integration |
| Roads and routes | **Build** 1 short handcrafted route; optionally use meshes | Readable cinematography > expensive world generators | Visual gaps and performance |
| Vehicle meshes | **Reuse CC0** pack for early art | Cheap, readable, no licensing uncertainty | Silhouette on small screen |
| Vehicle movement | **Build** basic scripted waypoint/spline motion | Minimal predictable target logic | One-shot reset, no pathfinding |
| Drone model | Prototype primitive → later coherent stylized model | Controller and camera dictate presentation | Scale and silhouette |
| Explosion/contact VFX | **Build** poolable stylized impact using engine VFX | Contact is game signature | Rate/battery/no stalls |
| Audio | Own synthesis/recorded sound or appropriately licensed packs | Avoid confusing/disjointed packs | License, quality, no clipping |
| UI graphics/fonts | Unity UI + own design, open-licensed font as needed | Product identity not stock asset flip | License + legibility |
| Traffic, level, progression "complete template" | **Don't purchase pre-G1** | Templates rarely align with portrait touch + forest loop | Source proof, vendor maintenance and demo |

## Verified candidate register (validated only at public product-page level)
| Candidate | Layer | Cost signal | License / provenance | Decision | URL |
|---|---|---|---|---|---|
| Quaternius **Ultimate Nature Pack** | 150 general nature models, FBX/OBJ/Blend | Free offering | **CC0**, publisher states it explicitly | **A / prototype**; material consolidation and collision still needed | https://quaternius.com/packs/ultimatenature.html |
| Quaternius **Ultimate Stylized Nature Pack** | 60+ models, FBX/OBJ/glTF/Blend | Free offering | **CC0**, publisher states it explicitly | **A / test visual style**; actual draw calls unknown | https://quaternius.com/packs/ultimatestylizednature.html |
| Kenney **Car Kit** | 40+ cars, trucks, vans; OBJ/FBX/glTF | "Name your own price" storefront | **CC0**, publisher states it explicitly | **A / prototype + maybe shipping** | https://kenney-assets.itch.io/car-kit |
| Unity **Free Low Poly Nature Forest** | 34 sample assets | Free (product title) | Unity Asset Store EULA; check package's asset-specific terms | **B / compare to CC0 forest** | https://marketplace.unity.com/packages/3d/environments/landscapes/free-low-poly-nature-forest-205742 |
| Unity **Lowpoly Style Forest Environment** | Mature larger stylized forest demo | **Price not verified**; must check at purchase | Standard or nonstandard Asset Store EULA must be checked | **C / optional post-G1** | https://assetstore.unity.com/packages/3d/environments/landscapes/lowpoly-style-forest-environment-98307 |
| Unity **Cinemachine** | camera tools via Package Manager | Free package, per Unity docs | Unity package terms; check pinned version | **A / prototype** | https://docs.unity.cn/Packages/com.unity.cinemachine%406.6/manual/InstallationAndUpgrade.html |
| Unity **Input System** | touch/virtual onscreen input | Engine package | Package licensing, version compatibility must be pinned | **A / prototype** | https://docs.unity.cn/Packages/com.unity.inputsystem%401.3/manual/OnScreen.html |

**Not verified:** complete War Drone Sim clone/template with tested iOS portrait physics & forest; exact marketplace price at checkout; Unity 6 editor minor compatibility of all third-party packs; mobile performance of any candidate. None should be represented as ready to import and ship.

## Screening checklist for any purchased complete project
1. Does the package include **full editable source**, Unity package / version requirements, reproducible build and permission to ship commercially?
2. Does its drone use arcade-friendly movement (not realism-first controls with required multi-axis RC)?
3. Does it support **portrait on a real touch device** and camera path without substantial rework?
4. Are tree/road/vehicle assets from the same legally redistributable provenance? Beware demo content excluded from commercial use.
5. Can we extract useful pieces without coupling to its entire game architecture or its Unity version?
6. Was it maintained/released recently? Is it demonstrably compatible with pinned URP version?
7. Does a 10-minute sample scene meet frame time, memory and bundle-size budgets on phone?
8. Is it actually cheaper than a simple custom motor, or an **asset flip risk**?
9. Are there runtime-required SDK binaries, telemetry, ad IDs or unsupported native plugins?
10. Do we control original gameplay, branding, authored scenes and reusable art?

## License compliance policy
- **CC0:** publisher/source proof and downloaded file version archived in private procurement records. CC0 permits commercial use; still verify trademarks for real-world likeness.
- **Unity Asset Store:** assets normally licensed under standard EULA unless marked restricted/nonstandard; only embed within original Licensed Product, don't publish raw packs as standalone/extractable files. Some SDK assets have extra runtime restrictions.
- **Fonts/audio:** check license per asset; avoid confusing royalty-free with CC0; catalog required credit texts.
- **GitHub source:** a public GitHub repository alone is **not a license**. Absence of license means do not copy source. If open source, confirm license compatibility, required notices and source redistribution.
- **Private credentials/licensed packages:** never commit purchase receipts, invoice details, paid raw 3D models, or store secrets to public GitHub. `Assets/ThirdParty` still must be filtered before public commits.
- A build pipeline that depends on private licensed packages needs a documented private provisioning step, not leaking vendor files into CI public artifacts.

## Integration workflow
1. Register URL, publisher, version, asset identity/hash, license proof, date checked, engine/rp compatibility, price/currency.
2. Download free eligible model into scratch sandbox, not production branch.
3. Benchmark sample with Unity URP and iPhone/Android; inspect triangles/material count, alpha overdraw, GPU instancing and import meshes.
4. Compare against primitives / CC0 first.
5. If passing and coherent, create `Art/ThirdPartyReferences.md` and manifest with attribution; import isolated assets.
6. Refactor materials and collision shapes, optimize LOD, prepare legal snapshot for release.

## Procurement decisions by spend envelope — illustrative, not price quotes
| Ceiling | Suggested allocation |
|---|---|
| €0 | Quaternius/Kenney CC0 + built-in packages, authored controls/VFX |
| €100–300 | Optionally 1 optimized forest pack and 1 quality audio/VFX pack if they beat free alternatives on phone |
| €500–1500 | Outsource/co-commission original cohesive assets, UI/audio polish and device QA; never buy indiscriminately |

**Recommendation:** use the €0 path until G1 and performance benchmark. Spending is a gate, not a prerequisite.
