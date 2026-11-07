import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { consentBootstrap } from '../lib/consentBootstrap.ts';

function runPreference(value, blocked = false) {
  const calls = [];
  const context = {
    window: {
      localStorage: {
        getItem(key) {
          calls.push(['read', key]);
          if (blocked) throw new Error('Storage unavailable');
          return value;
        },
        setItem() { assert.fail('The bootstrap must not persist or accept consent'); },
      },
    },
    document: {
      documentElement: {
        setAttribute(...args) { calls.push(['attribute', ...args]); },
      },
    },
  };
  vm.runInNewContext(consentBootstrap, context, { timeout: 100 });
  return calls;
}

for (const value of ['accepted', 'declined']) {
  test(`existing ${value} choice hides only the initial prompt`, () => {
    assert.deepEqual(runPreference(value), [
      ['read', 'elfeel-analytics-consent'],
      ['attribute', 'data-elfeel-saved-consent', ''],
    ]);
  });
}

for (const value of [null, '', 'unknown', 'true']) {
  test(`missing or invalid choice ${String(value)} keeps the prompt`, () => {
    assert.deepEqual(runPreference(value), [['read', 'elfeel-analytics-consent']]);
  });
}

test('blocked storage keeps the prompt without throwing', () => {
  assert.deepEqual(runPreference(null, true), [['read', 'elfeel-analytics-consent']]);
});
