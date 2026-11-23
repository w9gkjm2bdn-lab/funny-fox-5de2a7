// Sign-in throttling: after too many failed attempts inside the window, further
// attempts are refused until the oldest of them ages out.
export const LOGIN_WINDOW_MS = 15 * 60 * 1000
export const MAX_FAILURES_PER_USERNAME = 5
export const MAX_FAILURES_PER_IP = 20

// `recent` is the most recent failures (newest first, at most `max` of them).
// Returns how long until another attempt is allowed, or 0 if allowed now.
export function lockoutRemainingMs(recent: Date[], max: number, now: number) {
  if (recent.length < max) return 0
  const unlockAt = recent[max - 1].getTime() + LOGIN_WINDOW_MS
  return Math.max(0, unlockAt - now)
}

export function lockoutMessage(remainingMs: number) {
  const minutes = Math.max(1, Math.ceil(remainingMs / 60000))
  return `Too many sign-in attempts. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`
}
