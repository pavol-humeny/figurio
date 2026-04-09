/**
 * @file: useMagnifyAreaTool.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Composable for managing the magnify area tool in the editor, including logic for adding magnify areas, updating their settings, and ensuring that they are rendered correctly on the canvas.
 */
import { editorConfig } from '@/config/editorConfig'
import { ref, computed, watch, watchEffect, onMounted, nextTick } from 'vue'
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()
import { useConfirmModal } from '../modals/useConfirmModal'
import { useImagePipeline } from '../editor/useImagePipeline'

/**
 * Magnify area settings
 */
const localMagnifyAreaSettings = ref({
  positionX: 0,
  positionY: 0,
  radius: 0, // displayed radius
  zoom: 2,
  outlineWidth: 1,
  outlineColor: '#000000',
})

export function useMagnifyAreaTool(imageStore, historyStore, editorStore, uiStore, t) {
  const { showConfirmModal } = useConfirmModal()
  const { renderUpTo } = useImagePipeline(imageStore, uiStore)

  const activeObject = ref(null)
  const hidePositionAndDimensions = ref(true)

  /**
   * X and Y positions
   */
  const maxMagnifyAreaSourcePositionX = computed(() => {
    return imageStore.fileDimensions.width - localMagnifyAreaSettings.value.radius
  })

  const maxMagnifyAreaSourcePositionY = computed(() => {
    return imageStore.fileDimensions.height - localMagnifyAreaSettings.value.radius
  })

  /**
   * Maximum allowed radius based on the smaller image dimension to ensure the magnify area fits within the image boundaries
   */
  const maxMagnifyAreaRadius = computed(() => {
    const smaller = imageStore.getSmallerImageDimension()
    return Math.floor(smaller / 2)
  })

  /**
   * Maximum allowed outline width based on the magnify area radius to ensure the outline does not exceed the size of the magnify area itself
   */
  const maxOutlineWidth = computed(() => {
    return Math.max(Math.floor(localMagnifyAreaSettings.value.radius / 2), 1)
  })

  /**
   * Options for magnify area zoom levels
   */
  const magnifyAreaZoomOptions = [
    { value: 2, label: '2x' },
    { value: 3, label: '3x' },
    { value: 4, label: '4x' },
  ]

  /**
   * Saves the current magnify area settings to the editor store configuration so that they persist across tool activations and can be used as defaults for new magnify areas.
   */
  const saveConfigToEditorStore = () => {
    for (const key in editorStore.toolsConfig.magnifyArea) {
      if (key in localMagnifyAreaSettings.value) {
        editorStore.toolsConfig.magnifyArea[key] = localMagnifyAreaSettings.value[key]
      }
    }
  }

  /**
   * Watch for changes in the selected SVG object
   */
  watch(
    () => imageStore.selectedSvgObjectId,
    async (newId) => {
      if (newId === null) {
        activeObject.value = null
        hidePositionAndDimensions.value = true
        return
      }

      await nextTick()

      const obj = imageStore.getSvgObjectById(newId)
      if (!obj || obj.class !== 'magnifyArea') return

      activeObject.value = obj
      hidePositionAndDimensions.value = false

      localMagnifyAreaSettings.value.positionX = obj.attrs.cx
      localMagnifyAreaSettings.value.positionY = obj.attrs.cy
      localMagnifyAreaSettings.value.radius = obj.attrs.rx
      localMagnifyAreaSettings.value.outlineWidth = obj.attrs['stroke-width'] || 1
      localMagnifyAreaSettings.value.outlineColor = obj.attrs.stroke || '#000'
      localMagnifyAreaSettings.value.zoom = obj.magnify?.zoom || obj.attrs['data-magnify-zoom'] || 2
    },
    { immediate: true },
  )

  /**
   * Watch for changes in the active magnify area object
   */
  watchEffect(() => {
    const obj = activeObject.value
    if (!obj || editorStore.selectedToolKey !== 'magnifyArea') return
    if (obj.class !== 'magnifyArea') return

    localMagnifyAreaSettings.value.positionX = obj.attrs.cx
    localMagnifyAreaSettings.value.positionY = obj.attrs.cy
  })


  /**
   * Apply local settings on magnify area object
   * @param {boolean} commit - Whether to commit the changes to history
   */
  const applyLocalMagnifyAreaSettings = (commit = true) => {
    const obj = activeObject.value
    if (!obj || obj.class !== 'magnifyArea') return

    const s = localMagnifyAreaSettings.value

    obj.attrs.cx = s.positionX
    obj.attrs.cy = s.positionY
    obj.attrs.rx = s.radius
    obj.attrs.ry = s.radius
    obj.attrs.stroke = s.outlineColor
    obj.attrs['stroke-width'] = s.outlineWidth
    obj.attrs.fill = 'transparent'
    obj.attrs['fill-opacity'] = 0

    if (!obj.magnify) obj.magnify = {}
    obj.magnify.zoom = s.zoom
    obj.attrs['data-magnify-zoom'] = s.zoom

    if (commit) {
      addUserEvent('applyOperation', {
        tool: 'magnifyArea',
        settings: { ...s },
      })

      saveConfigToEditorStore()
      historyStore.push(imageStore.getSnapshot(t))
    }

    imageStore.magnifyOverlayNeedToBeRendered = true
  }

  /**
   * Adds a new magnify area object
   * @param {number} x - X coordinate for the center of the magnify area
   * @param {number} y - Y coordinate for the center of the magnify area
   */
  const addMagnifyArea = async (x, y) => {
    let confirmNeeded = false

    // SVG objects rasterization
    if (imageStore.needRasterizationForMagnifyArea) {
      confirmNeeded = true
      const confirmed = await showConfirmModal(
        t('tools.confirmNeedRasterization.title'),
        t('tools.confirmNeedRasterization.message'),
        t('tools.confirmNeedRasterization.cancel'),
        t('tools.confirmNeedRasterization.confirm'),
      )
      if (confirmed) {
        const result = await imageStore.rasterize('editor', {}, t)

        imageStore.addImageOperation({
          type: 'rasterize',
          params: {
            overlay: result.overlay,
          },
          cost: 'high',
          affectsGeometry: true,
        })

        addUserEvent('applyOperation', {
          tool: 'rasterize',
          settings: {},
        })

        await renderUpTo(imageStore.renderPipeline.currentOpIndex + 1, { t, imageStore })

        // Push to undo history
        historyStore.push(imageStore.getSnapshot(t))
      }
    }

    // Base image rasterization
    if (imageStore.fileType === 'pdf') {
      confirmNeeded = true
      const confirmed = await showConfirmModal(
        t('tools.confirmNeedBaseImageRasterization.title'),
        t('tools.confirmNeedBaseImageRasterization.message'),
        t('tools.confirmNeedBaseImageRasterization.cancel'),
        t('tools.confirmNeedBaseImageRasterization.confirm'),
      )
      if (confirmed) {
        imageStore.addImageOperation({
          type: 'rasterizePdf',
          params: {},
          cost: 'high',
          affectsGeometry: false,
        })

        addUserEvent('applyOperation', {
          tool: 'rasterizePdf',
          settings: {},
        })

        await renderUpTo(imageStore.renderPipeline.currentOpIndex + 1, { t, imageStore })

        historyStore.push(imageStore.getSnapshot())
      }
    }

    if (confirmNeeded) {
      return
    }

    const id = Date.now()
    const s = localMagnifyAreaSettings.value

    const obj = {
      id,
      name: imageStore.getNextObjectName('magnifyArea', null),
      tag: 'ellipse',
      class: 'magnifyArea',
      attrs: {
        cx: x,
        cy: y,
        rx: s.radius,
        ry: s.radius,
        stroke: s.outlineColor,
        'stroke-width': s.outlineWidth,
        fill: 'transparent',
        'fill-opacity': 0,
        'data-magnify-zoom': s.zoom,
      },
      magnify: {
        zoom: s.zoom,
      },
    }

    imageStore.magnifyObjects.push(obj)
    imageStore.selectedSvgObjectId = id

    addUserEvent('applyOperation', {
      tool: 'magnifyArea',
      settings: { ...s },
    })

    saveConfigToEditorStore()
    historyStore.push(imageStore.getSnapshot(t))

    imageStore.magnifyOverlayNeedToBeRendered = true
  }

  /**
   * Init local settings on mount
   */
  onMounted(() => {
    localMagnifyAreaSettings.value.zoom = editorStore.toolsConfig.magnifyArea.zoom

    localMagnifyAreaSettings.value.outlineWidth = editorStore.toolsConfig.magnifyArea.outlineWidth

    localMagnifyAreaSettings.value.outlineColor = editorStore.toolsConfig.magnifyArea.outlineColor

    if (editorStore.toolsConfig.magnifyArea.radius !== 0) {
      localMagnifyAreaSettings.value.radius = editorStore.toolsConfig.magnifyArea.radius
    } else {
      localMagnifyAreaSettings.value.radius = Math.floor(
        imageStore.getSmallerImageDimension() * editorConfig.magnifyAreaDefaultRadiusFromImage,
      )

      editorStore.toolsConfig.magnifyArea.radius = localMagnifyAreaSettings.value.radius
    }
  })

  return {
    applyLocalMagnifyAreaSettings,
    localMagnifyAreaSettings,
    maxMagnifyAreaRadius,
    hidePositionAndDimensions,
    addMagnifyArea,
    maxMagnifyAreaSourcePositionX,
    maxMagnifyAreaSourcePositionY,
    magnifyAreaZoomOptions,
    maxOutlineWidth,
  }
}
