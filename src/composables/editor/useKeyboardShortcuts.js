import { onMounted, onBeforeUnmount } from 'vue'
import { keyboardShortcuts } from '@/config/keyboardShortcutsConfig'

/**
 * Logic for handling global keyboard shortcuts
 *
 * @param {Record<string, (...args: any[]) => void>} actions - Action handlers mapped by shortcut name
 * @param {ReturnType<typeof import('@/stores/uiStore').useUiStore>} uiStore - UI store with shortcut settings
 * @param {ReturnType<typeof import('@/stores/imageStore').useImageStore>} imageStore - Image store
 */
export function useKeyboardShortcuts(actions, uiStore, imageStore) {
  /**
   * Normalize pressed keys into string format (e.g., "ctrl+shift+s")
   *
   * @param {KeyboardEvent} event - Keyboard event
   * @returns {string} - Normalized key combination
   */
  const normalizeKey = (event) => {
    const keys = []
    if (event.ctrlKey || event.metaKey) keys.push('ctrl') // support macOS
    if (event.shiftKey) keys.push('shift')
    if (event.altKey) keys.push('alt')
    keys.push(event.key.toLowerCase())
    return keys.join('+')
  }

  /**
   * Handle keydown event, match shortcut, and call corresponding action
   *
   * @param {KeyboardEvent} event - Keyboard event
   */
  const handleKeydown = (event) => {
    if (!uiStore.keyShortcutsEnabled || uiStore.isLoading) return

    const el = document.activeElement
    const isTyping =
      el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))
    if (isTyping) return

    const pressed = normalizeKey(event)

    for (const shortcut of keyboardShortcuts) {
      const expected = shortcut.keys.map((k) => k.toLowerCase()).join('+')
      // console.log(`[Shortcut] Pressed: ${pressed}, Expected: ${expected}`)
      if (pressed === expected) {
        event.preventDefault()
        event.stopImmediatePropagation()
        const fn = actions[shortcut.action]
        if (typeof fn === 'function') {
          fn(...(shortcut.args || []))
          console.log(`[Shortcut] ${shortcut.description}`)
        }
      }
    }
  }

  // Register global keydown event on mount
  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  // Clean up event listener on unmount
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
}
