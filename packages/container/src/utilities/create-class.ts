import { find, flatMap, map, uniq } from 'lodash-es'
import {
  ResourceHint,
  State,
  TypeInferClass,
  TypeInferFont,
  TypeInferFontExtended
} from '../types'
import { combinations } from './combinations'
import { createFont } from './create-font'
import { quoteFontFamily } from './quote-font-family'
import { style } from './style'
import { toposort } from './toposort'

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

export const createClass = (
  locale: string,
  className: string,
  initialClass: TypeInferClass,
  state: State
) => {
  const fallbacks = initialClass.fontFamily.fallbacks

  const { graph, fonts } = orederFonts(initialClass.fontFamily.fonts, state)

  const resourceHint: ResourceHint[] = flatMap(
    fonts,
    (value) => value.resourceHint
  )

  const fontFace: string[] = flatMap(fonts, (value) => value.fontFace)

  const selectorFallback = `html:lang(${locale}) .${className}`

  const styles: string[] = []

  const noScriptStyle: string[] = [
    style(
      selectorFallback,
      {
        ...initialClass,
        fontFamily: uniq([...map(fonts, (value) => value.family), ...fallbacks])
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
          fontFamily: uniq(fallbacks).map(quoteFontFamily).join(', ')
        },
        state.targets.lightningCSS
      )
    )
  }

  const comb = map(combinations(map(fonts, (value) => value.slug)), (value) =>
    map(
      value,
      (value) =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        find(fonts, ({ slug }) => slug === value)!
    )
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
          fontFamily: uniq([
            ...map(fonts, (value) => value.family),
            ...fallbacks
          ])
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
    fontFace: uniq(fontFace),
    noScriptStyle: uniq(noScriptStyle),
    style: uniq(styles),
    fonts,
    graph
  }
}
