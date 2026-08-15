import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTestOutput } from '../src/core.js';

test('parses pytest', () => {
  const result = parseTestOutput('================ 12 passed, 2 skipped in 1.2s ================', 'pytest');
  assert.equal(result.passed, 12);
  assert.equal(result.skipped, 2);
});

test('parses cargo failure', () => {
  const result = parseTestOutput('test result: FAILED. 4 passed; 1 failed; 2 ignored', 'cargo');
  assert.equal(result.failed, 1);
  assert.equal(result.success, false);
});
