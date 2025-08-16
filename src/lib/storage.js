export const load = (key, fallback = null) => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export const save = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // ignore write errors
  }
}
