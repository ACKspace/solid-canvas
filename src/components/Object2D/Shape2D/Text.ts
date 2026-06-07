import { createToken } from '@solid-primitives/jsx-tokenizer'

import { parser } from '../../../parser'
import {
  Dimensions,
  ExtendedColor,
  Object2DProps,
  Shape2DProps,
} from '../../../types'
import { createShape2D } from '../../../utils/createShape2D'
import { resolveExtendedColor } from '../../../utils/resolveColor'

type Rounded =
  | number
  | [all: number]
  | [topLeftAndBottomRight: number, topRightAndBottomLeft: number]
  | [topLeft: number, topRightAndBottomLeft: number, bottomRight: number]

type TextProps = Shape2DProps & {
  style?: {
    align?: "left" | "center" | "right"
    background?: ExtendedColor
    rounded?: Rounded
    padding?: number
    fontSize?: number
    fontFamily?: string
    '&:hover'?: {
      background?: ExtendedColor
      rounded?: Rounded
      padding?: number
      fontSize?: number
      fontFamily?: string
    }
  }
  text: string
  /**
   * Currently not yet supported in firefox [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/roundRect#browser_compatibility)
   */
  isHovered?: boolean
  isSelected?: boolean
}

const getFontString = (size?: number, fontFamily?: string) =>
  `${size ?? 10}pt ${fontFamily ?? 'Arial'}`

/**
 * Paints a text to the context
 * [link](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillText)
 */

const Text = createToken(
  parser,
  (props: Shape2DProps & Object2DProps & TextProps) => {
    const alignOffset = (dimensions: Dimensions, align?: string) => {
      switch (align) {
        case "center": return dimensions.width / 2;
        case "right": return dimensions.width / 2;
        default: return 0;
      }
    };

    return createShape2D({
      id: 'Text',
      render: async (props, context) => {

        if (!props.text) return;

        context.ctx.font = getFontString(
          props.style?.fontSize,
          props.style?.fontFamily,
        )

        // Wait for the font to load
        for await (const font of document.fonts) {
          // console.log("font", font.family, await font.loaded)
          if (font.family === props.style?.fontFamily)
            await font.loaded;
        }

        const metrics = context.ctx.measureText(props.text)
        const dimensions = {
          width: metrics.width,
          height: metrics.actualBoundingBoxAscent,
        };
        const offset = alignOffset(dimensions, props.style?.align);

        if (props.opacity) context.ctx.globalAlpha = props.opacity;

        // Dirty hack: allow line width and outline (different from stroke)
        if (props.style?.lineWidth) context.ctx.lineWidth = props.style.lineWidth;
        if (
          props.outlineStyle &&
          props.outlineStyle !== 'transparent'
        ) {
          context.ctx.save();
          context.ctx.strokeStyle =
            resolveExtendedColor(props.outlineStyle) ?? 'transparent'

            context.ctx.strokeText(
              props.text,
              context.matrix.e - offset,
              context.matrix.f + dimensions.height,
            )
          context.ctx.restore();
        }
        // End of dirty hack

        context.ctx.fillStyle =
          resolveExtendedColor(props.style?.fill) ?? 'black'
        context.ctx.strokeStyle =
          resolveExtendedColor(props.stroke) ?? 'transparent'

        if ((props.isHovered || props.isSelected) && props.hoverStyle) {
          context.ctx.fillStyle =
            resolveExtendedColor(props.hoverStyle.fill) ??
            context.ctx.fillStyle
          context.ctx.strokeStyle =
            resolveExtendedColor(props.hoverStyle.stroke) ??
            context.ctx.strokeStyle
        }

        // TODO:  optimization: render text to OffscreenCanvas instead of re-rendering each frame          context.ctx.resetTransform()
        if (
          context.ctx.fillStyle &&
          context.ctx.fillStyle !== 'transparent'
        ) {
          context.ctx.fillText(
            props.text,
            context.matrix.e - offset,
            context.matrix.f + dimensions.height,
          )
        }
        if (
          context.ctx.strokeStyle &&
          context.ctx.strokeStyle !== 'transparent'
        )
          context.ctx.strokeText(
            props.text,
            context.matrix.e - offset,
            context.matrix.f + dimensions.height,
          )
      },
      props,
      defaultValues: {
        text: '',
        stroke: undefined,
        padding: 0,
        background: undefined,
      },
      setup: (props, context) => {
        context.ctx.font = getFontString(
          props.style?.fontSize,
          props.style?.fontFamily,
        )
        // Trigger font load
        context.ctx.measureText(props.text)
      },
      get dimensions() {
        return { width: 0, height: 0 }
      },
    })
  },
)

export { Text }
