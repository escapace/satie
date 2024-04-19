import type { Properties } from 'csstype'
import type { z } from 'zod'
export type InputFont = {
  prefer?: InputFont[]
} & z.input<typeof schemaFontPlaceholder>
export type InferFont = {
  prefer?: InferFont[]
} & z.infer<typeof schemaFontPlaceholder>
export type InputRule = z.input<typeof schemaRule>
export type InferRule = z.infer<typeof schemaRule>
export type InputLocale = Record<string, InputRule>
export type InferLocale = Record<string, InferRule>
export type InputLocales = Record<string, InputLocale | string>
export type InferLocales = Record<string, InferLocale | string>
export type Fallback = z.infer<typeof schemaFallback>
export declare const schemaFallback: z.ZodObject<
  {
    ascent: z.ZodNumber
    capHeight: z.ZodNumber
    descent: z.ZodNumber
    id: z.ZodString
    italic: z.ZodBoolean
    lineGap: z.ZodNumber
    names: z.ZodArray<z.ZodString, 'atleastone'>
    unitsPerEm: z.ZodNumber
    weight: z.ZodUnion<
      [
        z.ZodUnion<
          [
            z.ZodUnion<
              [
                z.ZodUnion<
                  [
                    z.ZodUnion<
                      [
                        z.ZodUnion<
                          [
                            z.ZodUnion<
                              [
                                z.ZodUnion<
                                  [z.ZodLiteral<100>, z.ZodLiteral<200>]
                                >,
                                z.ZodLiteral<300>
                              ]
                            >,
                            z.ZodLiteral<400>
                          ]
                        >,
                        z.ZodLiteral<500>
                      ]
                    >,
                    z.ZodLiteral<600>
                  ]
                >,
                z.ZodLiteral<700>
              ]
            >,
            z.ZodLiteral<800>
          ]
        >,
        z.ZodLiteral<900>
      ]
    >
    xHeight: z.ZodNumber
    xWidthAvg: z.ZodNumber
  },
  'strip',
  z.ZodTypeAny,
  {
    ascent: number
    capHeight: number
    descent: number
    id: string
    italic: boolean
    lineGap: number
    names: [string, ...string[]]
    unitsPerEm: number
    weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
    xHeight: number
    xWidthAvg: number
  },
  {
    ascent: number
    capHeight: number
    descent: number
    id: string
    italic: boolean
    lineGap: number
    names: [string, ...string[]]
    unitsPerEm: number
    weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
    xHeight: number
    xWidthAvg: number
  }
>
export declare const schemaFontPlaceholder: z.ZodObject<
  {
    display: z.ZodOptional<
      z.ZodUnion<
        [
          z.ZodUnion<
            [
              z.ZodUnion<
                [
                  z.ZodUnion<[z.ZodLiteral<'auto'>, z.ZodLiteral<'block'>]>,
                  z.ZodLiteral<'swap'>
                ]
              >,
              z.ZodLiteral<'fallback'>
            ]
          >,
          z.ZodLiteral<'optional'>
        ]
      >
    >
    format: z.ZodEffects<
      z.ZodOptional<
        z.ZodArray<z.ZodUnion<[z.ZodLiteral<'woff'>, z.ZodLiteral<'woff2'>]>>
      >,
      Array<'woff' | 'woff2'>,
      Array<'woff' | 'woff2'> | undefined
    >
    name: z.ZodEffects<
      z.ZodOptional<z.ZodString>,
      string | undefined,
      string | undefined
    >
    resourceHint: z.ZodOptional<
      z.ZodUnion<[z.ZodLiteral<'preload'>, z.ZodLiteral<'prefetch'>]>
    >
    source: z.ZodString
    tech: z.ZodOptional<z.ZodArray<z.ZodEnum<['variations']>>>
    testString: z.ZodOptional<z.ZodString>
    unicodeRange: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>
  },
  'strip',
  z.ZodTypeAny,
  {
    display?: 'auto' | 'block' | 'fallback' | 'optional' | 'swap' | undefined
    format: Array<'woff' | 'woff2'>
    name?: string | undefined
    resourceHint?: 'prefetch' | 'preload' | undefined
    source: string
    tech?: Array<'variations'> | undefined
    testString?: string | undefined
    unicodeRange?: string | undefined
  },
  {
    display?: 'auto' | 'block' | 'fallback' | 'optional' | 'swap' | undefined
    format?: Array<'woff' | 'woff2'> | undefined
    name?: string | undefined
    resourceHint?: 'prefetch' | 'preload' | undefined
    source: string
    tech?: Array<'variations'> | undefined
    testString?: string | undefined
    unicodeRange?: string | undefined
  }
