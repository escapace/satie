import { Font as FontKitFont, open as fontKitOpen } from 'fontkit'
import { compact, find, isEmpty, mapValues, uniq } from 'lodash-es'
import path from 'path'
import { z } from 'zod'
import { FontProperties, FontState, State } from '../types'

// "wght" font-weight
// "wdth" font-stretch
// "slnt" (slant) font-style: oblique + angle
// "ital" font-style: italic
// "opsz" font-optical-sizing

const schemaFontKitVariationAxis = z.object({
  name: z.string().nonempty(),
  min: z.number().int(),
  default: z.number().int(),
  max: z.number().int()
})

const schemaFontKitVariationAxes = z.record(schemaFontKitVariationAxis)

// type FontKitVariationAxis = z.infer<typeof schemaFontKitVariationAxis>
export type FontKitVariationAxes = z.infer<typeof schemaFontKitVariationAxes>

export const isWithin = (x: number, min: number, max: number) =>
  x >= min && x <= max

export const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max)

export const fontOpen = async (
  fontState: Omit<FontState, 'type'>,
  fontProperties: Omit<Required<FontProperties>, 'fontFamily'>,
  state: State
): Promise<{
  font: FontKitFont
  variation?: Record<string, number>
  variationAxes?: FontKitVariationAxes
}> => {
  const isVariableFont = fontState.font.tech?.includes('variations') === true

  const source = path.resolve(
    state.configurationDirectory,
    fontState.font.source
  )

  const font = (await fontKitOpen(source)) as FontKitFont

  // TODO: implement https://drafts.csswg.org/css-fonts/#font-style-matching
  // for better warnings
  if (isVariableFont) {
    // @ts-expect-error bad types
    const variationAxes = schemaFontKitVariationAxes.parse(font.variationAxes)

    const variation = {
      ...mapValues(variationAxes, (value) => {
        const key = value.name.toLowerCase()

        const inputValues = uniq(
          compact([
            find(
              (fontProperties.fontVariationSettings === 'normal'
                ? undefined
                : fontProperties.fontVariationSettings) ?? {},
              (value, inputKey) =>
                inputKey.toLowerCase() === key && typeof value === 'number'
            ),
            key === 'wght' ? fontProperties.fontWeight : undefined,
            key === 'wdth' ? fontProperties.fontStretch : undefined,
            key === 'ital' && fontProperties.fontStyle === 'italic'
              ? value.max
              : undefined
          ])
        )

        if (inputValues.length > 1) {
          console.warn(
            `${
              fontState.font.source
            }: inconsistent font variation settings (${inputValues.join(
              ', '
            )}) for '${key}'.`
          )
        }

        return clamp(
          find(inputValues, (input) => isWithin(input, value.min, value.max)) ??
            inputValues[0] ??
            value.default,
          value.min,
          value.max
        )
      })
    }

    // TODO: https://github.com/foliojs/fontkit/issues/330
    const variableFont = isEmpty(variation)
      ? font
      : font.getVariation(variation)

    return { font: variableFont, variationAxes, variation }
  }

  return { font }
}
