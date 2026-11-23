import test from 'node:test'
import assert from 'node:assert/strict'
import { greetingName, nextFittingDate, fittingMessage, whatsappHref, smsHref } from '../src/utils/customer-message.ts'

test('greets by first name, keeping a title with the surname', () => {
  assert.equal(greetingName('Sarah Jones'), 'Sarah')
  assert.equal(greetingName('  sarah  '), 'sarah')
  assert.equal(greetingName('Mrs Smith'), 'Mrs Smith')
  assert.equal(greetingName('Mr. J Patel'), 'Mr. Patel')
  assert.equal(greetingName(''), '')
})
test('picks the next upcoming fitting date and ignores times', () => {
  assert.equal(nextFittingDate('2026-11-20, 2026-11-28T09:00, 2026-11-27', '2026-11-23'), '2026-11-27')
  assert.equal(nextFittingDate('2026-11-23T08:00', '2026-11-23'), '2026-11-23')
  assert.equal(nextFittingDate('2026-11-01', '2026-11-23'), null)
  assert.equal(nextFittingDate(null, '2026-11-23'), null)
})
test('message has first name and day but no time', () => {
  assert.equal(fittingMessage('Sarah Jones', '2026-11-27'),
    'Hi Sarah, just confirming your fitting on Friday 27th November. If you have any questions before then, just let us know. Thanks')
  assert.match(fittingMessage('Tom', '2026-12-01'), /Tuesday 1st December/)
  assert.match(fittingMessage('Tom', '2026-12-12'), /Saturday 12th December/)
})
test('builds WhatsApp and SMS links for UK numbers', () => {
  assert.equal(whatsappHref('07700 900123', 'Hi'), 'https://wa.me/447700900123?text=Hi')
  assert.equal(whatsappHref('+44 7700 900123', 'Hi'), 'https://wa.me/447700900123?text=Hi')
  assert.equal(smsHref('07700 900123', 'Hi there'), 'sms:07700900123?&body=Hi%20there')
})
