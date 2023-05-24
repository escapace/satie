import type { Properties } from 'csstype';
import { z } from 'zod';
export type InputFont = z.input<typeof schemaFontPlaceholder> & {
    prefer?: InputFont[];
};
export type InferFont = z.infer<typeof schemaFontPlaceholder> & {
    prefer?: InferFont[];
};
export type InputRule = z.input<typeof schemaRule>;
export type InferRule = z.infer<typeof schemaRule>;
export type InputLocale = Record<string, InputRule>;
export type InferLocale = Record<string, InferRule>;
export type InputLocales = Record<string, InputLocale>;
export type InferLocales = Record<string, InferLocale>;
export type Fallback = z.infer<typeof schemaFallback>;
export declare const schemaFallback: z.ZodObject<{
    id: z.ZodString;
    names: z.ZodArray<z.ZodString, "atleastone">;
    weight: z.ZodUnion<[z.ZodUnion<[z.ZodUnion<[z.ZodUnion<[z.ZodUnion<[z.ZodUnion<[z.ZodUnion<[z.ZodUnion<[z.ZodLiteral<100>, z.ZodLiteral<200>]>, z.ZodLiteral<300>]>, z.ZodLiteral<400>]>, z.ZodLiteral<500>]>, z.ZodLiteral<600>]>, z.ZodLiteral<700>]>, z.ZodLiteral<800>]>, z.ZodLiteral<900>]>;
    italic: z.ZodBoolean;
    capHeight: z.ZodNumber;
    ascent: z.ZodNumber;
    descent: z.ZodNumber;
    lineGap: z.ZodNumber;
    unitsPerEm: z.ZodNumber;
    xHeight: z.ZodNumber;
    xWidthAvg: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    names: [string, ...string[]];
    weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
    italic: boolean;
    capHeight: number;
    ascent: number;
    descent: number;
    lineGap: number;
    unitsPerEm: number;
    xHeight: number;
    xWidthAvg: number;
}, {
    id: string;
    names: [string, ...string[]];
    weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
    italic: boolean;
    capHeight: number;
    ascent: number;
    descent: number;
    lineGap: number;
    unitsPerEm: number;
    xHeight: number;
    xWidthAvg: number;
}>;
export declare const schemaFontPlaceholder: z.ZodObject<{
    name: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    source: z.ZodString;
    display: z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodUnion<[z.ZodUnion<[z.ZodLiteral<"auto">, z.ZodLiteral<"block">]>, z.ZodLiteral<"swap">]>, z.ZodLiteral<"fallback">]>, z.ZodLiteral<"optional">]>>;
    format: z.ZodEffects<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"woff">, z.ZodLiteral<"woff2">]>, "many">>, ("woff" | "woff2")[], ("woff" | "woff2")[] | undefined>;
    tech: z.ZodOptional<z.ZodArray<z.ZodEnum<["variations"]>, "many">>;
    testString: z.ZodOptional<z.ZodString>;
    resourceHint: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"preload">, z.ZodLiteral<"prefetch">]>>;
    unicodeRange: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
}, "strip", z.ZodTypeAny, {
    source: string;
    format: ("woff" | "woff2")[];
    name?: string | undefined;
    display?: "auto" | "block" | "swap" | "fallback" | "optional" | undefined;
    tech?: "variations"[] | undefined;
    testString?: string | undefined;
    resourceHint?: "preload" | "prefetch" | undefined;
    unicodeRange?: string | undefined;
}, {
    source: string;
    name?: string | undefined;
    display?: "auto" | "block" | "swap" | "fallback" | "optional" | undefined;
    format?: ("woff" | "woff2")[] | undefined;
    tech?: "variations"[] | undefined;
    testString?: string | undefined;
    resourceHint?: "preload" | "prefetch" | undefined;
    unicodeRange?: string | undefined;
}>;
export declare const schemaFontVariationSettings: z.ZodUnion<[z.ZodLiteral<"normal">, z.ZodRecord<z.ZodString, z.ZodNumber>]>;
export declare const schemaFontWeight: z.ZodDefault<z.ZodNumber>;
export declare const schemaFontStretch: z.ZodDefault<z.ZodNumber>;
export declare const schemaFontStyle: z.ZodDefault<z.ZodEnum<["normal", "italic"]>>;
export declare const schemaFontProperties: z.ZodObject<{
    fontFamily: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<InferFont, z.ZodTypeDef, InputFont>, z.ZodObject<{
        id: z.ZodString;
        names: z.ZodArray<z.ZodString, "atleastone">;
        weight: z.ZodUnion<[z.ZodUnion<[z.ZodUnion<[z.ZodUnion<[z.ZodUnion<[z.ZodUnion<[z.ZodUnion<[z.ZodUnion<[z.ZodLiteral<100>, z.ZodLiteral<200>]>, z.ZodLiteral<300>]>, z.ZodLiteral<400>]>, z.ZodLiteral<500>]>, z.ZodLiteral<600>]>, z.ZodLiteral<700>]>, z.ZodLiteral<800>]>, z.ZodLiteral<900>]>;
        italic: z.ZodBoolean;
        capHeight: z.ZodNumber;
        ascent: z.ZodNumber;
        descent: z.ZodNumber;
        lineGap: z.ZodNumber;
        unitsPerEm: z.ZodNumber;
        xHeight: z.ZodNumber;
        xWidthAvg: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        names: [string, ...string[]];
        weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
        italic: boolean;
        capHeight: number;
        ascent: number;
        descent: number;
        lineGap: number;
        unitsPerEm: number;
        xHeight: number;
        xWidthAvg: number;
    }, {
        id: string;
        names: [string, ...string[]];
        weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
        italic: boolean;
        capHeight: number;
        ascent: number;
        descent: number;
        lineGap: number;
        unitsPerEm: number;
        xHeight: number;
        xWidthAvg: number;
    }>]>, "many">, {
        fallbacks: Fallback[];
        fonts: InferFont[];
    }, (InputFont | {
        id: string;
        names: [string, ...string[]];
        weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
        italic: boolean;
        capHeight: number;
        ascent: number;
        descent: number;
        lineGap: number;
        unitsPerEm: number;
        xHeight: number;
        xWidthAvg: number;
    })[]>>;
    fontWeight: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    fontStretch: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    fontStyle: z.ZodOptional<z.ZodDefault<z.ZodEnum<["normal", "italic"]>>>;
    fontVariationSettings: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"normal">, z.ZodRecord<z.ZodString, z.ZodNumber>]>>;
}, "strip", z.ZodTypeAny, {
    fontFamily?: {
        fallbacks: Fallback[];
        fonts: InferFont[];
    } | undefined;
    fontWeight?: number | undefined;
    fontStretch?: number | undefined;
    fontStyle?: "italic" | "normal" | undefined;
    fontVariationSettings?: "normal" | Record<string, number> | undefined;
}, {
    fontFamily?: (InputFont | {
        id: string;
        names: [string, ...string[]];
        weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
        italic: boolean;
        capHeight: number;
        ascent: number;
        descent: number;
        lineGap: number;
        unitsPerEm: number;
        xHeight: number;
        xWidthAvg: number;
    })[] | undefined;
    fontWeight?: number | undefined;
    fontStretch?: number | undefined;
    fontStyle?: "italic" | "normal" | undefined;
    fontVariationSettings?: "normal" | Record<string, number> | undefined;
}>;
export type InputFontProperties = z.input<typeof schemaFontProperties>;
export type InferFontProperties = z.infer<typeof schemaFontProperties>;
export type CSSTypeProperties = Properties<number | (string & {})>;
export type CSSProperties<T extends {}> = {
    [Property in Exclude<keyof CSSTypeProperties, keyof T>]?: CSSTypeProperties[Property] | Array<CSSTypeProperties[Property]>;
} & T;
export interface FeatureQueries<StyleType> {
    '@supports'?: {
        [query: string]: StyleType;
    };
}
export interface MediaQueries<StyleType> {
    '@media'?: {
        [query: string]: StyleType;
    };
}
export type StyleRule<T extends {}> = CSSProperties<T> & MediaQueries<CSSProperties<T> & FeatureQueries<CSSProperties<T>>> & FeatureQueries<CSSProperties<T> & MediaQueries<CSSProperties<T>>>;
declare const schemaRule: z.ZodType<StyleRule<InferFontProperties>, z.ZodTypeDef, StyleRule<InputFontProperties>>;
export declare const schemaLocale: z.ZodObject<{}, "strip", z.ZodType<StyleRule<{
    fontFamily?: {
        fallbacks: Fallback[];
        fonts: InferFont[];
    } | undefined;
    fontWeight?: number | undefined;
    fontStretch?: number | undefined;
    fontStyle?: "italic" | "normal" | undefined;
    fontVariationSettings?: "normal" | Record<string, number> | undefined;
}>, z.ZodTypeDef, StyleRule<{
    fontFamily?: (InputFont | {
        id: string;
        names: [string, ...string[]];
        weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
        italic: boolean;
        capHeight: number;
        ascent: number;
        descent: number;
        lineGap: number;
        unitsPerEm: number;
        xHeight: number;
        xWidthAvg: number;
    })[] | undefined;
    fontWeight?: number | undefined;
    fontStretch?: number | undefined;
    fontStyle?: "italic" | "normal" | undefined;
    fontVariationSettings?: "normal" | Record<string, number> | undefined;
}>>, {}, {}>;
export declare const schemaLocales: z.ZodObject<{}, "strip", z.ZodObject<{}, "strip", z.ZodType<StyleRule<{
    fontFamily?: {
        fallbacks: Fallback[];
        fonts: InferFont[];
    } | undefined;
    fontWeight?: number | undefined;
    fontStretch?: number | undefined;
    fontStyle?: "italic" | "normal" | undefined;
    fontVariationSettings?: "normal" | Record<string, number> | undefined;
}>, z.ZodTypeDef, StyleRule<{
    fontFamily?: (InputFont | {
        id: string;
        names: [string, ...string[]];
        weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
        italic: boolean;
        capHeight: number;
        ascent: number;
        descent: number;
        lineGap: number;
        unitsPerEm: number;
        xHeight: number;
        xWidthAvg: number;
    })[] | undefined;
    fontWeight?: number | undefined;
    fontStretch?: number | undefined;
    fontStyle?: "italic" | "normal" | undefined;
    fontVariationSettings?: "normal" | Record<string, number> | undefined;
}>>, {}, {}>, z.objectOutputType<{}, z.ZodObject<{}, "strip", z.ZodType<StyleRule<{
    fontFamily?: {
        fallbacks: Fallback[];
        fonts: InferFont[];
    } | undefined;
    fontWeight?: number | undefined;
    fontStretch?: number | undefined;
    fontStyle?: "italic" | "normal" | undefined;
    fontVariationSettings?: "normal" | Record<string, number> | undefined;
}>, z.ZodTypeDef, StyleRule<{
    fontFamily?: (InputFont | {
        id: string;
        names: [string, ...string[]];
        weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
        italic: boolean;
        capHeight: number;
        ascent: number;
        descent: number;
        lineGap: number;
        unitsPerEm: number;
        xHeight: number;
        xWidthAvg: number;
    })[] | undefined;
    fontWeight?: number | undefined;
    fontStretch?: number | undefined;
    fontStyle?: "italic" | "normal" | undefined;
    fontVariationSettings?: "normal" | Record<string, number> | undefined;
}>>, {}, {}>, "strip">, z.objectInputType<{}, z.ZodObject<{}, "strip", z.ZodType<StyleRule<{
    fontFamily?: {
        fallbacks: Fallback[];
        fonts: InferFont[];
    } | undefined;
    fontWeight?: number | undefined;
    fontStretch?: number | undefined;
    fontStyle?: "italic" | "normal" | undefined;
    fontVariationSettings?: "normal" | Record<string, number> | undefined;
}>, z.ZodTypeDef, StyleRule<{
    fontFamily?: (InputFont | {
        id: string;
        names: [string, ...string[]];
        weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
        italic: boolean;
        capHeight: number;
        ascent: number;
        descent: number;
        lineGap: number;
        unitsPerEm: number;
        xHeight: number;
        xWidthAvg: number;
    })[] | undefined;
    fontWeight?: number | undefined;
    fontStretch?: number | undefined;
    fontStyle?: "italic" | "normal" | undefined;
    fontVariationSettings?: "normal" | Record<string, number> | undefined;
}>>, {}, {}>, "strip">>;
export interface ResourceHint {
    as: 'font';
    crossorigin: 'anonymous';
    href: string;
    rel: 'prefetch' | 'preload';
    type: string;
}
export interface WebFont {
    slug: string;
    prefer?: string[];
    tech?: string[];
    fontFace?: Array<{
        fontFamily: string;
        fontStretch?: number | [number, number];
        fontStyle?: 'italic';
        fontWeight?: number | [number, number];
    }>;
    resourceHint?: ResourceHint[];
    testString?: string;
}
export interface WebFontLocale {
    fontFace: string;
    font: WebFont[];
    noScriptStyle: string;
    order: string[] | undefined;
    style: string;
}
export interface WebFontsJson {
    locale: {
        [x: string]: WebFontLocale;
    };
    font: WebFont[];
    fontFace: string;
    noScriptStyle: string;
    order: string[] | undefined;
    script: string;
    style: string;
}
export {};
//# sourceMappingURL=user-schema.d.ts.map