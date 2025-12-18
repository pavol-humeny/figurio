import { operationRegistry } from './operationRegistry'

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
   * Apply a single operation to the given state
   * @param {{ canvas: HTMLCanvasElement, overlay: HTMLCanvasElement|null, pdfBytes: Uint8Array|null }} state current state
   * @param {{ type: string, params: object }} operation operation to apply
   * @param {object} meta metadata object to store additional info
   * @returns {{ canvas: HTMLCanvasElement, overlay: HTMLCanvasElement|null, pdfBytes: Uint8Array|null }} new state
   */
  const applyOperation = async (state, operation, meta) => {
    console.warn('applyOperation called with operation:', operation)
    const executor = operationRegistry[operation.type]
    if (!executor) return state

    const result = await executor({
      srcCanvas: state.canvas,
      srcPdfBytes: state.pdfBytes,
      srcOverlay: state.overlay,
      params: operation.params,
    })

    meta.dimensions = result.dimensions

    console.warn('Operation result:', result)

    return {
      canvas: result.canvas,
      overlay: result.overlay ?? state.overlay,
      pdfBytes: result.pdfBytes ? new Uint8Array(result.pdfBytes) : state.pdfBytes,
    }
  }

  /**
   * Render image up to the specified operation index
   * @param {number} targetIndex operation index to render up to
   */
  const renderUpTo = async (targetIndex) => {
    console.warn('renderUpTo called with targetIndex:', targetIndex)
    const pipeline = imageStore.renderPipeline
    const { baseState } = pipeline

    if (!baseState) return
    if (targetIndex < -1) return

    uiStore.isApplying = true

    try {
      // Add example time wait
      // await new Promise((resolve) => setTimeout(resolve, 500))

      // Find nearest checkpoint
      const checkpoint = findCheckpoint(targetIndex)

      let state
      let currentDimensions

      if (checkpoint) {
        // 🔹 Normal path – render from checkpoint
        state = cloneState(checkpoint.state)
        currentDimensions = { ...checkpoint.dimensions }

        console.warn(
          'Starting from checkpoint at opIndex:',
          checkpoint.opIndex + 1,
          'to targetIndex:',
          targetIndex,
        )

        for (let i = checkpoint.opIndex + 1; i <= targetIndex; i++) {
          const operation = imageStore.imageOperations[i]
          if (!operation) continue

          const meta = {}
          state = await applyOperation(state, operation, meta)

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
        // 🔥 FALLBACK – render from baseState
        console.warn('No checkpoint found, rendering from baseState')

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
          state = await applyOperation(state, operation, meta)

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
      imageStore.fileDimensions = { ...currentDimensions }
      imageStore.newFileDimensions = { ...currentDimensions }

      if (state.pdfBytes && state.pdfBytes.length > 0) {
        imageStore.pdfPageBytes = new Uint8Array(state.pdfBytes)
      } else {
        imageStore.pdfPageBytes = null
      }
    } finally {
      uiStore.isApplying = false
    }
  }

  /**
   * Reset pipeline when a new image is loaded
   * @param {HTMLCanvasElement} baseCanvas
   */
  const resetPipeline = (baseCanvas) => {
    const baseState = {
      canvas: baseCanvas,
      pdfBytes: imageStore.fileType === 'pdf' ? new Uint8Array(imageStore.pdfPageBytes) : null,
    }

    imageStore.renderPipeline = {
      baseState,
      checkpoints: [
        {
          opIndex: -1,
          state: cloneState(baseState),
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

  return {
    renderUpTo,
    resetPipeline,
  }
}