>
export declare const schemaFontVariationSettings: z.ZodUnion<
  [z.ZodLiteral<'normal'>, z.ZodRecord<z.ZodString, z.ZodNumber>]
>
export declare const schemaFontWeight: z.ZodDefault<z.ZodNumber>
export declare const schemaFontStretch: z.ZodDefault<z.ZodNumber>
export declare const schemaFontStyle: z.ZodDefault<
  z.ZodEnum<['normal', 'italic']>
>
export declare const schemaFontProperties: z.ZodObject<
  {
    fontFamily: z.ZodOptional<
      z.ZodEffects<
        z.ZodArray<
          z.ZodUnion<
            [
              z.ZodType<InferFont, z.ZodTypeDef, InputFont>,
              z.ZodObject<
                {
                  ascent: z.ZodNumber
                  capHeight: z.ZodNumber
                  descent: z.ZodNumber
                  id: z.ZodString
                  italic: z.ZodBoolean
                  lineGap: z.ZodNumber
                  names: z.ZodArray<z.ZodString, 'atleastone'>
                  unitsPerEm: z.ZodNumber
                  weight: z.ZodUnion<
                    [
                      z.ZodUnion<
                        [
                          z.ZodUnion<
                            [
                              z.ZodUnion<
                                [
                                  z.ZodUnion<
                                    [
                                      z.ZodUnion<
                                        [
                                          z.ZodUnion<
                                            [
                                              z.ZodUnion<
                                                [
                                                  z.ZodLiteral<100>,
                                                  z.ZodLiteral<200>
                                                ]
                                              >,
                                              z.ZodLiteral<300>
                                            ]
                                          >,
                                          z.ZodLiteral<400>
                                        ]
                                      >,
                                      z.ZodLiteral<500>
                                    ]
                                  >,
                                  z.ZodLiteral<600>
                                ]
                              >,
                              z.ZodLiteral<700>
                            ]
                          >,
                          z.ZodLiteral<800>
                        ]
                      >,
                      z.ZodLiteral<900>
                    ]
                  >
                  xHeight: z.ZodNumber
                  xWidthAvg: z.ZodNumber
                },
                'strip',
                z.ZodTypeAny,
                {
                  ascent: number
                  capHeight: number
                  descent: number
                  id: string
                  italic: boolean
                  lineGap: number
                  names: [string, ...string[]]
                  unitsPerEm: number
                  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
                  xHeight: number
                  xWidthAvg: number
                },
                {
                  ascent: number
                  capHeight: number
                  descent: number
                  id: string
                  italic: boolean
                  lineGap: number
                  names: [string, ...string[]]
                  unitsPerEm: number
                  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
                  xHeight: number
                  xWidthAvg: number
                }
              >
            ]
          >
        >,
        {
          fallbacks: Fallback[]
          fonts: InferFont[]
        },
        Array<
          | {
              ascent: number
              capHeight: number
              descent: number
              id: string
              italic: boolean
              lineGap: number
              names: [string, ...string[]]
              unitsPerEm: number
              weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
              xHeight: number
              xWidthAvg: number
            }
          | InputFont
        >
      >
    >
    fontStretch: z.ZodOptional<z.ZodDefault<z.ZodNumber>>
    fontStyle: z.ZodOptional<z.ZodDefault<z.ZodEnum<['normal', 'italic']>>>
    fontVariationSettings: z.ZodOptional<
      z.ZodUnion<
        [z.ZodLiteral<'normal'>, z.ZodRecord<z.ZodString, z.ZodNumber>]
      >
    >
    fontWeight: z.ZodOptional<z.ZodDefault<z.ZodNumber>>
  },
  'strip',
  z.ZodTypeAny,
  {
    fontFamily?:
      | {
          fallbacks: Fallback[]
          fonts: InferFont[]
        }
      | undefined
    fontStretch?: number | undefined
    fontStyle?: 'italic' | 'normal' | undefined
    fontVariationSettings?: 'normal' | Record<string, number> | undefined
    fontWeight?: number | undefined
  },
  {
    fontFamily?:
      | Array<
          | {
              ascent: number
              capHeight: number
              descent: number
              id: string
              italic: boolean
              lineGap: number
              names: [string, ...string[]]
              unitsPerEm: number
              weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
              xHeight: number
              xWidthAvg: number
            }
          | InputFont
        >
      | undefined
    fontStretch?: number | undefined
    fontStyle?: 'italic' | 'normal' | undefined
    fontVariationSettings?: 'normal' | Record<string, number> | undefined
    fontWeight?: number | undefined
  }
