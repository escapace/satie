import { TypeFont, TypeLocales } from '../../src/types'

const EN_UNICODE_RANGE =
  'U+20-7E,U+A0-BF,U+2BB,U+2BC,U+2C6,U+2DA,U+2DC,U+303,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
const RU_UNICODE_RANGE = 'U+400-45F,U+490,U+491,U+4B0,U+4B1,U+2116'

const EN_NOTO_SANS_FAMILY = 'EN Noto Sans'
const RU_NOTO_SANS_FAMILY = 'RU Noto Sans'

const EN_NOTO_SANS: TypeFont = {
  family: EN_NOTO_SANS_FAMILY,
  source: './fixtures/NotoSans-Regular.ttf',
  resourceHint: 'preload',
  unicodeRange: EN_UNICODE_RANGE
}

const EN_NOTO_SANS_ITALIC: TypeFont = {
  family: EN_NOTO_SANS_FAMILY,
  style: 'italic',
  source: './fixtures/NotoSans-Italic.ttf',
  unicodeRange: EN_UNICODE_RANGE
}

const EN_NOTO_SANS_BOLD: TypeFont = {
  family: EN_NOTO_SANS_FAMILY,
  weight: 700,
  source: './fixtures/NotoSans-Bold.ttf',
  unicodeRange: EN_UNICODE_RANGE
}

const EN_NOTO_SANS_BOLD_ITALIC: TypeFont = {
  family: EN_NOTO_SANS_FAMILY,
  weight: 700,
  style: 'italic',
  source: './fixtures/NotoSans-BoldItalic.ttf',
  unicodeRange: EN_UNICODE_RANGE
}

const RU_NOTO_SANS: TypeFont = {
  family: RU_NOTO_SANS_FAMILY,
  resourceHint: 'preload',
  source: './fixtures/NotoSans-Italic.ttf',
  unicodeRange: RU_UNICODE_RANGE,
  testString: '‎Русскийязык'
}

const RU_NOTO_SANS_ITALIC: TypeFont = {
  family: RU_NOTO_SANS_FAMILY,
  style: 'italic',
  source: './fixtures/NotoSans-Italic.ttf',
  unicodeRange: RU_UNICODE_RANGE,
  testString: '‎Русскийязык'
}

const RU_NOTO_SANS_BOLD: TypeFont = {
  family: RU_NOTO_SANS_FAMILY,
  weight: 700,
  source: './fixtures/NotoSans-Bold.ttf',
  unicodeRange: RU_UNICODE_RANGE,
  testString: '‎Русскийязык'
}

const RU_NOTO_SANS_BOLD_ITALIC: TypeFont = {
  family: RU_NOTO_SANS_FAMILY,
  weight: 700,
  style: 'italic',
  source: './fixtures/NotoSans-BoldItalic.ttf',
  unicodeRange: RU_UNICODE_RANGE,
  testString: '‎Русскийязык'
}

const EN_FALLBACK = ['-apple-system', 'BlinkMacSystemFont', 'segoe ui', 'helvetica neue', 'helvetica', 'Cantarell', 'Ubuntu', 'roboto', 'arial']
const RU_FALLBACK = EN_FALLBACK

const locales: TypeLocales = {
  en: {
    'sans-serif': {
      fontFamily: [EN_NOTO_SANS, ...EN_FALLBACK]
    },
    'sans-serif-italic': {
      fontFamily: [EN_NOTO_SANS_ITALIC, ...EN_FALLBACK]
    },
    'sans-serif-bold': {
      fontFamily: [EN_NOTO_SANS_BOLD, ...EN_FALLBACK]
    },
    'sans-serif-bold-italic': {
      fontFamily: [EN_NOTO_SANS_BOLD_ITALIC, ...EN_FALLBACK]
    }
  },
  ru: {
    'sans-serif': {
      fontFamily: [RU_NOTO_SANS, EN_NOTO_SANS, ...RU_FALLBACK]
    },
    'sans-serif-italic': {
      fontFamily: [RU_NOTO_SANS_ITALIC, EN_NOTO_SANS_ITALIC, ...RU_FALLBACK]
    },
    'sans-serif-bold': {
      fontFamily: [RU_NOTO_SANS_BOLD, EN_NOTO_SANS_BOLD, ...RU_FALLBACK]
    },
    'sans-serif-bold-italic': {
      fontFamily: [
        RU_NOTO_SANS_BOLD_ITALIC,
        EN_NOTO_SANS_BOLD_ITALIC,
        ...RU_FALLBACK
      ]
    }
  }
}

export default locales
