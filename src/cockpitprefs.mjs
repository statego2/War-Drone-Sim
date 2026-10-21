// Small, failure-safe visual preference for the fictional arcade HUD.
// Local-only storage: no analytics, account, or device information.
export const COCKPIT_STORAGE_KEY = 'warDroneCockpitMode';
export const normalizeCockpitMode = value => value === 'detailed' ? 'detailed' : 'minimal';

export function readCockpitMode(read = () => null) {
  try { return normalizeCockpitMode(read()); }
  catch { return 'minimal'; } // Private browsing/disabled storage must not stop flight.
}

export function saveCockpitMode(mode, write = () => {}) {
  const normalized = normalizeCockpitMode(mode);
  try { write(normalized); } catch { /* preference remains in memory */ }
  return normalized;
}

export const toggleCockpitMode = mode => normalizeCockpitMode(mode) === 'minimal' ? 'detailed' : 'minimal';
