/**
 * @file: tutorialSteps.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: This module defines the tutorial steps for the application. It exports a function `getTutorialSteps` that takes an i18n translation function as an argument and returns an array of tutorial step objects. Each step object contains a CSS selector for the target element, a title and text for the tutorial tooltip, and a position for where the tooltip should appear relative to the target element.
 */
/**
 * Returns localized tutorial steps
 * @param {Function} t - i18n translation function
 * @returns {Array}
 */
export function getTutorialSteps(t) {
  // Position options: top, bottom, right, left, top-left, top-right, bottom-left, bottom-right, left-in, right-in, top-in, bottom-in
  const steps = [
    // 1
    {
      selector: '#viewport',
      title: t('tutorialSteps.tutorial.viewport.title'),
      text: t('tutorialSteps.tutorial.viewport.text'),
      position: 'top-in',
    },
    // 2
    {
      selector: '#tools-panel',
      title: t('tutorialSteps.tutorial.toolsPanel.title'),
      text: t('tutorialSteps.tutorial.toolsPanel.text'),
      position: 'right',
    },
    // 3
    {
      selector: '#tool-settings',
      title: t('tutorialSteps.tutorial.toolSettings.title'),
      text: t('tutorialSteps.tutorial.toolSettings.text'),
      position: 'left',
    },
    // 4
    {
      selector: '#top-panel-left',
      title: t('tutorialSteps.tutorial.topPanelLeft.title'),
      text: t('tutorialSteps.tutorial.topPanelLeft.text'),
      position: 'bottom-right',
    },
    // 5
    {
      selector: '#top-panel-center',
      title: t('tutorialSteps.tutorial.topPanelCenter.title'),
      text: t('tutorialSteps.tutorial.topPanelCenter.text'),
      position: 'bottom',
    },
    // 6
    {
      selector: '#top-panel-right',
      title: t('tutorialSteps.tutorial.topPanelRight.title'),
      text: t('tutorialSteps.tutorial.topPanelRight.text'),
      position: 'bottom-left',
    },
    // 7
    {
      selector: '#export-tool',
      title: t('tutorialSteps.tutorial.exportTool.title'),
      text: t('tutorialSteps.tutorial.exportTool.text'),
      position: 'bottom',
    },
  ]
  return steps
}
