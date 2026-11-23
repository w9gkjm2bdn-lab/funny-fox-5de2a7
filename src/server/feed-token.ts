import { createHmac, timingSafeEqual } from 'node:crypto'
import { getPushKeys } from './push.js'

// The calendar feed holds customer names, addresses and phone numbers, so it
// needs a secret key in its URL. The key is derived from the push private key,
// which lives only in Netlify env vars or the database — never in the repo.
export async function calendarFeedToken() {
  const { privateKey } = await getPushKeys()
  return createHmac('sha256', privateKey).update('calendar-feed-v1').digest('base64url').slice(0, 32)
}

export async function isValidFeedToken(candidate: string | null) {
  if (!candidate) return false
  const expected = Buffer.from(await calendarFeedToken())
  const given = Buffer.from(candidate)
  return given.length === expected.length && timingSafeEqual(given, expected)
}
