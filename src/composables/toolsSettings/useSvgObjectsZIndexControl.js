/**
 * @file: useSvgObjectsZIndexControl.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Composable for controlling the Z-index of SVG objects in the magnify area, blur area, and SVG tools, including logic for moving selected objects forward/backward and sending them to front/back based on the current tool and selection.
 */
import { useSvgObjects } from '@/composables/tools/useSvgObjects'
import { computed } from 'vue'

/**
 * Composable for controlling the Z-index of SVG objects in the magnify area, blur area, and SVG tools
 * @param {Object} props - Props containing the type of tool ('magnify', 'blur', 'svg')
 * @param {Object} imageStore - Store managing image state and SVG objects
 * @param {Object} historyStore - Store managing undo/redo history
 * @param {Object} viewportStore - Store managing viewport state
 * @param {Object} editorStore - Store managing editor state
 * @param {Object} uiStore - Store managing UI state
 * @param {Object} workspaceStore - Store managing workspace state
 * @param {Function} t - Translation function from vue-i18n for logging purposes
 */
export function useSvgObjectsZIndexControl(
  props,
  imageStore,
  historyStore,
  viewportStore,
  editorStore,
  uiStore,
  workspaceStore,
  t,
) {
  /**
   * Logic for moving selected SVG objects
   */
  const {
    moveSelectedObjectForward,
    moveSelectedObjectBackward,
    sendSelectedObjectToBack,
    bringSelectedObjectToFront,
  } = useSvgObjects(
    imageStore,
    historyStore,
    viewportStore,
    editorStore,
    uiStore,
    workspaceStore,
    t,
  )

  /**
   * Whether to show the Z-index control buttons based on the current tool and selection
   */
  const isZIndexControlVisible = computed(() => {
    return (
      imageStore.bringToFrontButtonEnabled(props.type) ||
      imageStore.moveForwardButtonEnabled(props.type) ||
      imageStore.moveBackwardButtonEnabled(props.type) ||
      imageStore.sendToBackButtonEnabled(props.type)
    )
  })

  /**
   * Function to move the selected SVG object one step forward in the Z-index order
   */
  const moveObjectForward = () => {
    switch (props.type) {
      case 'magnify':
        moveSelectedObjectForward(t, 'magnify')
        break
      case 'blur':
        moveSelectedObjectForward(t, 'blur')
        break
      case 'svg':
        moveSelectedObjectForward(t, 'svg')
        break
    }
  }

  /**
   * Function to move the selected SVG object one step backward in the Z-index order
   */
  const moveObjectBackward = () => {
    switch (props.type) {
      case 'magnify':
        moveSelectedObjectBackward(t, 'magnify')
        break
      case 'blur':
        moveSelectedObjectBackward(t, 'blur')
        break
      case 'svg':
        moveSelectedObjectBackward(t, 'svg')
        break
    }
  }

  /**
   * Function to send the selected SVG object to the back of the Z-index order
   */
  const sendObjectToBack = () => {
    switch (props.type) {
      case 'magnify':
        sendSelectedObjectToBack(t, 'magnify')
        break
      case 'blur':
        sendSelectedObjectToBack(t, 'blur')
        break
      case 'svg':
        sendSelectedObjectToBack(t, 'svg')
        break
    }
  }

  /**
   * Function to bring the selected SVG object to the front of the Z-index order
   */
  const bringObjectToFront = () => {
    switch (props.type) {
      case 'magnify':
        bringSelectedObjectToFront(t, 'magnify')
        break
      case 'blur':
        bringSelectedObjectToFront(t, 'blur')
        break
      case 'svg':
        bringSelectedObjectToFront(t, 'svg')
        break
    }
  }

  /**
   * Whether the "bring to front" button should be visible based on the current tool and selection
   */
  const bringObjectToFrontVisible = computed(() => {
    switch (props.type) {
      case 'magnify':
        return imageStore.bringToFrontButtonEnabled('magnify')
      case 'blur':
        return imageStore.bringToFrontButtonEnabled('blur')
      case 'svg':
        return imageStore.bringToFrontButtonEnabled('svg')
      default:
        return false
    }
  })

  /**
   * Whether the "move forward" button should be visible based on the current tool and selection
   */
  const moveObjectForwardVisible = computed(() => {
    switch (props.type) {
      case 'magnify':
        return imageStore.moveForwardButtonEnabled('magnify')
      case 'blur':
        return imageStore.moveForwardButtonEnabled('blur')
      case 'svg':
        return imageStore.moveForwardButtonEnabled('svg')
      default:
        return false
    }
  })

  /**
   * Whether the "move backward" button should be visible based on the current tool and selection
   */
  const moveObjectBackwardVisible = computed(() => {
    switch (props.type) {
      case 'magnify':
        return imageStore.moveBackwardButtonEnabled('magnify')
      case 'blur':
        return imageStore.moveBackwardButtonEnabled('blur')
      case 'svg':
        return imageStore.moveBackwardButtonEnabled('svg')
      default:
        return false
    }
  })

  /**
   * Whether the "send to back" button should be visible based on the current tool and selection
   */
  const sendObjectToBackVisible = computed(() => {
    switch (props.type) {
      case 'magnify':
        return imageStore.sendToBackButtonEnabled('magnify')
      case 'blur':
        return imageStore.sendToBackButtonEnabled('blur')
      case 'svg':
        return imageStore.sendToBackButtonEnabled('svg')
      default:
        return false
    }
  })

  /**
   * Whether the "move forward" button should be enabled based on whether the selected object is already at the front of the Z-index order
   */
  const moveObjectForwardEnabled = computed(() => {
    switch (props.type) {
      case 'magnify':
        return !imageStore.isMaxZIndexOfSelectedObject('magnify')
      case 'blur':
        return !imageStore.isMaxZIndexOfSelectedObject('blur')
      case 'svg':
        return !imageStore.isMaxZIndexOfSelectedObject('svg')
      default:
        return false
    }
  })

  /**
   * Whether the "move backward" button should be enabled based on whether the selected object is already at the back of the Z-index order
   */
  const moveObjectBackwardEnabled = computed(() => {
    switch (props.type) {
      case 'magnify':
        return !imageStore.isMinZIndexOfSelectedObject('magnify')
      case 'blur':
        return !imageStore.isMinZIndexOfSelectedObject('blur')
      case 'svg':
        return !imageStore.isMinZIndexOfSelectedObject('svg')
      default:
        return false
    }
  })

  return {
    isZIndexControlVisible,
    bringObjectToFront,
    moveObjectForward,
    moveObjectBackward,
    sendObjectToBack,
    bringObjectToFrontVisible,
    moveObjectForwardVisible,
    moveObjectBackwardVisible,
    sendObjectToBackVisible,
    moveObjectForwardEnabled,
    moveObjectBackwardEnabled,
  }
}
