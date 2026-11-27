import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { reminderWindow } from '../src/server/reminder-time.ts'

// The function's schedule is a literal in its config, so read it from the file.
const source = readFileSync(new URL('../netlify/functions/job-reminders.mts', import.meta.url), 'utf8')
const cron = /schedule:\s*'([^']+)'/.exec(source)[1]
const [minute, hour] = cron.split(' ')
const hours = hour.split(',').map(Number)
const every = Number(minute.replace('*/', ''))

test('the schedule runs only in a few hours of the day', () => {
  assert.ok(hours.length <= 4, `runs in ${hours.length} hours`)
})

test('every reminder slot in a year (both clock changes) gets several runs', () => {
  const start = Date.UTC(2026, 0, 1)
  for (let day = 0; day < 365; day++) {
    for (const kind of ['today', 'tomorrow']) {
      let runs = 0
      for (let h = 0; h < 24; h++) {
        if (!hours.includes(h)) continue
        for (let m = 0; m < 60; m += every) {
          const w = reminderWindow(new Date(start + day * 86400000 + h * 3600000 + m * 60000))
          if (w && w.kind === kind) runs++
        }
      }
      assert.ok(runs >= 6, `day ${day} ${kind}: only ${runs} runs`)
    }
  }
})
