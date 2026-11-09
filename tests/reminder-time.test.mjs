import test from 'node:test'
import assert from 'node:assert/strict'
import { reminderWindow, scheduledDates } from '../src/server/reminder-time.ts'

test('winter reminders use UK local time', () => {
  assert.deepEqual(reminderWindow(new Date('2026-11-09T18:20:00Z')), { date: '2026-11-10', kind: 'tomorrow' })
  assert.deepEqual(reminderWindow(new Date('2026-11-10T07:10:00Z')), { date: '2026-11-10', kind: 'today' })
  assert.equal(reminderWindow(new Date('2026-11-10T08:00:00Z')), null)
})
test('summer reminders account for British Summer Time', () => {
  assert.deepEqual(reminderWindow(new Date('2026-07-01T17:00:00Z')), { date: '2026-07-02', kind: 'tomorrow' })
  assert.deepEqual(reminderWindow(new Date('2026-07-02T06:00:00Z')), { date: '2026-07-02', kind: 'today' })
})
test('DST transitions and year rollover preserve calendar dates', () => {
  assert.deepEqual(reminderWindow(new Date('2026-03-29T06:00:00Z')), { date: '2026-03-29', kind: 'today' })
  assert.deepEqual(reminderWindow(new Date('2026-10-25T07:00:00Z')), { date: '2026-10-25', kind: 'today' })
  assert.deepEqual(reminderWindow(new Date('2026-12-31T18:00:00Z')), { date: '2027-01-01', kind: 'tomorrow' })
})
test('multiple fitting dates and measuring times are preserved', () => {
  assert.deepEqual(scheduledDates('2026-11-10T09:30, 2026-11-11, invalid'), ['2026-11-10T09:30', '2026-11-11'])
  assert.deepEqual(scheduledDates(null), [])
})