>
export type InputFontProperties = z.input<typeof schemaFontProperties>
export type InferFontProperties = z.infer<typeof schemaFontProperties>
export type CSSTypeProperties = Properties<({} & string) | number>
export type CSSProperties<T extends {}> = {
  [Property in Exclude<keyof CSSTypeProperties, keyof T>]?:
    | Array<CSSTypeProperties[Property]>
    | CSSTypeProperties[Property]
} & T
export interface FeatureQueries<StyleType> {
  '@supports'?: Record<string, StyleType>
}
export interface MediaQueries<StyleType> {
  '@media'?: Record<string, StyleType>
}
export type StyleRule<T extends {}> = CSSProperties<T> &
  FeatureQueries<CSSProperties<T> & MediaQueries<CSSProperties<T>>> &
  MediaQueries<CSSProperties<T> & FeatureQueries<CSSProperties<T>>>
declare const schemaRule: z.ZodType<
  StyleRule<InferFontProperties>,
  z.ZodTypeDef,
  StyleRule<InputFontProperties>
>
export declare const schemaLocale: z.ZodObject<
  {},
  'strip',
  z.ZodType<
    StyleRule<{
      fontFamily?:
        | {
            fallbacks: Fallback[]
            fonts: InferFont[]
          }
        | undefined
      fontStretch?: number | undefined
      fontStyle?: 'italic' | 'normal' | undefined
      fontVariationSettings?: 'normal' | Record<string, number> | undefined
      fontWeight?: number | undefined
    }>,
    z.ZodTypeDef,
    StyleRule<{
      fontFamily?:
        | Array<
            | {
                ascent: number
                capHeight: number
                descent: number
                id: string
                italic: boolean
                lineGap: number
                names: [string, ...string[]]
                unitsPerEm: number
                weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
                xHeight: number
                xWidthAvg: number
              }
            | InputFont
          >
        | undefined
      fontStretch?: number | undefined
      fontStyle?: 'italic' | 'normal' | undefined
      fontVariationSettings?: 'normal' | Record<string, number> | undefined
      fontWeight?: number | undefined
    }>
  >,
  {},
  {}
