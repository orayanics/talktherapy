import { describe, expect, it } from 'vitest'
import { expandOccurrences, validateRRule } from './expandOccurrences'

describe('schedule recurrence preview', () => {
  it('expands daily occurrences from UTC local input', () => {
    const dates = expandOccurrences(
      '2027-01-01T09:00',
      'FREQ=DAILY;INTERVAL=2;COUNT=3',
    )

    expect(dates.map((date) => date.toISOString())).toEqual([
      '2027-01-01T09:00:00.000Z',
      '2027-01-03T09:00:00.000Z',
      '2027-01-05T09:00:00.000Z',
    ])
  })

  it('matches weekly selected days and intervals', () => {
    const dates = expandOccurrences(
      '2027-01-04T09:00',
      'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE;COUNT=5',
    )

    expect(dates.map((date) => date.toISOString().slice(0, 10))).toEqual([
      '2027-01-04',
      '2027-01-06',
      '2027-01-18',
      '2027-01-20',
      '2027-02-01',
    ])
  })

  it('does not include a start weekday excluded by BYDAY', () => {
    const dates = expandOccurrences(
      '2027-01-05T09:00',
      'FREQ=WEEKLY;BYDAY=MO;COUNT=2',
    )

    expect(dates.map((date) => date.toISOString().slice(0, 10))).toEqual([
      '2027-01-11',
      '2027-01-18',
    ])
  })

  it('repeats a weekly rule without BYDAY on the start weekday', () => {
    const dates = expandOccurrences(
      '2027-01-05T09:00',
      'FREQ=WEEKLY;INTERVAL=2;COUNT=3',
    )

    expect(dates.map((date) => date.toISOString().slice(0, 10))).toEqual([
      '2027-01-05',
      '2027-01-19',
      '2027-02-02',
    ])
  })

  it('matches server month-end behavior and inclusive UNTIL', () => {
    const monthly = expandOccurrences(
      '2027-01-31T09:00',
      'FREQ=MONTHLY;COUNT=4',
    )
    const until = expandOccurrences(
      '2027-01-01T09:00',
      'FREQ=DAILY;UNTIL=20270103T090000Z',
    )

    expect(monthly.map((date) => date.toISOString().slice(0, 10))).toEqual([
      '2027-01-31',
      '2027-03-31',
      '2027-05-31',
      '2027-07-31',
    ])
    expect(until).toHaveLength(3)
    expect(until[2]?.toISOString()).toBe('2027-01-03T09:00:00.000Z')
  })

  it('rejects unbounded, unsupported and over-horizon rules', () => {
    expect(validateRRule('FREQ=DAILY')).not.toBeNull()
    expect(validateRRule('FREQ=YEARLY;COUNT=3')).not.toBeNull()
    expect(
      validateRRule('FREQ=DAILY;INTERVAL=2;COUNT=365', '2027-01-01T09:00'),
    ).not.toBeNull()
    expect(
      validateRRule('FREQ=DAILY;UNTIL=20280102T090000Z', '2027-01-01T09:00'),
    ).not.toBeNull()
  })
})
