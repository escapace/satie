/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import FontFaceObserver from 'fontfaceobserver'
import type { DataFont as Font } from '../types'

interface WebFont extends Font {
  state?: Promise<boolean>
}

declare const __DATA_LOCALE_INDEX__: Array<readonly [string, string[]]>
declare const __DATA_FONTS__: Array<readonly [string, WebFont]>

type Callback = (webFonts: Font[]) => unknown

declare global {
  interface Window {
    FontFaceObserver: typeof FontFaceObserver
    webFontLoader: (locale: string) => Promise<Font[]>
    webFontLoaderSubscribe: (cb: Callback) => void
  }
}

const LOCALE_INDEX = new Map(__DATA_LOCALE_INDEX__)
const FONTS = new Map(__DATA_FONTS__)
const SUBSCRIBERS: Callback[] = []

const getDataFontsLoaded = () =>
  (document.documentElement.getAttribute('data-fonts-loaded')?.split(' ') ?? [])
    .filter((value) => FONTS.has(value))
    .sort()

const updateDataFontsLoaded = (value: string) => {
  const dataFontsLoaded = getDataFontsLoaded()

  if (!dataFontsLoaded.includes(value)) {
    document.documentElement.setAttribute(
      'data-fonts-loaded',
      [...dataFontsLoaded, value]
        .filter((value, index, self) => self.indexOf(value) === index)
        .sort()
        .join(' ')
    )
  }
}

const createPromise = async (slug: string): Promise<boolean> => {
  const font = FONTS.get(slug)

  if (font === undefined) {
    return false
  }

  if (font.state !== undefined) {
    return await font.state
  }

  font.state = (async () => {
    if (getDataFontsLoaded().includes(slug)) {
      updateDataFontsLoaded(slug)

      return true
    } else if (
      font.tech?.includes('variations') === true &&
      !CSS.supports('(font-variation-settings: normal)')
    ) {
      return false
    } else {
      try {
        const weight =
          font.weight === undefined
            ? undefined
            : (Array.isArray(font.weight)
                ? font.weight[0]
                : font.weight
              ).toString()

        const stretch =
          font.stretch === undefined
            ? undefined
            : `${Array.isArray(font.stretch) ? font.stretch[0] : font.stretch}%`

        const style =
          font.style === undefined
            ? undefined
            : typeof font.style === 'string'
            ? font.style
            : `oblique ${
                Array.isArray(font.style) ? font.style[0] : font.style
              }deg`

        await new FontFaceObserver(font.family, {
          weight,
          stretch,
          style
        }).load(
          typeof font.testString === 'string' ? font.testString : null,
          10000
        )

        updateDataFontsLoaded(slug)
        return true
      } catch {
        return false
      }
    }
  })()

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  return await font.state!
}

const iterateFonts = async (): Promise<WebFont[]> =>
  (
    await Promise.all(
      Array.from(FONTS.values()).map(async (font) => {
        if (font.state !== undefined && (await font.state)) {
          return font
        }

        return undefined
      })
    )
  ).filter((value): value is WebFont => value !== undefined)

const updateSubscribers = async () => {
  const fonts = await iterateFonts()

  if (fonts.length > 0) {
    SUBSCRIBERS.forEach((cb) => cb(fonts))
  }

  return fonts
}

export const webFontLoaderSubscribe = (cb: Callback) => {
  if (!SUBSCRIBERS.includes(cb)) {
    SUBSCRIBERS.push(cb)

    void iterateFonts().then((fonts) => {
      if (fonts.length !== 0) {
        cb(fonts)
      }
    })
  }
}

// const uniqBy = <T>(arr: T[], prop: keyof T): T[] => {
//   const fn = (item: T) => item[prop]
//
//   return arr.filter(
//     (value, index, array) =>
//       index === array.findIndex((y) => fn(value) === fn(y))
//   )
// }

const next = async (slug: string): Promise<boolean> => {
  const font = FONTS.get(slug)!

  for (const preference of font.prefer) {
    const success = await next(preference)

    if (success) {
      return success
    }
  }

  return await createPromise(slug)
}

export const webFontLoader = async (locale: string): Promise<Font[]> => {
  if (locale === undefined || !LOCALE_INDEX.has(locale)) {
    throw new Error('Font Loader: No locale')
  }

  const slugs = LOCALE_INDEX.get(locale)!

  await Promise.all(slugs.map(async (slug) => await next(slug)))

  return await updateSubscribers()
}

window.FontFaceObserver = FontFaceObserver
window.webFontLoader = webFontLoader
window.webFontLoaderSubscribe = webFontLoaderSubscribe
