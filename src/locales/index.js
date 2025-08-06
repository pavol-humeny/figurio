import { globalConfig } from '@/config/globalConfig'

import enTopPanel from './en/topPanel.json'
import skTopPanel from './sk/topPanel.json'
import czTopPanel from './cz/topPanel.json'

import enPrivacy from './en/privacy.json'
import skPrivacy from './sk/privacy.json'
import czPrivacy from './cz/privacy.json'

import enDragAndDropArea from './en/dragAndDropArea.json'
import skDragAndDropArea from './sk/dragAndDropArea.json'
import czDragAndDropArea from './cz/dragAndDropArea.json'

import enImageStore from './en/imageStore.json'
import skImageStore from './sk/imageStore.json'
import czImageStore from './cz/imageStore.json'

import enTools from './en/tools.json'
import skTools from './sk/tools.json'
import czTools from './cz/tools.json'

import enHelp from './en/help.json'
import skHelp from './sk/help.json'
import czHelp from './cz/help.json'

import enTutorialSteps from './en/tutorialSteps.json'
import skTutorialSteps from './sk/tutorialSteps.json'
import czTutorialSteps from './cz/tutorialSteps.json'

import enMaintenance from './en/maintenance.json'
import skMaintenance from './sk/maintenance.json'
import czMaintenance from './cz/maintenance.json'

import enContextMenu from './en/contextMenu.json'
import skContextMenu from './sk/contextMenu.json'
import czContextMenu from './cz/contextMenu.json'

/**
 * Language-specific localization data for i18n
 */
const allLocales = {
  en: {
    topPanel: enTopPanel,
    privacy: enPrivacy,
    dragAndDropArea: enDragAndDropArea,
    imageStore: enImageStore,
    tools: enTools,
    help: enHelp,
    tutorialSteps: enTutorialSteps,
    maintenance: enMaintenance,
    contextMenu: enContextMenu,
  },
  sk: {
    topPanel: skTopPanel,
    privacy: skPrivacy,
    dragAndDropArea: skDragAndDropArea,
    imageStore: skImageStore,
    tools: skTools,
    help: skHelp,
    tutorialSteps: skTutorialSteps,
    maintenance: skMaintenance,
    contextMenu: skContextMenu,
  },
  cz: {
    topPanel: czTopPanel,
    privacy: czPrivacy,
    dragAndDropArea: czDragAndDropArea,
    imageStore: czImageStore,
    tools: czTools,
    help: czHelp,
    tutorialSteps: czTutorialSteps,
    maintenance: czMaintenance,
    contextMenu: czContextMenu,
  },
}

/**
 * Filter according to supported languages in globalConfig
 */
const enabledLocales = {}
for (const lang of globalConfig.supportedLanguages) {
  if (allLocales[lang]) {
    enabledLocales[lang] = allLocales[lang]
  }
}

export default enabledLocales
