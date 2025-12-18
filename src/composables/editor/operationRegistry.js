import { rotateOperation } from './operations/rotateOperation'
import { flipOperation } from './operations/flipOperation'
import { cropOperation } from './operations/cropOperation'

/**
 * Registry mapping operation types to their executor functions
 */
export const operationRegistry = {
  rotate: rotateOperation,
  flip: flipOperation,
  crop: cropOperation,
}
