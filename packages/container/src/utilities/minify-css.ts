import { transform } from 'lightningcss'
import { LightningCSSTargets } from '../types'

export const minifyCss = (value: string, targets: LightningCSSTargets) => {
  const { code } = transform({
    targets,
    filename: 'style.css',
    code: Buffer.from(value),
    minify: true
  })

  return code.toString('utf8')
}
