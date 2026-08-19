import test from 'node:test'
import assert from 'node:assert/strict'
import { apply } from '../src/plugin.js'

type Handler = (invocation: { rawInput?: string }) => Promise<{ kind: string; text: string }>

function capture(config: unknown = {}) {
  const commands: Record<string, Handler> = {}
  apply({ commands: { register: (d: { name: string; handler: Handler }) => { commands[d.name] = d.handler } } } as never, config as never)
  return commands
}

test('test command normalizes pytest output', async () => {
  const handlers = capture({ run: async () => ({ stdout: '============== 3 passed, 1 failed, 2 skipped in 4.2s ==============' }) })
  const result = await handlers['test']!({ rawInput: 'pytest -q' })
  assert.equal(result.kind, 'success')
  const parsed = JSON.parse(result.text)
  assert.equal(parsed.framework, 'pytest')
  assert.equal(parsed.passed, 3)
  assert.equal(parsed.failed, 1)
  assert.equal(parsed.success, false)
})

test('test command fails closed without a run adapter', async () => {
  const result = await capture()['test']!({ rawInput: 'pytest' })
  assert.equal(result.kind, 'error')
  assert.match(result.text, /run adapter/)
})
