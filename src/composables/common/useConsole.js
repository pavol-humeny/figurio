/**
 * @file: useConsole.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Custom console wrapper that respects the settings defined in globalConfig. Provides log, warn, and error methods that can be toggled.
 */
import { globalConfig } from '@/config/globalConfig'

/**
 * Checks if the app is running on localhost
 * @returns {boolean} True if running on localhost, false otherwise
 */
const isLocalhost = () => {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
}

/**
 * Custom console wrapper that respects the settings
 */
export function useConsole() {
  if (globalConfig.console.printOnLocalhostOnly && !isLocalhost()) {
    return {
      log: () => {},
      warn: () => {},
      error: () => {},
    }
  }

  const log = (...args) => {
    if (globalConfig.console.log) console.log(...args)
  }

  const warn = (...args) => {
    if (globalConfig.console.warn) console.warn(...args)
  }

  const error = (...args) => {
    if (globalConfig.console.error) console.error(...args)
  }

  return {
    log,
    warn,
    error,
  }
}
