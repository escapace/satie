/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import FontFaceObserver from 'fontfaceobserver'
import type { WebFont as Font } from '../state/user-schema'

interface WebFont extends Font {
  state?: Promise<boolean>
}

declare const __DATA_LOCALES__: Array<readonly [string, string[]]>
declare const __DATA_FONTS__: WebFont[]

type Callback = (webFonts: Font[]) => unknown

declare global {
  interface Window {
    FontFaceObserver: typeof FontFaceObserver
    webFontLoader: (locale: string) => Promise<Font[]>
    webFontLoaderSubscribe: (cb: Callback) => void
  }
}

const LOCALE_INDEX = new Map(__DATA_LOCALES__)
const FONTS = new Map(
  __DATA_FONTS__.map((value) => [value.slug, value] as const)
)
const SUBSCRIBERS: Callback[] = []

const fontStretchMapping = new Map([
  [50, 'ultra-condensed'],
  [62.5, 'extra-condensed'],
  [75, 'condensed'],
  [87.5, 'semi-condensed'],
  [100, 'normal'],
  [112.5, 'semi-expanded'],
  [125, 'expanded'],
  [150, 'extra-expande'],
  [200, 'ultra-expanded']
])

const fontStretchMappingKeys = Array.from(fontStretchMapping.keys())

const closest = (array: number[], value: number): number =>
  array.reduce(function (prev, curr) {
    return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  })

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

  if (font === undefined || font.fontFace === undefined) {
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
        await Promise.any(
          font.fontFace!.map(async (fontFace) => {
            const weight =
              fontFace.fontWeight === undefined
                ? undefined
                : (Array.isArray(fontFace.fontWeight)
                    ? fontFace.fontWeight[0]
                    : fontFace.fontWeight
                  ).toString()

            const stretch =
              fontFace.fontStretch === undefined
                ? undefined
                : fontStretchMapping.get(
                    closest(
                      fontStretchMappingKeys,
                      Array.isArray(fontFace.fontStretch)
                        ? (fontFace.fontStretch[0] + fontFace.fontStretch[1]) /
                            2
                        : fontFace.fontStretch
                    )
                  )

            const style =
              fontFace.fontStyle === undefined ? undefined : fontFace.fontStyle

            console.log({
              fontFamily: fontFace.fontFamily,
              weight,
              stretch,
              style
            })

            await new FontFaceObserver(fontFace.fontFamily, {
              weight,
              stretch,
              style
            }).load(
              typeof font.testString === 'string' ? font.testString : null,
              // TODO: custom timeout
              10000
            )
          })
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

const next = async (slug: string): Promise<boolean> => {
  const font = FONTS.get(slug)!

  for (const preference of font.prefer ?? []) {
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
