import { Vector } from '../types'

export default (position: Vector, matrix: DOMMatrix) =>
  new DOMPoint(position.x, position.y).matrixTransform(matrix)
