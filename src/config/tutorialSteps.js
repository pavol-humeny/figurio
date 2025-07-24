/**
 * Returns localized tutorial steps
 * @param {Function} t - i18n translation function
 * @returns {Array}
 */
export function getTutorialSteps(t) {
  return [
    {
      selector: '#ahoj',
      title: t('tutorialSteps.tutorial.ahoj.title'),
      text: t('tutorialSteps.tutorial.ahoj.text'),
      position: 'right',
    },
    {
      selector: '#ahoj2',
      title: t('tutorialSteps.tutorial.ahoj2.title'),
      text: t('tutorialSteps.tutorial.ahoj2.text'),
      position: 'bottom',
    },
  ]
}
