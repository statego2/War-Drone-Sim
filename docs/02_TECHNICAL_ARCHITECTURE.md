# Technical Architecture — War Drone Sim
Version 1.0 · status **candidate architecture**; definitive engine selection requires ADR-001.

## 1. Architectural drivers
- Portrait-first 3D on commodity phones; predictable performance and render scale.
- Independent input, motion, camera, encounter, visual and UI modules for fast iteration.
- Offline single player, deterministic testable game-loop logic where practical.
- Minimal custom framework; choose idiomatic engine composition.
- Avoid simulating actual drone hardware / tracking systems; flight is arcade, entirely fictional.
- Asset replacement without rewriting code; license hygiene and GitHub public repo safety.

## 2. Candidate stack comparison
| Criterion | Unity 6 LTS + URP | Godot 4.x Compatibility / Mobile | Unreal Engine mobile |
|---|---|---|---|
| Fast mobile 3D content assembly | Strong ecosystem, C#, editor tooling | Lightweight/open, GDScript/C# options | Powerful but heavy |
| 3D stylized forest on phone | URP + LOD/instancing/profiler | achievable with Compatibility/Mobile limits | device/binary/material complexity |
| Portrait touch | Input System + custom gestures | Input events/custom controls | Blueprint/C++ UMG |
| iOS/Android builds | Standard, signing needed | Standard, signing needed | Standard, toolchain heavy |
| Play by URL | Unity Web browser support exists, **must test** actual iPhone Safari & project performance | Compatibility WebGL 2; **mobile caveats** | HTML5 not standard UE delivery |
| Free templates/assets | largest Unity third-party supply | growing CC0 Godot-agnostic packs | Fab with conversion cost |
| Decision | **Recommended hypothesis** | Serious fallback if tiny Web build dominates | Not recommended for initial MVP |

**ADR-001 rule:** 2-day capped spike: one sample scene with foliage + single moving target + touch steer + build on owner's iPhone. Score (i) install friction, (ii) 3D visual quality, (iii) mean/p95 frame time, (iv) input stability, (v) ability to share. If Unity fails a hard constraint, assess Godot (and a lightweight custom Three.js/web option if link-play is a hard requirement) before commitment.

## 3. Package/module layout (Unity candidate)
```
Assets/
  _Game/
    Art/                 # own meshes, materials, textures, VFX, icons
    Audio/               # original/licensed game audio
    Prefabs/             # Drone, Vehicle, Trees, CameraRig, UI
    Scenes/              # Boot, Greybox, ForestSlice, QA_Performance
    ScriptableObjects/   # FlightTuning, EncounterConfig, QualityTiers
    Scripts/
      Core/              # GameStateMachine, RunContext, bootstrap
      Input/             # IFlightInput, TouchDragInput, VirtualStickInput
      Flight/            # DroneMotor, DroneCollision, FlightBounds
      Camera/            # DroneCameraRig, CameraOcclusion
      World/             # ForestChunk, SpawnLayout, RoadRoute, TrafficMover
      Target/            # VehicleTarget, TargetVisibility, ContactOutcome
      Scoring/           # RunScore, LocalBestStore
      UI/                # GameplayHUD, Tutorial, ResultView, SafeArea
      Presentation/      # ImpactVFX, ImpactAudio, Haptics, Pool
      Config/            # QualityPresetProvider, GameSettings
      Infrastructure/    # Clock, RandomProvider, scene boot/loading
    Tests/               # EditMode, PlayMode; QA scene build
  ThirdParty/            # vendor asset, isolated, license checked
  Settings/
Packages/                # manifest.json + lock pinned
ProjectSettings/
docs/
tools/                   # CI scripts; offline license report
```
Add `.gitignore` for Library, Temp, Obj, Builds, Logs, UserSettings and signed artifacts; keep ProjectSettings, Packages, own Assets. Do not store license entitlements or paid raw packs in public repo.

## 4. Interfaces and state contracts
```csharp
// Illustrative API contracts; NOT implemented code.
public readonly struct FlightIntent {
    public readonly Vector2 Steer;     // normalized [-1, 1], x=yaw, y=climb
    public readonly float Thrust;      // 0..1 game-defined
    public readonly bool Boost;
}
public interface IFlightInput {
    FlightIntent ReadIntent();
    void SetEnabled(bool enabled);
}
public interface IFlightMotor {
    Vector3 Position { get; }
    Vector3 Velocity { get; }
    void Simulate(FlightIntent intent, float fixedDeltaSeconds);
    void ResetTo(FlightSpawn spawn);
}
public interface IRunScore {
    int Score { get; }
    void Record(GameEvent gameEvent);
    void Reset();
}
public interface IEncounterFactory {
    Encounter Spawn(in EncounterConfig config, int seed);
    void Despawn(in Encounter encounter);
}
```
Unity-specific entry points can adapt these contracts. Avoid `Update()` reading `Input.touches` directly inside motor; input sampling and physics ticks must be deliberately synchronized.

