import { openSync } from 'fontkit'
import {
  compact,
  find,
  flatMap,
  intersection,
  isEqual,
  kebabCase,
  map,
  pick,
  uniq,
  uniqBy
} from 'lodash-es'
import path from 'path'
import urljoin from 'url-join'
import { SLUG_NON_PARTS } from '../constants'
import {
  FontFace,
  ResourceHint,
  State,
  TypeFallbackFont,
  TypeFontIssue,
  TypeInferClass,
  TypeInferFont,
  TypeInferFontExtended
} from '../types'
import { calculateOverrideValues } from './calculate-override-values'
import { combinations } from './combinations'
import { createHash } from './create-hash'
import { createSlug } from './create-slug'
import { describeFont } from './describe-font'
import { fontFaceSrc } from './font-face-src'
import { metricsFromFont } from './metrics-from-fonts'
import { quoteFontFamily } from './quote-font-family'
import { style } from './style'
import { toposort } from './toposort'
import { writeFont } from './write-font'

const createFontExtended = (
  slug: string,
  value: TypeInferFont,
  state: State
): TypeInferFontExtended => {
  const srcOfFormat = (format: 'woff' | 'woff2') =>
    urljoin(state.publicPath, `${slug}.${format}`)

  const metrics = metricsFromFont(
    openSync(path.resolve(state.cwd, value.source))
  )

  const issues = metrics.issues ?? []

  issues.forEach((issue) => {
    state.console.warn(
      `${value.source} (${metrics.familyName}): ${issue.description}`
    )
  })

  issues.forEach((issue) => {
    if (issue.type === TypeFontIssue.Error) {
      throw new Error(
        `Critial issue with ${value.source} (${metrics.familyName}).`
      )
    }
  })

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

  return {
    ...value,
    slug,
    metrics,
    resourceHint
  }
}

