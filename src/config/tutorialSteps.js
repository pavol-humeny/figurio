import { useImageStore } from '@/stores/imageStore'
/**
 * Returns localized tutorial steps
 * @param {Function} t - i18n translation function
 * @returns {Array}
 */
export function getTutorialSteps(router, t) {
  const imageStore = useImageStore()

  const steps = [
    // 0
    {
      selector: '#drag-drop-area',
      title: t('tutorialSteps.tutorial.dragDropArea.title'),
      text: t('tutorialSteps.tutorial.dragDropArea.text'),
      position: 'top-in',
    },
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
      position: 'bottom',
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
      position: 'bottom',
    },
    // 7
    {
      selector: '#export-tool',
      title: t('tutorialSteps.tutorial.exportTool.title'),
      text: t('tutorialSteps.tutorial.exportTool.text'),
      position: 'right',
    },
  ]

  console.log('111111111111111111111111111', router.currentRoute.value.name)

  if (router.currentRoute.value.name === 'home') {
    // Return steps for drag and drop ()
    console.log(
      'Returning steps for drag and drop',
      steps.filter((_, index) => [0].includes(index)),
    )

    

    return steps.filter((_, index) => [0].includes(index))
  } else if (imageStore.isImageLoaded) {
    // Return steps for editor with image loaded
    console.log(
      'Returning steps for editor with image loaded, steps: ',
      steps.filter((_, index) => [1, 2, 3, 4, 5, 6, 7].includes(index)),
    )
    return steps.filter((_, index) => [1, 2, 3, 4, 5, 6, 7].includes(index))
  } else if (!imageStore.isImageLoaded) {
    // Return steps for editor without image loaded
    console.log(
      'Returning steps for editor without image loaded: ',
      steps.filter((_, index) => [2, 4, 5, 6].includes(index)),
    )
    return steps.filter((_, index) => [2, 4, 5, 6].includes(index))
  }
}
