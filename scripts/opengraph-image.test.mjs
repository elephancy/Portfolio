import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import ts from 'typescript';

test('the actual Open Graph image renders at its declared size without dimension warnings', async () => {
  const source = readFileSync(new URL('../app/opengraph-image.tsx', import.meta.url), 'utf8');
  const js = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', js)(createRequire(import.meta.url), module, module.exports);

  const logo = readFileSync(new URL('../public/Logo-transparent.png', import.meta.url));
  const fetch = globalThis.fetch;
  const warn = console.warn;
  const error = console.error;
  const warnings = [];
  globalThis.fetch = (url, ...args) => String(url) === 'https://elfeel.me/Logo-transparent.png'
    ? Promise.resolve(new Response(logo, { headers: { 'Content-Type': 'image/png' } }))
    : fetch(url, ...args);
  console.warn = (...args) => warnings.push(args.map(String).join(' '));
  console.error = (...args) => warnings.push(args.map(String).join(' '));
  try {
    const response = module.exports.default();
    const png = Buffer.from(await response.arrayBuffer());
    assert.equal(response.headers.get('Content-Type'), 'image/png');
    assert.equal(png.readUInt32BE(16), module.exports.size.width);
    assert.equal(png.readUInt32BE(20), module.exports.size.height);
    assert.deepEqual(warnings, [], 'ImageResponse must not discard invalid image dimensions');
  } finally {
    globalThis.fetch = fetch;
    console.warn = warn;
    console.error = error;
  }
});
