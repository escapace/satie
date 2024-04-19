import { randomUUID } from 'node:crypto'
import {
  compact,
  defaults,
  flatMap,
  groupBy,
  has,
  isEmpty,
  map,
  omit,
  pick,
  pickBy,
  uniq
} from 'lodash-es'
import { fontSort } from '../font/font-sort'
import type {
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
  type CSSProperties,
  type Fallback,
  type InferFont,
  type InferFontProperties,
  type InferLocales,
  type StyleRule,
  schemaFontProperties
} from './user-schema'

// "wght" font-weight
// "wdth" font-stretch
// "slnt" font-style: oblique + angle
// "ital" font-style: italic
// "opsz" font-optical-sizing

interface FlattenedStyleRule {
  atRules: AtRule[]
  fontProperties: InferFontProperties[]
  id: string
  parent?: string
  properties: CSSProperties<{}>
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
    atRules: [...(parent?.atRules ?? [])],
    fontProperties,
    id: randomUUID(),
    parent: parent?.id,
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
                type: type as '@media' | '@supports',
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
  const graph = new Map<string, string[]>()

  uniq([...a.keys(), ...b.keys()]).forEach((key) => {
    graph.set(key, uniq([...(a.get(key) ?? []), ...(b.get(key) ?? [])]))
  })

  return graph
}

export const flattenConfiguration = (
  locales: InferLocales,
  cwd: string
): Configuration => {
  const fonts = new Map<string, FontState>()
  const fallbacks = new Map<string, FontFallback>()
  const fontProperties = new Map<string, Required<FontProperties>>()

  const reduceFontFamily = (fontFamily?: {
    fallbacks: Fallback[]
    fonts: InferFont[]
  }) => {
    if (fontFamily === undefined) {
      return
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
          fontProperties: {
            ...p,
            fontFamily: value?.fontFamily
          },
          graph: value?.graph
        }
      }
    )

    const fontPropertiesArray: FontProperties[] = compact(
      fontPropertiesAndGraphArray.map((value) => value?.fontProperties)
    )

    if (fontPropertiesArray.length === 0) {
      return
    }

    const p = defaults({}, ...fontPropertiesArray.reverse()) as FontProperties

    const _fontProperties: Required<FontProperties> = {
      fontFamily: p.fontFamily,
      fontStretch: p.fontStretch ?? 100,
      fontStyle: p.fontStyle ?? 'normal',
      fontVariationSettings: p.fontVariationSettings ?? 'normal',
      fontWeight: p.fontWeight ?? 400
    }

    const id = createHash(_fontProperties)

    if (!fontProperties.has(id)) {
      fontProperties.set(id, _fontProperties)
    }

    const graph = compact(
      fontPropertiesAndGraphArray.map((value) => value?.graph)
    ).reduce(
      (previous, next) => reduceGraph(previous, next),
      new Map<string, string[]>()
    )

    return { graph, id }
  }

  const styles: Style[] = flatMap(locales, (value, locale) => {
    if (typeof value === 'string') {
      return []
    }

    return flatMap(value, (styleRule, classname) =>
      flattenStyleRule(styleRule).map((value) => {
        const reducedFontProperties = reduceFontProperties(value.fontProperties)

        return {
          classname,
          locale,
          ...value,
          fontProperties: reducedFontProperties?.id,
          graph: reducedFontProperties?.graph
        }
      })
    )
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

  const allLocales = groupBy(styles, (value) => value.locale)

  const [localeFromAlias, localeToAlias] = map(locales, (value, key) => {
    if (typeof value === 'string') {
      if (!has(allLocales, value)) {
        return
      }

      if (value === key) {
        return
      }

      return [key, value] as const
    }

    return
  })
    .filter((value): value is [string, string] => value !== undefined)
    .reduce(
      (accumulator, value) => {
        accumulator.forEach((map, index) => {
          const [k, v] = index === 0 ? value : [...value].reverse()

          const array = map.has(k)
            ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              map.get(k)!
            : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              (map.set(k, []), map.get(k)!)

          if (!array.includes(v)) {
            array.push(v)
          }
        })

        return accumulator
      },
      [new Map<string, string[]>(), new Map<string, string[]>()]
    )

  return {
    fallbackFonts: fallbacks,
    fontProperties,
    fonts,
    localeFromAlias,
    locales: allLocales,
    localeToAlias,
    styles: sortedStyles
  }
}
