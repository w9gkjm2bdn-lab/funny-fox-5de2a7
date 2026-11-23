import test from 'node:test'
import assert from 'node:assert/strict'
import { nextAppointment, formatAppointmentDate } from '../src/utils/next-appointment.ts'
import { stageStyle } from '../src/utils/job-stages.ts'

test('picks the soonest upcoming measure or fitting', () => {
  assert.deepEqual(nextAppointment('2026-11-25T10:00', '2026-11-27, 2026-11-28', '2026-11-23'), { kind: 'Measure', value: '2026-11-25T10:00' })
  assert.deepEqual(nextAppointment('2026-11-20', '2026-11-28, 2026-11-27T09:00', '2026-11-23'), { kind: 'Fitting', value: '2026-11-27T09:00' })
  assert.equal(nextAppointment('2026-11-01', '', '2026-11-23'), null)
  assert.equal(nextAppointment(null, null, '2026-11-23'), null)
})
test('formats dates in a friendly way', () => {
  assert.equal(formatAppointmentDate('2026-11-23T08:30', '2026-11-23'), 'Today · 08:30')
  assert.equal(formatAppointmentDate('2026-11-24', '2026-11-23'), 'Tomorrow')
  assert.equal(formatAppointmentDate('2026-11-27T09:00', '2026-11-23'), 'Fri 27 Nov · 09:00')
})
test('every stage has its own colour, old "Pending" matches New enquiry', () => {
  const stripes = ['New enquiry', 'Measure booked', 'Quote sent', 'Fitting booked', 'In progress', 'Completed'].map(s => stageStyle(s).stripe)
  assert.equal(new Set(stripes).size, 6)
  assert.deepEqual(stageStyle('Pending'), stageStyle('New enquiry'))
})
