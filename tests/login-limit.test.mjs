import test from 'node:test'
import assert from 'node:assert/strict'
import { lockoutRemainingMs, lockoutMessage, LOGIN_WINDOW_MS } from '../src/server/login-limit.ts'

const now = Date.parse('2026-11-23T12:00:00Z')
const minsAgo = m => new Date(now - m * 60000)

test('allows sign-in below the failure limit', () => {
  assert.equal(lockoutRemainingMs([], 5, now), 0)
  assert.equal(lockoutRemainingMs([1, 2, 3, 4].map(minsAgo), 5, now), 0)
})
test('locks until the oldest counted failure leaves the window', () => {
  assert.equal(lockoutRemainingMs([1, 2, 3, 4, 10].map(minsAgo), 5, now), LOGIN_WINDOW_MS - 10 * 60000)
  assert.equal(lockoutRemainingMs([1, 2, 3, 4, 16].map(minsAgo), 5, now), 0)
})
test('message rounds up to whole minutes', () => {
  assert.equal(lockoutMessage(30000), 'Too many sign-in attempts. Please try again in 1 minute.')
  assert.equal(lockoutMessage(5 * 60000 + 1), 'Too many sign-in attempts. Please try again in 6 minutes.')
})
