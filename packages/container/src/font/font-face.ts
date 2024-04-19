import urljoin from 'url-join'
import type {
  FontFace,
  FontFaceAdjustments,
  FontFallback,
  FontProperties,
  FontState,
  State
} from '../types'
import { fontOpen } from './font-open'

const fontSource = ({ font, slug }: FontState, publicPath: string): string =>
  font.format
    .map((format) => ({
      ...font,
      format,
      url: urljoin(publicPath, `${font.name ?? slug}.${format}`)
    }))
    .flatMap(({ format, tech, url }) =>
      (tech ?? []).includes('variations')
        ? [
            `url("${url}") format("${format}-variations")`
            // `url("${url}") format("${format}") tech("variations")`
          ]
        : `url("${url}") format("${format}")`
    )
    .join(', ')

interface FontFaceOptionsFallback {
  adjustments?: FontFaceAdjustments
  font: FontFallback
  fontProperties: Omit<Required<FontProperties>, 'fontFamily'>
  publicPath: string
  type: 'fallback'
}

interface FontFaceOptionsFont {
  adjustments?: FontFaceAdjustments
  font: FontState
  fontProperties: Omit<Required<FontProperties>, 'fontFamily'>
  publicPath: string
  type: 'font'
}

export const fontFace = async (
  options: FontFaceOptionsFallback | FontFaceOptionsFont,
  state: State
): Promise<FontFace> => {
  if (options.type === 'font') {
    const { font } = options.font
    const { fontStretch, fontStyle, fontWeight } = options.fontProperties

    const isVariable = font.tech?.includes('variations') === true

    const variationAxes = isVariable
      ? (await fontOpen(options.font, options.fontProperties, state))
          .variationAxes
      : undefined

    return {
      fontDisplay: font.display,
      fontFamily: font.name ?? options.font.slug,
      fontStretch:
        variationAxes?.wdth === undefined
          ? fontStretch
          : [
              Math.max(variationAxes.wdth.min, 50),
              Math.min(variationAxes.wdth.max, 200)
            ],
      fontStyle,
      fontWeight:
        variationAxes?.wght === undefined
          ? fontWeight
          : [
              Math.max(variationAxes.wght.min, 1),
              Math.min(variationAxes.wght.max, 1000)
            ],
      src: fontSource(options.font, options.publicPath),
      unicodeRange: font.unicodeRange,
      ...options.adjustments
    }
  } else {
    const { font } = options.font
    const { fontStretch, fontStyle, fontWeight } = options.fontProperties

    return {
      fontFamily: font.id,
      fontStretch,
      fontStyle,
      fontWeight,
      src: font.names.map((name) => `local(${name})`).join(', '),
      ...options.adjustments
    }
  }
}
