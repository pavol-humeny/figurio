import { globalConfig } from '@/config/globalConfig'

export const uiConfig = {
  // Clickable button effect
  enableClickEffects: true,
  clickEffectScale: 0.95,

  // Theme
  theme: globalConfig.defaultTheme,

  // Key Shortcuts
  keyShortcutsEnabled: true,

  // Right Panel
  rightPanelOpen: true,
  rightPanelDefaultWidth: 300,
  rightPanelWidth: 300,
  rightPanelMinWidth: 300,
  rightPanelMaxWidth: 600,
  collapseButtonWidth: 30,

  // SVG Objects List
  svgObjectsListHeight: 30, // %
  svgObjectsListDefaultHeight: 30, // %
  svgObjectsListMinHeight: 20, // %
  svgObjectsListMaxHeight: 70, // %

  // Rulers
  rulersEnabled: false,

  // Toast
  // Auto remove time
  toastAutoRemoveTime: 6000, // 6 seconds
}
