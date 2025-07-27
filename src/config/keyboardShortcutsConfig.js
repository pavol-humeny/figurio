export const keyboardShortcuts = [
  // History shortcuts
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
  // Zoom shortcuts
  {
    keys: ['ctrl', '='],
    action: 'zoomIn',
    description: 'Zoom in',
  },
  { keys: ['ctrl', '-'], action: 'zoomOut', description: 'Zoom out' },
  { keys: ['ctrl', '0'], action: 'resetZoom', description: 'Reset zoom' },
  // File management shortcuts
  {
    keys: ['ctrl', 'o'],
    action: 'uploadFile',
    description: 'Upload file',
  },
  {
    keys: ['ctrl', 's'],
    action: 'openExportToolSettings',
    description: 'Save file',
  },
  {
    keys: ['ctrl', 'x'],
    action: 'closeFile',
    description: 'Close file',
  },
  {
    keys: ['f2'],
    action: 'startEditing',
    description: 'Rename file',
  },
  // Help, settings, and privacy shortcuts
  {
    keys: ['f1'],
    action: 'openHelpModal',
    description: 'Show help modal',
  },
  {
    keys: ['ctrl', ','],
    action: 'openSettingsPanel',
    description: 'Show settings modal',
  },
  {
    keys: ['ctrl', 'i'],
    action: 'openPrivacyAndDataModal',
    description: 'Show privacy and data modal',
  },
  // Tool shortcuts
  {
    keys: ['v'],
    action: 'toggleTool',
    args: ['move', null],
    description: 'Toggle move tool',
  },
  {
    keys: ['r'],
    action: 'toggleTool',
    args: ['transform', 'rotate'],
    description: 'Toggle transform - rotate tool',
  },
  {
    keys: ['f'],
    action: 'toggleTool',
    args: ['transform', 'flip'],
    description: 'Toggle transform - flip tool',
  },
  {
    keys: ['c'],
    action: 'toggleTool',
    args: ['transform', 'crop'],
    description: 'Toggle transform - crop tool',
  },
  {
    keys: ['shift', 'r'],
    action: 'toggleTool',
    args: ['transform', 'resize'],
    description: 'Toggle transform - resize tool',
  },
  {
    keys: ['shift', 'c'],
    action: 'toggleTool',
    args: ['smartCrop', null],
    description: 'Toggle smart crop tool',
  },
  {
    keys: ['g'],
    action: 'toggleTool',
    args: ['grayscale', null],
    description: 'Toggle grayscale tool',
  },
  {
    keys: ['shift', 'f'],
    action: 'toggleTool',
    args: ['frame', null],
    description: 'Toggle frame tool',
  },
  {
    keys: ['p'],
    action: 'toggleTool',
    args: ['preset', 'myPresets'],
    description: 'Toggle preset - my presets tool',
  },
  {
    keys: ['shift', 'p'],
    action: 'toggleTool',
    args: ['preset', 'createPreset'],
    description: 'Toggle preset - create preset tool',
  },
  {
    keys: ['t'],
    action: 'toggleTool',
    args: ['text', null],
    description: 'Toggle text tool',
  },
  {
    keys: ['m'],
    action: 'toggleTool',
    args: ['magnifyArea', null],
    description: 'Toggle magnify area tool',
  },
  {
    keys: ['b'],
    action: 'toggleTool',
    args: ['blur', null],
    description: 'Toggle blur tool',
  },
  {
    keys: ['h'],
    action: 'toggleTool',
    args: ['highlight', null],
    description: 'Toggle highlight tool',
  },

  // Multi-file management shortcuts
  // switch to next/previous file
  {
    keys: ['alt', 'pagedown'],
    action: 'switchToNextTab',
    description: 'Switch to next tab',
  },
  {
    keys: ['alt', 'pageup'],
    action: 'switchToPreviousTab',
    description: 'Switch to previous tab',
  },

  // Tutorial shortcuts
  {
    keys: ['arrowright'],
    action: 'nextStep',
    description: 'Next step in tutorial',
  },
  {
    keys: ['arrowleft'],
    action: 'prevStep',
    description: 'Previous step in tutorial',
  },
  {
    keys: ['enter'],
    action: 'finishTutorial',
    description: 'Finish tutorial',
  },
  {
    keys: ['escape'],
    action: 'closeTutorial',
    description: 'Close (pause) tutorial',
  },
]
