import { find, flatMap, map, pick, uniq } from 'lodash-es'
import { ResourceHint, State, TypeInferClass } from '../types'
import { combinations } from './combinations'
import { createFont } from './create-font'
import { quoteFontFamily } from './quote-font-family'
import { style } from './style'

export const createClass = (
  locale: string,
  className: string,
  value: TypeInferClass,
  state: State
) => {
  const newValue = {
    ...pick(value, ['fontFamily']),
    fonts: map(value.fontFamily.fonts, (value) => createFont(value, state))
  }

  const resourceHint: ResourceHint[] = flatMap(
    newValue.fonts,
    (value) => value.resourceHint
  )

  const fontFace: string[] = flatMap(newValue.fonts, (value) => value.fontFace)

  const selectorFallback = `html:lang(${locale}) .${className}`

  const styles: string[] = []

  const noScriptStyle: string[] = [
    style(
      selectorFallback,
      {
        ...value,
        fontFamily: uniq([
          ...map(newValue.fonts, (value) => value.family),
          ...newValue.fontFamily.fallbacks
        ])
          .map(quoteFontFamily)
          .join(', ')
      },
      state.targets.lightningCSS
    )
  ]

  const writeFallback = newValue.fontFamily.fallbacks.length > 0

  if (writeFallback) {
    styles.push(
      style(
        selectorFallback,
        {
          ...value,
          fontFamily: uniq(newValue.fontFamily.fallbacks)
            .map(quoteFontFamily)
            .join(', ')
        },
        state.targets.lightningCSS
      )
    )
  }

  const comb = map(
    combinations(map(newValue.fonts, (value) => value.slug)),
    (value) =>
      map(
        value,
        (value) =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          find(newValue.fonts, ({ slug }) => slug === value)!
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
          ...value,
          fontFamily: uniq([
            ...map(fonts, (value) => value.family),
            ...newValue.fontFamily.fallbacks
          ])
            .map(quoteFontFamily)
            .join(', '),
          fontWeight: writeFallback ? undefined : value.fontWeight,
          fontStyle: writeFallback ? undefined : value.fontStyle,
          fontStretch: writeFallback ? undefined : value.fontStretch
        },
        state.targets.lightningCSS
      )
    })
  )

  return {
    ...newValue,
    className,
    resourceHint: uniq(resourceHint),
    fontFace: uniq(fontFace),
    noScriptStyle: uniq(noScriptStyle),
    style: uniq(styles)
  }
}
