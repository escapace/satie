import { type Targets, transform } from 'lightningcss'

// export const minifyCss = (value: string, targets: Targets) => {
//   const { code } = transform({
//     targets,
//     filename: 'style.css',
//     code: Buffer.from(value),
//     minify: true
//   })
//
//   return code.toString('utf8')
// }

// export const minifyCss = (
//   value: string,
//   targets: LightningCSSTargets,
//   pass = 0
// ): string => {
//   const { code } = transform({
//     targets,
//     filename: 'style.css',
//     code: Buffer.from(value),
//     minify: true
//   })
//
//   return pass === 0
//     ? minifyCss(code.toString('utf8'), targets, 1)
//     : code.toString('utf8')
// }

import CleanCSS from 'clean-css'
export const minifyCss = (value: string, targets: Targets) => {
  const { code } = transform({
    code: Buffer.from(
      new CleanCSS({
        level: {
          1: {
            all: true,
            cleanupCharsets: false, // controls `@charset` moving to the front of a stylesheet; defaults to `true`
            normalizeUrls: false, // controls URL normalization; defaults to `true`
            optimizeBackground: false, // controls `background` property optimizations; defaults to `true`
            optimizeBorderRadius: false, // controls `border-radius` property optimizations; defaults to `true`
            optimizeFilter: false, // controls `filter` property optimizations; defaults to `true`
            optimizeFont: false, // controls `font` property optimizations; defaults to `true`
            optimizeFontWeight: false, // controls `font-weight` property optimizations; defaults to `true`
            optimizeOutline: false, // controls `outline` property optimizations; defaults to `true`
            removeNegativePaddings: false, // controls removing negative paddings; defaults to `true`
            replaceMultipleZeros: false, // contols removing redundant zeros; defaults to `true`
            replaceTimeUnits: false, // controls replacing time units with shorter values; defaults to `true`
            replaceZeroUnits: false, // controls replacing zero values with units; defaults to `true`
            roundingPrecision: false, // rounds pixel values to `N` decimal places; `false` disables rounding; defaults to `false`
            tidyAtRules: false // controls at-rules (e.g. `@charset`, `@import`) optimizing; defaults to `true`
          },
          2: {
            all: true,
            mergeIntoShorthands: false, // controls merging properties into shorthands; defaults to true
            mergeSemantically: false, // controls semantic merging; defaults to false
            overrideProperties: false, // controls property overriding based on understandability; defaults to true
            removeDuplicateFontRules: false, // controls duplicate `@font-face` removing; defaults to true
            // removeDuplicateMediaBlocks: true, // controls duplicate `@media` removing; defaults to true
            // removeDuplicateRules: true, // controls duplicate rules removing; defaults to true
            removeUnusedAtRules: false // controls unused at rule removing; defaults to false (available since 4.1.0)
          }
        }
      }).minify(value).styles
    ),
    filename: 'style.css',
    minify: true,
    targets
  })

  return code.toString()
}
