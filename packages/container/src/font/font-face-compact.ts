import { filter, isEqual, mapValues, omit } from 'lodash-es'
import { InferFont } from '../state/user-schema'
import { FontFace, TupleUnion } from '../types'
import { createHash } from '../utilities/create-hash'

const fontDisplayCompact = (value: InferFont['display']) => {
  const priority: TupleUnion<Exclude<InferFont['display'], undefined>> = [
    'block',
    'auto',
    'swap',
    'fallback',
    'optional'
  ]

  return priority.indexOf(value === undefined ? 'auto' : value)
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
): Array<[string, FontFace]> => {
  return Object.entries(
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
        fontStyle: 'normal',
        fontWeight: 400,
        fontStretch: 100,
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
        //     ]),
        unicodeRange: isFallback ? undefined : current.unicodeRange,
        fontDisplay: isFallback
          ? undefined
          : [
              current.fontDisplay,
              ...relevant.map((value) => value.fontDisplay)
            ].sort(fontDisplayCompact)[0]
      }

      const hash = createHash(fontFace)

      return { ...fontFace, fontFamily: `${current.fontFamily}-${hash}` }
    })
  )
}
