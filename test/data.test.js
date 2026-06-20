import { describe, expect, test } from 'bun:test'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse as parseYaml } from 'yaml'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const EVENTS_DIR = join(ROOT, 'src', 'content', 'events')

describe('events', () => {
    const files = readdirSync(EVENTS_DIR).filter((f) => f.endsWith('.yaml'))

    test('there is at least one event file', () => {
        expect(files.length).toBeGreaterThan(0)
    })

    for (const file of files) {
        const data = parseYaml(readFileSync(join(EVENTS_DIR, file), 'utf8'))

        describe(file, () => {
            test('has required fields', () => {
                expect(typeof data.title).toBe('string')
                expect(data.title.length).toBeGreaterThan(0)
                expect(typeof data.location).toBe('string')
                expect(data.location.length).toBeGreaterThan(0)
                expect(typeof data.description).toBe('string')
                expect(data.description.length).toBeGreaterThan(0)
            })

            test('date is YYYY-MM-DD', () => {
                const dateStr =
                    typeof data.date === 'string'
                        ? data.date
                        : data.date?.toISOString?.().slice(0, 10)
                expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/)
            })

            test('time is HH:MM', () => {
                expect(String(data.time)).toMatch(/^\d{1,2}:\d{2}$/)
            })

            test('endTime is HH:MM if present', () => {
                if (data.endTime === undefined) return
                expect(String(data.endTime)).toMatch(/^\d{1,2}:\d{2}$/)
            })

            test('price is a numeric string if present', () => {
                if (data.price === undefined) return
                expect(String(data.price)).toMatch(/^\d+(\.\d+)?$/)
            })
        })
    }
})
