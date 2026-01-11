import { Accessor } from 'solid-js'
import { useInternalContext } from '../context/InternalContext'
import { Shape2DProps, Transforms } from '../types'
import { createMatrix } from './createMatrix'
import { deepMergeGetters, mergeGetters } from './mergeGetters'

const createUpdatedContext = (
  props: Accessor<{ transform?: Partial<Transforms> }>,
) => {
  const internalContext = useInternalContext()
  const matrix = createMatrix(props, internalContext)
  return deepMergeGetters(internalContext, {
    get matrix() {
      return matrix()
    },
  })
}

export { createUpdatedContext }
