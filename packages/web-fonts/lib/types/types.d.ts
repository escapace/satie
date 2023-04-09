import type { Properties } from 'csstype';
import { z } from 'zod';
export interface LightningCSSTargets {
    android?: number;
    chrome?: number;
    edge?: number;
    firefox?: number;
    ie?: number;
    ios_saf?: number;
    opera?: number;
    safari?: number;
    samsung?: number;
}
type CSSTypeProperties = Properties<number | (string & {})>;
export type CSSProperties = {
    [Property in keyof CSSTypeProperties]: CSSTypeProperties[Property] | Array<CSSTypeProperties[Property]>;
};
interface SelectorMap {
    [selector: string]: CSSProperties & WithQueries<CSSProperties>;
}
export interface StyleWithSelectors extends CSSProperties {
    selectors?: SelectorMap;
}
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
export type WithQueries<StyleType> = MediaQueries<StyleType & FeatureQueries<StyleType>> & FeatureQueries<StyleType & MediaQueries<StyleType>>;
export type StyleRule = StyleWithSelectors & WithQueries<StyleWithSelectors>;
export declare const SchemaFontPlaceholder: z.ZodObject<{
    name: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    family: z.ZodString;
    source: z.ZodString;
    style: z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodEnum<["normal", "italic", "oblique"]>, z.ZodNumber]>, z.ZodArray<z.ZodNumber, "many">]>>;
    weight: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodNumber, "many">, z.ZodNumber]>>;
    stretch: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodNumber, "many">, z.ZodNumber]>>;
    display: z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodUnion<[z.ZodUnion<[z.ZodLiteral<"auto">, z.ZodLiteral<"block">]>, z.ZodLiteral<"swap">]>, z.ZodLiteral<"fallback">]>, z.ZodLiteral<"optional">]>>;
    format: z.ZodEffects<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"woff">, z.ZodLiteral<"woff2">]>, "many">>, ("woff" | "woff2")[], ("woff" | "woff2")[] | undefined>;
    tech: z.ZodOptional<z.ZodArray<z.ZodEnum<["variations"]>, "many">>;
    testString: z.ZodOptional<z.ZodString>;
    resourceHint: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"preload">, z.ZodLiteral<"prefetch">]>>;
    unicodeRange: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
}, "strip", z.ZodTypeAny, {
    family: string;
    source: string;
    format: ("woff" | "woff2")[];
    name?: string | undefined;
    style?: number | "normal" | "italic" | "oblique" | number[] | undefined;
    weight?: number | number[] | undefined;
    stretch?: number | number[] | undefined;
    display?: "auto" | "block" | "swap" | "fallback" | "optional" | undefined;
    tech?: "variations"[] | undefined;
    testString?: string | undefined;
    resourceHint?: "preload" | "prefetch" | undefined;
    unicodeRange?: string | undefined;
}, {
    family: string;
    source: string;
    name?: string | undefined;
    style?: number | "normal" | "italic" | "oblique" | number[] | undefined;
    weight?: number | number[] | undefined;
    stretch?: number | number[] | undefined;
    display?: "auto" | "block" | "swap" | "fallback" | "optional" | undefined;
    format?: ("woff" | "woff2")[] | undefined;
    tech?: "variations"[] | undefined;
    testString?: string | undefined;
    resourceHint?: "preload" | "prefetch" | undefined;
    unicodeRange?: string | undefined;
}>;
export type TypeFont = z.input<typeof SchemaFontPlaceholder> & {
    prefer?: TypeFont[];
};
export type TypeInferFont = z.infer<typeof SchemaFontPlaceholder> & {
    prefer?: TypeInferFont[];
};
export declare const SchemaClass: z.ZodEffects<z.ZodObject<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, "strip", z.ZodAny, z.objectOutputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">, z.objectInputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">>, z.objectOutputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">, z.objectInputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">>;
export declare const SchemaLocale: z.ZodObject<{}, "strip", z.ZodEffects<z.ZodObject<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, "strip", z.ZodAny, z.objectOutputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">, z.objectInputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">>, z.objectOutputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">, z.objectInputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">>, z.objectOutputType<{}, z.ZodEffects<z.ZodObject<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, "strip", z.ZodAny, z.objectOutputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">, z.objectInputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">>, z.objectOutputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">, z.objectInputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">>, "strip">, z.objectInputType<{}, z.ZodEffects<z.ZodObject<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, "strip", z.ZodAny, z.objectOutputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">, z.objectInputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">>, z.objectOutputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">, z.objectInputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">>, "strip">>;
export declare const SchemaLocales: z.ZodObject<{}, "strip", z.ZodObject<{}, "strip", z.ZodEffects<z.ZodObject<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, "strip", z.ZodAny, z.objectOutputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">, z.objectInputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">>, z.objectOutputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">, z.objectInputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">>, z.objectOutputType<{}, z.ZodEffects<z.ZodObject<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, "strip", z.ZodAny, z.objectOutputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">, z.objectInputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">>, z.objectOutputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">, z.objectInputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">>, "strip">, z.objectInputType<{}, z.ZodEffects<z.ZodObject<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, "strip", z.ZodAny, z.objectOutputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">, z.objectInputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">>, z.objectOutputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">, z.objectInputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">>, "strip">>, z.objectOutputType<{}, z.ZodObject<{}, "strip", z.ZodEffects<z.ZodObject<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, "strip", z.ZodAny, z.objectOutputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">, z.objectInputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">>, z.objectOutputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">, z.objectInputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">>, z.objectOutputType<{}, z.ZodEffects<z.ZodObject<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, "strip", z.ZodAny, z.objectOutputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">, z.objectInputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">>, z.objectOutputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">, z.objectInputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">>, "strip">, z.objectInputType<{}, z.ZodEffects<z.ZodObject<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, "strip", z.ZodAny, z.objectOutputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">, z.objectInputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">>, z.objectOutputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">, z.objectInputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">>, "strip">>, "strip">, z.objectInputType<{}, z.ZodObject<{}, "strip", z.ZodEffects<z.ZodObject<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, "strip", z.ZodAny, z.objectOutputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">, z.objectInputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">>, z.objectOutputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">, z.objectInputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">>, z.objectOutputType<{}, z.ZodEffects<z.ZodObject<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, "strip", z.ZodAny, z.objectOutputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">, z.objectInputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">>, z.objectOutputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">, z.objectInputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">>, "strip">, z.objectInputType<{}, z.ZodEffects<z.ZodObject<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, "strip", z.ZodAny, z.objectOutputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">, z.objectInputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">>, z.objectOutputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">, z.objectInputType<{
    fontFamily: z.ZodEffects<z.ZodArray<z.ZodUnion<[z.ZodType<TypeInferFont, z.ZodTypeDef, TypeFont>, z.ZodString]>, "many">, {
        fallbacks: string[];
        fonts: TypeInferFont[];
    }, (string | TypeFont)[]>;
}, z.ZodAny, "strip">>, "strip">>, "strip">>;
export type TypeLocales = Record<string, Record<string, TypeClass>>;
export type TypeClass = z.input<typeof SchemaClass> & Omit<StyleRule, 'fontFamily'>;
export type TypeInferLocales = z.infer<typeof SchemaLocales>;
export type TypeInferClass = z.infer<typeof SchemaClass> & Omit<StyleRule, 'fontFamily'>;
export {};
//# sourceMappingURL=types-public.d.ts.map