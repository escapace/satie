import {
  LightningCSSTargets,
  TypeFont,
  TypeInferFont,
  TypeInferLocales
} from './types-public'
import { Console } from './utilities/console'

export * from './types-public'

export interface DataFont {
  family: string
  slug: string
  prefer: string[]
  stretch?: number | number[] | undefined
  style?: number | number[] | 'normal' | 'italic' | 'oblique' | undefined
  tech?: Array<'variations'>
  testString?: string | undefined
  weight?: number | number[] | undefined
}

export interface DataLocale {
  fontFace: string | undefined
  style: string | undefined
  noScriptStyle: string | undefined
  resourceHint: ResourceHint[] | undefined
  fonts: DataFont[]
  order: string[]
}

export interface DataLocales {
  [x: string]: DataLocale
}

export interface Options {
  cli?: boolean
  cwd?: string
  jsonFile?: string
  loaderFile?: string
  outputDir?: string
  publicPath?: string
  declaration?: boolean
}

export interface Size {
  brotli: number
  gzip: number
}

export interface SizeFont extends Size {
  file: string
}

export type RecordSizeFont = Record<string, SizeFont[]>

export interface SizePart extends Size {
  key: 'fontFace' | 'noScriptStyle' | 'resourceHint' | 'style' | 'script'
}

export interface SizeLocale {
  totalFonts: Size
  total: Size
  fonts: SizeFont[]
  totalParts: Size
  parts: SizePart[]
}

export type RecordSizeLocale = Record<string, SizeLocale>

// export interface Targets {
//   android?: number
//   chrome?: number
//   edge?: number
//   firefox?: number
//   ie?: number
//   ios_saf?: number
//   opera?: number
//   safari?: number
//   samsung?: number
// }

export interface State {
  absWorkingDir: string
  cacheFonts: Map<
    string,
    [TypeInferFont, TypeInferFontExtended, () => Promise<SizeFont[]>]
  >
  cwd: string
  browsers: string[]
  targets: {
    lightningCSS: LightningCSSTargets
    esbuild?: string[]
  }
  jsonFile: string
  outputDir: string
  locales: TypeInferLocales
  loaderFile: string | undefined
  publicPath: string
  scriptFontStrip: string
  sourceWebFontLoader: string
  console: Console
  declaration: boolean
}

export interface Data {
  fontFace: string | undefined
  fonts: DataFont[]
  fontsIndex: Array<[string, DataFont]>
  localeIndex: Array<[string, string[]]>
  locales: DataLocales
  noScriptStyle: string | undefined
  style: string | undefined
}

export interface ResourceHint {
  as: 'font'
  crossorigin: 'anonymous'
  href: string
  rel: 'prefetch' | 'preload'
  type: string
}

export interface TypeInferFontExtended
  extends Omit<TypeInferFont, 'resourceHint'> {
  slug: string
  fontFace: string
  resourceHint: ResourceHint[]
}

export type SlugParts =
  | 'family'
  | 'stretch'
  | 'style'
  | 'tech'
  | 'unicodeRange'
  | 'weight'

export type SlugNonParts = Exclude<keyof (TypeFont | TypeInferFont), SlugParts>
