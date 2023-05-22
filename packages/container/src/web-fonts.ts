/* eslint-disable @typescript-eslint/no-non-null-assertion */
import fse from 'fs-extra'
import {
  cloneDeep,
  compact,
  filter,
  find,
  first,
  isEmpty,
  isEqual,
  isNumber,
  last,
  map,
  mapValues,
  omit,
  pick,
  pickBy,
  reduce,
  uniq,
  uniqBy
} from 'lodash-es'
import path from 'path'
import stringify from 'safe-stable-stringify'
import urljoin from 'url-join'
import type { ValuesType } from 'utility-types'
import { fontAdjust } from './font/font-adjust'
import { fontFace } from './font/font-face'
import { fontLoaderScript } from './font/font-loader-script'
import { fontMetrics } from './font/font-metrics'
import { fontOpen } from './font/font-open'
import { fontSort } from './font/font-sort'
import { fontWrite } from './font/font-write'
import { createState } from './state/create-state'
import { reduceGraph } from './state/flatten-configuration'
import {
  InferFont,
  ResourceHint,
  WebFont,
  WebFontLocale,
  WebFontsJson
} from './state/user-schema'
import {
  FontFace,
  FontStateHints,
  FontStateWritten,
  Options,
  State,
  Style,
  TupleUnion,
  TypeFontState
} from './types'
import { combinations } from './utilities/combinations'
import { createHash } from './utilities/create-hash'
import { minifyCss } from './utilities/minify-css'
import { quoteFontFamily } from './utilities/quote-font-family'
import { iterateProperties } from './utilities/style'
import { toposort } from './utilities/toposort'

const fontFaceToString = (value: FontFace): string =>
  compact([
    '@font-face {',
    `font-family: ${quoteFontFamily(value.fontFamily)};`,
    `src: ${value.src};`,
    isNumber(value.fontWeight)
      ? value.fontWeight === 400
        ? undefined
        : `font-weight: ${value.fontWeight};`
      : Array.isArray(value.fontWeight)
      ? `font-weight: ${value.fontWeight[0]} ${value.fontWeight[1]};`
      : undefined,
    value.fontStyle === 'normal'
      ? undefined
      : isNumber(value.fontStyle)
      ? `font-style: oblique ${value.fontStyle}deg;`
      : `font-style: ${value.fontStyle};`,
    isNumber(value.fontStretch)
      ? value.fontStretch === 100
        ? undefined
        : `font-stretch: ${value.fontStretch}%;`
      : Array.isArray(value.fontStretch)
      ? `font-stretch: ${value.fontStretch[0]}% ${value.fontStretch[1]}%;`
      : undefined,
    value.unicodeRange === undefined
      ? undefined
      : `unicode-range: ${value.unicodeRange};`,
    value.ascentOverride === undefined
      ? undefined
      : `ascent-override: ${value.ascentOverride}%;`,
    value.descentOverride === undefined
      ? undefined
      : `descent-override: ${value.descentOverride}%;`,
    value.lineGapOverride === undefined
      ? undefined
      : `line-gap-override: ${value.lineGapOverride}%;`,
    value.sizeAdjust === undefined
      ? undefined
      : `size-adjust: ${value.sizeAdjust}%;`,
    value.fontDisplay === undefined
      ? undefined
      : `font-display: ${value.fontDisplay};`,
    '}'
  ]).join('\n')

const reduceFontFaceWeightStretch = (
  value: Array<number | [number, number]>
): number | [number, number] => {
  const array = uniq(value.flatMap((value) => value)).sort((a, b) => a - b)

  return array.length === 1 ? array[0] : [array[0], array[1]]
}

const compareFontDisplay = (value: InferFont['display']) => {
  const priority: TupleUnion<Exclude<InferFont['display'], undefined>> = [
    'block',
    'auto',
    'swap',
    'fallback',
    'optional'
  ]

  return priority.indexOf(value === undefined ? 'auto' : value)
}

