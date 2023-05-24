/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { FontFaceAdjustments } from '../types'
import type { FontMetrics } from './font-metrics'
import { BigNumber } from 'bignumber.js'

export const round = (value: number, precision = 4) =>
  Number.isFinite(precision)
    ? parseFloat(new BigNumber(value).toPrecision(precision))
    : value

export type RequiredFontMetrics = Required<
  Pick<
    FontMetrics,
    'ascent' | 'descent' | 'lineGap' | 'unitsPerEm' | 'xWidthAvg'
  >
>

export const fontAdjust = (
  metrics: RequiredFontMetrics,
  fallbackMetrics: RequiredFontMetrics
): FontFaceAdjustments => {
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
  const adjustments = {
    ascentOverride: ascentOverride ? round(ascentOverride * 100) : undefined,
    descentOverride: descentOverride ? round(descentOverride * 100) : undefined,
    lineGapOverride: lineGapOverride ? round(lineGapOverride * 100) : undefined,
    sizeAdjust:
      sizeAdjust && sizeAdjust !== 1 ? round(sizeAdjust * 100) : undefined
  }

  return adjustments
}
