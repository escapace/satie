import { filter, isEqual, mapValues, omit } from 'lodash-es'
import type { InferFont } from '../state/user-schema'
import type { FontFace, TupleUnion } from '../types'
import { createHash } from '../utilities/create-hash'

const fontDisplayCompact = (value: InferFont['display']) => {
  const priority: TupleUnion<Exclude<InferFont['display'], undefined>> = [
    'block',
    'auto',
    'swap',
    'fallback',
    'optional'
  ]

  return priority.indexOf(value ?? 'auto')
}

// const reduceFontFaceWeightStretch = (
//   value: Array<number | [number, number]>
// ): number | [number, number] => {
//   const array = uniq(value.flatMap((value) => value)).sort((a, b) => a - b)
//
//   return array.length === 1 ? array[0] : [array[0], array[1]]
// }

export const fontFaceCompact = (
  fontFaces: { [k: string]: FontFace },
  isFallback: boolean
): Array<[string, FontFace]> =>
  Object.entries(
    mapValues(fontFaces, (current, id): FontFace => {
      const relevant = filter(omit(fontFaces, [id]), (candidate): boolean => {
        const relevantKeys: Array<keyof FontFace> = [
          'fontDisplay',
          'fontStretch',
          'fontWeight'
        ]

        return isEqual(
          omit(current, relevantKeys),
          omit(candidate, relevantKeys)
        )
      })

      const fontFace: FontFace = {
        ...current,
        fontDisplay: isFallback
          ? undefined
          : [
              current.fontDisplay,
              ...relevant.map((value) => value.fontDisplay)
            ].sort(fontDisplayCompact)[0],
        fontStretch: 100,
        fontStyle: 'normal',
        // fontWeight: isFallback
        //   ? 400
        //   : reduceFontFaceWeightStretch([
        //       current.fontWeight,
        //       ...relevant.map((value) => value.fontWeight)
        //     ]),
        // fontStretch: isFallback
        //   ? 100
        //   : reduceFontFaceWeightStretch([
        //       current.fontStretch,
        //       ...relevant.map((value) => value.fontStretch)
        fontWeight: 400,
        //     ]),
        unicodeRange: isFallback ? undefined : current.unicodeRange
      }

      const hash = createHash(fontFace)

      return { ...fontFace, fontFamily: `${current.fontFamily}-${hash}` }
    })
  )
