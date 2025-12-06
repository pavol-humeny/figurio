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

  // Zoom modes
  {
    keys: ['alt', 'c'],
    action: 'toggleZoomMode',
    args: ['classic'],
    description: 'Set zoom mode to classic',
  },
  {
    keys: ['alt', 'p'],
    action: 'toggleZoomMode',
    args: ['physical'],
    description: 'Set zoom mode to physical',
  },

  // Ui
  {
    keys: ['ctrl', 'b'],
    action: 'toggleCollapsiblePanel',
    description: 'Toggle collapsible panel',
  },

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
    keys: ['ctrl', 'k'],
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
    keys: ['shift', 'm'],
    action: 'toggleTool',
    args: ['move', null],
    description: 'Toggle move tool',
  },
  {
    keys: ['v'],
    action: 'toggleTool',
    args: ['select', null],
    description: 'Toggle select tool',
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
    args: ['crop', null],
    description: 'Toggle crop tool',
  },
  {
    keys: ['shift', 'r'],
    action: 'toggleTool',
    args: ['transform', 'resize'],
    description: 'Toggle transform - resize tool',
  },
  {
    keys: ['g'],
    action: 'toggleTool',
    args: ['grayscale', null],
    description: 'Toggle grayscale tool',
  },
  {
    keys: ['shift', 'c'],
    action: 'toggleTool',
    args: ['darkLightConvertor', null],
    description: 'Toggle dark/light convertor tool',
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
    keys: ['shift', 'b'],
    action: 'toggleTool',
    args: ['blur', null],
    description: 'Toggle blur tool',
  },
  {
    keys: ['s'],
    action: 'toggleTool',
    args: ['shape', null],
    description: 'Toggle shape tool',
  },
  {
    keys: ['shift', 'm'],
    action: 'toggleTool',
    args: ['backgroundRemoval', null],
    description: 'Toggle background removal tool',
  },
  {
    keys: ['b'],
    action: 'toggleTool',
    args: ['brush', 'brush'],
    description: 'Toggle brush tool',
  },
  {
    keys: ['e'],
    action: 'toggleTool',
    args: ['brush', 'eraser'],
    description: 'Toggle eraser tool',
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

  // Modal closing shortcut
  {
    keys: ['escape'],
    action: 'closeHelpModal',
    description: 'Close help modal',
  },
  {
    keys: ['escape'],
    action: 'closePrivacyAndDataModal',
    description: 'Close privacy and data modal',
  },
  {
    keys: ['escape'],
    action: 'closeFeatureTourModal',
    description: 'Close feature tour modal',
  },
  {
    keys: ['escape'],
    action: 'closeSettingsPanel',
    description: 'Close settings panel',
  },
  {
    keys: ['escape'],
    action: 'closeCalibrationModal',
    description: 'Close calibration modal',
  },
  {
    keys: ['escape'],
    action: 'closeImportModal',
    description: 'Close import modal',
  },
  {
    keys: ['escape'],
    action: 'closeReleaseModal',
    description: 'Close release modal',
  },
  {
    keys: ['escape'],
    action: 'closeExportToolSettings',
    description: 'Close export tool settings modal',
  },
  {
    keys: ['enter'],
    action: 'exportFile',
    description: 'Export file',
  },

  // Tools control shortcuts
  // Svg object operations
  {
    keys: ['delete'],
    action: 'deleteSelectedSvgObjects',
    description: 'Delete selected SVG object',
  },
  {
    keys: ['shift', 'arrowup'],
    action: 'moveSelectedSvgObjectForward',
    description: 'Move selected SVG object forward',
  },
  {
    keys: ['shift', 'arrowdown'],
    action: 'moveSelectedSvgObjectBackward',
    description: 'Move selected SVG object backward',
  },
  // Global movement of selected SVG object
  {
    keys: ['arrowleft'],
    action: 'moveObjectLeftGlobal',
    description: 'Move selected SVG object left by 1px',
  },
  {
    keys: ['arrowright'],
    action: 'moveObjectRightGlobal',
    description: 'Move selected SVG object right by 1px',
  },
  {
    keys: ['arrowup'],
    action: 'moveObjectUpGlobal',
    description: 'Move selected SVG object up by 1px',
  },
  {
    keys: ['arrowdown'],
    action: 'moveObjectDownGlobal',
    description: 'Move selected SVG object down by 1px',
  },
  // Local movement of selected SVG object
  {
    keys: ['alt', 'arrowleft'],
    action: 'moveObjectLeftLocal',
    description: 'Move selected SVG object left by 10px',
  },
  {
    keys: ['alt', 'arrowright'],
    action: 'moveObjectRightLocal',
    description: 'Move selected SVG object right by 10px',
  },
  {
    keys: ['alt', 'arrowup'],
    action: 'moveObjectUpLocal',
    description: 'Move selected SVG object up by 10px',
  },
  {
    keys: ['alt', 'arrowdown'],
    action: 'moveObjectDownLocal',
    description: 'Move selected SVG object down by 10px',
  },
  // Copy and paste SVG object
  {
    keys: ['ctrl', 'c'],
    action: 'copySelectedSvgObject',
    description: 'Copy selected SVG object',
  },
  {
    keys: ['ctrl', 'v'],
    action: 'pasteSvgObjectToCenter',
    description: 'Paste copied SVG object to center',
  },
  // Duplicate selected SVG object
  {
    keys: ['ctrl', 'd'],
    action: 'duplicateSelectedSvgObject',
    description: 'Duplicate selected SVG object',
  },
  // Cut
  {
    keys: ['ctrl', 'x'],
    action: 'cutSelectedSvgObject',
    description: 'Cut selected SVG object',
  },

  // Crop tool
  {
    keys: ['space'],
    action: 'hideCropBox',
    description: 'Hide crop box',
  },
  {
    keys: ['space'],
    action: 'showCropBox',
    description: 'Show crop box',
    type: 'keyup',
  },
  {
    keys: ['enter'],
    action: 'applyCrop',
    description: 'Apply crop',
  },

  // Background removal tool
  {
    keys: ['delete'],
    action: 'applyBackgroundRemovalRender',
    description: 'Delete background based on current selection',
  },
]
