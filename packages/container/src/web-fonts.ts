/* eslint-disable @typescript-eslint/no-non-null-assertion */
import fse from 'fs-extra'
import {
  cloneDeep,
  compact,
  find,
  first,
  forEach,
  includes,
  isEmpty,
  isEqual,
  last,
  map,
  mapValues,
  omit,
  pick,
  pickBy,
  reduce,
  sortBy,
  uniq,
  uniqBy
} from 'lodash-es'
import path from 'path'
import stringify from 'safe-stable-stringify'
import type { ValuesType } from 'utility-types'
import { fontAdjust } from './font/font-adjust'
import { fontFace } from './font/font-face'
import { fontFaceCompact } from './font/font-face-compact'
import { fontFamilyJoin } from './font/font-family-join'
import { fontLoaderScript } from './font/font-loader-script'
import { fontMetrics } from './font/font-metrics'
import { fontOpen } from './font/font-open'
import { fontResourceHint } from './font/font-resource-hint'
import { fontSort } from './font/font-sort'
import { fontWrite } from './font/font-write'
import { createState } from './state/create-state'
import {
  reduceGraph,
  schemaFontPropertiesKeys
} from './state/flatten-configuration'
import {
  CSSProperties,
  WebFont,
  WebFontLocale,
  WebFontsJson
} from './state/user-schema'
import {
  FontProperties,
  FontStateWritten,
  Options,
  State,
  Style
} from './types'
import { combinations } from './utilities/combinations'
import { createHash } from './utilities/create-hash'
import { fontFaceToString } from './utilities/font-face-to-string'
import { minifyCss } from './utilities/minify-css'
import { iterateProperties } from './utilities/style'
import { toposort } from './utilities/toposort'

const toLang = (locale: string, state: State): string =>
  uniq([locale, ...(state.configuration.localeToAlias.get(locale) ?? [])])
    .sort((a, b) => a.localeCompare(b))
    .map((value) => `"${value}"`)
    .join(', ')

const stylePropertiesToString = (
  style: Style,
  selector: string,
  properties?: CSSProperties<{}>
) => {
  if (isEmpty(properties)) {
    return undefined
  }

  const atRulesOpen = style.atRules.map(
    (value) => `${value.type} ${value.value} { `
  )
  const atRulesClose = style.atRules.map(() => `}`)

  return compact([
    ...atRulesOpen,
    `${selector} {`,
    iterateProperties(properties),
    `}`,
    ...atRulesClose
  ]).join('\n')
}

const selectorParent = (style: Style, state: State) =>
  style.parent === undefined
    ? undefined
    : find(state.configuration.styles, (value) => value.id === style.parent)

const selectorStyleProperties = (
  style: Style,
  type: 'noScriptStyleProperties' | 'fallbackStyleProperties',
  state: State
): CSSProperties<{}> | undefined => {
  const parent = selectorParent(style, state)

  const value = pickBy(style[type], (value, key) => {
    if (includes(schemaFontPropertiesKeys, key)) {
      if (parent !== undefined) {
        const parentValue =
          parent[type] === undefined
            ? undefined
            : parent[type]![key as keyof CSSProperties<{}>]

        if (isEqual(value, parentValue)) {
          return false
        }
      }
      // else if (key === 'fontStretch' && value === '100%') {
      //   return false
      // } else if (key === 'fontWeight' && value === 400) {
      //   return false
      // } else if (key === 'fontStyle' && value === 'normal') {
      //   return false
      // } else if (key === 'fontVariationSettings' && value === 'normal') {
      //   return false
      // }
    }

    return true
  })

  return isEmpty(value) ? undefined : value
}

const selectorFontProperties = (
  style: Style,
  state: State
): Required<FontProperties> | undefined => {
  return style.fontProperties === undefined
    ? undefined
    : state.configuration.fontProperties.get(style.fontProperties)!
}

const selectorFontVariationSettings = (style: Style, state: State) => {
  const fontProperties = selectorFontProperties(style, state)

  return fontProperties?.fontVariationSettings === undefined
    ? undefined
    : fontProperties.fontVariationSettings === 'normal'
    ? 'normal'
    : sortBy(
        uniqBy(
          Object.entries(fontProperties.fontVariationSettings),
          ([key]) => key
        ),
        ([key]) => key
      )
        .map(([key, value]) => `"${key}" ${value}`)
        .join(', ')
}

