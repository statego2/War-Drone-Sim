// Pure arcade scoring and next-target guidance for the fictional forest level.
// The values reward speed and committed dives, not any real-world targeting skill.
import { activeSectorIndex } from './encounter.mjs';

export function makeScorecard() {
  return { points: 0, combo: 0, bestCombo: 0, hits: 0, misses: 0, diveHits: 0,
    discoveries:0,landmarks:0,scoutingPoints:0 };
}

// Reward finding things, not just crashing into known markers. Caller owns
// one-off discovery state; awarding score never influences actual contact.
export function registerExploration(card,type='vehicle',count=1){
  const n=Math.max(0,Math.min(16,Math.floor(count)||0));
  const per=type==='landmark'?75:35;
  const points=n*per;
  card.points+=points;card.scoutingPoints+=points;
  if(type==='landmark')card.landmarks+=n;
  else card.discoveries+=n;
  return {points,label:type==='landmark'?'HIDDEN GROVE FOUND':'OBJECTIVE SPOTTED'};
}
export function registerResult(card, hit, flight = {}) {
  if (!hit) {
    card.misses++;
    card.combo = 0;
    return { points: 0, label: 'GROUND IMPACT', combo: 0 };
  }
  const speed = Math.hypot(flight.vx || 0, flight.vy || 0, flight.vz || 0);
  const cleanDive = flight.pitch >= .68 && flight.vy <= -8;
  card.combo = Math.min(6, card.combo + 1);
  card.bestCombo = Math.max(card.bestCombo, card.combo);
  card.hits++;
  if (cleanDive) card.diveHits++;
  const base = 100;
  const paceBonus = Math.round(Math.min(85, speed * .72));
  const diveBonus = cleanDive ? 100 : 0;
  const chainBonus = (card.combo - 1) * 30;
  const points = base + paceBonus + diveBonus + chainBonus;
  card.points += points;
  return {
    points,
    combo: card.combo,
    cleanDive,
    label: cleanDive ? 'DIVE IMPACT' : card.combo >= 3 ? 'COMBO HIT' : 'DIRECT HIT'
  };
}

export function guidanceFor(encounter, flight, revealedIds = null) {
  const sector = activeSectorIndex(encounter);
  const remaining = encounter.vehicles.filter(v => !v.destroyed && v.sector === sector &&
    (revealedIds === null || revealedIds.has(v.id)));
  if (!remaining.length) return null;
  // Prefer a target in front, but never hide a missed target behind the drone.
  let chosen = null, best = Infinity;
  for (const v of remaining) {
    const dx = v.x - flight.x, dz = v.z - flight.z;
    const distance = Math.hypot(dx, dz);
    // In the existing +Z chase-camera frame, screen-right is world -X.
    // Mirror the mathematical heading delta to match the player's gesture.
    const angle = -Math.atan2(Math.sin(Math.atan2(dx, dz) - flight.heading),
                              Math.cos(Math.atan2(dx, dz) - flight.heading));
    const penalty = Math.abs(angle) > 1.45 ? 110 : 0;
    const rank = distance + penalty + Math.abs(angle) * 28;
    if (rank < best) { chosen = { v, angle, distance }; best = rank; }
  }
  const a = chosen.angle, degrees = Math.abs(a) * 180 / Math.PI;
  const direction = degrees > 135 ? 'BEHIND'
    : degrees > 48 ? (a > 0 ? 'RIGHT' : 'LEFT')
    : degrees > 17 ? (a > 0 ? 'SLIGHT RIGHT' : 'SLIGHT LEFT') : 'AHEAD';
  const arrow = degrees > 135 ? '↓'
    : degrees > 48 ? (a > 0 ? '→' : '←')
    : degrees > 17 ? (a > 0 ? '↗' : '↖') : '↑';
  return { id: chosen.v.id, kind: chosen.v.kind.toUpperCase(), sector,
    distance: Math.round(chosen.distance), direction, arrow, angle: a };
}
