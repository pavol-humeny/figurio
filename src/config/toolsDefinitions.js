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
  },
  {
    key: 'smartCrop',
    iconName: 'IconSmartCropTool',
    settingsComponent: () => import('@/components/toolsSettings/SmartCropToolSettings.vue'),
  },
  {
    key: 'grayScale',
    iconName: 'IconGrayScaleTool',
    settingsComponent: () => import('@/components/toolsSettings/GrayScaleToolSettings.vue'),
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
  },
  {
    key: 'export',
    iconName: 'IconExportTool',
    // settingsComponent: () => import('@/components/toolsSettings/ExportToolSettings.vue')
  },
]
