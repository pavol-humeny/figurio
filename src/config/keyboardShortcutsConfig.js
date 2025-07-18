export const keyboardShortcuts = [
  {
    keys: ['ctrl', 'z'],
    action: 'undo',
    description: 'Undo last action',
  },
  {
    keys: ['ctrl', 'y'],
    action: 'redo',
    description: 'Redo last undone action',
  },
  // zoom shortcuts
  {
    keys: ['ctrl', '='],
    action: 'zoomIn',
    description: 'Zoom in',
  },
  { keys: ['ctrl', '-'], action: 'zoomOut', description: 'Zoom out' },
  { keys: ['ctrl', '0'], action: 'resetZoom', description: 'Reset zoom' },
]
