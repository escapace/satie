/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { Font as FontKitFont } from 'fontkit'
import { omit } from 'lodash-es'

export const enum TypeFontIssue {
  Error,
  Warning
}

export interface FontIssue {
  type: TypeFontIssue
  description: string
}

export interface FontMetrics {
  familyName: string
  fullName: string
  postscriptName: string
  subfamilyName: string

  /** The height of the ascenders above baseline */
  ascent: number
  /** The descent of the descenders below baseline */
  descent: number
  /** The amount of space included between lines */
  lineGap: number
  /** The size of the font’s internal coordinate grid */
  unitsPerEm: number
  /** The height of capital letters above the baseline */
  capHeight: number
  /** The height of the main body of lower case letters above baseline */
  xHeight: number
  /** The average width of lowercase characters (currently derived from latin character frequencies in English language) */
  xWidthAvg: number
  issues?: FontIssue[]
}

// Ref: https://en.wikipedia.org/wiki/Letter_frequency#Relative_frequencies_of_letters_in_other_languages
const WEIGHTINGS = {
  a: 0.0668,
  b: 0.0122,
  c: 0.0228,
  d: 0.0348,
  e: 0.1039,
  f: 0.0182,
  g: 0.0165,
  h: 0.0499,
  i: 0.057,
  j: 0.0013,
  k: 0.0063,
  l: 0.0329,
  m: 0.0197,
  n: 0.0552,
  o: 0.0614,
  p: 0.0158,
  q: 0.0008,
  r: 0.049,
  s: 0.0518,
  t: 0.0741,
  u: 0.0226,
  v: 0.008,
  w: 0.0193,
  x: 0.0012,
  y: 0.0162,
  z: 0.0006,
  ' ': 0.1818
}
const sampleString = Object.keys(WEIGHTINGS).join('')

const weightingForCharacter = (character: string) => {
  if (!Object.keys(WEIGHTINGS).includes(character)) {
    throw new Error(`No weighting specified for character: “${character}”`)
  }

  return WEIGHTINGS[character as keyof typeof WEIGHTINGS]
}

interface FontIssueWithTest extends FontIssue {
  test: (fontMetrics: FontMetrics) => boolean
}

const issueReducer = (metrics: FontMetrics): FontIssue[] => {
  const issues: FontIssueWithTest[] = [
    {
      type: TypeFontIssue.Error,
      description: 'capHeight is missing.',
      test: (font) => !('capHeight' in font) || !font.capHeight
    },
    {
      type: TypeFontIssue.Error,
      description: 'xHeight is missing.',
      test: (font) => !('xHeight' in font) || !font.xHeight
    },
    {
      type: TypeFontIssue.Error,
      description: 'capHeight is less than xHeight.',
      test: (font) => {
        if (
          'capHeight' in font &&
          font.capHeight &&
          'xHeight' in font &&
          font.xHeight
        ) {
          return font.capHeight < font.xHeight
        }
        return false
      }
    },
    {
      type: TypeFontIssue.Error,
      description: 'capHeight is less than half ascent.',
      test: (font) => {
        if (
          'capHeight' in font &&
          font.capHeight &&
          'ascent' in font &&
          font.ascent
        ) {
          return font.capHeight < font.ascent / 2
        }
        return false
      }
    }
  ]

  return issues
    .filter(({ test }) => test(metrics))
    .map((value) => omit(value, ['test']))
}

export const fontMetrics = (font: FontKitFont): FontMetrics => {
  const issues: FontIssue[] = []

  const {
    ascent,
    descent,
    lineGap,
    unitsPerEm,
    postscriptName,
    fullName,
    familyName,
    subfamilyName
  } = font

  let { capHeight, xHeight } = font

  if (typeof xHeight === 'undefined') {
    const glyph = font.glyphForCodePoint(120)

    xHeight = glyph.bbox.maxY - glyph.bbox.minY

    issues.push({
      type: TypeFontIssue.Warning,
      description: `xHeight is missing, relying on 'x' character height.`
    })
  }

  if (typeof capHeight === 'undefined') {
    const glyph = font.glyphForCodePoint(72)

    capHeight = glyph.bbox.maxY - glyph.bbox.minY

    issues.push({
      type: TypeFontIssue.Warning,
      description: `capHeight is missing, relying on 'H' character height.`
    })
  }

  const glyphs = font.glyphsForString(sampleString)

  // TODO: alternatively https://github.com/vercel/next.js/blob/canary/packages/font/src/local/get-fallback-metrics-from-font-file.ts
  const weightedWidth = glyphs.reduce((sum, glyph, index) => {
    const character = sampleString.charAt(index)

    let charWidth = font['OS/2'].xAvgCharWidth

    try {
      charWidth = glyph.advanceWidth
    } catch (e) {
      issues.push({
        type: TypeFontIssue.Warning,
        description: `advanceWidth is not available for character '${
          character === ' ' ? '<space>' : character
        }', relying on xAvgCharWidth instead.`
      })
    }

    return sum + charWidth * weightingForCharacter(character)
  }, 0)

  const metrics = {
    familyName,
    postscriptName,
    fullName,
    subfamilyName,
    capHeight,
    ascent,
    descent,
    lineGap,
    unitsPerEm,
    xHeight,
    xWidthAvg: Math.round(weightedWidth)
  }

  issues.push(...issueReducer(metrics))

  return { ...metrics, issues }
}
