import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { consentBootstrap } from '../lib/consentBootstrap.ts';

function runPreference(value, blocked = false, href = 'https://elfeel.me/', state = {}) {
  const calls = [];
  const context = {
    window: {
      location: { href },
      history: { state },
      localStorage: {
        getItem(key) {
          calls.push(['read', key]);
          if (blocked) throw new Error('Storage unavailable');
          return value;
        },
        setItem() { assert.fail('The bootstrap must not persist or accept consent'); },
      },
    },
    URL,
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
      ['attribute', 'data-elfeel-consent-ui', ''],
      ['read', 'elfeel-analytics-consent'],
      ['attribute', 'data-elfeel-saved-consent', ''],
    ]);
  });
}

for (const value of [null, '', 'unknown', 'true']) {
  test(`missing or invalid choice ${String(value)} keeps the prompt`, () => {
    assert.deepEqual(runPreference(value), [['attribute', 'data-elfeel-consent-ui', ''], ['read', 'elfeel-analytics-consent']]);
  });
}

test('blocked storage keeps the prompt without throwing', () => {
  assert.deepEqual(runPreference(null, true), [['attribute', 'data-elfeel-consent-ui', ''], ['read', 'elfeel-analytics-consent']]);
});

for (const [href, state] of [
  ['https://elfeel.me/?elfeel-analytics=declined', {}],
  ['https://elfeel.me/', { elfeelAnalyticsDeclined: true }],
]) {
  test(`decline fallback overrides old acceptance: ${href} ${JSON.stringify(state)}`, () => {
    assert.deepEqual(runPreference('accepted', true, href, state), [
      ['attribute', 'data-elfeel-consent-ui', ''],
      ['attribute', 'data-elfeel-saved-consent', ''],
    ]);
  });
}

test('navigation values cannot grant acceptance', () => {
  const calls = runPreference(null, false, 'https://elfeel.me/?elfeel-analytics=accepted', { elfeelAnalyticsDeclined: 'accepted' });
  assert.equal(calls.some(call => call[1] === 'data-elfeel-saved-consent'), false);
});