const selectorFontFamilies = (
  style: Style,
  state: State
): Array<{
  slug: string
  fontFamily: string
}> => {
  return compact(
    selectorFontProperties(style, state)?.fontFamily?.fonts.map((slug) => {
      const value = state.configuration.fonts.get(slug)?.fontFaces.get(style.id)

      if (value !== undefined) {
        return { slug, fontFamily: value.fontFamily }
      }

      return undefined
    })
  )
}

const selectorFallbackFontFamilies = (style: Style, state: State): string[] => {
  const fontProperties = selectorFontProperties(style, state)

  return compact(
    fontProperties?.fontFamily?.fallbacks.map((slug) =>
      state.configuration.fallbackFonts.get(slug)?.fontFaces.get(style.id)
    )
  ).map((value) => value.fontFamily)
}

const toWebFontLocale = (styles: Style[], state: State): WebFontLocale => {
  const style = minifyCss(
    [
      ...uniq(compact(styles.map((value) => value.fallbackStyle))),
      ...uniq(compact(styles.map((value) => value.style)))
    ].join('\n'),
    state.targets.lightningcss
  )

  const noScriptStyle = minifyCss(
    uniq(compact(styles.map((value) => value.noScriptStyle))).join('\n'),
    state.targets.lightningcss
  )

  const lookup = compact(
    styles.flatMap((style) => {
      const reference =
        style.fontProperties === undefined
          ? undefined
          : state.configuration.fontProperties.get(style.fontProperties)
              ?.fontFamily

      const fonts = reference?.fonts.map(
        (slug) => state.configuration.fonts.get(slug)! as FontStateWritten
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

  const fonts = uniqBy(
    compact(lookup.flatMap((value) => value.fonts)),
    (value) => value.slug
  )

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
      .sort((a, b) =>
        a.fontFamily.localeCompare(b.fontFamily, 'en-us', {
          usage: 'sort',
          sensitivity: 'variant'
        })
      )
      .map((value) => fontFaceToString(value))
      .join('\n\n'),
    state.targets.lightningcss
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
      resourceHint: fontResourceHint(font.slug, state)
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

  const aliasPartial = map(locale, (_, locale) =>
    (state.configuration.localeToAlias.get(locale) ?? []).map(
      (alias) => [alias, locale] as const
    )
  ).flat()

  const locales = [
    ...map(
      locale,
      (value, locale) =>
        [locale, value.font.map((value) => value.slug)] as const
    ),
    ...aliasPartial
  ]

  const alias = [...aliasPartial]

  forEach(locale, (_, locale) => alias.push([locale, locale]))

  return {
    ...combined,
    alias: Object.fromEntries(alias),
    locale,
    script: await fontLoaderScript(
      state,
      locales,
      // resourceHint is not useful for the font loader
      combined.font.map((value) => omit(value, ['resourceHint']))
    )
  }
}

export const webFonts = async (options: Options = {}) => {
  const state = await createState(options)

  for (const slug of state.configuration.fonts.keys()) {
    await fontWrite(slug, state)
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
    ) as FontStateWritten[]

    const fallbackFonts = fontProperties.fontFamily.fallbacks.map(
      (slug) => state.configuration.fallbackFonts.get(slug)!
    )

    const primaryFont = first(fonts)
    const secondaryFonts = fonts.slice(1)
    const primaryFontMetrics =
      (primaryFont === undefined
        ? undefined
        : fontMetrics(
            (await fontOpen(primaryFont, fontProperties, state)).font
          )) ?? fallbackFonts[0].font

    primaryFont?.fontFaces.set(
      style.id,
      await fontFace(
        {
          type: 'font',
          font: primaryFont,
          fontProperties,
          publicPath: state.publicPath
        },
        state
      )
    )

    for (const secondaryFont of secondaryFonts) {
      secondaryFont.fontFaces.set(
        style.id,
        await fontFace(
          {
            type: 'font',
            font: secondaryFont,
            fontProperties,
            publicPath: state.publicPath,
            adjustments: fontAdjust(
              primaryFontMetrics,
              fontMetrics(
                (
                  await fontOpen(secondaryFont, fontProperties, state)
                ).font
              )
            )
          },
          state
        )
      )
    }

    for (const fallbackFont of fallbackFonts) {
      fallbackFont.fontFaces.set(
        style.id,
        await fontFace(
          {
            type: 'fallback',
            font: fallbackFont,
            fontProperties,
            publicPath: state.publicPath,
            adjustments: fontAdjust(primaryFontMetrics, fallbackFont.font)
          },
          state
        )
      )
    }
  }

  for (const slug of state.configuration.fonts.keys()) {
    const fontState = state.configuration.fonts.get(slug) as FontStateWritten

    fontState.fontFaces = new Map(
      fontFaceCompact(
        cloneDeep(Object.fromEntries(fontState.fontFaces.entries())),
        false
      )
    )
  }

  for (const slug of state.configuration.fallbackFonts.keys()) {
    const fallbackFontState = state.configuration.fallbackFonts.get(slug)!

    fallbackFontState.fontFaces = new Map(
      fontFaceCompact(
        cloneDeep(Object.fromEntries(fallbackFontState.fontFaces.entries())),
        true
      )
    )
  }

  for (const style of state.configuration.styles) {
    const fontProperties = selectorFontProperties(style, state)
    const fontFamilies = selectorFontFamilies(style, state)
    const fallbackFontFamilies = selectorFallbackFontFamilies(style, state)

    const combinedFontFamilies = [
      ...fontFamilies.map((value) => value.fontFamily),
      ...fallbackFontFamilies
    ]

    const isRoot = selectorParent(style, state) === undefined

    const sharedStyleProperties: CSSProperties<{}> = {
      fontSynthesis: isRoot ? 'none' : undefined,
      fontWeight: fontProperties?.fontWeight,
      fontStretch:
        fontProperties?.fontStretch === undefined
          ? undefined
          : `${fontProperties.fontStretch}%`,
      fontStyle: fontProperties?.fontStyle,
      fontVariationSettings: selectorFontVariationSettings(style, state),
      ...style.properties
    }

    style.noScriptStyleProperties = pickBy(
      {
        ...sharedStyleProperties,
        fontFamily: fontFamilyJoin(combinedFontFamilies)
      },
      (value) => value !== undefined
    ) as CSSProperties<{}>

    style.fallbackStyleProperties = pickBy(
      {
        ...sharedStyleProperties,
        fontFamily: fontFamilyJoin(fallbackFontFamilies)
      },
      (value) => value !== undefined
    ) as CSSProperties<{}>
  }

  for (const style of state.configuration.styles) {
    const noScriptStyleProperties = selectorStyleProperties(
      style,
      'noScriptStyleProperties',
      state
    )

    const fallbackStyleProperties = selectorStyleProperties(
      style,
      'fallbackStyleProperties',
      state
    )

    const fontFamilies = selectorFontFamilies(style, state)
    const fallbackFontFamilies = selectorFallbackFontFamilies(style, state)
    const fontFamilyCombinations = map(
      combinations(fontFamilies.map((value) => value.slug)),
      (value) =>
        map(value, (value) => find(fontFamilies, ({ slug }) => slug === value)!)
    )

    const primaryStyles = compact(
      fontFamilyCombinations.map((fonts): string | undefined => {
        const selector = `html${map(
          fonts,
          ({ slug }) => `[data-fonts-loaded~='${slug}']`
        ).join('')}:lang(${toLang(style.locale, state)}) .${style.classname}`

        return stylePropertiesToString(
          style,
          selector,
          pickBy(
            {
              fontFamily: fontFamilyJoin([
                ...fonts.map((value) => value.fontFamily),
                ...fallbackFontFamilies
              ])
            },
            (value) => value !== undefined
          )
        )
      })
    )

    style.fallbackStyle = stylePropertiesToString(
      style,
      `html:lang(${toLang(style.locale, state)}) .${style.classname}`,
      fallbackStyleProperties
    )

    style.noScriptStyle = stylePropertiesToString(
      style,
      `html:lang(${toLang(style.locale, state)}) .${style.classname}`,
      noScriptStyleProperties
    )

    style.style =
      primaryStyles.length === 0 ? undefined : primaryStyles.join('\n')
  }

  const result = await toWebFontsJson(state)
  await fse.mkdirp(path.dirname(state.jsonFile))
  await fse.writeFile(state.jsonFile, stringify(result, null, 2))

  return result
}
