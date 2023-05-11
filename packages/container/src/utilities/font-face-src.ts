import urljoin from 'url-join'
import { State, TypeInferFontExtended } from '../types'

export const fontFaceSrc = (
  font: TypeInferFontExtended,
  state: State
): string =>
  font.format
    .map((format) => ({
      ...font,
      format,
      url: urljoin(state.publicPath, `${font.slug}.${format}`)
    }))
    .flatMap(({ url, format, tech }) => {
      if ((tech ?? []).includes('variations')) {
        return [
          `url("${url}") format("${format}") tech("variations")`,
          `url("${url}") format("${format}-variations")`
        ]
      } else {
        return `url("${url}") format("${format}")`
      }
    })
    .join(', ')
