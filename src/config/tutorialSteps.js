/**
 * Returns localized tutorial steps
 * @param {Function} t - i18n translation function
 * @returns {Array}
 */
export function getTutorialSteps(t) {
  return [
    {
      selector: '#viewport',
      title: t('tutorialSteps.tutorial.viewport.title'),
      text: t('tutorialSteps.tutorial.viewport.text'),
      position: 'top-in',
    },
    {
      selector: '#tools-panel',
      title: t('tutorialSteps.tutorial.toolsPanel.title'),
      text: t('tutorialSteps.tutorial.toolsPanel.text'),
      position: 'right',
    },
    {
      selector: '#tool-settings',
      title: t('tutorialSteps.tutorial.toolSettings.title'),
      text: t('tutorialSteps.tutorial.toolSettings.text'),
      position: 'left',
    },
    {
      selector: '#top-panel-left',
      title: t('tutorialSteps.tutorial.topPanelLeft.title'),
      text: t('tutorialSteps.tutorial.topPanelLeft.text'),
      position: 'bottom',
    },
    {
      selector: '#top-panel-center',
      title: t('tutorialSteps.tutorial.topPanelCenter.title'),
      text: t('tutorialSteps.tutorial.topPanelCenter.text'),
      position: 'bottom',
    },
    {
      selector: '#top-panel-right',
      title: t('tutorialSteps.tutorial.topPanelRight.title'),
      text: t('tutorialSteps.tutorial.topPanelRight.text'),
      position: 'bottom',
    },
    {
      selector: '#export-tool',
      title: t('tutorialSteps.tutorial.exportTool.title'),
      text: t('tutorialSteps.tutorial.exportTool.text'),
      position: 'right',
    },
  ]
}
