import { globalConfig } from '@/config/globalConfig'

/**
 * Custom console wrapper that respects the settings
 */
export function useConsole() {
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
