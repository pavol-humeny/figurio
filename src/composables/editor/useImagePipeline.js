import { operationRegistry } from './operationRegistry'
import { useMath } from '../common/useMath'
const { round } = useMath()

export function useImagePipeline(imageStore) {
  const cloneState = (state) => {
    const canvas = document.createElement('canvas')
    canvas.width = state.canvas.width
    canvas.height = state.canvas.height
    canvas.getContext('2d').drawImage(state.canvas, 0, 0)

    return {
      canvas,
      pdfBytes: state.pdfBytes ? new Uint8Array(state.pdfBytes) : null,
    }
  }
  /**
   * Find nearest checkpoint <= target operation index
   * @param {number} opIndex
   * @returns {{ opIndex: number, canvas: HTMLCanvasElement, dimensions: object }}
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

  const applyOperation = async (state, operation, meta) => {
    const executor = operationRegistry[operation.type]
    if (!executor) return state

    const result = await executor({
      srcCanvas: state.canvas,
      srcPdfBytes: state.pdfBytes,
      srcOverlay: state.overlay,
      ...operation.params,
      round,
    })

    meta.dimensions = result.dimensions

    return {
      canvas: result.canvas,
      pdfBytes: imageStore.fileType === 'pdf' ? new Uint8Array(result.pdfBytes) : null,
    }
  }

  const renderUpTo = async (targetIndex) => {
    const pipeline = imageStore.renderPipeline
    const { baseState } = pipeline

    if (!baseState) return
    if (targetIndex < -1) return

    const checkpoint = findCheckpoint(targetIndex)
    if (!checkpoint) return

    let state = cloneState(checkpoint.state)
    let currentDimensions = { ...checkpoint.dimensions }

    for (let i = checkpoint.opIndex + 1; i <= targetIndex; i++) {
      const operation = imageStore.imageOperations[i]
      if (!operation) continue

      const meta = {}
      state = await applyOperation(state, operation, meta)

      if (meta.dimensions) {
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

    pipeline.currentOpIndex = targetIndex
    pipeline.lastRenderedOpIndex = targetIndex

    // 🔥 jediný bod mutácie imageStore
    imageStore.setRenderedImage(state.canvas)
    imageStore.fileDimensions = { ...currentDimensions }
    imageStore.newFileDimensions = { ...currentDimensions }

    if (imageStore.fileType === 'pdf' && state.pdfBytes) {
      imageStore.pdfPageBytes = new Uint8Array(state.pdfBytes)
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
