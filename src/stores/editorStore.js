import { editorConfig } from '@/config/editorConfig'
import { globalConfig } from '@/config/globalConfig'
import { defineStore } from 'pinia'
import { useUserModeStore } from './userModeStore'

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
 * Retrieves an array from localStorage.
 * Returns the fallback if parsing fails or the key is not set.
 *
 * @param {string} key - The localStorage key to read from.
 * @param {Array} [fallback=[]] - The default value if the key is not set or parsing fails.
 * @returns {Array} The parsed array value.
 */
const getArray = (key, fallback = []) => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

/**
 * Check if a tool is enabled based on global config and user mode
 * @param {string} toolKey - Key of the tool to check
 * @returns {boolean} - Whether the tool is enabled
 */
const toolIsEnabled = (toolKey) => {
  const userModeStore = useUserModeStore()
  if (userModeStore.hasUserAccessToFeature('blockedTools')) {
    return true
  } else {
    return globalConfig.featureFlags.enableTools[toolKey] === true
  }
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

    /** Whether any SVG object is currently being manipulated */
    isSvgObjectManipulating: false,

    /** Whether any SVG object is currently being drawn */
    isSvgObjectDrawing: false,

    /** Whether an image can be pasted */
    imageCanBePasted: false,

    /** Whether tools are enabled */
    // UPDATE new tool
    enableTools: {
      crop: toolIsEnabled('crop'),
      frame: toolIsEnabled('frame'),
      grayscale: toolIsEnabled('grayscale'),
      backgroundRemoval: toolIsEnabled('backgroundRemoval'),
      brush: toolIsEnabled('brush'),
      select: toolIsEnabled('select'),
      autoCrop: toolIsEnabled('autoCrop'),
      blur: toolIsEnabled('blur'),
      shape: toolIsEnabled('shape'),
      text: toolIsEnabled('text'),
      magnifyArea: toolIsEnabled('magnifyArea'),
      transform: toolIsEnabled('transform'),
      preset: toolIsEnabled('preset'),
      export: toolIsEnabled('export'),
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
        removalHighlightColor: editorConfig.removalHighlightColor,
        brushSize: editorConfig.defaultManualToolSize,
      },
      grayscale: {
        type: 'luminance', // 'luminance', 'average', 'lightness'
      },
      crop: {
        isVisibleCropBox: true,
      },
      shape: {
        fillEnabled: false,
        fillColor: '#000000',
        strokeWidth: 1,
        strokeColor: '#000000',
        opacity: 1,
        cornerRadius: 0,
        lineType: 'solid',
        lineArrowEnd: 'none',
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
        isEraserMode: false,
        color: '#000000',
        brushSize: editorConfig.defaultManualToolSize,
      },
      frame: {
        enabled: false,
        type: 'none',
        useMillimeters: false,
        width: 0,
        height: 0,
        widthMm: 0,
        heightMm: 0,
        color: '#000000',
        headerSize: 0, // Size of the header for browser frames
        headerSizeMm: 0, // Size of the header for browser frames in mm
        footerSize: 0, // Size of the footer for windows frame
        footerSizeMm: 0, // Size of the footer for windows frame in mm
        outlineEnabled: false, // Whether to draw an outline around the frame
        phoneFrameOrientation: 'portrait', // Orientation of the phone frame
        phoneOutlineEnabled: false, // Whether to draw an outline around phone frames
        phoneOutlineColor: '#000000', // Color of the phone frame outline
        phoneOutlineSize: 'small', // Size of the phone frame outline
        phoneHeaderIconsSize: 'large', // Size of the phone header icons
        phoneBatteryIconStyle: 'style3', // Style of the phone battery icon
        phoneHeaderEnabled: true, // Whether to draw a header for phone frames
        phoneHeaderExpand: false, // Whether header expands beyond image
        phoneButtonsEnabled: true, // Whether to draw buttons for phone frames
        phoneNavigationEnabled: true, // Whether to draw navigation for phone frames
        phoneHeaderTimeInMinutes: 610, // Default time for phone header (10:10)
        phoneHeaderTextColor: '#000000', // Default text color for phone header
        phoneHeaderBackgroundColor: '#ffffff', // Default background color for phone header
        modificationFlag: 1, // Flag to track frame modifications
      },
    },

    /** Whether any modal is open */
    isModalOpenFlag: false,

    recentColors: getArray(`${globalConfig.LOCAL_STORAGE_PREFIX}recentColors`, []),

    /**
     * Random events state
     * UPDATE new random event
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
      fireworks: getBoolean(
        `${globalConfig.LOCAL_STORAGE_PREFIX}randomEvent_fireworks`,
        globalConfig.randomEvents.fireworks,
      ),
      fireworks2: getBoolean(
        `${globalConfig.LOCAL_STORAGE_PREFIX}randomEvent_fireworks2`,
        globalConfig.randomEvents.fireworks2,
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

    /**
     * Add color to recent colors and persist to localStorage
     * @param {string} color
     */
    addRecentColor(color) {
      if (!color) return

      // Remove duplicates
      this.recentColors = this.recentColors.filter((c) => c !== color)

      // Add to front
      this.recentColors.unshift(color)

      // Limit length
      if (this.recentColors.length > editorConfig.maxRecentColors) {
        this.recentColors.length = editorConfig.maxRecentColors
      }

      // Persist (SAME STYLE as keyShortcutsEnabled)
      localStorage.setItem(
        `${globalConfig.LOCAL_STORAGE_PREFIX}recentColors`,
        JSON.stringify(this.recentColors),
      )
    },

    /**
     * Remove color from recent colors and persist to localStorage
     * @param {string} color
     */
    removeRecentColor(color) {
      if (!color) return

      this.recentColors = this.recentColors.filter((c) => c !== color)

      localStorage.setItem(
        `${globalConfig.LOCAL_STORAGE_PREFIX}recentColors`,
        JSON.stringify(this.recentColors),
      )
    },
  },
})
