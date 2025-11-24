import { onMounted, onBeforeUnmount } from 'vue'
import { keyboardShortcuts } from '@/config/keyboardShortcutsConfig'
import { useConsole } from '@/composables/common/useConsole.js'
const { log } = useConsole()
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()

/**
 * Logic for handling global keyboard shortcuts
 *
 * @param {Record<string, (...args: any[]) => void>} actions - Action handlers mapped by shortcut name
 * @param {ReturnType<typeof import('@/stores/uiStore').useUiStore>} uiStore - UI store with shortcut settings
 * @param {ReturnType<typeof import('@/stores/editorStore').useEditorStore>} editorStore - Editor store
 */
export function useKeyboardShortcuts(actions, uiStore, editorStore) {
  /**
   * Normalize a keyboard event into a string representation
   *
   * @param {KeyboardEvent} event - The keyboard event to normalize
   * @returns {string} Normalized key combination (e.g., 'ctrl+z')
   */
  const normalizeKey = (event) => {
    const keys = []
    if (event.ctrlKey || event.metaKey) keys.push('ctrl')
    if (event.altKey) keys.push('alt')
    if (event.shiftKey) keys.push('shift')

    let mainKey = event.key.toLowerCase()
    const specialKeysMap = { ' ': 'space' }
    if (specialKeysMap[mainKey]) mainKey = specialKeysMap[mainKey]

    if (!['control', 'shift', 'alt', 'meta'].includes(mainKey)) {
      keys.push(mainKey)
    }

    return keys.join('+')
  }

  /**
   * Handle keyboard events and trigger corresponding actions
   *
   * @param {KeyboardEvent} event - The keyboard event
   * @param {string} type - The type of event ('keydown' or 'keyup')
   */
  const handleKeyEvent = (event, type = 'keydown') => {
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
      const expectedType = shortcut.type || 'keydown' // default type

      // log(`[Shortcut] ${pressed} → ${shortcut.description}`)

      if (pressed === expected && type === expectedType) {
        event.preventDefault()
        event.stopImmediatePropagation()

        const fn = actions[shortcut.action]
        if (typeof fn === 'function') {
          if (uiStore.isTutorialRunning) {
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
          log(`[Shortcut] ${type.toUpperCase()} → ${shortcut.description}`)

          if (type === 'keyup') {
            addUserEvent('keyboardShortcuts', {
              action: shortcut.action,
              keys: pressed,
            })
          }
        }
      }
    }
  }

  // Persistent references for event listeners
  const handleKeydown = (e) => handleKeyEvent(e, 'keydown')
  const handleKeyup = (e) => handleKeyEvent(e, 'keyup')

  // Register global listeners on mount
  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('keyup', handleKeyup)
  })

  // Clean up listeners on unmount
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('keyup', handleKeyup)
  })
}
