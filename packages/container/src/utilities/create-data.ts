import {
  flatMap,
  fromPairs,
  keys,
  last,
  map,
  mapValues,
  omit,
  pick,
  reduce,
  uniq,
  uniqBy,
  values
} from 'lodash-es'
import {
  Data,
  DataFont,
  DataLocale,
  DataLocales,
  ResourceHint,
  State
} from '../types'
import { createClass } from '../utilities/create-class'
import { minifyCss } from './minify-css'
import { toposort } from './toposort'

interface Accumulator {
  resourceHint: ResourceHint[]
  fontFace: string[]
  noScriptStyle: string[]
  style: string[]
  graph: Map<string, string[]>
}

interface AccumulatorWithFonts extends Accumulator {
  fonts: DataFont[]
}

const accumulate = (
  accumulator: Accumulator,
  value: Accumulator
): Accumulator => {
  const resourceHint: ResourceHint[] = uniq([
    ...accumulator.resourceHint,
    ...value.resourceHint
  ])

  const fontFace: string[] = uniq([...accumulator.fontFace, ...value.fontFace])

  const noScriptStyle: string[] = uniq([
    ...accumulator.noScriptStyle,
    ...value.noScriptStyle
  ])

  const style: string[] = uniq([...accumulator.style, ...value.style])

  const graph: Map<string, string[]> = new Map()

  uniq([...value.graph.keys(), ...accumulator.graph.keys()]).forEach((key) => {
    graph.set(
      key,
      uniq([
        ...(accumulator.graph.get(key) ?? []),
        ...(value.graph.get(key) ?? [])
      ])
    )
  })

  return {
    fontFace,
    noScriptStyle,
    resourceHint,
    style,
    graph
  }
}

const wrap = (
  value: string[],
  key: string,
  state: State
): string | undefined => {
  if (value.length === 0) {
    return undefined
  }

  switch (key) {
    case 'style':
      return minifyCss(value.join(''), state.targets.lightningCSS)
    case 'fontFace':
      return minifyCss(value.join(''), state.targets.lightningCSS)
    case 'noScriptStyle':
      return minifyCss(value.join(''), state.targets.lightningCSS)
    case 'resourceHint':
      return value.join('')
    default:
      return undefined
  }
}

const transpose = (map: Map<string, string[]>): Map<string, string[]> => {
  const result: Map<string, string[]> = new Map()

  for (const [key, values] of map.entries()) {
    for (const value of values) {
      if (!result.has(value)) {
        result.set(value, [])
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const array = result.get(value)!

      if (!array.includes(key)) {
        array.push(key)
      }
    }
  }

  return result
}

export const createData = (state: State): Data => {
  const localeAccumulator = fromPairs(
    map(state.locales, (value, locale): [string, AccumulatorWithFonts] => {
      const classes = map(value, (value, className) =>
        createClass(locale, className, value, state)
      )

      const withFonts: AccumulatorWithFonts = reduce(
        classes,
        (acc, value) => {
          const values = accumulate(acc, value)

          const fonts = uniqBy(
            [
              ...acc.fonts,
              ...map(value.fonts, (value) => ({
                prefer: [],
                ...pick(value, [
                  'family',
                  'slug',
                  'stretch',
                  'style',
                  'tech',
                  'testString',
                  'weight'
                ])
              }))
            ],
            (value) => value.slug
          )

          return {
            ...values,
            fonts
          }
        },
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        {
          graph: new Map(),
          fontFace: [],
          fonts: [],
          noScriptStyle: [],
          resourceHint: [],
          style: []
        } as AccumulatorWithFonts
      )

      return [locale, withFonts]
    })
  )

  const localeIndex: Array<[string, string[]]> = map(
    keys(localeAccumulator),
    (locale): [string, string[]] => [
      locale,
      last(
        toposort(localeAccumulator[locale].graph).map((value) =>
          Array.from(value)
        )
      ) as string[]
    ]
  )

  const localeIndexMap = new Map(localeIndex)

  const locales: DataLocales = mapValues(localeAccumulator, (value, key) => {
    const graph = transpose(value.graph)

    const locale: DataLocale = {
      ...omit(value, ['graph']),
      ...mapValues(
        pick(value, ['style', 'fontFace', 'noScriptStyle']),
        (value, key) => wrap(value, key, state)
      ),
      fonts: value.fonts.map((font) => ({
        ...font,
        prefer: graph.get(font.slug) ?? []
      })),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      order: localeIndexMap.get(key)!
    }

    return locale
  })

  const fontsIndex: Array<[string, DataFont]> = flatMap(locales, (locale) =>
    map(locale.fonts, (value): [string, DataFont] => [value.slug, value])
  )

  const fonts = uniqBy(
    flatMap(fontsIndex, ([_, value]) => value),
    ({ slug }) => slug
  )

  const { style, fontFace, noScriptStyle } = mapValues(
    omit(
      reduce(
        values(localeAccumulator),
        (accumulator, value) => accumulate(accumulator, value),
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        {
          graph: new Map(),
          fontFace: [],
          noScriptStyle: [],
          resourceHint: [],
          style: []
        } as Accumulator
      ),
      ['resourceHint', 'graph']
    ),
    (value, key) => wrap(value, key, state)
  )

  return {
    style,
    fontFace,
    noScriptStyle,
    fonts,
    fontsIndex,
    localeIndex,
    locales
  }
}
