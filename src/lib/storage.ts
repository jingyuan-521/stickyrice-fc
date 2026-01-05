// Browser localStorage helpers

const LAST_NAME_KEY = 'sticky_rice_fc_last_name'

/**
 * Save the last used player name to localStorage
 */
export function saveLastName(name: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LAST_NAME_KEY, name)
  }
}

/**
 * Get the last used player name from localStorage
 */
export function getLastName(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(LAST_NAME_KEY)
  }
  return null
}

/**
 * Clear the stored name
 */
export function clearLastName(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LAST_NAME_KEY)
  }
}

/**
 * Check if the current user is logged in as admin
 */
export function isAdmin(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_auth') === 'true'
  }
  return false
}
