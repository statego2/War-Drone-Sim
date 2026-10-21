import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COCKPIT_STORAGE_KEY, normalizeCockpitMode, readCockpitMode,
  saveCockpitMode, toggleCockpitMode
} from '../src/cockpitprefs.mjs';

test('new and invalid stored values default to a minimalist cockpit', () => {
  assert.equal(COCKPIT_STORAGE_KEY, 'warDroneCockpitMode');
  for(const value of [undefined, null, '', '1', 'expanded', 'detailed ']) {
    assert.equal(normalizeCockpitMode(value), 'minimal');
    assert.equal(readCockpitMode(() => value), 'minimal');
  }
  assert.equal(readCockpitMode(() => 'detailed'), 'detailed');
});

test('toggle is reversible and does not introduce a third UI mode', () => {
  assert.equal(toggleCockpitMode('minimal'), 'detailed');
  assert.equal(toggleCockpitMode('detailed'), 'minimal');
  assert.equal(toggleCockpitMode('corrupt'), 'detailed');
});

test('storage errors never break boot or in-flight HUD changes', () => {
  assert.equal(readCockpitMode(() => { throw new Error('Storage denied'); }), 'minimal');
  assert.equal(saveCockpitMode('detailed', () => { throw new Error('Quota exceeded'); }), 'detailed');
});

test('selected mode survives an app restart when storage is available', () => {
  const fakeStorage = new Map();
  let mode = readCockpitMode(() => fakeStorage.get(COCKPIT_STORAGE_KEY));
  assert.equal(mode, 'minimal');
  mode = saveCockpitMode(toggleCockpitMode(mode), value => fakeStorage.set(COCKPIT_STORAGE_KEY, value));
  assert.equal(readCockpitMode(() => fakeStorage.get(COCKPIT_STORAGE_KEY)), 'detailed');
  mode = saveCockpitMode(toggleCockpitMode(mode), value => fakeStorage.set(COCKPIT_STORAGE_KEY, value));
  assert.equal(readCockpitMode(() => fakeStorage.get(COCKPIT_STORAGE_KEY)), 'minimal');
});
