import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

// Execute the actual TypeScript modules, including their tracking integration.
function fixture({ stored = null, blockedRead = false, blockedWrite = false, blockedHistory = false, tracker = false, href = 'https://elfeel.me/?view=work#about', state = { __NA: true, tree: ['original'] } } = {}) {
  const events = [];
  const window = {
    location: { href },
    history: {
      state,
      replaceState(next, _, url) {
        if (blockedHistory) throw new Error('SecurityError');
        this.state = next;
        window.location.href = url;
      },
    },
    localStorage: {
      getItem() { if (blockedRead) throw new Error('SecurityError'); return stored; },
      setItem(_, value) { if (blockedWrite) throw new Error('QuotaExceededError'); stored = value; },
    },
    ...(tracker ? { umami: { track: (...args) => events.push(args) } } : {}),
  };
  const context = vm.createContext({ window, URL });
  function load(name, imports = {}) {
    const source = readFileSync(new URL(`../lib/${name}.ts`, import.meta.url), 'utf8');
    const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const module = { exports: {} };
    vm.runInContext(`(function(require,module,exports){${js}\n})`, context)((id) => {
      assert.ok(imports[id], `Unexpected import ${id}`);
      return imports[id];
    }, module, module.exports);
    return module.exports;
  }
  const consent = load('analyticsConsent');
  const analytics = load('analytics', { './analyticsConsent': consent });
  return { window, events, consent, analytics, stored: () => stored, reload: () => { delete window.elfeelAnalyticsConsent; return consent.restoreAnalyticsConsent(); } };
}

test('decline with failed persistent write survives reload using history and preserves Next fields', () => {
  const f = fixture({ stored: 'accepted', blockedWrite: true, tracker: true });
  f.consent.restoreAnalyticsConsent();
  assert.equal(f.consent.saveAnalyticsConsent('declined'), null);
  assert.equal(f.stored(), 'accepted');
  assert.equal(f.reload(), 'declined');
  assert.deepEqual(Array.from(f.window.history.state.tree), ['original']);
  assert.equal(f.window.history.state.__NA, true);
  assert.equal(f.window.location.href, 'https://elfeel.me/?view=work#about');
  f.analytics.trackEvent('after decline');
  assert.equal(f.events.length, 0);
});

test('failed storage and history writes use a decline-only URL preserving query and hash', () => {
  const f = fixture({ stored: 'accepted', blockedWrite: true, blockedHistory: true });
  const target = f.consent.saveAnalyticsConsent('declined');
  assert.equal(target, 'https://elfeel.me/?view=work&elfeel-analytics=declined#about');
  f.window.location.href = target;
  assert.equal(f.reload(), 'declined');
});

for (const tracker of [false, true]) {
  test(`blocked reads never throw or track before explicit acceptance (tracker=${tracker})`, () => {
    const f = fixture({ blockedRead: true, blockedWrite: true, tracker });
    assert.equal(f.consent.restoreAnalyticsConsent(), null);
    assert.doesNotThrow(() => f.analytics.trackEvent('navigation'));
    assert.doesNotThrow(() => f.analytics.flushAnalyticsQueue());
    assert.equal(f.events.length, 0);
    f.consent.saveAnalyticsConsent('accepted');
    assert.doesNotThrow(() => f.analytics.trackEvent('explicit acceptance'));
    assert.equal(tracker ? f.events.length : f.window.elfeelAnalyticsQueue.length, 1);
  });
}

test('revocation clears queued events and prevents already-loaded trackers and flushes', () => {
  const f = fixture({ stored: 'accepted' });
  f.consent.restoreAnalyticsConsent();
  f.analytics.trackEvent('queued');
  assert.equal(f.window.elfeelAnalyticsQueue.length, 1);
  f.consent.saveAnalyticsConsent('declined');
  f.window.umami = { track: (...args) => f.events.push(args) };
  f.analytics.trackEvent('late callback');
  f.analytics.flushAnalyticsQueue();
  assert.equal(f.window.elfeelAnalyticsQueue.length, 0);
  assert.equal(f.events.length, 0);
  assert.equal(f.reload(), 'declined');
});

test('accept clears decline fallbacks without losing unrelated URL or history data', () => {
  const f = fixture({ href: 'https://elfeel.me/?view=work&elfeel-analytics=declined#about', state: { __NA: true, tree: ['original'], elfeelAnalyticsDeclined: true } });
  assert.equal(f.reload(), 'declined');
  f.consent.saveAnalyticsConsent('accepted');
  assert.equal(f.window.location.href, 'https://elfeel.me/?view=work#about');
  assert.equal(f.window.history.state.__NA, true);
  assert.deepEqual(Array.from(f.window.history.state.tree), ['original']);
  assert.equal(f.window.history.state.elfeelAnalyticsDeclined, undefined);
  assert.equal(f.reload(), 'accepted');
});

test('URL and history inputs cannot imply acceptance', () => {
  const f = fixture({ href: 'https://elfeel.me/?elfeel-analytics=accepted', state: { elfeelAnalyticsDeclined: 'accepted' } });
  assert.equal(f.reload(), null);
  f.analytics.trackEvent('navigation');
  assert.equal(f.window.elfeelAnalyticsQueue, undefined);
});

test('actual Workspace URL effect preserves consent fallbacks and Next state while updating owned filters', () => {
  const source = readFileSync(new URL('../components/sections/WorkspaceOS.tsx', import.meta.url), 'utf8');
  const ast = ts.createSourceFile('WorkspaceOS.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let effect;
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(ast) === 'useEffect') {
      const callback = node.arguments[0];
      if (callback?.getText(ast).includes('window.history.replaceState')) effect = callback.getText(ast);
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  assert.ok(effect, 'Expected the real Workspace URL synchronization effect');
  const state = { __NA:true, tree:['next'], elfeelAnalyticsDeclined:true };
  const window = {
    location: { href:'https://elfeel.me/?campaign=source&elfeel-analytics=declined&project=old&mode=old&q=old&status=archived&view=graph#about' },
    history: { state, replaceState(next, _, url) { this.state = next; window.location.href = new URL(url, window.location.href).href; } },
  };
  vm.runInNewContext(`(${effect})()`, { window, URL, URLSearchParams, workspaceReady:true, selectedId:'portfolio', mode:'All', repoFilter:'all', query:'', activeWindow:'terminal' });
  assert.equal(window.location.href,'https://elfeel.me/?campaign=source&elfeel-analytics=declined#about');
  assert.equal(window.history.state,state);
});
