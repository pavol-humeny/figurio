import { editorConfig } from '@/config/editorConfig'
import { globalConfig } from '@/config/globalConfig'
import { defineStore } from 'pinia'

/**
 * Retrieves a boolean value from localStorage.
 * Returns `false` only if the stored value is the string `'false'`, otherwise returns the fallback.

 *
 * @param {string} key - The localStorage key to read from.
 * @param {boolean} [fallback=true] - The default value if the key is not set.
 * @returns {boolean} The parsed boolean value.
 */
const getBoolean = (key, fallback = true) => {
  const value = localStorage.getItem(key)
  return value === 'false' ? false : value === 'true' ? true : fallback
}

/**
 * State and actions for managing editor tool selection, subtools, and active tabs
 */
export const useEditorStore = defineStore('editorStore', {
  state: () => ({
    /** Currently selected main tool key */
    selectedToolKey: editorConfig.defaultToolKey,

    /** Mapping of selected tab per tool key */
    selectedTabPerTool: {},

    /** Currently selected subtool key */
    selectedSubToolKey: '',

    /** Key of the tool that has open subtools */
    toolWithOpenSubToolsKey: '',

    /** Whether any SVG object is currently being resized */
    isSvgObjectResizing: false,

    /** Whether any SVG object is currently being drawn */
    isSvgObjectDrawing: false,

    /** Whether an image can be pasted */
    imageCanBePasted: false,

    /** Whether tools are enabled */
    // UPDATE new tool
    enableTools: {
      crop: globalConfig.featureFlags.enableTools.crop,
      backgroundRemoval: globalConfig.featureFlags.enableTools.backgroundRemoval,
      brush: globalConfig.featureFlags.enableTools.brush,
      select: globalConfig.featureFlags.enableTools.select,
      transform: globalConfig.featureFlags.enableTools.transform,
      autoCrop: globalConfig.featureFlags.enableTools.autoCrop,
      grayscale: globalConfig.featureFlags.enableTools.grayscale,
      blur: globalConfig.featureFlags.enableTools.blur,
      shape: globalConfig.featureFlags.enableTools.shape,
      text: globalConfig.featureFlags.enableTools.text,
      magnifyArea: globalConfig.featureFlags.enableTools.magnifyArea,
      frame: globalConfig.featureFlags.enableTools.frame,
      preset: globalConfig.featureFlags.enableTools.preset,
      export: globalConfig.featureFlags.enableTools.export,
    },

    /** Key of the previously selected tool - use for transition between select tool and svg object tools */
    previousToolKey: '',

    /** Whether a global click event is registered */
    isGlobalClickRegistered: false,

    /** Whether a export modal is open  */
    isExportModalOpen: false,

    /** Whether the cursor is currently being resized */
    isCursorResizing: false,

    /** Size of the custom cursor (for brush/eraser) */
    cursorSize: editorConfig.defaultManualToolSize,

    /** Tools config values */
    toolsConfig: {
      backgroundRemoval: {
        replaceWithBackgroundColor: false,
        backgroundColor: '#ffffff',
      },
      grayscale: {
        type: 'luminance', // 'luminance', 'average', 'lightness'
      },
      crop: {
        isVisibleCropBox: true,
      },
      shape: {
        fillEnabled: true,
        fillColor: '#000000',
        strokeWidth: 0,
        strokeColor: '#000000',
        opacity: 1,
        cornerRadius: 0,
        lineType: 'solid',
        lineArrowStart: 'none',
      },
      text: {
        size: 16,
        color: '#000000',
        fontFamily: 'Helvetica',
        opacity: 1,
        letterSpacing: 0,
        bold: false,
        italic: false,
        underline: false,
      },
      magnifyArea: {
        type: 'center',
        radius: 0,
        zoom: 2,
        outlineWidth: 1,
        outlineColor: '#000000',
      },
      blur: {
        blurStrength: 5,
        edgeFade: 10,
      },
      brush: {
        color: '#000000',
      },
    },

    /** Whether any modal is open */
    isModalOpenFlag: false,
    
    /**
     * Random events state
     */
    randomEvents: {
      snowfall: getBoolean(
        `${globalConfig.LOCAL_STORAGE_PREFIX}randomEvent_snowfall`,
        globalConfig.randomEvents.snowfall,
      ),
      christmasLights: getBoolean(
        `${globalConfig.LOCAL_STORAGE_PREFIX}randomEvent_christmasLights`,
        globalConfig.randomEvents.christmasLights,
      ),
      christmasTree: getBoolean(
        `${globalConfig.LOCAL_STORAGE_PREFIX}randomEvent_christmasTree`,
        globalConfig.randomEvents.christmasTree,
      ),
    },
  }),
  actions: {
    /**
     * Select main tool
     * @param {string} toolKey - Key of the selected tool
     */
    selectTool(toolKey) {
      this.selectedToolKey = toolKey
    },

    /**
     * Select active tab for the current tool
     * @param {string} tabKey - Key of the selected tab
     */
    selectTab(tabKey) {
      if (this.selectedToolKey) {
        this.selectedTabPerTool[this.selectedToolKey] = tabKey
      }
    },

    /**
     * Select a subtool
     * @param {string} subToolKey - Key of the selected subtool
     */
    selectSubTool(subToolKey) {
      this.selectedSubToolKey = subToolKey
    },

    /**
     * Set which tool has its subtools panel open
     * @param {string} toolKey - Tool key with open subtools
     */
    setToolWithOpenSubTools(toolKey) {
      this.toolWithOpenSubToolsKey = toolKey
    },

    /**
     * Turn on a random event
     * @param {string} eventKey - Key of the random event
     */
    turnOnRandomEvent(eventKey) {
      if (eventKey in this.randomEvents) {
        this.randomEvents[eventKey] = true
        localStorage.setItem(`${globalConfig.LOCAL_STORAGE_PREFIX}randomEvent_${eventKey}`, 'true')
      }
    },

    /**
     * Turn off a random event
     * @param {string} eventKey - Key of the random event
     */
    turnOffRandomEvent(eventKey) {
      if (eventKey in this.randomEvents) {
        this.randomEvents[eventKey] = false
        localStorage.setItem(`${globalConfig.LOCAL_STORAGE_PREFIX}randomEvent_${eventKey}`, 'false')
      }
    },
  },
})
