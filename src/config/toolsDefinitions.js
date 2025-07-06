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
  // {
  //   key: 'adjust',
  //   iconName: 'IconAdjustTool',
  //   settingsComponent: () => import('@/components/toolsSettings/AdjustToolSettings.vue'),
  // },
  // {
  //   key: 'annotate',
  //   iconName: 'IconAnnotateTool',
  //   settingsComponent: () => import('@/components/toolsSettings/AnnotateToolSettings.vue'),
  // },
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
