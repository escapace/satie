import { uniq, uniqBy } from 'lodash-es'
import { InferFont } from '../state/user-schema'
import { toposort } from '../utilities/toposort'
import { fontSlug } from './font-slug'
import { FontStateInitial, TypeFontState } from '../types'

export interface FontsSorted {
  fonts: FontStateInitial[]
  graph: Map<string, string[]>
}

const hasFontOverlap = (fonts: InferFont[], cwd: string) =>
  uniqBy(fonts, (value) => fontSlug(value, cwd)).length !== fonts.length

export const fontSort = (initial: InferFont[], cwd: string): FontsSorted => {
  // if (initial.length === 0) {
  //   throw new Error('At least one font is necessary.')
  // }

  if (hasFontOverlap(initial, cwd)) {
    throw new Error('One of the classes has font overlaps.')
  }

  const graph = new Map<string, string[]>()
  const fonts = new Map<string, FontStateInitial>()

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

  const next = (values: InferFont[], parent?: string) => {
    values.forEach((font) => {
      const slug = fontSlug(font, cwd)

      if (!fonts.has(slug)) {
        fonts.set(slug, {
          type: TypeFontState.Initial,
          slug,
          font,
          fontFaces: new Map()
        })
      }

      add(slug, parent)

      next(font.prefer ?? [], slug)
    })
  }

  next(initial)

  const order = toposort(graph).map((value) => Array.from(value))

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const sortedFonts = uniq(order.flat()).map((value) => fonts.get(value)!)

  return { fonts: sortedFonts, graph }
}
