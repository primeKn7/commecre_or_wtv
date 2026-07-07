export function calculateDuration(startDateTime, endDateTime) {
  const start = new Date(startDateTime)
  const end = new Date(endDateTime)
  const diffMs = end - start
  return Math.max(0, diffMs / (1000 * 60 * 60))
}
