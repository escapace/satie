import type {
  CSSProperties,
  Fallback as IFallback,
  InferFont,
  InferFontProperties
} from './state/user-schema'
import type { Targets } from 'lightningcss'

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

export interface FontFace extends FontFaceAdjustments {
  fontDisplay?: InferFont['display']
  fontFamily: string
  fontStretch: [number, number] | number
  fontStyle: 'italic' | 'normal'
  fontWeight: [number, number] | number
  src: string
  unicodeRange?: InferFont['unicodeRange']
}

// export interface LightningCSSTargets {
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

export const enum TypeFontState {
  Initial,
  Written
}

export interface FontStateInitial {
  font: InferFont
  fontFaces: Map<string, FontFace>
  slug: string
  type: TypeFontState.Initial
}

export interface FontStateWritten extends Omit<FontStateInitial, 'type'> {
  files: string[]
  type: TypeFontState.Written
}

export type FontState = FontStateInitial | FontStateWritten

export interface Options {
  cli?: boolean
  cwd?: string
  jsonFile?: string
  outputDir?: string
  publicPath?: string
}

export interface AtRule {
  type: '@media' | '@supports'
  value: string
}

// export interface FontProperties {
//   fontFamily:
//     | {
//         fallbacks: string[]
//         fonts: string[]
//       }
//     | undefined
//   fontWeight?: number | undefined
//   fontStretch?: number | undefined
//   fontStyle?: 'normal' | 'italic'
// }

export interface FontProperties
  extends Omit<InferFontProperties, 'fontFamily'> {
  fontFamily:
    | {
        fallbacks: string[]
        fonts: string[]
      }
    | undefined
}

export interface Style {
  atRules: AtRule[]
  // fontPropertiesKeys: Array<keyof Required<FontProperties>>
  classname: string
  fallbackStyle?: string
  fallbackStyleProperties?: CSSProperties<{}>
  fontProperties?: string
  graph?: Map<string, string[]>
  id: string
  locale: string
  noScriptStyle?: string
  noScriptStyleProperties?: CSSProperties<{}>
  parent?: string
  properties: CSSProperties<{}>
  style?: string
}

export interface Configuration {
  fallbackFonts: Map<string, FontFallback>
  fontProperties: Map<string, Required<FontProperties>>
  fonts: Map<string, FontState>
  localeFromAlias: Map<string, string[]>
  locales: Record<string, Style[]>
  localeToAlias: Map<string, string[]>
  styles: Style[]
}

export interface State {
  configuration: Configuration
  configurationDirectory: string
  configurationFile: string
  jsonFile: string
  outputDir: string
  processDirectory: string
  publicPath: string
  runtimeDirectory: string
  runtimeFontLoaderPath: string
  runtimeFontStripPath: string
  targets: {
    browserslist: string[]
    esbuild: string[]
    lightningcss: Targets
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TupleUnion<U extends string, R extends any[] = []> = {
  [S in U]: Exclude<U, S> extends never
    ? [...R, S]
    : TupleUnion<Exclude<U, S>, [...R, S]>
}[U]
