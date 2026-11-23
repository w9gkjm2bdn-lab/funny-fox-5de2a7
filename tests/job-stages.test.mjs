import test from 'node:test'
import assert from 'node:assert/strict'
import { nextStage } from '../src/utils/job-stages.ts'

test('jobs move one stage forward, stopping at Completed', () => {
  assert.equal(nextStage('New enquiry'), 'Measure booked')
  assert.equal(nextStage('Pending'), 'Measure booked')
  assert.equal(nextStage('Measure booked'), 'Quote sent')
  assert.equal(nextStage('Quote sent'), 'Fitting booked')
  assert.equal(nextStage('Fitting booked'), 'In progress')
  assert.equal(nextStage('In progress'), 'Completed')
  assert.equal(nextStage('Completed'), null)
  assert.equal(nextStage('Something odd'), 'Measure booked')
})
