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
        label: 'Rotate',
        tip: 'Rotate the image.',
        iconName: 'IconRotateTool',
      },
      {
        key: 'flip',
        label: 'Flip',
        tip: 'Flip the image horizontally or vertically.',
        iconName: 'IconFlipTool',
      },
      {
        key: 'crop',
        label: 'Crop',
        tip: 'Crop the image.',
        iconName: 'IconCropTool',
      },
    ],
  },
  {
    key: 'smartCrop',
    iconName: 'IconSmartCropTool',
    settingsComponent: () => import('@/components/toolsSettings/SmartCropToolSettings.vue'),
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
  },
  {
    key: 'export',
    iconName: 'IconExportTool',
    // settingsComponent: () => import('@/components/toolsSettings/ExportToolSettings.vue')
  },
]
