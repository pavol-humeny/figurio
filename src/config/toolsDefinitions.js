export const toolsDefinitions = [
  // {
  //   key: 'move',
  //   iconName: 'IconMoveTool',
  //   settingsComponent: () => import('@/components/toolsSettings/MoveToolSettings.vue'),
  // },
  {
    key: 'crop',
    iconName: 'IconCropTool',
    settingsComponent: () => import('@/components/toolsSettings/CropToolSettings.vue'),
  },
  {
    key: 'frame',
    iconName: 'IconFrameTool',
    settingsComponent: () => import('@/components/toolsSettings/FrameToolSettings.vue'),
  },
  {
    key: 'grayscale',
    iconName: 'IconGrayscaleTool',
    settingsComponent: () => import('@/components/toolsSettings/GrayscaleToolSettings.vue'),
  },
  {
    key: 'select',
    iconName: 'IconSelectTool',
    settingsComponent: () => import('@/components/toolsSettings/SelectToolSettings.vue'),
  },
  {
    key: 'blur',
    iconName: 'IconBlurTool',
    settingsComponent: () => import('@/components/toolsSettings/BlurToolSettings.vue'),
  },
  {
    key: 'shape',
    iconName: 'IconShapeTool',
    settingsComponent: () => import('@/components/toolsSettings/ShapeToolSettings.vue'),
    subTools: [
      {
        key: 'rectangle',
        iconName: 'IconRectangle',
      },
      {
        key: 'ellipse',
        iconName: 'IconEllipse',
      },
      {
        key: 'line',
        iconName: 'IconLine',
      },
    ],
  },
  {
    key: 'text',
    iconName: 'IconTextTool',
    settingsComponent: () => import('@/components/toolsSettings/TextToolSettings.vue'),
  },
  {
    key: 'magnifyArea',
    iconName: 'IconMagnifyAreaTool',
    settingsComponent: () => import('@/components/toolsSettings/MagnifyAreaToolSettings.vue'),
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
        key: 'resize',
        iconName: 'IconResizeTool',
      },
    ],
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
