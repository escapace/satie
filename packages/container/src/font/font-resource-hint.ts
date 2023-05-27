import { compact } from 'lodash-es'
import urljoin from 'url-join'
import { ResourceHint } from '../state/user-schema'
import { FontStateWritten, State } from '../types'

export const fontResourceHint = (
  slug: string,
  state: State
): ResourceHint[] | undefined => {
  const fontState = state.configuration.fonts.get(slug) as
    | FontStateWritten
    | undefined

  if (fontState === undefined) {
    return undefined
  }

  const { font } = fontState

  const array: ResourceHint[] = compact([
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

  return array.length === 0 ? undefined : array
}
