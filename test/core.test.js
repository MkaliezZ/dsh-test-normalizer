import test from 'node:test'; import assert from 'node:assert/strict'; import {parseTestOutput} from '../src/core.js';
test('parses pytest',()=>{const r=parseTestOutput('================ 12 passed, 2 skipped in 1.2s ================','pytest'); assert.equal(r.passed,12); assert.equal(r.skipped,2);});
test('parses cargo failure',()=>{const r=parseTestOutput('test result: FAILED. 4 passed; 1 failed; 2 ignored','cargo'); assert.equal(r.failed,1); assert.equal(r.success,false);});
