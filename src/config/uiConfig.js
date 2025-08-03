import { globalConfig } from '@/config/globalConfig'

export const uiConfig = {
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

  // Rulers
  rulersEnabled: true,

  // Toast
  // Auto remove time
  toastAutoRemoveTime: 6000, // 6 seconds
}
