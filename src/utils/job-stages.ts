// The order a job normally moves through. "Completed" jobs drop into the Archive.
export const JOB_STAGES = ['Pending', 'Measure booked', 'Quote sent', 'Fitting booked', 'In progress', 'Completed'] as const

export function nextStage(status: string) {
  const i = JOB_STAGES.indexOf(status as (typeof JOB_STAGES)[number])
  if (i === -1) return 'Measure booked'
  return JOB_STAGES[i + 1] ?? null
}