>
export declare const schemaLocales: z.ZodObject<
  {},
  'strip',
  z.ZodUnion<
    [
      z.ZodString,
      z.ZodObject<
        {},
        'strip',
        z.ZodType<
          StyleRule<{
            fontFamily?:
              | {
                  fallbacks: Fallback[]
                  fonts: InferFont[]
                }
              | undefined
            fontStretch?: number | undefined
            fontStyle?: 'italic' | 'normal' | undefined
            fontVariationSettings?:
              | 'normal'
              | Record<string, number>
              | undefined
            fontWeight?: number | undefined
          }>,
          z.ZodTypeDef,
          StyleRule<{
            fontFamily?:
              | Array<
                  | {
                      ascent: number
                      capHeight: number
                      descent: number
                      id: string
                      italic: boolean
                      lineGap: number
                      names: [string, ...string[]]
                      unitsPerEm: number
                      weight:
                        | 100
                        | 200
                        | 300
                        | 400
                        | 500
                        | 600
                        | 700
                        | 800
                        | 900
                      xHeight: number
                      xWidthAvg: number
                    }
                  | InputFont
                >
              | undefined
            fontStretch?: number | undefined
            fontStyle?: 'italic' | 'normal' | undefined
            fontVariationSettings?:
              | 'normal'
              | Record<string, number>
              | undefined
            fontWeight?: number | undefined
          }>
        >,
        {},
        {}
      >
    ]
  >,
  z.objectOutputType<
    {},
    z.ZodUnion<
      [
        z.ZodString,
        z.ZodObject<
          {},
          'strip',
          z.ZodType<
            StyleRule<{
              fontFamily?:
                | {
                    fallbacks: Fallback[]
                    fonts: InferFont[]
                  }
                | undefined
              fontStretch?: number | undefined
              fontStyle?: 'italic' | 'normal' | undefined
              fontVariationSettings?:
                | 'normal'
                | Record<string, number>
                | undefined
              fontWeight?: number | undefined
            }>,
            z.ZodTypeDef,
            StyleRule<{
              fontFamily?:
                | Array<
                    | {
                        ascent: number
                        capHeight: number
                        descent: number
                        id: string
                        italic: boolean
                        lineGap: number
                        names: [string, ...string[]]
                        unitsPerEm: number
                        weight:
                          | 100
                          | 200
                          | 300
                          | 400
                          | 500
                          | 600
                          | 700
                          | 800
                          | 900
                        xHeight: number
                        xWidthAvg: number
                      }
                    | InputFont
                  >
                | undefined
              fontStretch?: number | undefined
              fontStyle?: 'italic' | 'normal' | undefined
              fontVariationSettings?:
                | 'normal'
                | Record<string, number>
                | undefined
              fontWeight?: number | undefined
            }>
          >,
          {},
          {}
        >
      ]
    >,
    'strip'
  >,
  z.objectInputType<
    {},
    z.ZodUnion<
      [
        z.ZodString,
        z.ZodObject<
          {},
          'strip',
          z.ZodType<
            StyleRule<{
              fontFamily?:
                | {
                    fallbacks: Fallback[]
                    fonts: InferFont[]
                  }
                | undefined
              fontStretch?: number | undefined
              fontStyle?: 'italic' | 'normal' | undefined
              fontVariationSettings?:
                | 'normal'
                | Record<string, number>
                | undefined
              fontWeight?: number | undefined
            }>,
            z.ZodTypeDef,
            StyleRule<{
              fontFamily?:
                | Array<
                    | {
                        ascent: number
                        capHeight: number
                        descent: number
                        id: string
                        italic: boolean
                        lineGap: number
                        names: [string, ...string[]]
                        unitsPerEm: number
                        weight:
                          | 100
                          | 200
                          | 300
                          | 400
                          | 500
                          | 600
                          | 700
                          | 800
                          | 900
                        xHeight: number
                        xWidthAvg: number
                      }
                    | InputFont
                  >
                | undefined
              fontStretch?: number | undefined
              fontStyle?: 'italic' | 'normal' | undefined
              fontVariationSettings?:
                | 'normal'
                | Record<string, number>
                | undefined
              fontWeight?: number | undefined
            }>
          >,
          {},
          {}
        >
      ]
    >,
    'strip'
  >
>
export interface ResourceHint {
  as: 'font'
  crossorigin: 'anonymous'
  href: string
  rel: 'prefetch' | 'preload'
  type: string
}
export type WebFontState =
  | 'error'
  | 'font-already-loaded'
  | 'font-loaded'
  | 'font-not-supported'
  | 'font-unknown'
export interface WebFont {
  fontFace?: Array<{
    fontFamily: string
    fontStretch?: [number, number] | number
    fontStyle?: 'italic'
    fontWeight?: [number, number] | number
  }>
  prefer?: string[]
  resourceHint?: ResourceHint[]
  slug: string
  state?: WebFontState
  tech?: string[]
  testString?: string
}
export interface WebFontLocale {
  font: WebFont[]
  fontFace: string
  noScriptStyle: string
  order: string[] | undefined
  style: string
}
export interface WebFontsJson {
  alias: Record<string, string>
  font: WebFont[]
  fontFace: string
  locale: Record<string, WebFontLocale>
  noScriptStyle: string
  order: string[] | undefined
  script: string
  style: string
}
export {}
//# sourceMappingURL=user-schema.d.ts.map