const createFont = (
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

const orederFonts = (initial: TypeInferFont[], state: State) => {
  const graph = new Map<string, string[]>()
  const fonts = new Map<string, TypeInferFontExtended>()

  const add = (key: string, parent?: string) => {
    if (!graph.has(key)) {
      graph.set(key, [])
    }

    if (parent !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const array = graph.get(key)!

      if (!array.includes(parent)) {
        array.push(parent)
      }
    }
  }

  const next = (values: TypeInferFont[], parent?: string) => {
    values.forEach((value) => {
      const extended = createFont(value, state)

      if (!fonts.has(extended.slug)) {
        fonts.set(extended.slug, extended)
      }

      add(extended.slug, parent)

      next(extended.prefer ?? [], extended.slug)
    })
  }

  next(initial)

  const order = toposort(graph).map((value) => Array.from(value))

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const sortedFonts = uniq(order.flat()).map((value) => fonts.get(value)!)

  return { fonts: sortedFonts, graph }
}

const createFontFaces = (
  fonts: TypeInferFontExtended[],
  fallbackFontFamilies: TypeFallbackFont[],
  state: State
) => {
  const primaryFont = fonts[0]
  const metrics = fonts[0].metrics

  const fontFaces = Object.fromEntries(
    fonts.map((value, index): [string, FontFace] => {
      const fontFace = {
        src: fontFaceSrc(value, state),
        fontWeight:
          value.weight === undefined
            ? undefined
            : Array.isArray(value.weight)
            ? `${value.weight[0]} ${value.weight[1]}`
            : `${value.weight}`,
        fontStretch:
          value.stretch === undefined
            ? undefined
            : Array.isArray(value.stretch)
            ? `${value.stretch[0]}% ${value.stretch[1]}%`
            : `${value.stretch}%`,
        fontStyle:
          value.style === undefined
            ? undefined
            : typeof value.style === 'string'
            ? `${value.style}`
            : Array.isArray(value.style)
            ? `oblique ${value.style[0]}% ${value.style[1]}%`
            : `oblique ${value.style}%`,
        unicodeRange: value.unicodeRange,
        fontDisplay: value.display,
        ...(index === 0
          ? {}
          : calculateOverrideValues({
              metrics,
              fallbackMetrics: value.metrics
            }))
      }

      const fontFamily =
        index === 0
          ? value.family
          : `${kebabCase(value.family)}-${createHash(fontFace)}`

      return [value.slug, { fontFamily, ...fontFace }]
    })
  )

  const fallbackFontFaces = uniqBy(
    fallbackFontFamilies.map((fallbackMetrics): FontFace => {
      const fontFace = {
        src: fallbackMetrics.names.map((name) => `local(${name})`).join(', '),
        fontWeight:
          primaryFont.weight === undefined
            ? undefined
            : Array.isArray(primaryFont.weight)
            ? `${primaryFont.weight[0]} ${primaryFont.weight[1]}`
            : `${primaryFont.weight}`,
        fontStretch:
          primaryFont.stretch === undefined
            ? undefined
            : Array.isArray(primaryFont.stretch)
            ? `${primaryFont.stretch[0]}% ${primaryFont.stretch[1]}%`
            : `${primaryFont.stretch}%`,
        fontStyle:
          primaryFont.style === undefined
            ? undefined
            : typeof primaryFont.style === 'string'
            ? `${primaryFont.style}`
            : Array.isArray(primaryFont.style)
            ? `oblique ${primaryFont.style[0]}% ${primaryFont.style[1]}%`
            : `oblique ${primaryFont.style}%`,
        ...calculateOverrideValues({
          metrics,
          fallbackMetrics
        })
      }

      const fontFamily = `${kebabCase(fallbackMetrics.id)}-${createHash(
        fontFace
      )}`

      return { fontFamily, ...fontFace }
    }),
    (value) => value.fontFamily.toLowerCase()
  )

  const toValues = (): FontFace[] => [
    ...Object.values(fontFaces),
    ...fallbackFontFaces
  ]

  const overlap = intersection(
    fallbackFontFaces.map((value) => value.fontFamily.toLowerCase()),
    Object.values(fontFaces).map((value) => value.fontFamily.toLowerCase())
  )

  if (overlap.length !== 0) {
    throw new Error(`Fallback font family conflict for ${overlap.join(', ')}.`)
  }

  // TODO: inconsistency in weights; style; stretch &c.

  return { fontFaces, fallbackFontFaces, toValues }
}

export const createClass = (
  locale: string,
  className: string,
  initialClass: TypeInferClass,
  state: State
) => {
  const ordered = orederFonts(initialClass.fontFamily.fonts, state)

  const resourceHint: ResourceHint[] = flatMap(
    ordered.fonts,
    (value) => value.resourceHint
  )

  const { fallbackFontFaces, fontFaces, toValues } = createFontFaces(
    ordered.fonts,
    initialClass.fontFamily.fallbacks,
    state
  )

  const fallbacks = fallbackFontFaces.map((value) => value.fontFamily)

  const selectorFallback = `html:lang(${locale}) .${className}`

  const styles: string[] = []

  const noScriptStyle: string[] = [
    style(
      selectorFallback,
      {
        ...initialClass,
        fontFamily: [
          ...map(Object.entries(fontFaces), ([_, value]) => value.fontFamily),
          ...fallbacks
        ]
          .map(quoteFontFamily)
          .join(', ')
      },
      state.targets.lightningCSS
    )
  ]

  const writeFallback = fallbacks.length > 0

  if (writeFallback) {
    styles.push(
      style(
        selectorFallback,
        {
          ...initialClass,
          fontFamily: fallbacks.map(quoteFontFamily).join(', ')
        },
        state.targets.lightningCSS
      )
    )
  }

  const comb = map(
    combinations(map(ordered.fonts, (value) => value.slug)),
    (value) =>
      map(value, (value) => ({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ...find(ordered.fonts, ({ slug }) => slug === value)!,
        fontFace: fontFaces[value]
      }))
  )

  styles.push(
    ...map(comb, (fonts) => {
      const selector = `html${map(
        fonts,
        ({ slug }) => `[data-fonts-loaded~='${slug}']`
      ).join('')}:lang(${locale}) .${className}`

      return style(
        selector,
        {
          ...initialClass,
          fontFamily: [
            ...map(fonts, ({ fontFace }) => fontFace.fontFamily),
            ...fallbacks
          ]
            .map(quoteFontFamily)
            .join(', '),
          fontWeight: writeFallback ? undefined : initialClass.fontWeight,
          fontStyle: writeFallback ? undefined : initialClass.fontStyle,
          fontStretch: writeFallback ? undefined : initialClass.fontStretch
        },
        state.targets.lightningCSS
      )
    })
  )

  return {
    className,
    resourceHint: uniq(resourceHint),
    fontFace: toValues(),
    noScriptStyle: uniq(noScriptStyle),
    style: uniq(styles),
    fonts: ordered.fonts,
    graph: ordered.graph
  }
}
