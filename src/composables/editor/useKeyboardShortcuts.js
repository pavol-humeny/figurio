import { onMounted, onBeforeUnmount } from 'vue'
import { keyboardShortcuts } from '@/config/keyboardShortcutsConfig'

/**
 * Logic for handling global keyboard shortcuts
 *
 * @param {Record<string, (...args: any[]) => void>} actions - Action handlers mapped by shortcut name
 * @param {ReturnType<typeof import('@/stores/uiStore').useUiStore>} uiStore - UI store with shortcut settings
 * @param {ReturnType<typeof import('@/stores/editorStore').useEditorStore>} editorStore - Editor store
 */
export function useKeyboardShortcuts(actions, uiStore, editorStore) {
  /**
   * Normalize pressed keys into string format (e.g., "ctrl+shift+s")
   *
   * @param {KeyboardEvent} event - Keyboard event
   * @returns {string} - Normalized key combination
   */
  const normalizeKey = (event) => {
    const keys = []

    if (event.ctrlKey || event.metaKey) keys.push('ctrl')
    if (event.altKey) keys.push('alt')
    if (event.shiftKey) keys.push('shift')

    // Get the main key pressed (not modifier)
    const mainKey = event.key.toLowerCase()

    // Skip if it's just a modifier
    if (!['control', 'shift', 'alt', 'meta'].includes(mainKey)) {
      keys.push(mainKey)
    }

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
    const isImagePaste =
      event.key.toLowerCase() === 'v' &&
      (event.ctrlKey || event.metaKey) &&
      editorStore.imageCanBePasted

    if (isTyping || isImagePaste) return

    const pressed = normalizeKey(event)

    for (const shortcut of keyboardShortcuts) {
      const expected = shortcut.keys.map((k) => k.toLowerCase()).join('+')
      // console.log(`[Shortcut] Pressed: ${pressed}, Expected: ${expected}`)
      if (pressed === expected) {
        event.preventDefault()
        event.stopImmediatePropagation()
        const fn = actions[shortcut.action]
        if (typeof fn === 'function') {
          // console.log('fn:', fn.name, 'args:', shortcut.args)
          if (uiStore.isTutorialRunning) {
            // If in tutorial mode, only allow specific actions
            if (
              fn.name !== 'nextStep' &&
              fn.name !== 'prevStep' &&
              fn.name !== 'closeTutorial' &&
              fn.name !== 'finishTutorial'
            ) {
              return
            }
          }

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
