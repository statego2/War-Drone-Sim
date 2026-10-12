# Cross-browser game boot coverage (2026-10-12)

The browser game is **first a portrait iPhone Safari experience**. Existing CI uses headless desktop Chromium, which cannot test Safari's JavaScript/WebGL/CSS implementation. The new independent CI job starts Linux desktop **WebKit**, serves the **exact staged GitHub Pages artifact**, waits for real 3D initialization, starts the sixteen-target encounter, and checks that WebGL produced draw calls. Its screenshot is attached as a workflow artifact.

Do not confuse desktop Linux WebKit with iPhone Safari. Real-device acceptance still requires touching, reversing, diving, crossing targets, retrying, audio comfort, WebGL restoration, FPS and thermals on the owner's actual iPhone.

If the CI runner itself cannot supply accelerated WebGL for WebKit, record that environment limitation openly and keep desktop Chromium as the existing regression floor; never silently treat a skipped or fallback Canvas run as a pass.