const compactFontFaces = (
  fontFaces: { [k: string]: FontFace },
  isFallback: boolean
): Array<[string, FontFace]> => {
  return Object.entries(
    mapValues(fontFaces, (current, id): FontFace => {
      const relevant = filter(omit(fontFaces, [id]), (candidate): boolean => {
        const keys: Array<keyof FontFace> = [
          'fontDisplay',
          'fontWeight',
          'fontStretch'
        ]

        return isEqual(omit(current, keys), omit(candidate, keys))
      })

      const fontFace: FontFace = {
        ...current,
        fontWeight: reduceFontFaceWeightStretch([
          current.fontWeight,
          ...relevant.map((value) => value.fontWeight)
        ]),
        fontStretch: reduceFontFaceWeightStretch([
          current.fontStretch,
          ...relevant.map((value) => value.fontStretch)
        ]),
        unicodeRange: isFallback ? undefined : current.unicodeRange,
        fontDisplay: isFallback
          ? undefined
          : [
              current.fontDisplay,
              ...relevant.map((value) => value.fontDisplay)
            ].sort(compareFontDisplay)[0]
      }

      const hash = createHash(fontFace)

      return { ...fontFace, fontFamily: `${current.fontFamily}-${hash}` }
    })
  )
}

const toWebFontLocale = (styles: Style[], state: State): WebFontLocale => {
  const style = minifyCss(
    uniq(compact(styles.map((value) => value.style))).join('\n'),
    state.targets.lightningCSS
  )
  const noScriptStyle = minifyCss(
    uniq(compact(styles.map((value) => value.noScriptStyle))).join('\n'),
    state.targets.lightningCSS
  )

  const lookup = compact(
    styles.flatMap((style) => {
      const reference =
        style.fontProperties === undefined
          ? undefined
          : state.configuration.fontProperties.get(style.fontProperties)
              ?.fontFamily

      const fonts = reference?.fonts.map(
        (slug) => state.configuration.fonts.get(slug)! as FontStateHints
      )

      const fallbackFonts = reference?.fallbacks.map(
        (id) => state.configuration.fallbackFonts.get(id)!
      )

      if (fonts === undefined && fallbackFonts === undefined) {
        return undefined
      }

      return { fonts, fallbackFonts }
    })
  )

  // TODO: ensure no overlap over the two
  const fonts = uniqBy(
    compact(lookup.flatMap((value) => value.fonts)),
    (value) => value.slug
  )

  // console.log(fonts.map(value => value.fontFaces))

  const fallbackFonts = uniqBy(
    compact(lookup.flatMap((value) => value.fallbackFonts)),
    (value) => value.font.id
  )

  const fontFace = minifyCss(
    uniqBy(
      compact(
        [...fonts, ...fallbackFonts].flatMap((value) =>
          styles.map(({ id }) => value.fontFaces.get(id))
        )
      ),
      (value) => createHash(pickBy(value, (value) => value !== undefined))
    )
      .map((value) => fontFaceToString(value))
      .join('\n\n'),
    state.targets.lightningCSS
  )

  const order = last(
    toposort(
      reduce(
        compact(styles.map((value) => value.graph)),
        (a, b) => reduceGraph(a, b),
        new Map<string, string[]>()
      )
    ).map((value) => Array.from(value))
  )

  const webFont = fonts.map((font): WebFont => {
    const fontFaces = uniqBy(
      compact(styles.map(({ id }) => font.fontFaces.get(id))).map((value) =>
        pick(value, ['fontWeight', 'fontStyle', 'fontStretch', 'fontFamily'])
      ),
      (value) => createHash(value)
    )

    const output: WebFont = {
      slug: font.slug,
      fontFace:
        fontFaces.length === 0
          ? undefined
          : fontFaces.map(
              (value) =>
                pickBy(
                  {
                    fontFamily: value.fontFamily,
                    fontWeight:
                      value.fontWeight === 400 ? undefined : value.fontWeight,
                    fontStyle:
                      value.fontStyle === 'normal'
                        ? undefined
                        : value.fontStyle,
                    fontStretch:
                      value.fontStretch === 100 ? undefined : value.fontStretch
                  },
                  (value) => value !== undefined
                ) as ValuesType<Required<WebFont>['fontFace']>
            ),
      testString: font.font.testString,
      tech: font.font.tech,
      prefer: Array.isArray(font.font.prefer)
        ? uniq(
            fontSort(font.font.prefer, state.configurationDirectory).fonts.map(
              (value) => value.slug
            )
          )
        : undefined,
      resourceHint:
        font.resourceHints.length === 0 ? undefined : font.resourceHints
    }

    return pickBy(output, (value) => value !== undefined) as WebFont
  })

  const output: WebFontLocale = {
    font: webFont,
    fontFace,
    noScriptStyle,
    style,
    order
  }

  return pickBy(output, (value) => value !== undefined) as WebFontLocale
}

