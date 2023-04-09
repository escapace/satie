import type { Properties } from 'csstype'
import { every, isNumber, map, sortBy, uniq } from 'lodash-es'
import { z } from 'zod'
import { createSlug } from './utilities/create-slug'
import { parseUnicodeRange } from './utilities/parse-unicode-range'

export interface LightningCSSTargets {
  android?: number
  chrome?: number
  edge?: number
  firefox?: number
  ie?: number
  ios_saf?: number
  opera?: number
  safari?: number
  samsung?: number
}

type CSSTypeProperties = Properties<number | (string & {})>

export type CSSProperties = {
  [Property in keyof CSSTypeProperties]:
    | CSSTypeProperties[Property]
    | Array<CSSTypeProperties[Property]>
}

interface SelectorMap {
  [selector: string]: CSSProperties & WithQueries<CSSProperties>
}

export interface StyleWithSelectors extends CSSProperties {
  selectors?: SelectorMap
}

export interface FeatureQueries<StyleType> {
  '@supports'?: {
    [query: string]: StyleType
  }
}

export interface MediaQueries<StyleType> {
  '@media'?: {
    [query: string]: StyleType
  }
}

export type WithQueries<StyleType> = MediaQueries<
  StyleType & FeatureQueries<StyleType>
> &
  FeatureQueries<StyleType & MediaQueries<StyleType>>

export type StyleRule = StyleWithSelectors & WithQueries<StyleWithSelectors>

export const SchemaFontPlaceholder = z.object({
  name: z
    .string()
    .optional()
    .refine((value) => {
      if (value === undefined) {
        return true
      }

      return /^[a-z-]+$/i.test(value)
    }),
  family: z.string(),
  source: z.string(),
  style: z.optional(
    z
      .enum(['normal', 'italic', 'oblique'])
      .or(z.number())
      .or(z.array(z.number()).length(2))
  ),
  weight: z.optional(
    z
      .array(z.number().int().min(1).max(1000))
      .length(2)
      .or(z.number().int().min(1).max(1000))
  ),
  stretch: z.optional(
    z
      .array(z.number().min(50).max(200))
      .length(2)
      .or(z.number().min(50).max(200))
  ),
  display: z.optional(
    z
      .literal('auto')
      .or(z.literal('block'))
      .or(z.literal('swap'))
      .or(z.literal('fallback'))
      .or(z.literal('optional'))
  ),
  format: z
    .optional(z.array(z.literal('woff').or(z.literal('woff2'))))
    .transform(
      (value): Array<'woff' | 'woff2'> =>
        sortBy(
          uniq(value === undefined || value?.length === 0 ? ['woff2'] : value),
          (value) => (value === 'woff2' ? 0 : 1)
        )
    ),
  tech: z.optional(z.array(z.enum(['variations']))),
  testString: z.optional(z.string().nonempty()),
  resourceHint: z.optional(z.literal('preload').or(z.literal('prefetch'))),
  unicodeRange: z.optional(
    z
      .string()
      .nonempty()
      .transform((value) => parseUnicodeRange(value).toHexRangeString())
  )
})

export type TypeFont = z.input<typeof SchemaFontPlaceholder> & {
  prefer?: TypeFont[]
}

export type TypeInferFont = z.infer<typeof SchemaFontPlaceholder> & {
  prefer?: TypeInferFont[]
}

const SchemaFont: z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont> =
  SchemaFontPlaceholder.extend({
    prefer: z.lazy(() => z.optional(z.array(SchemaFont).min(1)))
  }).strict()

export const SchemaClass = z
  .object({
    fontFamily: z
      .array(SchemaFont.or(z.string().nonempty()))
      // .nonempty()
      .transform((values, ctx) => {
        const fallbacks = values.filter(
          (value): value is string => typeof value === 'string'
        )

        const fonts = values.filter(
          (value): value is TypeInferFont => typeof value !== 'string'
        )

        const slugs = uniq(map(fonts, (value) => createSlug(value)))

        if (!(fonts.length > 0 && slugs.length === fonts.length)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom
          })

          return z.NEVER
        }

        return {
          fallbacks,
          fonts
        }
      })
  })
  .catchall(z.any())
  .transform((rules) => {
    if (
      rules.fontWeight === undefined &&
      every(
        rules.fontFamily.fonts,
        ({ weight }) =>
          !Array.isArray(weight) && rules.fontFamily.fonts[0].weight === weight
      )
    ) {
      rules.fontWeight = rules.fontFamily.fonts[0].weight as number | undefined
    }

    if (
      rules.fontStyle === undefined &&
      every(
        rules.fontFamily.fonts,
        ({ style }) =>
          !Array.isArray(style) && rules.fontFamily.fonts[0].style === style
      )
    ) {
      const value = rules.fontFamily.fonts[0].style as
        | number
        | 'normal'
        | 'italic'
        | 'oblique'
        | undefined

      rules.fontStyle = isNumber(value) ? `oblique ${value}deg` : value
    }

    if (
      rules.fontStretch === undefined &&
      every(
        rules.fontFamily.fonts,
        ({ stretch }) =>
          !Array.isArray(stretch) &&
          rules.fontFamily.fonts[0].stretch === stretch
      )
    ) {
      const value = rules.fontFamily.fonts[0].stretch as number | undefined

      rules.fontStretch = isNumber(value) ? `${value}%` : value
    }

    return rules
  })

export const SchemaLocale = z.object({}).catchall(SchemaClass)
export const SchemaLocales = z.object({}).catchall(SchemaLocale)

export type TypeLocales = Record<string, Record<string, TypeClass>>
export type TypeClass = z.input<typeof SchemaClass> &
  Omit<StyleRule, 'fontFamily'>
// export type TypeFont = z.input<typeof SchemaFont>

export type TypeInferLocales = z.infer<typeof SchemaLocales>
export type TypeInferClass = z.infer<typeof SchemaClass> &
  Omit<StyleRule, 'fontFamily'>
