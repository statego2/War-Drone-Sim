# Privacy, Optional Telemetry, Security and Data Strategy

## MVP default
**No telemetry, no analytics SDK, no backend, no ads, no cloud save, no accounts, no third-party crash uploader.** A game should work offline without requesting location, camera, microphone, contacts, background Bluetooth or drone hardware access.

## On-device save schema (proposed)
```json
{
  "schemaVersion": 1,
  "bestScore": 0,
  "settings": {
    "masterVolume": 0.8,
    "musicVolume": 0.5,
    "haptics": true,
    "reducedMotion": false,
    "invertY": false,
    "leftHanded": false,
    "qualityPreference": "auto"
  }
}
```
Local data belongs to the app sandbox and is resettable. No personal names, exact GPS, device identifier, advertising identifier, or gameplay event upload. Use schema validation and safe defaults. Do not silently transfer records when cloud features are added.

## Development-only event instrumentation (not transmitted)
An in-memory debug ring-buffer and local log files can record software events **for test sessions** without identifying a person. Candidate events:
- `run_started` (`seed`, `scenarioId`, monotonic elapsed offset)
- `flight_control_scheme` (`drag` or `stick`)
- `fictional_vehicle_contact` (`success`, score)
- `obstacle_contact`
- `retry_tapped` (elapsed delay)
- `performance_sample` (CPU/GPU frame time, quality tier)
- `settings_changed` (optional general setting only)

**These event names are testing abstractions, not a gameplay targeting system.** Data remain local unless the tester knowingly exports anonymized logs. Never enable background upload by accident.

## If telemetry is ever requested
Create separate ADR with necessity, legal basis/consent review, minimum collected fields, data processor/vendor, regions, retention/deletion, SDK permissions, store disclosures, opt-out, test coverage and explicit owner sign-off. Do not integrate an SDK just because it is free or commonly used.

## Secrets / account hygiene
- Signing credentials / Apple certificates / keystores / store API keys never committed.
- Build secrets limited to protected environment. CI PRs from forks never access production signing.
- Version-control only sanitized example configuration; scan diffs for tokens and purchased asset files.
- Use least-privilege runner permissions and reviewed marketplace actions.
- No live-service endpoint in MVP, lowering privacy/operating burden.

## Store declarations
Recheck iOS App Privacy, Google Play Data Safety, SDK privacy manifests and evolving policy **at publication**, not from static planning notes. Actual binaries, runtime SDKs and collected data determine disclosure, not ideal product intent.

## Testing
- Airplane-mode app launch and full session.
- Verify iOS/Android permission prompts absent unless technically necessary for platform operation.
- QA test no outbound traffic from gameplay code or transitive SDKs (where instrumentation available).
- Reset best score/settings and malformed schema behavior.
- Review imported plugin dependencies for background network modules.
