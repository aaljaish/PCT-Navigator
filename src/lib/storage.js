export const storage = {
  get(key, fallback = null) {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : fallback
    } catch {
      return fallback
    }
  },

  set(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch {
      // ignore write errors
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key)
    } catch {
      // ignore write errors
    }
  }
}
