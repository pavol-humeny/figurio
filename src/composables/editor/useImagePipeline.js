import { operationRegistry } from './operationRegistry'
import { useConsole } from '../common/useConsole'
const { warn, log } = useConsole()
import { resizeOperation } from './operations/resizeOperation'

export function useImagePipeline(imageStore, uiStore) {
  /**
   * Clone the given state to avoid mutations
   * @param {{ canvas: HTMLCanvasElement, overlay: HTMLCanvasElement|null, pdfBytes: Uint8Array|null }} state
   * @returns {{ canvas: HTMLCanvasElement, overlay: HTMLCanvasElement|null, pdfBytes: Uint8Array|null }} cloned state
   */
  const cloneState = (state) => {
    const canvas = document.createElement('canvas')
    canvas.width = state.canvas.width
    canvas.height = state.canvas.height
    canvas.getContext('2d').drawImage(state.canvas, 0, 0)

    let overlay = null
    if (state.overlay) {
      overlay = document.createElement('canvas')
      overlay.width = state.overlay.width
      overlay.height = state.overlay.height
      overlay.getContext('2d').drawImage(state.overlay, 0, 0)
    }

    return {
      canvas,
      overlay,
      pdfBytes: state.pdfBytes ? new Uint8Array(state.pdfBytes) : null,
    }
  }

  /**
   * Clone a canvas element
   * @param {HTMLCanvasElement} src source canvas
   * @returns {HTMLCanvasElement} cloned canvas
   */
  const cloneCanvas = (src) => {
    const c = document.createElement('canvas')
    c.width = src.width
    c.height = src.height
    c.getContext('2d').drawImage(src, 0, 0)
    return c
  }

  /**
   * Find nearest checkpoint before or at the given operation index
   * @param {number} opIndex operation index
   * @returns {{ opIndex: number, canvas: HTMLCanvasElement, dimensions: object }} checkpoint
   */
  const findCheckpoint = (opIndex) => {
    return [...imageStore.renderPipeline.checkpoints].reverse().find((cp) => cp.opIndex <= opIndex)
  }

  /**
   * Decide if an operation should create a checkpoint
   * @param {object} op
   * @returns {boolean}
   */
  const shouldCreateCheckpoint = (op) => {
    return op.cost === 'high'
  }

  /**
   * Compute effective base canvas for resize operation
   * Applies all operations BEFORE given resize index, skipping all resize operations
   *
   * @param {number} resizeOpIndex
   * @param {object} ctx
   * @returns {Promise<HTMLCanvasElement>}
   */
  const computeEffectiveBaseCanvasForResize = async (resizeOpIndex, ctx) => {
    const base = imageStore.renderPipeline.baseState
    let state = cloneState(base)

    for (let i = 0; i < resizeOpIndex; i++) {
      const op = imageStore.imageOperations[i]
      if (!op || op.type === 'resize') continue

      const meta = {}
      state = await applyOperation(state, op, meta, ctx)
    }

    return state.canvas
  }

  /**
   * Compute effective overlay for resize operation
   * Applies all operations BEFORE given resize index, skipping all resize operations
   *
   * @param {number} resizeOpIndex
   * @param {object} ctx
   * @returns {Promise<HTMLCanvasElement|null>}
   */
  const computeEffectiveOverlayForResize = async (resizeOpIndex, ctx) => {
    const base = imageStore.renderPipeline.baseState
    let state = cloneState(base)

    for (let i = 0; i < resizeOpIndex; i++) {
      const op = imageStore.imageOperations[i]
      if (!op || op.type === 'resize') continue

      const meta = {}
      state = await applyOperation(state, op, meta, ctx)
    }

    return state.overlay
  }

  /**
   * Returns rendered canvas after applying operations up to given index
   */
  const getEffectiveCanvas = async (targetIndex) => {
    const pipeline = imageStore.renderPipeline

    if (!pipeline.baseState) return null

    let state = {
      canvas: pipeline.baseState.canvas,
      overlay: pipeline.baseState.overlay,
      pdfBytes: pipeline.baseState.pdfBytes,
    }

    console.warn('Computing effective canvas up to index:', targetIndex)
    for (let i = 0; i <= targetIndex; i++) {
      const op = imageStore.imageOperations[i]
      console.warn('Applying op index', i, op ? op.type : 'null')
      if (!op) continue

      const meta = {}
      state = await applyOperation(state, op, meta, { opIndex: i })
    }

    return state.canvas
  }

  /**
   * Apply a single operation to the given state
   * @param {{ canvas: HTMLCanvasElement, overlay: HTMLCanvasElement|null, pdfBytes: Uint8Array|null }} state current state
   * @param {{ type: string, params: object }} operation operation to apply
   * @param {object} meta metadata object to store additional info
   * @returns {{ canvas: HTMLCanvasElement, overlay: HTMLCanvasElement|null, pdfBytes: Uint8Array|null }} new state
   */
  const applyOperation = async (state, operation, meta, ctx = {}) => {
    log('Applying operation:', operation.type, operation.params)

    // Brush operation is overlay-only
    if (operation.type === 'brush') {
      return {
        canvas: state.canvas,
        overlay: operation.overlay ? cloneCanvas(operation.overlay) : null,
        pdfBytes: state.pdfBytes,
      }
    }

    if (operation.type === 'resize') {
      const effectiveBaseCanvas = await computeEffectiveBaseCanvasForResize(ctx.opIndex, ctx)
      const effectiveOverlay = await computeEffectiveOverlayForResize(ctx.opIndex, ctx)

      const result = await resizeOperation({
        baseCanvas: effectiveBaseCanvas,
        srcOverlay: effectiveOverlay,
        srcPdfBytes: state.pdfBytes,
        params: operation.params,
      })

      meta.dimensions = result.dimensions

      return {
        canvas: result.canvas,
        overlay: result.overlay,
        pdfBytes: result.pdfBytes,
      }
    }

    const executor = operationRegistry[operation.type]
    if (!executor) return state

    const result = await executor({
      srcCanvas: state.canvas,
      srcOverlay: state.overlay,
      srcPdfBytes: state.pdfBytes,
      params: operation.params,
      ctx,
    })

    meta.dimensions = result.dimensions

    // return {
    //   canvas: result.canvas,
    //   overlay: result.overlay ?? state.overlay,
    //   pdfBytes: result.pdfBytes ? new Uint8Array(result.pdfBytes) : state.pdfBytes,
    // }

    return {
      canvas: result.canvas,
      overlay: result.overlay ?? state.overlay,
      pdfBytes: 'pdfBytes' in result ? result.pdfBytes : state.pdfBytes,
    }
  }

  /**
   * Render image up to the specified operation index
   * @param {number} targetIndex operation index to render up to
   */
  const renderUpTo = async (targetIndex, ctx = {}) => {
    const pipeline = imageStore.renderPipeline
    const { baseState } = pipeline

    // Remove checkpoints beyond targetIndex (for undo)
    pipeline.checkpoints = pipeline.checkpoints.filter((cp) => cp.opIndex <= targetIndex)

    if (!baseState) return
    if (targetIndex < -1) return

    console.warn('IMAGE PIPELINE - START')
    uiStore.isApplying = true

    try {
      // Find nearest checkpoint
      const checkpoint = findCheckpoint(targetIndex)

      let state
      let currentDimensions

      if (checkpoint) {
        // Normal path – render from checkpoint
        state = cloneState(checkpoint.state)
        currentDimensions = { ...checkpoint.dimensions }

        for (let i = checkpoint.opIndex + 1; i <= targetIndex; i++) {
          const operation = imageStore.imageOperations[i]
          if (!operation) continue

          const meta = {}
          state = await applyOperation(state, operation, meta, {
            ...ctx,
            opIndex: i,
          })

          if (meta.dimensions && operation.affectsGeometry !== false) {
            currentDimensions = meta.dimensions
          }

          if (shouldCreateCheckpoint(operation)) {
            pipeline.checkpoints.push({
              opIndex: i,
              state: cloneState(state),
              dimensions: { ...currentDimensions },
            })
          }
        }
      } else {
        // FALLBACK – render from baseState
        warn('No checkpoint found, rendering from baseState')

        state = cloneState(pipeline.baseState)

        currentDimensions = {
          width: pipeline.baseState.canvas.width,
          height: pipeline.baseState.canvas.height,
          fileAspectRatio: pipeline.baseState.canvas.width / pipeline.baseState.canvas.height || 1,
        }

        // Apply operations from start
        for (let i = 0; i <= targetIndex; i++) {
          const operation = imageStore.imageOperations[i]
          if (!operation) continue

          const meta = {}
          state = await applyOperation(state, operation, meta, {
            ...ctx,
            opIndex: i,
          })

          if (meta.dimensions && operation.affectsGeometry !== false) {
            currentDimensions = meta.dimensions
          }

          if (shouldCreateCheckpoint(operation)) {
            pipeline.checkpoints.push({
              opIndex: i,
              state: cloneState(state),
              dimensions: { ...currentDimensions },
            })
          }
        }
      }

      pipeline.currentOpIndex = targetIndex
      pipeline.lastRenderedOpIndex = targetIndex

      // Update the rendered image in the store and dimensions
      imageStore.setRenderedImage(state.canvas)
      imageStore.setOverlay(state.overlay)
      imageStore.fileDimensions = {
        ...imageStore.fileDimensions,
        ...currentDimensions,
      }

      imageStore.newFileDimensions = {
        ...imageStore.newFileDimensions,
        ...currentDimensions,
      }

      imageStore.pdfPageBytes =
        state.pdfBytes && state.pdfBytes.length > 0 ? new Uint8Array(state.pdfBytes) : null

      // Update file type if PDF bytes were removed (pdf -> image)
      if (!state.pdfBytes) {
        imageStore.fileType = 'image'
        imageStore.fileFormat = imageStore.fileFormat === 'pdf' ? 'png' : imageStore.fileFormat

        imageStore.imageNeedToBeRendered = true
      }
    } finally {
      imageStore.imageNeedToBeRendered = true
      console.warn('IMAGE PIPELINE - END')
      uiStore.isApplying = false
      uiStore.isApplyingFrame = false
    }
  }

  /**
   * Reset pipeline when a new image is loaded
   * @param {HTMLCanvasElement} baseCanvas
   */
  const initPipeline = (baseCanvas) => {
    imageStore.renderPipeline = {
      baseState: {
        canvas: baseCanvas,
        overlay: null,
        pdfBytes: imageStore.fileType === 'pdf' ? new Uint8Array(imageStore.pdfPageBytes) : null,
      },
      checkpoints: [
        {
          opIndex: -1,
          state: {
            canvas: cloneCanvas(baseCanvas),
            overlay: null,
            pdfBytes: imageStore.pdfPageBytes,
          },
          dimensions: {
            width: baseCanvas.width,
            height: baseCanvas.height,
            fileAspectRatio: baseCanvas.width / baseCanvas.height || 1,
          },
        },
      ],
      currentOpIndex: -1,
      lastRenderedOpIndex: -1,
    }
  }
  const resetPipeline = () => {
    const base = imageStore.renderPipeline.baseState
    if (!base) return

    imageStore.renderPipeline = {
      baseState: {
        canvas: base.canvas,
        overlay: base.overlay,
        pdfBytes: base.pdfBytes ? new Uint8Array(base.pdfBytes) : null,
      },
      checkpoints: [
        {
          opIndex: -1,
          state: cloneState(base),
          dimensions: {
            width: base.canvas.width,
            height: base.canvas.height,
            fileAspectRatio: base.canvas.width / base.canvas.height || 1,
          },
        },
      ],
      currentOpIndex: -1,
      lastRenderedOpIndex: -1,
    }
  }

  return {
    renderUpTo,
    initPipeline,
    resetPipeline,
    getEffectiveCanvas,
  }
}
