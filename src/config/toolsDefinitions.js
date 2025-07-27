export const toolsDefinitions = [
  {
    key: 'move',
    iconName: 'IconMoveTool',
    settingsComponent: () => import('@/components/toolsSettings/MoveToolSettings.vue'),
  },
  {
    key: 'transform',
    iconName: 'IconTransformTool',
    settingsComponent: () => import('@/components/toolsSettings/TransformToolSettings.vue'),
    subTools: [
      {
        key: 'rotate',
        iconName: 'IconRotateTool',
      },
      {
        key: 'flip',
        iconName: 'IconFlipVertical',
      },
      {
        key: 'crop',
        iconName: 'IconCropTool',
      },
      {
        key: 'resize',
        iconName: 'IconResizeTool',
      },
    ],
  },
  {
    key: 'smartCrop',
    iconName: 'IconSmartCropTool',
    settingsComponent: () => import('@/components/toolsSettings/SmartCropToolSettings.vue'),
    subTools: [
      {
        key: 'auto',
        iconName: 'IconAutoSmartCropTool',
      },
      {
        key: 'manual',
        iconName: 'IconManualSmartCropTool',
      },
    ],
  },
  {
    key: 'grayscale',
    iconName: 'IconGrayscaleTool',
    settingsComponent: () => import('@/components/toolsSettings/GrayscaleToolSettings.vue'),
  },
  {
    key: 'blur',
    iconName: 'IconBlurTool',
    settingsComponent: () => import('@/components/toolsSettings/BlurToolSettings.vue'),
    subTools: [
      {
        key: 'add',
        iconName: 'IconPlus',
      },
      {
        key: 'modify',
        iconName: 'IconModify',
      },
    ],
  },
  {
    key: 'highlight',
    iconName: 'IconHighlightTool',
    settingsComponent: () => import('@/components/toolsSettings/HighlightToolSettings.vue'),
    subTools: [
      {
        key: 'add',
        iconName: 'IconPlus',
      },
      {
        key: 'modify',
        iconName: 'IconModify',
      },
    ],
  },
  {
    key: 'text',
    iconName: 'IconTextTool',
    settingsComponent: () => import('@/components/toolsSettings/TextToolSettings.vue'),
    subTools: [
      {
        key: 'add',
        iconName: 'IconPlus',
      },
      {
        key: 'modify',
        iconName: 'IconModify',
      },
    ],
  },
  {
    key: 'magnifyArea',
    iconName: 'IconMagnifyAreaTool',
    settingsComponent: () => import('@/components/toolsSettings/MagnifyAreaToolSettings.vue'),
    subTools: [
      {
        key: 'add',
        iconName: 'IconPlus',
      },
      {
        key: 'modify',
        iconName: 'IconModify',
      },
    ],
  },
  {
    key: 'frame',
    iconName: 'IconFrameTool',
    settingsComponent: () => import('@/components/toolsSettings/FrameToolSettings.vue'),
  },
  {
    key: 'preset',
    iconName: 'IconPresetTool',
    settingsComponent: () => import('@/components/toolsSettings/PresetToolSettings.vue'),
    subTools: [
      {
        key: 'myPresets',
        iconName: 'IconMyPresetsTool',
      },
      {
        key: 'createPreset',
        iconName: 'IconPlus',
      },
    ],
  },
  {
    key: 'export',
    iconName: 'IconExportTool',
    // settingsComponent: () => import('@/components/toolsSettings/ExportToolSettings.vue')
  },
]
