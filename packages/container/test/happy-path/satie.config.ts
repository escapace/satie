import {
  InputFont as Font,
  InputLocales,
  Fallback
} from '../../src/state/user-schema'

export const arialRegular: Fallback = {
  id: 'arial-regular',
  names: ['Arial Regular', 'ArialMT', 'Arial'],
  weight: 400,
  italic: false,
  capHeight: 1467,
  ascent: 1854,
  descent: -434,
  lineGap: 67,
  unitsPerEm: 2048,
  xHeight: 1062,
  xWidthAvg: 904
}

export const arialBold: Fallback = {
  id: 'arial-bold',
  names: ['Arial-BoldMT', 'Arial Bold'],
  weight: 700,
  italic: false,
  capHeight: 1466,
  ascent: 1854,
  descent: -434,
  lineGap: 67,
  unitsPerEm: 2048,
  xHeight: 1062,
  xWidthAvg: 977
}

const EN_UNICODE_RANGE =
  'U+20-7E,U+A0-BF,U+2BB,U+2BC,U+2C6,U+2DA,U+2DC,U+303,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
const RU_UNICODE_RANGE = 'U+400-45F,U+490,U+491,U+4B0,U+4B1,U+2116'

// const EN_NOTO_SANS_FAMILY = 'EN Noto Sans'
// const RU_NOTO_SANS_FAMILY = 'RU Noto Sans'

const robotoFlex: Font = {
  name: 'roboto-flex',
  source: './fixtures/roboto-flex.ttf',
  tech: ['variations'],
  unicodeRange: EN_UNICODE_RANGE
}

const EN_NOTO_SANS: Font = {
  name: 'en-noto-sans',
  // family: EN_NOTO_SANS_FAMILY,
  source: './fixtures/NotoSans-Regular.ttf',
  resourceHint: 'preload',
  unicodeRange: EN_UNICODE_RANGE,
  prefer: [robotoFlex]
}

const EN_NOTO_SANS_ITALIC: Font = {
  // family: EN_NOTO_SANS_FAMILY,
  source: './fixtures/NotoSans-Italic.ttf',
  unicodeRange: EN_UNICODE_RANGE,
  prefer: [robotoFlex]
}

const EN_NOTO_SANS_BOLD: Font = {
  // family: EN_NOTO_SANS_FAMILY,
  source: './fixtures/NotoSans-Bold.ttf',
  unicodeRange: EN_UNICODE_RANGE,
  prefer: [robotoFlex]
}

const EN_NOTO_SANS_BOLD_ITALIC: Font = {
  // family: EN_NOTO_SANS_FAMILY,
  source: './fixtures/NotoSans-BoldItalic.ttf',
  unicodeRange: EN_UNICODE_RANGE,
  prefer: [robotoFlex]
}

const RU_NOTO_SANS: Font = {
  // family: RU_NOTO_SANS_FAMILY,
  resourceHint: 'preload',
  source: './fixtures/NotoSans-Italic.ttf',
  unicodeRange: RU_UNICODE_RANGE,
  testString: '‎Русскийязык'
}

const RU_NOTO_SANS_ITALIC: Font = {
  // family: RU_NOTO_SANS_FAMILY,
  source: './fixtures/NotoSans-Italic.ttf',
  unicodeRange: RU_UNICODE_RANGE,
  testString: '‎Русскийязык'
}

const RU_NOTO_SANS_BOLD: Font = {
  // family: RU_NOTO_SANS_FAMILY,
  source: './fixtures/NotoSans-Bold.ttf',
  unicodeRange: RU_UNICODE_RANGE,
  testString: '‎Русскийязык'
}

const RU_NOTO_SANS_BOLD_ITALIC: Font = {
  // family: RU_NOTO_SANS_FAMILY,
  source: './fixtures/NotoSans-BoldItalic.ttf',
  unicodeRange: RU_UNICODE_RANGE,
  testString: '‎Русскийязык'
}

// TODO: multiple languages
const locales: InputLocales = {
  en: {
    'sans-serif': {
      fontFamily: [EN_NOTO_SANS, arialRegular],
      '@media': {
        '(min-width: 900px)': {
          '@supports': {
            '(font-variation-settings: "wdth" 115)': {
              fontStretch: 50,
              fontWeight: 900
            }
          }
        }
      }
    },
    'sans-serif-italic': {
      fontFamily: [EN_NOTO_SANS_ITALIC, arialRegular],
      fontStyle: 'italic'
    },
    'sans-serif-bold': {
      fontFamily: [EN_NOTO_SANS_BOLD, arialBold],
      fontWeight: 700
    },
    'sans-serif-bold-italic': {
      fontFamily: [EN_NOTO_SANS_BOLD_ITALIC, arialBold],
      fontStyle: 'italic',
      fontWeight: 700
    }
  },
  ru: {
    'sans-serif': {
      fontFamily: [RU_NOTO_SANS, EN_NOTO_SANS, arialRegular]
    },
    'sans-serif-italic': {
      fontFamily: [RU_NOTO_SANS_ITALIC, EN_NOTO_SANS_ITALIC, arialRegular],
      fontStyle: 'italic'
    },
    'sans-serif-bold': {
      fontFamily: [RU_NOTO_SANS_BOLD, EN_NOTO_SANS_BOLD, arialBold],
      fontWeight: 700
    },
    'sans-serif-bold-italic': {
      fontFamily: [
        RU_NOTO_SANS_BOLD_ITALIC,
        EN_NOTO_SANS_BOLD_ITALIC,
        arialBold
      ],
      fontStyle: 'italic',
      fontWeight: 700
    }
  }
}

export default locales
