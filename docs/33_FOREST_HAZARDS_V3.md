# Forest Obstacle Collision — v3

**Status:** implementation on PR #87, awaiting browser/phone acceptance.

The corridor renders thousands of trees, but previously none obstructed the craft. v3 makes visually present trees into forgiving arcade obstacles.

## Mechanics

1. addForest shares the actually rendered near-tree composition with treeHazard, storing compact hitboxes per streamed terrain tile. Distant scenery never produces collisions.
2. Collision cylinders cover 67% of the visible tree foliage radius, from 12% to 106% of its visual scale above ground; grazing small branches is deliberately forgiven.
3. Swept collision intersects the segment's radial-cylinder interval with the vertical interval. A fast browser frame cannot jump across the center of a tree.
4. The physics loop checks only the tiles overlapped by the player segment, not the entire forest.
5. The earliest tree or fictional vehicle contact wins. Tree collisions cause a separate on-screen message, reset combo, and return to the normal ~0.98-second automatic airborne retry.
6. Authored roads and clearings remain largely unobstructed through the existing clearingRadius function.

## Acceptance

Unit tests cover canopy overflight, horizontal crossing, steep descent, grazing, closest obstacle and event ordering. Browser smoke verifies streamed near-tree collision candidates. Real iPhone testing must independently evaluate visibility, fairness, frame rate, thermal comfort and enjoyment over 10–15 drones.

Collision dimensions are tuning hypotheses, not evidence of verified iPhone behavior. If too punishing, narrow the collision radii or revert PR #87. Fictional arcade only, no real aircraft simulation.
