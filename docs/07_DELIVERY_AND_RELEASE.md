# Build, Collaboration, CI/CD, Platform Delivery & Publishing

## Basic truth about delivery
An iPhone cannot play a native Unity project by visiting a GitHub repo. A **Unity Web build** may run in iOS Safari when browser, memory and graphics requirements are met, but that must be tested before promising a Rocket-Panic-style tap-a-link URL. **Native iOS** involves Xcode/signing/test device distribution; **native Android** involves Gradle/Android tooling and APK/AAB. GitHub Pages can host static compatible web build files **after** validated export, not native builds.

### Channels
| Channel | Pros | Costs / blockers | G0 proof |
|---|---|---|---|
| Unity iOS native | full intended phone GPU API/control/perf | Mac/Xcode Apple code signing, device/installation, TestFlight external distribution rules | actual app on owner phone |
| Unity Android native | fast on-device APK iteration, full graphics | SDK/JDK/Gradle, Android test phone, distribution | debug APK installed |
| Unity Web via Pages | URL, no install and closer to Rocket Panic workflow | WebGL/browser memory, Safari instability, input/perf and downloadable size, static hosting constraints | actual URL opened on iPhone Safari with playable 3D scene |
| Godot web Compatibility | smaller engine projects potentially, URL friendly | renderer WebGL2 restrictions, mobile Safari and 3D limits | identical phone on same scene |
| Hybrid WebView | possible native distribution of web content | combines web renderer limits and native signing | not default route |

## Git branching / ownership model
- Protected `main` eventually via repo settings/branch rules owner-admin if allowed.
- Short-lived `feat/T-010-motor`, `fix/T-014-contact-dedup`, `docs/T-001-engine-adr`.
- PR description includes issue ID, scope, evidence with commands/device info, screenshot/video and known omissions.
- Squash merge recommended when stable; no force pushes to shared main.
- No signed binaries, large paid art packs or secrets in public repo. Build output artifacts via Actions with retention control when supported.
- Unity YAML text serialization + visible metas. Preserve GUIDs; avoid simultaneous scene/prefab edits when multiple agents.

## Expected initial repo additions after G0
```text
.gitignore
.gitattributes
.github/workflows/validate.yml
Assets/_Game/Scenes/Boot.unity
Assets/_Game/Scripts/...
Assets/_Game/Tests/...
Packages/manifest.json
Packages/packages-lock.json
ProjectSettings/ProjectVersion.txt
docs/devices/...
tools/
```
**These paths are expected deliverables, not files known to exist today.**

## CI candidate
- PR: lint formatting (if configured), Unity import + EditMode tests using pinned editor, tests artifact, optional PlayMode.
- Merge: compile targeted build artifacts where licenses and runners permit (GitHub-hosted runner may require Unity license activation setup).
- Manual/release: device validation and signing in appropriately protected secret environment.
- CI configuration must not give unrestricted access to signing certificates, store API keys or purchased packages.
- Do not make passing CI the only proof of frame-rate / input quality. Device checks are explicit gate evidence.
- Dependencies update through dedicated PR with regression tests, not auto-upgrade all packages.

## Reproducibility and provenance
- Record editor version `ProjectVersion.txt`, dependency lock, platform toolchain version, SDKs, plugin versions.
- Semantic release versions `0.0.x` spike, `0.1.x` greybox, `0.2.x` vertical slice, `0.9.x` beta, `1.0.0` only when release accepted.
- Store non-secret build manifest: timestamp UTC, commit SHA, editor version, OS, content changes, device verified, known bugs.
- `Assets/ThirdParty` must have metadata license inventory; source packs stored only when license allows source redistribution.

## Store and release checklists
**Android:** package ID, signing key safe vault (no source control), target SDK requirements recheck at release, app bundle and icon/adaptive icon, store content rating, data safety disclosures based on actual app, privacy policy if required, internal testing proof, screenshots.

**iOS:** bundle ID, supported device/OS and portrait mask, provisioning, Xcode version/SDK, privacy usage descriptions, entitlement audit, TestFlight test, App Store privacy label and content rating, screenshot/metadata correctness.

**Both:** asset license compliance, accessible controls/sound options, non-graphic fictional impacts, user consent for any optional telemetry, no accidental location/camera/mic permissions, ability to play offline, crash test, app icon rights, trademark clearance.

## Release pipeline gate order
`feature → compile/tests → physical device demo → G1 fun → licensed visual assets → device performance → beta → legal/store checklist → owner approval → submission → post-release watch`.

## Rollback and rescue
- Keep last accepted tag and signed artifact checksum in owner-controlled location.
- Freeze new features when P0/P1 issue discovered, build hotfix from last good release branch.
- Track store review rejections; do not assume submission or approval time.
- Revoke/rotate any exposed credentials; remove secrets from current config and rewrite public history carefully if leaked.

## Handoff for any agent
Every session should update NEXT_ACTION with (1) completion & link, (2) actual tested commands/results, (3) blockers, (4) next unblocked issue, (5) any architecture change requiring ADR. An AI agent never claims an unbuilt game is playable.
