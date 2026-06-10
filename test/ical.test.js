import { describe, expect, test } from 'bun:test'

const { generateFeedICS, generateEventICS } = await import(
  '../src/utils/ical.ts'
)

const baseEvent = {
  title: 'Test Show',
  date: '2026-06-12',
  time: '20:00',
  location: 'Church Arthouse (Omaha)',
  description: 'A great show',
  price: '10',
  revision: 0,
}

describe('generateFeedICS', () => {
  test('produces valid VCALENDAR wrapper', () => {
    const ics = generateFeedICS([])
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('END:VCALENDAR')
    expect(ics).toContain('VERSION:2.0')
    expect(ics).toContain('X-WR-CALNAME:Soundry Events')
    expect(ics).toContain('X-WR-TIMEZONE:America/Chicago')
  })

  test('includes upcoming events as VEVENTs', () => {
    const ics = generateFeedICS([{ data: baseEvent, id: 'test-show' }])
    expect(ics).toContain('UID:test-show@omahasoundry.com')
    expect(ics).toContain('SUMMARY:Test Show')
    expect(ics).toContain('DTSTART;TZID=America/Chicago:20260612T200000')
    expect(ics).toContain('LOCATION:Church Arthouse (Omaha)')
  })

  test('paid event description includes price', () => {
    const ics = generateFeedICS([{ data: baseEvent, id: 'paid' }])
    expect(ics).toContain('$10 admission')
  })

  test('free event description says Free admission', () => {
    const ics = generateFeedICS([
      { data: { ...baseEvent, price: '0' }, id: 'free' },
    ])
    expect(ics).toContain('Free admission')
  })

  test('CRLF line endings throughout', () => {
    const ics = generateFeedICS([{ data: baseEvent, id: 'test-show' }])
    expect(ics).toContain('\r\n')
    expect(ics.replace(/\r\n/g, '')).not.toContain('\n')
  })
})

describe('generateEventICS', () => {
  test('produces valid single-event VCALENDAR', () => {
    const ics = generateEventICS(baseEvent, 'test-show')
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('END:VCALENDAR')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('END:VEVENT')
  })

  test('X-WR-CALNAME uses event title', () => {
    const ics = generateEventICS(baseEvent, 'test-show')
    expect(ics).toContain('X-WR-CALNAME:Test Show')
  })

  test('UID is slug-based', () => {
    const ics = generateEventICS(baseEvent, 'my-event')
    expect(ics).toContain('UID:my-event@omahasoundry.com')
  })

  test('endTime overrides default +90min', () => {
    const ics = generateEventICS({ ...baseEvent, endTime: '22:30' }, 'e')
    expect(ics).toContain('DTEND;TZID=America/Chicago:20260612T223000')
  })

  test('default endTime is start + 90min', () => {
    const ics = generateEventICS(baseEvent, 'e')
    expect(ics).toContain('DTEND;TZID=America/Chicago:20260612T213000')
  })

  test('revision appears as SEQUENCE', () => {
    const ics = generateEventICS({ ...baseEvent, revision: 3 }, 'e')
    expect(ics).toContain('SEQUENCE:3')
  })

  test('SEQUENCE defaults to 0 when revision is absent', () => {
    const { revision, ...withoutRevision } = baseEvent
    const ics = generateEventICS(withoutRevision, 'e')
    expect(ics).toContain('SEQUENCE:0')
  })
})
