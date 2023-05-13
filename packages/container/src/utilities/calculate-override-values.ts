/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { AtRule } from 'csstype'
import { FontMetrics } from '../types'

export const round = (value: number) => parseFloat(value.toFixed(4))
const toPercentString = (value: number) => `${round(value * 100)}%`

type FontStackMetrics = Pick<
  FontMetrics,
  'ascent' | 'descent' | 'lineGap' | 'unitsPerEm' | 'xWidthAvg'
>

interface OverrideValuesParams {
  metrics: FontStackMetrics
  fallbackMetrics: FontStackMetrics
}

export const calculateOverrideValues = ({
  metrics,
  fallbackMetrics
}: OverrideValuesParams): AtRule.FontFace => {
  // Calculate size adjust
  const preferredFontXAvgRatio = metrics.xWidthAvg / metrics.unitsPerEm
  const fallbackFontXAvgRatio =
    fallbackMetrics.xWidthAvg / fallbackMetrics.unitsPerEm

  const sizeAdjust =
    preferredFontXAvgRatio && fallbackFontXAvgRatio
      ? preferredFontXAvgRatio / fallbackFontXAvgRatio
      : 1

  const adjustedEmSquare = metrics.unitsPerEm * sizeAdjust

  // Calculate metric overrides for preferred font
  const ascentOverride = metrics.ascent / adjustedEmSquare
  const descentOverride = Math.abs(metrics.descent) / adjustedEmSquare
  const lineGapOverride = metrics.lineGap / adjustedEmSquare

  // Conditionally populate font face properties and format to percent
  const fontFace: AtRule.FontFace = {}

  if (ascentOverride) {
    fontFace.ascentOverride = toPercentString(ascentOverride)
  }
  if (descentOverride) {
    fontFace.descentOverride = toPercentString(descentOverride)
  }
  if (lineGapOverride) {
    fontFace.lineGapOverride = toPercentString(lineGapOverride)
  }
  if (sizeAdjust && sizeAdjust !== 1) {
    fontFace.sizeAdjust = toPercentString(sizeAdjust)
  }

  return fontFace
}