## 5. Update/physics loop
```text
Touch frames (Update / Input System)
  → GestureAdapter → FlightIntent (clamped, normalized, timestamped)
  → Motor tick (FixedUpdate) → Rigidbody.MovePosition/velocity handling
  → Trigger/contact filtering → domain game event (deduplicated)
  → GameStateMachine (PLAYING→IMPACT→RESULT→RESTART)
  → CameraRig (LateUpdate + damping)
  → Presentation channel (VFX, audio, haptics, HUD)
  → ScoreStore (local best only on committed result)
```
- Use Unity physics continuous collision detection where appropriate; measure overhead. Use simplified collider volumes and speed/step validation to reduce missed contact.
- One **ContactResolver** deduplicates repeated collider callbacks by `runId + targetId + resultState` / target consumed flag.
- State transitions are idempotent and tested. Pause suspends simulation/audio, resume clears stale intents.
- Pooled effects reset lifetime on use. Avoid instantiated particle bursts in high frequency paths.

## 6. State machine
```
BOOT → HOME → READY → PLAYING
                      ├→ CONTACT_SUCCESS → RESULT → READY
                      ├→ CONTACT_FAILURE → RESULT → READY
                      ├→ RUN_TIMEOUT     → RESULT → READY
                      └→ PAUSED → PLAYING
```
Rules: only PLAYING accepts hit/miss events; contact resolution writes one result; retry resets clock, camera, score, vehicle position, input filter, audio and pooled effects. No stale event handlers after unloading scenes. Restart ≤3 s goal.

## 7. Drone motor design — game-specific, NOT physical-world drone control
- Translate input to desired yaw/pitch and approximate motion with tunable smoothing/accel/drag; do not calculate propeller aerodynamics or real thrust-to-weight.
- `MoveTowards`/bounded accel caps, screen-facing bank purely visual. Max tilt clamp prevents disorientation.
- Explicit self-righting/recoverable boundaries so skillful steering stays fun.
- Drift parameter controls mastery. All flight tuning in ScriptableObject profiles: `Beginner`, `Balanced`, `Expert`.
- Physics owns collision outcomes. Animation/camera reads sim state, must not overwrite motor transform during collision.

## 8. World and rendering
**Prototype:** flat test landscape, primitive tree cylinders, simple road spline, capsule vehicle. Avoid forest tool dependency until first fun proof.

**Production:** tile/chunk vegetation around a compact handcrafted flight corridor; LODGroup with near/mid/far, GPU instancing only where material/shader supports; combined material palettes; low overdraw leaves; shadow distance under budget; baked lighting/light probes as feasible. Physics collider only for solid tree trunks and gameplay props; decorative foliage no collision. Vehicles move along simple normalized sampled path/spline, speed curve, animation interpolation. No network, navmesh AI or fleet logic.

**Quality tier design:** `low` 30 fps target / reduced render scale, vegetation density, distance, shadows and particles; `medium` adaptive 30–60; `high` 60 aspiration with profiling. Never sacrifice object silhouettes.

## 9. Performance budget *provisional*
- 60fps: 16.67 ms total; 30fps: 33.33 ms total; aim margin at least 20% in normal workloads on named target phone.
- Measure p50/p95/p99 frame time, GPU and CPU contributors, thermal throttling, memory, build size, load time.
- Default aim: around 10–15 material families, no expensive transparency spam, minimal realtime shadow casters, no massive terrain. **No invented poly-count guarantee.** Capture real measurements before setting asset-specific numeric caps.
- Avoid per-frame `GetComponent`, expensive broad scans, LINQ allocations in hot paths, per-object `Update` on many trees.
- Performance experiments require test scene with fixed device, same camera path and deterministic seed.

## 10. Data persistence and security
- Preferences: locally stored quality, invert Y, audio, vibration and best score. Version the save schema (`schemaVersion`), validate missing/corrupt values, support reset.
- No cloud, login, analytics, advertising ID, GPS/camera/microphone usage, unnecessary permissions or unnecessary network access.
- Vendor telemetry SDKs evaluated only as opt-in post-MVP decisions.

## 11. Testing seams
- Pure C# EditMode tests for score calculations, state transitions, seeded spawn plans and tuning clamps.
- PlayMode tests for movement bounds, tree/vehicle collider priority, one-shot impact, resets, camera placement.
- Integration smoke on Android/iOS with manual phone scenarios.
- CI cannot substitute for Xcode signing/device test; log which tests are actually run.

## 12. Nonfunctional and observability
- Logging levels `Error`, `Warning`, `Info` (disabled in shipping hotpath); no player identifiers.
- QA performance overlay only development builds; frame-time CSV export only on explicit tester action.
- Crash evidence from debug devices with minimal fields; no surveillance.
- Version project/art assets and build scripts; reproducible dependency versions.

## 13. Exact technical decisions TBD
Unity minor version and compatible packages; build pipeline signing, shader variant stripping; browser viability; test device list; asset delivery; static batching vs instancing per pack; concrete art renderer. Record each decision in docs/09 with benchmarks before frozen.
