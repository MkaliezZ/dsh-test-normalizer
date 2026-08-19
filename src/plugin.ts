import { parseTestOutput } from './core.js'

export const name = 'test-normalizer'
export const inject = ['commands']

export interface TestRunnerAdapter {
  run: (args: string[]) => Promise<{ stdout?: string }> | { stdout?: string }
}

export interface Config { run?: TestRunnerAdapter['run'] }

export function apply(ctx: any, config: Config = {}): void {
  ctx.commands.register({
    name: 'test',
    description: 'Run a test command and normalize its output into a stable summary.',
    input: { hint: '<test command and args>' },
    recordInput: false,
    async handler(invocation: any) {
      if (!config.run) return { kind: 'error', text: 'test-normalizer requires a run adapter via plugin config' }
      const args = String(invocation.rawInput ?? '').trim().split(/\s+/).filter(Boolean)
      if (args.length === 0) return { kind: 'error', text: 'usage: /test <command and args>' }
      try {
        const result = await config.run(args)
        return { kind: 'success', text: JSON.stringify(parseTestOutput(result.stdout ?? ''), null, 2) }
      } catch (error) {
        return { kind: 'error', text: `test run failed: ${error instanceof Error ? error.message : String(error)}` }
      }
    },
  })
}