# Browser smoke timing reliability

Desktop software WebGL rendering may advance far fewer simulation seconds than wall-clock seconds. Regression assertions for reverse and diagonal momentum should compare progress over simulated time rather than assuming each waitForTimeout represents matching flight seconds.

Next code step: expose monotonically accumulated simulation time in the read-only browser snapshot; wait for a bounded simulation-time delta with an independent wall-clock timeout in browser smoke. Retain pure model tests for long sustained reverse transition. Never alter actual flight speed to make CI pass.

Validation pending: Node tests, Chromium smoke and real iPhone Safari portrait. Owner phone validation remains pending for one-finger brake, reversing diagonals, dive, hit feedback and auto-respawn. Fictional arcade only; no physical drone support.
