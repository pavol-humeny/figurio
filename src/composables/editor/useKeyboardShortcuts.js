import { onMounted, onBeforeUnmount } from 'vue'
import { keyboardShortcuts } from '@/config/keyboardShortcutsConfig'

export function useKeyboardShortcuts(actions) {
  const normalizeKey = (e) => {
    const keys = []
    if (e.ctrlKey || e.metaKey) keys.push('ctrl') // support macOS
    if (e.shiftKey) keys.push('shift')
    if (e.altKey) keys.push('alt')
    keys.push(e.key.toLowerCase())
    return keys.join('+')
  }

  const handleKeydown = (e) => {
    const el = document.activeElement
    const isTyping =
      el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))
    if (isTyping) return

    const pressed = normalizeKey(e)

    for (const shortcut of keyboardShortcuts) {
      const expected = shortcut.keys.map((k) => k.toLowerCase()).join('+')
      if (pressed === expected) {
        e.preventDefault()
        e.stopImmediatePropagation()
        const fn = actions[shortcut.action]
        if (typeof fn === 'function') {
          fn(...(shortcut.args || []))
          console.log(`[Shortcut] ${shortcut.description}`)
        }
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
}
