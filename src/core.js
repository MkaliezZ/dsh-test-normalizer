const patterns={
  pytest:/=+\s*(\d+) passed(?:, (\d+) failed)?(?:, (\d+) skipped)?/i,
  vitest:/Tests\s+(?:(\d+) failed\s*\|\s*)?(\d+) passed(?:\s*\|\s*(\d+) skipped)?/i,
  jest:/Tests:\s+(?:(\d+) failed,\s*)?(?:(\d+) skipped,\s*)?(\d+) passed/i,
  cargo:/test result:\s*(ok|FAILED)\.\s*(\d+) passed;\s*(\d+) failed;\s*(\d+) ignored/i,
};
export function detectFramework(text){ if(/pytest|passed in \d|=+ .* passed/.test(text)) return 'pytest'; if(/Vitest|Tests\s+.*passed/.test(text)) return 'vitest'; if(/Test Suites:|Tests:/.test(text)) return 'jest'; if(/test result:/.test(text)) return 'cargo'; return 'unknown'; }
export function parseTestOutput(text, framework=detectFramework(text)){
  const s=String(text); let passed=0,failed=0,skipped=0; const m=patterns[framework]?.exec(s);
  if(m){ if(framework==='pytest'){passed=+(m[1]||0); failed=+(m[2]||0); skipped=+(m[3]||0);} if(framework==='vitest'){failed=+(m[1]||0); passed=+(m[2]||0); skipped=+(m[3]||0);} if(framework==='jest'){failed=+(m[1]||0); skipped=+(m[2]||0); passed=+(m[3]||0);} if(framework==='cargo'){passed=+m[2]; failed=+m[3]; skipped=+m[4];} }
  const failures=[...s.matchAll(/(?:FAIL|FAILED|ERROR)[:\s]+([^\n]+)/g)].map(x=>x[1].trim()).slice(0,20);
  return {framework,passed,failed,skipped,failures,success:failed===0 && framework!=='unknown'};
}
