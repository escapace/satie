import urljoin from 'url-join'
import {
  FontFace,
  FontFaceAdjustments,
  FontFallback,
  FontProperties,
  FontState,
  State
} from '../types'
import { fontOpen } from './font-open'

const fontSrc = ({ slug, font }: FontState, publicPath: string): string =>
  font.format
    .map((format) => ({
      ...font,
      format,
      url: urljoin(publicPath, `${font.name ?? slug}.${format}`)
    }))
    .flatMap(({ url, format, tech }) => {
      if ((tech ?? []).includes('variations')) {
        return [
          `url("${url}") format("${format}-variations")`
          // `url("${url}") format("${format}") tech("variations")`
        ]
      } else {
        return `url("${url}") format("${format}")`
      }
    })
    .join(', ')

interface FontFaceOptionsFallback {
  type: 'fallback'
  font: FontFallback
  publicPath: string
  fontProperties: Omit<Required<FontProperties>, 'fontFamily'>
  adjustments?: FontFaceAdjustments
}

interface FontFaceOptionsFont {
  type: 'font'
  font: FontState
  publicPath: string
  fontProperties: Omit<Required<FontProperties>, 'fontFamily'>
  adjustments?: FontFaceAdjustments
}

export const fontFace = async (
  options: FontFaceOptionsFont | FontFaceOptionsFallback,
  state: State
): Promise<FontFace> => {
  if (options.type === 'font') {
    const { font } = options.font
    const { fontWeight, fontStretch, fontStyle } = options.fontProperties

    const isVariable = font.tech?.includes('variations') === true

    const variationAxes = isVariable
      ? (await fontOpen(options.font, options.fontProperties, state))
          .variationAxes
      : undefined

    return {
      src: fontSrc(options.font, options.publicPath),
      fontFamily: font.name ?? options.font.slug,
      fontWeight:
        variationAxes?.wght === undefined
          ? fontWeight
          : [
              Math.max(variationAxes.wght.min, 1),
              Math.min(variationAxes.wght.max, 1000)
            ],
      fontStretch:
        variationAxes?.wdth === undefined
          ? fontStretch
          : [
              Math.max(variationAxes.wdth.min, 50),
              Math.min(variationAxes.wdth.max, 200)
            ],
      fontStyle,
      unicodeRange: font.unicodeRange,
      fontDisplay: font.display,
      ...options.adjustments
    }
  } else {
    const { font } = options.font
    const { fontWeight, fontStretch, fontStyle } = options.fontProperties

    return {
      src: font.names.map((name) => `local(${name})`).join(', '),
      fontFamily: font.id,
      fontWeight,
      fontStretch,
      fontStyle,
      ...options.adjustments
    }
  }
}
