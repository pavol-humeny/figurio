import { rotateOperation } from './operations/rotateOperation'
import { flipOperation } from './operations/flipOperation'
import { cropOperation } from './operations/cropOperation'
import { resizeOperation } from './operations/resizeOperation'

/**
 * Registry mapping operation types to their executor functions
 */
export const operationRegistry = {
  rotate: rotateOperation,
  flip: flipOperation,
  crop: cropOperation,
  resize: resizeOperation,
}
