import { parseTestOutput } from './core.js';

interface CommandContext {
  command?: (name: string, handler: (...args: string[]) => unknown | Promise<unknown>) => unknown;
}
interface TestProcessResult { stdout?: string; }
interface TestRunnerAdapter { run: (args: string[]) => Promise<TestProcessResult> | TestProcessResult; }

export function registerTestRunner(ctx: CommandContext, { run }: TestRunnerAdapter): void {
  ctx.command?.('test', async (...args) => {
    const result = await run(args);
    return JSON.stringify(parseTestOutput(result.stdout ?? ''), null, 2);
  });
}
