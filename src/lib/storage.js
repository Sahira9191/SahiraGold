/**
 * Shared localStorage helpers for the entire admin.
 * Every section that needs persistence uses these.
 */

const PREFIX = 'sg_'

export function lsGet(key, fallback) {
  try {
    const v = localStorage.getItem(PREFIX + key)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}

export function lsSet(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {}
}
