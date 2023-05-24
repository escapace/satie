import { transform } from 'lightningcss'
import { LightningCSSTargets } from '../types'

export const minifyCss = (
  value: string,
  targets: LightningCSSTargets,
  pass = 0
): string => {
  const { code } = transform({
    targets,
    filename: 'style.css',
    code: Buffer.from(value),
    minify: true
  })

  return pass === 0
    ? minifyCss(code.toString('utf8'), targets, 1)
    : code.toString('utf8')
}

// import CleanCSS from 'clean-css'
// export const minifyCss = (value: string, targets: LightningCSSTargets) => {
//   const { code } = transform({
//     targets,
//     filename: 'style.css',
//     code: Buffer.from(new CleanCSS({
//       format: 'beautify',
//       level: {
//         1: {
//           all: true
//         },
//         2: {
//           all: true
//         },
//       }
//     }).minify(value).styles),
//     minify: true
//   })
//
//   return code.toString('utf8')
// }
