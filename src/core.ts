export type TestFramework = 'pytest' | 'vitest' | 'jest' | 'cargo' | 'unknown';
export interface TestSummary {
  framework: TestFramework;
  passed: number;
  failed: number;
  skipped: number;
  failures: string[];
  success: boolean;
}

const patterns: Record<Exclude<TestFramework, 'unknown'>, RegExp> = {
  pytest: /=+\s*(\d+) passed(?:, (\d+) failed)?(?:, (\d+) skipped)?/i,
  vitest: /Tests\s+(?:(\d+) failed\s*\|\s*)?(\d+) passed(?:\s*\|\s*(\d+) skipped)?/i,
  jest: /Tests:\s+(?:(\d+) failed,\s*)?(?:(\d+) skipped,\s*)?(\d+) passed/i,
  cargo: /test result:\s*(ok|FAILED)\.\s*(\d+) passed;\s*(\d+) failed;\s*(\d+) ignored/i,
};

export function detectFramework(text: string): TestFramework {
  if (/pytest|passed in \d|=+ .* passed/.test(text)) return 'pytest';
  if (/Vitest|Tests\s+.*passed/.test(text)) return 'vitest';
  if (/Test Suites:|Tests:/.test(text)) return 'jest';
  if (/test result:/.test(text)) return 'cargo';
  return 'unknown';
}

export function parseTestOutput(text: string, framework: TestFramework = detectFramework(text)): TestSummary {
  const source = String(text);
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  const match = framework === 'unknown' ? null : patterns[framework].exec(source);
  if (match) {
    if (framework === 'pytest') { passed = +(match[1] || 0); failed = +(match[2] || 0); skipped = +(match[3] || 0); }
    if (framework === 'vitest') { failed = +(match[1] || 0); passed = +(match[2] || 0); skipped = +(match[3] || 0); }
    if (framework === 'jest') { failed = +(match[1] || 0); skipped = +(match[2] || 0); passed = +(match[3] || 0); }
    if (framework === 'cargo') { passed = +match[2]; failed = +match[3]; skipped = +match[4]; }
  }
  const failures = [...source.matchAll(/(?:FAIL|FAILED|ERROR)[:\s]+([^\n]+)/g)].map((item) => item[1].trim()).slice(0, 20);
  return { framework, passed, failed, skipped, failures, success: failed === 0 && framework !== 'unknown' };
}
