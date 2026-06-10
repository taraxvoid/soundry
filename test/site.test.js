import { describe, expect, test } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ---------------------------------------------------------------------------
// Build smoke test
// ---------------------------------------------------------------------------

describe('astro build', () => {
  test('bun run build emits dist/', () => {
    const result = spawnSync('bun', ['run', 'build'], {
      cwd: ROOT,
      encoding: 'utf8',
      timeout: 120_000,
    })

    expect(result.status).toBe(0)

    const distDir = join(ROOT, 'dist')
    expect(existsSync(distDir)).toBe(true)

    const entries = readdirSync(distDir)
    expect(entries.length).toBeGreaterThan(0)
    expect(existsSync(join(distDir, 'index.html'))).toBe(true)
    expect(existsSync(join(distDir, 'events.ics'))).toBe(true)
  }, 120_000)
})
