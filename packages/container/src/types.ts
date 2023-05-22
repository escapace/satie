import {
  CSSProperties,
  Fallback as IFallback,
  InferFont,
  ResourceHint
} from './state/user-schema'

export interface FontFallback {
  font: IFallback
  fontFaces: Map<string, FontFace>
}

export interface FontFaceAdjustments {
  ascentOverride?: number
  descentOverride?: number
  lineGapOverride?: number
  sizeAdjust?: number
}

export interface FontFace
  extends FontFaceAdjustments,
    Omit<
      Required<FontProperties>,
      'fontFamily' | 'fontWeight' | 'fontStretch'
    > {
  fontFamily: string
  fontWeight: number | [number, number]
  fontStretch: number | [number, number]
  src: string
  unicodeRange?: InferFont['unicodeRange']
  fontDisplay?: InferFont['display']
}

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

export const enum TypeFontState {
  Initial,
  Written,
  Hints,
  Metrics
}

export interface FontStateInitial {
  type: TypeFontState.Initial
  slug: string
  font: InferFont
  fontFaces: Map<string, FontFace>
}

export interface FontStateWritten extends Omit<FontStateInitial, 'type'> {
  type: TypeFontState.Written
  files: string[]
}

export interface FontStateHints extends Omit<FontStateWritten, 'type'> {
  type: TypeFontState.Hints
  resourceHints: ResourceHint[]
}

export type FontState = FontStateInitial | FontStateWritten | FontStateHints

export interface Options {
  cwd?: string
  cli?: boolean
  jsonFile?: string
  outputDir?: string
  publicPath?: string
}

export interface AtRule {
  type: '@supports' | '@media'
  value: string
}

export interface FontProperties {
  fontFamily:
    | {
        fallbacks: string[]
        fonts: string[]
      }
    | undefined
  fontWeight?: number | undefined
  fontStretch?: number | undefined
  fontStyle?: number | 'normal' | 'italic' | 'oblique' | undefined
}

export interface Style {
  id: string
  fontProperties?: string
  atRules: AtRule[]
  properties: CSSProperties<{}>
  locale: string
  fontPropertiesKeys: Array<keyof Required<FontProperties>>
  classname: string
  graph?: Map<string, string[]>
  style?: string
  noScriptStyle?: string
}

export interface Configuration {
  fonts: Map<string, FontState>
  fallbackFonts: Map<string, FontFallback>
  fontProperties: Map<string, Required<FontProperties>>
  styles: Style[]
  locales: Record<string, Style[]>
}

export interface State {
  browsers: string[]
  configuration: Configuration
  configurationDirectory: string
  configurationFile: string
  jsonFile: string
  processDirectory: string
  outputDir: string
  publicPath: string
  runtimeDirectory: string
  runtimeFontLoaderPath: string
  runtimeFontStripPath: string
  targets: {
    lightningCSS: LightningCSSTargets
    esbuild?: string[]
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TupleUnion<U extends string, R extends any[] = []> = {
  [S in U]: Exclude<U, S> extends never
    ? [...R, S]
    : TupleUnion<Exclude<U, S>, [...R, S]>
}[U]

// export interface Data {
//   fontFace: string | undefined
//   fonts: DataFont[]
//   fontsIndex: Array<[string, DataFont]>
//   localeIndex: Array<[string, string[]]>
//   locales: DataLocales
//   noScriptStyle: string | undefined
//   style: string | undefined
// }

// export type FontFace = Omit<AtRule.FontFace, 'src' | 'fontFamily'> &
//   Required<Pick<AtRule.FontFace, 'src' | 'fontFamily'>>
//
// export interface DataFont {
//   family: string
//   slug: string
//   prefer: string[]
//   stretch?: number | number[] | undefined
//   style?: number | number[] | 'normal' | 'italic' | 'oblique' | undefined
//   tech?: Array<'variations'>
//   testString?: string | undefined
//   weight?: number | number[] | undefined
// }
//
// export interface DataLocale {
//   fontFace: string | undefined
//   style: string | undefined
//   noScriptStyle: string | undefined
//   resourceHint: ResourceHint[] | undefined
//   fonts: DataFont[]
//   order: string[]
// }
//
// export interface DataLocales {
//   [x: string]: DataLocale
// }
