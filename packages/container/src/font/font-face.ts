import urljoin from 'url-join'
import {
  FontFace,
  FontFaceAdjustments,
  FontFallback,
  FontProperties,
  FontState
} from '../types'

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

export const fontFace = (
  options: FontFaceOptionsFont | FontFaceOptionsFallback
): FontFace => {
  if (options.type === 'font') {
    const { font } = options.font
    const { fontWeight, fontStretch, fontStyle } = options.fontProperties

    return {
      src: fontSrc(options.font, options.publicPath),
      fontFamily: font.name ?? options.font.slug,
      fontWeight,
      fontStretch,
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
