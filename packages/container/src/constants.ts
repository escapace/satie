import { SlugNonParts, SlugParts } from './types'

export const DEFAULT_PUBLIC_PATH = '/assets/fonts'
export const DEFAULT_OUTPUT_DIR = 'public/assets/fonts'
export const DEFAULT_JSON_FILE = 'src/web-fonts.json'
export const HASHS_LENGHT = 7
export const HASH_ALPHABET =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

export const SLUG_PARTS: SlugParts[] = [
  'family',
  'stretch',
  'style',
  'tech',
  'unicodeRange',
  'weight'
]

export const SLUG_NON_PARTS: SlugNonParts[] = [
  'source',
  'display',
  'format',
  'testString',
  'resourceHint'
]

export const LOADER_DECLARATION = `export interface WebFont {
  family: string
  slug: string
  stretch?: number | number[] | undefined
  style?: number | number[] | 'normal' | 'italic' | 'oblique' | undefined
  tech?: Array<'variations'>
  testString?: string | undefined
  weight?: number | number[] | undefined
}

export type WebFontLoaderSubscribe = (cb: (webFonts: WebFont[]) => void) => void

export type WebFontLoader = (locale: string) => WebFont[]

export declare const webFontLoaderSubscribe: WebFontLoaderSubscribe
export declare const webFontLoader: WebFontLoader

declare global {
  interface Window {
    webFontLoaderSubscribe: WebFontLoaderSubscribe
    webFontLoader: WebFontLoader
  }
}
`
