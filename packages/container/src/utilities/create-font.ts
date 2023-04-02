import { compact, isEqual, pick } from 'lodash-es'
import urljoin from 'url-join'
import { SLUG_NON_PARTS } from '../constants'
import {
  ResourceHint,
  State,
  TypeInferFont,
  TypeInferFontExtended
} from '../types'
import { createSlug } from './create-slug'
import { describeFont } from './describe-font'
import { fontFaceSrc } from './font-face-src'
import { writeFont } from './write-font'
import { quoteFontFamily } from './quote-font-family'

const createFontExtended = (
  slug: string,
  value: TypeInferFont,
  state: State
): TypeInferFontExtended => {
  const srcOfFormat = (format: 'woff' | 'woff2') =>
    urljoin(state.publicPath, `${slug}.${format}`)

  const src: string[] = value.format.map((format) => srcOfFormat(format))

  const resourceHint: ResourceHint[] = compact([
    value.resourceHint === undefined
      ? undefined
      : {
          as: 'font',
          href: srcOfFormat(value.format[0]),
          rel: value.resourceHint,
          type: `font/${value.format[0]}`,
          crossorigin: 'anonymous'
        }
  ])

  const fontFace = [
    '@font-face {',
    `  font-family: ${quoteFontFamily(value.family)};`,
    value.weight === undefined
      ? undefined
      : `  font-weight: ${
          Array.isArray(value.weight)
            ? `${value.weight[0]} ${value.weight[1]};`
            : `${value.weight};`
        };`,
    value.stretch === undefined
      ? undefined
      : `  font-stretch: ${
          Array.isArray(value.stretch)
            ? `${value.stretch[0]}% ${value.stretch[1]}%;`
            : `${value.stretch}%;`
        };`,
    value.style === undefined
      ? undefined
      : `  font-style: ${
          typeof value.style === 'string'
            ? `${value.style};`
            : Array.isArray(value.style)
            ? `oblique ${value.style[0]}% ${value.style[1]}%;`
            : `oblique ${value.style}%;`
        };`,
    `  src: ${fontFaceSrc(src, value.tech)};`,
    value.unicodeRange === undefined
      ? undefined
      : `  unicode-range: ${value.unicodeRange};`,
    value.display === undefined
      ? undefined
      : `  font-display: ${value.display};`,
    '}'
  ]
    .filter((value) => value !== undefined)
    .join('\n')

  return {
    ...value,
    slug,
    fontFace,
    resourceHint
  }
}

export const createFont = (
  value: TypeInferFont,
  state: State
): TypeInferFontExtended => {
  const slug = createSlug(value)

  if (state.cacheFonts.has(slug)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [cachedValue, cachedExtended] = state.cacheFonts.get(slug)!

    if (
      !isEqual(pick(cachedValue, SLUG_NON_PARTS), pick(value, SLUG_NON_PARTS))
    ) {
      state.console.exit(`conflicting values for ${describeFont(value)}`)
    }

    return cachedExtended
  }

  const extended = createFontExtended(slug, value, state)

  state.cacheFonts.set(slug, [
    value,
    extended,
    async () => await writeFont(slug, value, state)
  ])

  return extended
}
