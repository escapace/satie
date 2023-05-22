export * from './fonts'
export type {
  Fallback as FallbackFont,
  InputFont as Font,
  InputLocale as Locale,
  InputLocales as Locales,
  ResourceHint,
  WebFont,
  WebFontLocale,
  WebFontsJson
} from './types'
import type { WebFont } from './types'

export type WebFontLoaderSubscribe = (cb: (webFonts: WebFont[]) => void) => void

export type WebFontLoader = (locale: string) => Promise<WebFont[]>

export declare const webFontLoaderSubscribe: WebFontLoaderSubscribe
export declare const webFontLoader: WebFontLoader

declare global {
  interface Window {
    webFontLoaderSubscribe: WebFontLoaderSubscribe
    webFontLoader: WebFontLoader
  }
}
