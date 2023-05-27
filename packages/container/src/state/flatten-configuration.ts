import { randomUUID } from 'crypto'
import {
  compact,
  defaults,
  flatMap,
  groupBy,
  isEmpty,
  omit,
  pick,
  pickBy,
  uniq
} from 'lodash-es'
import { fontSort } from '../font/font-sort'
import {
  AtRule,
  Configuration,
  FontFallback,
  FontProperties,
  FontState,
  Style
} from '../types'
import { createHash } from '../utilities/create-hash'
import { toposortReverse } from '../utilities/toposort'
import {
  CSSProperties,
  Fallback,
  InferFont,
  InferFontProperties,
  InferLocales,
  StyleRule,
  schemaFontProperties
} from './user-schema'

// "wght" font-weight
// "wdth" font-stretch
// "slnt" font-style: oblique + angle
// "ital" font-style: italic
// "opsz" font-optical-sizing

interface FlattenedStyleRule {
  id: string
  parent?: string
  atRules: AtRule[]
  properties: CSSProperties<{}>
  fontProperties: InferFontProperties[]
  // fontPropertiesKeys: Style['fontPropertiesKeys']
}

export const schemaFontPropertiesKeys = schemaFontProperties.keyof().options

const isAsdEmpty = (current: FlattenedStyleRule) =>
  isEmpty(pickBy(current.fontProperties, (value) => value !== undefined)) &&
  isEmpty(pickBy(current.properties, (value) => value !== undefined))

const flattenStyleRule = (
  rule: StyleRule<InferFontProperties>,
  parent?: FlattenedStyleRule
): FlattenedStyleRule[] => {
  const currentFontProperties = pick(rule, schemaFontPropertiesKeys)
  const currentProperties: CSSProperties<{}> = omit(rule, [
    '@supports',
    '@media',
    ...schemaFontPropertiesKeys
  ])

  // const fontPropertiesKeys = keys(
  //   pickBy(
  //     rule,
  //     (value, key) =>
  //       includes(schemaFontPropertiesKeys, key) && typeof value !== 'undefined'
  //   )
  // ) as Style['fontPropertiesKeys']

  const fontProperties: InferFontProperties[] = [
    ...(parent?.fontProperties ?? []),
    currentFontProperties
  ].filter((value) => !isEmpty(value))

  const properties: CSSProperties<{}> = currentProperties

  const current: FlattenedStyleRule = {
    id: randomUUID(),
    parent: parent?.id,
    atRules: [...(parent?.atRules ?? [])],
    fontProperties,
    properties
    // fontPropertiesKeys
  }

  return [
    current,
    ...flatMap(
      pick(rule, ['@supports', '@media']),
      (value, type): FlattenedStyleRule[] => {
        if (
          isEmpty(pickBy(value, (value) => value !== undefined)) ||
          value === undefined
        ) {
          return []
        }

        return flatMap(value, (rule, value): FlattenedStyleRule[] =>
          flattenStyleRule(rule, {
            ...current,
            atRules: [
              ...current.atRules,
              {
                type: type as '@supports' | '@media',
                value
              }
            ]
          })
        )
      }
    )
  ].filter((value) => !isAsdEmpty(value))
}

export const reduceGraph = (
  a: Map<string, string[]>,
  b: Map<string, string[]>
): Map<string, string[]> => {
  const graph: Map<string, string[]> = new Map()

  uniq([...a.keys(), ...b.keys()]).forEach((key) => {
    graph.set(key, uniq([...(a.get(key) ?? []), ...(b.get(key) ?? [])]))
  })

  return graph
}

export const flattenConfiguration = (
  locales: InferLocales,
  cwd: string
): Configuration => {
  const fonts: Map<string, FontState> = new Map()
  const fallbacks: Map<string, FontFallback> = new Map()
  const fontProperties: Map<string, Required<FontProperties>> = new Map()

  const reduceFontFamily = (fontFamily?: {
    fallbacks: Fallback[]
    fonts: InferFont[]
  }) => {
    if (fontFamily === undefined) {
      return undefined
    }

    const _fallbacks = fontFamily.fallbacks.map((value) => {
      if (!fallbacks.has(value.id)) {
        fallbacks.set(value.id, { font: value, fontFaces: new Map() })
      }

      return value.id
    })

    const sorted = fontSort(fontFamily.fonts, cwd)

    const _fonts = sorted.fonts.map((state): string => {
      const slug = state.slug

      if (!fonts.has(slug)) {
        fonts.set(slug, state)
      }

      return slug
    })

    return {
      fontFamily: {
        fallbacks: _fallbacks,
        fonts: _fonts
      },
      graph: sorted.graph
    }
  }

  const reduceFontProperties = (infered: InferFontProperties[]) => {
    const fontPropertiesAndGraphArray = infered.map(
      (
        p
      ):
        | { fontProperties: FontProperties; graph?: Map<string, string[]> }
        | undefined => {
        const value = reduceFontFamily(p.fontFamily)

        return {
          graph: value?.graph,
          fontProperties: {
            ...p,
            fontFamily: value?.fontFamily
          }
        }
      }
    )

    const fontPropertiesArray: FontProperties[] = compact(
      fontPropertiesAndGraphArray.map((value) => value?.fontProperties)
    )

    if (fontPropertiesArray.length === 0) {
      return undefined
    }

    const p = defaults({}, ...fontPropertiesArray.reverse()) as FontProperties

    const _fontProperties: Required<FontProperties> = {
      fontFamily: p.fontFamily,
      fontWeight: p.fontWeight ?? 400,
      fontStyle: p.fontStyle ?? 'normal',
      fontStretch: p.fontStretch ?? 100,
      fontVariationSettings: p.fontVariationSettings ?? 'normal'
    }

    const id = createHash(_fontProperties)

    if (!fontProperties.has(id)) {
      fontProperties.set(id, _fontProperties)
    }

    const graph = compact(
      fontPropertiesAndGraphArray.map((value) => value?.graph)
    ).reduce(
      (prev, next) => reduceGraph(prev, next),
      new Map<string, string[]>()
    )

    return { id, graph }
  }

  const styles: Style[] = flatMap(locales, (value, locale) => {
    return flatMap(value, (styleRule, classname) => {
      return flattenStyleRule(styleRule).map((value) => {
        const reducedFontProperties = reduceFontProperties(value.fontProperties)

        return {
          locale,
          classname,
          ...value,
          fontProperties: reducedFontProperties?.id,
          graph: reducedFontProperties?.graph
        }
      })
    })
  })

  const sortedStyles = compact(
    uniq(
      toposortReverse(
        new Map(
          styles.map(
            (value) =>
              [
                value.id,
                value.parent === undefined ? [] : [value.parent]
              ] as const
          )
        )
      ).flatMap((value) => Array.from(value))
    ).map((id) => styles.find((value) => value.id === id))
  )

  const slugsAndNames = Array.from(fonts.values()).map(
    (value): [string, string] => [value.slug, value.font.name ?? value.slug]
  )

  if (
    uniq(flatMap(slugsAndNames, (value) => value[0])).length !==
    uniq(flatMap(slugsAndNames, (value) => value[1])).length
  ) {
    throw new Error('Conflicting font names.')
  }

  return {
    fonts,
    fallbackFonts: fallbacks,
    styles: sortedStyles,
    fontProperties,
    locales: groupBy(styles, (value) => value.locale)
  }
}
