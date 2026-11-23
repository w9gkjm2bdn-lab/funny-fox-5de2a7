import test from 'node:test'
import assert from 'node:assert/strict'
import { sortByNextAppointment, jobMatchesSearch } from '../src/utils/job-list.ts'

const job = (name, extra = {}) => ({ customerName: name, site: '', whatsRequired: '', ...extra })

test('soonest upcoming appointment first, then the rest in their existing order', () => {
  const jobs = [
    job('No dates A'),
    job('Fitting Fri', { fittingDate: '2026-11-27T08:00' }),
    job('Past only', { measuredBooked: '2026-11-01' }),
    job('Measure tomorrow', { measuredBooked: '2026-11-24T10:00' }),
    job('No dates B'),
  ]
  assert.deepEqual(sortByNextAppointment(jobs, '2026-11-23').map(j => j.customerName),
    ['Measure tomorrow', 'Fitting Fri', 'No dates A', 'Past only', 'No dates B'])
})
test('search is case-insensitive and finds phone numbers typed without spaces', () => {
  const j = job('Sarah Jones', { customerPhone: '07700 900123', site: '14 Elm Road' })
  assert.ok(jobMatchesSearch(j, 'sarah'))
  assert.ok(jobMatchesSearch(j, 'ELM'))
  assert.ok(jobMatchesSearch(j, '07700900123'))
  assert.ok(jobMatchesSearch(j, '900 123'))
  assert.ok(jobMatchesSearch(j, '  '))
  assert.ok(!jobMatchesSearch(j, 'patel'))
  assert.ok(!jobMatchesSearch(j, '555'))
})
