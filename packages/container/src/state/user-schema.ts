import type { Properties } from 'csstype'
import { difference, sortBy, uniq } from 'lodash-es'
import { z } from 'zod'
import { fontUnicodeRange } from '../font/font-unicode-range'

// "wght" font-weight
// "wdth" font-stretch
// "slnt" font-style: oblique + angle
// "ital" font-style: italic
// "opsz" font-optical-sizing

export type InputFont = z.input<typeof schemaFontPlaceholder> & {
  prefer?: InputFont[]
}
export type InferFont = z.infer<typeof schemaFontPlaceholder> & {
  prefer?: InferFont[]
}

export type InputRule = z.input<typeof schemaRule>
export type InferRule = z.infer<typeof schemaRule>

export type InputLocale = Record<string, InputRule>
export type InferLocale = Record<string, InferRule>

export type InputLocales = Record<string, InputLocale>
export type InferLocales = Record<string, InferLocale>

export type Fallback = z.infer<typeof schemaFallback>

export const schemaFallback = z.object({
  id: z.string().nonempty(),
  names: z.array(z.string().nonempty()).nonempty(),
  weight: z
    .literal(100)
    .or(z.literal(200))
    .or(z.literal(300))
    .or(z.literal(400))
    .or(z.literal(500))
    .or(z.literal(600))
    .or(z.literal(700))
    .or(z.literal(800))
    .or(z.literal(900)),
  italic: z.boolean(),
  // familyName: z.string().nonempty(),
  // postscriptName: z.string().nonempty(),
  // fullName: z.string().nonempty(),
  // subfamilyName: z.string().nonempty(),
  capHeight: z.number(),
  ascent: z.number(),
  descent: z.number(),
  lineGap: z.number(),
  unitsPerEm: z.number(),
  xHeight: z.number(),
  xWidthAvg: z.number()
})

export const schemaFontPlaceholder = z.object({
  name: z
    .string()
    .optional()
    .refine((value) => {
      if (value === undefined) {
        return true
      }

      return /^[a-z-]+$/i.test(value)
    }),
  source: z.string(),
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
      .transform((value): string => fontUnicodeRange(value).toHexRangeString())
  )
})

const schemaFont: z.ZodType<InferFont, z.ZodTypeDef, InputFont> =
  schemaFontPlaceholder
    .extend({
      prefer: z.lazy(() => z.optional(z.array(schemaFont).min(1)))
    })
    .strict()

const isFallback = (value: Record<string, unknown>): value is Fallback =>
  difference(schemaFallback.keyof().options, Object.keys(value)).length === 0

const schemaFontFamily = z.array(schemaFont.or(schemaFallback)).transform(
  (
    values
  ): {
    fallbacks: Fallback[]
    fonts: InferFont[]
  } => {
    const fallbacks = values.filter(isFallback)
    const fonts = values.filter(
      (value): value is InferFont => !isFallback(value)
    )

    return {
      fallbacks,
      fonts
    }
  }
)

export const schemaFontVariationSettings = z
  .literal('normal')
  .or(z.record(z.number().int()))
export const schemaFontWeight = z.number().min(1).max(1000).default(400)
export const schemaFontStretch = z.number().min(50).max(200).default(100)
export const schemaFontStyle = z.enum(['normal', 'italic']).default('normal')

// 'fontOpticalSizing'
// 'fontVariationSetting'
export const schemaFontProperties = z.object({
  fontFamily: schemaFontFamily.optional(),
  fontWeight: schemaFontWeight.optional(),
  fontStretch: schemaFontStretch.optional(),
  fontStyle: schemaFontStyle.optional(),
  fontVariationSettings: schemaFontVariationSettings.optional()
})

export type InputFontProperties = z.input<typeof schemaFontProperties>
export type InferFontProperties = z.infer<typeof schemaFontProperties>
export type CSSTypeProperties = Properties<number | (string & {})>

export type CSSProperties<T extends {}> = {
  [Property in Exclude<keyof CSSTypeProperties, keyof T>]?:
    | CSSTypeProperties[Property]
    | Array<CSSTypeProperties[Property]>
} & T

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

export type StyleRule<T extends {}> = CSSProperties<T> &
  MediaQueries<CSSProperties<T> & FeatureQueries<CSSProperties<T>>> &
  FeatureQueries<CSSProperties<T> & MediaQueries<CSSProperties<T>>>

const schemaRule: z.ZodType<
  StyleRule<InferFontProperties>,
  z.ZodTypeDef,
  StyleRule<InputFontProperties>
> = z.lazy(() => {
  const schemaCSSProperties = schemaFontProperties.passthrough()

  // @ts-expect-error circular reference
  const schemaMediaQueries = z
    .object({
      // '@media': z.record(
      //   z.intersection(schemaCSSProperties, schemaFeatureQueries)
      // )
      '@media': z.lazy(() =>
        z.record(schemaCSSProperties.merge(schemaFeatureQueries))
      )
    })
    .partial()
    .passthrough()

  // @ts-expect-error circular reference
  const schemaFeatureQueries = z
    .object({
      // '@supports': z.record(
      //   z.intersection(schemaCSSProperties, schemaMediaQueries)
      // )
      '@supports': z.lazy(() =>
        z.record(schemaCSSProperties.merge(schemaMediaQueries))
      )
    })
    .partial()
    .passthrough()

  return schemaCSSProperties
    .merge(schemaFeatureQueries)
    .merge(schemaMediaQueries)
    .passthrough()
})

export const schemaLocale = z.object({}).catchall(schemaRule)
export const schemaLocales = z.object({}).catchall(schemaLocale)

export interface ResourceHint {
  as: 'font'
  crossorigin: 'anonymous'
  href: string
  rel: 'prefetch' | 'preload'
  type: string
}

export interface WebFont {
  slug: string
  prefer?: string[]
  tech?: string[]
  fontFace?: Array<{
    fontFamily: string
    fontStretch?: number | [number, number]
    fontStyle?: 'italic'
    fontWeight?: number | [number, number]
  }>
  resourceHint?: ResourceHint[]
  testString?: string
}

export interface WebFontLocale {
  fontFace: string
  font: WebFont[]
  noScriptStyle: string
  order: string[] | undefined
  style: string
}

export interface WebFontsJson {
  locale: {
    [x: string]: WebFontLocale
  }
  font: WebFont[]
  fontFace: string
  noScriptStyle: string
  order: string[] | undefined
  script: string
  style: string
}
