// Utility functions

/**
 * Get the upcoming Monday (or current Monday if game hasn't happened yet)
 * Used to identify "this week's game"
 *
 * Logic:
 * - If today is Mon-Wed: show this week's Monday
 * - If today is Thu-Sun: show next week's Monday
 */
export function getCurrentMonday(): string {
  const today = new Date()
  const day = today.getDay() // 0 = Sunday, 1 = Monday, etc.

  let diff: number

  // If Thursday (4) or later, show next Monday
  if (day >= 4) {
    diff = 8 - day // Days until next Monday
  }
  // If Sunday (0), also show next Monday
  else if (day === 0) {
    diff = 1 // Tomorrow is Monday
  }
  // Otherwise (Mon-Wed), show this week's Monday
  else {
    diff = 1 - day // Days back to this Monday (could be 0)
  }

  const monday = new Date(today)
  monday.setDate(today.getDate() + diff)
  return monday.toISOString().split('T')[0] // YYYY-MM-DD
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format time for display
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Check if current time is past lock time
 */
export function isPastLockTime(lockTime: string): boolean {
  return new Date() > new Date(lockTime)
}

/**
 * Get game status display text
 */
export function getGameStatus(playerCount: number): string {
  if (playerCount >= 10) return 'Game On! 🎉'
  if (playerCount >= 7) return 'Almost there!'
  return 'Need more players'
}
