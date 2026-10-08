# Playtesting, Research and Evidence Collection

## Core research questions
1. Can a first-time player understand the objective without explanation in <45s?
2. Which scheme feels better on portrait device: drag or virtual thumbstick?
3. Is the flight itself enjoyable even before hitting the vehicle?
4. Can players predict whether they will hit or miss, including tree contacts?
5. Does the brief impact animation reward effort without interrupting flow?
6. Does screen occlusion, camera roll, or dense foliage cause nausea/frustration?
7. Does the player want an immediate retry without being prompted?

## G0 control comparison protocol
- 5 exploratory test participants when possible, mix casual mobile players and game-experienced.
- Same phone, corridor, target and speed tuning except input mapping.
- Counterbalance A→B and B→A order across participants to reduce training bias.
- Each condition: 2 practice attempts + 3 measured attempts, optionally shorter if fatigued.
- Questions 1–5 self-reports: responsiveness, clarity, comfort, frustration, wanting to play again.
- Observe hand usage and frequent thumb occlusion. No hidden analytics.
- Acceptance: choose scheme by observation, not merely "more votes"; note outliers and reduced-motion needs.

## G1 5-person first-play study
No pre-game instruction beyond “Try the game.” Test alone first; facilitator may ask questions only after play. Capture:
```
Tester ID (random anonymous): 
Device, scene seed and build:
First action chosen:
Time to identify control:
Time to identify goal:
First valid impact attempt count:
Unexpected result / occlusion / motion discomfort:
Number of self-initiated retries:
Stopped because:
1-5 enjoyment + ease questions:
Own words: "Would you play again and why?":
Issue references / next action:
```
Do not record identity, phone number, voice/video or biometric data without explicit informed consent and a legitimate need. Anonymous note-taking preferred.

## Funnel definitions (human observation, not production telemetry)
- `Start`: first touch on FLY.
- `Flight`: player achieves deliberate directional change.
- `Recognition`: points out intended game vehicle without a hint.
- `Contact`: obstacle or vehicle collision produces outcome.
- `Comprehension`: can explain why result happened.
- `Retry`: personally chooses another attempt within 3s of result screen, not facilitated.
- `Session done`: ends testing naturally.

## G2 evaluation
- Phone outdoor light/readability test for vehicle/road vs dense foliage.
- Contrast only + minimalist highlight test; avoid permanent clutter.
- 2 named aspect-ratio classes, audio muted and default audio, tilt/off-axis phone use.
- Motion sensitivity: compare camera bank reduced, shake disabled, FOV controls.
- Functional session: 20+ retries; performance traces on same build.

## G3 expanded beta 15–30 test participants
Use multiple device classes. Prioritize qualitative severity/frequency of pain points. Do not invent retention metrics or infer population percentages from convenience sample. Evaluate difficulty ramp, screen occlusion, first 60s comprehension, score meaning, sound annoyance, willingness to return.

## Decision framework
| Outcome | Response |
|---|---|
| Players cannot aim with simple drag | adjust filtering & preview visual, compare joystick |
| Players love flight but hate collision goal | experiment alternative spatial precision objective before continuing asset production |
| Impact satisfying but retries slow | shorten post-impact, preload scene, reset rather than full reload |
| Forest feels generic | adjust lighting, camera, focal clearings and bespoke color/VFX, not more assets |
| Game runs hot | profile and reduce rendering cost before adding more content |
| Players ask for multiplayer/story | log phase-2 idea, don't add until MVP proven |

## Evidence filing
Add `docs/playtests/YYYY-MM-DD-<build>.md` for actual study records. Blank examples are templates only; never mark invented testing as done. Attach short anonymous quotes and issue IDs. Owner signs G1/G2 after reviewing evidence.
