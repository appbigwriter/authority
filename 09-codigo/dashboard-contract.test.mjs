import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('./public/dashboard.html', import.meta.url), 'utf8');

assert.equal((html.match(/\$\('runPM'\)/g) ?? []).length, 0, 'Post Machine must use #runPM selectors');
assert.match(html, /\$\('#runPM'\)\.disabled=true/, 'Post Machine must disable the real button');
assert.match(html, /researchSelect[^\n]*addEventListener\(['"]change['"]/, 'researchSelect must have a change listener');
assert.doesNotMatch(html, /function loadSeedsForResearch\([\s\S]*?openSeedsModal\(\)/, 'seed generation must not reopen modal without researchId');
assert.match(html, /(?:function|const) apiFetch/, 'dashboard must centralize authenticated API calls');
assert.match(html, /AUTH_STORAGE_KEY=['"]authority_engine_token['"]/); assert.match(html, /sessionStorage\.getItem\(AUTH_STORAGE_KEY\)/, 'dashboard auth must be session-scoped');
assert.equal((html.match(/\bfetch\(/g) ?? []).length, 1, 'only apiFetch may call fetch directly');

console.log('dashboard contract: PASS');
