import { createToken } from '@solid-primitives/jsx-tokenizer'

import { createEffect, createSignal } from 'solid-js'
import { InternalContextType } from '../../../context/InternalContext'
import { parser } from '../../../parser'
import {
  Dimensions,
  ExtendedColor,
  ImageSource,
  Object2DProps,
  Shape2DProps,
  Vector,
} from '../../../types'
import { createMatrix } from '../../../utils/createMatrix'
import { createShape2D } from '../../../utils/createShape2D'
import { createUpdatedContext } from '../../../utils/createUpdatedContext'
import resolveImageSource from '../../../utils/resolveImageSource'

/**
 * Paints an image to the canvas
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData)
 */

type ImageProps = {
  image: ImageSource
  style: {
    sourceOffset?: Vector
    sourceDimensions?: Dimensions
    dimensions?: Dimensions
    background?: ExtendedColor
  }
  onLoad?: (image: Exclude<ImageSource, string>) => void
}

const Image = createToken(
  parser,
  (props: Shape2DProps & Object2DProps & ImageProps) => {
    const image = resolveImageSource(() => props.image)
    createEffect(() => {
      if (!image()) return;
      props.onLoad?.(image()!);
    })
    return createShape2D({
      props,
      id: 'Image',
      setup: (props, context) => {
        // setContext(context)
      },
      render: (props, context) => {
        if (!image()) return
        if (props.opacity) context.ctx.globalAlpha = props.opacity
        context.ctx.setTransform(context.matrix)
        //@ts-ignore - parseInt just works with int.
        const width = parseInt(image()!.width);
        //@ts-ignore - parseInt just works with int.
        const height = parseInt(image()!.height);
        if (props.style.sourceOffset || props.style.sourceDimensions) {
          const sx = props.style.sourceOffset?.x ?? 0;
          const sy = props.style.sourceOffset?.y ?? 0;
          context.ctx.drawImage(
            image()!,
            sx, // sx
            sy, // sy
            props.style.sourceDimensions?.width ?? (width - sx), // sw
            props.style.sourceDimensions?.height ?? (height - sy), // sh
            0, // dx
            0, // dy
            props.style.dimensions?.width ?? width, // dw
            props.style.dimensions?.height ?? height, // dh
          )
        } else {
          context.ctx.drawImage(
            image()!,
            0, // dx
            0, // dy
            props.style.dimensions?.width ?? width, // dw
            props.style.dimensions?.height ?? height, // dh
          )
        }
        context.ctx.resetTransform()
      },
      get dimensions() {
        return (
          {
            width: props.style.dimensions?.width ?? (image() ? parseInt(image().width) : 100),
            height: props.style.dimensions?.height ?? (image() ? parseInt(image().height) : 100),
          }
        )
      },
      defaultValues: {
        style: {
        },
      },
    })
  },
)

export { Image }