const toWebFontsJson = async (state: State): Promise<WebFontsJson> => {
  const combined = toWebFontLocale(state.configuration.styles, state)
  const locale = mapValues(state.configuration.locales, (style) =>
    toWebFontLocale(style, state)
  )

  return {
    ...combined,
    locale,
    script: await fontLoaderScript(
      state,
      map(
        locale,
        (value, locale) =>
          [locale, value.font.map((value) => value.slug)] as const
      ),
      combined.font
    )
  }
}

export const webFonts = async (options: Options = {}) => {
  const state = await createState(options)

  for (const slug of state.configuration.fonts.keys()) {
    await fontWrite(slug, state)
  }

  for (const slug of state.configuration.fonts.keys()) {
    const fontState = state.configuration.fonts.get(slug) as FontStateWritten
    const { font } = fontState

    const resourceHints: ResourceHint[] = compact([
      font.resourceHint === undefined
        ? undefined
        : {
            as: 'font',
            href: urljoin(
              state.publicPath,
              `${font.name ?? slug}.${font.format[0]}`
            ),
            rel: font.resourceHint,
            type: `font/${font.format[0]}`,
            crossorigin: 'anonymous'
          }
    ])

    state.configuration.fonts.set(slug, {
      ...fontState,
      type: TypeFontState.Hints,
      resourceHints
    })
  }

  for (const style of state.configuration.styles) {
    const seen = new Set<string>()

    if (style.fontProperties === undefined || seen.has(style.fontProperties)) {
      continue
    }

    seen.add(style.fontProperties)

    const fontProperties = state.configuration.fontProperties.get(
      style.fontProperties
    )!

    if (fontProperties.fontFamily === undefined) {
      continue
    }

    const fonts = fontProperties.fontFamily.fonts.map(
      (slug) => state.configuration.fonts.get(slug)!
    ) as FontStateHints[]

    const fallbackFonts = fontProperties.fontFamily.fallbacks.map(
      (slug) => state.configuration.fallbackFonts.get(slug)!
    )

    const primaryFont = first(fonts)!
    const secondaryFonts = fonts.slice(1)
    const primaryFontMetrics = fontMetrics(
      await fontOpen(primaryFont, fontProperties)
    )

    primaryFont.fontFaces.set(
      style.id,
      fontFace({
        type: 'font',
        font: primaryFont,
        fontProperties,
        publicPath: state.publicPath
      })
    )

    for (const secondaryFont of secondaryFonts) {
      secondaryFont.fontFaces.set(
        style.id,
        fontFace({
          type: 'font',
          font: secondaryFont,
          fontProperties,
          publicPath: state.publicPath,
          adjustments: fontAdjust(
            primaryFontMetrics,
            fontMetrics(await fontOpen(secondaryFont, fontProperties))
          )
        })
      )
    }

    for (const fallbackFont of fallbackFonts) {
      fallbackFont.fontFaces.set(
        style.id,
        fontFace({
          type: 'fallback',
          font: fallbackFont,
          fontProperties,
          publicPath: state.publicPath,
          adjustments: fontAdjust(primaryFontMetrics, fallbackFont.font)
        })
      )
    }
  }

  for (const slug of state.configuration.fonts.keys()) {
    const fontState = state.configuration.fonts.get(slug) as FontStateHints

    fontState.fontFaces = new Map(
      compactFontFaces(
        cloneDeep(Object.fromEntries(fontState.fontFaces.entries())),
        false
      )
    )
  }

  for (const slug of state.configuration.fallbackFonts.keys()) {
    const fallbackFontState = state.configuration.fallbackFonts.get(slug)!

    fallbackFontState.fontFaces = new Map(
      compactFontFaces(
        cloneDeep(Object.fromEntries(fallbackFontState.fontFaces.entries())),
        true
      )
    )
  }

  for (const style of state.configuration.styles) {
    const atRulesOpen = style.atRules.map(
      (value) => `${value.type} ${value.value} { `
    )
    const atRulesClose = style.atRules.map(() => `}`)

    const fontProperties =
      style.fontProperties === undefined
        ? undefined
        : state.configuration.fontProperties.get(style.fontProperties)!

    const fontFamilies = compact(
      fontProperties?.fontFamily?.fonts.map((slug) => {
        const value = state.configuration.fonts
          .get(slug)
          ?.fontFaces.get(style.id)

        if (value !== undefined) {
          return { slug, fontFamily: value.fontFamily }
        }

        return undefined
      })
    )

    const fallbackFontFamilies = compact(
      fontProperties?.fontFamily?.fallbacks.map((slug) =>
        state.configuration.fallbackFonts.get(slug)?.fontFaces.get(style.id)
      )
    ).map((value) => value.fontFamily)

    const combinedFontFamilies = [
      ...fontFamilies.map((value) => value.fontFamily),
      ...fallbackFontFamilies
    ]

    const fontWeight = style.fontPropertiesKeys.includes('fontWeight')
      ? fontProperties?.fontWeight
      : undefined

    const fontStretch = style.fontPropertiesKeys.includes('fontStretch')
      ? fontProperties?.fontStretch === undefined
        ? undefined
        : `${fontProperties.fontStretch}%`
      : undefined

    const fontStyle = style.fontPropertiesKeys.includes('fontStyle')
      ? fontProperties?.fontStyle
      : undefined

    const noScriptStyleProperties = pickBy(
      {
        fontFamily: style.fontPropertiesKeys.includes('fontFamily')
          ? combinedFontFamilies.length === 0
            ? undefined
            : combinedFontFamilies
                .map((value) => quoteFontFamily(value))
                .join(', ')
          : undefined,
        fontWeight,
        fontStretch,
        fontStyle,
        ...style.properties
      },
      (value) => value !== undefined
    )

    const selectorFallback = `html:lang(${style.locale}) .${style.classname} {`

    const noScriptStyle: string | undefined = isEmpty(noScriptStyleProperties)
      ? undefined
      : compact([
          ...atRulesOpen,
          selectorFallback,
          iterateProperties(noScriptStyleProperties),
          `}`,
          ...atRulesClose
        ]).join('\n')

    const fallbackStyleProperties = pickBy(
      {
        fontFamily: style.fontPropertiesKeys.includes('fontFamily')
          ? fallbackFontFamilies.length === 0
            ? undefined
            : fallbackFontFamilies
                .map((value) => quoteFontFamily(value))
                .join(', ')
          : undefined,
        fontWeight,
        fontStretch,
        fontStyle,
        ...style.properties
      },
      (value) => value !== undefined
    )

    const fallbackStyle: string | undefined = isEmpty(fallbackStyleProperties)
      ? undefined
      : compact([
          ...atRulesOpen,
          selectorFallback,
          iterateProperties(fallbackStyleProperties),
          `}`,
          ...atRulesClose
        ]).join('\n')

    const fontFamilyCombinations = map(
      combinations(fontFamilies.map((value) => value.slug)),
      (value) =>
        map(value, (value) => find(fontFamilies, ({ slug }) => slug === value)!)
    )

    const primaryStyles = compact([
      fallbackStyle,
      ...fontFamilyCombinations.map((fonts): string | undefined => {
        const selector = `html${map(
          fonts,
          ({ slug }) => `[data-fonts-loaded~='${slug}']`
        ).join('')}:lang(${style.locale}) .${style.classname} {`

        const combinedFontFamilies = [
          ...fonts.map((value) => value.fontFamily),
          ...fallbackFontFamilies
        ]

        const properties = pickBy(
          {
            fontFamily: style.fontPropertiesKeys.includes('fontFamily')
              ? combinedFontFamilies.length === 0
                ? undefined
                : combinedFontFamilies
                    .map((value) => quoteFontFamily(value))
                    .join(', ')
              : undefined
          },
          (value) => value !== undefined
        )

        return isEmpty(properties)
          ? undefined
          : compact([
              ...atRulesOpen,
              selector,
              iterateProperties(properties),
              `}`,
              ...atRulesClose
            ]).join('\n')
      })
    ])

    style.style =
      primaryStyles.length === 0 ? undefined : primaryStyles.join('\n')
    style.noScriptStyle = noScriptStyle
  }

  const result = await toWebFontsJson(state)
  await fse.mkdirp(path.dirname(state.jsonFile))
  await fse.writeFile(state.jsonFile, stringify(result, null, 2))

  return result
}
