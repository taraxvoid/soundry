import { describe, expect, test } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
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

    test('events.ics is a valid VCALENDAR with Soundry Events name', () => {
        const ics = readFileSync(join(ROOT, 'dist', 'events.ics'), 'utf8')
        expect(ics).toContain('BEGIN:VCALENDAR')
        expect(ics).toContain('END:VCALENDAR')
        expect(ics).toContain('VERSION:2.0')
        expect(ics).toContain('X-WR-CALNAME:Soundry Events')
    })

    test('index.html contains calendar subscribe link and autodiscovery', () => {
        const html = readFileSync(join(ROOT, 'dist', 'index.html'), 'utf8')
        expect(html).toContain('calendar.google.com')
        expect(html).toContain('rel="alternate"')
        expect(html).toContain('type="text/calendar"')
        expect(html).toContain('/events.ics')
    })

    test('per-event ics files are generated', () => {
        const eventsIcsDir = join(ROOT, 'dist', 'events')
        expect(existsSync(eventsIcsDir)).toBe(true)
        const icsFiles = readdirSync(eventsIcsDir).filter((f) =>
            f.endsWith('.ics'),
        )
        expect(icsFiles.length).toBeGreaterThan(0)
    })
})
